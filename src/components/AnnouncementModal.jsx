import { useState } from 'react'
import { Megaphone, X, Image, Bell, Send } from 'lucide-react'
import { createPost, getPosts } from '../services/communityPostService'
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
        resetForm()
        onClose()
        if (onSuccess) onSuccess()
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
