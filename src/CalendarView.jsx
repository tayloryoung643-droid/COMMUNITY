import { useState, useEffect } from 'react'
import { Calendar, ChevronRight, ChevronLeft, List, Grid3X3, Sun, Cloud, CloudRain, Snowflake, Moon, AlertCircle } from 'lucide-react'
import HamburgerMenu from './HamburgerMenu'
import { useAuth } from './contexts/AuthContext'
import { eventsData } from './eventsData'
import { getEvents } from './services/eventService'
import EmptyState from './components/EmptyState'
import './CalendarView.css'

function CalendarView({ onNavigate }) {
  const { userProfile, isDemoMode, buildingBackgroundUrl } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [activeFilter, setActiveFilter] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [isMobile, setIsMobile] = useState(false)
  const [calendarItems, setCalendarItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Detect mobile viewport and default to list view
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 480
      setIsMobile(mobile)
      // Auto-switch to list view on mobile if user hasn't manually chosen
      if (mobile && viewMode === 'calendar') {
        // Only auto-switch on initial load, not on resize
      }
    }

    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

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

  // Load events based on demo mode
  useEffect(() => {
    async function loadCalendarEvents() {
      if (isInDemoMode) {
        console.log('[CalendarView] MODE: DEMO - using demo events, count:', eventsData.length)
        setCalendarItems(eventsData)
        setLoading(false)
        return
      }

      // Real mode - fetch from Supabase
      const buildingId = userProfile?.building_id
      console.log('[CalendarView] MODE: REAL - fetching events for building:', buildingId)

      if (!buildingId) {
        console.log('[CalendarView] No building_id - showing empty state')
        setCalendarItems([])
        setLoading(false)
        return
      }

      try {
        const data = await getEvents(buildingId)
        // data will be [] if table is empty - this is SUCCESS, not an error
        const transformedData = (data || []).map(event => ({
          id: event.id,
          title: event.title || 'Untitled Event',
          date: event.start_time?.split('T')[0] || event.date,
          time: event.event_time || (event.start_time ? new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }) : 'TBD'),
          location: event.location || 'TBD',
          description: event.description || '',
          category: event.category || 'social',
          color: event.category === 'maintenance' ? '#f59e0b' : '#3b82f6',
          icon: Calendar,
          actionRequired: event.action_required || false,
          affectedUnits: event.affected_units
        }))
        setCalendarItems(transformedData)
        setError(null) // Clear any previous error
        console.log('[CalendarView] SUCCESS - events loaded:', transformedData.length)
      } catch (err) {
        // Only set error for actual failures (network, permission, table doesn't exist)
        console.error('[CalendarView] ERROR loading events:', {
          message: err.message,
          code: err.code,
          details: err.details,
          hint: err.hint
        })
        setError(`Failed to load events: ${err.message || 'Unknown error'}`)
        setCalendarItems([]) // Show empty state alongside error
      } finally {
        setLoading(false)
      }
    }

    loadCalendarEvents()
  }, [isInDemoMode, userProfile])

  // Handler to open event detail
  const handleEventClick = (event) => {
    if (onNavigate) {
      onNavigate('EventDetail', event)
    }
  }

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'social', label: 'Social' },
    { id: 'meeting', label: 'Meeting' },
    { id: 'maintenance', label: 'Maintenance' }
  ]

  const filteredItems = activeFilter === 'all'
    ? calendarItems
    : calendarItems.filter(item => item.category === activeFilter)

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { weekday: 'short', month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const formatDateLong = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  const getTemporalGroup = (dateString) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(dateString)
    date.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((date - today) / (1000 * 60 * 60 * 24))

    // Get day of week (0 = Sunday)
    const todayDayOfWeek = today.getDay()
    const daysUntilEndOfWeek = 6 - todayDayOfWeek // Days until Saturday

    if (diffDays < 0) return 'Past'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= daysUntilEndOfWeek) return 'This Week'
    if (diffDays <= daysUntilEndOfWeek + 7) return 'Next Week'
    return 'Coming Up'
  }

  // Group events by temporal period
  const groupEventsByTime = (items) => {
    const groups = {}
    const groupOrder = ['Today', 'Tomorrow', 'This Week', 'Next Week', 'Coming Up', 'Past']

    items.forEach(item => {
      const group = getTemporalGroup(item.date)
      if (!groups[group]) {
        groups[group] = []
      }
      groups[group].push(item)
    })

    // Return ordered array of groups
    return groupOrder
      .filter(group => groups[group] && groups[group].length > 0)
      .map(group => ({
        title: group,
        items: groups[group]
      }))
  }

  const groupedEvents = groupEventsByTime(filteredItems)

  // Calendar grid helpers
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)) // January 2026

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    // Add empty cells for days before the 1st
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    // Add the actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const getEventsForDay = (day) => {
    if (!day) return []
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    return filteredItems.filter(item => item.date === dateStr)
  }

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  // CSS variable for building background image
  const bgStyle = buildingBackgroundUrl ? { '--building-bg-image': `url(${buildingBackgroundUrl})` } : {}

  return (
    <div className="calendar-view-container resident-inner-page" style={bgStyle}>
      {/* Hero Section with Weather and Title */}
      <div className="inner-page-hero">
        {/* Hamburger Menu */}
        <HamburgerMenu onNavigate={onNavigate} currentScreen="calendar" />

        {/* Weather Widget - matches Home exactly */}
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

        {/* Page Title - centered like "The Paramount" */}
        <div className="inner-page-title-container">
          <h1 className="inner-page-title">Calendar</h1>
        </div>
      </div>

      <main className="calendar-view-content">
        {/* View Toggle */}
        <div className="calendar-view-controls">
          <button
            className="view-toggle-btn"
            data-view={viewMode}
            onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
            aria-label={viewMode === 'list' ? 'Switch to calendar view' : 'Switch to list view'}
          >
            {viewMode === 'list' ? <Grid3X3 size={20} /> : <List size={20} />}
          </button>
        </div>
        {/* Filter Tabs */}
        <div className="calendar-filters">
          {filters.map(filter => (
            <button
              key={filter.id}
              className={`filter-btn ${activeFilter === filter.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255,255,255,0.6)' }}>
            Loading events...
          </div>
        )}

        {/* Error State - only show when there's an actual error */}
        {!loading && error && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#ef4444' }}>
            <AlertCircle size={32} style={{ marginBottom: '12px' }} />
            <p>{error}</p>
          </div>
        )}

        {/* Empty State - show when no error and no data */}
        {!loading && !error && calendarItems.length === 0 && (
          <EmptyState
            icon="calendar"
            title="No events yet"
            subtitle="Check back later for upcoming building events"
          />
        )}

        {/* Content - only show when we have data */}
        {!loading && !error && calendarItems.length > 0 && (
          viewMode === 'list' ? (
          /* List View - Grouped by temporal periods */
          <div className="calendar-list">
            {groupedEvents.length === 0 ? (
              <div className="no-events-message" style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.5)' }}>
                No {activeFilter === 'all' ? '' : activeFilter + ' '}events found
              </div>
            ) : groupedEvents.map(group => (
              <div key={group.title} className="event-group">
                <div className="event-group-header">
                  <h2 className="event-group-title">{group.title}</h2>
                </div>

                {group.items.map(item => {
                  const IconComponent = item.icon
                  const isMaintenance = item.category === 'maintenance'

                  return (
                    <article
                      key={item.id}
                      className={`calendar-card ${isMaintenance ? 'maintenance-card' : ''} ${item.actionRequired ? 'action-required' : ''}`}
                      onClick={() => handleEventClick(item)}
                    >
                      <div className={`calendar-icon ${isMaintenance ? 'maintenance-icon' : ''}`} style={{ background: `${item.color}${isMaintenance ? '30' : '15'}` }}>
                        <IconComponent size={20} style={{ color: item.color }} />
                      </div>
                      <div className="calendar-details">
                        <h3 className="calendar-title">{item.title}</h3>
                        <span className="calendar-meta">
                          {group.title === 'Today' ? 'Today' : formatDate(item.date)} • {item.time}
                        </span>
                        {item.description && (
                          <p className="calendar-description">{item.description}</p>
                        )}
                        {item.actionRequired && (
                          <span className="action-required-badge">
                            <AlertCircle size={12} />
                            Action Required
                          </span>
                        )}
                        {item.affectedUnits && (
                          <span className="affected-units">{item.affectedUnits}</span>
                        )}
                      </div>
                    </article>
                  )
                })}
              </div>
            ))}
          </div>
        ) : (
          /* Calendar Grid View */
          <div className="calendar-grid-container">
            {/* Mobile hint */}
            {isMobile && (
              <div className="mobile-grid-hint">
                Tap the list icon for a better mobile experience
              </div>
            )}
            {/* Month Navigation */}
            <div className="month-navigation">
              <button className="month-nav-btn" onClick={prevMonth}>
                <ChevronLeft size={20} />
              </button>
              <h2 className="month-title">{formatMonthYear(currentMonth)}</h2>
              <button className="month-nav-btn" onClick={nextMonth}>
                <ChevronRight size={20} />
              </button>
            </div>

            {/* Day Headers */}
            <div className="calendar-grid-header">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="day-header">{day}</div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="calendar-grid">
              {getDaysInMonth(currentMonth).map((day, index) => {
                const events = getEventsForDay(day)
                const today = new Date()
                const isToday = day &&
                  currentMonth.getMonth() === today.getMonth() &&
                  currentMonth.getFullYear() === today.getFullYear() &&
                  day === today.getDate()

                return (
                  <div
                    key={index}
                    className={`calendar-day ${!day ? 'empty' : ''} ${isToday ? 'today' : ''} ${events.length > 0 ? 'has-events' : ''}`}
                  >
                    <div className="calendar-day-inner">
                      {day && (
                        <>
                          <span className="day-number">{day}</span>
                          {events.length > 0 && (
                            <div className="day-events">
                              {events.slice(0, 2).map(event => (
                                <div
                                  key={event.id}
                                  className="day-event-dot"
                                  style={{ background: event.color }}
                                  title={event.title}
                                />
                              ))}
                              {events.length > 2 && (
                                <span className="more-events">+{events.length - 2}</span>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Events for selected month */}
            <div className="month-events-list">
              <h3 className="month-events-title">Events this month</h3>
              {(() => {
                const monthEvents = filteredItems.filter(item => {
                  const itemDate = new Date(item.date)
                  return itemDate.getMonth() === currentMonth.getMonth() &&
                         itemDate.getFullYear() === currentMonth.getFullYear()
                })

                if (monthEvents.length === 0) {
                  return (
                    <div className="no-events-message">
                      No {activeFilter === 'all' ? '' : activeFilter + ' '}events this month
                    </div>
                  )
                }

                return monthEvents.map(item => {
                  const isMaintenance = item.category === 'maintenance'
                  return (
                    <div key={item.id} className={`month-event-item ${isMaintenance ? 'maintenance' : ''}`} onClick={() => handleEventClick(item)} style={{ cursor: 'pointer' }}>
                      <div className="month-event-dot" style={{ background: item.color }} />
                      <div className="month-event-info">
                        <span className="month-event-date">{formatDate(item.date)} · {item.time}</span>
                        <span className="month-event-title">{item.title}</span>
                        {item.actionRequired && (
                          <span className="month-event-action">Action Required</span>
                        )}
                      </div>
                    </div>
                  )
                })
              })()}
            </div>
          </div>
        )
        )}
      </main>
    </div>
  )
}

export default CalendarView
