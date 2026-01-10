import { useState } from 'react'
import './ElevatorBooking.css'

function ElevatorBooking({ onBack }) {
  const [showForm, setShowForm] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [formData, setFormData] = useState({
    date: '',
    timeSlot: '',
    movingType: ''
  })

  // Fake reservation data
  const reservations = [
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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (formData.date && formData.timeSlot && formData.movingType) {
      setShowForm(false)
      setShowSuccess(true)
      // Reset form
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
  }

  const handleRequestBooking = () => {
    setShowForm(true)
    setShowSuccess(false)
  }

  return (
    <div className="elevator-booking-container">
      <header className="elevator-booking-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="page-title">Elevator Booking</h1>
      </header>

      <main className="elevator-booking-content">
        {/* Request Booking Button */}
        {!showForm && (
          <button className="request-booking-button" onClick={handleRequestBooking}>
            + Request Booking
          </button>
        )}

        {/* Success Message */}
        {showSuccess && (
          <div className="success-message">
            ✓ Request Submitted - Pending Approval
          </div>
        )}

        {/* Booking Request Form */}
        {showForm && (
          <div className="booking-form-container">
            <h2 className="form-title">Request Elevator Booking</h2>
            <form onSubmit={handleSubmit} className="booking-form">
              <div className="form-group">
                <label htmlFor="date">Select Date</label>
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
                <label htmlFor="timeSlot">Time Slot</label>
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
                <label htmlFor="movingType">Moving Type</label>
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
        <section className="reservations-section">
          <h2 className="section-title">Upcoming Reservations</h2>
          <div className="reservations-list">
            {reservations.map((reservation) => (
              <article key={reservation.id} className="reservation-card">
                <div className="reservation-header">
                  <div className="reservation-date">
                    <span className="date-text">{formatDate(reservation.date)}</span>
                    <span className="time-slot">{reservation.timeSlot}</span>
                  </div>
                  <span className={`status-badge ${reservation.status.toLowerCase()}`}>
                    {reservation.status}
                  </span>
                </div>
                <div className="reservation-details">
                  <div className="detail-item">
                    <span className="detail-label">Unit:</span>
                    <span className="detail-value">{reservation.unit}</span>
                  </div>
                  <div className="detail-item">
                    <span className="detail-label">Type:</span>
                    <span className="detail-value">{reservation.type}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default ElevatorBooking
