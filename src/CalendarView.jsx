import { useState } from 'react'
import { ArrowLeft, Calendar, ChevronRight, Wrench, Wine, Users, Megaphone, Bell, Clock } from 'lucide-react'
import './CalendarView.css'

function CalendarView({ onBack }) {
  const [activeFilter, setActiveFilter] = useState('all')

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

  return (
    <div className="calendar-view-container">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <header className="calendar-view-header">
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="page-title-light">Calendar</h1>
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

        {/* Calendar Items */}
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
      </main>
    </div>
  )
}

export default CalendarView
