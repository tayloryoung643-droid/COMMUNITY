import { supabase } from '../lib/supabase'

export async function getBookings(buildingId) {
  const { data, error } = await supabase
    .from('elevator_bookings')
    .select('*, user:users(*)')
    .eq('building_id', buildingId)
    .order('booking_date', { ascending: true })

  if (error) throw error
  return data
}

export async function getUpcomingBookings(buildingId) {
  const { data, error } = await supabase
    .from('elevator_bookings')
    .select('*, user:users(*)')
    .eq('building_id', buildingId)
    .gte('booking_date', new Date().toISOString().split('T')[0])
    .order('booking_date', { ascending: true })

  if (error) throw error
  return data
}

export async function getUserBookings(userId) {
  const { data, error } = await supabase
    .from('elevator_bookings')
    .select('*')
    .eq('user_id', userId)
    .order('booking_date', { ascending: true })

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
    .eq('booking_date', date)
    .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime})`)

  if (error) throw error
  return data.length === 0 // Returns true if available
}
