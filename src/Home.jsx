import { Megaphone, Package, Calendar, Users, AlertTriangle, ArrowUpDown, LogOut, ChevronRight, Clock, Sparkles } from 'lucide-react'
import './Home.css'

function Home({ buildingCode, onNavigate, onLogout }) {
  const buildingName = "The Paramount"
  const floor = "12"

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

  const features = [
    {
      icon: Megaphone,
      title: "Announcements",
      description: "Building updates & news",
      gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
      badge: dynamicData.unreadAnnouncements,
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
      icon: Calendar,
      title: "Events",
      description: "Community gatherings",
      gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
      badge: null,
      hasActivity: false
    },
    {
      icon: Users,
      title: "Neighbors",
      description: "Meet your community",
      gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
      badge: null,
      hasActivity: false
    },
    {
      icon: AlertTriangle,
      title: "Emergency",
      description: "Important contacts",
      gradient: "linear-gradient(135deg, #ef4444, #f59e0b)",
      badge: null,
      hasActivity: false
    },
    {
      icon: ArrowUpDown,
      title: "Elevator Booking",
      description: "Reserve for moving",
      gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)",
      badge: null,
      hasActivity: false
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
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
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
                  onClick={() => handleFeatureClick(item.type === 'packages' ? 'Packages' : 'Events')}
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

      {/* Micro-content: Upcoming this week */}
      <section className="upcoming-section animate-in delay-6">
        <div className="upcoming-content">
          <h3 className="upcoming-title">
            <Clock size={16} />
            <span>Coming up this week</span>
          </h3>
          <div className="upcoming-items">
            <div className="upcoming-item" onClick={() => handleFeatureClick('Events')}>
              <span className="upcoming-day">Tomorrow</span>
              <span className="upcoming-text">Yoga in the Courtyard - 8am</span>
            </div>
            <div className="upcoming-item" onClick={() => handleFeatureClick('Events')}>
              <span className="upcoming-day">Sat</span>
              <span className="upcoming-text">Building Town Hall - 7pm</span>
            </div>
            <div className="upcoming-item" onClick={() => handleFeatureClick('Events')}>
              <span className="upcoming-day">Sun</span>
              <span className="upcoming-text">Wine & Cheese Social - 7:30pm</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}

export default Home
