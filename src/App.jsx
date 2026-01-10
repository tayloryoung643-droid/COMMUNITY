import { useState } from 'react'
import './App.css'
import Home from './Home'

function App() {
  const [buildingCode, setBuildingCode] = useState('')
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  const handleLogin = () => {
    if (buildingCode.trim()) {
      setIsLoggedIn(true)
    } else {
      alert('Please enter a building code')
    }
  }

  // If logged in, show the Home screen
  if (isLoggedIn) {
    return <Home buildingCode={buildingCode} />
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
