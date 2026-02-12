import { useState } from 'react'
import { X, Send, MessageSquare, HelpCircle, Flag } from 'lucide-react'
import { createPost } from '../services/communityPostService'
import './PostModal.css'

const POST_TYPES = [
  { type: 'share', label: 'Share', icon: MessageSquare, color: '#3b82f6' },
  { type: 'ask', label: 'Ask', icon: HelpCircle, color: '#8b5cf6' },
  { type: 'report', label: 'Report', icon: Flag, color: '#ef4444' },
]

const PLACEHOLDERS = {
  share: "What's on your mind? Share with your neighbors...",
  ask: 'What would you like to ask your neighbors?',
  report: 'What would you like to report?'
}

function PostModal({ isOpen, onClose, onSuccess, userProfile, isInDemoMode }) {
  const [postType, setPostType] = useState('share')
  const [postText, setPostText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setPostType('share')
    setPostText('')
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    if (!postText.trim()) return

    setIsSubmitting(true)

    if (isInDemoMode) {
      const demoPost = {
        id: Date.now(),
        type: postType,
        text: postText.trim(),
        author: 'You',
        unit: 'Unit 1201',
        timestamp: Date.now(),
        likes: 0,
        comments: 0
      }
      resetForm()
      onClose()
      if (onSuccess) onSuccess(demoPost)
      setIsSubmitting(false)
    } else {
      try {
        await createPost({
          building_id: userProfile.building_id,
          user_id: userProfile.id,
          type: postType,
          content: postText.trim()
        })
        resetForm()
        onClose()
        if (onSuccess) onSuccess()
      } catch (err) {
        console.error('[PostModal] Error creating post:', err)
        alert('Failed to create post. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="post-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Post</h3>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="post-type-selector">
          {POST_TYPES.map(pt => {
            const IconComponent = pt.icon
            return (
              <button
                key={pt.type}
                className={`post-type-btn ${postType === pt.type ? 'active' : ''}`}
                onClick={() => setPostType(pt.type)}
                style={{
                  background: postType === pt.type ? `${pt.color}15` : 'transparent',
                  borderColor: postType === pt.type ? pt.color : 'rgba(200, 185, 165, 0.2)'
                }}
              >
                <IconComponent size={16} style={{ color: pt.color }} />
                <span>{pt.label}</span>
              </button>
            )
          })}
        </div>

        <div className="modal-body">
          <textarea
            className="post-textarea"
            placeholder={PLACEHOLDERS[postType]}
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={4}
            autoFocus
          />
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!postText.trim() || isSubmitting}
          >
            <Send size={16} />
            {isSubmitting ? 'Posting...' : 'Post'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PostModal
