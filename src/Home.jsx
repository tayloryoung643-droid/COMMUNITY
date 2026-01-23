import { useState, useEffect } from 'react'
import { Package, Calendar, Users, ChevronRight, MessageSquare, X, Image, Send, Check, Cloud, Sun, CloudRain, Snowflake, Moon, Home as HomeIcon, Wine, Building2, Wrench, Film, ShoppingBag, Music, Coffee, Dumbbell, TreeDeciduous, PartyPopper, Bell, Sparkles, Heart, Palette, BookOpen, Mic, Menu, Settings } from 'lucide-react'
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

  // Hamburger menu state
  const [menuOpen, setMenuOpen] = useState(false)
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

  // Upcoming events for the next 12 months
  const upcomingEvents = [
    { id: 1, title: 'Wine & Cheese Social', subtitle: 'Jan 25 · 7:00 PM · Rooftop Lounge', icon: Wine, iconClass: 'wine-icon' },
    { id: 2, title: 'Fire Alarm Testing', subtitle: 'Jan 28 · 10:00 AM - 2:00 PM', icon: Bell, iconClass: 'maintenance-icon' },
    { id: 3, title: 'Farmers Market Saturday', subtitle: 'Feb 1 · 9:00 AM · Front Plaza', icon: ShoppingBag, iconClass: 'market-icon' },
    { id: 4, title: 'Movie in the Park', subtitle: 'Feb 8 · 7:30 PM · Courtyard', icon: Film, iconClass: 'movie-icon' },
    { id: 5, title: 'Building Town Hall', subtitle: 'Feb 12 · 6:00 PM · Community Room', icon: Users, iconClass: 'community-icon' },
    { id: 6, title: 'Valentine\'s Day Mixer', subtitle: 'Feb 14 · 7:00 PM · Rooftop Lounge', icon: Heart, iconClass: 'social-icon' },
    { id: 7, title: 'Yoga in the Garden', subtitle: 'Feb 22 · 8:00 AM · Rooftop Garden', icon: Dumbbell, iconClass: 'fitness-icon' },
    { id: 8, title: 'Water Shut-off Notice', subtitle: 'Mar 1 · 9:00 AM - 12:00 PM · Floors 5-10', icon: Wrench, iconClass: 'maintenance-icon' },
    { id: 9, title: 'Spring Cleaning Drive', subtitle: 'Mar 8 · 10:00 AM · Lobby', icon: Sparkles, iconClass: 'community-icon' },
    { id: 10, title: 'St. Patrick\'s Day Party', subtitle: 'Mar 17 · 6:00 PM · Rooftop Lounge', icon: PartyPopper, iconClass: 'social-icon' },
    { id: 11, title: 'Coffee & Conversation', subtitle: 'Mar 22 · 9:00 AM · Café Lounge', icon: Coffee, iconClass: 'social-icon' },
    { id: 12, title: 'Art Show & Gallery Night', subtitle: 'Apr 5 · 6:00 PM · Community Room', icon: Palette, iconClass: 'culture-icon' },
    { id: 13, title: 'Easter Egg Hunt', subtitle: 'Apr 12 · 11:00 AM · Courtyard', icon: PartyPopper, iconClass: 'social-icon' },
    { id: 14, title: 'Elevator Maintenance', subtitle: 'Apr 18 · 8:00 AM - 5:00 PM', icon: Wrench, iconClass: 'maintenance-icon' },
    { id: 15, title: 'Earth Day Tree Planting', subtitle: 'Apr 22 · 10:00 AM · Rooftop Garden', icon: TreeDeciduous, iconClass: 'outdoor-icon' },
    { id: 16, title: 'Live Jazz Night', subtitle: 'May 3 · 7:00 PM · Rooftop Lounge', icon: Music, iconClass: 'music-icon' },
    { id: 17, title: 'Cinco de Mayo Fiesta', subtitle: 'May 5 · 6:00 PM · Courtyard', icon: PartyPopper, iconClass: 'social-icon' },
    { id: 18, title: 'Mother\'s Day Brunch', subtitle: 'May 11 · 11:00 AM · Community Room', icon: Heart, iconClass: 'social-icon' },
    { id: 19, title: 'Fire Safety Training', subtitle: 'May 20 · 6:00 PM · Lobby', icon: Bell, iconClass: 'maintenance-icon' },
    { id: 20, title: 'Memorial Day BBQ', subtitle: 'May 26 · 12:00 PM · Rooftop', icon: Wine, iconClass: 'social-icon' },
    { id: 21, title: 'Summer Kickoff Pool Party', subtitle: 'Jun 7 · 2:00 PM · Pool Deck', icon: Sun, iconClass: 'outdoor-icon' },
    { id: 22, title: 'Father\'s Day Poker Night', subtitle: 'Jun 15 · 7:00 PM · Game Room', icon: Users, iconClass: 'social-icon' },
    { id: 23, title: 'Book Club Meeting', subtitle: 'Jun 21 · 7:00 PM · Library', icon: BookOpen, iconClass: 'culture-icon' },
    { id: 24, title: 'Independence Day Fireworks Watch', subtitle: 'Jul 4 · 8:00 PM · Rooftop', icon: PartyPopper, iconClass: 'social-icon' },
    { id: 25, title: 'Summer Concert Series', subtitle: 'Jul 12 · 6:00 PM · Courtyard', icon: Music, iconClass: 'music-icon' },
    { id: 26, title: 'Ice Cream Social', subtitle: 'Jul 19 · 3:00 PM · Lobby', icon: Coffee, iconClass: 'social-icon' },
    { id: 27, title: 'HVAC Maintenance', subtitle: 'Aug 2 · All Day', icon: Wrench, iconClass: 'maintenance-icon' },
    { id: 28, title: 'Back to School Drive', subtitle: 'Aug 15 · 10:00 AM · Lobby', icon: BookOpen, iconClass: 'community-icon' },
    { id: 29, title: 'End of Summer Luau', subtitle: 'Aug 30 · 5:00 PM · Pool Deck', icon: PartyPopper, iconClass: 'social-icon' },
    { id: 30, title: 'Labor Day Cookout', subtitle: 'Sep 1 · 12:00 PM · Rooftop', icon: Wine, iconClass: 'social-icon' },
    { id: 31, title: 'Fall Festival', subtitle: 'Sep 20 · 2:00 PM · Courtyard', icon: TreeDeciduous, iconClass: 'outdoor-icon' },
    { id: 32, title: 'Karaoke Night', subtitle: 'Oct 4 · 8:00 PM · Rooftop Lounge', icon: Mic, iconClass: 'music-icon' },
    { id: 33, title: 'Halloween Costume Party', subtitle: 'Oct 31 · 7:00 PM · Community Room', icon: PartyPopper, iconClass: 'social-icon' },
    { id: 34, title: 'Heating System Check', subtitle: 'Nov 8 · 9:00 AM - 3:00 PM', icon: Wrench, iconClass: 'maintenance-icon' },
    { id: 35, title: 'Thanksgiving Potluck', subtitle: 'Nov 27 · 4:00 PM · Community Room', icon: Coffee, iconClass: 'social-icon' },
    { id: 36, title: 'Holiday Tree Lighting', subtitle: 'Dec 6 · 6:00 PM · Lobby', icon: Sparkles, iconClass: 'social-icon' },
    { id: 37, title: 'Holiday Movie Marathon', subtitle: 'Dec 13 · 2:00 PM · Theater Room', icon: Film, iconClass: 'movie-icon' },
    { id: 38, title: 'New Year\'s Eve Gala', subtitle: 'Dec 31 · 9:00 PM · Rooftop Lounge', icon: PartyPopper, iconClass: 'social-icon' },
  ]

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

            {/* Top Bar - Hamburger Menu & Notification Bell */}
            <div className="hero-top-bar">
              <button
                className="hamburger-btn"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <Menu size={24} />
              </button>
              <button className="notification-btn" aria-label="Notifications">
                <Bell size={22} />
                {unreadMessages > 0 && (
                  <span className="notification-badge">{unreadMessages}</span>
                )}
              </button>
            </div>

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
        </section>

        {/* Coming Up - scrollable list of all upcoming events */}
        <section className="coming-up-section">
          <h2 className="section-title-secondary">Coming Up</h2>

          <div className="events-scroll-container">
            {upcomingEvents.map((event) => {
              const IconComponent = event.icon
              return (
                <button key={event.id} className="event-card" onClick={() => handleFeatureClick('Calendar')}>
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

        {/* Bottom Navigation - Inside app container for alignment */}
        <nav id="main-bottom-nav" className="bottom-nav">
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

      {/* Slide-out Navigation Menu */}
      {menuOpen && (
        <div className="menu-overlay" onClick={() => setMenuOpen(false)}>
          <div className="menu-panel" onClick={e => e.stopPropagation()}>
            <div className="menu-header">
              <div className="menu-title">
                <span className="menu-the">The</span>
                <span className="menu-building-name">Paramount</span>
              </div>
              <button
                className="menu-close-btn"
                onClick={() => setMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={24} />
              </button>
            </div>
            <nav className="menu-nav">
              <button className="menu-item" onClick={() => { handleFeatureClick('Community'); setMenuOpen(false); }}>
                <Users size={22} />
                <span>Community</span>
              </button>
              <button className="menu-item" onClick={() => { handleFeatureClick('Messages'); setMenuOpen(false); }}>
                <MessageSquare size={22} />
                <span>Messages</span>
                {unreadMessages > 0 && (
                  <span className="menu-badge">{unreadMessages}</span>
                )}
              </button>
              <button className="menu-item" onClick={() => { handleFeatureClick('Calendar'); setMenuOpen(false); }}>
                <Calendar size={22} />
                <span>Calendar</span>
              </button>
              <button className="menu-item" onClick={() => { handleFeatureClick('Packages'); setMenuOpen(false); }}>
                <Package size={22} />
                <span>Packages</span>
              </button>
              <button className="menu-item" onClick={() => { handleFeatureClick('Building'); setMenuOpen(false); }}>
                <Building2 size={22} />
                <span>Building</span>
              </button>
              <button className="menu-item" onClick={() => { handleFeatureClick('Settings'); setMenuOpen(false); }}>
                <Settings size={22} />
                <span>Settings</span>
              </button>
            </nav>
          </div>
        </div>
      )}
    </div>
  )
}

export default Home
