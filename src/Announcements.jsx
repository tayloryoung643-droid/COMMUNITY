import './Announcements.css'

function Announcements({ onBack }) {
  // Fake announcement data - we'll replace this with real data later
  const announcements = [
    {
      id: 1,
      type: "Maintenance",
      icon: "🔧",
      title: "Water Shutoff Notice",
      date: "2026-01-08",
      message: "Water will be shut off on Thursday, January 10th from 9 AM to 2 PM for pipe maintenance. Please plan accordingly and store water if needed."
    },
    {
      id: 2,
      type: "Safety",
      icon: "🚨",
      title: "Fire Alarm Testing",
      date: "2026-01-05",
      message: "Annual fire alarm testing will occur on Monday, January 15th starting at 10 AM. The alarms will sound intermittently throughout the day. No evacuation is required."
    },
    {
      id: 3,
      type: "General",
      icon: "📢",
      title: "Gym Equipment Upgrade",
      date: "2026-01-03",
      message: "We're excited to announce new fitness equipment has been installed in the gym! Come check out the new treadmills, ellipticals, and weight machines."
    },
    {
      id: 4,
      type: "General",
      icon: "📢",
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

  // Get color based on announcement type
  const getTypeColor = (type) => {
    switch(type) {
      case 'Maintenance': return '#f59e0b'
      case 'Safety': return '#ef4444'
      case 'General': return '#3b82f6'
      default: return '#64748b'
    }
  }

  return (
    <div className="announcements-container">
      <header className="announcements-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="page-title">Announcements</h1>
      </header>

      <main className="announcements-list">
        {announcements.map((announcement) => (
          <article key={announcement.id} className="announcement-card">
            <div className="announcement-header">
              <span className="announcement-icon">{announcement.icon}</span>
              <span
                className="announcement-type"
                style={{ backgroundColor: getTypeColor(announcement.type) }}
              >
                {announcement.type}
              </span>
              <span className="announcement-date">
                {formatDate(announcement.date)}
              </span>
            </div>
            <h2 className="announcement-title">{announcement.title}</h2>
            <p className="announcement-message">{announcement.message}</p>
          </article>
        ))}
      </main>
    </div>
  )
}

export default Announcements
