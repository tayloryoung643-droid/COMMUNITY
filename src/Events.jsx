import { useState } from 'react'
import './Events.css'

function Events({ onBack }) {
  // Fake event data - later this will come from a real database
  const [events, setEvents] = useState([
    {
      id: 1,
      title: "Rooftop BBQ",
      date: "2026-01-15",
      time: "6:00 PM",
      location: "Rooftop",
      description: "Join us for our monthly rooftop BBQ! Burgers, hot dogs, and vegetarian options provided. BYOB welcome.",
      attendees: 18,
      isUpcoming: true,
      userRSVPd: false
    },
    {
      id: 2,
      title: "Yoga in the Courtyard",
      date: "2026-01-12",
      time: "8:00 AM",
      location: "Courtyard",
      description: "Start your Sunday with a relaxing yoga session. All levels welcome! Bring your own mat.",
      attendees: 12,
      isUpcoming: true,
      userRSVPd: false
    },
    {
      id: 3,
      title: "Building Town Hall",
      date: "2026-01-20",
      time: "7:00 PM",
      location: "Community Room",
      description: "Monthly town hall meeting to discuss building updates, maintenance schedules, and resident concerns.",
      attendees: 25,
      isUpcoming: true,
      userRSVPd: false
    },
    {
      id: 4,
      title: "Wine & Cheese Social",
      date: "2026-01-18",
      time: "7:30 PM",
      location: "Lobby",
      description: "Mingle with neighbors over wine and cheese. A great opportunity to meet new people in the building!",
      attendees: 15,
      isUpcoming: true,
      userRSVPd: false
    },
    {
      id: 5,
      title: "Holiday Party",
      date: "2025-12-20",
      time: "6:00 PM",
      location: "Community Room",
      description: "Annual holiday celebration with food, drinks, and festive fun for all residents.",
      attendees: 45,
      isUpcoming: false,
      userRSVPd: false
    },
    {
      id: 6,
      title: "Fitness Bootcamp",
      date: "2025-12-10",
      time: "9:00 AM",
      location: "Gym",
      description: "High-intensity workout session led by resident personal trainer Mike.",
      attendees: 8,
      isUpcoming: false,
      userRSVPd: false
    }
  ])

  // Helper function to format dates nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  // Handle RSVP toggle
  const handleRSVP = (eventId) => {
    setEvents(events.map(event => {
      if (event.id === eventId) {
        return {
          ...event,
          userRSVPd: !event.userRSVPd,
          attendees: event.userRSVPd ? event.attendees - 1 : event.attendees + 1
        }
      }
      return event
    }))
  }

  const upcomingEvents = events.filter(event => event.isUpcoming)
  const pastEvents = events.filter(event => !event.isUpcoming)

  return (
    <div className="events-container">
      <header className="events-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="page-title">Events</h1>
      </header>

      <main className="events-content">
        {/* Upcoming Events Section */}
        <section className="events-section">
          <h2 className="section-title">Upcoming Events</h2>
          <div className="events-list">
            {upcomingEvents.map((event) => (
              <article key={event.id} className="event-card">
                <div className="event-header">
                  <h3 className="event-title">{event.title}</h3>
                  <span className="event-attendees">{event.attendees} going</span>
                </div>

                <div className="event-details">
                  <div className="event-detail-item">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">{formatDate(event.date)}</span>
                  </div>
                  <div className="event-detail-item">
                    <span className="detail-icon">🕐</span>
                    <span className="detail-text">{event.time}</span>
                  </div>
                  <div className="event-detail-item">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{event.location}</span>
                  </div>
                </div>

                <p className="event-description">{event.description}</p>

                <button
                  className={`rsvp-button ${event.userRSVPd ? 'rsvpd' : ''}`}
                  onClick={() => handleRSVP(event.id)}
                >
                  {event.userRSVPd ? 'Going ✓' : 'RSVP'}
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* Past Events Section */}
        <section className="events-section">
          <h2 className="section-title">Past Events</h2>
          <div className="events-list">
            {pastEvents.map((event) => (
              <article key={event.id} className="event-card past">
                <div className="event-header">
                  <h3 className="event-title">{event.title}</h3>
                  <span className="event-attendees">{event.attendees} attended</span>
                </div>

                <div className="event-details">
                  <div className="event-detail-item">
                    <span className="detail-icon">📅</span>
                    <span className="detail-text">{formatDate(event.date)}</span>
                  </div>
                  <div className="event-detail-item">
                    <span className="detail-icon">🕐</span>
                    <span className="detail-text">{event.time}</span>
                  </div>
                  <div className="event-detail-item">
                    <span className="detail-icon">📍</span>
                    <span className="detail-text">{event.location}</span>
                  </div>
                </div>

                <p className="event-description">{event.description}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Events
