import { useState, useEffect } from 'react'
import { ChevronLeft, Check, HelpCircle, X, CalendarPlus, Send, Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabase'
import './EventDetail.css'

function EventDetail({ event, onBack, onNavigate }) {
  const { userProfile, isDemoMode, buildingBackgroundUrl } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [rsvpStatus, setRsvpStatus] = useState(event?.rsvpStatus || null)
  const [comments, setComments] = useState(event?.comments || [])
  const [newComment, setNewComment] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [organizer, setOrganizer] = useState(null)

  // Fetch event creator profile
  useEffect(() => {
    async function fetchCreator() {
      if (isInDemoMode || !event?.created_by) return

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, role, unit_number, avatar_url')
          .eq('id', event.created_by)
          .single()

        if (!error && data) {
          const isManager = data.role === 'manager' || data.role === 'building_manager'
          setOrganizer({
            name: data.full_name || 'Building Staff',
            role: isManager ? 'Property Manager' : (data.unit_number ? `Unit ${data.unit_number}` : 'Resident'),
            avatar_url: data.avatar_url || null
          })
        }
      } catch (err) {
        console.warn('[EventDetail] Error fetching creator:', err)
      }
    }

    fetchCreator()
  }, [event?.created_by, isInDemoMode])

  // Weather and time state - matches Calendar/Home exactly
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

  if (!event) {
    return null
  }

  const isSocial = event.category === 'social'
  const isMaintenance = event.category === 'maintenance'
  const isMeeting = event.category === 'meeting'

  // Format 24h time string (like "16:00") to 12h format
  const formatEventTime = (timeString) => {
    if (!timeString) return 'TBD'
    // Already in 12h format (contains AM/PM)
    if (/[AaPp][Mm]/.test(timeString)) return timeString
    // Try parsing as HH:MM
    const match = timeString.match(/^(\d{1,2}):(\d{2})/)
    if (match) {
      const h = parseInt(match[1], 10)
      const m = match[2]
      const period = h >= 12 ? 'PM' : 'AM'
      const h12 = h === 0 ? 12 : h > 12 ? h - 12 : h
      return `${h12}:${m} ${period}`
    }
    return timeString
  }

  // Format date for display
  const formatEventDate = (dateString, timeString) => {
    const date = new Date(dateString)
    const options = { weekday: 'long', month: 'long', day: 'numeric' }
    const formattedDate = date.toLocaleDateString('en-US', options)
    return `${formattedDate} • ${formatEventTime(timeString)}`
  }

  const handleRsvp = (status) => {
    setRsvpStatus(status)
  }

  const handleAcknowledge = () => {
    setAcknowledged(true)
  }

  // User avatar for comments
  const userAvatar = '/images/profile-taylor.jpg'

  const handlePostComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: 'You',
        avatar: userAvatar,
        text: newComment.trim(),
        timestamp: 'Just now'
      }
      setComments([...comments, comment])
      setNewComment('')
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handlePostComment()
    }
  }

  // Add to Calendar (single event .ics download)
  const handleAddToCalendar = () => {
    const startDate = event.start_time
      ? new Date(event.start_time)
      : new Date(`${event.date}T${event.event_time || event.time || '00:00'}`)

    if (isNaN(startDate.getTime())) return

    const endDate = event.end_time
      ? new Date(event.end_time)
      : new Date(startDate.getTime() + 60 * 60 * 1000)

    const pad = (n) => String(n).padStart(2, '0')
    const fmtDate = (d) =>
      d.getUTCFullYear().toString() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) + 'Z'

    const esc = (t) => (t || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

    const ics = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//CommunityHQ//Events//EN',
      'BEGIN:VEVENT',
      `UID:event-${event.id}@communityhq.space`,
      `DTSTART:${fmtDate(startDate)}`,
      `DTEND:${fmtDate(endDate)}`,
      `SUMMARY:${esc(event.title)}`,
      event.description ? `DESCRIPTION:${esc(event.description)}` : null,
      event.location ? `LOCATION:${esc(event.location)}` : null,
      'END:VEVENT',
      'END:VCALENDAR'
    ].filter(Boolean).join('\r\n')

    const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${(event.title || 'event').replace(/[^a-zA-Z0-9]/g, '-')}.ics`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Organizer display values
  const orgName = organizer?.name || event.organizer?.name || 'Building Staff'
  const orgRole = organizer?.role || event.organizer?.role || 'Property Management'
  const orgAvatar = organizer?.avatar_url || event.organizer?.avatar || null
  const orgInitials = orgName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  // CSS variable for building background image
  const bgStyle = buildingBackgroundUrl ? { '--building-bg-image': `url(${buildingBackgroundUrl})` } : {}

  return (
    <div className="event-detail-container resident-inner-page" style={bgStyle}>
      {/* Hero Section - matches Calendar exactly */}
      <div className="inner-page-hero">
        {/* Back Button */}
        <button className="inner-page-back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>

        {/* Weather Widget - matches Calendar/Home exactly */}
        <div className="inner-page-weather">
          <div className="weather-datetime">
            {formatDay(currentTime)} | {formatTime(currentTime)}
          </div>
          <div className="weather-temp-row">
            <WeatherIcon size={20} className="weather-icon" />
            <span className="weather-temp">{weatherData.temp}°</span>
          </div>
          <div className="weather-condition">{weatherData.conditionText}</div>
        </div>

        {/* Event Title - centered like Calendar */}
        <div className="inner-page-title-container">
          <h1 className="inner-page-title">{event.title}</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="event-detail-content">
        {/* Event Meta - Category and Date/Time */}
        <div className="event-detail-meta-bar">
          <span className={`event-detail-category ${event.category}`}>
            {event.categoryLabel?.toUpperCase() || event.category?.toUpperCase()}
          </span>
          <span className="event-detail-datetime">
            {formatEventDate(event.date, event.time)}
          </span>
        </div>

        {/* Organizer Card */}
        <div className="event-detail-card organizer-card">
          <span className="organizer-label">Organized by</span>
          <div className="organizer-info">
            {orgAvatar ? (
              <img
                src={orgAvatar}
                alt={orgName}
                className="organizer-avatar"
                onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
              />
            ) : null}
            <div
              className="organizer-avatar organizer-avatar-fallback"
              style={{ display: orgAvatar ? 'none' : 'flex' }}
            >
              {orgInitials}
            </div>
            <div className="organizer-details">
              <span className="organizer-name">{orgName}</span>
              <span className="organizer-role">{orgRole}</span>
            </div>
          </div>
        </div>

        {/* Attendance Section (for social events) */}
        {isSocial && event.attendees && (
          <div className="event-detail-attendance">
            <span className="attendance-count">{event.attendees.count} neighbors going</span>
            <div className="attendance-avatars">
              {event.attendees.avatars?.slice(0, 5).map((avatar, index) => (
                <img
                  key={index}
                  src={avatar}
                  alt="Attendee"
                  className="attendance-avatar"
                  style={{ zIndex: 5 - index }}
                />
              ))}
              {event.attendees.count > 5 && (
                <div className="attendance-more">+{event.attendees.count - 5}</div>
              )}
            </div>
          </div>
        )}

        {/* RSVP Buttons (for social events) */}
        {isSocial && (
          <div className="event-detail-rsvp">
            <button
              className={`rsvp-btn rsvp-going ${rsvpStatus === 'going' ? 'active' : ''}`}
              onClick={() => handleRsvp('going')}
            >
              <Check size={18} />
              <span>Going</span>
            </button>
            <button
              className={`rsvp-btn rsvp-maybe ${rsvpStatus === 'maybe' ? 'active' : ''}`}
              onClick={() => handleRsvp('maybe')}
            >
              <HelpCircle size={18} />
              <span>Maybe</span>
            </button>
            <button
              className={`rsvp-btn rsvp-not-going ${rsvpStatus === 'not-going' ? 'active' : ''}`}
              onClick={() => handleRsvp('not-going')}
            >
              <X size={18} />
              <span>Not Going</span>
            </button>
          </div>
        )}

        {/* Acknowledge Button (for maintenance events) */}
        {isMaintenance && (
          <div className="event-detail-acknowledge">
            <button
              className={`acknowledge-btn ${acknowledged ? 'acknowledged' : ''}`}
              onClick={handleAcknowledge}
              disabled={acknowledged}
            >
              <Check size={18} />
              <span>{acknowledged ? 'Acknowledged' : 'Got it'}</span>
            </button>
          </div>
        )}

        {/* Meeting RSVP (optional) */}
        {isMeeting && (
          <div className="event-detail-rsvp">
            <button
              className={`rsvp-btn rsvp-going ${rsvpStatus === 'going' ? 'active' : ''}`}
              onClick={() => handleRsvp('going')}
            >
              <Check size={18} />
              <span>Attending</span>
            </button>
            <button
              className={`rsvp-btn rsvp-maybe ${rsvpStatus === 'maybe' ? 'active' : ''}`}
              onClick={() => handleRsvp('maybe')}
            >
              <HelpCircle size={18} />
              <span>Maybe</span>
            </button>
          </div>
        )}

        {/* Add to Calendar */}
        <button className="add-to-calendar-btn" onClick={handleAddToCalendar}>
          <CalendarPlus size={18} />
          <span>Add to Calendar</span>
        </button>

        {/* About This Event */}
        <div className="event-detail-card about-card">
          <h3 className="about-title">About this Event</h3>
          <p className="about-description">{event.description}</p>
          {event.affectedUnits && (
            <p className="about-affected">
              <strong>Affected:</strong> {event.affectedUnits}
            </p>
          )}
        </div>

        {/* Comments Section (for social and optionally meetings) */}
        {(isSocial || isMeeting) && (
          <div className="event-detail-comments">
            {/* Comments List */}
            {comments.length > 0 && (
              <div className="comments-list">
                {comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    <img
                      src={comment.avatar}
                      alt={comment.author}
                      className="comment-avatar"
                    />
                    <div className="comment-content">
                      <div className="comment-header">
                        <span className="comment-author">{comment.author}</span>
                        <span className="comment-time">{comment.timestamp}</span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Comment Input */}
            <div className="comment-input-container">
              <img
                src={userAvatar}
                alt="You"
                className="comment-input-avatar"
              />
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Post a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  className="comment-post-btn"
                  onClick={handlePostComment}
                  disabled={!newComment.trim()}
                >
                  Post
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default EventDetail
