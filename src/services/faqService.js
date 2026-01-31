import { supabase } from '../lib/supabase'

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
// AI EXTRACTION STUB
// Replace this function with a real API call when ready
// ============================================================================

/**
 * Extract FAQ items from raw text using AI
 * STUB IMPLEMENTATION - Returns mock parsed data
 *
 * TODO: Replace with real AI API call (e.g., OpenAI, Anthropic, etc.)
 * Expected input: raw text (pasted or from file)
 * Expected output: { items: [{category, question, answer}], error?: string }
 *
 * @param {string} rawText - The raw text to parse
 * @returns {Promise<{items: Array, error?: string}>}
 */
export async function extractFaqsFromText(rawText) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  if (!rawText || rawText.trim().length < 50) {
    return {
      items: [],
      error: 'Please provide more text content to extract FAQs from (at least 50 characters).'
    }
  }

  // STUB: Parse text into FAQ items
  // This is a simple heuristic-based parser that looks for Q&A patterns
  // Replace with real AI extraction for production

  const items = []
  const text = rawText.trim()

  // Try to detect Q&A patterns
  const qaPatterns = [
    // Pattern: Q: ... A: ...
    /Q[:.]?\s*(.+?)\s*A[:.]?\s*(.+?)(?=Q[:.]?\s|$)/gis,
    // Pattern: Question: ... Answer: ...
    /Question[:.]?\s*(.+?)\s*Answer[:.]?\s*(.+?)(?=Question[:.]?\s|$)/gis,
    // Pattern: **Question** ... **Answer** ...
    /\*\*(.+?)\*\*\s*(.+?)(?=\*\*|$)/gs,
  ]

  let foundItems = false

  for (const pattern of qaPatterns) {
    const matches = [...text.matchAll(pattern)]
    if (matches.length > 0) {
      foundItems = true
      matches.forEach(match => {
        const question = match[1].trim().replace(/\n/g, ' ')
        const answer = match[2].trim().replace(/\n/g, ' ')
        if (question.length > 10 && answer.length > 10) {
          items.push({
            category: categorizeQuestion(question),
            question: question.substring(0, 500),
            answer: answer.substring(0, 2000)
          })
        }
      })
      break
    }
  }

  // If no Q&A pattern found, generate FAQs from paragraphs
  if (!foundItems) {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 30)

    // Generate FAQ items from content themes
    const themes = detectThemes(text)

    themes.forEach((theme, index) => {
      items.push({
        category: theme.category,
        question: theme.question,
        answer: theme.answer
      })
    })

    // If still no items, create generic ones from paragraphs
    if (items.length === 0 && paragraphs.length > 0) {
      paragraphs.slice(0, 10).forEach((para, index) => {
        const sentences = para.split(/[.!?]+/).filter(s => s.trim().length > 20)
        if (sentences.length >= 1) {
          items.push({
            category: 'General',
            question: generateQuestionFromText(sentences[0].trim()),
            answer: para.trim().substring(0, 2000)
          })
        }
      })
    }
  }

  // Ensure we have at least some items
  if (items.length === 0) {
    return {
      items: generateDefaultFaqs(),
      error: null
    }
  }

  return { items: items.slice(0, 20), error: null }
}

// Helper: Categorize a question based on keywords
function categorizeQuestion(question) {
  const q = question.toLowerCase()

  if (q.includes('park') || q.includes('garage') || q.includes('vehicle') || q.includes('car')) {
    return 'Parking'
  }
  if (q.includes('pet') || q.includes('dog') || q.includes('cat') || q.includes('animal')) {
    return 'Pets'
  }
  if (q.includes('package') || q.includes('deliver') || q.includes('mail') || q.includes('amazon')) {
    return 'Packages & Mail'
  }
  if (q.includes('guest') || q.includes('visitor') || q.includes('access') || q.includes('key') || q.includes('fob')) {
    return 'Access & Security'
  }
  if (q.includes('amenity') || q.includes('amenities') || q.includes('gym') || q.includes('pool') || q.includes('rooftop') || q.includes('lounge')) {
    return 'Amenities'
  }
  if (q.includes('move') || q.includes('elevator') || q.includes('freight')) {
    return 'Moving & Elevator'
  }
  if (q.includes('pay') || q.includes('rent') || q.includes('fee') || q.includes('bill') || q.includes('charge')) {
    return 'Billing & Payments'
  }
  if (q.includes('maintenance') || q.includes('repair') || q.includes('fix') || q.includes('broken') || q.includes('hvac') || q.includes('plumb')) {
    return 'Maintenance'
  }
  if (q.includes('noise') || q.includes('quiet') || q.includes('hour') || q.includes('rule') || q.includes('policy')) {
    return 'Building Policies'
  }
  if (q.includes('trash') || q.includes('recycl') || q.includes('garbage') || q.includes('waste')) {
    return 'Trash & Recycling'
  }
  if (q.includes('laundry') || q.includes('wash') || q.includes('dryer')) {
    return 'Laundry'
  }
  if (q.includes('emergency') || q.includes('fire') || q.includes('safety')) {
    return 'Safety & Emergency'
  }

  return 'General'
}

// Helper: Detect themes in text for FAQ generation
function detectThemes(text) {
  const themes = []
  const t = text.toLowerCase()

  const themeMap = [
    { keywords: ['parking', 'garage', 'car', 'vehicle'], category: 'Parking',
      question: 'What are the parking rules and regulations?',
      answerKey: 'parking' },
    { keywords: ['pet', 'dog', 'cat', 'animal'], category: 'Pets',
      question: 'What is the pet policy?',
      answerKey: 'pet' },
    { keywords: ['package', 'delivery', 'mail', 'mailroom'], category: 'Packages & Mail',
      question: 'How do I receive packages?',
      answerKey: 'package' },
    { keywords: ['guest', 'visitor', 'access'], category: 'Access & Security',
      question: 'How do I register guests?',
      answerKey: 'guest' },
    { keywords: ['amenity', 'amenities', 'gym', 'pool', 'fitness'], category: 'Amenities',
      question: 'What amenities are available and what are the hours?',
      answerKey: 'amenity' },
    { keywords: ['move', 'moving', 'elevator', 'freight'], category: 'Moving & Elevator',
      question: 'How do I schedule the freight elevator for moving?',
      answerKey: 'move' },
    { keywords: ['rent', 'payment', 'pay', 'fee', 'bill'], category: 'Billing & Payments',
      question: 'How do I pay rent and when is it due?',
      answerKey: 'rent' },
    { keywords: ['maintenance', 'repair', 'fix', 'broken'], category: 'Maintenance',
      question: 'How do I submit a maintenance request?',
      answerKey: 'maintenance' },
    { keywords: ['quiet', 'noise', 'hour'], category: 'Building Policies',
      question: 'What are the quiet hours?',
      answerKey: 'quiet' },
    { keywords: ['trash', 'garbage', 'recycling', 'waste'], category: 'Trash & Recycling',
      question: 'Where do I dispose of trash and recycling?',
      answerKey: 'trash' },
  ]

  themeMap.forEach(theme => {
    if (theme.keywords.some(kw => t.includes(kw))) {
      // Extract relevant sentences
      const sentences = text.split(/[.!?]+/)
      const relevant = sentences.filter(s =>
        theme.keywords.some(kw => s.toLowerCase().includes(kw))
      )
      if (relevant.length > 0) {
        themes.push({
          category: theme.category,
          question: theme.question,
          answer: relevant.slice(0, 3).join('. ').trim() + '.'
        })
      }
    }
  })

  return themes
}

// Helper: Generate a question from a statement
function generateQuestionFromText(text) {
  const t = text.trim()

  // If it's already a question, return it
  if (t.endsWith('?')) return t

  // Try to convert to a question
  const starts = ['what', 'how', 'when', 'where', 'who', 'can', 'do', 'is', 'are']
  const lowerT = t.toLowerCase()

  if (starts.some(s => lowerT.startsWith(s))) {
    return t + '?'
  }

  // Generate a question based on content
  if (lowerT.includes('must') || lowerT.includes('should') || lowerT.includes('required')) {
    return 'What are the requirements for ' + extractTopic(t) + '?'
  }

  return 'What should I know about ' + extractTopic(t) + '?'
}

// Helper: Extract topic from text
function extractTopic(text) {
  const words = text.split(/\s+/).slice(0, 5)
  return words.join(' ').toLowerCase().replace(/[.,!?]/g, '')
}

// Helper: Generate default FAQs when parsing fails
function generateDefaultFaqs() {
  return [
    {
      category: 'General',
      question: 'How do I contact the building management?',
      answer: 'You can reach building management through the Community app messaging feature, by email, or by visiting the management office during business hours.'
    },
    {
      category: 'Packages & Mail',
      question: 'How do I receive packages?',
      answer: 'Packages are received at the front desk or package room. You will receive a notification when a package arrives. Please pick up packages within 48 hours.'
    },
    {
      category: 'Maintenance',
      question: 'How do I submit a maintenance request?',
      answer: 'Submit maintenance requests through the Community app or contact the management office. For emergencies, call the emergency maintenance line.'
    },
    {
      category: 'Amenities',
      question: 'What amenities are available?',
      answer: 'Please check with building management for a complete list of amenities and their hours of operation.'
    },
    {
      category: 'Building Policies',
      question: 'What are the quiet hours?',
      answer: 'Quiet hours are typically from 10 PM to 8 AM. Please be considerate of your neighbors at all times.'
    }
  ]
}
