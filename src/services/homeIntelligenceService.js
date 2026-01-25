import { supabase } from '../lib/supabase'

/**
 * Home Intelligence Service
 * Provides context-aware home screen data and engagement tracking
 */

// ============================================
// ENGAGEMENT EVENT LOGGING
// ============================================

/**
 * Log an engagement event for preference learning
 * @param {Object} params
 * @param {string} params.userId - User ID
 * @param {string} params.buildingId - Building ID
 * @param {string} params.eventType - Type of event (home_view, post_open, etc.)
 * @param {string} [params.entityType] - Type of entity (post, event, package, etc.)
 * @param {string} [params.entityId] - ID of the entity
 * @param {string} [params.topic] - Topic/category for preference learning
 * @param {Object} [params.metadata] - Additional metadata
 */
export async function logEngagementEvent({
  userId,
  buildingId,
  eventType,
  entityType = null,
  entityId = null,
  topic = null,
  metadata = {}
}) {
  if (!userId || !buildingId || !eventType) {
    console.warn('[homeIntelligence] Missing required params for engagement event')
    return null
  }

  try {
    const { data, error } = await supabase
      .from('engagement_events')
      .insert([{
        user_id: userId,
        building_id: buildingId,
        event_type: eventType,
        entity_type: entityType,
        entity_id: entityId,
        topic,
        metadata
      }])
      .select()
      .single()

    if (error) {
      // Don't throw - engagement logging should be silent
      console.warn('[homeIntelligence] Failed to log engagement:', error.message)
      return null
    }

    console.log('[homeIntelligence] Engagement logged:', eventType)
    return data
  } catch (err) {
    console.warn('[homeIntelligence] Engagement logging error:', err.message)
    return null
  }
}

// ============================================
// HOME BRIEF FETCHING
// ============================================

/**
 * Get today's cached home brief if it exists
 * @param {string} userId
 * @param {string} buildingId
 * @returns {Object|null} The brief JSON or null
 */
export async function getTodaysHomeBrief(userId, buildingId) {
  if (!userId || !buildingId) {
    return null
  }

  try {
    const { data, error } = await supabase
      .rpc('get_todays_home_brief', {
        p_user_id: userId,
        p_building_id: buildingId
      })

    if (error) {
      console.warn('[homeIntelligence] Failed to get home brief:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.warn('[homeIntelligence] Home brief fetch error:', err.message)
    return null
  }
}

// ============================================
// BUILDING SIGNALS
// ============================================

/**
 * Get new joiner counts for the building (aggregated only)
 * @param {string} buildingId
 * @returns {Object} { joiners_last_24h_count, joiners_last_7d_count }
 */
export async function getNewJoinersCount(buildingId) {
  if (!buildingId) {
    return { joiners_last_24h_count: 0, joiners_last_7d_count: 0 }
  }

  try {
    const { data, error } = await supabase
      .rpc('get_new_joiners_count', {
        p_building_id: buildingId
      })

    if (error) {
      console.warn('[homeIntelligence] Failed to get joiners count:', error.message)
      return { joiners_last_24h_count: 0, joiners_last_7d_count: 0 }
    }

    return data || { joiners_last_24h_count: 0, joiners_last_7d_count: 0 }
  } catch (err) {
    console.warn('[homeIntelligence] Joiners count error:', err.message)
    return { joiners_last_24h_count: 0, joiners_last_7d_count: 0 }
  }
}

/**
 * Get building activity summary
 * @param {string} buildingId
 * @returns {Object} Activity counts
 */
export async function getBuildingActivitySummary(buildingId) {
  if (!buildingId) {
    return null
  }

  try {
    const { data, error } = await supabase
      .rpc('get_building_activity_summary', {
        p_building_id: buildingId
      })

    if (error) {
      console.warn('[homeIntelligence] Failed to get activity summary:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.warn('[homeIntelligence] Activity summary error:', err.message)
    return null
  }
}

// ============================================
// CONTEXT LINE GENERATION (Client-side fallback)
// ============================================

/**
 * Generate a context line based on building activity
 * This is a client-side fallback when Edge Function brief is unavailable
 * @param {Object} params
 * @param {Object} params.activity - Building activity summary
 * @param {Object} params.joiners - New joiner counts
 * @param {string} params.buildingName - Building name for personalization
 * @returns {Object} { line1, line2 }
 */
export function generateContextLine({ activity, joiners, buildingName }) {
  const lines = { line1: '', line2: null }

  if (!activity) {
    // Default calm state
    lines.line1 = 'A quiet day ahead. Check back for updates.'
    return lines
  }

  // Build line1 based on activity
  const parts = []

  if (activity.events_today > 0) {
    parts.push(`${activity.events_today} event${activity.events_today > 1 ? 's' : ''} happening today`)
  }

  if (activity.packages_pending > 0) {
    parts.push(`${activity.packages_pending} package${activity.packages_pending > 1 ? 's' : ''} waiting`)
  }

  if (activity.posts_last_24h > 0) {
    parts.push(`${activity.posts_last_24h} new post${activity.posts_last_24h > 1 ? 's' : ''} from neighbors`)
  }

  if (activity.bulletin_items_7d > 0 && parts.length < 2) {
    parts.push(`${activity.bulletin_items_7d} new listing${activity.bulletin_items_7d > 1 ? 's' : ''} this week`)
  }

  if (parts.length === 0) {
    // Quiet day variations
    const quietLines = [
      'A peaceful day in the building.',
      'Nothing urgent today. Enjoy the calm.',
      'All quiet on the home front.'
    ]
    lines.line1 = quietLines[Math.floor(Math.random() * quietLines.length)]
  } else if (parts.length === 1) {
    lines.line1 = parts[0] + '.'
  } else {
    lines.line1 = parts.slice(0, 2).join(' · ')
  }

  // Build line2 for momentum (new joiners)
  if (joiners) {
    if (joiners.joiners_last_7d_count > 0) {
      const count = joiners.joiners_last_7d_count
      lines.line2 = `${count} new resident${count > 1 ? 's' : ''} joined this week.`
    }
  }

  return lines
}

// ============================================
// EDGE FUNCTION CALL
// ============================================

/**
 * Call the Edge Function to generate a fresh home brief
 * @param {string} userId
 * @param {string} buildingId
 * @returns {Object|null} The generated brief or null
 */
export async function generateHomeBrief(userId, buildingId) {
  if (!userId || !buildingId) {
    return null
  }

  try {
    const { data, error } = await supabase.functions.invoke('generate-home-brief', {
      body: { user_id: userId, building_id: buildingId }
    })

    if (error) {
      console.warn('[homeIntelligence] Edge function error:', error.message)
      return null
    }

    return data
  } catch (err) {
    console.warn('[homeIntelligence] Failed to call Edge Function:', err.message)
    return null
  }
}

// ============================================
// MAIN FETCH FUNCTION
// ============================================

/**
 * Get home intelligence data for displaying on home screen
 * Tries cached brief first, falls back to client-side generation
 * @param {Object} params
 * @param {string} params.userId
 * @param {string} params.buildingId
 * @param {string} params.buildingName
 * @returns {Object} { contextLine1, contextLine2, fromCache }
 */
export async function getHomeIntelligence({ userId, buildingId, buildingName }) {
  if (!userId || !buildingId) {
    console.log('[homeIntelligence] Missing userId or buildingId')
    return { contextLine1: null, contextLine2: null, fromCache: false }
  }

  console.log('[homeIntelligence] Fetching for building:', buildingId)

  // Try to get cached brief first
  const cachedBrief = await getTodaysHomeBrief(userId, buildingId)

  if (cachedBrief && cachedBrief.home_context) {
    console.log('[homeIntelligence] Using cached brief')
    return {
      contextLine1: cachedBrief.home_context.line1 || null,
      contextLine2: cachedBrief.home_context.line2 || null,
      fromCache: true
    }
  }

  // Fall back to client-side generation
  console.log('[homeIntelligence] No cached brief, generating client-side')

  const [activity, joiners] = await Promise.all([
    getBuildingActivitySummary(buildingId),
    getNewJoinersCount(buildingId)
  ])

  console.log('[homeIntelligence] Activity:', activity)
  console.log('[homeIntelligence] Joiners:', joiners)

  const context = generateContextLine({ activity, joiners, buildingName })

  return {
    contextLine1: context.line1 || null,
    contextLine2: context.line2 || null,
    fromCache: false
  }
}
