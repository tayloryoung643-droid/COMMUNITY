import { useState, useEffect } from 'react'
import { X, Bug, Lightbulb, HelpCircle, MessageSquare, Send, CheckCircle } from 'lucide-react'
import { submitFeedback } from '../services/feedbackService'
import './FeedbackModal.css'

const CATEGORIES = [
  { value: 'bug', label: 'Bug Report', icon: Bug },
  { value: 'feature_request', label: 'Suggestion', icon: Lightbulb },
  { value: 'question', label: 'Question', icon: HelpCircle },
  { value: 'general_feedback', label: 'Feedback', icon: MessageSquare },
]

function FeedbackModal({ isOpen, onClose, userProfile, buildingId, buildingName, pageContext, isDemoMode }) {
  const [category, setCategory] = useState('general_feedback')
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState(null)

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setCategory('general_feedback')
      setSubject('')
      setMessage('')
      setError(null)
      setShowSuccess(false)
    }
  }, [isOpen])

  // Auto-dismiss success
  useEffect(() => {
    if (showSuccess) {
      const timer = setTimeout(() => {
        setShowSuccess(false)
        onClose()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [showSuccess, onClose])

  const handleSubmit = async () => {
    if (!message.trim()) return

    if (isDemoMode) {
      setShowSuccess(true)
      return
    }

    setIsSubmitting(true)
    setError(null)
    try {
      await submitFeedback({
        buildingId: buildingId || userProfile?.building_id || null,
        userId: userProfile?.id || null,
        userName: userProfile?.full_name || '',
        userEmail: userProfile?.email || '',
        userRole: userProfile?.role || 'resident',
        category,
        subject: subject.trim() || null,
        message: message.trim(),
        pageContext: pageContext || null,
        buildingName: buildingName || null,
      })
      setShowSuccess(true)
    } catch (err) {
      console.error('[FeedbackModal] Submit error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="feedback-modal-overlay" onClick={onClose}>
      <div className="feedback-modal" onClick={e => e.stopPropagation()}>
        {showSuccess ? (
          <div className="feedback-success">
            <div className="feedback-success-icon">
              <CheckCircle size={48} />
            </div>
            <h3>Thanks for your feedback!</h3>
            <p>We review every submission.</p>
          </div>
        ) : (
          <>
            <div className="feedback-modal-header">
              <div className="feedback-modal-header-left">
                <MessageSquare size={20} />
                <h2>Send Feedback</h2>
              </div>
              <button className="feedback-modal-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="feedback-modal-body">
              {/* Category Pills */}
              <div className="feedback-categories">
                {CATEGORIES.map(cat => {
                  const Icon = cat.icon
                  return (
                    <button
                      key={cat.value}
                      className={`feedback-category-pill ${category === cat.value ? 'active' : ''}`}
                      onClick={() => setCategory(cat.value)}
                    >
                      <Icon size={14} />
                      <span>{cat.label}</span>
                    </button>
                  )
                })}
              </div>

              {/* Subject */}
              <div className="feedback-field">
                <input
                  type="text"
                  placeholder="Brief summary (optional)"
                  value={subject}
                  onChange={e => setSubject(e.target.value)}
                  maxLength={120}
                />
              </div>

              {/* Message */}
              <div className="feedback-field">
                <textarea
                  placeholder="Tell us more... What happened? What did you expect?"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  rows={5}
                />
              </div>

              <p className="feedback-hint">
                For bugs, try to describe what you see and what you expected to happen.
              </p>

              {error && <p className="feedback-error">{error}</p>}
            </div>

            <div className="feedback-modal-footer">
              <button className="feedback-cancel-btn" onClick={onClose}>
                Cancel
              </button>
              <button
                className="feedback-submit-btn"
                onClick={handleSubmit}
                disabled={!message.trim() || isSubmitting}
              >
                <Send size={16} />
                <span>{isSubmitting ? 'Sending...' : 'Send Feedback'}</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default FeedbackModal
