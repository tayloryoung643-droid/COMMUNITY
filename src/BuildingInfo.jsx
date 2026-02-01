import { useState, useEffect } from 'react'
import { ArrowLeft, Clock, FileText, Truck, Recycle, CalendarCheck, ChevronDown, ChevronUp, Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import './BuildingInfo.css'

function BuildingInfo({ onBack, isDemoMode, userProfile }) {
  // Get cached building background URL from context
  const { buildingBackgroundUrl } = useAuth()
  const [expandedSections, setExpandedSections] = useState(['hours'])

  // Log which mode we're in
  useEffect(() => {
    if (isDemoMode) {
      console.log('[BuildingInfo] MODE: DEMO - showing demo building info')
    } else {
      console.log('[BuildingInfo] MODE: REAL - building:', userProfile?.building_id)
    }
  }, [isDemoMode, userProfile])

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

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  // Demo sections data
  const demoSections = [
    {
      id: 'hours',
      icon: Clock,
      title: 'Building Hours',
      content: [
        { label: 'Gym', value: '5:00 AM - 11:00 PM daily' },
        { label: 'Pool', value: '6:00 AM - 10:00 PM daily' },
        { label: 'Party Room', value: 'By reservation only' },
        { label: 'Rooftop Terrace', value: '8:00 AM - 10:00 PM (May - Oct)' },
        { label: 'Management Office', value: 'Mon - Fri: 9:00 AM - 5:00 PM' },
        { label: 'Concierge', value: '24/7' }
      ]
    },
    {
      id: 'policies',
      icon: FileText,
      title: 'Policies',
      content: [
        {
          label: 'Guest Parking',
          value: 'Visitor spots in P1 only. Max 4 hours. Register at concierge.'
        },
        {
          label: 'Pet Policy',
          value: 'Pets allowed. Max 2 per unit. Dogs must be leashed in common areas. Clean up after your pet.'
        },
        {
          label: 'Noise Hours',
          value: 'Quiet hours: 10:00 PM - 8:00 AM weekdays, 11:00 PM - 9:00 AM weekends.'
        },
        {
          label: 'Smoking Policy',
          value: 'No smoking in any indoor common areas. Designated smoking area on P2 rooftop.'
        },
        {
          label: 'BBQ Usage',
          value: 'Rooftop BBQs available first-come, first-served. Clean after use.'
        }
      ]
    },
    {
      id: 'moving',
      icon: Truck,
      title: 'Move-in / Move-out',
      content: [
        {
          label: 'Elevator Booking',
          value: 'Required for all moves. Book through the app at least 48 hours in advance.'
        },
        {
          label: 'Moving Hours',
          value: 'Mon - Sat: 9:00 AM - 5:00 PM. No Sunday moves.'
        },
        {
          label: 'Deposit',
          value: '$500 refundable deposit required. Picked up at management office.'
        },
        {
          label: 'Loading Dock',
          value: 'Access from rear entrance. Maximum 4-hour booking.'
        },
        {
          label: 'Hallway Protection',
          value: 'Movers must use floor and wall protection. Available at concierge.'
        }
      ]
    },
    {
      id: 'recycling',
      icon: Recycle,
      title: 'Recycling & Garbage',
      content: [
        {
          label: 'Garbage Chute',
          value: 'Located on each floor. Household waste only. No cardboard.'
        },
        {
          label: 'Recycling Room',
          value: 'P1 level. Blue bins for paper/plastic, green for glass.'
        },
        {
          label: 'Large Items',
          value: 'Contact concierge for bulk pickup. $25 fee applies.'
        },
        {
          label: 'Organics',
          value: 'Green bin in P1 recycling room. Biodegradable bags required.'
        },
        {
          label: 'E-Waste',
          value: 'Drop-off bin in P1. Electronics, batteries, light bulbs.'
        }
      ]
    },
    {
      id: 'amenities',
      icon: CalendarCheck,
      title: 'Amenity Booking',
      content: [
        {
          label: 'Party Room',
          value: 'Book up to 30 days in advance. $150/4 hours. $300 deposit.'
        },
        {
          label: 'Guest Suite',
          value: '$75/night. Max 3 consecutive nights. Book through management.'
        },
        {
          label: 'Theater Room',
          value: 'Free for residents. 2-hour slots. Book through app.'
        },
        {
          label: 'Tennis Court',
          value: 'Free. 1-hour slots. Book through app, max 2 bookings per week.'
        },
        {
          label: 'Rooftop BBQ Area',
          value: 'First-come, first-served. No reservations needed.'
        }
      ]
    }
  ]

  // Empty sections for real users (building info not yet configured)
  const emptySections = [
    {
      id: 'hours',
      icon: Clock,
      title: 'Building Hours',
      content: [
        { label: 'Info', value: 'Building hours not yet configured' }
      ]
    },
    {
      id: 'policies',
      icon: FileText,
      title: 'Policies',
      content: [
        { label: 'Info', value: 'Building policies not yet configured' }
      ]
    }
  ]

  // Use demo sections in demo mode, empty sections for real users
  const sections = isDemoMode ? demoSections : emptySections

  const bgStyle = buildingBackgroundUrl ? { '--building-bg-image': `url(${buildingBackgroundUrl})` } : {}

  return (
    <div className="building-info-container resident-inner-page" style={bgStyle}>
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
          <h1 className="inner-page-title">Info & FAQ</h1>
        </div>
      </div>

      <main className="building-info-content">
        <div className="accordion-list">
          {sections.map(section => {
            const IconComponent = section.icon
            const isExpanded = expandedSections.includes(section.id)

            return (
              <div key={section.id} className={`accordion-item ${isExpanded ? 'expanded' : ''}`}>
                <button
                  className="accordion-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="accordion-header-left">
                    <div className="accordion-icon">
                      <IconComponent size={20} />
                    </div>
                    <span className="accordion-title">{section.title}</span>
                  </div>
                  <div className="accordion-chevron">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="accordion-content">
                    {section.content.map((item, index) => (
                      <div key={index} className="info-row">
                        <span className="info-label">{item.label}</span>
                        <span className="info-value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default BuildingInfo
