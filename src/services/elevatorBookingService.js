import { supabase } from '../lib/supabase'

export async function getBookings(buildingId) {
  if (!buildingId) {
    console.log('[elevatorBookingService.getBookings] No buildingId provided, returning empty array')
    return []
  }

  const { data, error } = await supabase
    .from('elevator_bookings')
    .select('*')
    .eq('building_id', buildingId)
    .order('start_time', { ascending: true })

  if (error) {
    console.error('[elevatorBookingService.getBookings] Supabase error:', error.code, error.message)
    throw error
  }

  console.log('[elevatorBookingService.getBookings] Success, rows returned:', data?.length || 0)
  return data || []
}

export async function getUpcomingBookings(buildingId) {
  if (!buildingId) {
    return []
  }

  const { data, error } = await supabase
    .from('elevator_bookings')
    .select('*')
    .eq('building_id', buildingId)
    .gte('start_time', new Date().toISOString().split('T')[0])
    .order('start_time', { ascending: true })

  if (error) {
    console.error('[elevatorBookingService.getUpcomingBookings] Supabase error:', error.code, error.message)
    throw error
  }
  return data || []
}

export async function getUserBookings(userId) {
  const { data, error } = await supabase
    .from('elevator_bookings')
    .select('*')
    .eq('user_id', userId)
    .order('start_time', { ascending: true })

  if (error) throw error
  return data
}

export async function createBooking(bookingData) {
  const { data, error } = await supabase
    .from('elevator_bookings')
    .insert([bookingData])
    .select()

  if (error) throw error
  return data[0]
}

export async function updateBooking(bookingId, bookingData) {
  const { data, error } = await supabase
    .from('elevator_bookings')
    .update(bookingData)
    .eq('id', bookingId)
    .select()

  if (error) throw error
  return data[0]
}

export async function cancelBooking(bookingId) {
  const { error } = await supabase
    .from('elevator_bookings')
    .delete()
    .eq('id', bookingId)

  if (error) throw error
  return true
}

export async function checkAvailability(buildingId, date, startTime, endTime) {
  const { data, error } = await supabase
    .from('elevator_bookings')
    .select('*')
    .eq('building_id', buildingId)
    .eq('start_time', date)
    .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime})`)

  if (error) throw error
  return data.length === 0 // Returns true if available
}
