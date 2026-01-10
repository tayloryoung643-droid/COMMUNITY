import { useState } from 'react'
import './App.css'
import Home from './Home'
import Announcements from './Announcements'
import Packages from './Packages'
import Events from './Events'

function App() {
  const [buildingCode, setBuildingCode] = useState('')
  const [currentScreen, setCurrentScreen] = useState('login')

  const handleLogin = () => {
    if (buildingCode.trim()) {
      setCurrentScreen('home')
    } else {
      alert('Please enter a building code')
    }
  }

  const handleNavigation = (featureTitle) => {
    // When someone clicks a feature card, navigate to that screen
    if (featureTitle === 'Announcements') {
      setCurrentScreen('announcements')
    } else if (featureTitle === 'Packages') {
      setCurrentScreen('packages')
    } else if (featureTitle === 'Events') {
      setCurrentScreen('events')
    }
    // We'll add more screens later for Neighbors
  }

  const handleBack = () => {
    // Go back to the Home screen
    setCurrentScreen('home')
  }

  // Show different screens based on currentScreen value
  if (currentScreen === 'announcements') {
    return <Announcements onBack={handleBack} />
  }

  if (currentScreen === 'packages') {
    return <Packages onBack={handleBack} />
  }

  if (currentScreen === 'events') {
    return <Events onBack={handleBack} />
  }

  if (currentScreen === 'home') {
    return <Home buildingCode={buildingCode} onNavigate={handleNavigation} />
  }

  // Otherwise, show the Login screen
  return (
    <div className="container">
      <div className="login-card">
        <h1 className="app-title">Community</h1>
        <p className="tagline">Know your neighbors, finally.</p>

        <div className="form-group">
          <label htmlFor="building-code">Building Code</label>
          <input
            id="building-code"
            type="text"
            placeholder="e.g., PARAMOUNT-2024"
            value={buildingCode}
            onChange={(e) => setBuildingCode(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
          />
        </div>

        <button className="login-button" onClick={handleLogin}>
          Enter
        </button>
      </div>
    </div>
  )
}

export default App
