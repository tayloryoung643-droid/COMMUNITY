import { useState, useEffect } from 'react'
import { ChevronLeft, Check, HelpCircle, X, CalendarPlus, Send, Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabase'
import './EventDetail.css'

function EventDetail({ event, onBack, onNavigate }) {
  const { userProfile, isDemoMode, buildingBackgroundUrl } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [rsvpStatus, setRsvpStatus] = useState(event?.rsvpStatus || null)
  const [comments, setComments] = useState([])
  const [newComment, setNewComment] = useState('')
  const [acknowledged, setAcknowledged] = useState(false)
  const [organizer, setOrganizer] = useState(null)
  const [orgAvatarUrl, setOrgAvatarUrl] = useState(null)
  const [isPostingComment, setIsPostingComment] = useState(false)

  // Resolve the real event ID (strip occurrence suffix like "uuid-2026-01-15T...")
  const realEventId = typeof event?.id === 'string' && event.id.includes('-') && event.id.length > 36
    ? event.id.split('-').slice(0, 5).join('-')
    : event?.id

  // Fetch event creator profile — works even if created_by wasn't passed from parent
  useEffect(() => {
    async function fetchCreator() {
      if (isInDemoMode) return

      let createdBy = event?.created_by

      // If created_by is missing, fetch the event record to get it
      if (!createdBy && realEventId) {
        try {
          const { data: eventRecord } = await supabase
            .from('events')
            .select('created_by')
            .eq('id', realEventId)
            .single()
          createdBy = eventRecord?.created_by
        } catch {
          // Event might not exist with this ID (e.g. occurrence ID)
        }
      }

      if (!createdBy) return

      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, full_name, role, unit_number, avatar_url')
          .eq('id', createdBy)
          .single()

        if (!error && data) {
          const isManager = data.role === 'manager' || data.role === 'building_manager'
          setOrganizer({
            name: data.full_name || 'Event Organizer',
            role: isManager ? 'Property Manager' : (data.unit_number ? `Unit ${data.unit_number}` : 'Resident'),
            avatarPath: data.avatar_url || null
          })

          // Generate signed URL for avatar
          if (data.avatar_url) {
            try {
              const { data: urlData } = await supabase.storage
                .from('profile-images')
                .createSignedUrl(data.avatar_url, 3600)
              if (urlData?.signedUrl) {
                setOrgAvatarUrl(urlData.signedUrl)
              }
            } catch {
              // Ignore avatar URL errors
            }
          }
        }
      } catch (err) {
        console.warn('[EventDetail] Error fetching creator:', err)
      }
    }

    fetchCreator()
  }, [event?.created_by, realEventId, isInDemoMode])

  // Fetch comments from Supabase (two queries — avoids FK join issues)
  const fetchComments = async () => {
    if (isInDemoMode || !realEventId) return

    console.log('[Comments] Fetching comments for event:', realEventId)

    try {
      // Step 1: Fetch comments (no join)
      const { data: commentsData, error } = await supabase
        .from('event_comments')
        .select('id, content, created_at, user_id')
        .eq('event_id', realEventId)
        .order('created_at', { ascending: true })

      if (error) {
        console.error('[Comments] Fetch error:', error)
        return
      }

      console.log('[Comments] Fetched', commentsData?.length || 0, 'comments:', commentsData)

      if (!commentsData || commentsData.length === 0) {
        setComments([])
        return
      }

      // Step 2: Fetch user profiles for all commenters
      const userIds = [...new Set(commentsData.map(c => c.user_id))]
      const { data: profiles } = await supabase
        .from('users')
        .select('id, full_name, avatar_url')
        .in('id', userIds)

      console.log('[Comments] Fetched profiles for commenters:', profiles)

      // Step 3: Merge profiles + generate signed avatar URLs
      const commentsWithAvatars = await Promise.all(commentsData.map(async (c) => {
        const profile = profiles?.find(p => p.id === c.user_id)
        let avatarUrl = null
        if (profile?.avatar_url) {
          try {
            const { data: urlData } = await supabase.storage
              .from('profile-images')
              .createSignedUrl(profile.avatar_url, 3600)
            avatarUrl = urlData?.signedUrl || null
          } catch { /* ignore */ }
        }
        return {
          id: c.id,
          author: profile?.full_name || 'Resident',
          avatar: avatarUrl,
          text: c.content,
          timestamp: formatRelativeTime(c.created_at),
          userId: c.user_id
        }
      }))
      setComments(commentsWithAvatars)
    } catch (err) {
      console.error('[Comments] Fetch exception:', err)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [realEventId, isInDemoMode])

  // Format relative time
  function formatRelativeTime(dateString) {
    const now = new Date()
    const date = new Date(dateString)
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Weather and time state
  const [currentTime, setCurrentTime] = useState(new Date())
  const weatherData = { temp: 58, condition: 'clear', conditionText: 'Mostly Clear' }

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

  if (!event) return null

  const isSocial = event.category === 'social'
  const isMaintenance = event.category === 'maintenance'
  const isMeeting = event.category === 'meeting'

  // Format 24h time string to 12h format
  const formatEventTime = (timeString) => {
    if (!timeString) return 'TBD'
    if (/[AaPp][Mm]/.test(timeString)) return timeString
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

  const formatEventDate = (dateString, timeString) => {
    const date = new Date(dateString)
    const options = { weekday: 'long', month: 'long', day: 'numeric' }
    const formattedDate = date.toLocaleDateString('en-US', options)
    return `${formattedDate} • ${formatEventTime(timeString)}`
  }

  const handleRsvp = (status) => setRsvpStatus(status)
  const handleAcknowledge = () => setAcknowledged(true)

  // Post comment to Supabase
  const handlePostComment = async () => {
    console.log('[Comments] Post clicked, text:', newComment, 'eventId:', realEventId, 'userId:', userProfile?.id)

    if (!newComment.trim()) return

    if (isInDemoMode) {
      setComments(prev => [...prev, {
        id: Date.now(),
        author: 'You',
        avatar: null,
        text: newComment.trim(),
        timestamp: 'Just now'
      }])
      setNewComment('')
      return
    }

    setIsPostingComment(true)
    try {
      const insertPayload = {
        event_id: realEventId,
        user_id: userProfile.id,
        content: newComment.trim()
      }
      console.log('[Comments] Inserting:', insertPayload)

      const { data, error } = await supabase
        .from('event_comments')
        .insert(insertPayload)
        .select('id, content, created_at')
        .single()

      if (error) {
        console.error('[Comments] Insert error:', error)
        throw error
      }

      console.log('[Comments] Insert success:', data)

      setComments(prev => [...prev, {
        id: data.id,
        author: userProfile.full_name || 'You',
        avatar: null,
        text: data.content,
        timestamp: 'Just now',
        userId: userProfile.id
      }])
      setNewComment('')
    } catch (err) {
      console.error('[Comments] Post failed:', err)
    } finally {
      setIsPostingComment(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handlePostComment()
    }
  }

  // Add to Calendar (.ics download)
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
      pad(d.getUTCMonth() + 1) + pad(d.getUTCDate()) + 'T' +
      pad(d.getUTCHours()) + pad(d.getUTCMinutes()) + pad(d.getUTCSeconds()) + 'Z'
    const esc = (t) => (t || '').replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n')

    const ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//CommunityHQ//Events//EN',
      'BEGIN:VEVENT',
      `UID:event-${event.id}@communityhq.space`,
      `DTSTART:${fmtDate(startDate)}`, `DTEND:${fmtDate(endDate)}`,
      `SUMMARY:${esc(event.title)}`,
      event.description ? `DESCRIPTION:${esc(event.description)}` : null,
      event.location ? `LOCATION:${esc(event.location)}` : null,
      'END:VEVENT', 'END:VCALENDAR'
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
  const orgName = organizer?.name || 'Event Organizer'
  const orgRole = organizer?.role || 'Property Management'
  const orgAvatar = orgAvatarUrl
  const orgInitials = orgName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  const bgStyle = buildingBackgroundUrl ? { '--building-bg-image': `url(${buildingBackgroundUrl})` } : {}

  return (
    <div className="event-detail-container resident-inner-page" style={bgStyle}>
      <div className="inner-page-hero">
        <button className="inner-page-back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
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
          <h1 className="inner-page-title">{event.title}</h1>
        </div>
      </div>

      <div className="event-detail-content">
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

        {/* Attendance */}
        {isSocial && event.attendees && (
          <div className="event-detail-attendance">
            <span className="attendance-count">{event.attendees.count} neighbors going</span>
            <div className="attendance-avatars">
              {event.attendees.avatars?.slice(0, 5).map((avatar, index) => (
                <img key={index} src={avatar} alt="Attendee" className="attendance-avatar" style={{ zIndex: 5 - index }} />
              ))}
              {event.attendees.count > 5 && (
                <div className="attendance-more">+{event.attendees.count - 5}</div>
              )}
            </div>
          </div>
        )}

        {/* RSVP Buttons */}
        {isSocial && (
          <div className="event-detail-rsvp">
            <button className={`rsvp-btn rsvp-going ${rsvpStatus === 'going' ? 'active' : ''}`} onClick={() => handleRsvp('going')}>
              <Check size={18} /><span>Going</span>
            </button>
            <button className={`rsvp-btn rsvp-maybe ${rsvpStatus === 'maybe' ? 'active' : ''}`} onClick={() => handleRsvp('maybe')}>
              <HelpCircle size={18} /><span>Maybe</span>
            </button>
            <button className={`rsvp-btn rsvp-not-going ${rsvpStatus === 'not-going' ? 'active' : ''}`} onClick={() => handleRsvp('not-going')}>
              <X size={18} /><span>Not Going</span>
            </button>
          </div>
        )}

        {isMaintenance && (
          <div className="event-detail-acknowledge">
            <button className={`acknowledge-btn ${acknowledged ? 'acknowledged' : ''}`} onClick={handleAcknowledge} disabled={acknowledged}>
              <Check size={18} /><span>{acknowledged ? 'Acknowledged' : 'Got it'}</span>
            </button>
          </div>
        )}

        {isMeeting && (
          <div className="event-detail-rsvp">
            <button className={`rsvp-btn rsvp-going ${rsvpStatus === 'going' ? 'active' : ''}`} onClick={() => handleRsvp('going')}>
              <Check size={18} /><span>Attending</span>
            </button>
            <button className={`rsvp-btn rsvp-maybe ${rsvpStatus === 'maybe' ? 'active' : ''}`} onClick={() => handleRsvp('maybe')}>
              <HelpCircle size={18} /><span>Maybe</span>
            </button>
          </div>
        )}

        <button className="add-to-calendar-btn" onClick={handleAddToCalendar}>
          <CalendarPlus size={18} /><span>Add to Calendar</span>
        </button>

        <div className="event-detail-card about-card">
          <h3 className="about-title">About this Event</h3>
          <p className="about-description">{event.description}</p>
          {event.affectedUnits && (
            <p className="about-affected"><strong>Affected:</strong> {event.affectedUnits}</p>
          )}
        </div>

        {/* Comments Section */}
        {(isSocial || isMeeting) && (
          <div className="event-detail-comments">
            {comments.length > 0 && (
              <div className="comments-list">
                {comments.map(comment => (
                  <div key={comment.id} className="comment-item">
                    {comment.avatar ? (
                      <img src={comment.avatar} alt={comment.author} className="comment-avatar" />
                    ) : (
                      <div className="comment-avatar comment-avatar-fallback">
                        {(comment.author || '?').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </div>
                    )}
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

            <div className="comment-input-container">
              <div className="comment-avatar comment-avatar-fallback comment-input-avatar">
                {(userProfile?.full_name || 'Y').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
              </div>
              <div className="comment-input-wrapper">
                <input
                  type="text"
                  className="comment-input"
                  placeholder="Post a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={isPostingComment}
                />
                <button
                  className="comment-post-btn"
                  onClick={handlePostComment}
                  disabled={!newComment.trim() || isPostingComment}
                >
                  {isPostingComment ? '...' : 'Post'}
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
