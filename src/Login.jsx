import { useState } from 'react'
import { Building2, User, Mail, Lock, ArrowRight, Package, Calendar, Headphones, Sparkles, Search } from 'lucide-react'
import { validateBuildingCode } from './services/buildingService'
import './Login.css'

function Login({ onResidentLogin, onManagerLogin, onRegisterClick, onDemoLogin, onResidentSignupClick, authError }) {
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
        onResidentLogin(buildingCode, building)
      } else {
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
      {/* Ambient Background */}
      <div className="bg-gradient"></div>

      {/* Floating Bokeh Shapes */}
      <div className="floating-shapes">
        <div className="shape shape-1"></div>
        <div className="shape shape-2"></div>
        <div className="shape shape-3"></div>
        <div className="shape shape-4"></div>
        <div className="shape shape-5"></div>
        <div className="shape shape-6"></div>
      </div>

      {/* Background Orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <div className="login-content">
        <div className="login-card-glass">
          {/* App Logo & Branding */}
          <div className="login-header">
            <div className="login-logo">
              <Building2 size={32} />
            </div>
            <h1 className="login-title">Community</h1>
            <p className="login-tagline">
              Stay connected, manage your building, and get things done.
            </p>
          </div>

          {/* Role Toggle */}
          <div className="role-toggle">
            <button
              className={`role-btn ${activeTab === 'resident' ? 'active' : ''}`}
              onClick={() => { setActiveTab('resident'); clearError() }}
            >
              <User size={18} />
              <span>I'm a Resident</span>
            </button>
            <button
              className={`role-btn ${activeTab === 'manager' ? 'active' : ''}`}
              onClick={() => { setActiveTab('manager'); clearError() }}
            >
              <Building2 size={18} />
              <span>I manage this building</span>
            </button>
          </div>

          {/* Role Descriptions */}
          <div className="role-descriptions">
            <p className={`role-desc ${activeTab === 'resident' ? 'active' : ''}`}>
              Join your building and connect with neighbors
            </p>
            <p className={`role-desc ${activeTab === 'manager' ? 'active' : ''}`}>
              Manage residents, events, and building operations
            </p>
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
              <div className="input-group">
                <div className="input-wrapper">
                  <Building2 size={18} className="input-icon" />
                  <input
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
                <span>{isLoading ? 'Joining...' : 'Join Building'}</span>
                {!isLoading && <ArrowRight size={18} />}
              </button>

              <div className="signup-divider">
                <span>or</span>
              </div>

              <button className="find-building-btn" onClick={onResidentSignupClick}>
                <Search size={16} />
                <span>Find my building by address</span>
                <ArrowRight size={16} />
              </button>

              <button className="demo-login-btn" onClick={() => onDemoLogin('resident')} disabled={isLoading}>
                <Sparkles size={14} />
                <span>Demo login (skip to resident home)</span>
              </button>
            </div>
          )}

          {/* Manager Form */}
          {activeTab === 'manager' && (
            <div className="login-form">
              <div className="input-group">
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="Email address"
                    value={managerEmail}
                    onChange={(e) => { setManagerEmail(e.target.value); clearError() }}
                  />
                </div>
              </div>

              <div className="input-group">
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    placeholder="Password"
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

              <div className="register-prompt">
                <span>Don't have a building yet?</span>
                <button className="register-link" onClick={onRegisterClick}>
                  Register your building
                  <ArrowRight size={14} />
                </button>
              </div>

              <button className="demo-login-btn" onClick={() => onDemoLogin('manager')} disabled={isLoading}>
                <Sparkles size={14} />
                <span>Demo login (skip to dashboard)</span>
              </button>
            </div>
          )}

          {/* Value Props Row */}
          <div className="value-props">
            <div className="value-prop-item">
              <div className="value-prop-icon">
                <Package size={18} />
              </div>
              <span>Package<br/>Management</span>
            </div>
            <div className="value-prop-item">
              <div className="value-prop-icon">
                <Calendar size={18} />
              </div>
              <span>Community<br/>Events</span>
            </div>
            <div className="value-prop-item">
              <div className="value-prop-icon">
                <Headphones size={18} />
              </div>
              <span>Resident<br/>Support</span>
            </div>
          </div>

          {/* Trust Signal */}
          <p className="trust-signal">
            Managed by your building | Private & secure
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
