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
  const { data, error } = await supabase
    .from('events')
    .insert([eventData])
    .select()

  if (error) throw error
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
