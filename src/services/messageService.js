import { supabase } from '../lib/supabase'

// Get all messages for a building (for manager view)
export async function getMessages(buildingId) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:from_user_id(id, full_name, unit_number, email, phone, role), recipient:to_user_id(id, full_name, unit_number, email, phone, role)')
    .eq('building_id', buildingId)
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) {
    console.error('[messageService.getMessages] Error:', error)
    throw error
  }
  return data || []
}

// Get conversation between two users
export async function getConversation(userId1, userId2) {
  const { data, error } = await supabase
    .from('messages')
    .select('*, sender:from_user_id(id, full_name, unit_number, role), recipient:to_user_id(id, full_name, unit_number, role)')
    .or(`and(from_user_id.eq.${userId1},to_user_id.eq.${userId2}),and(from_user_id.eq.${userId2},to_user_id.eq.${userId1})`)
    .order('created_at', { ascending: true })

  if (error) {
    console.error('[messageService.getConversation] Error:', error)
    throw error
  }
  return data || []
}

// Send a new message
export async function sendMessage({ building_id, from_user_id, to_user_id, content }) {
  const { data, error } = await supabase
    .from('messages')
    .insert([{
      building_id,
      from_user_id,
      to_user_id,
      content,
      is_read: false
    }])
    .select()

  if (error) {
    console.error('[messageService.sendMessage] Error:', error)
    throw error
  }
  return data[0]
}

// Mark a message as read
export async function markAsRead(messageId) {
  const { data, error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId)
    .select()

  if (error) {
    console.error('[messageService.markAsRead] Error:', error)
    throw error
  }
  return data[0]
}

// Mark all messages in a conversation as read (for recipient)
export async function markConversationAsRead(userId, otherUserId) {
  const { data, error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('to_user_id', userId)
    .eq('from_user_id', otherUserId)
    .eq('is_read', false)
    .select()

  if (error) {
    console.error('[messageService.markConversationAsRead] Error:', error)
    throw error
  }
  return data
}

// Get unread count for a user
export async function getUnreadCount(userId) {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('to_user_id', userId)
    .eq('is_read', false)

  if (error) {
    console.error('[messageService.getUnreadCount] Error:', error)
    throw error
  }
  return count || 0
}

// Get the building manager for a building
export async function getBuildingManager(buildingId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, unit_number, email, phone, role')
    .eq('building_id', buildingId)
    .in('role', ['manager', 'property_manager', 'admin'])
    .limit(1)
    .single()

  if (error) {
    console.error('[messageService.getBuildingManager] Error:', error)
    return null
  }
  return data
}

// Get all residents for a building (for manager to start new conversations)
export async function getResidents(buildingId) {
  const { data, error } = await supabase
    .from('users')
    .select('id, full_name, unit_number, email, phone, role')
    .eq('building_id', buildingId)
    .eq('role', 'resident')
    .order('unit_number', { ascending: true })
    .limit(200)

  if (error) {
    console.error('[messageService.getResidents] Error:', error)
    throw error
  }
  return data || []
}
