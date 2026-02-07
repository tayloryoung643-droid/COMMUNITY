import { useState, useEffect } from 'react'
import { MessageSquarePlus, ChevronDown, ChevronUp } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getUserFeedback } from './services/feedbackService'
import FeedbackModal from './components/FeedbackModal'
import './ManagerFeedback.css'

const categoryColors = {
  bug: { bg: '#fef2f2', color: '#dc2626', label: 'Bug Report' },
  feature_request: { bg: '#f0fdf4', color: '#16a34a', label: 'Feature Request' },
  question: { bg: '#eff6ff', color: '#2563eb', label: 'Question' },
  general_feedback: { bg: '#faf5ff', color: '#7c3aed', label: 'Feedback' },
  contact_form: { bg: '#fefce8', color: '#ca8a04', label: 'Contact' },
}

const statusColors = {
  new: { bg: '#f3f4f6', color: '#6b7280', label: 'New' },
  reviewed: { bg: '#fef3c7', color: '#d97706', label: 'Reviewed' },
  resolved: { bg: '#dcfce7', color: '#16a34a', label: 'Resolved' },
}

function ManagerFeedback({ buildingName }) {
  const { userProfile, isDemoMode } = useAuth()
  const [feedbackList, setFeedbackList] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const loadFeedback = async () => {
      if (isDemoMode) {
        setFeedbackList([
          { id: '1', category: 'feature_request', subject: 'Add dark mode option', message: 'It would be great to have a dark mode for the manager dashboard, especially for late-night building management.', status: 'reviewed', created_at: new Date(Date.now() - 86400000 * 2).toISOString() },
          { id: '2', category: 'bug', subject: 'Resident count off by one', message: 'The dashboard shows 24 residents but the roster page shows 25. Might be a counting issue with the building manager account.', status: 'new', created_at: new Date(Date.now() - 86400000 * 5).toISOString() },
          { id: '3', category: 'general_feedback', subject: 'Love the AI assistant', message: 'Just wanted to say the AI assistant has been incredibly helpful for generating FAQ answers. Great feature!', status: 'resolved', created_at: new Date(Date.now() - 86400000 * 10).toISOString() },
        ])
        setLoading(false)
        return
      }

      try {
        const data = await getUserFeedback(userProfile?.id)
        setFeedbackList(data)
      } catch (err) {
        console.error('[ManagerFeedback] Error loading feedback:', err)
      } finally {
        setLoading(false)
      }
    }
    loadFeedback()
  }, [isDemoMode, userProfile])

  const handleNewFeedback = () => {
    setShowModal(true)
  }

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div className="manager-feedback">
      <div className="manager-feedback-header">
        <div>
          <h2 className="manager-feedback-title">Help & Feedback</h2>
          <p className="manager-feedback-subtitle">Your submissions and history</p>
        </div>
        <button className="manager-feedback-new-btn" onClick={handleNewFeedback}>
          <MessageSquarePlus size={18} />
          <span>New Feedback</span>
        </button>
      </div>

      {loading ? (
        <div className="manager-feedback-loading">Loading...</div>
      ) : feedbackList.length === 0 ? (
        <div className="manager-feedback-empty">
          <MessageSquarePlus size={48} />
          <h3>No feedback submitted yet</h3>
          <p>We'd love to hear from you! Report bugs, suggest features, or ask questions.</p>
          <button className="manager-feedback-new-btn" onClick={handleNewFeedback}>
            Send Feedback
          </button>
        </div>
      ) : (
        <div className="manager-feedback-list">
          {feedbackList.map(item => {
            const cat = categoryColors[item.category] || categoryColors.general_feedback
            const stat = statusColors[item.status] || statusColors.new
            const isExpanded = expandedId === item.id

            return (
              <div key={item.id} className={`manager-feedback-row ${isExpanded ? 'expanded' : ''}`}>
                <button className="manager-feedback-row-header" onClick={() => setExpandedId(isExpanded ? null : item.id)}>
                  <span className="manager-feedback-date">{formatDate(item.created_at)}</span>
                  <span className="manager-feedback-cat-badge" style={{ background: cat.bg, color: cat.color }}>
                    {cat.label}
                  </span>
                  <span className="manager-feedback-subject">{item.subject || 'No subject'}</span>
                  <span className="manager-feedback-status-badge" style={{ background: stat.bg, color: stat.color }}>
                    {stat.label}
                  </span>
                  {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {isExpanded && (
                  <div className="manager-feedback-detail">
                    <p>{item.message}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      <FeedbackModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false)
          // Refresh list after submission
          if (!isDemoMode && userProfile?.id) {
            getUserFeedback(userProfile.id).then(setFeedbackList).catch(() => {})
          }
        }}
        userProfile={userProfile}
        buildingName={buildingName}
        isDemoMode={isDemoMode}
        pageContext="manager_feedback_page"
      />
    </div>
  )
}

export default ManagerFeedback
