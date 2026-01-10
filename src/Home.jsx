import { Megaphone, Package, Calendar, Users, AlertTriangle, ArrowUpDown, LogOut } from 'lucide-react'
import './Home.css'

function Home({ buildingCode, onNavigate, onLogout }) {
  const buildingName = "The Paramount"
  const floor = "12"

  const features = [
    {
      icon: Megaphone,
      title: "Announcements",
      description: "Building updates & news",
      gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)"
    },
    {
      icon: Package,
      title: "Packages",
      description: "Track your deliveries",
      gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)"
    },
    {
      icon: Calendar,
      title: "Events",
      description: "Community gatherings",
      gradient: "linear-gradient(135deg, #10b981, #06b6d4)"
    },
    {
      icon: Users,
      title: "Neighbors",
      description: "Meet your community",
      gradient: "linear-gradient(135deg, #f59e0b, #ef4444)"
    },
    {
      icon: AlertTriangle,
      title: "Emergency",
      description: "Important contacts",
      gradient: "linear-gradient(135deg, #ef4444, #f59e0b)"
    },
    {
      icon: ArrowUpDown,
      title: "Elevator Booking",
      description: "Reserve for moving",
      gradient: "linear-gradient(135deg, #06b6d4, #3b82f6)"
    }
  ]

  const handleFeatureClick = (featureTitle) => {
    if (onNavigate) {
      onNavigate(featureTitle)
    }
  }

  return (
    <div className="home-container">
      {/* Background gradient orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>
      <div className="bg-orb bg-orb-3"></div>

      <header className="home-header">
        <div className="header-content">
          <div className="header-text">
            <p className="welcome-label">Welcome back</p>
            <h1 className="building-name">{buildingName}</h1>
            <p className="floor-info">Floor {floor} Resident</p>
          </div>
          <button className="logout-button" onClick={onLogout}>
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="features-section">
        <div className="features-grid">
          {features.map((feature, index) => {
            const IconComponent = feature.icon
            return (
              <button
                key={index}
                className={`feature-card animate-in delay-${index + 1}`}
                onClick={() => handleFeatureClick(feature.title)}
              >
                <div className="card-accent"></div>
                <div className="icon-wrapper" style={{ background: feature.gradient }}>
                  <IconComponent size={28} strokeWidth={2} />
                </div>
                <div className="card-content">
                  <h2 className="feature-title">{feature.title}</h2>
                  <p className="feature-description">{feature.description}</p>
                </div>
                <div className="card-arrow">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </div>
              </button>
            )
          })}
        </div>
      </main>
    </div>
  )
}

export default Home
