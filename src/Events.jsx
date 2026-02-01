import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock, MapPin, Users, Check, Sun, Cloud, CloudRain, Snowflake, Moon, Plus, X } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getEvents, addRSVP, removeRSVP, createEvent, getUserRSVPs } from './services/eventService'
import { getBuildingBackgroundImage } from './services/buildingService'
import EmptyState from './components/EmptyState'
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

  // Building background image
  const [buildingBgUrl, setBuildingBgUrl] = useState(null)

  // Fetch building background image
  useEffect(() => {
    const fetchBuildingBg = async () => {
      if (isInDemoMode) return
      const buildingId = userProfile?.building_id
      if (!buildingId) return
      try {
        const url = await getBuildingBackgroundImage(buildingId)
        if (url) setBuildingBgUrl(url)
      } catch (err) {
        console.warn('[Events] Failed to load building background:', err)
      }
    }
    fetchBuildingBg()
  }, [isInDemoMode, userProfile?.building_id])

  // Create event modal state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: '',
    date: '',
    time: '',
    location: '',
    description: ''
  })

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
    async function loadEvents() {
      if (isInDemoMode) {
        console.log('[Events] MODE: DEMO - events.length:', DEMO_EVENTS.length)
        setEvents(DEMO_EVENTS)
        setLoading(false)
        return
      }

      // Real mode
      const buildingId = userProfile?.building_id
      console.log('[Events] MODE: REAL - fetching for building:', buildingId)

      if (!buildingId) {
        console.log('[Events] No building_id - showing empty state')
        setEvents([])
        setLoading(false)
        return
      }

      try {
        // Fetch events and user's RSVPs in parallel
        const [eventsData, userRsvpMap] = await Promise.all([
          getEvents(buildingId),
          userProfile?.id ? getUserRSVPs(userProfile.id) : Promise.resolve({})
        ])

        // data will be [] if table is empty - this is SUCCESS, not an error
        const transformedData = (eventsData || []).map(event => ({
          id: event.id,
          title: event.title || 'Untitled Event',
          date: event.start_time?.split('T')[0] || event.date,
          time: event.event_time || (event.start_time ? new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBD'),
          location: event.location || 'TBD',
          description: event.description || '',
          attendees: event.attendee_count || 0,
          isUpcoming: event.start_time ? new Date(event.start_time) >= new Date() : true,
          userRSVPd: !!userRsvpMap[event.id],
          rsvpStatus: userRsvpMap[event.id] || null
        }))
        setEvents(transformedData)
        setError(null) // Clear any previous error
        console.log('[Events] SUCCESS - events loaded:', transformedData.length, 'User RSVPs:', Object.keys(userRsvpMap).length)
      } catch (err) {
        // Only set error for actual failures (network, permission, table doesn't exist)
        console.error('[Events] ERROR loading events:', {
          message: err.message,
          code: err.code,
          details: err.details,
          hint: err.hint
        })
        setError(`Failed to load events: ${err.message || 'Unknown error'}`)
        setEvents([]) // Show empty state alongside error
      } finally {
        setLoading(false)
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

  // Handle create event
  const handleCreateEvent = async (e) => {
    e.preventDefault()
    if (!newEvent.title || !newEvent.date || !newEvent.time || !newEvent.location) {
      return
    }

    setIsSubmitting(true)

    if (isInDemoMode) {
      // Demo mode: add to local state
      const demoEvent = {
        id: Date.now(),
        title: newEvent.title,
        date: newEvent.date,
        time: newEvent.time,
        location: newEvent.location,
        description: newEvent.description,
        attendees: 0,
        isUpcoming: new Date(newEvent.date) >= new Date(),
        userRSVPd: false
      }
      setEvents([demoEvent, ...events])
      setShowCreateModal(false)
      setNewEvent({ title: '', date: '', time: '', location: '', description: '' })
      setIsSubmitting(false)
    } else {
      // Real mode: save to Supabase
      try {
        const eventData = {
          building_id: userProfile.building_id,
          title: newEvent.title,
          description: newEvent.description,
          location: newEvent.location,
          start_time: `${newEvent.date}T${newEvent.time}:00`,
          event_time: newEvent.time,
          created_by: userProfile.id
        }
        const created = await createEvent(eventData)
        // Add to local state
        const transformedEvent = {
          id: created.id,
          title: created.title,
          date: created.start_time?.split('T')[0],
          time: created.event_time,
          location: created.location,
          description: created.description,
          attendees: 0,
          isUpcoming: new Date(created.start_time) >= new Date(),
          userRSVPd: false
        }
        setEvents([transformedEvent, ...events])
        setShowCreateModal(false)
        setNewEvent({ title: '', date: '', time: '', location: '', description: '' })
      } catch (err) {
        console.error('Error creating event:', err)
        alert('Failed to create event. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  const upcomingEvents = events.filter(event => event.isUpcoming)
  const pastEvents = events.filter(event => !event.isUpcoming)

  // CSS variable for building background image
  const bgStyle = buildingBgUrl ? { '--building-bg-image': `url(${buildingBgUrl})` } : {}

  // Loading state
  if (loading) {
    return (
      <div className="events-container resident-inner-page" style={bgStyle}>
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
      <div className="events-container resident-inner-page" style={bgStyle}>
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
    <div className="events-container resident-inner-page" style={bgStyle}>
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

      {/* Create Event Button */}
      <div className="create-event-button-container">
        <button
          className="create-event-button"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus size={20} />
          <span>Create Event</span>
        </button>
      </div>

      <main className="events-content">
        {/* Upcoming Events Section */}
        <section className="events-section animate-in delay-1">
          <h2 className="section-title">Upcoming Events</h2>
          <div className="events-list">
            {upcomingEvents.length === 0 ? (
              <EmptyState
                icon="calendar"
                title="No upcoming events"
                subtitle="Check back later for new building events"
              />
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
              <EmptyState
                icon="calendar"
                title="No past events"
                subtitle="Past events will appear here"
              />
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

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Create Event</h2>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label htmlFor="event-title">Event Title *</label>
                <input
                  type="text"
                  id="event-title"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  placeholder="Enter event title"
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="event-date">Date *</label>
                  <input
                    type="date"
                    id="event-date"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="event-time">Time *</label>
                  <input
                    type="time"
                    id="event-time"
                    value={newEvent.time}
                    onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label htmlFor="event-location">Location *</label>
                <input
                  type="text"
                  id="event-location"
                  value={newEvent.location}
                  onChange={(e) => setNewEvent({ ...newEvent, location: e.target.value })}
                  placeholder="e.g., Rooftop, Community Room"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="event-description">Description</label>
                <textarea
                  id="event-description"
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  placeholder="Describe the event..."
                  rows={3}
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="cancel-button"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Events
