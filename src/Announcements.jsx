import { useState, useEffect } from 'react'
import { ArrowLeft, Wrench, AlertTriangle, Megaphone, Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getBuildingBackgroundImage } from './services/buildingService'
import './Announcements.css'

function Announcements({ onBack }) {
  const { userProfile, isDemoMode } = useAuth()

  // Weather and time state - matches Home exactly
  const [currentTime, setCurrentTime] = useState(new Date())
  const [buildingBgUrl, setBuildingBgUrl] = useState(null)
  const weatherData = {
    temp: 58,
    condition: 'clear',
    conditionText: 'Mostly Clear'
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // Fetch building background image
  useEffect(() => {
    async function fetchBuildingBackground() {
      if (isDemoMode || !userProfile?.building_id) return
      try {
        const url = await getBuildingBackgroundImage(userProfile.building_id)
        if (url) setBuildingBgUrl(url)
      } catch (err) {
        console.error('[Announcements] Error fetching building background:', err)
      }
    }
    fetchBuildingBackground()
  }, [isDemoMode, userProfile?.building_id])

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
  // Fake announcement data - we'll replace this with real data later
  const announcements = [
    {
      id: 1,
      type: "Maintenance",
      icon: Wrench,
      title: "Water Shutoff Notice",
      date: "2026-01-08",
      message: "Water will be shut off on Thursday, January 10th from 9 AM to 2 PM for pipe maintenance. Please plan accordingly and store water if needed."
    },
    {
      id: 2,
      type: "Safety",
      icon: AlertTriangle,
      title: "Fire Alarm Testing",
      date: "2026-01-05",
      message: "Annual fire alarm testing will occur on Monday, January 15th starting at 10 AM. The alarms will sound intermittently throughout the day. No evacuation is required."
    },
    {
      id: 3,
      type: "General",
      icon: Megaphone,
      title: "Gym Equipment Upgrade",
      date: "2026-01-03",
      message: "We're excited to announce new fitness equipment has been installed in the gym! Come check out the new treadmills, ellipticals, and weight machines."
    },
    {
      id: 4,
      type: "General",
      icon: Megaphone,
      title: "Holiday Lobby Decorations",
      date: "2025-12-28",
      message: "Thank you to everyone who enjoyed our holiday decorations! Decorations will be removed by January 5th."
    }
  ]

  // Helper function to format dates nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { month: 'short', day: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  // Get gradient based on announcement type
  const getTypeGradient = (type) => {
    switch(type) {
      case 'Maintenance': return 'linear-gradient(135deg, #f59e0b, #ef4444)'
      case 'Safety': return 'linear-gradient(135deg, #ef4444, #dc2626)'
      case 'General': return 'linear-gradient(135deg, #3b82f6, #06b6d4)'
      default: return 'linear-gradient(135deg, #64748b, #94a3b8)'
    }
  }

  // Get type class for styling
  const getTypeClass = (type) => {
    switch(type) {
      case 'Maintenance': return 'maintenance'
      case 'Safety': return 'alert'
      case 'General': return 'info'
      default: return 'info'
    }
  }

  const bgStyle = buildingBgUrl ? { '--building-bg-image': `url(${buildingBgUrl})` } : {}

  return (
    <div className="announcements-container resident-inner-page" style={bgStyle}>
      {/* Hero Section with Weather and Title */}
      <div className="inner-page-hero">
        <button className="inner-page-back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="inner-page-weather">
          <div className="weather-datetime">{formatDay(currentTime)} | {formatTime(currentTime)}</div>
          <div className="weather-temp-row">
            <WeatherIcon size={20} className="weather-icon" />
            <span className="weather-temp">{weatherData.temp}°</span>
          </div>
          <div className="weather-condition">{weatherData.conditionText}</div>
        </div>
        <div className="inner-page-title-container">
          <h1 className="inner-page-title">Announcements</h1>
        </div>
      </div>

      <main className="announcements-list">
        {announcements.map((announcement, index) => {
          const IconComponent = announcement.icon
          return (
            <article
              key={announcement.id}
              className={`announcement-card animate-in delay-${(index % 6) + 1}`}
            >
              <div className="card-accent"></div>
              <div className="announcement-header">
                <div className={`announcement-icon-wrapper ${getTypeClass(announcement.type)}`}>
                  <IconComponent size={20} strokeWidth={2} />
                </div>
                <div className="announcement-meta">
                  <span className={`announcement-type ${getTypeClass(announcement.type)}`}>
                    {announcement.type}
                  </span>
                  <span className="announcement-date">
                    {formatDate(announcement.date)}
                  </span>
                </div>
              </div>
              <h2 className="announcement-title">{announcement.title}</h2>
              <p className="announcement-message">{announcement.message}</p>
            </article>
          )
        })}
      </main>
    </div>
  )
}

export default Announcements
