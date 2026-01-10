import './Emergency.css'

function Emergency({ onBack }) {
  // Emergency contact data organized by category
  const emergencyContacts = {
    building: [
      {
        id: 1,
        name: "Building Emergency Line",
        subtitle: "24/7",
        phone: "604-555-1234",
        icon: "🏢"
      },
      {
        id: 2,
        name: "After-Hours Maintenance",
        subtitle: "Urgent repairs only",
        phone: "604-555-1235",
        icon: "🔧"
      },
      {
        id: 3,
        name: "Front Desk / Concierge",
        subtitle: "Daily 8 AM - 8 PM",
        phone: "604-555-1236",
        icon: "📞"
      },
      {
        id: 4,
        name: "Building Manager",
        subtitle: "Office hours",
        phone: "604-555-1237",
        icon: "👔"
      }
    ],
    general: [
      {
        id: 5,
        name: "911",
        subtitle: "Police, Fire, Medical",
        phone: "911",
        icon: "🚨"
      },
      {
        id: 6,
        name: "Poison Control",
        subtitle: "24/7 hotline",
        phone: "1-800-222-1222",
        icon: "☠️"
      },
      {
        id: 7,
        name: "Non-Emergency Police",
        subtitle: "For non-urgent matters",
        phone: "604-555-9999",
        icon: "👮"
      }
    ]
  }

  const handleCall = (phone) => {
    // On mobile devices, this will open the phone dialer
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="emergency-container">
      <header className="emergency-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="page-title">Emergency Contacts</h1>
      </header>

      <main className="emergency-content">
        {/* Building Emergencies Section */}
        <section className="emergency-section">
          <h2 className="section-title">Building Emergencies</h2>
          <div className="contacts-list">
            {emergencyContacts.building.map((contact) => (
              <article key={contact.id} className="contact-card">
                <div className="contact-icon">{contact.icon}</div>
                <div className="contact-info">
                  <h3 className="contact-name">{contact.name}</h3>
                  <p className="contact-subtitle">{contact.subtitle}</p>
                  <p className="contact-phone">{contact.phone}</p>
                </div>
                <button
                  className="call-button"
                  onClick={() => handleCall(contact.phone)}
                >
                  Call
                </button>
              </article>
            ))}
          </div>
        </section>

        {/* General Emergencies Section */}
        <section className="emergency-section">
          <h2 className="section-title">General Emergencies</h2>
          <div className="contacts-list">
            {emergencyContacts.general.map((contact) => (
              <article key={contact.id} className="contact-card">
                <div className="contact-icon">{contact.icon}</div>
                <div className="contact-info">
                  <h3 className="contact-name">{contact.name}</h3>
                  <p className="contact-subtitle">{contact.subtitle}</p>
                  <p className="contact-phone">{contact.phone}</p>
                </div>
                <button
                  className="call-button"
                  onClick={() => handleCall(contact.phone)}
                >
                  Call
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Emergency
