import { useState, useEffect } from 'react'
import { ChevronLeft, Check, HelpCircle, X, CalendarPlus, Send, Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import HamburgerMenu from './HamburgerMenu'
import './EventDetail.css'

function EventDetail({ event, onBack, onNavigate }) {
  const [rsvpStatus, setRsvpStatus] = useState(event?.userRsvp || null)
  const [comments, setComments] = useState(event?.comments || [])
  const [newComment, setNewComment] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)

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

  // Format date for display
  const formatEventDate = (dateString, timeString) => {
    const date = new Date(dateString)
    const options = { weekday: 'long', month: 'long', day: 'numeric' }
    const formattedDate = date.toLocaleDateString('en-US', options)
    return `${formattedDate} • ${timeString}`
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

  return (
    <div className="event-detail-container resident-inner-page">
      {/* Hero Section - matches Calendar exactly */}
      <div className="inner-page-hero">
        {/* Back Button */}
        <button className="inner-page-back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>

        {/* Hamburger Menu */}
        <HamburgerMenu onNavigate={onNavigate} currentScreen="event-detail" />

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
            <img
              src={event.organizer?.avatar || '/images/profile-staff.jpg'}
              alt={event.organizer?.name || 'Building Staff'}
              className="organizer-avatar"
            />
            <div className="organizer-details">
              <span className="organizer-name">{event.organizer?.name || 'Building Staff'}</span>
              <span className="organizer-role">{event.organizer?.role || 'Property Management'}</span>
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
        <button className="add-to-calendar-btn">
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
