import { ArrowLeft, Building2, Wrench, Phone, Briefcase, Siren, Skull, Shield } from 'lucide-react'
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
        icon: Building2,
        gradient: "linear-gradient(135deg, #ef4444, #f59e0b)"
      },
      {
        id: 2,
        name: "After-Hours Maintenance",
        subtitle: "Urgent repairs only",
        phone: "604-555-1235",
        icon: Wrench,
        gradient: "linear-gradient(135deg, #f59e0b, #ef4444)"
      },
      {
        id: 3,
        name: "Front Desk / Concierge",
        subtitle: "Daily 8 AM - 8 PM",
        phone: "604-555-1236",
        icon: Phone,
        gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)"
      },
      {
        id: 4,
        name: "Building Manager",
        subtitle: "Office hours",
        phone: "604-555-1237",
        icon: Briefcase,
        gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)"
      }
    ],
    general: [
      {
        id: 5,
        name: "911",
        subtitle: "Police, Fire, Medical",
        phone: "911",
        icon: Siren,
        gradient: "linear-gradient(135deg, #ef4444, #dc2626)"
      },
      {
        id: 6,
        name: "Poison Control",
        subtitle: "24/7 hotline",
        phone: "1-800-222-1222",
        icon: Skull,
        gradient: "linear-gradient(135deg, #8b5cf6, #6366f1)"
      },
      {
        id: 7,
        name: "Non-Emergency Police",
        subtitle: "For non-urgent matters",
        phone: "604-555-9999",
        icon: Shield,
        gradient: "linear-gradient(135deg, #3b82f6, #1d4ed8)"
      }
    ]
  }

  const handleCall = (phone) => {
    // On mobile devices, this will open the phone dialer
    window.location.href = `tel:${phone}`
  }

  return (
    <div className="emergency-container resident-inner-page">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <header className="emergency-header">
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="page-title-light">Emergency Contacts</h1>
      </header>

      <main className="emergency-content">
        {/* Building Emergencies Section */}
        <section className="emergency-section animate-in delay-1">
          <h2 className="section-title">Building Emergencies</h2>
          <div className="contacts-list">
            {emergencyContacts.building.map((contact, index) => {
              const IconComponent = contact.icon
              return (
                <article key={contact.id} className={`contact-card animate-in delay-${(index % 4) + 2}`}>
                  <div className="card-accent"></div>
                  <div className="contact-icon" style={{ background: contact.gradient }}>
                    <IconComponent size={24} strokeWidth={2} />
                  </div>
                  <div className="contact-info">
                    <h3 className="contact-name">{contact.name}</h3>
                    <p className="contact-subtitle">{contact.subtitle}</p>
                    <p className="contact-phone">{contact.phone}</p>
                  </div>
                  <button
                    className="call-button"
                    onClick={() => handleCall(contact.phone)}
                  >
                    <Phone size={18} />
                    <span>Call</span>
                  </button>
                </article>
              )
            })}
          </div>
        </section>

        {/* General Emergencies Section */}
        <section className="emergency-section animate-in delay-3">
          <h2 className="section-title">General Emergencies</h2>
          <div className="contacts-list">
            {emergencyContacts.general.map((contact, index) => {
              const IconComponent = contact.icon
              return (
                <article key={contact.id} className={`contact-card animate-in delay-${(index % 4) + 4}`}>
                  <div className="card-accent"></div>
                  <div className="contact-icon" style={{ background: contact.gradient }}>
                    <IconComponent size={24} strokeWidth={2} />
                  </div>
                  <div className="contact-info">
                    <h3 className="contact-name">{contact.name}</h3>
                    <p className="contact-subtitle">{contact.subtitle}</p>
                    <p className="contact-phone">{contact.phone}</p>
                  </div>
                  <button
                    className="call-button"
                    onClick={() => handleCall(contact.phone)}
                  >
                    <Phone size={18} />
                    <span>Call</span>
                  </button>
                </article>
              )
            })}
          </div>
        </section>
      </main>
    </div>
  )
}

export default Emergency
