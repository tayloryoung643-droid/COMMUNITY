import { useState, useEffect } from 'react'
import { Calendar, Wrench, ClipboardList, HelpCircle, FileText, Camera, User, Users, Settings, Phone, ChevronRight, Home as HomeIcon, MessageSquare, Building2, Sun, Cloud, CloudRain, Snowflake, Moon, ScrollText } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import HamburgerMenu from './HamburgerMenu'
import FeedbackModal from './components/FeedbackModal'
import './Building.css'

function Building({ onNavigate }) {
  const { userProfile, isDemoMode, isResidentLed, buildingBackgroundUrl } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  // Weather and time state - matches Home exactly
  const [currentTime, setCurrentTime] = useState(new Date())
  const weatherData = {
    temp: 58,
    condition: 'clear',
    conditionText: 'Mostly Clear'
  }

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

  const handleFeatureClick = (featureTitle) => {
    if (onNavigate) {
      onNavigate(featureTitle)
    }
  }

  // CSS variable for building background image
  const bgStyle = buildingBackgroundUrl ? { '--building-bg-image': `url(${buildingBackgroundUrl})` } : {}

  return (
    <div className="building-container resident-inner-page" style={bgStyle}>
      {/* Hero Section with Weather and Title */}
      <div className="inner-page-hero">
        <HamburgerMenu onNavigate={onNavigate} currentScreen="building" />
        <div className="inner-page-weather">
          <div className="weather-datetime">{formatDay(currentTime)} | {formatTime(currentTime)}</div>
          <div className="weather-temp-row">
            <WeatherIcon size={20} className="weather-icon" />
            <span className="weather-temp">{weatherData.temp}°</span>
          </div>
          <div className="weather-condition">{weatherData.conditionText}</div>
        </div>
        <div className="inner-page-title-container">
          <h1 className="inner-page-title">Building</h1>
        </div>
      </div>

      {/* Content */}
      <div className="building-content">
        {/* Quick Actions Section - hidden for resident-led buildings */}
        {!isResidentLed && (
          <section className="building-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              <button className="quick-action-card teal" onClick={() => handleFeatureClick('Elevator Booking')}>
                <div className="quick-action-icon">
                  <Calendar size={24} />
                </div>
                <span className="quick-action-label">Book Elevator</span>
              </button>
              <button className="quick-action-card orange" onClick={() => handleFeatureClick('Maintenance')}>
                <div className="quick-action-icon">
                  <Wrench size={24} />
                </div>
                <span className="quick-action-label">Maintenance Request</span>
              </button>
            </div>
          </section>
        )}

        {/* Building Info Section */}
        <section className="building-section">
          <h2 className="section-title">Building Info</h2>
          <div className="list-card">
            <button className="list-item" onClick={() => handleFeatureClick('messages')}>
              <div className="list-item-icon">
                <MessageSquare size={20} />
              </div>
              <span className="list-item-label">Messages</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
            <button className="list-item" onClick={() => handleFeatureClick('Bulletin Board')}>
              <div className="list-item-icon">
                <ClipboardList size={20} />
              </div>
              <span className="list-item-label">Bulletin Board</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
            {!isResidentLed && (
              <button className="list-item" onClick={() => handleFeatureClick('FAQ')}>
                <div className="list-item-icon">
                  <HelpCircle size={20} />
                </div>
                <span className="list-item-label">Building FAQ</span>
                <ChevronRight size={18} className="list-item-arrow" />
              </button>
            )}
            <button className="list-item" onClick={() => handleFeatureClick('Documents')}>
              <div className="list-item-icon">
                {isResidentLed ? <Camera size={20} /> : <FileText size={20} />}
              </div>
              <span className="list-item-label">{isResidentLed ? 'Community Photos' : 'Documents & Forms'}</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
            <button className="list-item" onClick={() => handleFeatureClick('Invite Neighbors')}>
              <div className="list-item-icon">
                <Users size={20} />
              </div>
              <span className="list-item-label">Invite Neighbors</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
            <button className="list-item" onClick={() => handleFeatureClick('Guidelines')}>
              <div className="list-item-icon">
                <ScrollText size={20} />
              </div>
              <span className="list-item-label">Community Guidelines</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
          </div>
        </section>

        {/* Account Section */}
        <section className="building-section">
          <h2 className="section-title">Account</h2>
          <div className="list-card">
            <button className="list-item" onClick={() => handleFeatureClick('Profile')}>
              <div className="list-item-icon">
                <User size={20} />
              </div>
              <span className="list-item-label">My Profile</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
            <button className="list-item" onClick={() => handleFeatureClick('Settings')}>
              <div className="list-item-icon">
                <Settings size={20} />
              </div>
              <span className="list-item-label">Settings</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
            {!isResidentLed && (
              <button className="list-item" onClick={() => handleFeatureClick('messages')}>
                <div className="list-item-icon">
                  <Phone size={20} />
                </div>
                <span className="list-item-label">Contact Management</span>
                <ChevronRight size={18} className="list-item-arrow" />
              </button>
            )}
            <button className="list-item" onClick={() => setShowFeedbackModal(true)}>
              <div className="list-item-icon">
                <HelpCircle size={20} />
              </div>
              <span className="list-item-label">Help & Feedback</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
          </div>
        </section>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        userProfile={userProfile}
        buildingName={userProfile?.buildings?.name || userProfile?.building_name}
        isDemoMode={isDemoMode}
        pageContext="building_page"
      />
    </div>
  )
}

export default Building
