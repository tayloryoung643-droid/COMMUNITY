import { useState, useEffect } from 'react'
import { Package, Calendar, Users, ChevronRight, MessageSquare, X, Image, Send, Check, Cloud, Sun, CloudRain, Snowflake, Moon, Home as HomeIcon, Wine, Building2 } from 'lucide-react'
import './Home.css'

function Home({ buildingCode, onNavigate }) {
  const floor = "12"
  const userUnit = "1201"

  // Contact Manager modal state
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactForm, setContactForm] = useState({
    subject: 'Maintenance Request',
    message: '',
    hasPhoto: false
  })
  const [showContactSuccess, setShowContactSuccess] = useState(false)

  const subjectOptions = [
    'Maintenance Request',
    'Question',
    'Complaint',
    'Feedback',
    'Other'
  ]

  // Weather data (simulated - would come from weather API)
  const [currentTime, setCurrentTime] = useState(new Date())
  const weatherData = {
    temp: 58,
    condition: 'clear',
    conditionText: 'Mostly Clear'
  }

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getWeatherIcon = (condition) => {
    const hour = currentTime.getHours()
    const isNight = hour >= 18 || hour < 6
    if (isNight) return Moon
    switch (condition) {
      case 'clear':
      case 'sunny': return Sun
      case 'cloudy': return Cloud
      case 'rainy': return CloudRain
      case 'snowy': return Snowflake
      default: return Sun
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const WeatherIcon = getWeatherIcon(weatherData.condition)

  const handleContactSubmit = () => {
    if (contactForm.message.trim()) {
      // For now, just show success - would send email later
      setShowContactModal(false)
      setShowContactSuccess(true)
      setContactForm({ subject: 'Maintenance Request', message: '', hasPhoto: false })
      setTimeout(() => setShowContactSuccess(false), 3000)
    }
  }

  const handleFeatureClick = (featureTitle) => {
    if (onNavigate) {
      onNavigate(featureTitle)
    }
  }

  return (
    <div className="home-page">
      {/* Single centered app container for perfect alignment */}
      <div className="app-container">
        {/* Hero Section with Building Image */}
        <section className="hero-section">
          <div className="hero-image-container">
            {/* Warm luxury building image */}
            <img
              src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800"
              alt="The Paramount Building"
              className="hero-image"
            />
            <div className="hero-warm-overlay"></div>
            <div className="hero-gradient-overlay"></div>

            {/* Weather Widget - Top Left */}
            <div className="weather-widget">
              <div className="weather-datetime">
                {formatDay(currentTime)} | {formatTime(currentTime)}
              </div>
              <div className="weather-temp-row">
                <WeatherIcon size={20} className="weather-icon" />
                <span className="weather-temp">{weatherData.temp}°</span>
              </div>
              <div className="weather-condition">{weatherData.conditionText}</div>
            </div>

            {/* Building Name - Centered in Hero */}
            <div className="hero-text-container">
              <span className="hero-the">The</span>
              <h1 className="hero-building-name">Paramount</h1>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="main-content">
        {/* Today at The Paramount */}
        <section className="today-section">
          <h2 className="section-title">Today at The Paramount</h2>

          <button className="today-card" onClick={() => handleFeatureClick('Packages')}>
            <div className="today-card-icon package-icon">
              <Package size={20} />
            </div>
            <div className="today-card-content">
              <span className="today-card-title">3 deliveries ready for pickup</span>
              <span className="today-card-subtitle">Today</span>
            </div>
            <span className="today-card-time">9:00 AM</span>
          </button>

          <button className="today-card" onClick={() => handleFeatureClick('Calendar')}>
            <div className="today-card-icon calendar-icon">
              <Calendar size={20} />
            </div>
            <div className="today-card-content">
              <span className="today-card-title">Rooftop BBQ</span>
              <span className="today-card-subtitle">Tonight · 6:00 PM</span>
            </div>
            <span className="today-card-time">Tonight · 6:00 PM</span>
          </button>
        </section>

        {/* Coming Up - quieter, secondary */}
        <section className="coming-up-section">
          <h2 className="section-title-secondary">Coming Up</h2>

          <button className="event-card" onClick={() => handleFeatureClick('Calendar')}>
            <div className="event-card-icon wine-icon">
              <Wine size={20} />
            </div>
            <div className="event-card-content">
              <span className="event-card-title">Wine & Cheese Social</span>
              <span className="event-card-subtitle">7:00 PM · Rooftop Lounge</span>
            </div>
            <ChevronRight size={20} className="event-card-arrow" />
          </button>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions-section">
          <button className="action-card" onClick={() => handleFeatureClick('Packages')}>
            <div className="action-card-icon">
              <Package size={22} />
            </div>
            <div className="action-card-content">
              <span className="action-card-title">Manage Deliveries</span>
              <span className="action-card-subtitle">Track and arrange pickups</span>
            </div>
            <ChevronRight size={20} className="action-card-arrow" />
          </button>

          <button className="action-card" onClick={() => handleFeatureClick('Community')}>
            <div className="action-card-icon">
              <MessageSquare size={22} />
            </div>
            <div className="action-card-content">
              <span className="action-card-title">Connect with Neighbors</span>
              <span className="action-card-subtitle">Chat, buy & sell, & share updates</span>
            </div>
            <ChevronRight size={20} className="action-card-arrow" />
          </button>
        </section>
        </main>

        {/* Bottom Navigation - Inside app container for alignment */}
        <nav className="bottom-nav">
          <button className="nav-tab active" onClick={() => handleFeatureClick('Home')}>
            <HomeIcon size={22} />
            <span>Home</span>
          </button>
          <button className="nav-tab" onClick={() => handleFeatureClick('Calendar')}>
            <Calendar size={22} />
            <span>Events</span>
          </button>
          <button className="nav-tab" onClick={() => handleFeatureClick('Community')}>
            <MessageSquare size={22} />
            <span>Community</span>
          </button>
          <button className="nav-tab" onClick={() => handleFeatureClick('Building')}>
            <Building2 size={22} />
            <span>Building</span>
          </button>
        </nav>
      </div>

      {/* Contact Manager Modal */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="contact-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Contact Building Manager</h2>
              <button className="modal-close" onClick={() => setShowContactModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="contact-form-group">
                <label className="contact-label">Subject</label>
                <select
                  className="contact-select"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                >
                  {subjectOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="contact-form-group">
                <label className="contact-label">Message</label>
                <textarea
                  className="contact-textarea"
                  placeholder="Describe your issue or question..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={5}
                />
              </div>
              <div className="contact-form-group">
                <button
                  className={`attach-photo-btn ${contactForm.hasPhoto ? 'has-photo' : ''}`}
                  onClick={() => setContactForm(prev => ({ ...prev, hasPhoto: !prev.hasPhoto }))}
                >
                  <Image size={18} />
                  <span>{contactForm.hasPhoto ? 'Photo attached' : 'Attach Photo (optional)'}</span>
                  {contactForm.hasPhoto && <Check size={16} className="check-icon" />}
                </button>
              </div>
              <div className="contact-unit-info">
                <span className="unit-label">From:</span>
                <span className="unit-value">Unit {userUnit}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setShowContactModal(false)}>
                Cancel
              </button>
              <button
                className="modal-submit"
                onClick={handleContactSubmit}
                disabled={!contactForm.message.trim()}
              >
                <Send size={18} />
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Success Toast */}
      {showContactSuccess && (
        <div className="contact-success-toast">
          <Check size={20} />
          <span>Message Sent!</span>
        </div>
      )}
    </div>
  )
}

export default Home
