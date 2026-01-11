import { useState } from 'react'
import { Package, Calendar, Users, ArrowUpDown, Settings, ChevronRight, Sparkles, MessageSquare, Hand, UserPlus, PartyPopper, Pin, Mail, X, Image, Send, Check } from 'lucide-react'
import './Home.css'

function Home({ buildingCode, onNavigate }) {
  const buildingName = "The Paramount"
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

  const handleContactSubmit = () => {
    if (contactForm.message.trim()) {
      // For now, just show success - would send email later
      setShowContactModal(false)
      setShowContactSuccess(true)
      setContactForm({ subject: 'Maintenance Request', message: '', hasPhoto: false })
      setTimeout(() => setShowContactSuccess(false), 3000)
    }
  }

  // Get time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return "Good morning"
    if (hour < 17) return "Good afternoon"
    if (hour < 21) return "Good evening"
    return "Good night"
  }

  // Simulated dynamic data (would come from backend)
  const dynamicData = {
    packagesWaiting: 3,
    unreadAnnouncements: 2,
    upcomingEvents: 4
  }

  // Today's highlights for the hero banner
  const todayHighlights = [
    { icon: Package, text: "3 packages ready for pickup", type: "packages" },
    { icon: Calendar, text: "Rooftop BBQ tonight at 6pm", type: "events" },
  ]

  // Coming up this month - events and announcements combined, sorted by date
  const upcomingItems = [
    {
      date: "Jan 15",
      time: "9am - 12pm",
      title: "Water shut off - Floors 10-15",
      category: "maintenance",
      categoryLabel: "Maintenance",
      color: "#f59e0b"
    },
    {
      date: "Jan 18",
      time: "7pm",
      title: "Building Town Hall",
      category: "meeting",
      categoryLabel: "Meeting",
      color: "#3b82f6"
    },
    {
      date: "Jan 22",
      time: "10am - 2pm",
      title: "Fire alarm testing",
      category: "maintenance",
      categoryLabel: "Maintenance",
      color: "#f59e0b"
    },
    {
      date: "Jan 25",
      time: "7:30pm",
      title: "Wine & Cheese Social",
      category: "social",
      categoryLabel: "Social",
      color: "#8b5cf6"
    },
    {
      date: "Jan 28",
      time: "8am",
      title: "Yoga in the Courtyard",
      category: "social",
      categoryLabel: "Social",
      color: "#8b5cf6"
    },
    {
      date: "Feb 1",
      time: "All day",
      title: "Pest control inspection",
      category: "maintenance",
      categoryLabel: "Maintenance",
      color: "#f59e0b"
    }
  ]

  // Recent activity feed
  const recentActivity = [
    {
      icon: Hand,
      text: "Sarah from 1201 waved at you",
      time: "2 min ago",
      type: "wave",
      color: "#f59e0b"
    },
    {
      icon: UserPlus,
      text: "New neighbor moved into Unit 802",
      time: "1 hour ago",
      type: "new",
      color: "#10b981"
    },
    {
      icon: PartyPopper,
      text: "5 people RSVP'd to Rooftop BBQ",
      time: "3 hours ago",
      type: "rsvp",
      color: "#8b5cf6"
    },
    {
      icon: Package,
      text: "Package picked up by Unit 1105",
      time: "4 hours ago",
      type: "package",
      color: "#ec4899"
    },
  ]

  const features = [
    {
      icon: MessageSquare,
      title: "Community",
      description: "Posts from neighbors",
      gradient: "linear-gradient(135deg, #8b5cf6, #3b82f6)",
      badge: 4,
      hasActivity: true
    },
    {
      icon: Calendar,
      title: "Calendar",
      description: "Events & announcements",
      gradient: "linear-gradient(135deg, #3b82f6, #10b981)",
      badge: dynamicData.unreadAnnouncements + dynamicData.upcomingEvents,
      hasActivity: true
    },
    {
      icon: Package,
      title: "Packages",
      description: "Track your deliveries",
      gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
      badge: dynamicData.packagesWaiting,
      hasActivity: true
    },
    {
      icon: ArrowUpDown,
      title: "Elevator Booking",
      description: "Reserve for moving",
      gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      badge: null,
      hasActivity: false
    },
    {
      icon: Pin,
      title: "Bulletin Board",
      description: "Buy, sell & rent locally",
      gradient: "linear-gradient(135deg, #ec4899, #f59e0b)",
      badge: 12,
      hasActivity: true
    }
  ]

  const handleFeatureClick = (featureTitle) => {
    if (onNavigate) {
      onNavigate(featureTitle)
    }
  }

  return (
    <div className="home-container">
      {/* Background gradient orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <header className="home-header">
        <div className="header-content">
          <div className="header-text">
            <p className="welcome-label">{getGreeting()}</p>
            <h1 className="building-name">{buildingName}</h1>
            <p className="floor-info">Floor {floor} Resident</p>
          </div>
          <div className="header-actions">
            <button className="contact-manager-btn" onClick={() => setShowContactModal(true)}>
              <Mail size={18} />
              <span>Contact Manager</span>
            </button>
            <button className="settings-button" onClick={() => handleFeatureClick('Settings')}>
              <Settings size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Today in Your Building - Hero Banner */}
      <section className="today-banner animate-in delay-1">
        <div className="banner-content">
          <div className="banner-header">
            <Sparkles size={18} className="banner-icon" />
            <span className="banner-title">Today in your building</span>
          </div>
          <div className="banner-items">
            {todayHighlights.map((item, index) => {
              const IconComponent = item.icon
              return (
                <button
                  key={index}
                  className="banner-item"
                  onClick={() => handleFeatureClick(item.type === 'packages' ? 'Packages' : 'Calendar')}
                >
                  <IconComponent size={16} />
                  <span>{item.text}</span>
                  <ChevronRight size={14} className="banner-arrow" />
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <main className="features-section">
        <div className="features-grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <button
                key={index}
                className={`feature-card animate-in delay-${index + 2} ${feature.hasActivity ? 'has-activity' : ''}`}
                onClick={() => handleFeatureClick(feature.title)}
              >
                <div className="card-accent"></div>
                <div className="icon-wrapper" style={{ background: feature.gradient }}>
                  <IconComponent size={26} strokeWidth={2} />
                  {feature.badge && (
                    <span className="badge">{feature.badge}</span>
                  )}
                </div>
                <div className="card-content">
                  <h2 className="feature-title">{feature.title}</h2>
                  <p className="feature-description">{feature.description}</p>
                </div>
                <div className="card-arrow">
                  <ChevronRight size={20} />
                </div>
              </button>
            )
          })}
        </div>
      </main>

      {/* Coming Up This Month */}
      <section className="upcoming-section animate-in delay-5">
        <div className="upcoming-content">
          <h3 className="upcoming-title">
            <Calendar size={16} />
            <span>Coming up this month</span>
          </h3>
          <div className="upcoming-list">
            {upcomingItems.map((item, index) => (
              <div
                key={index}
                className="upcoming-card"
                onClick={() => handleFeatureClick('Calendar')}
              >
                <div className="upcoming-date-block">
                  <span className="upcoming-date">{item.date}</span>
                  <span className="upcoming-time">{item.time}</span>
                </div>
                <div className="upcoming-info">
                  <span className="upcoming-event-title">{item.title}</span>
                  <span
                    className="upcoming-category-tag"
                    style={{ background: `${item.color}20`, color: item.color }}
                  >
                    {item.categoryLabel}
                  </span>
                </div>
                <ChevronRight size={16} className="upcoming-arrow" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Feed */}
      <section className="activity-section animate-in delay-6">
        <div className="activity-content">
          <h3 className="activity-title">
            <Users size={16} />
            <span>Recent activity</span>
          </h3>
          <div className="activity-feed">
            {recentActivity.map((item, index) => {
              const IconComponent = item.icon
              return (
                <div key={index} className="activity-item">
                  <div className="activity-icon" style={{ background: item.color }}>
                    <IconComponent size={14} />
                  </div>
                  <div className="activity-text">
                    <span className="activity-message">{item.text}</span>
                    <span className="activity-time">{item.time}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

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
