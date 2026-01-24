import { useState } from 'react'
import { ArrowLeft, Calendar, ChevronRight, ChevronLeft, Wrench, Wine, Users, Megaphone, Bell, Clock, List, Grid3X3 } from 'lucide-react'
import './CalendarView.css'

function CalendarView({ onBack }) {
  const [activeFilter, setActiveFilter] = useState('all')
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'

  // Combined events and announcements data
  const calendarItems = [
    {
      id: 1,
      date: '2026-01-15',
      time: '9am - 12pm',
      title: 'Water shut off - Floors 10-15',
      description: 'Scheduled maintenance on water pipes. Please store water in advance.',
      category: 'maintenance',
      categoryLabel: 'Maintenance',
      icon: Wrench,
      color: '#f59e0b'
    },
    {
      id: 2,
      date: '2026-01-18',
      time: '7pm',
      title: 'Building Town Hall',
      description: 'Monthly meeting to discuss building updates, financials, and resident concerns.',
      category: 'meeting',
      categoryLabel: 'Meeting',
      icon: Users,
      color: '#3b82f6'
    },
    {
      id: 3,
      date: '2026-01-20',
      time: '6pm',
      title: 'Rooftop BBQ',
      description: 'Join us for a community BBQ on the rooftop! Burgers and drinks provided.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 4,
      date: '2026-01-22',
      time: '10am - 2pm',
      title: 'Fire alarm testing',
      description: 'Annual fire alarm system testing. Expect intermittent alarms.',
      category: 'maintenance',
      categoryLabel: 'Maintenance',
      icon: Wrench,
      color: '#f59e0b'
    },
    {
      id: 5,
      date: '2026-01-25',
      time: '7:30pm',
      title: 'Wine & Cheese Social',
      description: 'Meet your neighbors over wine and cheese in the party room.',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 6,
      date: '2026-01-28',
      time: '8am',
      title: 'Yoga in the Courtyard',
      description: 'Free yoga class for all residents. Bring your own mat!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 7,
      date: '2026-02-01',
      time: 'All day',
      title: 'Pest control inspection',
      description: 'Quarterly pest control inspection. Please ensure access to your unit.',
      category: 'maintenance',
      categoryLabel: 'Maintenance',
      icon: Wrench,
      color: '#f59e0b'
    },
    {
      id: 8,
      date: '2026-02-05',
      time: '6pm',
      title: 'Super Bowl Watch Party',
      description: 'Watch the big game on the big screen in the party room!',
      category: 'social',
      categoryLabel: 'Social',
      icon: Wine,
      color: '#8b5cf6'
    },
    {
      id: 9,
      date: '2026-02-10',
      time: '9am - 5pm',
      title: 'Elevator maintenance',
      description: 'West elevator will be out of service for routine maintenance.',
      category: 'maintenance',
      categoryLabel: 'Maintenance',
      icon: Wrench,
      color: '#f59e0b'
    },
    {
      id: 10,
      date: '2026-02-14',
      time: '7pm',
      title: "Valentine's Day Mixer",
      description: 'Singles and couples welcome! Appetizers and mocktails provided.',
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

  const getRelativeDate = (dateString) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(dateString)
    date.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((date - today) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    if (diffDays < 14) return 'Next week'
    return formatDate(dateString)
  }

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
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <header className="calendar-view-header">
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="page-title-light">Calendar</h1>
        <button
          className="view-toggle-btn"
          onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          aria-label={viewMode === 'list' ? 'Switch to calendar view' : 'Switch to list view'}
        >
          {viewMode === 'list' ? <Grid3X3 size={20} /> : <List size={20} />}
        </button>
      </header>

      <main className="calendar-view-content">
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
          /* List View */
          <div className="calendar-list">
            {filteredItems.map(item => {
              const IconComponent = item.icon
              return (
                <article key={item.id} className="calendar-card">
                  <div className="calendar-card-accent" style={{ background: item.color }}></div>

                  <div className="calendar-card-header">
                    <div className="calendar-date-info">
                      <span className="calendar-relative-date">{getRelativeDate(item.date)}</span>
                      <span className="calendar-exact-date">{formatDate(item.date)}</span>
                    </div>
                    <span
                      className="calendar-category-tag"
                      style={{ background: `${item.color}20`, color: item.color }}
                    >
                      {item.categoryLabel}
                    </span>
                  </div>

                  <div className="calendar-card-body">
                    <div className="calendar-icon" style={{ background: `${item.color}20` }}>
                      <IconComponent size={20} style={{ color: item.color }} />
                    </div>
                    <div className="calendar-details">
                      <h3 className="calendar-title">{item.title}</h3>
                      <p className="calendar-description">{item.description}</p>
                      <div className="calendar-time">
                        <Clock size={14} />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
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
                )
              })}
            </div>

            {/* Events for selected month */}
            <div className="month-events-list">
              <h3 className="month-events-title">Events this month</h3>
              {filteredItems.filter(item => {
                const itemDate = new Date(item.date)
                return itemDate.getMonth() === currentMonth.getMonth() &&
                       itemDate.getFullYear() === currentMonth.getFullYear()
              }).map(item => (
                <div key={item.id} className="month-event-item">
                  <div className="month-event-dot" style={{ background: item.color }} />
                  <div className="month-event-info">
                    <span className="month-event-date">{formatDate(item.date)}</span>
                    <span className="month-event-title">{item.title}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default CalendarView
