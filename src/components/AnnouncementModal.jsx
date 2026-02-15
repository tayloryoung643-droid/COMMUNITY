import { useState, useEffect } from 'react'
import { Megaphone, X, Image, Bell, Send, Mail } from 'lucide-react'
import { createPost, getPosts } from '../services/communityPostService'
import { getAnnouncementEmailRecipients, sendAnnouncementEmails } from '../services/announcementEmailService'
import './AnnouncementModal.css'

const CATEGORIES = [
  { value: 'general', label: 'General' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'event', label: 'Event' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'reminder', label: 'Reminder' }
]

function AnnouncementModal({ isOpen, onClose, onSuccess, userProfile, isInDemoMode }) {
  const [form, setForm] = useState({
    title: '',
    message: '',
    category: 'general',
    sendNotification: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sendEmail, setSendEmail] = useState(true)
  const [emailRecipients, setEmailRecipients] = useState(null)

  // Load email recipient counts when modal opens (non-demo only)
  useEffect(() => {
    if (!isOpen) {
      // Reset email toggle on close so it defaults to ON next open
      setSendEmail(true)
      setEmailRecipients(null)
      return
    }
    if (isInDemoMode || !userProfile?.building_id) return

    getAnnouncementEmailRecipients(userProfile.building_id, userProfile.id)
      .then(result => setEmailRecipients(result))
      .catch(err => console.error('[AnnouncementModal] Error loading email recipients:', err))
  }, [isOpen, isInDemoMode, userProfile?.building_id, userProfile?.id])

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const resetForm = () => {
    setForm({
      title: '',
      message: '',
      category: 'general',
      sendNotification: true
    })
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.message.trim()) return

    setIsSubmitting(true)

    if (isInDemoMode) {
      // Demo mode: just close and call success
      const newAnnouncement = {
        id: `a${Date.now()}`,
        type: 'announcement',
        title: form.title.trim(),
        text: form.message.trim(),
        author: 'Property Manager',
        unit: 'Management',
        timestamp: Date.now(),
        likes: 0,
        comments: 0,
        pinned: false,
        category: form.category
      }
      resetForm()
      onClose()
      if (onSuccess) onSuccess(newAnnouncement)
      setIsSubmitting(false)
    } else {
      // Real mode: save to Supabase
      try {
        const content = `${form.title.trim()}\n\n${form.message.trim()}`
        await createPost({
          building_id: userProfile.building_id,
          user_id: userProfile.id,
          content,
          is_announcement: true
        })

        // Fire-and-forget: send emails if toggled on and we have recipients
        let emailSentTo = 0
        if (sendEmail && emailRecipients?.recipients?.length > 0) {
          emailSentTo = emailRecipients.recipients.length
          sendAnnouncementEmails(emailRecipients.recipients, {
            title: form.title.trim(),
            message: form.message.trim(),
            category: form.category,
            buildingName: userProfile.building_name || 'Your Building',
            managerName: userProfile.full_name || 'Your building manager',
            buildingId: userProfile.building_id
          }).catch(err => console.error('[AnnouncementModal] Email send error:', err))
        }

        resetForm()
        onClose()
        if (onSuccess) onSuccess({ emailSentTo })
      } catch (err) {
        console.error('[AnnouncementModal] Error creating announcement:', err)
        alert('Failed to post announcement. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="announcement-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-header-left">
            <Megaphone size={20} />
            <h2>Post Building Announcement</h2>
          </div>
          <button className="modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label htmlFor="announcement-title">Title *</label>
            <input
              id="announcement-title"
              type="text"
              placeholder="Announcement title..."
              value={form.title}
              onChange={(e) => handleChange('title', e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="announcement-message">Message *</label>
            <textarea
              id="announcement-message"
              placeholder="Write your announcement..."
              rows={4}
              value={form.message}
              onChange={(e) => handleChange('message', e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="announcement-category">Category</label>
              <select
                id="announcement-category"
                value={form.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Attach Image</label>
              <button className="attach-btn" type="button">
                <Image size={18} />
                <span>Add Image</span>
              </button>
            </div>
          </div>

          <div className="form-checkbox">
            <input
              type="checkbox"
              id="send-notification"
              checked={form.sendNotification}
              onChange={(e) => handleChange('sendNotification', e.target.checked)}
            />
            <label htmlFor="send-notification">
              <Bell size={16} />
              <span>Send push notification to all residents</span>
            </label>
          </div>

          {!isInDemoMode && emailRecipients && emailRecipients.recipients.length > 0 && (
            <div className="form-checkbox">
              <input
                type="checkbox"
                id="send-email"
                checked={sendEmail}
                onChange={(e) => setSendEmail(e.target.checked)}
              />
              <label htmlFor="send-email">
                <Mail size={16} />
                <span>Send email to all residents</span>
              </label>
              {sendEmail && (
                <p className="email-helper-text">
                  Sends to {emailRecipients.recipients.length} resident{emailRecipients.recipients.length !== 1 ? 's' : ''}
                  {emailRecipients.invitedCount > 0 && (
                    <> — including {emailRecipients.invitedCount} who haven't joined the app yet</>
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!form.title.trim() || !form.message.trim() || isSubmitting}
          >
            <Send size={18} />
            <span>{isSubmitting ? 'Posting...' : 'Post Announcement'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default AnnouncementModal
