import { useState } from 'react'
import { ArrowLeft, Clock, FileText, Truck, Recycle, CalendarCheck, ChevronDown, ChevronUp } from 'lucide-react'
import './BuildingInfo.css'

function BuildingInfo({ onBack }) {
  const [expandedSections, setExpandedSections] = useState(['hours'])

  const toggleSection = (sectionId) => {
    setExpandedSections(prev =>
      prev.includes(sectionId)
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    )
  }

  const sections = [
    {
      id: 'hours',
      icon: Clock,
      title: 'Building Hours',
      content: [
        { label: 'Gym', value: '5:00 AM - 11:00 PM daily' },
        { label: 'Pool', value: '6:00 AM - 10:00 PM daily' },
        { label: 'Party Room', value: 'By reservation only' },
        { label: 'Rooftop Terrace', value: '8:00 AM - 10:00 PM (May - Oct)' },
        { label: 'Management Office', value: 'Mon - Fri: 9:00 AM - 5:00 PM' },
        { label: 'Concierge', value: '24/7' }
      ]
    },
    {
      id: 'policies',
      icon: FileText,
      title: 'Policies',
      content: [
        {
          label: 'Guest Parking',
          value: 'Visitor spots in P1 only. Max 4 hours. Register at concierge.'
        },
        {
          label: 'Pet Policy',
          value: 'Pets allowed. Max 2 per unit. Dogs must be leashed in common areas. Clean up after your pet.'
        },
        {
          label: 'Noise Hours',
          value: 'Quiet hours: 10:00 PM - 8:00 AM weekdays, 11:00 PM - 9:00 AM weekends.'
        },
        {
          label: 'Smoking Policy',
          value: 'No smoking in any indoor common areas. Designated smoking area on P2 rooftop.'
        },
        {
          label: 'BBQ Usage',
          value: 'Rooftop BBQs available first-come, first-served. Clean after use.'
        }
      ]
    },
    {
      id: 'moving',
      icon: Truck,
      title: 'Move-in / Move-out',
      content: [
        {
          label: 'Elevator Booking',
          value: 'Required for all moves. Book through the app at least 48 hours in advance.'
        },
        {
          label: 'Moving Hours',
          value: 'Mon - Sat: 9:00 AM - 5:00 PM. No Sunday moves.'
        },
        {
          label: 'Deposit',
          value: '$500 refundable deposit required. Picked up at management office.'
        },
        {
          label: 'Loading Dock',
          value: 'Access from rear entrance. Maximum 4-hour booking.'
        },
        {
          label: 'Hallway Protection',
          value: 'Movers must use floor and wall protection. Available at concierge.'
        }
      ]
    },
    {
      id: 'recycling',
      icon: Recycle,
      title: 'Recycling & Garbage',
      content: [
        {
          label: 'Garbage Chute',
          value: 'Located on each floor. Household waste only. No cardboard.'
        },
        {
          label: 'Recycling Room',
          value: 'P1 level. Blue bins for paper/plastic, green for glass.'
        },
        {
          label: 'Large Items',
          value: 'Contact concierge for bulk pickup. $25 fee applies.'
        },
        {
          label: 'Organics',
          value: 'Green bin in P1 recycling room. Biodegradable bags required.'
        },
        {
          label: 'E-Waste',
          value: 'Drop-off bin in P1. Electronics, batteries, light bulbs.'
        }
      ]
    },
    {
      id: 'amenities',
      icon: CalendarCheck,
      title: 'Amenity Booking',
      content: [
        {
          label: 'Party Room',
          value: 'Book up to 30 days in advance. $150/4 hours. $300 deposit.'
        },
        {
          label: 'Guest Suite',
          value: '$75/night. Max 3 consecutive nights. Book through management.'
        },
        {
          label: 'Theater Room',
          value: 'Free for residents. 2-hour slots. Book through app.'
        },
        {
          label: 'Tennis Court',
          value: 'Free. 1-hour slots. Book through app, max 2 bookings per week.'
        },
        {
          label: 'Rooftop BBQ Area',
          value: 'First-come, first-served. No reservations needed.'
        }
      ]
    }
  ]

  return (
    <div className="building-info-container">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <header className="building-info-header">
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="page-title-light">Building Info & FAQ</h1>
      </header>

      <main className="building-info-content">
        <div className="accordion-list">
          {sections.map(section => {
            const IconComponent = section.icon
            const isExpanded = expandedSections.includes(section.id)

            return (
              <div key={section.id} className={`accordion-item ${isExpanded ? 'expanded' : ''}`}>
                <button
                  className="accordion-header"
                  onClick={() => toggleSection(section.id)}
                >
                  <div className="accordion-header-left">
                    <div className="accordion-icon">
                      <IconComponent size={20} />
                    </div>
                    <span className="accordion-title">{section.title}</span>
                  </div>
                  <div className="accordion-chevron">
                    {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                  </div>
                </button>

                {isExpanded && (
                  <div className="accordion-content">
                    {section.content.map((item, index) => (
                      <div key={index} className="info-row">
                        <span className="info-label">{item.label}</span>
                        <span className="info-value">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default BuildingInfo
