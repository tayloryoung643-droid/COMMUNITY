import { useState } from 'react'
import { X, Copy, Check, ExternalLink } from 'lucide-react'
import './CalendarSyncModal.css'

function CalendarSyncModal({ isOpen, onClose, buildingId, buildingName }) {
  const [copied, setCopied] = useState(false)

  if (!isOpen) return null

  const baseUrl = window.location.origin
  const icsUrl = `${baseUrl}/api/calendar/${buildingId}`
  const webcalUrl = icsUrl.replace('https://', 'webcal://').replace('http://', 'webcal://')

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(icsUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea')
      textarea.value = icsUrl
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand('copy')
      document.body.removeChild(textarea)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="calendar-sync-modal" onClick={(e) => e.stopPropagation()}>
        <div className="sync-modal-header">
          <h2>Sync to Calendar</h2>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="sync-modal-body">
          <p className="sync-description">
            Subscribe to <strong>{buildingName || 'your building'}</strong> events in your favorite calendar app. New events will appear automatically.
          </p>

          <div className="calendar-url-field">
            <input
              type="text"
              readOnly
              value={icsUrl}
              onClick={(e) => e.target.select()}
            />
            <button className="copy-url-btn" onClick={handleCopy}>
              {copied ? <Check size={16} /> : <Copy size={16} />}
              <span>{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>

          <div className="sync-instructions">
            <div className="sync-instruction-section">
              <h4>Google Calendar</h4>
              <ol>
                <li>Open Google Calendar on desktop</li>
                <li>Click the <strong>+</strong> next to "Other calendars"</li>
                <li>Select <strong>"From URL"</strong></li>
                <li>Paste the link above and click <strong>"Add calendar"</strong></li>
              </ol>
            </div>

            <div className="sync-instruction-section">
              <h4>Apple Calendar</h4>
              <ol>
                <li>Click the button below, or</li>
                <li>Open Calendar &rarr; File &rarr; <strong>New Calendar Subscription</strong></li>
                <li>Paste the link above</li>
              </ol>
            </div>

            <div className="sync-instruction-section">
              <h4>Outlook</h4>
              <ol>
                <li>Go to Outlook Calendar on the web</li>
                <li>Click <strong>"Add calendar"</strong> &rarr; <strong>"Subscribe from web"</strong></li>
                <li>Paste the link above</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="sync-action-buttons">
          <a
            href={webcalUrl}
            className="sync-btn sync-btn-primary"
          >
            <ExternalLink size={16} />
            <span>Open in Apple Calendar</span>
          </a>
          <button className="sync-btn sync-btn-secondary" onClick={handleCopy}>
            <Copy size={16} />
            <span>{copied ? 'Copied!' : 'Copy Link'}</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default CalendarSyncModal
