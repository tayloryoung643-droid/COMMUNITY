import { supabase } from '../lib/supabase'

export async function submitFeedback({ buildingId, userId, userName, userEmail, userRole, category, subject, message, pageContext }) {
  const { data, error } = await supabase
    .from('feedback')
    .insert([{
      building_id: buildingId || null,
      user_id: userId || null,
      user_name: userName,
      user_email: userEmail,
      user_role: userRole,
      category,
      subject: subject || null,
      message,
      page_context: pageContext || null,
    }])
    .select()
    .single()

  if (error) {
    console.error('[feedbackService] Error submitting feedback:', error)
    throw error
  }
  return data
}

export async function getUserFeedback(userId) {
  const { data, error } = await supabase
    .from('feedback')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[feedbackService] Error fetching feedback:', error)
    throw error
  }
  return data || []
}
