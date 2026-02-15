import { supabase } from '../lib/supabase'

/**
 * Get all residents who should receive announcement emails.
 * Queries both signed-up users and invited-but-not-joined residents.
 * Deduplicates by email and excludes the BM.
 */
export async function getAnnouncementEmailRecipients(buildingId, managerId) {
  // 1. Signed-up residents (Variant A)
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('id, email, full_name, notify_announcements')
    .eq('building_id', buildingId)
    .eq('role', 'resident')

  if (usersError) {
    console.error('[announcementEmail] Error fetching users:', usersError)
  }

  const signedUp = (users || [])
    .filter(u => u.email && u.id !== managerId && u.notify_announcements !== false)
    .map(u => ({
      email: u.email.toLowerCase(),
      firstName: u.full_name?.split(' ')[0] || '',
      hasAccount: true
    }))

  // 2. Invited-but-not-joined residents (Variant B)
  const { data: invitations, error: invError } = await supabase
    .from('invitations')
    .select('email, name, status')
    .eq('building_id', buildingId)
    .in('status', ['sent', 'pending', 'not_invited'])

  if (invError) {
    console.error('[announcementEmail] Error fetching invitations:', invError)
  }

  const signedUpEmails = new Set(signedUp.map(u => u.email))

  // Get manager email to exclude
  let managerEmail = null
  if (managerId) {
    const { data: mgr } = await supabase
      .from('users')
      .select('email')
      .eq('id', managerId)
      .single()
    managerEmail = mgr?.email?.toLowerCase() || null
  }

  const invited = (invitations || [])
    .filter(inv => inv.email && !signedUpEmails.has(inv.email.toLowerCase()))
    .filter(inv => inv.email.toLowerCase() !== managerEmail)
    .map(inv => ({
      email: inv.email.toLowerCase(),
      firstName: inv.name?.split(' ')[0] || '',
      hasAccount: false
    }))

  // Deduplicate invited by email
  const seenEmails = new Set(signedUpEmails)
  const dedupedInvited = invited.filter(inv => {
    if (seenEmails.has(inv.email)) return false
    seenEmails.add(inv.email)
    return true
  })

  const recipients = [...signedUp, ...dedupedInvited]

  return {
    recipients,
    signedUpCount: signedUp.length,
    invitedCount: dedupedInvited.length
  }
}

/**
 * Send announcement emails via the API endpoint.
 * Fire-and-forget — errors are logged but don't throw.
 */
export async function sendAnnouncementEmails(recipients, { title, message, category, buildingName, managerName, buildingId }) {
  try {
    const response = await fetch('/api/send-announcement', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        emails: recipients,
        title,
        message,
        category,
        buildingName,
        managerName,
        buildingId
      })
    })

    // Safely parse response — Vite dev server returns HTML on 404/500, not JSON
    let result
    const contentType = response.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      result = await response.json()
    } else {
      const text = await response.text()
      console.error('[announcementEmail] Non-JSON response (API may not be available in local dev):', response.status, text.slice(0, 200))
      return { success: false, error: 'Email API not available — emails are sent when deployed to Vercel' }
    }

    if (!response.ok) {
      console.error('[announcementEmail] API error:', result.error)
      return { success: false, error: result.error }
    }

    console.log('[announcementEmail] Emails sent:', result.sentCount, 'failed:', result.failedCount)
    return { success: true, sentCount: result.sentCount, failedCount: result.failedCount }
  } catch (err) {
    console.error('[announcementEmail] Network error:', err)
    return { success: false, error: 'Network error sending emails' }
  }
}
