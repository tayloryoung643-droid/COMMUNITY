import { useState } from 'react'
import './App.css'
import Home from './Home'
import Announcements from './Announcements'
import Packages from './Packages'
import Events from './Events'
import Neighbors from './Neighbors'
import Emergency from './Emergency'
import ElevatorBooking from './ElevatorBooking'

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
    } else if (featureTitle === 'Neighbors') {
      setCurrentScreen('neighbors')
    } else if (featureTitle === 'Emergency') {
      setCurrentScreen('emergency')
    } else if (featureTitle === 'Elevator Booking') {
      setCurrentScreen('elevator-booking')
    }
  }

  const handleBack = () => {
    // Go back to the Home screen
    setCurrentScreen('home')
  }

  const handleLogout = () => {
    // Reset to login screen and clear building code
    setBuildingCode('')
    setCurrentScreen('login')
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

  if (currentScreen === 'neighbors') {
    return <Neighbors onBack={handleBack} />
  }

  if (currentScreen === 'emergency') {
    return <Emergency onBack={handleBack} />
  }

  if (currentScreen === 'elevator-booking') {
    return <ElevatorBooking onBack={handleBack} />
  }

  if (currentScreen === 'home') {
    return <Home buildingCode={buildingCode} onNavigate={handleNavigation} onLogout={handleLogout} />
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
