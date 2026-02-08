import { supabase } from '../lib/supabase'

/**
 * Get all invites sent by residents in a building
 */
export async function getInvitesForBuilding(buildingId) {
  const { data, error } = await supabase
    .from('resident_invites_v2')
    .select('*')
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[residentInviteService] Error fetching invites:', error)
    return []
  }
  return data || []
}

/**
 * Send a resident invite (insert into DB + send email)
 */
export async function sendResidentInvite({ buildingId, invitedBy, inviteeName, inviteeEmail, unitNumber, buildingName, inviteSlug }) {
  // Insert into database
  const { data, error } = await supabase
    .from('resident_invites_v2')
    .insert({
      building_id: buildingId,
      invited_by: invitedBy,
      invitee_name: inviteeName,
      invitee_email: inviteeEmail,
      unit_number: unitNumber || null,
      status: 'pending',
    })
    .select()
    .single()

  if (error) {
    console.error('[residentInviteService] Error inserting invite:', error)
    throw error
  }

  // Send email via API
  try {
    const joinUrl = inviteSlug
      ? `${window.location.origin}/join/${inviteSlug}`
      : `${window.location.origin}`

    await fetch('/api/send-invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to: inviteeEmail,
        inviteeName,
        buildingName: buildingName || 'your building',
        joinUrl,
      }),
    })
  } catch (emailErr) {
    console.warn('[residentInviteService] Email send failed (invite still saved):', emailErr)
  }

  return data
}

/**
 * Get invite stats for a building
 */
export async function getInviteStats(buildingId) {
  const { data, error } = await supabase
    .from('resident_invites_v2')
    .select('status')
    .eq('building_id', buildingId)

  if (error) return { total: 0, pending: 0, joined: 0 }

  const total = data.length
  const joined = data.filter(i => i.status === 'joined').length
  const pending = total - joined

  return { total, pending, joined }
}
