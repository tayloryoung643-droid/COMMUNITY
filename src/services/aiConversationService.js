import { supabase } from '../lib/supabase'

/**
 * AI Conversation Service
 * Handles saving and loading chat history for the AI Assistant
 */

/**
 * Get all conversations for a user in a building
 * @param {string} buildingId - Building UUID
 * @param {string} userId - User UUID
 * @returns {Promise<Array>} List of conversations
 */
export async function getConversations(buildingId, userId) {
  try {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('id, title, created_at, updated_at, messages')
      .eq('building_id', buildingId)
      .eq('user_id', userId)
      .order('updated_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('[aiConversationService] Error fetching conversations:', error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error('[aiConversationService] getConversations error:', error)
    return []
  }
}

/**
 * Get a single conversation by ID
 * @param {string} conversationId - Conversation UUID
 * @returns {Promise<Object|null>} Conversation object or null
 */
export async function getConversation(conversationId) {
  try {
    const { data, error } = await supabase
      .from('ai_conversations')
      .select('*')
      .eq('id', conversationId)
      .single()

    if (error) {
      console.error('[aiConversationService] Error fetching conversation:', error)
      throw error
    }

    return data
  } catch (error) {
    console.error('[aiConversationService] getConversation error:', error)
    return null
  }
}

/**
 * Create a new conversation
 * @param {string} buildingId - Building UUID
 * @param {string} userId - User UUID
 * @param {string} firstMessage - First user message (used for title)
 * @returns {Promise<Object>} Created conversation
 */
export async function createConversation(buildingId, userId, firstMessage) {
  try {
    // Generate title from first message (first 50 chars)
    const title = generateTitle(firstMessage)

    const { data, error } = await supabase
      .from('ai_conversations')
      .insert([{
        building_id: buildingId,
        user_id: userId,
        title: title,
        messages: []
      }])
      .select()

    if (error) {
      console.error('[aiConversationService] Error creating conversation:', error)
      throw error
    }

    return data[0]
  } catch (error) {
    console.error('[aiConversationService] createConversation error:', error)
    return null
  }
}

/**
 * Update conversation messages
 * @param {string} conversationId - Conversation UUID
 * @param {Array} messages - Array of message objects
 * @returns {Promise<Object>} Updated conversation
 */
export async function updateConversationMessages(conversationId, messages) {
  try {
    // Also update title based on first user message if needed
    const firstUserMessage = messages.find(m => m.type === 'user')
    const title = firstUserMessage ? generateTitle(firstUserMessage.text) : 'New Conversation'

    const { data, error } = await supabase
      .from('ai_conversations')
      .update({
        messages: messages,
        title: title
      })
      .eq('id', conversationId)
      .select()

    if (error) {
      console.error('[aiConversationService] Error updating conversation:', error)
      throw error
    }

    return data[0]
  } catch (error) {
    console.error('[aiConversationService] updateConversationMessages error:', error)
    return null
  }
}

/**
 * Delete a conversation
 * @param {string} conversationId - Conversation UUID
 * @returns {Promise<boolean>} Success status
 */
export async function deleteConversation(conversationId) {
  try {
    const { error } = await supabase
      .from('ai_conversations')
      .delete()
      .eq('id', conversationId)

    if (error) {
      console.error('[aiConversationService] Error deleting conversation:', error)
      throw error
    }

    return true
  } catch (error) {
    console.error('[aiConversationService] deleteConversation error:', error)
    return false
  }
}

/**
 * Generate a title from message text
 * @param {string} messageText - The message text
 * @returns {string} Generated title
 */
function generateTitle(messageText) {
  if (!messageText) return 'New Conversation'

  // Clean up the text
  let title = messageText.trim()

  // If it ends with ?, keep the question mark, otherwise don't add punctuation
  const endsWithQuestion = title.endsWith('?')

  // Truncate to 50 chars max
  if (title.length > 50) {
    title = title.substring(0, 47) + '...'
  }

  return title
}

/**
 * Format relative time for display
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export function formatConversationTime(dateString) {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}
