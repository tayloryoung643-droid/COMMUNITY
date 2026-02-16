import { useState } from 'react'
import { createPortal } from 'react-dom'
import { supabase } from './lib/supabase'
import { useAuth } from './contexts/AuthContext'
import GuidelinesContent from './components/GuidelinesContent'
import './CommunityGuidelinesAgreement.css'

function CommunityGuidelinesAgreement({ onAccepted }) {
  const { user, userProfile, isDemoMode, refreshUserProfile } = useAuth()
  const [agreed, setAgreed] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const handleJoin = async () => {
    if (!agreed) return
    setSubmitting(true)

    if (isDemoMode || userProfile?.is_demo) {
      // Demo mode — just proceed
      onAccepted()
      return
    }

    try {
      const userId = user?.id || userProfile?.id
      const { error } = await supabase
        .from('users')
        .update({ guidelines_accepted_at: new Date().toISOString() })
        .eq('id', userId)

      if (error) {
        console.error('[Guidelines] Error saving acceptance:', error)
        setSubmitting(false)
        return
      }

      await refreshUserProfile()
      onAccepted()
    } catch (err) {
      console.error('[Guidelines] Error:', err)
      setSubmitting(false)
    }
  }

  const content = (
    <div className="guidelines-agreement-overlay">
      <div className="guidelines-agreement-page">
        {/* Header */}
        <div className="guidelines-agreement-header">
          <span className="guidelines-brand">COMMUNITY</span>
          <h1>Welcome to Your Building</h1>
          <p>Before you dive in, here's how we keep this a great place for everyone.</p>
        </div>

        {/* Guidelines */}
        <div className="guidelines-agreement-body">
          <GuidelinesContent />

          {/* Checkbox */}
          <label className="guidelines-checkbox-label">
            <input
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
            />
            <span className="guidelines-checkbox-custom" />
            <span className="guidelines-checkbox-text">
              I've read and agree to follow these community guidelines. I understand that violations may result in content removal.
            </span>
          </label>

          {/* Join Button */}
          <button
            className={`guidelines-join-btn ${agreed ? 'enabled' : ''}`}
            onClick={handleJoin}
            disabled={!agreed || submitting}
          >
            {submitting ? 'Joining...' : 'Join Your Community →'}
          </button>

          <p className="guidelines-footer-note">
            You can review these anytime in Building → Community Guidelines
          </p>
        </div>
      </div>
    </div>
  )

  return createPortal(content, document.body)
}

export default CommunityGuidelinesAgreement
