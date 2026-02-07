import { useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Sparkles
} from 'lucide-react'
import ResidentImporter from './ResidentImporter'
import './ManagerOnboardingStep3.css'

function ManagerOnboardingStep3({ onBack, onContinue, onSkip, initialData }) {
  // Track residents parsed by ResidentImporter
  const [residents, setResidents] = useState(initialData?.residents || null)

  const handleResidentsReady = (parsed) => {
    setResidents(parsed)
  }

  const handleContinue = () => {
    onContinue({
      ...initialData,
      residents
    })
  }

  const handleSkip = () => {
    onSkip({
      ...initialData,
      residents: null
    })
  }

  const readyCount = residents ? residents.filter(r => r.selected && r.hasEmail).length : 0

  return (
    <div className="onboarding-container">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

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
          <div className="progress-step active">
            <div className="step-number">3</div>
            <span className="step-label">Residents</span>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-number">4</div>
            <span className="step-label">Launch</span>
          </div>
        </div>
        <p className="progress-text">Step 3 of 4</p>
      </div>

      {/* Main Content */}
      <main className="onboarding-content">
        <div className="onboarding-intro">
          <div className="ai-badge">
            <Sparkles size={16} />
            <span>AI-Powered</span>
          </div>
          <h1 className="onboarding-title">Import your residents</h1>
          <p className="onboarding-subtitle">
            Paste your resident list in any format - or skip this and add residents later from your dashboard
          </p>
        </div>

        {/* ResidentImporter - no buildingId since building isn't created yet */}
        <ResidentImporter
          onResidentsReady={handleResidentsReady}
        />

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <button className="back-link" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Step 2
          </button>

          <div className="nav-right">
            <button className="skip-link" onClick={handleSkip}>
              Skip for now
            </button>
            {residents && residents.length > 0 && (
              <button className="continue-btn" onClick={handleContinue}>
                Continue with {readyCount} residents
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ManagerOnboardingStep3
