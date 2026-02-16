import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X, Flag, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { submitReport } from '../services/reportService'
import './ReportModal.css'

const REASONS = [
  'Harassment or bullying',
  'Hate speech or discrimination',
  'Spam or solicitation',
  'Privacy violation',
  'Other'
]

function ReportModal({ isOpen, onClose, contentType, contentId, onReported }) {
  const { user, userProfile, isDemoMode } = useAuth()
  const [selectedReason, setSelectedReason] = useState(null)
  const [details, setDetails] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  if (!isOpen) return null

  const handleSubmit = async () => {
    if (!selectedReason) return
    setSubmitting(true)

    const isInDemoMode = isDemoMode || userProfile?.is_demo

    if (isInDemoMode) {
      // Demo mode — just show success
      setSubmitted(true)
      setTimeout(() => {
        handleClose()
        if (onReported) onReported()
      }, 1500)
      setSubmitting(false)
      return
    }

    try {
      const reporterId = user?.id || userProfile?.id
      const buildingId = userProfile?.building_id
      await submitReport(buildingId, reporterId, contentType, contentId, selectedReason, selectedReason === 'Other' ? details : null)
      setSubmitted(true)
      setTimeout(() => {
        handleClose()
        if (onReported) onReported()
      }, 1500)
    } catch (err) {
      console.error('[ReportModal] Submit error:', err)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    setSelectedReason(null)
    setDetails('')
    setSubmitted(false)
    setSubmitting(false)
    onClose()
  }

  const label = contentType === 'comment' ? 'comment' : 'post'

  const content = (
    <div className="report-modal-overlay" onClick={handleClose}>
      <div className="report-modal" onClick={e => e.stopPropagation()}>
        {submitted ? (
          <div className="report-success">
            <CheckCircle size={40} />
            <h3>Report Submitted</h3>
            <p>Thanks for reporting. Your building manager will review this.</p>
          </div>
        ) : (
          <>
            <div className="report-modal-header">
              <div className="report-modal-title-row">
                <Flag size={18} />
                <h3>Report this {label}</h3>
              </div>
              <button className="report-modal-close" onClick={handleClose}>
                <X size={20} />
              </button>
            </div>

            <div className="report-modal-body">
              <p className="report-prompt">What's the issue?</p>
              <div className="report-reasons">
                {REASONS.map(reason => (
                  <button
                    key={reason}
                    className={`report-reason-btn ${selectedReason === reason ? 'selected' : ''}`}
                    onClick={() => setSelectedReason(reason)}
                  >
                    {reason}
                  </button>
                ))}
              </div>

              {selectedReason === 'Other' && (
                <textarea
                  className="report-details-input"
                  placeholder="Tell us what's wrong..."
                  value={details}
                  onChange={e => setDetails(e.target.value)}
                  rows={3}
                />
              )}
            </div>

            <div className="report-modal-footer">
              <button className="report-cancel-btn" onClick={handleClose}>
                Cancel
              </button>
              <button
                className="report-submit-btn"
                onClick={handleSubmit}
                disabled={!selectedReason || submitting}
              >
                {submitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export default ReportModal
