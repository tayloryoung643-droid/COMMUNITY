import { supabase } from '../lib/supabase'

export async function getMessages(buildingId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:users!sender_id(*), recipient:users!recipient_id(*)')
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })

  if (error) throw error
  return data
}

export async function getConversation(userId1, userId2) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:users!sender_id(*), recipient:users!recipient_id(*)')
    .or(`and(sender_id.eq.${userId1},recipient_id.eq.${userId2}),and(sender_id.eq.${userId2},recipient_id.eq.${userId1})`)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}

export async function sendMessage(messageData) {
  const { data, error } = await supabase
    .from('messages')
    .insert([messageData])
    .select()

  if (error) throw error
  return data[0]
}

export async function markAsRead(messageId) {
  const { data, error } = await supabase
    .from('messages')
    .update({ read: true, read_at: new Date().toISOString() })
    .eq('id', messageId)
    .select()

  if (error) throw error
  return data[0]
}

export async function getUnreadCount(userId) {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('recipient_id', userId)
    .eq('read', false)

  if (error) throw error
  return count
}
