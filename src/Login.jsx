import { useState } from 'react'
import { Building2, User, Mail, Lock, ArrowRight } from 'lucide-react'
import './Login.css'

function Login({ onResidentLogin, onManagerLogin, onRegisterClick, onDemoLogin }) {
  const [activeTab, setActiveTab] = useState('resident')
  const [buildingCode, setBuildingCode] = useState('')
  const [managerEmail, setManagerEmail] = useState('')
  const [managerPassword, setManagerPassword] = useState('')
  const [error, setError] = useState('')

  const handleResidentLogin = () => {
    if (buildingCode.trim()) {
      onResidentLogin(buildingCode)
    } else {
      setError('Please enter a building code')
    }
  }

  const handleManagerLogin = () => {
    if (!managerEmail.trim()) {
      setError('Please enter your email')
      return
    }
    if (!managerPassword.trim()) {
      setError('Please enter your password')
      return
    }
    setError('')
    onManagerLogin(managerEmail, managerPassword)
  }

  const clearError = () => {
    if (error) setError('')
  }

  return (
    <div className="login-container">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <div className="login-card-glass">
        {/* Logo/Title */}
        <div className="login-header">
          <div className="login-logo">
            <Building2 size={32} />
          </div>
          <h1 className="login-title">Community</h1>
          <p className="login-tagline">Know your neighbors, finally.</p>
        </div>

        {/* Tab Selector */}
        <div className="login-tabs">
          <button
            className={`login-tab ${activeTab === 'resident' ? 'active' : ''}`}
            onClick={() => { setActiveTab('resident'); clearError() }}
          >
            <User size={18} />
            <span>I'm a Resident</span>
          </button>
          <button
            className={`login-tab ${activeTab === 'manager' ? 'active' : ''}`}
            onClick={() => { setActiveTab('manager'); clearError() }}
          >
            <Building2 size={18} />
            <span>I'm a Property Manager</span>
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="login-error">
            {error}
          </div>
        )}

        {/* Resident Form */}
        {activeTab === 'resident' && (
          <div className="login-form">
            <div className="form-group-glass">
              <label htmlFor="building-code">
                <Building2 size={16} />
                Building Code
              </label>
              <input
                id="building-code"
                type="text"
                placeholder="Enter your building code"
                value={buildingCode}
                onChange={(e) => { setBuildingCode(e.target.value); clearError() }}
                onKeyPress={(e) => e.key === 'Enter' && handleResidentLogin()}
              />
              <span className="input-helper">Get this code from your property manager</span>
            </div>

            <button className="login-btn-primary" onClick={handleResidentLogin}>
              Join Building
              <ArrowRight size={18} />
            </button>
          </div>
        )}

        {/* Manager Form */}
        {activeTab === 'manager' && (
          <div className="login-form">
            <div className="form-group-glass">
              <label htmlFor="manager-email">
                <Mail size={16} />
                Email
              </label>
              <input
                id="manager-email"
                type="email"
                placeholder="you@company.com"
                value={managerEmail}
                onChange={(e) => { setManagerEmail(e.target.value); clearError() }}
              />
            </div>

            <div className="form-group-glass">
              <label htmlFor="manager-password">
                <Lock size={16} />
                Password
              </label>
              <input
                id="manager-password"
                type="password"
                placeholder="Enter your password"
                value={managerPassword}
                onChange={(e) => { setManagerPassword(e.target.value); clearError() }}
                onKeyPress={(e) => e.key === 'Enter' && handleManagerLogin()}
              />
            </div>

            <button className="login-btn-primary" onClick={handleManagerLogin}>
              Sign In
              <ArrowRight size={18} />
            </button>

            <div className="login-register-link">
              <span>Don't have a building yet?</span>
              <button className="register-link" onClick={onRegisterClick}>
                Register your building
                <ArrowRight size={14} />
              </button>
            </div>

            <button className="demo-login-link" onClick={onDemoLogin}>
              Demo login (skip to dashboard)
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login
