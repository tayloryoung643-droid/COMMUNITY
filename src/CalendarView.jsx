import { useState, useEffect } from 'react'
import { Calendar, ChevronRight, ChevronLeft, Wrench, Wine, Users, Megaphone, Bell, Clock, List, Grid3X3, Sun, Cloud, CloudRain, Snowflake, Moon, AlertCircle } from 'lucide-react'
import HamburgerMenu from './HamburgerMenu'
import './CalendarView.css'

function CalendarView({ onNavigate }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'

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

  // Combined events and announcements data - 12 months of events
  const calendarItems = [
    // January 2026
    {
      id: 1,
      date: '2026-01-25',
      time: '7:00 PM',
      title: 'Wine & Cheese Social',
      description: 'Meet your neighbors over wine and cheese in the Rooftop Lounge.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 2,
      date: '2026-01-28',
      time: '10:00 AM - 2:00 PM',
      title: 'Fire Alarm Testing',
      description: 'Annual fire alarm system testing. Expect intermittent alarms throughout the building.',
      category: 'maintenance',
      categoryLabel: 'Maintenance',
      icon: Wrench,
      color: '#f59e0b',
      actionRequired: false,
      affectedUnits: 'All units'
    },
    // February 2026
    {
      id: 3,
      date: '2026-02-01',
      time: '9:00 AM',
      title: 'Farmers Market Saturday',
      description: 'Local vendors with fresh produce, baked goods, and artisan crafts.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 4,
      date: '2026-02-08',
      time: '7:30 PM',
      title: 'Movie in the Park',
      description: 'Outdoor movie screening in the Courtyard. Popcorn provided!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 5,
      date: '2026-02-12',
      time: '6:00 PM',
      title: 'Building Town Hall',
      description: 'Monthly meeting to discuss building updates, financials, and resident concerns.',
      category: 'meeting',
      categoryLabel: 'Meeting',
      icon: Users,
      color: '#3b82f6'
    },
    {
      id: 6,
      date: '2026-02-14',
      time: '7:00 PM',
      title: "Valentine's Day Mixer",
      description: 'Singles and couples welcome! Appetizers and mocktails in the Rooftop Lounge.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 7,
      date: '2026-02-22',
      time: '8:00 AM',
      title: 'Yoga in the Garden',
      description: 'Free morning yoga class for all residents in the Rooftop Garden.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    // March 2026
    {
      id: 8,
      date: '2026-03-01',
      time: '9:00 AM - 12:00 PM',
      title: 'Water Shut-off Notice',
      description: 'Scheduled maintenance on water pipes. Please store water in advance.',
      category: 'maintenance',
      categoryLabel: 'Maintenance',
      icon: Wrench,
      color: '#f59e0b',
      actionRequired: true,
      affectedUnits: 'Floors 5-10'
    },
    {
      id: 9,
      date: '2026-03-08',
      time: '10:00 AM',
      title: 'Spring Cleaning Drive',
      description: 'Donate unwanted items in the Lobby. All donations go to local charities.',
      category: 'meeting',
      categoryLabel: 'Meeting',
      icon: Users,
      color: '#3b82f6'
    },
    {
      id: 10,
      date: '2026-03-17',
      time: '6:00 PM',
      title: "St. Patrick's Day Party",
      description: 'Green beer, Irish music, and fun in the Rooftop Lounge!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 11,
      date: '2026-03-22',
      time: '9:00 AM',
      title: 'Coffee & Conversation',
      description: 'Casual morning meetup in the Café Lounge. Coffee and pastries provided.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    // April 2026
    {
      id: 12,
      date: '2026-04-05',
      time: '6:00 PM',
      title: 'Art Show & Gallery Night',
      description: 'Resident art exhibition in the Community Room. Wine and appetizers.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 13,
      date: '2026-04-12',
      time: '11:00 AM',
      title: 'Easter Egg Hunt',
      description: 'Fun for kids and families in the Courtyard!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 14,
      date: '2026-04-18',
      time: '8:00 AM - 5:00 PM',
      title: 'Elevator Maintenance',
      description: 'East elevator will be out of service for routine maintenance.',
      category: 'maintenance',
      categoryLabel: 'Maintenance',
      icon: Wrench,
      color: '#f59e0b',
      actionRequired: false,
      affectedUnits: 'East tower'
    },
    {
      id: 15,
      date: '2026-04-22',
      time: '10:00 AM',
      title: 'Earth Day Tree Planting',
      description: 'Help plant new trees in the Rooftop Garden!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    // May 2026
    {
      id: 16,
      date: '2026-05-03',
      time: '7:00 PM',
      title: 'Live Jazz Night',
      description: 'Live jazz performance in the Rooftop Lounge.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 17,
      date: '2026-05-05',
      time: '6:00 PM',
      title: 'Cinco de Mayo Fiesta',
      description: 'Tacos, margaritas, and music in the Courtyard!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 18,
      date: '2026-05-11',
      time: '11:00 AM',
      title: "Mother's Day Brunch",
      description: 'Special brunch for mothers in the Community Room.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 19,
      date: '2026-05-14',
      time: '6:00 PM',
      title: 'Building Town Hall',
      description: 'Monthly meeting to discuss building updates and resident concerns.',
      category: 'meeting',
      categoryLabel: 'Meeting',
      icon: Users,
      color: '#3b82f6'
    },
    {
      id: 20,
      date: '2026-05-20',
      time: '6:00 PM',
      title: 'Fire Safety Training',
      description: 'Learn fire safety procedures. Mandatory for floor wardens.',
      category: 'maintenance',
      categoryLabel: 'Maintenance',
      icon: Wrench,
      color: '#f59e0b',
      actionRequired: true,
      affectedUnits: 'Floor wardens'
    },
    {
      id: 21,
      date: '2026-05-26',
      time: '12:00 PM',
      title: 'Memorial Day BBQ',
      description: 'Annual Memorial Day cookout on the Rooftop. Burgers and hot dogs!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    // June 2026
    {
      id: 22,
      date: '2026-06-07',
      time: '2:00 PM',
      title: 'Summer Kickoff Pool Party',
      description: 'Pool party with DJ, snacks, and drinks on the Pool Deck.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 23,
      date: '2026-06-15',
      time: '7:00 PM',
      title: "Father's Day Poker Night",
      description: 'Texas Hold\'em tournament in the Game Room. Prizes for winners!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 24,
      date: '2026-06-21',
      time: '7:00 PM',
      title: 'Book Club Meeting',
      description: 'Monthly book club in the Library. This month: "The Midnight Library".',
      category: 'meeting',
      categoryLabel: 'Meeting',
      icon: Users,
      color: '#3b82f6'
    },
    // July 2026
    {
      id: 25,
      date: '2026-07-04',
      time: '8:00 PM',
      title: 'Independence Day Fireworks Watch',
      description: 'Watch the city fireworks from the Rooftop!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 26,
      date: '2026-07-12',
      time: '6:00 PM',
      title: 'Summer Concert Series',
      description: 'Live band performance in the Courtyard.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 27,
      date: '2026-07-19',
      time: '3:00 PM',
      title: 'Ice Cream Social',
      description: 'Beat the heat with free ice cream in the Lobby!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    // August 2026
    {
      id: 28,
      date: '2026-08-02',
      time: 'All Day',
      title: 'HVAC Maintenance',
      description: 'Annual HVAC system maintenance. AC may be unavailable intermittently.',
      category: 'maintenance',
      categoryLabel: 'Maintenance',
      icon: Wrench,
      color: '#f59e0b',
      actionRequired: false,
      affectedUnits: 'All units'
    },
    {
      id: 29,
      date: '2026-08-13',
      time: '6:00 PM',
      title: 'Building Town Hall',
      description: 'Monthly meeting to discuss building updates and Q3 financials.',
      category: 'meeting',
      categoryLabel: 'Meeting',
      icon: Users,
      color: '#3b82f6'
    },
    {
      id: 30,
      date: '2026-08-15',
      time: '10:00 AM',
      title: 'Back to School Drive',
      description: 'Donate school supplies in the Lobby for local students.',
      category: 'meeting',
      categoryLabel: 'Meeting',
      icon: Users,
      color: '#3b82f6'
    },
    {
      id: 31,
      date: '2026-08-30',
      time: '5:00 PM',
      title: 'End of Summer Luau',
      description: 'Hawaiian-themed party on the Pool Deck. Leis provided!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    // September 2026
    {
      id: 32,
      date: '2026-09-01',
      time: '12:00 PM',
      title: 'Labor Day Cookout',
      description: 'End of summer BBQ on the Rooftop.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 33,
      date: '2026-09-20',
      time: '2:00 PM',
      title: 'Fall Festival',
      description: 'Pumpkin decorating, apple cider, and fall activities in the Courtyard.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    // October 2026
    {
      id: 34,
      date: '2026-10-04',
      time: '8:00 PM',
      title: 'Karaoke Night',
      description: 'Show off your singing skills in the Rooftop Lounge!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 35,
      date: '2026-10-31',
      time: '7:00 PM',
      title: 'Halloween Costume Party',
      description: 'Costume contest with prizes in the Community Room!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    // November 2026
    {
      id: 36,
      date: '2026-11-08',
      time: '9:00 AM - 3:00 PM',
      title: 'Heating System Check',
      description: 'Annual heating system inspection before winter.',
      category: 'maintenance',
      categoryLabel: 'Maintenance',
      icon: Wrench,
      color: '#f59e0b',
      actionRequired: true,
      affectedUnits: 'All units'
    },
    {
      id: 37,
      date: '2026-11-12',
      time: '6:00 PM',
      title: 'Building Town Hall',
      description: 'Monthly meeting to discuss winter preparations and annual budget.',
      category: 'meeting',
      categoryLabel: 'Meeting',
      icon: Users,
      color: '#3b82f6'
    },
    {
      id: 38,
      date: '2026-11-27',
      time: '4:00 PM',
      title: 'Thanksgiving Potluck',
      description: 'Bring a dish to share in the Community Room!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    // December 2026
    {
      id: 39,
      date: '2026-12-06',
      time: '6:00 PM',
      title: 'Holiday Tree Lighting',
      description: 'Annual tree lighting ceremony in the Lobby. Hot cocoa and cookies!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 40,
      date: '2026-12-13',
      time: '2:00 PM',
      title: 'Holiday Movie Marathon',
      description: 'Classic holiday films in the Theater Room. Popcorn provided!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 41,
      date: '2026-12-31',
      time: '9:00 PM',
      title: "New Year's Eve Gala",
      description: 'Ring in the new year in style! Champagne toast at midnight in the Rooftop Lounge.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    }
  ]

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
    const groupOrder = ['Today', 'Tomorrow', 'This Week', 'Next Week', 'Coming Up']

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

  return (
    <div className="calendar-view-container resident-inner-page">
      {/* Hero Section with Weather and Title */}
      <div className="inner-page-hero">
        {/* Hamburger Menu */}
        <HamburgerMenu onNavigate={onNavigate} />

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

        {viewMode === 'list' ? (
          /* List View - Grouped by temporal periods */
          <div className="calendar-list">
            {groupedEvents.map(group => (
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
                    >
                      <div className="calendar-card-header">
                        <div className="calendar-date-info">
                          <span className="calendar-exact-date">{formatDateLong(item.date)}</span>
                          <span className="calendar-time-inline">{item.time}</span>
                        </div>
                        {item.actionRequired && (
                          <span className="action-required-badge">
                            <AlertCircle size={12} />
                            Action Required
                          </span>
                        )}
                      </div>

                      <div className="calendar-card-body">
                        <div className={`calendar-icon ${isMaintenance ? 'maintenance-icon' : ''}`} style={{ background: `${item.color}${isMaintenance ? '30' : '15'}` }}>
                          <IconComponent size={20} style={{ color: item.color }} />
                        </div>
                        <div className="calendar-details">
                          <h3 className="calendar-title">{item.title}</h3>
                          <p className="calendar-description">{item.description}</p>
                          {item.affectedUnits && (
                            <span className="affected-units">{item.affectedUnits}</span>
                          )}
                        </div>
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
                    <div key={item.id} className={`month-event-item ${isMaintenance ? 'maintenance' : ''}`}>
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
        )}
      </main>
    </div>
  )
}

export default CalendarView
