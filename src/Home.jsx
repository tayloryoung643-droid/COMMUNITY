import { useState, useEffect } from 'react'
import { Package, Calendar, Users, ChevronRight, X, Image, Send, Check, Cloud, Sun, CloudRain, Snowflake, Moon, HelpCircle, MessageSquare } from 'lucide-react'
import HamburgerMenu from './HamburgerMenu'
import { eventsData } from './eventsData'
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

  const unreadMessages = 2 // Simulated unread count

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

  // Hero image URL - used in BOTH the hero card AND the ambient background
  const heroImageUrl = "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80"

  // Get upcoming events from shared data
  const upcomingEvents = eventsData

  // Handler to open event detail
  const handleEventClick = (event) => {
    if (onNavigate) {
      onNavigate('EventDetail', event)
    }
  }

  // Today's community post - prioritize Ask, Help, Borrow, or New Resident posts
  // Only show posts created today
  const todayCommunityPost = {
    id: 99,
    type: 'ask',
    text: "Does anyone have a ladder I could borrow this weekend? Need to change some light bulbs in the high ceilings. Happy to return it Sunday evening!",
    author: 'Mike T.',
    unit: 'Unit 805',
    timestamp: Date.now() - 7200000, // 2 hours ago (today)
    likes: 2,
    comments: 3,
    commentsList: [
      { id: 991, author: 'Sarah M.', firstName: 'Sarah', unit: 'Unit 1201', text: 'I have a 6ft ladder you can borrow! DM me to arrange pickup.', timestamp: Date.now() - 6000000, replies: [] },
      { id: 992, author: 'Building Staff', firstName: 'Staff', unit: 'Management', text: 'We also have a ladder in the maintenance closet - ask the front desk!', timestamp: Date.now() - 5400000, replies: [] },
      { id: 993, author: 'Jennifer K.', firstName: 'Jennifer', unit: 'Unit 1504', text: 'I can help hold it steady if you need a hand!', timestamp: Date.now() - 3600000, replies: [] }
    ]
  }

  // Handler to open community post detail
  const handleCommunityPostClick = (post) => {
    if (onNavigate) {
      onNavigate('PostDetail', post)
    }
  }

  // Get post type badge info
  const getPostTypeBadge = (type) => {
    switch (type) {
      case 'ask':
        return { label: 'ASK', icon: HelpCircle, color: '#8b5cf6' }
      case 'share':
        return { label: 'SHARE', icon: MessageSquare, color: '#3b82f6' }
      default:
        return { label: type.toUpperCase(), icon: MessageSquare, color: '#6B7280' }
    }
  }

  return (
    <div
      className="home-page"
      style={{ '--hero-image': `url(${heroImageUrl})` }}
    >
      {/* Ambient background - real DOM element, same image as hero */}
      <div className="ambient-bg" aria-hidden="true" />

      {/* Single centered app container for perfect alignment */}
      <div className="app-container">
        {/* Hero Section with Building Image */}
        <section className="hero-section">
          <div className="hero-image-container">
            {/* THE SAME building image - sharp in the hero card */}
            <img
              src={heroImageUrl}
              alt="The Paramount Building"
              className="hero-image"
            />
            <div className="hero-warm-overlay"></div>
            <div className="hero-gradient-overlay"></div>

            {/* Hamburger Menu & Notification Bell */}
            <HamburgerMenu onNavigate={onNavigate} unreadMessages={unreadMessages} currentScreen="home" />

            {/* Weather Widget - Below top bar */}
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

          {/* Today's Community Post */}
          {todayCommunityPost && (
            <button className="today-card community-post-card" onClick={() => handleCommunityPostClick(todayCommunityPost)}>
              <div className="today-card-icon community-icon">
                {todayCommunityPost.author.charAt(0)}
              </div>
              <div className="today-card-content">
                <div className="community-post-header">
                  <span className="community-post-author">{todayCommunityPost.author}</span>
                  <span className="community-post-unit">{todayCommunityPost.unit}</span>
                  <span
                    className="community-post-badge"
                    style={{ background: `${getPostTypeBadge(todayCommunityPost.type).color}15`, color: getPostTypeBadge(todayCommunityPost.type).color }}
                  >
                    {getPostTypeBadge(todayCommunityPost.type).label}
                  </span>
                </div>
                <span className="today-card-subtitle community-post-preview">
                  {todayCommunityPost.text.length > 80
                    ? todayCommunityPost.text.substring(0, 80) + '...'
                    : todayCommunityPost.text}
                </span>
              </div>
            </button>
          )}
        </section>

        {/* Coming Up - scrollable list of all upcoming events */}
        <section className="coming-up-section">
          <h2 className="section-title-secondary">Coming Up</h2>

          <div className="events-scroll-container">
            {upcomingEvents.map((event) => {
              const IconComponent = event.icon
              return (
                <button key={event.id} className="event-card" onClick={() => handleEventClick(event)}>
                  <div className={`event-card-icon ${event.iconClass}`}>
                    <IconComponent size={20} />
                  </div>
                  <div className="event-card-content">
                    <span className="event-card-title">{event.title}</span>
                    <span className="event-card-subtitle">{event.subtitle}</span>
                  </div>
                  <ChevronRight size={20} className="event-card-arrow" />
                </button>
              )
            })}
          </div>
        </section>

                </main>

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
