import { supabase } from '../lib/supabase'
import { sendMessage } from './aiService'

/**
 * Get FAQ items for a building
 * @param {string} buildingId - Building UUID
 * @param {boolean} isManager - If true, returns all items; if false, only visible items
 */
export async function getFaqItems(buildingId, isManager = false) {
  let query = supabase
    .from('faq_items')
    .select('*')
    .eq('building_id', buildingId)
    .order('category', { ascending: true })
    .order('display_order', { ascending: true })

  // Residents only see visible items
  if (!isManager) {
    query = query.eq('is_visible', true)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}

/**
 * Replace all FAQ items for a building (bulk import)
 * @param {string} buildingId - Building UUID
 * @param {Array} items - Array of FAQ items to insert
 * @param {Object} meta - Metadata { createdBy, sourceType, sourceName }
 */
export async function replaceFaqItems(buildingId, items, meta = {}) {
  const { createdBy, sourceType, sourceName } = meta

  // Step 1: Delete all existing FAQ items for this building
  const { error: deleteError } = await supabase
    .from('faq_items')
    .delete()
    .eq('building_id', buildingId)

  if (deleteError) throw deleteError

  // Step 2: Insert new items with metadata
  if (items.length === 0) return []

  const itemsToInsert = items.map((item, index) => ({
    building_id: buildingId,
    category: item.category || 'General',
    question: item.question,
    answer: item.answer,
    is_visible: item.is_visible !== false,
    display_order: index,
    view_count: 0,
    created_by: createdBy || null,
    source_type: sourceType || null,
    source_name: sourceName || null
  }))

  const { data, error: insertError } = await supabase
    .from('faq_items')
    .insert(itemsToInsert)
    .select()

  if (insertError) throw insertError
  return data
}

/**
 * Update a single FAQ item
 * @param {string} id - FAQ item UUID
 * @param {Object} patch - Fields to update
 */
export async function updateFaqItem(id, patch) {
  const updateData = { ...patch, updated_at: new Date().toISOString() }

  const { data, error } = await supabase
    .from('faq_items')
    .update(updateData)
    .eq('id', id)
    .select()

  if (error) throw error
  return data[0]
}

/**
 * Delete a single FAQ item
 * @param {string} id - FAQ item UUID
 */
export async function deleteFaqItem(id) {
  const { error } = await supabase
    .from('faq_items')
    .delete()
    .eq('id', id)

  if (error) throw error
  return true
}

/**
 * Create a single FAQ item
 * @param {Object} itemData - FAQ item data
 */
export async function createFaqItem(itemData) {
  const { data, error } = await supabase
    .from('faq_items')
    .insert([itemData])
    .select()

  if (error) throw error
  return data[0]
}

/**
 * Increment view count for a FAQ item (best effort)
 * @param {string} id - FAQ item UUID
 */
export async function incrementViewCount(id) {
  try {
    // Use RPC if available, otherwise do a read-update
    const { data: current } = await supabase
      .from('faq_items')
      .select('view_count')
      .eq('id', id)
      .single()

    if (current) {
      await supabase
        .from('faq_items')
        .update({ view_count: (current.view_count || 0) + 1 })
        .eq('id', id)
    }
  } catch (err) {
    // Best effort - don't throw on view count failures
    console.warn('[faqService] Failed to increment view count:', err)
  }
}

/**
 * Get unique categories for a building
 * @param {string} buildingId - Building UUID
 */
export async function getFaqCategories(buildingId) {
  const { data, error } = await supabase
    .from('faq_items')
    .select('category')
    .eq('building_id', buildingId)

  if (error) throw error

  const categories = [...new Set((data || []).map(item => item.category))]
  return categories.sort()
}

// ============================================================================
// AI FAQ EXTRACTION
// ============================================================================

const FAQ_SYSTEM_PROMPT = `You are a helpful assistant that converts building rules, policies, and documents into clear FAQ entries for apartment residents. Break the content into individual question-and-answer pairs. Write questions from the perspective of a resident who would be looking for this information (e.g., "What are the quiet hours?" not "Section 4.2 Noise Policy"). Keep answers concise but complete. Assign each entry a category from this list: General, Amenities, Parking, Maintenance, Packages & Mail, Building Policies, Access & Security, Pets, Billing & Payments, Moving & Elevator, Trash & Recycling, Safety & Emergency. Return ONLY a valid JSON array with objects containing: question, answer, category.`

/**
 * Extract FAQ items from raw text using AI
 * @param {string} rawText - The raw text to parse
 * @returns {Promise<{items: Array, error?: string}>}
 */
export async function extractFaqsFromText(rawText) {
  if (!rawText || rawText.trim().length < 50) {
    return {
      items: [],
      error: 'Please provide more text content to extract FAQs from (at least 50 characters).'
    }
  }

  const result = await sendMessage(
    [{ role: 'user', content: rawText }],
    FAQ_SYSTEM_PROMPT
  )

  if (!result.success) {
    return {
      items: [],
      error: result.error || 'AI parsing failed. Please try again.'
    }
  }

  // Parse JSON from AI response (same pattern as invitationService.parseWithAI)
  let parsed
  try {
    parsed = JSON.parse(result.message)
  } catch {
    const jsonMatch = result.message.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0])
      } catch {
        return {
          items: [],
          error: "Couldn't parse the AI response. Please try again."
        }
      }
    } else {
      return {
        items: [],
        error: "Couldn't parse the AI response. Please try again."
      }
    }
  }

  if (!Array.isArray(parsed) || parsed.length === 0) {
    return {
      items: [],
      error: 'Could not extract any FAQ items from the provided content.'
    }
  }

  const items = parsed
    .filter(item => item.question && item.answer)
    .map(item => ({
      category: item.category || 'General',
      question: item.question.trim(),
      answer: item.answer.trim()
    }))

  return { items, error: null }
}
