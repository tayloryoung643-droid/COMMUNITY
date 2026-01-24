import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock, MapPin, Users, Check, Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getEvents, addRSVP, removeRSVP } from './services/eventService'
import './Events.css'

// Demo event data - used when in demo mode
const DEMO_EVENTS = [
  {
    id: 1,
    title: "Rooftop BBQ",
    date: "2026-01-15",
    time: "6:00 PM",
    location: "Rooftop",
    description: "Join us for our monthly rooftop BBQ! Burgers, hot dogs, and vegetarian options provided. BYOB welcome.",
    attendees: 18,
    isUpcoming: true,
    userRSVPd: false
  },
  {
    id: 2,
    title: "Yoga in the Courtyard",
    date: "2026-01-12",
    time: "8:00 AM",
    location: "Courtyard",
    description: "Start your Sunday with a relaxing yoga session. All levels welcome! Bring your own mat.",
    attendees: 12,
    isUpcoming: true,
    userRSVPd: false
  },
  {
    id: 3,
    title: "Building Town Hall",
    date: "2026-01-20",
    time: "7:00 PM",
    location: "Community Room",
    description: "Monthly town hall meeting to discuss building updates, maintenance schedules, and resident concerns.",
    attendees: 25,
    isUpcoming: true,
    userRSVPd: false
  },
  {
    id: 4,
    title: "Wine & Cheese Social",
    date: "2026-01-18",
    time: "7:30 PM",
    location: "Lobby",
    description: "Mingle with neighbors over wine and cheese. A great opportunity to meet new people in the building!",
    attendees: 15,
    isUpcoming: true,
    userRSVPd: false
  },
  {
    id: 5,
    title: "Holiday Party",
    date: "2025-12-20",
    time: "6:00 PM",
    location: "Community Room",
    description: "Annual holiday celebration with food, drinks, and festive fun for all residents.",
    attendees: 45,
    isUpcoming: false,
    userRSVPd: false
  },
  {
    id: 6,
    title: "Fitness Bootcamp",
    date: "2025-12-10",
    time: "9:00 AM",
    location: "Gym",
    description: "High-intensity workout session led by resident personal trainer Mike.",
    attendees: 8,
    isUpcoming: false,
    userRSVPd: false
  }
]

function Events({ onBack }) {
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  const formatTimeWeather = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDayWeather = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const WeatherIcon = getWeatherIcon(weatherData.condition)

  useEffect(() => {
    console.log('[Events] Demo mode:', isInDemoMode)

    async function loadEvents() {
      if (isInDemoMode) {
        console.log('Demo mode: using fake events')
        setEvents(DEMO_EVENTS)
        setLoading(false)
      } else {
        console.log('Real mode: fetching events from Supabase')
        try {
          const data = await getEvents(userProfile?.building_id)
          const transformedData = data.map(event => ({
            id: event.id,
            title: event.title,
            date: event.event_date,
            time: event.event_time,
            location: event.location,
            description: event.description,
            attendees: event.attendee_count || 0,
            isUpcoming: new Date(event.event_date) >= new Date(),
            userRSVPd: event.user_rsvpd || false
          }))
          setEvents(transformedData)
        } catch (err) {
          console.error('Error loading events:', err)
          setError('Failed to load events. Please try again.')
        } finally {
          setLoading(false)
        }
      }
    }
    loadEvents()
  }, [isInDemoMode, userProfile])

  // Helper function to format dates nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  // Handle RSVP toggle
  const handleRSVP = async (eventId) => {
    const event = events.find(e => e.id === eventId)
    if (!event) return

    if (isInDemoMode) {
      // Demo mode: update local state only
      setEvents(events.map(e => {
        if (e.id === eventId) {
          return {
            ...e,
            userRSVPd: !e.userRSVPd,
            attendees: e.userRSVPd ? e.attendees - 1 : e.attendees + 1
          }
        }
        return e
      }))
    } else {
      // Real mode: update in Supabase
      try {
        if (event.userRSVPd) {
          await removeRSVP(eventId, userProfile.id)
        } else {
          await addRSVP(eventId, userProfile.id, 'going')
        }
        // Update local state
        setEvents(events.map(e => {
          if (e.id === eventId) {
            return {
              ...e,
              userRSVPd: !e.userRSVPd,
              attendees: e.userRSVPd ? e.attendees - 1 : e.attendees + 1
            }
          }
          return e
        }))
      } catch (err) {
        console.error('Error updating RSVP:', err)
      }
    }
  }

  const upcomingEvents = events.filter(event => event.isUpcoming)
  const pastEvents = events.filter(event => !event.isUpcoming)

  // Loading state
  if (loading) {
    return (
      <div className="events-container resident-inner-page">
        <div className="inner-page-hero">
          <button className="inner-page-back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="inner-page-weather">
            <div className="weather-datetime">{formatDayWeather(currentTime)} | {formatTimeWeather(currentTime)}</div>
            <div className="weather-temp-row">
              <WeatherIcon size={20} className="weather-icon" />
              <span className="weather-temp">{weatherData.temp}°</span>
            </div>
            <div className="weather-condition">{weatherData.conditionText}</div>
          </div>
          <div className="inner-page-title-container">
            <h1 className="inner-page-title">Events</h1>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh', color: '#9CA3AF' }}>
          Loading events...
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="events-container resident-inner-page">
        <div className="inner-page-hero">
          <button className="inner-page-back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="inner-page-weather">
            <div className="weather-datetime">{formatDayWeather(currentTime)} | {formatTimeWeather(currentTime)}</div>
            <div className="weather-temp-row">
              <WeatherIcon size={20} className="weather-icon" />
              <span className="weather-temp">{weatherData.temp}°</span>
            </div>
            <div className="weather-condition">{weatherData.conditionText}</div>
          </div>
          <div className="inner-page-title-container">
            <h1 className="inner-page-title">Events</h1>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh', color: '#ef4444' }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="events-container resident-inner-page">
      {/* Hero Section with Weather and Title */}
      <div className="inner-page-hero">
        <button className="inner-page-back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="inner-page-weather">
          <div className="weather-datetime">{formatDayWeather(currentTime)} | {formatTimeWeather(currentTime)}</div>
          <div className="weather-temp-row">
            <WeatherIcon size={20} className="weather-icon" />
            <span className="weather-temp">{weatherData.temp}°</span>
          </div>
          <div className="weather-condition">{weatherData.conditionText}</div>
        </div>
        <div className="inner-page-title-container">
          <h1 className="inner-page-title">Events</h1>
        </div>
      </div>

      <main className="events-content">
        {/* Upcoming Events Section */}
        <section className="events-section animate-in delay-1">
          <h2 className="section-title">Upcoming Events</h2>
          <div className="events-list">
            {upcomingEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.6)' }}>
                No upcoming events
              </div>
            ) : (
              upcomingEvents.map((event, index) => (
                <article key={event.id} className={`event-card animate-in delay-${(index % 4) + 2}`}>
                  <div className="card-accent"></div>
                  <div className="event-header">
                    <h3 className="event-title">{event.title}</h3>
                    <span className="event-attendees">
                      <Users size={14} />
                      {event.attendees} going
                    </span>
                  </div>

                  <div className="event-details">
                    <div className="event-detail-item">
                      <Calendar size={16} />
                      <span className="detail-text">{formatDate(event.date)}</span>
                    </div>
                    <div className="event-detail-item">
                      <Clock size={16} />
                      <span className="detail-text">{event.time}</span>
                    </div>
                    <div className="event-detail-item">
                      <MapPin size={16} />
                      <span className="detail-text">{event.location}</span>
                    </div>
                  </div>

                  <p className="event-description">{event.description}</p>

                  <button
                    className={`rsvp-button ${event.userRSVPd ? 'rsvpd' : ''}`}
                    onClick={() => handleRSVP(event.id)}
                  >
                    {event.userRSVPd ? (
                      <>
                        <Check size={18} />
                        <span>Going</span>
                      </>
                    ) : (
                      <span>RSVP</span>
                    )}
                  </button>
                </article>
              ))
            )}
          </div>
        </section>

        {/* Past Events Section */}
        <section className="events-section animate-in delay-3">
          <h2 className="section-title">Past Events</h2>
          <div className="events-list">
            {pastEvents.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.6)' }}>
                No past events
              </div>
            ) : (
              pastEvents.map((event, index) => (
                <article key={event.id} className={`event-card past animate-in delay-${(index % 4) + 4}`}>
                  <div className="event-header">
                    <h3 className="event-title">{event.title}</h3>
                    <span className="event-attendees past">
                      <Users size={14} />
                      {event.attendees} attended
                    </span>
                  </div>

                  <div className="event-details">
                    <div className="event-detail-item">
                      <Calendar size={16} />
                      <span className="detail-text">{formatDate(event.date)}</span>
                    </div>
                    <div className="event-detail-item">
                      <Clock size={16} />
                      <span className="detail-text">{event.time}</span>
                    </div>
                    <div className="event-detail-item">
                      <MapPin size={16} />
                      <span className="detail-text">{event.location}</span>
                    </div>
                  </div>

                  <p className="event-description">{event.description}</p>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Events
