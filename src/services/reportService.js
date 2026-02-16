import { supabase } from '../lib/supabase'

/**
 * Submit a content report
 */
export async function submitReport(buildingId, reporterId, contentType, contentId, reason, details) {
  const { error } = await supabase
    .from('content_reports')
    .insert({
      building_id: buildingId,
      reporter_id: reporterId,
      content_type: contentType,
      content_id: contentId,
      reason,
      details: details || null
    })

  if (error) {
    console.error('[reportService] Error submitting report:', error)
    throw new Error('Failed to submit report. Please try again.')
  }

  return { success: true }
}

/**
 * Check if the current user has already reported a specific piece of content
 */
export async function hasUserReported(reporterId, contentId) {
  const { data, error } = await supabase
    .from('content_reports')
    .select('id')
    .eq('reporter_id', reporterId)
    .eq('content_id', contentId)
    .limit(1)

  if (error) {
    console.warn('[reportService] Error checking report status:', error)
    return false
  }

  return data && data.length > 0
}
