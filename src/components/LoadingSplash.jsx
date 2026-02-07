import { useState, useEffect } from 'react'
import { Building2 } from 'lucide-react'
import './LoadingSplash.css'

function LoadingSplash({ theme = 'warm', message = 'Loading your building...', fadeOut = false }) {
  const [showSlowMessage, setShowSlowMessage] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSlowMessage(true), 5000)
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
        {showSlowMessage && (
          <p className="loading-splash-slow">Taking longer than usual...</p>
        )}
      </div>
    </div>
  )
}

export default LoadingSplash
