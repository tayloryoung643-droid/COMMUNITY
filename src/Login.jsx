import { useState, useEffect, useRef, useCallback } from 'react'
import { Menu, X, Search, UserPlus, Sparkles, MapPin, Building2, Users, ArrowRight, Loader2 } from 'lucide-react'
import { searchBuildingsByAddress } from './services/buildingService'
import { submitFeedback } from './services/feedbackService'
import './Login.css'

const features = [
  { icon: '📢', title: 'Instant Announcements', desc: 'Building updates that reach every resident instantly. No more printed notices that nobody reads.' },
  { icon: '💬', title: 'Community Feed', desc: 'Share recommendations, ask neighbors for help, or celebrate building wins together.' },
  { icon: '👋', title: 'Meet Your Neighbors', desc: 'Put faces to door numbers. Connect with the people who live around you.' },
  { icon: '📅', title: 'Events & Activities', desc: 'Building BBQs, game nights, maintenance schedules — with RSVPs and reminders built in.' },
  { icon: '📋', title: 'Bulletin Board', desc: 'Buy, sell, trade, and find services from people in your building you already trust.' },
  { icon: '🏢', title: 'Building Resources', desc: 'Packages, elevator booking, documents, and FAQs — everything your building needs, in one place.' },
]

const managerFeatures = [
  { icon: '📢', title: 'Communication Hub', desc: 'Post building-wide updates that every resident sees. One place instead of emails, notices, and texts.' },
  { icon: '👥', title: 'Resident Engagement', desc: 'Build a community where residents know each other. Happy residents stay longer.' },
  { icon: '🤖', title: 'AI Assistant', desc: 'Handles routine questions so you don\'t have to. Less admin, more time for what matters.' },
  { icon: '📊', title: 'Dashboard & Insights', desc: 'See who\'s engaged, track building activity, and understand your community at a glance.' },
]

function Login({ onResidentLogin, onManagerLogin, onRegisterClick, onDemoLogin, onResidentSignupClick, onResidentSelectBuilding, onResidentCreateBuilding, onResidentEmailLogin, authError }) {
  // Auth state
  const [activeTab, setActiveTab] = useState('resident')
  const [authMode, setAuthMode] = useState('signin')
  const [residentEmail, setResidentEmail] = useState('')
  const [residentPassword, setResidentPassword] = useState('')
  const [managerEmail, setManagerEmail] = useState('')
  const [managerPassword, setManagerPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Address search state (replaces building code)
  const [addressQuery, setAddressQuery] = useState('')
  const [addressResults, setAddressResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

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

  // === ADDRESS SEARCH (debounced) ===
  const performAddressSearch = useCallback(async (query) => {
    if (!query.trim() || query.length < 3) {
      setAddressResults([])
      setHasSearched(false)
      return
    }
    setIsSearching(true)
    try {
      const results = await searchBuildingsByAddress(query)
      setAddressResults(results)
      setHasSearched(true)
    } catch (err) {
      console.error('Address search error:', err)
      setAddressResults([])
      setHasSearched(true)
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => performAddressSearch(addressQuery), 300)
    return () => clearTimeout(timer)
  }, [addressQuery, performAddressSearch])

  // === AUTH HANDLERS ===

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

  const handleSelectBuilding = (building) => {
    onResidentSelectBuilding(building)
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

      {/* ===== MYSTERY HERO — Full-screen first impression ===== */}
      <section className="mystery-hero">
        <div className="mystery-hero-inner">
          <div className="mystery-hero-logo mystery-fade mystery-fade-1">
            <svg className="mystery-hero-logo-icon" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg" width="44" height="44">
              <rect x="10" y="12" width="16" height="24" rx="1.5" fill="#8B7E74" opacity="0.7"/>
              <rect x="22" y="6" width="12" height="30" rx="1.5" fill="#6B5E52" opacity="0.8"/>
              <rect x="13" y="16" width="3" height="3" rx="0.5" fill="#F5F0EB" opacity="0.9"/>
              <rect x="19" y="16" width="3" height="3" rx="0.5" fill="#F5F0EB" opacity="0.9"/>
              <rect x="13" y="22" width="3" height="3" rx="0.5" fill="#F5F0EB" opacity="0.9"/>
              <rect x="19" y="22" width="3" height="3" rx="0.5" fill="#F5F0EB" opacity="0.9"/>
              <rect x="13" y="28" width="3" height="3" rx="0.5" fill="#F5F0EB" opacity="0.7"/>
              <rect x="19" y="28" width="3" height="3" rx="0.5" fill="#F5F0EB" opacity="0.7"/>
              <rect x="25" y="10" width="3" height="3" rx="0.5" fill="#F5F0EB" opacity="0.9"/>
              <rect x="25" y="16" width="3" height="3" rx="0.5" fill="#F5F0EB" opacity="0.9"/>
              <rect x="25" y="22" width="3" height="3" rx="0.5" fill="#F5F0EB" opacity="0.9"/>
              <rect x="25" y="28" width="3" height="3" rx="0.5" fill="#F5F0EB" opacity="0.7"/>
              <rect x="31" y="10" width="1.5" height="3" rx="0.5" fill="#F5F0EB" opacity="0.6"/>
              <rect x="31" y="16" width="1.5" height="3" rx="0.5" fill="#F5F0EB" opacity="0.6"/>
              <rect x="31" y="22" width="1.5" height="3" rx="0.5" fill="#F5F0EB" opacity="0.6"/>
              <rect x="13" y="16" width="3" height="3" rx="0.5" fill="#C8A84E" opacity="0.5"/>
              <rect x="25" y="16" width="3" height="3" rx="0.5" fill="#C8A84E" opacity="0.4"/>
              <line x1="6" y1="36" x2="38" y2="36" stroke="#8B7E74" strokeWidth="0.5" opacity="0.3"/>
            </svg>
            <span className="mystery-hero-logo-text">COMMUNITY</span>
          </div>
          <h1 className="mystery-hero-tagline mystery-fade mystery-fade-2">
            Fall in love with<br />
            <span className="mystery-hero-accent">where you live.</span>
          </h1>
          <button
            className="mystery-hero-btn mystery-fade mystery-fade-3"
            onClick={() => scrollTo('hero-content')}
          >
            Get Started
          </button>
        </div>
        <div className="mystery-scroll-hint mystery-fade mystery-fade-4" onClick={() => scrollTo('hero-content')}>
          <div className="mystery-scroll-arrow" />
        </div>
      </section>

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
      <section id="hero-content" className="landing-hero">
        <div className="landing-hero-content">
          <div className="landing-hero-left">
            <div className="landing-badge">
              <span className="landing-badge-dot" />
              Now available for your building
            </div>
            <h1 className="landing-hero-title">
              Turn neighbors into<br />
              <span className="landing-hero-title-accent">a community.</span>
            </h1>
            <p className="landing-hero-subtitle">
              One place for building announcements, events, neighbor connections,
              and everything happening in your building.
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
                  <div className="landing-phone-post">
                    <div className="landing-phone-post-header">
                      <div className="landing-phone-mini-avatar">F</div>
                      <span className="landing-phone-post-author">Faima</span>
                      <span className="landing-phone-post-role">· Management</span>
                    </div>
                    <div className="landing-phone-post-title">Welcome to COMMUNITY! 🎉</div>
                    <div className="landing-phone-post-preview">We're excited to launch this app for The George...</div>
                  </div>
                  <div className="landing-phone-card">
                    <span>📅</span>
                    <div>
                      <div className="landing-phone-card-title">Rooftop BBQ</div>
                      <div className="landing-phone-card-sub">This Saturday, 4 PM</div>
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
                    <span>📦</span>
                    <div>
                      <div className="landing-phone-card-title">2 deliveries ready</div>
                      <div className="landing-phone-card-sub">Today</div>
                    </div>
                    <span className="landing-phone-card-arrow">›</span>
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
            <div className="landing-step-number"><Search size={22} /></div>
            <div className="landing-step-title">Find your building</div>
            <div className="landing-step-desc">Search for your building by address or start a new community</div>
          </div>
          <div className="landing-step">
            <div className="landing-step-number"><UserPlus size={22} /></div>
            <div className="landing-step-title">Sign up & join</div>
            <div className="landing-step-desc">Create your account and join your building in seconds</div>
          </div>
          <div className="landing-step">
            <div className="landing-step-number"><Sparkles size={22} /></div>
            <div className="landing-step-title">You're in!</div>
            <div className="landing-step-desc">Discover events, connect with neighbors, and stay in the loop</div>
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
              No more outdated bulletin boards. No more not knowing your neighbors. Finally, one app that makes your building feel like home.
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
            <h2 className="landing-section-title">Build community.<br />Not just manage a building.</h2>
            <p className="landing-section-subtitle">
              COMMUNITY gives you a premium dashboard to engage residents, streamline communication, and create a building people actually love living in.
            </p>
          </div>

          <div className="landing-pain-points">
            <div className="landing-pain-point">"Stop pinning notices that nobody reads."</div>
            <div className="landing-pain-point">"Stop chasing residents across email, texts, and paper."</div>
            <div className="landing-pain-point">"Stop wondering if residents even know each other."</div>
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
              "Buildings with engaged residents have lower turnover, fewer complaints, and a reputation people want to be part of."
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

          {/* Resident Join Form — Address Search */}
          {activeTab === 'resident' && authMode === 'join' && (
            <div className="landing-auth-form">
              <div className="landing-input-group">
                <label className="landing-input-label">Find your building</label>
                <div className="landing-search-input-wrapper">
                  <MapPin size={16} className="landing-search-icon" />
                  <input
                    type="text"
                    className="landing-input landing-input-with-icon"
                    placeholder="Search by address or building name..."
                    value={addressQuery}
                    onChange={(e) => { setAddressQuery(e.target.value); clearError() }}
                    autoFocus
                  />
                  {isSearching && <Loader2 size={16} className="landing-search-spinner" />}
                </div>
                <span className="landing-input-helper">Start typing to search (min 3 characters)</span>
              </div>

              {/* Search Results */}
              {!isSearching && addressResults.length > 0 && (
                <div className="landing-search-results">
                  {addressResults.map((building) => {
                    const isResidentLed = building.building_mode === 'resident_only'
                    return (
                      <button
                        key={building.id}
                        className="landing-search-result-card"
                        onClick={() => handleSelectBuilding(building)}
                      >
                        <div className="landing-result-left">
                          <Building2 size={18} className="landing-result-icon" />
                          <div className="landing-result-info">
                            <span className="landing-result-name">{building.name}</span>
                            <span className="landing-result-address">{building.address}</span>
                          </div>
                        </div>
                        <div className="landing-result-right">
                          <span className={`landing-result-badge ${isResidentLed ? 'community' : 'managed'}`}>
                            {isResidentLed ? 'Community' : 'Managed'}
                          </span>
                          {building.resident_count > 0 && (
                            <span className="landing-result-count">
                              <Users size={12} /> {building.resident_count}
                            </span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Create Building CTA — always visible once searching */}
              {!isSearching && hasSearched && addressQuery.length >= 3 && (
                <button className="landing-create-building-card" onClick={() => onResidentCreateBuilding(addressQuery)}>
                  <div className="landing-create-card-inner">
                    <Building2 size={20} />
                    <div>
                      <span className="landing-create-title">Can't find your building?</span>
                      <span className="landing-create-desc">Register it →</span>
                    </div>
                    <ArrowRight size={16} />
                  </div>
                </button>
              )}

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
            <a className="landing-footer-link" href="/terms" target="_blank" rel="noopener noreferrer">Terms of Service</a>
            <a className="landing-footer-link" href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a>
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
