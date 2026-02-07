import { useState, useEffect, useRef } from 'react'
import { Menu, X, Key, UserPlus, Sparkles, Search } from 'lucide-react'
import { validateBuildingCode } from './services/buildingService'
import { submitFeedback } from './services/feedbackService'
import './Login.css'

const features = [
  { icon: '📦', title: 'Package Tracking', desc: 'Get notified the moment your delivery arrives. No more guessing.' },
  { icon: '📅', title: 'Events & Calendar', desc: 'Building BBQs, maintenance schedules, and community meetups — all in one place.' },
  { icon: '💬', title: 'Community Feed', desc: 'Share recommendations, ask neighbors for help, or post building updates.' },
  { icon: '🏢', title: 'Building Info', desc: 'FAQs, documents, elevator booking, and building rules at your fingertips.' },
  { icon: '👋', title: 'Meet Your Neighbors', desc: 'Put faces to door numbers. Connect with people in your building.' },
  { icon: '📋', title: 'Bulletin Board', desc: 'Selling furniture? Need a dog walker? Post it for your building to see.' },
]

const managerFeatures = [
  { icon: '👥', title: 'Resident Management', desc: 'Full building roster, invite tracking, and resident engagement at a glance.' },
  { icon: '📢', title: 'Announcements', desc: 'Post building-wide updates that every resident sees immediately.' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Smart tools for FAQ generation, mass invites, and building communications.' },
  { icon: '📊', title: 'Dashboard & Analytics', desc: 'See who\'s engaged, track packages, and monitor building activity.' },
]

function Login({ onResidentLogin, onManagerLogin, onRegisterClick, onDemoLogin, onResidentSignupClick, onResidentEmailLogin, authError }) {
  // Auth state
  const [activeTab, setActiveTab] = useState('resident')
  const [authMode, setAuthMode] = useState('signin')
  const [buildingCode, setBuildingCode] = useState('')
  const [residentEmail, setResidentEmail] = useState('')
  const [residentPassword, setResidentPassword] = useState('')
  const [managerEmail, setManagerEmail] = useState('')
  const [managerPassword, setManagerPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // UI state
  const [showContact, setShowContact] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Contact form state
  const [contactName, setContactName] = useState('')
  const [contactEmail, setContactEmail] = useState('')
  const [contactRole, setContactRole] = useState("I'm a resident")
  const [contactMessage, setContactMessage] = useState('')
  const [contactSending, setContactSending] = useState(false)
  const [contactSent, setContactSent] = useState(false)

  // Scroll animation
  const animateRefs = useRef([])
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )
    animateRefs.current.forEach(el => { if (el) observer.observe(el) })
    return () => observer.disconnect()
  }, [])

  const addAnimateRef = (el) => {
    if (el && !animateRefs.current.includes(el)) {
      animateRefs.current.push(el)
    }
  }

  // Smooth scroll helper
  const scrollTo = (id) => {
    setMobileMenuOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  // Clear error on input change
  const clearError = () => { if (error) setError('') }

  // === AUTH HANDLERS (preserved from original Login.jsx) ===

  const handleResidentEmailLogin = async () => {
    if (!residentEmail.trim()) { setError('Please enter your email'); return }
    if (!residentPassword.trim()) { setError('Please enter your password'); return }
    setError('')
    setIsLoading(true)
    const result = await onResidentEmailLogin(residentEmail, residentPassword)
    setIsLoading(false)
    if (result?.error) {
      setError(result.error.message || 'Login failed. Please check your credentials.')
    }
  }

  const handleResidentCodeLogin = async () => {
    if (!buildingCode.trim()) { setError('Please enter a building code'); return }
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
    if (!managerEmail.trim()) { setError('Please enter your email'); return }
    if (!managerPassword.trim()) { setError('Please enter your password'); return }
    setError('')
    setIsLoading(true)
    const result = await onManagerLogin(managerEmail, managerPassword)
    setIsLoading(false)
    if (result?.error) {
      setError(result.error.message || 'Login failed. Please check your credentials.')
    }
  }

  // Contact form submit
  const handleContactSubmit = async () => {
    if (!contactName.trim() || !contactEmail.trim() || !contactMessage.trim()) return
    setContactSending(true)
    try {
      await submitFeedback({
        userName: contactName,
        userEmail: contactEmail,
        userRole: contactRole,
        category: 'contact_form',
        message: contactMessage,
        pageContext: 'landing_page',
      })
      setContactSent(true)
    } catch (err) {
      console.error('Contact form error:', err)
    } finally {
      setContactSending(false)
    }
  }

  return (
    <div className="landing-page">
      {/* Background */}
      <div className="landing-bg" />
      <div className="landing-bg-pattern" />

      {/* ===== NAV BAR ===== */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <div className="landing-logo">
            <span className="landing-logo-icon">🏠</span>
            <span className="landing-logo-text">COMMUNITY</span>
          </div>
          <div className="landing-nav-links">
            <button className="landing-nav-link" onClick={() => scrollTo('features')}>Features</button>
            <button className="landing-nav-link" onClick={() => scrollTo('managers')}>For Managers</button>
            <button className="landing-nav-contact-btn" onClick={() => setShowContact(true)}>Contact Us</button>
            <button className="landing-nav-signin" onClick={() => scrollTo('auth-section')}>Sign In</button>
          </div>
          <button className="landing-hamburger" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
        <div className={`landing-mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
          <button className="landing-mobile-menu-link" onClick={() => scrollTo('features')}>Features</button>
          <button className="landing-mobile-menu-link" onClick={() => scrollTo('managers')}>For Managers</button>
          <button className="landing-mobile-menu-link" onClick={() => { setMobileMenuOpen(false); setShowContact(true) }}>Contact Us</button>
          <button className="landing-mobile-menu-link" onClick={() => scrollTo('auth-section')}>Sign In</button>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-left">
            <div className="landing-badge">
              <span className="landing-badge-dot" />
              Now available for your building
            </div>
            <h1 className="landing-hero-title">
              Your building,<br />
              <span className="landing-hero-title-accent">finally connected.</span>
            </h1>
            <p className="landing-hero-subtitle">
              COMMUNITY is the app that brings your apartment building to life.
              Track packages, discover events, connect with neighbors, and stay
              in the loop — all from one beautiful app your building manager sets up for you.
            </p>
            <div className="landing-hero-ctas">
              <button className="landing-btn-primary" onClick={() => { setActiveTab('resident'); setAuthMode('join'); scrollTo('auth-section') }}>
                Join Your Building →
              </button>
              <button className="landing-btn-secondary" onClick={() => scrollTo('managers')}>
                I'm a Building Manager
              </button>
            </div>
            <div className="landing-trust-row">
              <span>🔒 Private & secure</span>
              <span className="landing-trust-divider">·</span>
              <span>🏢 Managed by your building</span>
              <span className="landing-trust-divider">·</span>
              <span>📱 Works on any device</span>
            </div>
          </div>

          {/* Phone Mockup */}
          <div className="landing-hero-right">
            <div className="landing-phone-frame">
              <div className="landing-phone-notch" />
              <div className="landing-phone-screen">
                <div className="landing-phone-header">
                  <div className="landing-phone-weather">
                    <div className="landing-phone-weather-time">Saturday | 9:30 AM</div>
                    <div className="landing-phone-weather-temp">58°</div>
                    <div className="landing-phone-weather-cond">Mostly Clear</div>
                  </div>
                  <div className="landing-phone-building">The George</div>
                </div>
                <div className="landing-phone-body">
                  <div className="landing-phone-section-label">TODAY AT THE GEORGE</div>
                  <div className="landing-phone-card">
                    <span>📦</span>
                    <div>
                      <div className="landing-phone-card-title">2 deliveries ready</div>
                      <div className="landing-phone-card-sub">Today</div>
                    </div>
                    <span className="landing-phone-card-arrow">›</span>
                  </div>
                  <div className="landing-phone-card landing-phone-card-bulletin">
                    <span>📋</span>
                    <div>
                      <div className="landing-phone-card-title">Bulletin Board</div>
                      <div className="landing-phone-card-sub">5 active listings</div>
                    </div>
                    <span className="landing-phone-card-arrow">›</span>
                  </div>
                  <div className="landing-phone-card">
                    <span>📅</span>
                    <div>
                      <div className="landing-phone-card-title">Rooftop BBQ</div>
                      <div className="landing-phone-card-sub">This Saturday, 4 PM</div>
                    </div>
                    <span className="landing-phone-card-arrow">›</span>
                  </div>
                  <div className="landing-phone-post">
                    <div className="landing-phone-post-header">
                      <div className="landing-phone-mini-avatar">F</div>
                      <span className="landing-phone-post-author">Faima</span>
                      <span className="landing-phone-post-role">· Management</span>
                    </div>
                    <div className="landing-phone-post-title">Welcome to COMMUNITY! 🎉</div>
                    <div className="landing-phone-post-preview">We're excited to launch this app for The George...</div>
                  </div>
                </div>
                <div className="landing-phone-nav">
                  <div className="landing-phone-nav-item"><span>🏠</span><span className="landing-phone-nav-label">Home</span></div>
                  <div className="landing-phone-nav-item"><span>📅</span><span className="landing-phone-nav-label">Events</span></div>
                  <div className="landing-phone-nav-item"><span>💬</span><span className="landing-phone-nav-label">Community</span></div>
                  <div className="landing-phone-nav-item"><span>🏢</span><span className="landing-phone-nav-label">Building</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section className="landing-how-it-works landing-animate" ref={addAnimateRef}>
        <div className="landing-section-header">
          <h2 className="landing-section-title">Get started in 3 steps</h2>
        </div>
        <div className="landing-steps">
          <div className="landing-step">
            <div className="landing-step-number"><Key size={22} /></div>
            <div className="landing-step-title">Get your code</div>
            <div className="landing-step-desc">Your building manager will share a building code with you</div>
          </div>
          <div className="landing-step">
            <div className="landing-step-number"><UserPlus size={22} /></div>
            <div className="landing-step-title">Sign up & join</div>
            <div className="landing-step-desc">Create your account and enter the code to join your building</div>
          </div>
          <div className="landing-step">
            <div className="landing-step-number"><Sparkles size={22} /></div>
            <div className="landing-step-title">You're in!</div>
            <div className="landing-step-desc">Start getting package alerts, seeing events, and connecting with neighbors</div>
          </div>
        </div>
        <div className="landing-center-cta">
          <button className="landing-btn-primary" onClick={() => { setActiveTab('resident'); setAuthMode('join'); scrollTo('auth-section') }}>
            Join Your Building →
          </button>
        </div>
      </section>

      {/* ===== FEATURES (RESIDENTS) ===== */}
      <section id="features" className="landing-features">
        <div className="landing-features-inner landing-animate" ref={addAnimateRef}>
          <div className="landing-section-header">
            <div className="landing-section-badge">For Residents</div>
            <h2 className="landing-section-title">Everything your building needs,<br />in your pocket.</h2>
            <p className="landing-section-subtitle">
              No more missed packages. No more outdated bulletin boards. No more not knowing your neighbors.
            </p>
          </div>
          <div className="landing-feature-grid">
            {features.map((f, i) => (
              <div key={i} className="landing-feature-card">
                <div className="landing-feature-icon">{f.icon}</div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="landing-center-cta">
            <button className="landing-btn-primary" onClick={() => onDemoLogin('resident')}>
              Try the Resident Demo →
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOR MANAGERS ===== */}
      <section id="managers" className="landing-managers">
        <div className="landing-managers-inner landing-animate" ref={addAnimateRef}>
          <div className="landing-section-header">
            <div className="landing-section-badge">For Property Managers</div>
            <h2 className="landing-section-title">Manage smarter.<br />Engage effortlessly.</h2>
            <p className="landing-section-subtitle">
              COMMUNITY gives you a premium dashboard to manage residents, packages, communications, and building operations — powered by AI.
            </p>
          </div>

          <div className="landing-pain-points">
            <div className="landing-pain-point">"Stop fielding the same questions over and over."</div>
            <div className="landing-pain-point">"Stop chasing residents about package pickups."</div>
            <div className="landing-pain-point">"Stop pinning notices that nobody reads."</div>
          </div>

          <div className="landing-manager-grid">
            {managerFeatures.map((f, i) => (
              <div key={i} className="landing-manager-card">
                <div className="landing-feature-icon">{f.icon}</div>
                <h3 className="landing-feature-title">{f.title}</h3>
                <p className="landing-feature-desc">{f.desc}</p>
              </div>
            ))}
          </div>

          <div className="landing-section-header" style={{ marginBottom: 0 }}>
            <p className="landing-section-subtitle" style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
              Set up your building in under 10 minutes
            </p>
          </div>
          <div className="landing-setup-steps">
            <div className="landing-setup-step"><span className="landing-setup-step-num">1</span> Register your building</div>
            <div className="landing-setup-step"><span className="landing-setup-step-num">2</span> Upload your resident list</div>
            <div className="landing-setup-step"><span className="landing-setup-step-num">3</span> Residents start joining</div>
          </div>

          <div className="landing-testimonial">
            <p className="landing-testimonial-text">
              "Built for property managers who want happier residents and smoother operations."
            </p>
          </div>

          <div className="landing-manager-ctas">
            <button className="landing-btn-manager-primary" onClick={() => { setActiveTab('manager'); setAuthMode('signin'); scrollTo('auth-section') }}>
              Set Up Your Building →
            </button>
            <button className="landing-btn-manager-secondary" onClick={() => onDemoLogin('manager')}>
              Try the Manager Demo →
            </button>
          </div>
        </div>
      </section>

      {/* ===== AUTH SECTION ===== */}
      <section id="auth-section" className="landing-auth">
        <div className="landing-auth-card landing-animate" ref={addAnimateRef}>
          <div className="landing-auth-logo">🏠</div>
          <h2 className="landing-auth-title">
            {authMode === 'signin' ? 'Welcome back' : 'Join your building'}
          </h2>

          {/* Role Toggle */}
          <div className="landing-role-toggle">
            <button
              className={`landing-role-btn ${activeTab === 'resident' ? 'active' : ''}`}
              onClick={() => { setActiveTab('resident'); clearError() }}
            >
              🏠 I'm a Resident
            </button>
            <button
              className={`landing-role-btn ${activeTab === 'manager' ? 'active' : ''}`}
              onClick={() => { setActiveTab('manager'); setAuthMode('signin'); clearError() }}
            >
              🏢 I Manage a Building
            </button>
          </div>

          {/* Auth Mode Toggle (resident only) */}
          {activeTab === 'resident' && (
            <div className="landing-auth-mode">
              <button
                className={`landing-auth-mode-btn ${authMode === 'signin' ? 'active' : ''}`}
                onClick={() => { setAuthMode('signin'); clearError() }}
              >
                Sign In
              </button>
              <button
                className={`landing-auth-mode-btn ${authMode === 'join' ? 'active' : ''}`}
                onClick={() => { setAuthMode('join'); clearError() }}
              >
                Join Building
              </button>
            </div>
          )}

          {/* Error */}
          {(error || authError) && (
            <div className="landing-auth-error">{error || authError}</div>
          )}

          {/* Resident Sign-In Form */}
          {activeTab === 'resident' && authMode === 'signin' && (
            <div className="landing-auth-form">
              <div className="landing-input-group">
                <label className="landing-input-label">Email</label>
                <input
                  type="email"
                  className="landing-input"
                  placeholder="you@email.com"
                  value={residentEmail}
                  onChange={(e) => { setResidentEmail(e.target.value); clearError() }}
                />
              </div>
              <div className="landing-input-group">
                <label className="landing-input-label">Password</label>
                <input
                  type="password"
                  className="landing-input"
                  placeholder="••••••••"
                  value={residentPassword}
                  onChange={(e) => { setResidentPassword(e.target.value); clearError() }}
                  onKeyDown={(e) => e.key === 'Enter' && handleResidentEmailLogin()}
                />
              </div>
              <button className="landing-auth-submit" onClick={handleResidentEmailLogin} disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In →'}
              </button>
              <div className="landing-auth-footer">
                Don't have an account?{' '}
                <button className="landing-auth-link" onClick={() => setAuthMode('join')}>
                  Join your building →
                </button>
              </div>
            </div>
          )}

          {/* Resident Join Form */}
          {activeTab === 'resident' && authMode === 'join' && (
            <div className="landing-auth-form">
              <div className="landing-input-group">
                <label className="landing-input-label">Building Code</label>
                <input
                  type="text"
                  className="landing-input"
                  placeholder="Enter code from your building manager"
                  value={buildingCode}
                  onChange={(e) => { setBuildingCode(e.target.value.toUpperCase()); clearError() }}
                  onKeyDown={(e) => e.key === 'Enter' && handleResidentCodeLogin()}
                />
                <span className="landing-input-helper">Get this code from your property manager</span>
              </div>
              <button className="landing-auth-submit" onClick={handleResidentCodeLogin} disabled={isLoading}>
                {isLoading ? 'Joining...' : 'Join Building →'}
              </button>
              <div className="landing-auth-divider"><span>or</span></div>
              <button className="landing-find-building-btn" onClick={onResidentSignupClick}>
                <Search size={16} />
                <span>Find my building by address</span>
              </button>
              <div className="landing-auth-footer">
                Already have an account?{' '}
                <button className="landing-auth-link" onClick={() => setAuthMode('signin')}>
                  Sign in →
                </button>
              </div>
            </div>
          )}

          {/* Manager Form */}
          {activeTab === 'manager' && (
            <div className="landing-auth-form">
              <div className="landing-input-group">
                <label className="landing-input-label">Email</label>
                <input
                  type="email"
                  className="landing-input"
                  placeholder="you@email.com"
                  value={managerEmail}
                  onChange={(e) => { setManagerEmail(e.target.value); clearError() }}
                />
              </div>
              <div className="landing-input-group">
                <label className="landing-input-label">Password</label>
                <input
                  type="password"
                  className="landing-input"
                  placeholder="••••••••"
                  value={managerPassword}
                  onChange={(e) => { setManagerPassword(e.target.value); clearError() }}
                  onKeyDown={(e) => e.key === 'Enter' && handleManagerLogin()}
                />
              </div>
              <button className="landing-auth-submit" onClick={handleManagerLogin} disabled={isLoading}>
                {isLoading ? 'Signing in...' : 'Sign In →'}
              </button>
              <div className="landing-auth-footer">
                Don't have a building yet?{' '}
                <button className="landing-auth-link" onClick={onRegisterClick}>
                  Register your building →
                </button>
              </div>
            </div>
          )}

          {/* Demo Buttons */}
          <div className="landing-demo-section">
            <button className="landing-demo-btn" onClick={() => onDemoLogin('resident')} disabled={isLoading}>
              <Sparkles size={14} />
              Try as Resident →
            </button>
            <button className="landing-demo-btn" onClick={() => onDemoLogin('manager')} disabled={isLoading}>
              <Sparkles size={14} />
              Try as Manager →
            </button>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div>
            <div className="landing-footer-logo">
              <span style={{ fontSize: 16 }}>🏠</span>
              <span className="landing-footer-logo-text">COMMUNITY</span>
            </div>
            <p className="landing-footer-tagline">Making apartment living better, together.</p>
          </div>
          <div className="landing-footer-links">
            <button className="landing-footer-link" onClick={() => setShowContact(true)}>Contact Us</button>
            <button className="landing-footer-link" onClick={() => scrollTo('features')}>Features</button>
            <button className="landing-footer-link" onClick={() => scrollTo('managers')}>For Managers</button>
          </div>
        </div>
        <div className="landing-footer-bottom">
          © 2026 COMMUNITY · Private & Secure · Built in Vancouver 🇨🇦
        </div>
      </footer>

      {/* ===== CONTACT MODAL ===== */}
      {showContact && (
        <div className="landing-modal-overlay" onClick={() => setShowContact(false)}>
          <div className="landing-contact-modal" onClick={(e) => e.stopPropagation()}>
            <button className="landing-modal-close" onClick={() => setShowContact(false)}>✕</button>
            <h2 className="landing-contact-title">Get in Touch</h2>
            <p className="landing-contact-subtitle">
              Questions about COMMUNITY? Interested in bringing it to your building? We'd love to hear from you.
            </p>

            <div className="landing-contact-options">
              <div className="landing-contact-option">
                <div className="landing-contact-option-icon">📧</div>
                <div>
                  <div className="landing-contact-option-title">Email Us</div>
                  <div className="landing-contact-option-desc">hello@communityhq.space</div>
                </div>
              </div>
              <div className="landing-contact-option">
                <div className="landing-contact-option-icon">🏢</div>
                <div>
                  <div className="landing-contact-option-title">Building Managers</div>
                  <div className="landing-contact-option-desc">Want to set up COMMUNITY for your building? Let's talk.</div>
                </div>
              </div>
              <div className="landing-contact-option">
                <div className="landing-contact-option-icon">💡</div>
                <div>
                  <div className="landing-contact-option-title">Feature Requests</div>
                  <div className="landing-contact-option-desc">Have an idea? We build based on what our users need.</div>
                </div>
              </div>
            </div>

            {contactSent ? (
              <div className="landing-contact-success">
                ✓ Message sent! We'll get back to you soon.
              </div>
            ) : (
              <div className="landing-contact-form">
                <input
                  className="landing-contact-input"
                  placeholder="Your name"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
                <input
                  className="landing-contact-input"
                  placeholder="Your email"
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
                <select
                  className="landing-contact-input"
                  value={contactRole}
                  onChange={(e) => setContactRole(e.target.value)}
                >
                  <option>I'm a resident</option>
                  <option>I'm a building manager</option>
                  <option>I'm interested in COMMUNITY for my building</option>
                  <option>Other</option>
                </select>
                <textarea
                  className="landing-contact-input landing-contact-textarea"
                  placeholder="Your message..."
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                />
                <button
                  className="landing-contact-submit"
                  onClick={handleContactSubmit}
                  disabled={contactSending || !contactName.trim() || !contactEmail.trim() || !contactMessage.trim()}
                >
                  {contactSending ? 'Sending...' : 'Send Message →'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default Login
