import { useState } from 'react'
import { Building2, User, Mail, Lock, ArrowRight, Package, Calendar, Users, Key, Sparkles } from 'lucide-react'
import { validateBuildingCode } from './services/buildingService'
import './Login.css'

function Login({ onResidentLogin, onManagerLogin, onRegisterClick, onDemoLogin, authError }) {
  const [activeTab, setActiveTab] = useState('resident')
  const [buildingCode, setBuildingCode] = useState('')
  const [managerEmail, setManagerEmail] = useState('')
  const [managerPassword, setManagerPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleResidentLogin = async () => {
    if (!buildingCode.trim()) {
      setError('Please enter a building code')
      return
    }

    setError('')
    setIsLoading(true)

    try {
      const { valid, building } = await validateBuildingCode(buildingCode)

      if (valid && building) {
        // Building code is valid - proceed with login
        onResidentLogin(buildingCode, building)
      } else {
        // Invalid building code
        setError('Invalid building code. Use the Demo login button to explore the app.')
      }
    } catch (err) {
      console.error('Error validating building code:', err)
      setError('Unable to verify building code. Please try again or use Demo login.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleManagerLogin = async () => {
    if (!managerEmail.trim()) {
      setError('Please enter your email')
      return
    }
    if (!managerPassword.trim()) {
      setError('Please enter your password')
      return
    }
    setError('')
    setIsLoading(true)
    const result = await onManagerLogin(managerEmail, managerPassword)
    setIsLoading(false)
    if (result?.error) {
      setError(result.error.message || 'Login failed. Please check your credentials.')
    }
  }

  const clearError = () => {
    if (error) setError('')
  }

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="bg-gradient"></div>
      <div className="bg-grid"></div>

      {/* Floating Shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
        <div className="shape shape-6"></div>
      </div>

      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <div className="login-content">
        <div className="login-card-glass">
          {/* Logo/Title */}
          <div className="login-header">
            <div className="login-logo">
              <Building2 size={36} />
              <div className="logo-glow"></div>
            </div>
            <h1 className="login-title">
              <span className="title-gradient">COMMUNITY</span>
            </h1>
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
          {(error || authError) && (
            <div className="login-error">
              {error || authError}
            </div>
          )}

          {/* Resident Form */}
          {activeTab === 'resident' && (
            <div className="login-form">
              <div className="form-group-glass">
                <label htmlFor="building-code">
                  <Key size={16} />
                  Building Code
                </label>
                <div className="input-wrapper">
                  <Building2 size={18} className="input-icon" />
                  <input
                    id="building-code"
                    type="text"
                    placeholder="Enter your building code"
                    value={buildingCode}
                    onChange={(e) => { setBuildingCode(e.target.value.toUpperCase()); clearError() }}
                    onKeyPress={(e) => e.key === 'Enter' && handleResidentLogin()}
                  />
                </div>
                <span className="input-helper">Get this code from your property manager</span>
              </div>

              <button className="login-btn-primary" onClick={handleResidentLogin} disabled={isLoading}>
                <span>{isLoading ? 'Verifying...' : 'Join Building'}</span>
                {!isLoading && <ArrowRight size={18} />}
              </button>

              <button className="demo-login-link" onClick={() => onDemoLogin('resident')} disabled={isLoading}>
                <Sparkles size={14} />
                Demo login (skip to resident home)
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
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    id="manager-email"
                    type="email"
                    placeholder="you@company.com"
                    value={managerEmail}
                    onChange={(e) => { setManagerEmail(e.target.value); clearError() }}
                  />
                </div>
              </div>

              <div className="form-group-glass">
                <label htmlFor="manager-password">
                  <Lock size={16} />
                  Password
                </label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    id="manager-password"
                    type="password"
                    placeholder="Enter your password"
                    value={managerPassword}
                    onChange={(e) => { setManagerPassword(e.target.value); clearError() }}
                    onKeyPress={(e) => e.key === 'Enter' && handleManagerLogin()}
                  />
                </div>
              </div>

              <button className="login-btn-primary" onClick={handleManagerLogin} disabled={isLoading}>
                <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
                {!isLoading && <ArrowRight size={18} />}
              </button>

              <div className="login-register-link">
                <span>Don't have a building yet?</span>
                <button className="register-link" onClick={onRegisterClick}>
                  Register your building
                  <ArrowRight size={14} />
                </button>
              </div>

              <button className="demo-login-link" onClick={() => onDemoLogin('manager')} disabled={isLoading}>
                <Sparkles size={14} />
                Demo login (skip to dashboard)
              </button>
            </div>
          )}
        </div>

        {/* Feature Highlights */}
        <div className="feature-highlights">
          <div className="feature-item">
            <div className="feature-icon">
              <Package size={20} />
            </div>
            <span>Track Packages</span>
          </div>
          <div className="feature-divider"></div>
          <div className="feature-item">
            <div className="feature-icon">
              <Calendar size={20} />
            </div>
            <span>Book Amenities</span>
          </div>
          <div className="feature-divider"></div>
          <div className="feature-item">
            <div className="feature-icon">
              <Users size={20} />
            </div>
            <span>Connect with Neighbors</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
