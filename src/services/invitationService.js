import { supabase } from '../lib/supabase'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'
import { sendMessage } from './aiService'

// ============================================
// AI PARSING
// ============================================

const PARSE_SYSTEM_PROMPT = `You are a data parser. Extract resident information from the text below. Return ONLY a valid JSON array. Each object should have: name (string, required), email (string or null), unit (string or null), phone (string or null). Handle any format: CSV rows, free-form text, spreadsheet paste, email lists, etc. If you can only find email addresses with no names, use the part before @ as the name. Always return valid JSON with no markdown formatting.`

/**
 * Use AI to parse unstructured resident data into structured JSON
 */
export async function parseWithAI(rawText) {
  const result = await sendMessage(
    [{ role: 'user', content: rawText }],
    PARSE_SYSTEM_PROMPT
  )

  if (!result.success) {
    throw new Error(result.error || 'AI parsing failed')
  }

  // Try to extract JSON from the response
  let parsed
  try {
    // Try direct parse first
    parsed = JSON.parse(result.message)
  } catch {
    // Try to find JSON array in the response
    const jsonMatch = result.message.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      parsed = JSON.parse(jsonMatch[0])
    } else {
      throw new Error("Couldn't parse that data. Try reformatting or paste in a simpler format.")
    }
  }

  if (!Array.isArray(parsed)) {
    throw new Error("Couldn't parse that data. Try reformatting or paste in a simpler format.")
  }

  return parsed.map((item, i) => ({
    id: i + 1,
    name: item.name || '',
    email: item.email || '',
    unit: item.unit || '',
    phone: item.phone || '',
    selected: true,
    hasEmail: !!item.email
  }))
}

// ============================================
// FILE PARSING
// ============================================

// Common header name mappings
const HEADER_MAP = {
  name: ['name', 'full_name', 'fullname', 'resident', 'resident_name', 'tenant', 'occupant'],
  first: ['first', 'first_name', 'firstname', 'fname', 'first name'],
  last: ['last', 'last_name', 'lastname', 'lname', 'last name', 'surname'],
  email: ['email', 'e-mail', 'mail', 'email_address', 'emailaddress', 'email address'],
  unit: ['unit', 'unit_number', 'apt', 'apartment', 'suite', 'room', 'unit number', 'apt number', 'apartment number'],
  phone: ['phone', 'tel', 'telephone', 'mobile', 'cell', 'phone_number', 'phone number', 'mobile number']
}

function mapHeaders(headers) {
  const mapping = {}
  const normalizedHeaders = headers.map(h => (h || '').toString().toLowerCase().trim())

  for (const [field, aliases] of Object.entries(HEADER_MAP)) {
    const idx = normalizedHeaders.findIndex(h => aliases.includes(h))
    if (idx !== -1) mapping[field] = idx
  }

  return mapping
}

function rowsToResidents(rows, mapping) {
  return rows
    .filter(row => row.some(cell => cell && cell.toString().trim()))
    .map((row, i) => {
      let name = ''
      if (mapping.name !== undefined) {
        name = (row[mapping.name] || '').toString().trim()
      } else if (mapping.first !== undefined) {
        const first = (row[mapping.first] || '').toString().trim()
        const last = mapping.last !== undefined ? (row[mapping.last] || '').toString().trim() : ''
        name = `${first} ${last}`.trim()
      }

      return {
        id: i + 1,
        name,
        email: mapping.email !== undefined ? (row[mapping.email] || '').toString().trim() : '',
        unit: mapping.unit !== undefined ? (row[mapping.unit] || '').toString().trim() : '',
        phone: mapping.phone !== undefined ? (row[mapping.phone] || '').toString().trim() : '',
        selected: true,
        hasEmail: !!(mapping.email !== undefined && row[mapping.email] && row[mapping.email].toString().trim())
      }
    })
    .filter(r => r.name || r.email || r.unit)
}

/**
 * Parse CSV file using papaparse
 */
export function parseCSVFile(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      complete: (results) => {
        if (!results.data || results.data.length === 0) {
          reject(new Error('No data found in CSV file.'))
          return
        }

        const headers = results.data[0]
        const mapping = mapHeaders(headers)

        // Check if we found enough headers
        const foundFields = Object.keys(mapping).length
        if (foundFields >= 2) {
          // Good header detection - skip first row (header)
          const residents = rowsToResidents(results.data.slice(1), mapping)
          resolve({ residents, needsAI: false })
        } else {
          // Couldn't detect headers well - send to AI
          const rawText = results.data.map(row => row.join(', ')).join('\n')
          resolve({ residents: [], needsAI: true, rawText })
        }
      },
      error: (err) => reject(new Error(`CSV parse error: ${err.message}`))
    })
  })
}

/**
 * Parse Excel file using xlsx
 */
export function parseExcelFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const workbook = XLSX.read(e.target.result, { type: 'array' })
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
        const data = XLSX.utils.sheet_to_json(firstSheet, { header: 1 })

        if (!data || data.length === 0) {
          reject(new Error('No data found in Excel file.'))
          return
        }

        const headers = data[0]
        const mapping = mapHeaders(headers.map(h => (h || '').toString()))

        const foundFields = Object.keys(mapping).length
        if (foundFields >= 2) {
          const residents = rowsToResidents(data.slice(1), mapping)
          resolve({ residents, needsAI: false })
        } else {
          const rawText = data.map(row => (row || []).join(', ')).join('\n')
          resolve({ residents: [], needsAI: true, rawText })
        }
      } catch (err) {
        reject(new Error(`Excel parse error: ${err.message}`))
      }
    }
    reader.onerror = () => reject(new Error('Failed to read file.'))
    reader.readAsArrayBuffer(file)
  })
}

// ============================================
// DATABASE - INVITATIONS TABLE
// ============================================

/**
 * Save a batch of invitations to the database
 */
export async function saveInvitations(buildingId, invitedBy, residents) {
  const rows = residents.map(r => ({
    building_id: buildingId,
    invited_by: invitedBy,
    name: r.name || '',
    email: r.email || null,
    unit: r.unit || null,
    phone: r.phone || null,
    status: 'pending'
  }))

  const { data, error } = await supabase
    .from('invitations')
    .insert(rows)
    .select()

  if (error) {
    console.error('[invitationService] Save error:', error)
    throw new Error('Failed to save invitations.')
  }

  return data
}

/**
 * Get all invitations for a building
 */
export async function getInvitations(buildingId) {
  const { data, error } = await supabase
    .from('invitations')
    .select('*')
    .eq('building_id', buildingId)
    .order('invited_at', { ascending: false })

  if (error) {
    console.error('[invitationService] Fetch error:', error)
    return []
  }

  return data || []
}

/**
 * Update invitation status
 */
export async function updateInvitationStatus(invitationId, status) {
  const updates = { status }
  if (status === 'joined') updates.joined_at = new Date().toISOString()

  const { error } = await supabase
    .from('invitations')
    .update(updates)
    .eq('id', invitationId)

  if (error) {
    console.error('[invitationService] Update error:', error)
    throw error
  }
}

/**
 * Send a single invite email via the API
 * Returns { success, messageId } or { success: false, error }
 */
export async function sendInviteEmail(email, fullName, buildingName) {
  const token = crypto.randomUUID()

  try {
    const response = await fetch('/api/send-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, fullName, token, buildingName, invite_type: 'manager' })
    })

    const result = await response.json()

    if (!response.ok) {
      return { success: false, error: result.error || 'Failed to send email' }
    }

    return { success: true, messageId: result.messageId, token }
  } catch (err) {
    console.error('[invitationService] Email error:', err)
    return { success: false, error: 'Network error sending email' }
  }
}

/**
 * Process a full batch: save to DB, send emails, update statuses
 * Calls onProgress(sent, total) as each email sends
 * Includes rate-limit delay (600ms between sends) to avoid Resend throttling
 */
export async function processInviteBatch(buildingId, invitedBy, residents, buildingName, onProgress) {
  // 1. Save all to database
  const saved = await saveInvitations(buildingId, invitedBy, residents)

  // 2. Send emails to those with email addresses
  const withEmail = saved.filter(inv => inv.email)
  const withoutEmail = saved.filter(inv => !inv.email)
  let sentCount = 0
  let failedCount = 0

  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms))

  for (let i = 0; i < withEmail.length; i++) {
    const inv = withEmail[i]

    // Rate-limit: wait 600ms between sends to stay under Resend's 2/sec limit
    if (i > 0) await delay(600)

    let result = await sendInviteEmail(inv.email, inv.name, buildingName)

    // Retry once on failure (rate-limit or transient error)
    if (!result.success) {
      await delay(1500)
      result = await sendInviteEmail(inv.email, inv.name, buildingName)
    }

    if (result.success) {
      // Save token and mark as sent so the invite link works
      await supabase
        .from('invitations')
        .update({ status: 'sent', token: result.token })
        .eq('id', inv.id)
      sentCount++
    } else {
      await updateInvitationStatus(inv.id, 'failed')
      failedCount++
    }

    if (onProgress) onProgress(i + 1, withEmail.length)
  }

  return {
    totalSaved: saved.length,
    emailsSent: sentCount,
    emailsFailed: failedCount,
    savedWithoutEmail: withoutEmail.length
  }
}

// ============================================
// ROSTER & SINGLE INVITE
// ============================================

/**
 * Batch insert residents to roster with status 'not_invited'
 */
export async function addToRoster(buildingId, invitedBy, residents) {
  const rows = residents.map(r => ({
    building_id: buildingId,
    invited_by: invitedBy,
    name: r.name || '',
    email: r.email || null,
    unit: r.unit || null,
    phone: r.phone || null,
    status: 'not_invited'
  }))

  const { data, error } = await supabase
    .from('invitations')
    .insert(rows)
    .select()

  if (error) {
    console.error('[invitationService] addToRoster error:', error)
    throw new Error('Failed to add residents to roster.')
  }

  return data
}

/**
 * Add a single resident to the roster with status 'not_invited'
 */
export async function addSingleResident(buildingId, invitedBy, resident) {
  const row = {
    building_id: buildingId,
    invited_by: invitedBy,
    name: resident.name || '',
    email: resident.email || null,
    unit: resident.unit || null,
    phone: resident.phone || null,
    status: 'not_invited'
  }

  // Only include move_in_date if provided (column may not exist before migration)
  if (resident.moveInDate) {
    row.move_in_date = resident.moveInDate
  }

  const { data, error } = await supabase
    .from('invitations')
    .insert([row])
    .select()
    .single()

  if (error) {
    console.error('[invitationService] addSingleResident error:', error)
    throw new Error('Failed to add resident.')
  }

  return data
}

/**
 * Send a single invite email and update the invitation status
 */
export async function sendSingleInvite(invitationId, email, fullName, buildingName) {
  const result = await sendInviteEmail(email, fullName, buildingName)

  if (result.success) {
    // Save token and mark as sent so the invite link works
    await supabase
      .from('invitations')
      .update({ status: 'sent', token: result.token })
      .eq('id', invitationId)
    return { success: true }
  } else {
    await updateInvitationStatus(invitationId, 'failed')
    return { success: false, error: result.error }
  }
}

/**
 * Get invitation stats for a building
 * Returns { total, sent, failed, notInvited }
 */
export async function getInvitationStats(buildingId) {
  const { data, error } = await supabase
    .from('invitations')
    .select('status')
    .eq('building_id', buildingId)

  if (error) {
    console.error('[invitationService] getInvitationStats error:', error)
    return { total: 0, sent: 0, failed: 0, notInvited: 0 }
  }

  const rows = data || []
  return {
    total: rows.length,
    sent: rows.filter(r => r.status === 'sent').length,
    failed: rows.filter(r => r.status === 'failed').length,
    notInvited: rows.filter(r => r.status === 'not_invited').length
  }
}

/**
 * Delete an invitation by ID
 */
export async function deleteInvitation(invitationId) {
  const { error } = await supabase
    .from('invitations')
    .delete()
    .eq('id', invitationId)

  if (error) {
    console.error('[invitationService] deleteInvitation error:', error)
    throw new Error('Failed to remove invitation.')
  }
}

/**
 * Update an invitation's fields (e.g. email, name)
 */
export async function updateInvitation(invitationId, fields) {
  const { error } = await supabase
    .from('invitations')
    .update(fields)
    .eq('id', invitationId)

  if (error) {
    console.error('[invitationService] updateInvitation error:', error)
    throw error
  }
}

// ============================================
// CHECKLIST HELPERS
// ============================================

/**
 * Check if a building has FAQ entries
 */
export async function hasFAQEntries(buildingId) {
  const { count, error } = await supabase
    .from('faq_items')
    .select('id', { count: 'exact', head: true })
    .eq('building_id', buildingId)

  if (error) {
    // Table might not exist yet, that's ok
    return false
  }

  return (count || 0) > 0
}

/**
 * Check if a building has any invitations
 */
export async function hasInvitations(buildingId) {
  const { count, error } = await supabase
    .from('invitations')
    .select('id', { count: 'exact', head: true })
    .eq('building_id', buildingId)

  if (error) return false
  return (count || 0) > 0
}
