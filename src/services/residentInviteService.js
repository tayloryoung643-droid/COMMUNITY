import { supabase } from '../lib/supabase'

/**
 * Get all invites sent by residents in a building
 */
export async function getInvitesForBuilding(buildingId) {
  try {
    const { data, error } = await supabase
      .from('resident_invites_v2')
      .select('*')
      .eq('building_id', buildingId)
      .order('created_at', { ascending: false })

    if (error) {
      // Table may not exist yet — fail silently
      console.warn('[residentInviteService] Error fetching invites:', error.message)
      return []
    }
    return data || []
  } catch (err) {
    console.warn('[residentInviteService] Invites table not available:', err.message)
    return []
  }
}

/**
 * Send a resident invite (insert into DB + send email)
 */
export async function sendResidentInvite({ buildingId, invitedBy, inviteeName, inviteeEmail, unitNumber, buildingName }) {
  // Try to save to DB (table may not exist yet)
  try {
    await supabase
      .from('resident_invites_v2')
      .insert({
        building_id: buildingId,
        invited_by: invitedBy,
        invitee_name: inviteeName,
        invitee_email: inviteeEmail,
        unit_number: unitNumber || null,
        status: 'pending',
      })
  } catch (dbErr) {
    console.warn('[residentInviteService] DB insert failed (continuing with email):', dbErr.message)
  }

  // Send email via API — use field names the API expects
  const joinUrl = `${window.location.origin}/join/${buildingId}`

  try {
    await fetch('/api/send-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: inviteeEmail,
        fullName: inviteeName,
        buildingName: buildingName || 'your building',
        joinUrl,
      }),
    })
  } catch (emailErr) {
    console.warn('[residentInviteService] Email send failed:', emailErr.message)
  }
}

/**
 * Get invite stats for a building
 */
export async function getInviteStats(buildingId) {
  try {
    const { data, error } = await supabase
      .from('resident_invites_v2')
      .select('status')
      .eq('building_id', buildingId)

    if (error) return { total: 0, pending: 0, joined: 0 }

    const total = data.length
    const joined = data.filter(i => i.status === 'joined').length
    const pending = total - joined

    return { total, pending, joined }
  } catch {
    return { total: 0, pending: 0, joined: 0 }
  }
}
