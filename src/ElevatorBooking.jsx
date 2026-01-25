import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, Check, Calendar, Clock, Home, ArrowUpDown, Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getBookings, createBooking } from './services/elevatorBookingService'
import EmptyState from './components/EmptyState'
import './ElevatorBooking.css'

// Demo reservation data - used when in demo mode
const DEMO_RESERVATIONS = [
  {
    id: 1,
    date: "2026-01-15",
    timeSlot: "Morning (8:00 AM - 12:00 PM)",
    unit: "Unit 1504",
    type: "Moving Out",
    status: "Confirmed"
  },
  {
    id: 2,
    date: "2026-01-18",
    timeSlot: "Afternoon (12:00 PM - 4:00 PM)",
    unit: "Unit 802",
    type: "Moving In",
    status: "Confirmed"
  },
  {
    id: 3,
    date: "2026-01-20",
    timeSlot: "Morning (8:00 AM - 12:00 PM)",
    unit: "Unit 1107",
    type: "Moving Out",
    status: "Pending"
  },
  {
    id: 4,
    date: "2026-01-22",
    timeSlot: "Evening (4:00 PM - 8:00 PM)",
    unit: "Unit 605",
    type: "Moving In",
    status: "Confirmed"
  },
  {
    id: 5,
    date: "2026-01-25",
    timeSlot: "Afternoon (12:00 PM - 4:00 PM)",
    unit: "Unit 1203",
    type: "Moving In",
    status: "Pending"
  }
]

function ElevatorBooking({ onBack }) {
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

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
      if (isInDemoMode) {
        console.log('[ElevatorBooking] MODE: DEMO - bookings.length:', DEMO_RESERVATIONS.length)
        setReservations(DEMO_RESERVATIONS)
        setLoading(false)
        return
      }

      // Real mode
      const buildingId = userProfile?.building_id
      console.log('[ElevatorBooking] MODE: REAL - fetching for building:', buildingId)

      if (!buildingId) {
        console.log('[ElevatorBooking] No building_id - showing empty state')
        setReservations([])
        setLoading(false)
        return
      }

      try {
        const data = await getBookings(buildingId)
        const transformedData = (data || []).map(booking => ({
          id: booking.id,
          date: booking.booking_date,
          timeSlot: booking.time_slot,
          unit: `Unit ${booking.user?.unit_number || 'Unknown'}`,
          type: booking.moving_type,
          status: booking.status === 'confirmed' ? 'Confirmed' : 'Pending'
        }))
        setReservations(transformedData)
        console.log('[ElevatorBooking] Bookings fetched:', transformedData.length)
      } catch (err) {
        console.error('[ElevatorBooking] Error loading bookings:', err)
        setError('Unable to load bookings. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadBookings()
  }, [isInDemoMode, userProfile])

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

    if (isInDemoMode) {
      // Demo mode: add to local state only
      const newReservation = {
        id: Date.now(),
        date: formData.date,
        timeSlot: formData.timeSlot,
        unit: 'Unit 1201',
        type: formData.movingType,
        status: 'Pending'
      }
      setReservations([...reservations, newReservation])
    } else {
      // Real mode: save to Supabase
      try {
        await createBooking({
          building_id: userProfile.building_id,
          user_id: userProfile.id,
          booking_date: formData.date,
          time_slot: formData.timeSlot,
          moving_type: formData.movingType,
          status: 'pending'
        })
        // Reload bookings
        const data = await getBookings(userProfile.building_id)
        const transformedData = data.map(booking => ({
          id: booking.id,
          date: booking.booking_date,
          timeSlot: booking.time_slot,
          unit: `Unit ${booking.user?.unit_number || 'Unknown'}`,
          type: booking.moving_type,
          status: booking.status === 'confirmed' ? 'Confirmed' : 'Pending'
        }))
        setReservations(transformedData)
      } catch (err) {
        console.error('Error creating booking:', err)
      }
    }

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
  }

  const handleRequestBooking = () => {
    setShowForm(true)
    setShowSuccess(false)
  }

  // Loading state
  if (loading) {
    return (
      <div className="elevator-booking-container resident-inner-page">
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
      <div className="elevator-booking-container resident-inner-page">
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
    <div className="elevator-booking-container resident-inner-page">
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
