import { useState, useEffect } from 'react'
import { ArrowLeft, Hand, Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import './Neighbors.css'

function Neighbors({ onBack }) {
  // Weather and time state - matches Home exactly
  const [currentTime, setCurrentTime] = useState(new Date())
  const weatherData = {
    temp: 58,
    condition: 'clear',
    conditionText: 'Mostly Clear'
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getWeatherIcon = (condition) => {
    const hour = currentTime.getHours()
    const isNight = hour >= 18 || hour < 6
    if (isNight) return Moon
    switch (condition) {
      case 'clear':
      case 'sunny': return Sun
      case 'cloudy': return Cloud
      case 'rainy': return CloudRain
      case 'snowy': return Snowflake
      default: return Sun
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const WeatherIcon = getWeatherIcon(weatherData.condition)
  // Fake neighbor data - later this will come from a real database
  const [neighbors, setNeighbors] = useState([
    // Floor 12 (Current user's floor - shown first)
    { id: 1, name: "Sarah Chen", unit: "1201", floor: 12, color: "blue", waved: false },
    { id: 2, name: "Michael Torres", unit: "1203", floor: 12, color: "purple", waved: false },
    { id: 3, name: "Emily Rodriguez", unit: "1205", floor: 12, color: "cyan", waved: false },
    { id: 4, name: "David Kim", unit: "1207", floor: 12, color: "green", waved: false },

    // Floor 11
    { id: 5, name: "Jessica Patel", unit: "1102", floor: 11, color: "pink", waved: false },
    { id: 6, name: "James Wilson", unit: "1104", floor: 11, color: "orange", waved: false },
    { id: 7, name: "Maria Garcia", unit: "1106", floor: 11, color: "blue", waved: false },

    // Floor 13
    { id: 8, name: "Robert Lee", unit: "1301", floor: 13, color: "purple", waved: false },
    { id: 9, name: "Amanda Brown", unit: "1303", floor: 13, color: "cyan", waved: false },
    { id: 10, name: "Chris Johnson", unit: "1305", floor: 13, color: "green", waved: false },
    { id: 11, name: "Lisa Anderson", unit: "1307", floor: 13, color: "pink", waved: false },

    // Floor 10
    { id: 12, name: "Daniel Martinez", unit: "1002", floor: 10, color: "orange", waved: false },
    { id: 13, name: "Sophie Taylor", unit: "1004", floor: 10, color: "blue", waved: false }
  ])

  const currentUserFloor = 12

  // Get initials from name
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('')
  }

  // Handle Wave toggle
  const handleWave = (neighborId) => {
    setNeighbors(neighbors.map(neighbor => {
      if (neighbor.id === neighborId) {
        return {
          ...neighbor,
          waved: !neighbor.waved
        }
      }
      return neighbor
    }))
  }

  // Group neighbors by floor
  const neighborsByFloor = neighbors.reduce((acc, neighbor) => {
    if (!acc[neighbor.floor]) {
      acc[neighbor.floor] = []
    }
    acc[neighbor.floor].push(neighbor)
    return acc
  }, {})

  // Sort floors with current floor first, then descending order
  const sortedFloors = Object.keys(neighborsByFloor)
    .map(Number)
    .sort((a, b) => {
      if (a === currentUserFloor) return -1
      if (b === currentUserFloor) return 1
      return b - a
    })

  return (
    <div className="neighbors-container resident-inner-page">
      {/* Hero Section with Weather and Title */}
      <div className="inner-page-hero">
        <button className="inner-page-back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="inner-page-weather">
          <div className="weather-datetime">{formatDay(currentTime)} | {formatTime(currentTime)}</div>
          <div className="weather-temp-row">
            <WeatherIcon size={20} className="weather-icon" />
            <span className="weather-temp">{weatherData.temp}°</span>
          </div>
          <div className="weather-condition">{weatherData.conditionText}</div>
        </div>
        <div className="inner-page-title-container">
          <h1 className="inner-page-title">Neighbors</h1>
        </div>
      </div>

      <main className="neighbors-content">
        {sortedFloors.map((floor, floorIndex) => (
          <section key={floor} className={`floor-section animate-in delay-${floorIndex + 1}`}>
            <h2 className="floor-title">
              Floor {floor}
              {floor === currentUserFloor && <span className="your-floor-badge">Your Floor</span>}
            </h2>

            <div className="neighbors-grid">
              {neighborsByFloor[floor].map((neighbor, index) => (
                <article
                  key={neighbor.id}
                  className={`neighbor-card animate-in delay-${(index % 4) + 1}`}
                >
                  <div className={`avatar-ring avatar-ring-${neighbor.color}`}>
                    <div className="neighbor-avatar">
                      {getInitials(neighbor.name)}
                    </div>
                  </div>
                  <div className="neighbor-info">
                    <h3 className="neighbor-name">{neighbor.name}</h3>
                    <p className="neighbor-unit">Unit {neighbor.unit}</p>
                  </div>
                  <button
                    className={`wave-button ${neighbor.waved ? 'waved' : ''}`}
                    onClick={() => handleWave(neighbor.id)}
                  >
                    <Hand size={18} />
                    <span>{neighbor.waved ? 'Waved!' : 'Wave'}</span>
                  </button>
                </article>
              ))}
            </div>
          </section>
        ))}
      </main>
    </div>
  )
}

export default Neighbors
