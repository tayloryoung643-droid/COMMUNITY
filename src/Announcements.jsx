import { ArrowLeft, Wrench, AlertTriangle, Megaphone } from 'lucide-react'
import './Announcements.css'

function Announcements({ onBack }) {
  // Fake announcement data - we'll replace this with real data later
  const announcements = [
    {
      id: 1,
      type: "Maintenance",
      icon: Wrench,
      title: "Water Shutoff Notice",
      date: "2026-01-08",
      message: "Water will be shut off on Thursday, January 10th from 9 AM to 2 PM for pipe maintenance. Please plan accordingly and store water if needed."
    },
    {
      id: 2,
      type: "Safety",
      icon: AlertTriangle,
      title: "Fire Alarm Testing",
      date: "2026-01-05",
      message: "Annual fire alarm testing will occur on Monday, January 15th starting at 10 AM. The alarms will sound intermittently throughout the day. No evacuation is required."
    },
    {
      id: 3,
      type: "General",
      icon: Megaphone,
      title: "Gym Equipment Upgrade",
      date: "2026-01-03",
      message: "We're excited to announce new fitness equipment has been installed in the gym! Come check out the new treadmills, ellipticals, and weight machines."
    },
    {
      id: 4,
      type: "General",
      icon: Megaphone,
      title: "Holiday Lobby Decorations",
      date: "2025-12-28",
      message: "Thank you to everyone who enjoyed our holiday decorations! Decorations will be removed by January 5th."
    }
  ]

  // Helper function to format dates nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { month: 'short', day: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  // Get gradient based on announcement type
  const getTypeGradient = (type) => {
    switch(type) {
      case 'Maintenance': return 'linear-gradient(135deg, #f59e0b, #ef4444)'
      case 'Safety': return 'linear-gradient(135deg, #ef4444, #dc2626)'
      case 'General': return 'linear-gradient(135deg, #3b82f6, #06b6d4)'
      default: return 'linear-gradient(135deg, #64748b, #94a3b8)'
    }
  }

  return (
    <div className="announcements-container">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <header className="announcements-header">
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="page-title-light">Announcements</h1>
      </header>

      <main className="announcements-list">
        {announcements.map((announcement, index) => {
          const IconComponent = announcement.icon
          return (
            <article
              key={announcement.id}
              className={`announcement-card animate-in delay-${(index % 6) + 1}`}
            >
              <div className="card-accent"></div>
              <div className="announcement-header">
                <div
                  className="announcement-icon-wrapper"
                  style={{ background: getTypeGradient(announcement.type) }}
                >
                  <IconComponent size={24} strokeWidth={2} />
                </div>
                <div className="announcement-meta">
                  <span
                    className="announcement-type"
                    style={{ background: getTypeGradient(announcement.type) }}
                  >
                    {announcement.type}
                  </span>
                  <span className="announcement-date">
                    {formatDate(announcement.date)}
                  </span>
                </div>
              </div>
              <h2 className="announcement-title">{announcement.title}</h2>
              <p className="announcement-message">{announcement.message}</p>
            </article>
          )
        })}
      </main>
    </div>
  )
}

export default Announcements
