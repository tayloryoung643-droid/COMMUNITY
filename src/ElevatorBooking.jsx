import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Check, Calendar, Clock, Home, ArrowUpDown, Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getBookings, createBooking } from './services/elevatorBookingService'
import EmptyState from './components/EmptyState'
import './ElevatorBooking.css'

function ElevatorBooking({ onBack }) {
  const { userProfile, isDemoMode, buildingBackgroundUrl } = useAuth()

  const [reservations, setReservations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    movingType: ''
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

  const formatTimeDisplay = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDayDisplay = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const WeatherIcon = getWeatherIcon(weatherData.condition)

  useEffect(() => {
    async function loadBookings() {
      const buildingId = userProfile?.building_id
      console.log('[ElevatorBooking] Fetching bookings for building:', buildingId)

      if (!buildingId) {
        console.log('[ElevatorBooking] No building_id - showing empty state')
        setReservations([])
        setLoading(false)
        return
      }

      try {
        const data = await getBookings(buildingId)

        // Map DB booking types to display values
        const typeMapReverse = {
          'move_in': 'Moving In',
          'move_out': 'Moving Out',
          'furniture_delivery': 'Furniture Delivery',
          'appliance_delivery': 'Appliance Delivery',
          'contractor_work': 'Contractor Work',
          'other': 'Other'
        }

        // Map times to time slot display
        const getTimeSlot = (startTime) => {
          if (!startTime) return 'N/A'
          const hour = parseInt(startTime.split('T')[1]?.substring(0, 2) || '9')
          if (hour < 12) return 'Morning (8:00 AM - 12:00 PM)'
          if (hour < 16) return 'Afternoon (12:00 PM - 4:00 PM)'
          return 'Evening (4:00 PM - 8:00 PM)'
        }

        // data will be [] if table is empty - this is SUCCESS, not an error
        const transformedData = (data || []).map(booking => ({
          id: booking.id,
          date: booking.start_time?.split('T')[0],
          timeSlot: getTimeSlot(booking.start_time),
          unit: `Unit ${userProfile?.unit_number || 'Unknown'}`,
          type: typeMapReverse[booking.booking_type] || booking.booking_type || 'Unknown',
          status: booking.status === 'confirmed' ? 'Confirmed' : 'Pending'
        }))
        setReservations(transformedData)
        setError(null) // Clear any previous error
        console.log('[ElevatorBooking] SUCCESS - bookings loaded:', transformedData.length)
      } catch (err) {
        // Only set error for actual failures (network, permission, table doesn't exist)
        console.error('[ElevatorBooking] ERROR loading bookings:', {
          message: err.message,
          code: err.code,
          details: err.details,
          hint: err.hint
        })
        setError(`Failed to load bookings: ${err.message || 'Unknown error'}`)
        setReservations([]) // Show empty state alongside error
      } finally {
        setLoading(false)
      }
    }
    loadBookings()
  }, [userProfile])

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { weekday: 'short', month: 'short', day: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!formData.date || !formData.timeSlot || !formData.movingType) return

    try {
      // Map moving types to valid DB booking_type values
      const typeMap = {
        'Moving In': 'move_in',
        'Moving Out': 'move_out'
      }

      // Parse time slot to get start/end times
      const timeSlotMap = {
        'Morning (8:00 AM - 12:00 PM)': { start: '08:00:00', end: '12:00:00' },
        'Afternoon (12:00 PM - 4:00 PM)': { start: '12:00:00', end: '16:00:00' },
        'Evening (4:00 PM - 8:00 PM)': { start: '16:00:00', end: '20:00:00' }
      }
      const times = timeSlotMap[formData.timeSlot] || { start: '09:00:00', end: '11:00:00' }

      await createBooking({
        building_id: userProfile.building_id,
        resident_id: userProfile.id,
        start_time: `${formData.date}T${times.start}`,
        end_time: `${formData.date}T${times.end}`,
        booking_type: typeMap[formData.movingType] || 'other',
        status: 'pending',
        notes: null,
        requires_service_elevator: true
      })
      // Reload bookings
      const data = await getBookings(userProfile.building_id)

      // Map DB booking types to display values
      const typeMapReverse = {
        'move_in': 'Moving In',
        'move_out': 'Moving Out',
        'furniture_delivery': 'Furniture Delivery',
        'appliance_delivery': 'Appliance Delivery',
        'contractor_work': 'Contractor Work',
        'other': 'Other'
      }

      // Map times to time slot display
      const getTimeSlot = (startTime) => {
        if (!startTime) return 'N/A'
        const hour = parseInt(startTime.split('T')[1]?.substring(0, 2) || '9')
        if (hour < 12) return 'Morning (8:00 AM - 12:00 PM)'
        if (hour < 16) return 'Afternoon (12:00 PM - 4:00 PM)'
        return 'Evening (4:00 PM - 8:00 PM)'
      }

      const transformedData = (data || []).map(booking => ({
        id: booking.id,
        date: booking.start_time?.split('T')[0],
        timeSlot: getTimeSlot(booking.start_time),
        unit: `Unit ${userProfile?.unit_number || 'Unknown'}`,
        type: typeMapReverse[booking.booking_type] || booking.booking_type || 'Unknown',
        status: booking.status === 'confirmed' ? 'Confirmed' : 'Pending'
      }))
      setReservations(transformedData)

      setShowForm(false)
      setShowSuccess(true)
      setFormData({
        date: '',
        timeSlot: '',
        movingType: ''
      })
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (err) {
      console.error('[ElevatorBooking] Error creating booking:', err)
      setError('Failed to create booking. Please try again.')
    }
  }

  const handleRequestBooking = () => {
    setShowForm(true)
    setShowSuccess(false)
  }

  const bgStyle = buildingBackgroundUrl ? { '--building-bg-image': `url(${buildingBackgroundUrl})` } : {}

  // Loading state
  if (loading) {
    return (
      <div className="elevator-booking-container resident-inner-page" style={bgStyle}>
        <div className="inner-page-hero">
          <button className="inner-page-back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="inner-page-weather">
            <div className="weather-datetime">{formatDayDisplay(currentTime)} | {formatTimeDisplay(currentTime)}</div>
            <div className="weather-temp-row">
              <WeatherIcon size={20} className="weather-icon" />
              <span className="weather-temp">{weatherData.temp}°</span>
            </div>
            <div className="weather-condition">{weatherData.conditionText}</div>
          </div>
          <div className="inner-page-title-container">
            <h1 className="inner-page-title">Elevator</h1>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh', color: '#9CA3AF' }}>
          Loading bookings...
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="elevator-booking-container resident-inner-page" style={bgStyle}>
        <div className="inner-page-hero">
          <button className="inner-page-back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="inner-page-weather">
            <div className="weather-datetime">{formatDayDisplay(currentTime)} | {formatTimeDisplay(currentTime)}</div>
            <div className="weather-temp-row">
              <WeatherIcon size={20} className="weather-icon" />
              <span className="weather-temp">{weatherData.temp}°</span>
            </div>
            <div className="weather-condition">{weatherData.conditionText}</div>
          </div>
          <div className="inner-page-title-container">
            <h1 className="inner-page-title">Elevator</h1>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh', color: '#ef4444' }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="elevator-booking-container resident-inner-page" style={bgStyle}>
      {/* Hero Section with Weather and Title */}
      <div className="inner-page-hero">
        <button className="inner-page-back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="inner-page-weather">
          <div className="weather-datetime">{formatDayDisplay(currentTime)} | {formatTimeDisplay(currentTime)}</div>
          <div className="weather-temp-row">
            <WeatherIcon size={20} className="weather-icon" />
            <span className="weather-temp">{weatherData.temp}°</span>
          </div>
          <div className="weather-condition">{weatherData.conditionText}</div>
        </div>
        <div className="inner-page-title-container">
          <h1 className="inner-page-title">Elevator</h1>
        </div>
      </div>

      <main className="elevator-booking-content">
        {/* Request Booking Button */}
        {!showForm && (
          <button className="request-booking-button animate-in delay-1" onClick={handleRequestBooking}>
            <Plus size={20} />
            <span>Request Booking</span>
          </button>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="success-message">
            <Check size={20} />
            <span>Request Submitted - Pending Approval</span>
          </div>
        )}

        {/* Booking Request Form */}
        {showForm && (
          <div className="booking-form-container animate-in delay-1">
            <div className="form-header">
              <ArrowUpDown size={24} />
              <h2 className="form-title">Request Elevator Booking</h2>
            </div>
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-group">
                <label htmlFor="date">
                  <Calendar size={16} />
                  Select Date
                </label>
                <input
                  type="date"
                  id="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  min="2026-01-10"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="timeSlot">
                  <Clock size={16} />
                  Time Slot
                </label>
                <select
                  id="timeSlot"
                  name="timeSlot"
                  value={formData.timeSlot}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a time slot</option>
                  <option value="Morning (8:00 AM - 12:00 PM)">Morning (8:00 AM - 12:00 PM)</option>
                  <option value="Afternoon (12:00 PM - 4:00 PM)">Afternoon (12:00 PM - 4:00 PM)</option>
                  <option value="Evening (4:00 PM - 8:00 PM)">Evening (4:00 PM - 8:00 PM)</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="movingType">
                  <Home size={16} />
                  Moving Type
                </label>
                <select
                  id="movingType"
                  name="movingType"
                  value={formData.movingType}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select moving type</option>
                  <option value="Moving In">Moving In</option>
                  <option value="Moving Out">Moving Out</option>
                </select>
              </div>

              <div className="form-actions">
                <button type="button" className="cancel-button" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
                <button type="submit" className="submit-button">
                  Submit Request
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Upcoming Reservations */}
        <section className="reservations-section animate-in delay-2">
          <h2 className="section-title">Upcoming Reservations</h2>
          <div className="reservations-list">
            {reservations.length === 0 ? (
              <EmptyState
                icon="elevator"
                title="No bookings yet"
                subtitle="Reserve the elevator for your next move"
                ctaLabel="Book Elevator"
                onCta={handleRequestBooking}
              />
            ) : (
              reservations.map((reservation, index) => (
                <article key={reservation.id} className={`reservation-card animate-in delay-${(index % 4) + 3}`}>
                  <div className="card-accent"></div>
                  <div className="reservation-header">
                    <div className="reservation-date">
                      <span className="date-text">{formatDate(reservation.date)}</span>
                      <span className="time-slot">{reservation.timeSlot}</span>
                    </div>
                    <span className={`status-badge ${reservation.status.toLowerCase()}`}>
                      {reservation.status === "Confirmed" && <Check size={12} />}
                      {reservation.status}
                    </span>
                  </div>
                  <div className="reservation-details">
                    <div className="detail-item">
                      <span className="detail-label">Unit</span>
                      <span className="detail-value">{reservation.unit}</span>
                    </div>
                    <div className="detail-item">
                      <span className="detail-label">Type</span>
                      <span className="detail-value">{reservation.type}</span>
                    </div>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  )
}

export default ElevatorBooking
