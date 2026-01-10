import { useState } from 'react'
import './App.css'

function App() {
  const [buildingCode, setBuildingCode] = useState('')

  const handleLogin = () => {
    if (buildingCode.trim()) {
      alert(`Welcome! You entered: ${buildingCode}`)
    } else {
      alert('Please enter a building code')
    }
  }

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
