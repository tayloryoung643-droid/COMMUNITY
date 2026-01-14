import { useState } from 'react'
import {
  ArrowUpDown,
  Plus,
  Calendar,
  List,
  MoreVertical,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  Edit3,
  Trash2,
  Bell,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Truck,
  Home,
  Package,
  Wrench,
  HelpCircle,
  Send
} from 'lucide-react'
import './ManagerElevator.css'

function ManagerElevator() {
  const [viewMode, setViewMode] = useState('list') // 'list' or 'calendar'
  const [activeFilter, setActiveFilter] = useState('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showBlockModal, setShowBlockModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [activeMenu, setActiveMenu] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [currentWeek, setCurrentWeek] = useState(new Date(2026, 0, 12)) // Week of Jan 12, 2026

  // Form state
  const [bookingForm, setBookingForm] = useState({
    residentId: '',
    type: 'furniture',
    date: '',
    startTime: '09:00',
    endTime: '11:00',
    notes: '',
    requiresServiceElevator: false,
    autoApprove: true,
    sendNotification: true
  })

  // Block reason state
  const [blockReason, setBlockReason] = useState('conflict')
  const [blockMessage, setBlockMessage] = useState('')

  // Residents list
  const residents = [
    { id: 1, name: 'Sarah Mitchell', unit: '1201' },
    { id: 2, name: 'David Park', unit: '1502' },
    { id: 3, name: 'Alex Rivera', unit: '1104' },
    { id: 4, name: 'Chris Walker', unit: '309' },
    { id: 5, name: 'Emma Davis', unit: '1507' },
    { id: 6, name: 'Mike Thompson', unit: '805' },
    { id: 7, name: 'Jessica Kim', unit: '402' },
    { id: 8, name: 'James Lee', unit: '203' },
    { id: 9, name: 'Lisa Chen', unit: '608' },
    { id: 10, name: 'Robert Martinez', unit: '1012' },
    { id: 11, name: 'Taylor Young', unit: '612' },
    { id: 12, name: 'Amanda White', unit: '305' }
  ]

  // Booking types
  const bookingTypes = [
    { id: 'move_in', label: 'Move-in', icon: Home, color: '#8b5cf6' },
    { id: 'move_out', label: 'Move-out', icon: Truck, color: '#8b5cf6' },
    { id: 'furniture', label: 'Furniture Delivery', icon: Package, color: '#3b82f6' },
    { id: 'appliance', label: 'Appliance Delivery', icon: Package, color: '#3b82f6' },
    { id: 'contractor', label: 'Contractor Work', icon: Wrench, color: '#f59e0b' },
    { id: 'other', label: 'Other', icon: HelpCircle, color: '#64748b' }
  ]

  // Block reasons
  const blockReasons = [
    { id: 'conflict', label: 'Schedule conflict' },
    { id: 'maintenance', label: 'Maintenance work' },
    { id: 'violation', label: 'Building rules violation' },
    { id: 'other', label: 'Other' }
  ]

  // Time slots
  const timeSlots = []
  for (let hour = 6; hour <= 20; hour++) {
    for (let min = 0; min < 60; min += 30) {
      const time = `${hour.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}`
      const label = new Date(`2026-01-01T${time}`).toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })
      timeSlots.push({ value: time, label })
    }
  }

  // Bookings data
  const [bookings, setBookings] = useState([
    {
      id: 1,
      residentName: 'Sarah Mitchell',
      unit: '1201',
      date: '2026-01-14',
      startTime: '14:00',
      endTime: '16:00',
      type: 'furniture',
      status: 'confirmed',
      notes: 'Large sectional sofa delivery',
      requiresServiceElevator: true
    },
    {
      id: 2,
      residentName: 'David Park',
      unit: '1502',
      date: '2026-01-14',
      startTime: '17:00',
      endTime: '19:00',
      type: 'move_in',
      status: 'confirmed',
      notes: 'New tenant moving in - full apartment',
      requiresServiceElevator: true
    },
    {
      id: 3,
      residentName: 'Alex Rivera',
      unit: '1104',
      date: '2026-01-15',
      startTime: '10:00',
      endTime: '12:00',
      type: 'appliance',
      status: 'pending',
      notes: 'New refrigerator delivery - need to remove doors',
      requiresServiceElevator: true
    },
    {
      id: 4,
      residentName: 'Chris Walker',
      unit: '309',
      date: '2026-01-17',
      startTime: '09:00',
      endTime: '11:00',
      type: 'contractor',
      status: 'confirmed',
      notes: 'Kitchen remodel - multiple trips expected',
      requiresServiceElevator: false
    },
    {
      id: 5,
      residentName: 'Emma Davis',
      unit: '1507',
      date: '2026-01-18',
      startTime: '13:00',
      endTime: '15:00',
      type: 'furniture',
      status: 'confirmed',
      notes: 'Bed frame and mattress delivery',
      requiresServiceElevator: true
    },
    {
      id: 6,
      residentName: 'Mike Thompson',
      unit: '805',
      date: '2026-01-20',
      startTime: '15:00',
      endTime: '17:00',
      type: 'move_out',
      status: 'confirmed',
      notes: 'Moving to new city - full apartment',
      requiresServiceElevator: true
    },
    {
      id: 7,
      residentName: 'Jessica Kim',
      unit: '402',
      date: '2026-01-22',
      startTime: '16:00',
      endTime: '18:00',
      type: 'furniture',
      status: 'pending',
      notes: 'Office desk and chair',
      requiresServiceElevator: false
    },
    {
      id: 8,
      residentName: 'James Lee',
      unit: '203',
      date: '2026-01-15',
      startTime: '14:00',
      endTime: '16:00',
      type: 'contractor',
      status: 'confirmed',
      notes: 'HVAC maintenance',
      requiresServiceElevator: false
    }
  ])

  // Get today's date string
  const getTodayString = () => {
    return '2026-01-14' // Demo date
  }

  // Check if date is today
  const isToday = (dateString) => {
    return dateString === getTodayString()
  }

  // Check if date is this week
  const isThisWeek = (dateString) => {
    const date = new Date(dateString)
    const today = new Date(getTodayString())
    const weekStart = new Date(today)
    weekStart.setDate(today.getDate() - today.getDay())
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)
    return date >= weekStart && date <= weekEnd
  }

  // Calculate stats
  const todaysBookings = bookings.filter(b => isToday(b.date))
  const thisWeekBookings = bookings.filter(b => isThisWeek(b.date))
  const pendingBookings = bookings.filter(b => b.status === 'pending')
  const moveBookings = bookings.filter(b => b.type === 'move_in' || b.type === 'move_out')

  // Find next available slot
  const getNextAvailable = () => {
    const today = getTodayString()
    const todayBooked = bookings
      .filter(b => b.date === today && b.status !== 'blocked')
      .map(b => ({ start: b.startTime, end: b.endTime }))

    // Check each hour from current time
    for (let hour = 15; hour <= 20; hour++) {
      const time = `${hour.toString().padStart(2, '0')}:00`
      const isBooked = todayBooked.some(b => time >= b.start && time < b.end)
      if (!isBooked) {
        return `Today at ${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
      }
    }
    return 'Tomorrow 6:00 AM'
  }

  const stats = [
    {
      label: "Today's Bookings",
      value: todaysBookings.length,
      icon: Calendar,
      color: 'blue'
    },
    {
      label: 'This Week',
      value: thisWeekBookings.length,
      icon: Clock,
      color: 'purple'
    },
    {
      label: 'Pending Approval',
      value: pendingBookings.length,
      icon: AlertTriangle,
      color: 'yellow'
    },
    {
      label: 'Next Available',
      value: getNextAvailable(),
      icon: CheckCircle,
      color: 'green',
      isText: true
    }
  ]

  const filters = [
    { id: 'all', label: 'All Bookings' },
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'pending', label: `Pending (${pendingBookings.length})` },
    { id: 'moves', label: 'Move-ins/Move-outs' }
  ]

  // Filter bookings
  const getFilteredBookings = () => {
    let filtered = [...bookings]

    if (activeFilter === 'today') {
      filtered = filtered.filter(b => isToday(b.date))
    } else if (activeFilter === 'week') {
      filtered = filtered.filter(b => isThisWeek(b.date))
    } else if (activeFilter === 'pending') {
      filtered = filtered.filter(b => b.status === 'pending')
    } else if (activeFilter === 'moves') {
      filtered = filtered.filter(b => b.type === 'move_in' || b.type === 'move_out')
    }

    // Sort by date and time
    filtered.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.startTime.localeCompare(b.startTime)
    })

    return filtered
  }

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    if (isToday(dateString)) return 'Today'
    const tomorrow = new Date(getTodayString())
    tomorrow.setDate(tomorrow.getDate() + 1)
    if (dateString === tomorrow.toISOString().split('T')[0]) return 'Tomorrow'
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Format time
  const formatTime = (time) => {
    return new Date(`2026-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get booking type info
  const getBookingType = (typeId) => {
    return bookingTypes.find(t => t.id === typeId) || bookingTypes.find(t => t.id === 'other')
  }

  // Check for conflicts
  const hasConflict = (booking) => {
    return bookings.some(b =>
      b.id !== booking.id &&
      b.date === booking.date &&
      b.status !== 'blocked' &&
      ((booking.startTime >= b.startTime && booking.startTime < b.endTime) ||
        (booking.endTime > b.startTime && booking.endTime <= b.endTime) ||
        (booking.startTime <= b.startTime && booking.endTime >= b.endTime))
    )
  }

  // Show toast
  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Reset form
  const resetForm = () => {
    setBookingForm({
      residentId: '',
      type: 'furniture',
      date: '',
      startTime: '09:00',
      endTime: '11:00',
      notes: '',
      requiresServiceElevator: false,
      autoApprove: true,
      sendNotification: true
    })
  }

  // Handle create booking
  const handleCreateBooking = () => {
    const resident = residents.find(r => r.id === parseInt(bookingForm.residentId))
    if (!resident) return

    const newBooking = {
      id: Date.now(),
      residentName: resident.name,
      unit: resident.unit,
      date: bookingForm.date,
      startTime: bookingForm.startTime,
      endTime: bookingForm.endTime,
      type: bookingForm.type,
      status: bookingForm.autoApprove ? 'confirmed' : 'pending',
      notes: bookingForm.notes,
      requiresServiceElevator: bookingForm.requiresServiceElevator
    }

    setBookings(prev => [...prev, newBooking])
    setShowCreateModal(false)
    resetForm()
    showToastMessage(`Booking created for ${resident.name}${bookingForm.sendNotification ? ' - Notification sent!' : ''}`)
  }

  // Handle edit booking
  const handleEditBooking = () => {
    const resident = residents.find(r => r.id === parseInt(bookingForm.residentId))

    setBookings(prev => prev.map(b => {
      if (b.id === selectedBooking.id) {
        return {
          ...b,
          residentName: resident ? resident.name : b.residentName,
          unit: resident ? resident.unit : b.unit,
          date: bookingForm.date,
          startTime: bookingForm.startTime,
          endTime: bookingForm.endTime,
          type: bookingForm.type,
          notes: bookingForm.notes,
          requiresServiceElevator: bookingForm.requiresServiceElevator
        }
      }
      return b
    }))
    setShowEditModal(false)
    setSelectedBooking(null)
    resetForm()
    showToastMessage('Booking updated!')
  }

  // Handle approve booking
  const handleApproveBooking = (booking) => {
    setBookings(prev => prev.map(b => {
      if (b.id === booking.id) {
        return { ...b, status: 'confirmed' }
      }
      return b
    }))
    setActiveMenu(null)
    showToastMessage(`Booking approved for ${booking.residentName}!`)
  }

  // Handle block booking
  const handleBlockBooking = () => {
    setBookings(prev => prev.map(b => {
      if (b.id === selectedBooking.id) {
        return { ...b, status: 'blocked' }
      }
      return b
    }))
    setShowBlockModal(false)
    setSelectedBooking(null)
    showToastMessage(`Booking cancelled - ${blockMessage ? 'Notification sent to resident' : 'Resident notified'}`)
    setBlockReason('conflict')
    setBlockMessage('')
  }

  // Handle send reminder
  const handleSendReminder = (booking) => {
    setActiveMenu(null)
    showToastMessage(`Reminder sent to ${booking.residentName}!`)
  }

  // Open edit modal
  const openEditModal = (booking) => {
    setSelectedBooking(booking)
    const resident = residents.find(r => r.name === booking.residentName && r.unit === booking.unit)
    setBookingForm({
      residentId: resident ? resident.id.toString() : '',
      type: booking.type,
      date: booking.date,
      startTime: booking.startTime,
      endTime: booking.endTime,
      notes: booking.notes,
      requiresServiceElevator: booking.requiresServiceElevator,
      autoApprove: true,
      sendNotification: true
    })
    setActiveMenu(null)
    setShowEditModal(true)
  }

  // Open block modal
  const openBlockModal = (booking) => {
    setSelectedBooking(booking)
    setActiveMenu(null)
    setShowBlockModal(true)
  }

  // Open details modal
  const openDetailsModal = (booking) => {
    setSelectedBooking(booking)
    setActiveMenu(null)
    setShowDetailsModal(true)
  }

  // Auto-calculate end time
  const handleStartTimeChange = (time) => {
    const [hours, mins] = time.split(':').map(Number)
    let endHours = hours + 2
    if (endHours > 20) endHours = 20
    const endTime = `${endHours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
    setBookingForm({ ...bookingForm, startTime: time, endTime })
  }

  // Get week dates for calendar view
  const getWeekDates = () => {
    const dates = []
    const start = new Date(currentWeek)
    start.setDate(start.getDate() - start.getDay())

    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(start.getDate() + i)
      dates.push({
        date: date.toISOString().split('T')[0],
        dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        isToday: date.toISOString().split('T')[0] === getTodayString()
      })
    }
    return dates
  }

  // Get bookings for a specific date in calendar view
  const getBookingsForDate = (dateString) => {
    return bookings.filter(b => b.date === dateString && b.status !== 'blocked')
  }

  // Navigate weeks
  const previousWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() - 7)
    setCurrentWeek(newDate)
  }

  const nextWeek = () => {
    const newDate = new Date(currentWeek)
    newDate.setDate(newDate.getDate() + 7)
    setCurrentWeek(newDate)
  }

  const filteredBookings = getFilteredBookings()

  return (
    <div className="manager-elevator">
      {/* Header */}
      <div className="elevator-header">
        <div className="elevator-header-left">
          <h2>Elevator Booking</h2>
          <p>Manage service elevator reservations</p>
        </div>
        <div className="elevator-header-actions">
          <div className="view-toggle">
            <button
              className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
            >
              <List size={18} />
            </button>
            <button
              className={`view-toggle-btn ${viewMode === 'calendar' ? 'active' : ''}`}
              onClick={() => setViewMode('calendar')}
              title="Calendar View"
            >
              <Calendar size={18} />
            </button>
          </div>
          <button className="create-booking-btn" onClick={() => setShowCreateModal(true)}>
            <Plus size={18} />
            <span>Create Booking</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="elevator-stats">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              <stat.icon size={20} />
            </div>
            <div className="stat-content">
              <span className={`stat-value ${stat.isText ? 'text-value' : ''}`}>{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="elevator-filters">
        {filters.map(filter => (
          <button
            key={filter.id}
            className={`filter-chip ${activeFilter === filter.id ? 'active' : ''} ${filter.id === 'pending' && pendingBookings.length > 0 ? 'warning' : ''}`}
            onClick={() => setActiveFilter(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bookings-list">
          {filteredBookings.length === 0 ? (
            <div className="no-bookings">
              <ArrowUpDown size={48} />
              <h3>No bookings found</h3>
              <p>
                {activeFilter !== 'all'
                  ? 'No bookings match this filter'
                  : 'Create a booking to get started'}
              </p>
              <button className="create-first-btn" onClick={() => setShowCreateModal(true)}>
                <Plus size={18} />
                Create Booking
              </button>
            </div>
          ) : (
            filteredBookings.map(booking => {
              const bookingType = getBookingType(booking.type)
              const IconComponent = bookingType.icon
              const conflict = hasConflict(booking)

              return (
                <div
                  key={booking.id}
                  className={`booking-card ${booking.status} ${conflict ? 'has-conflict' : ''}`}
                >
                  {/* Conflict Warning */}
                  {conflict && booking.status !== 'blocked' && (
                    <div className="conflict-badge">
                      <AlertTriangle size={14} />
                      <span>Conflict</span>
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="booking-card-header">
                    <div className="booking-resident">
                      <span className="resident-name">{booking.residentName}</span>
                      <span className="resident-unit">Unit {booking.unit}</span>
                    </div>
                    <div className="booking-header-right">
                      <span className={`status-badge ${booking.status}`}>
                        {booking.status === 'confirmed' && <CheckCircle size={12} />}
                        {booking.status === 'pending' && <Clock size={12} />}
                        {booking.status === 'blocked' && <XCircle size={12} />}
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                      <div className="booking-menu-wrapper">
                        <button
                          className="booking-menu-btn"
                          onClick={() => setActiveMenu(activeMenu === booking.id ? null : booking.id)}
                        >
                          <MoreVertical size={18} />
                        </button>
                        {activeMenu === booking.id && (
                          <div className="booking-menu-dropdown">
                            {booking.status === 'pending' && (
                              <button onClick={() => handleApproveBooking(booking)}>
                                <CheckCircle size={16} />
                                Approve Booking
                              </button>
                            )}
                            <button onClick={() => openEditModal(booking)}>
                              <Edit3 size={16} />
                              Edit Booking
                            </button>
                            {booking.status !== 'blocked' && (
                              <button onClick={() => openBlockModal(booking)}>
                                <XCircle size={16} />
                                Block/Cancel Booking
                              </button>
                            )}
                            <button onClick={() => handleSendReminder(booking)}>
                              <Bell size={16} />
                              Send Reminder
                            </button>
                            <button onClick={() => openDetailsModal(booking)}>
                              <HelpCircle size={16} />
                              View Details
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Booking Details */}
                  <div className="booking-details">
                    <div className="booking-datetime">
                      <Calendar size={16} />
                      <span className="booking-date">{formatDate(booking.date)}</span>
                      <span className="booking-time">
                        {formatTime(booking.startTime)} - {formatTime(booking.endTime)}
                      </span>
                    </div>

                    <div
                      className="booking-type-badge"
                      style={{ background: `${bookingType.color}20`, color: bookingType.color }}
                    >
                      <IconComponent size={14} />
                      <span>{bookingType.label}</span>
                    </div>
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="booking-notes">
                      <span>{booking.notes}</span>
                    </div>
                  )}

                  {/* Service Elevator Badge */}
                  {booking.requiresServiceElevator && (
                    <div className="service-elevator-badge">
                      <ArrowUpDown size={12} />
                      <span>Service Elevator Required</span>
                    </div>
                  )}

                  {/* Quick Actions for pending */}
                  {booking.status === 'pending' && (
                    <div className="booking-actions">
                      <button
                        className="action-btn approve"
                        onClick={() => handleApproveBooking(booking)}
                      >
                        <CheckCircle size={16} />
                        Approve
                      </button>
                      <button
                        className="action-btn block"
                        onClick={() => openBlockModal(booking)}
                      >
                        <XCircle size={16} />
                        Block
                      </button>
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="calendar-view">
          <div className="calendar-nav">
            <button className="nav-btn" onClick={previousWeek}>
              <ChevronLeft size={20} />
            </button>
            <h3>
              {currentWeek.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <button className="nav-btn" onClick={nextWeek}>
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="calendar-grid">
            {getWeekDates().map(day => (
              <div key={day.date} className={`calendar-day ${day.isToday ? 'today' : ''}`}>
                <div className="day-header">
                  <span className="day-name">{day.dayName}</span>
                  <span className="day-num">{day.dayNum}</span>
                </div>
                <div className="day-bookings">
                  {getBookingsForDate(day.date).map(booking => {
                    const bookingType = getBookingType(booking.type)
                    return (
                      <div
                        key={booking.id}
                        className={`calendar-booking ${booking.status}`}
                        style={{ borderLeftColor: bookingType.color }}
                        onClick={() => openDetailsModal(booking)}
                      >
                        <span className="cal-time">{formatTime(booking.startTime)}</span>
                        <span className="cal-resident">{booking.residentName}</span>
                        <span className="cal-type">{bookingType.label}</span>
                      </div>
                    )
                  })}
                  {getBookingsForDate(day.date).length === 0 && (
                    <div className="no-day-bookings">
                      <span>No bookings</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Create Booking Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Elevator Booking</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Resident / Unit *</label>
                <select
                  value={bookingForm.residentId}
                  onChange={e => setBookingForm({ ...bookingForm, residentId: e.target.value })}
                >
                  <option value="">Select resident...</option>
                  {residents.map(resident => (
                    <option key={resident.id} value={resident.id}>
                      {resident.name} - Unit {resident.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Booking Type *</label>
                <select
                  value={bookingForm.type}
                  onChange={e => setBookingForm({ ...bookingForm, type: e.target.value })}
                >
                  {bookingTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time *</label>
                  <select
                    value={bookingForm.startTime}
                    onChange={e => handleStartTimeChange(e.target.value)}
                  >
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <select
                    value={bookingForm.endTime}
                    onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                  >
                    {timeSlots.filter(s => s.value > bookingForm.startTime).map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Special Instructions</label>
                <textarea
                  placeholder="Any special requirements or notes..."
                  value={bookingForm.notes}
                  onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bookingForm.requiresServiceElevator}
                    onChange={e => setBookingForm({ ...bookingForm, requiresServiceElevator: e.target.checked })}
                  />
                  <span>Requires service elevator</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bookingForm.autoApprove}
                    onChange={e => setBookingForm({ ...bookingForm, autoApprove: e.target.checked })}
                  />
                  <span>Auto-approve booking</span>
                </label>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bookingForm.sendNotification}
                    onChange={e => setBookingForm({ ...bookingForm, sendNotification: e.target.checked })}
                  />
                  <span>Send notification to resident</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowCreateModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleCreateBooking}
                disabled={!bookingForm.residentId || !bookingForm.date}
              >
                <Plus size={18} />
                Create Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Booking Modal */}
      {showEditModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content booking-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Booking</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Resident / Unit *</label>
                <select
                  value={bookingForm.residentId}
                  onChange={e => setBookingForm({ ...bookingForm, residentId: e.target.value })}
                >
                  <option value="">Select resident...</option>
                  {residents.map(resident => (
                    <option key={resident.id} value={resident.id}>
                      {resident.name} - Unit {resident.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Booking Type *</label>
                <select
                  value={bookingForm.type}
                  onChange={e => setBookingForm({ ...bookingForm, type: e.target.value })}
                >
                  {bookingTypes.map(type => (
                    <option key={type.id} value={type.id}>{type.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={bookingForm.date}
                  onChange={e => setBookingForm({ ...bookingForm, date: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Time *</label>
                  <select
                    value={bookingForm.startTime}
                    onChange={e => handleStartTimeChange(e.target.value)}
                  >
                    {timeSlots.map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>End Time *</label>
                  <select
                    value={bookingForm.endTime}
                    onChange={e => setBookingForm({ ...bookingForm, endTime: e.target.value })}
                  >
                    {timeSlots.filter(s => s.value > bookingForm.startTime).map(slot => (
                      <option key={slot.value} value={slot.value}>{slot.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Special Instructions</label>
                <textarea
                  placeholder="Any special requirements or notes..."
                  value={bookingForm.notes}
                  onChange={e => setBookingForm({ ...bookingForm, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={bookingForm.requiresServiceElevator}
                    onChange={e => setBookingForm({ ...bookingForm, requiresServiceElevator: e.target.checked })}
                  />
                  <span>Requires service elevator</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-danger-outline" onClick={() => {
                setShowEditModal(false)
                openBlockModal(selectedBooking)
              }}>
                <XCircle size={18} />
                Cancel Booking
              </button>
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Close
              </button>
              <button
                className="btn-primary"
                onClick={handleEditBooking}
              >
                <CheckCircle size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Block/Cancel Modal */}
      {showBlockModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowBlockModal(false)}>
          <div className="modal-content block-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Cancel Booking</h3>
              <button className="modal-close" onClick={() => setShowBlockModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="block-warning">
                <XCircle size={32} />
                <p>Cancel booking for <strong>{selectedBooking.residentName}</strong> (Unit {selectedBooking.unit})?</p>
                <span className="block-datetime">
                  {formatDate(selectedBooking.date)} at {formatTime(selectedBooking.startTime)}
                </span>
              </div>

              <div className="form-group">
                <label>Reason for cancellation</label>
                <select
                  value={blockReason}
                  onChange={e => setBlockReason(e.target.value)}
                >
                  {blockReasons.map(reason => (
                    <option key={reason.id} value={reason.id}>{reason.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Message to resident (optional)</label>
                <textarea
                  placeholder="Explain the reason for cancellation..."
                  value={blockMessage}
                  onChange={e => setBlockMessage(e.target.value)}
                  rows={2}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowBlockModal(false)}>
                Keep Booking
              </button>
              <button className="btn-danger" onClick={handleBlockBooking}>
                <XCircle size={18} />
                Cancel Booking
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && selectedBooking && (
        <div className="modal-overlay" onClick={() => setShowDetailsModal(false)}>
          <div className="modal-content details-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Booking Details</h3>
              <button className="modal-close" onClick={() => setShowDetailsModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="details-section">
                <h4>Resident</h4>
                <p>{selectedBooking.residentName} - Unit {selectedBooking.unit}</p>
              </div>

              <div className="details-section">
                <h4>Date & Time</h4>
                <p>{formatDate(selectedBooking.date)}, {formatTime(selectedBooking.startTime)} - {formatTime(selectedBooking.endTime)}</p>
              </div>

              <div className="details-section">
                <h4>Booking Type</h4>
                <p>{getBookingType(selectedBooking.type).label}</p>
              </div>

              <div className="details-section">
                <h4>Status</h4>
                <span className={`status-badge ${selectedBooking.status}`}>
                  {selectedBooking.status.charAt(0).toUpperCase() + selectedBooking.status.slice(1)}
                </span>
              </div>

              {selectedBooking.notes && (
                <div className="details-section">
                  <h4>Notes</h4>
                  <p>{selectedBooking.notes}</p>
                </div>
              )}

              <div className="details-section">
                <h4>Service Elevator</h4>
                <p>{selectedBooking.requiresServiceElevator ? 'Required' : 'Not required'}</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>
                Close
              </button>
              <button className="btn-primary" onClick={() => {
                setShowDetailsModal(false)
                openEditModal(selectedBooking)
              }}>
                <Edit3 size={18} />
                Edit Booking
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

      {/* Click outside to close menus */}
      {activeMenu && (
        <div className="menu-backdrop" onClick={() => setActiveMenu(null)} />
      )}
    </div>
  )
}

export default ManagerElevator
