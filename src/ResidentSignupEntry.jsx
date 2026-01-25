import { useState } from 'react'
import {
  Building2,
  Key,
  Search,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from 'lucide-react'
import './ResidentSignupEntry.css'

function ResidentSignupEntry({ onBack, onHaveCode, onFindBuilding, onDemoLogin }) {
  return (
    <div className="signup-entry-container">
      {/* Ambient Background */}
      <div className="bg-gradient"></div>

      {/* Floating Bokeh Shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
      </div>

      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <div className="signup-entry-content">
        {/* Back Button */}
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="signup-entry-card">
          {/* Header */}
          <div className="signup-entry-header">
            <div className="signup-entry-logo">
              <Building2 size={28} />
            </div>
            <h1 className="signup-entry-title">Join your building</h1>
            <p className="signup-entry-subtitle">
              Connect with your neighbors and access building services
            </p>
          </div>

          {/* Options */}
          <div className="signup-options">
            {/* Option 1: Have a code */}
            <button className="signup-option-card" onClick={onHaveCode}>
              <div className="option-icon">
                <Key size={24} />
              </div>
              <div className="option-content">
                <h3>I have an invitation code</h3>
                <p>Your property manager gave you a code to join</p>
              </div>
              <ArrowRight size={20} className="option-arrow" />
            </button>

            {/* Option 2: Find building */}
            <button className="signup-option-card" onClick={onFindBuilding}>
              <div className="option-icon">
                <Search size={24} />
              </div>
              <div className="option-content">
                <h3>Find my building</h3>
                <p>Search by your building address</p>
              </div>
              <ArrowRight size={20} className="option-arrow" />
            </button>
          </div>

          {/* Demo Login */}
          <button className="demo-login-btn" onClick={() => onDemoLogin('resident')}>
            <Sparkles size={14} />
            <span>Demo login (explore the app)</span>
          </button>

          {/* Trust Signal */}
          <p className="trust-signal">
            Private & secure | Your data stays with your building
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResidentSignupEntry
