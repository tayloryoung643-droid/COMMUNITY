import { supabase } from '../lib/supabase'

export async function submitFeedback({ buildingId, userId, userName, userEmail, userRole, category, subject, message, pageContext, buildingName }) {
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

  // Send email notification (fire-and-forget — don't block on failure)
  try {
    fetch('/api/send-feedback-notification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        category,
        subject: subject || null,
        message,
        userName: userName || null,
        userEmail: userEmail || null,
        userRole: userRole || null,
        buildingName: buildingName || null,
        pageContext: pageContext || null,
        timestamp: data.created_at,
      }),
    }).catch(err => {
      console.error('[feedbackService] Email notification failed:', err)
    })
  } catch (err) {
    console.error('[feedbackService] Email notification error:', err)
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
