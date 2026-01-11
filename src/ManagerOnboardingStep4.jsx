import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Building2,
  Users,
  FileText,
  Copy,
  Mail,
  Sparkles,
  Rocket,
  Send,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import './ManagerOnboardingStep4.css'

function ManagerOnboardingStep4({ onBack, onLaunch, onSkip, initialData }) {
  const [sendTestEmail, setSendTestEmail] = useState(false)
  const [codeCopied, setCodeCopied] = useState(false)
  const [isSending, setIsSending] = useState(false)

  // Extract data from previous steps
  const buildingName = initialData?.building?.name || 'Your Building'
  const buildingCode = initialData?.building?.code || 'BUILDING'
  const managerName = initialData?.manager?.name || 'Property Manager'

  // Count FAQ items
  const faqCount = initialData?.faq
    ? Object.values(initialData.faq).reduce((acc, cat) => acc + cat.items.length, 0)
    : 0

  // Count residents
  const residentCount = initialData?.residents
    ? initialData.residents.valid.length + initialData.residents.needsReview.length
    : 0

  const readyResidentCount = initialData?.residents?.valid?.length || 0

  // Copy building code to clipboard
  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(buildingCode)
      setCodeCopied(true)
      setTimeout(() => setCodeCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Handle send invites
  const handleSendInvites = async () => {
    setIsSending(true)

    // Simulate sending emails
    await new Promise(resolve => setTimeout(resolve, 2000))

    setIsSending(false)
    onLaunch({
      ...initialData,
      invitesSent: true,
      inviteCount: readyResidentCount
    })
  }

  // Handle skip to dashboard
  const handleSkipToDashboard = () => {
    onSkip({
      ...initialData,
      invitesSent: false
    })
  }

  // Handle go back to import residents
  const handleGoBackToImport = () => {
    onBack()
  }

  return (
    <div className="onboarding-container">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      {/* Header */}
      <header className="onboarding-header">
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="header-spacer"></div>
      </header>

      {/* Progress Indicator */}
      <div className="progress-section">
        <div className="progress-indicator">
          <div className="progress-step completed">
            <div className="step-number"><Check size={16} /></div>
            <span className="step-label">Details</span>
          </div>
          <div className="progress-line completed"></div>
          <div className="progress-step completed">
            <div className="step-number"><Check size={16} /></div>
            <span className="step-label">FAQ</span>
          </div>
          <div className="progress-line completed"></div>
          <div className="progress-step completed">
            <div className="step-number"><Check size={16} /></div>
            <span className="step-label">Residents</span>
          </div>
          <div className="progress-line completed"></div>
          <div className="progress-step active">
            <div className="step-number">4</div>
            <span className="step-label">Launch</span>
          </div>
        </div>
        <p className="progress-text">Step 4 of 4</p>
      </div>

      {/* Main Content */}
      <main className="onboarding-content">
        <div className="onboarding-intro launch-intro">
          <div className="launch-icon">
            <Rocket size={32} />
          </div>
          <h1 className="onboarding-title">You're ready to launch!</h1>
          <p className="onboarding-subtitle">
            Invite your residents to join your building's community
          </p>
        </div>

        {/* Summary Card */}
        <div className="summary-card">
          <div className="summary-header">
            <div className="building-identity">
              <div className="building-logo-placeholder">
                <Building2 size={24} />
              </div>
              <div className="building-details">
                <h2 className="building-name">{buildingName}</h2>
                <span className="manager-label">Managed by {managerName}</span>
              </div>
            </div>
          </div>

          <div className="building-code-display">
            <span className="code-label">Your building code</span>
            <div className="code-box">
              <span className="code-value">{buildingCode}</span>
              <button className="copy-btn" onClick={copyCode}>
                {codeCopied ? <Check size={18} /> : <Copy size={18} />}
                {codeCopied ? 'Copied!' : 'Copy'}
              </button>
            </div>
          </div>

          <div className="setup-stats">
            <div className={`stat-item ${faqCount > 0 ? 'ready' : 'pending'}`}>
              <FileText size={18} />
              <span>
                {faqCount > 0 ? `${faqCount} FAQ items ready` : 'No FAQ yet'}
              </span>
              {faqCount > 0 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            </div>
            <div className={`stat-item ${residentCount > 0 ? 'ready' : 'pending'}`}>
              <Users size={18} />
              <span>
                {residentCount > 0 ? `${readyResidentCount} residents ready to invite` : 'No residents imported'}
              </span>
              {residentCount > 0 ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
            </div>
          </div>
        </div>

        {/* Invite Preview Section */}
        {residentCount > 0 && (
          <div className="invite-preview-section">
            <h3 className="section-title">
              <Mail size={18} />
              Preview invite email
            </h3>

            <div className="email-preview">
              <div className="email-header">
                <div className="email-subject">
                  <span className="subject-label">Subject:</span>
                  <span className="subject-text">You're invited to join {buildingName} on Community</span>
                </div>
              </div>

              <div className="email-body">
                <p className="email-greeting">Hi <span className="placeholder">[Resident Name]</span>!</p>
                <p className="email-text">
                  {managerName} from <strong>{buildingName}</strong> has invited you to join your building's community on Community.
                </p>
                <p className="email-text">
                  Connect with neighbors, track packages, book elevators, and stay updated on building news.
                </p>
                <div className="email-cta">
                  <div className="fake-button">Join Your Building</div>
                </div>
                <div className="email-code">
                  <span>Your building code: </span>
                  <strong>{buildingCode}</strong>
                </div>
              </div>
            </div>

            <p className="preview-note">
              <Sparkles size={14} />
              Emails will be personalized with each resident's name
            </p>
          </div>
        )}

        {/* Action Section */}
        <div className="action-section">
          {residentCount > 0 ? (
            <>
              <div className="primary-action">
                <button
                  className={`launch-btn ${isSending ? 'sending' : ''}`}
                  onClick={handleSendInvites}
                  disabled={isSending}
                >
                  {isSending ? (
                    <>
                      <Send size={20} className="sending-icon" />
                      Sending invites...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Send Invites to {readyResidentCount} Residents
                    </>
                  )}
                </button>

                <label className="test-email-option">
                  <input
                    type="checkbox"
                    checked={sendTestEmail}
                    onChange={(e) => setSendTestEmail(e.target.checked)}
                  />
                  <span>Send me a test email first</span>
                </label>
              </div>
            </>
          ) : (
            <div className="no-residents-message">
              <AlertCircle size={24} />
              <h3>You haven't imported any residents yet</h3>
              <p>Go back to import your resident list, or skip and add them later from your dashboard.</p>
              <div className="no-residents-actions">
                <button className="go-back-btn" onClick={handleGoBackToImport}>
                  <ArrowLeft size={18} />
                  Go back and import residents
                </button>
              </div>
            </div>
          )}

          {/* Divider */}
          <div className="divider">
            <span>OR</span>
          </div>

          {/* Manual Share Option */}
          <div className="manual-share">
            <h3>Share your building code manually</h3>
            <div className="share-code-box">
              <span className="share-code">{buildingCode}</span>
              <button className="copy-btn-large" onClick={copyCode}>
                {codeCopied ? <Check size={20} /> : <Copy size={20} />}
                {codeCopied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>
            <p className="share-note">
              Share this code with residents - they can join anytime at <strong>community-app.com</strong>
            </p>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <button className="back-link" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Step 3
          </button>

          <div className="nav-right">
            <button className="skip-link" onClick={handleSkipToDashboard}>
              Skip for now
            </button>
            <button className="dashboard-btn" onClick={handleSkipToDashboard}>
              Go to Dashboard
              <ArrowRight size={20} />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ManagerOnboardingStep4
