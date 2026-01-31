import { supabase } from '../lib/supabase'

export async function getEvents(buildingId) {
  if (!buildingId) {
    console.log('[eventService.getEvents] No buildingId provided, returning empty array')
    return []
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('building_id', buildingId)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('[eventService.getEvents] Supabase error:', error.code, error.message)
    throw error
  }

  console.log('[eventService.getEvents] Success, rows returned:', data?.length || 0)
  return data || []
}

export async function getUpcomingEvents(buildingId) {
  if (!buildingId) {
    return []
  }

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .eq('building_id', buildingId)
    .gte('start_time', new Date().toISOString().split('T')[0])
    .order('start_time', { ascending: true })

  if (error) {
    console.error('[eventService.getUpcomingEvents] Supabase error:', error.code, error.message)
    throw error
  }
  return data || []
}

export async function createEvent(eventData) {
  console.log('[eventService.createEvent] Inserting:', eventData)

  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()

  if (error) {
    console.error('[eventService.createEvent] Error:', error.code, error.message, error.details, error.hint)
    throw error
  }

  console.log('[eventService.createEvent] Success:', data[0])
  return data[0]
}

export async function updateEvent(eventId, eventData) {
  const { data, error } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', eventId)
    .select()

  if (error) throw error
  return data[0]
}

export async function deleteEvent(eventId) {
  const { error } = await supabase
    .from('events')
    .delete()
    .eq('id', eventId)

  if (error) throw error
  return true
}

export async function getRSVPs(eventId) {
  const { data, error } = await supabase
    .from('event_rsvps')
    .select('*, user:users(*)')
    .eq('event_id', eventId)

  if (error) throw error
  return data
}

export async function addRSVP(eventId, userId, status) {
  const { data, error } = await supabase
    .from('event_rsvps')
    .upsert([{ event_id: eventId, user_id: userId, status }], { onConflict: 'event_id,user_id' })
    .select()

  if (error) throw error
  return data[0]
}

export async function removeRSVP(eventId, userId) {
  const { error } = await supabase
    .from('event_rsvps')
    .delete()
    .eq('event_id', eventId)
    .eq('user_id', userId)

  if (error) throw error
  return true
}

/**
 * Get all event IDs that a user has RSVPd to
 * @param {string} userId - User UUID
 * @returns {Promise<Object>} Map of event_id -> status
 */
export async function getUserRSVPs(userId) {
  const { data, error } = await supabase
    .from('event_rsvps')
    .select('event_id, status')
    .eq('user_id', userId)

  if (error) throw error

  // Return as a map of event_id -> status for easy lookup
  const rsvpMap = {}
  ;(data || []).forEach(item => {
    rsvpMap[item.event_id] = item.status
  })
  return rsvpMap
}

/**
 * Get RSVP count for an event
 * @param {string} eventId - Event UUID
 * @returns {Promise<number>} RSVP count (going status)
 */
export async function getEventRSVPCount(eventId) {
  const { count, error } = await supabase
    .from('event_rsvps')
    .select('*', { count: 'exact', head: true })
    .eq('event_id', eventId)
    .eq('status', 'going')

  if (error) throw error
  return count || 0
}
