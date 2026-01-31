import { useState, useEffect } from 'react'
import {
  Calendar,
  Plus,
  List,
  Grid,
  MoreVertical,
  Edit3,
  Trash2,
  Copy,
  Users,
  Bell,
  X,
  Clock,
  MapPin,
  Wrench,
  Wine,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  UserCheck,
  Send
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getEvents, createEvent, updateEvent, deleteEvent as deleteEventFromDb } from './services/eventService'
import EventModal from './components/EventModal'
import './ManagerCalendar.css'

// Demo events data
const DEMO_EVENTS = [
  {
    id: 1,
    date: '2026-01-15',
    time: '9:00 AM',
    endTime: '12:00 PM',
    title: 'Water shut off - Floors 10-15',
    description: 'Scheduled maintenance on water pipes. Please store water in advance.',
    category: 'maintenance',
    categoryLabel: 'Maintenance',
    icon: Wrench,
    color: '#f59e0b',
    location: 'All Units',
    allowRsvp: false,
    rsvps: []
  },
  {
    id: 2,
    date: '2026-01-18',
    time: '7:00 PM',
    endTime: '9:00 PM',
    title: 'Building Town Hall',
    description: 'Monthly meeting to discuss building updates, financials, and resident concerns.',
    category: 'meeting',
    categoryLabel: 'Meeting',
    icon: Users,
    color: '#3b82f6',
    location: 'Party Room',
    allowRsvp: true,
    rsvpLimit: 50,
    rsvps: [
      { id: 1, name: 'Sarah Mitchell', unit: '1201' },
      { id: 2, name: 'Mike Thompson', unit: '805' },
      { id: 3, name: 'Lisa Chen', unit: '908' },
      { id: 4, name: 'David Park', unit: '1502' },
      { id: 5, name: 'Emma Davis', unit: '603' }
    ]
  },
  {
    id: 3,
    date: '2026-01-20',
    time: '6:00 PM',
    endTime: '9:00 PM',
    title: 'Rooftop BBQ',
    description: 'Join us for a community BBQ on the rooftop! Burgers and drinks provided.',
    category: 'social',
    categoryLabel: 'Social',
    icon: Wine,
    color: '#8b5cf6',
    location: 'Rooftop Terrace',
    allowRsvp: true,
    rsvpLimit: 30,
    rsvps: [
      { id: 1, name: 'Sarah Mitchell', unit: '1201' },
      { id: 2, name: 'Jessica Kim', unit: '402' },
      { id: 3, name: 'Mike Thompson', unit: '805' },
      { id: 4, name: 'Lisa Chen', unit: '908' },
      { id: 5, name: 'David Park', unit: '1502' },
      { id: 6, name: 'Emma Davis', unit: '603' },
      { id: 7, name: 'James Wilson', unit: '1105' },
      { id: 8, name: 'Maria Garcia', unit: '709' }
    ]
  },
  {
    id: 4,
    date: '2026-01-22',
    time: '10:00 AM',
    endTime: '2:00 PM',
    title: 'Fire alarm testing',
    description: 'Annual fire alarm system testing. Expect intermittent alarms.',
    category: 'maintenance',
    categoryLabel: 'Maintenance',
    icon: Wrench,
    color: '#f59e0b',
    location: 'All Common Areas',
    allowRsvp: false,
    rsvps: []
  },
  {
    id: 5,
    date: '2026-01-25',
    time: '7:30 PM',
    endTime: '10:00 PM',
    title: 'Wine & Cheese Social',
    description: 'Meet your neighbors over wine and cheese in the party room.',
    category: 'social',
    categoryLabel: 'Social',
    icon: Wine,
    color: '#8b5cf6',
    location: 'Party Room',
    allowRsvp: true,
    rsvpLimit: 25,
    rsvps: [
      { id: 1, name: 'Sarah Mitchell', unit: '1201' },
      { id: 2, name: 'Jessica Kim', unit: '402' },
      { id: 3, name: 'Lisa Chen', unit: '908' },
      { id: 4, name: 'David Park', unit: '1502' },
      { id: 5, name: 'Emma Davis', unit: '603' },
      { id: 6, name: 'James Wilson', unit: '1105' },
      { id: 7, name: 'Maria Garcia', unit: '709' },
      { id: 8, name: 'Robert Brown', unit: '1401' },
      { id: 9, name: 'Jennifer Lee', unit: '502' },
      { id: 10, name: 'Michael Chen', unit: '1008' },
      { id: 11, name: 'Amanda White', unit: '305' },
      { id: 12, name: 'Christopher Davis', unit: '1203' },
      { id: 13, name: 'Nicole Taylor', unit: '806' },
      { id: 14, name: 'Daniel Martinez', unit: '1104' },
      { id: 15, name: 'Ashley Johnson', unit: '607' },
      { id: 16, name: 'Kevin Williams', unit: '903' },
      { id: 17, name: 'Stephanie Brown', unit: '1302' },
      { id: 18, name: 'Brandon Lee', unit: '408' }
    ]
  },
  {
    id: 6,
    date: '2026-01-28',
    time: '8:00 AM',
    endTime: '9:00 AM',
    title: 'Yoga in the Courtyard',
    description: 'Free yoga class for all residents. Bring your own mat!',
    category: 'social',
    categoryLabel: 'Social',
    icon: Wine,
    color: '#8b5cf6',
    location: 'Courtyard',
    allowRsvp: true,
    rsvpLimit: 20,
    rsvps: [
      { id: 1, name: 'Lisa Chen', unit: '908' },
      { id: 2, name: 'Emma Davis', unit: '603' },
      { id: 3, name: 'Amanda White', unit: '305' },
      { id: 4, name: 'Nicole Taylor', unit: '806' },
      { id: 5, name: 'Ashley Johnson', unit: '607' },
      { id: 6, name: 'Stephanie Brown', unit: '1302' },
      { id: 7, name: 'Jennifer Lee', unit: '502' },
      { id: 8, name: 'Maria Garcia', unit: '709' }
    ]
  },
  {
    id: 7,
    date: '2026-02-01',
    time: 'All Day',
    endTime: '',
    title: 'Pest control inspection',
    description: 'Quarterly pest control inspection. Please ensure access to your unit.',
    category: 'maintenance',
    categoryLabel: 'Maintenance',
    icon: Wrench,
    color: '#f59e0b',
    location: 'All Units',
    allowRsvp: false,
    rsvps: []
  },
  {
    id: 8,
    date: '2026-02-05',
    time: '6:00 PM',
    endTime: '11:00 PM',
    title: 'Super Bowl Watch Party',
    description: 'Watch the big game on the big screen in the party room!',
    category: 'social',
    categoryLabel: 'Social',
    icon: Wine,
    color: '#8b5cf6',
    location: 'Party Room',
    allowRsvp: true,
    rsvpLimit: 40,
    rsvps: [
      { id: 1, name: 'Mike Thompson', unit: '805' },
      { id: 2, name: 'David Park', unit: '1502' },
      { id: 3, name: 'James Wilson', unit: '1105' },
      { id: 4, name: 'Robert Brown', unit: '1401' },
      { id: 5, name: 'Michael Chen', unit: '1008' },
      { id: 6, name: 'Christopher Davis', unit: '1203' },
      { id: 7, name: 'Daniel Martinez', unit: '1104' },
      { id: 8, name: 'Kevin Williams', unit: '903' },
      { id: 9, name: 'Brandon Lee', unit: '408' },
      { id: 10, name: 'Sarah Mitchell', unit: '1201' },
      { id: 11, name: 'Jessica Kim', unit: '402' },
      { id: 12, name: 'Lisa Chen', unit: '908' }
    ]
  }
]

function ManagerCalendar() {
  // Demo gate - check if user is in demo mode
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [viewMode, setViewMode] = useState('list') // 'list' or 'month'
  const [activeFilter, setActiveFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showRSVPModal, setShowRSVPModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeMenu, setActiveMenu] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [currentMonth, setCurrentMonth] = useState(new Date(2026, 0, 1)) // January 2026

  // Form state for create/edit
  const [eventForm, setEventForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    category: 'social',
    location: '',
    rsvpLimit: '',
    allowRsvp: true
  })

  // Events data - use demo data for demo users, fetch from Supabase for real users
  const [events, setEvents] = useState(isInDemoMode ? DEMO_EVENTS : [])
  const [loading, setLoading] = useState(false)

  // Fetch events from Supabase on mount (real mode only)
  useEffect(() => {
    if (isInDemoMode) return

    const fetchEvents = async () => {
      const buildingId = userProfile?.building_id
      if (!buildingId) return

      setLoading(true)
      try {
        const data = await getEvents(buildingId)
        console.log('[ManagerCalendar] Raw events from Supabase:', data)
        const transformedEvents = (data || []).map(event => {
          console.log('[ManagerCalendar] Transforming event:', event)
          return {
            id: event.id,
            date: event.start_time ? event.start_time.split('T')[0] : (event.date || new Date().toISOString().split('T')[0]),
            time: event.start_time ? new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'All Day',
            endTime: event.end_time ? new Date(event.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
            title: event.title || 'Untitled Event',
            description: event.description || '',
            category: event.category || 'social',
            categoryLabel: event.category ? event.category.charAt(0).toUpperCase() + event.category.slice(1) : 'Social',
            icon: event.category === 'maintenance' ? Wrench : event.category === 'meeting' ? Users : Wine,
            color: event.category === 'maintenance' ? '#f59e0b' : event.category === 'meeting' ? '#3b82f6' : '#8b5cf6',
            location: event.location || 'TBD',
            allowRsvp: true,
            rsvpLimit: null,
            rsvps: [],
            isFromSupabase: true
          }
        })
        setEvents(transformedEvents)
        console.log('[ManagerCalendar] Transformed events:', transformedEvents)
      } catch (err) {
        console.error('[ManagerCalendar] Error fetching events:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchEvents()
  }, [isInDemoMode, userProfile?.building_id])

  const filters = [
    { id: 'all', label: 'All Events' },
    { id: 'social', label: 'Social' },
    { id: 'meeting', label: 'Meeting' },
    { id: 'maintenance', label: 'Maintenance' }
  ]

  const categories = [
    { id: 'social', label: 'Social', color: '#8b5cf6', icon: Wine },
    { id: 'meeting', label: 'Meeting', color: '#3b82f6', icon: Users },
    { id: 'maintenance', label: 'Maintenance', color: '#f59e0b', icon: Wrench },
    { id: 'announcement', label: 'Announcement', color: '#10b981', icon: Megaphone }
  ]

  // Filter events
  const filteredEvents = activeFilter === 'all'
    ? events
    : events.filter(event => event.category === activeFilter)

  // Get temporal group for an event (matches Resident Calendar)
  const getTemporalGroup = (dateString) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const date = new Date(dateString)
    date.setHours(0, 0, 0, 0)
    const diffDays = Math.floor((date - today) / (1000 * 60 * 60 * 24))

    const todayDayOfWeek = today.getDay()
    const daysUntilEndOfWeek = 6 - todayDayOfWeek

    if (diffDays < 0) return 'Past'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays <= daysUntilEndOfWeek) return 'This Week'
    if (diffDays <= daysUntilEndOfWeek + 7) return 'Next Week'
    return 'Coming Up'
  }

  // Group events by temporal period (upcoming first, past last)
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

    // Sort events within each group by date
    Object.keys(groups).forEach(key => {
      groups[key].sort((a, b) => new Date(a.date) - new Date(b.date))
    })

    return groupOrder
      .filter(group => groups[group] && groups[group].length > 0)
      .map(group => ({
        title: group,
        items: groups[group]
      }))
  }

  const groupedEvents = groupEventsByTime(filteredEvents)
  console.log('[ManagerCalendar] Grouped events:', groupedEvents)

  // Legacy sorted events for compatibility (used by month view)
  const sortedEvents = [...filteredEvents].sort((a, b) => new Date(a.date) - new Date(b.date))

  // Date formatting functions
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

    if (diffDays < 0) return 'Past event'
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    if (diffDays < 14) return 'Next week'
    return formatDate(dateString)
  }

  // Show toast notification
  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Handle create event
  const handleCreateEvent = async () => {
    const category = categories.find(c => c.id === eventForm.category)

    if (isInDemoMode) {
      // Demo mode: local state only
      const newEvent = {
        id: Date.now(),
        date: eventForm.date,
        time: eventForm.time || 'All Day',
        endTime: eventForm.endTime,
        title: eventForm.title,
        description: eventForm.description,
        category: eventForm.category,
        categoryLabel: category.label,
        icon: category.icon,
        color: category.color,
        location: eventForm.location,
        allowRsvp: eventForm.allowRsvp,
        rsvpLimit: eventForm.rsvpLimit ? parseInt(eventForm.rsvpLimit) : null,
        rsvps: []
      }
      setEvents(prev => [...prev, newEvent])
    } else {
      // Real mode: save to Supabase
      try {
        const startTime = eventForm.time
          ? `${eventForm.date}T${eventForm.time}:00`
          : `${eventForm.date}T00:00:00`
        const endTime = eventForm.endTime
          ? `${eventForm.date}T${eventForm.endTime}:00`
          : null

        await createEvent({
          building_id: userProfile.building_id,
          title: eventForm.title,
          description: eventForm.description,
          start_time: startTime,
          end_time: endTime,
          event_time: eventForm.time || null,
          category: eventForm.category,
          location: eventForm.location,
          created_by: userProfile.id
        })

        // Refresh events
        const data = await getEvents(userProfile.building_id)
        const transformedEvents = (data || []).map(event => ({
          id: event.id,
          date: event.start_time ? event.start_time.split('T')[0] : (event.date || new Date().toISOString().split('T')[0]),
          time: event.start_time ? new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'All Day',
          endTime: event.end_time ? new Date(event.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
          title: event.title || 'Untitled Event',
          description: event.description || '',
          category: event.category || 'social',
          categoryLabel: event.category ? event.category.charAt(0).toUpperCase() + event.category.slice(1) : 'Social',
          icon: event.category === 'maintenance' ? Wrench : event.category === 'meeting' ? Users : Wine,
          color: event.category === 'maintenance' ? '#f59e0b' : event.category === 'meeting' ? '#3b82f6' : '#8b5cf6',
          location: event.location || 'TBD',
          allowRsvp: true,
          rsvpLimit: null,
          rsvps: [],
          isFromSupabase: true
        }))
        setEvents(transformedEvents)
      } catch (err) {
        console.error('[ManagerCalendar] Error creating event:', err)
        alert('Failed to create event. Please try again.')
        return
      }
    }

    setShowCreateModal(false)
    resetForm()
    showToastMessage('Event created successfully!')
  }

  // Handle create event success (from shared modal)
  const handleCreateEventSuccess = async (demoEvent) => {
    if (isInDemoMode && demoEvent) {
      // Demo mode: add to local state
      setEvents(prev => [...prev, demoEvent])
    } else if (!isInDemoMode) {
      // Real mode: refresh events from Supabase
      try {
        const data = await getEvents(userProfile.building_id)
        const transformedEvents = (data || []).map(event => ({
          id: event.id,
          date: event.start_time ? event.start_time.split('T')[0] : (event.date || new Date().toISOString().split('T')[0]),
          time: event.start_time ? new Date(event.start_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : 'All Day',
          endTime: event.end_time ? new Date(event.end_time).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '',
          title: event.title || 'Untitled Event',
          description: event.description || '',
          category: event.category || 'social',
          categoryLabel: event.category ? event.category.charAt(0).toUpperCase() + event.category.slice(1) : 'Social',
          icon: event.category === 'maintenance' ? Wrench : event.category === 'meeting' ? Users : Wine,
          color: event.category === 'maintenance' ? '#f59e0b' : event.category === 'meeting' ? '#3b82f6' : '#8b5cf6',
          location: event.location || 'TBD',
          allowRsvp: true,
          rsvpLimit: null,
          rsvps: [],
          isFromSupabase: true
        }))
        setEvents(transformedEvents)
      } catch (err) {
        console.error('[ManagerCalendar] Error refreshing events:', err)
      }
    }
    showToastMessage('Event created successfully!')
  }

  // Handle edit event
  const handleEditEvent = async () => {
    const category = categories.find(c => c.id === eventForm.category)

    if (!isInDemoMode && selectedEvent.isFromSupabase) {
      try {
        const startTime = eventForm.time
          ? `${eventForm.date}T${eventForm.time}:00`
          : `${eventForm.date}T00:00:00`
        const endTime = eventForm.endTime
          ? `${eventForm.date}T${eventForm.endTime}:00`
          : null

        await updateEvent(selectedEvent.id, {
          title: eventForm.title,
          description: eventForm.description,
          start_time: startTime,
          end_time: endTime,
          category: eventForm.category,
          location: eventForm.location
        })
      } catch (err) {
        console.error('[ManagerCalendar] Error updating event:', err)
        alert('Failed to update event. Please try again.')
        return
      }
    }

    setEvents(prev => prev.map(event => {
      if (event.id === selectedEvent.id) {
        return {
          ...event,
          date: eventForm.date,
          time: eventForm.time || 'All Day',
          endTime: eventForm.endTime,
          title: eventForm.title,
          description: eventForm.description,
          category: eventForm.category,
          categoryLabel: category.label,
          icon: category.icon,
          color: category.color,
          location: eventForm.location,
          allowRsvp: eventForm.allowRsvp,
          rsvpLimit: eventForm.rsvpLimit ? parseInt(eventForm.rsvpLimit) : null
        }
      }
      return event
    }))
    setShowEditModal(false)
    setSelectedEvent(null)
    resetForm()
    showToastMessage('Event updated successfully!')
  }

  // Handle delete event
  const handleDeleteEvent = async () => {
    if (!isInDemoMode && selectedEvent.isFromSupabase) {
      try {
        await deleteEventFromDb(selectedEvent.id)
      } catch (err) {
        console.error('[ManagerCalendar] Error deleting event:', err)
        alert('Failed to delete event. Please try again.')
        return
      }
    }

    setEvents(prev => prev.filter(event => event.id !== selectedEvent.id))
    setShowDeleteConfirm(false)
    setSelectedEvent(null)
    showToastMessage('Event deleted successfully!')
  }

  // Handle duplicate event
  const handleDuplicateEvent = (event) => {
    const duplicatedEvent = {
      ...event,
      id: Date.now(),
      title: `${event.title} (Copy)`,
      rsvps: []
    }
    setEvents(prev => [...prev, duplicatedEvent])
    setActiveMenu(null)
    showToastMessage('Event duplicated!')
  }

  // Handle send reminder
  const handleSendReminder = (event) => {
    setActiveMenu(null)
    showToastMessage(`Reminder sent to ${event.rsvps.length} attendees!`)
  }

  // Reset form
  const resetForm = () => {
    setEventForm({
      title: '',
      description: '',
      date: '',
      time: '',
      endTime: '',
      category: 'social',
      location: '',
      rsvpLimit: '',
      allowRsvp: true
    })
  }

  // Open edit modal
  const openEditModal = (event) => {
    setSelectedEvent(event)
    setEventForm({
      title: event.title,
      description: event.description,
      date: event.date,
      time: event.time === 'All Day' ? '' : event.time,
      endTime: event.endTime || '',
      category: event.category,
      location: event.location,
      rsvpLimit: event.rsvpLimit ? event.rsvpLimit.toString() : '',
      allowRsvp: event.allowRsvp
    })
    setActiveMenu(null)
    setShowEditModal(true)
  }

  // Open delete confirm
  const openDeleteConfirm = (event) => {
    setSelectedEvent(event)
    setActiveMenu(null)
    setShowDeleteConfirm(true)
  }

  // Open RSVP modal
  const openRSVPModal = (event) => {
    setSelectedEvent(event)
    setActiveMenu(null)
    setShowRSVPModal(true)
  }

  // Get calendar days for month view
  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push({ day: null, events: [] })
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      const dayEvents = events.filter(event => event.date === dateString)
      days.push({ day, date: dateString, events: dayEvents })
    }

    return days
  }

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']

  const previousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  return (
    <div className="manager-calendar">
      {/* Header */}
      <div className="calendar-header">
        <div className="calendar-header-left">
          <h2>Calendar</h2>
          <p>Manage building events and schedules</p>
        </div>
        <div className="calendar-header-actions">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'month' ? 'active' : ''}`}
              onClick={() => setViewMode('month')}
              title="Month View"
            >
              <Grid size={18} />
            </button>
          </div>
          <button className="create-event-btn" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span>Create Event</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="calendar-filters">
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`filter-chip ${activeFilter === filter.id ? 'active' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="calendar-list">
          {groupedEvents.length === 0 ? (
            <div className="no-events">
              <Calendar size={48} />
              <h3>No events found</h3>
              <p>Create your first event to get started</p>
            </div>
          ) : (
            groupedEvents.map(group => (
              <div key={group.title} className="event-group">
                <div className="event-group-header">
                  <h3 className="event-group-title">{group.title}</h3>
                  <span className="event-group-count">{group.items.length} event{group.items.length !== 1 ? 's' : ''}</span>
                </div>

                {group.items.map(event => {
                  const IconComponent = event.icon || Wine
                  const isPast = group.title === 'Past'
                  return (
                    <article
                      key={event.id}
                      className={`event-card ${isPast ? 'past-event' : ''}`}
                      onClick={() => openEditModal(event)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="event-card-accent" style={{ background: event.color || '#8b5cf6' }}></div>

                      <div className="event-card-body">
                        <div className="event-icon" style={{ background: `${event.color || '#8b5cf6'}20` }}>
                          <IconComponent size={20} style={{ color: event.color || '#8b5cf6' }} />
                        </div>
                        <div className="event-details">
                          <div className="event-details-header">
                            <h3 className="event-title">{event.title || 'Untitled Event'}</h3>
                            <span
                              className="event-category-tag"
                              style={{ background: `${event.color || '#8b5cf6'}20`, color: event.color || '#8b5cf6' }}
                            >
                              {event.categoryLabel || 'Social'}
                            </span>
                          </div>
                          <span className="event-datetime">
                            {event.date ? formatDate(event.date) : 'No date'} • {event.time || 'TBD'}
                            {event.endTime && ` - ${event.endTime}`}
                          </span>
                          {event.location && (
                            <span className="event-location-text">
                              <MapPin size={14} />
                              {event.location}
                            </span>
                          )}
                          {event.description && (
                            <p className="event-description">{event.description}</p>
                          )}
                          {event.allowRsvp && event.rsvps && event.rsvps.length > 0 && (
                            <span className="event-rsvps">
                              <Users size={14} />
                              {event.rsvps.length}{event.rsvpLimit && ` / ${event.rsvpLimit}`} RSVPs
                            </span>
                          )}
                        </div>
                        <div className="event-card-actions">
                          <div className="event-menu-wrapper">
                            <button
                              className="event-menu-btn"
                              onClick={() => setActiveMenu(activeMenu === event.id ? null : event.id)}
                            >
                              <MoreVertical size={18} />
                            </button>
                            {activeMenu === event.id && (
                              <div className="event-menu-dropdown">
                                <button onClick={() => openEditModal(event)}>
                                  <Edit3 size={16} />
                                  Edit Event
                                </button>
                                <button onClick={() => handleDuplicateEvent(event)}>
                                  <Copy size={16} />
                                  Duplicate
                                </button>
                                {event.allowRsvp && (
                                  <>
                                    <button onClick={() => openRSVPModal(event)}>
                                      <Users size={16} />
                                      View RSVPs ({event.rsvps.length})
                                    </button>
                                    <button onClick={() => handleSendReminder(event)}>
                                      <Bell size={16} />
                                      Send Reminder
                                    </button>
                                  </>
                                )}
                                <div className="menu-divider"></div>
                                <button className="delete-btn" onClick={() => openDeleteConfirm(event)}>
                                  <Trash2 size={16} />
                                  Delete Event
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            ))
          )}
        </div>
      )}

      {/* Month View */}
      {viewMode === 'month' && (
        <div className="calendar-month-view">
          <div className="month-nav">
            <button className="month-nav-btn" onClick={previousMonth}>
              <ChevronLeft size={20} />
            </button>
            <h3>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
            <button className="month-nav-btn" onClick={nextMonth}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="month-grid">
            <div className="weekday-header">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="weekday">{day}</div>
              ))}
            </div>
            <div className="days-grid">
              {getCalendarDays().map((dayData, index) => (
                <div
                  key={index}
                  className={`day-cell ${dayData.day ? '' : 'empty'} ${dayData.events.length > 0 ? 'has-events' : ''}`}
                >
                  {dayData.day && (
                    <>
                      <span className="day-number">{dayData.day}</span>
                      <div className="day-events">
                        {dayData.events.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className="day-event-dot"
                            style={{ background: event.color }}
                            title={event.title}
                            onClick={() => openEditModal(event)}
                          >
                            <span className="day-event-title">{event.title}</span>
                          </div>
                        ))}
                        {dayData.events.length > 2 && (
                          <span className="more-events">+{dayData.events.length - 2} more</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <EventModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateEventSuccess}
        userProfile={userProfile}
        isInDemoMode={isInDemoMode}
      />

      {/* Edit Event Modal */}
      {showEditModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content event-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Event</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  placeholder="Enter event title..."
                  value={eventForm.title}
                  onChange={e => setEventForm({ ...eventForm, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Add event details..."
                  value={eventForm.description}
                  onChange={e => setEventForm({ ...eventForm, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={e => setEventForm({ ...eventForm, date: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Category *</label>
                  <select
                    value={eventForm.category}
                    onChange={e => setEventForm({ ...eventForm, category: e.target.value })}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={eventForm.time}
                    onChange={e => setEventForm({ ...eventForm, time: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={e => setEventForm({ ...eventForm, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Location</label>
                <input
                  type="text"
                  placeholder="e.g., Party Room, Rooftop, Lobby"
                  value={eventForm.location}
                  onChange={e => setEventForm({ ...eventForm, location: e.target.value })}
                />
              </div>

              <div className="form-row rsvp-row">
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={eventForm.allowRsvp}
                      onChange={e => setEventForm({ ...eventForm, allowRsvp: e.target.checked })}
                    />
                    <span>Allow RSVPs</span>
                  </label>
                </div>
                {eventForm.allowRsvp && (
                  <div className="form-group">
                    <label>RSVP Limit</label>
                    <input
                      type="number"
                      placeholder="No limit"
                      value={eventForm.rsvpLimit}
                      onChange={e => setEventForm({ ...eventForm, rsvpLimit: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleEditEvent}
                disabled={!eventForm.title || !eventForm.date}
              >
                <CheckCircle size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View RSVPs Modal */}
      {showRSVPModal && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowRSVPModal(false)}>
          <div className="modal-content rsvp-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>RSVPs for {selectedEvent.title}</h3>
              <button className="modal-close" onClick={() => setShowRSVPModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="rsvp-summary">
                <div className="rsvp-count">
                  <UserCheck size={24} />
                  <span>{selectedEvent.rsvps.length}</span>
                  {selectedEvent.rsvpLimit && (
                    <span className="rsvp-limit">/ {selectedEvent.rsvpLimit}</span>
                  )}
                </div>
                <p>confirmed attendees</p>
              </div>

              {selectedEvent.rsvps.length > 0 ? (
                <div className="rsvp-list">
                  {selectedEvent.rsvps.map(rsvp => (
                    <div key={rsvp.id} className="rsvp-item">
                      <div className="rsvp-avatar">
                        {rsvp.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="rsvp-info">
                        <span className="rsvp-name">{rsvp.name}</span>
                        <span className="rsvp-unit">Unit {rsvp.unit}</span>
                      </div>
                      <CheckCircle size={16} className="rsvp-check" />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-rsvps">
                  <Users size={32} />
                  <p>No RSVPs yet</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRSVPModal(false)}>
                Close
              </button>
              {selectedEvent.rsvps.length > 0 && (
                <button className="btn-primary" onClick={() => {
                  handleSendReminder(selectedEvent)
                  setShowRSVPModal(false)
                }}>
                  <Send size={18} />
                  Send Reminder
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedEvent && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Event</h3>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <Trash2 size={32} />
                <p>Are you sure you want to delete <strong>"{selectedEvent.title}"</strong>?</p>
                {selectedEvent.rsvps.length > 0 && (
                  <span className="delete-note">
                    This will notify {selectedEvent.rsvps.length} attendee{selectedEvent.rsvps.length !== 1 ? 's' : ''} about the cancellation.
                  </span>
                )}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteEvent}>
                <Trash2 size={18} />
                Delete Event
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Click outside to close menu */}
      {activeMenu && (
        <div className="menu-backdrop" onClick={() => setActiveMenu(null)} />
      )}
    </div>
  )
}

export default ManagerCalendar
