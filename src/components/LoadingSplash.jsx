import { useState, useEffect } from 'react'
import { Building2 } from 'lucide-react'
import './LoadingSplash.css'

function LoadingSplash({ theme = 'warm', message = 'Loading your building...', fadeOut = false, onContinue }) {
  const [showSlowMessage, setShowSlowMessage] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSlowMessage(true), 8000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={`loading-splash ${theme} ${fadeOut ? 'fade-out' : ''}`}>
      <div className="loading-splash-content">
        <div className="loading-splash-icon">
          <Building2 size={48} />
        </div>
        <h1 className="loading-splash-brand">COMMUNITY</h1>
        <p className="loading-splash-message">{message}</p>

        {/* Skeleton cards hint at the dashboard layout */}
        <div className="loading-skeleton">
          <div className="skeleton-bar skeleton-bar-wide"></div>
          <div className="skeleton-row">
            <div className="skeleton-card"></div>
            <div className="skeleton-card"></div>
          </div>
          <div className="skeleton-bar skeleton-bar-narrow"></div>
        </div>

        {showSlowMessage && (
          <>
            <p className="loading-splash-slow">Taking longer than usual...</p>
            {onContinue && (
              <button className="loading-splash-continue" onClick={onContinue}>
                Tap here to continue
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default LoadingSplash
