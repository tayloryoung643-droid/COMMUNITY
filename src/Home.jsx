import './Home.css'

function Home({ buildingCode, onNavigate }) {
  // For now, we'll just use fake data
  // Later, we can look up the real building name and floor
  const buildingName = "The Paramount"
  const floor = "12"

  const features = [
    { icon: "📢", title: "Announcements", description: "Building updates & news" },
    { icon: "📦", title: "Packages", description: "Track your deliveries" },
    { icon: "📅", title: "Events", description: "Community gatherings" },
    { icon: "👋", title: "Neighbors", description: "Meet your community" }
  ]

  const handleFeatureClick = (featureTitle) => {
    if (onNavigate) {
      onNavigate(featureTitle)
    }
  }

  return (
    <div className="home-container">
      <header className="home-header">
        <h1 className="building-name">{buildingName}</h1>
        <p className="welcome-message">Welcome! You're on Floor {floor}</p>
      </header>

      <main className="features-grid">
        {features.map((feature, index) => (
          <button
            key={index}
            className="feature-card"
            onClick={() => handleFeatureClick(feature.title)}
          >
            <span className="feature-icon">{feature.icon}</span>
            <h2 className="feature-title">{feature.title}</h2>
            <p className="feature-description">{feature.description}</p>
          </button>
        ))}
      </main>
    </div>
  )
}

export default Home
