import { useState, useEffect } from 'react'
import { ArrowLeft, Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import GuidelinesContent from './components/GuidelinesContent'
import './CommunityGuidelines.css'

function CommunityGuidelines({ onBack }) {
  const { buildingBackgroundUrl } = useAuth()

  // Weather and time state
  const [currentTime, setCurrentTime] = useState(new Date())
  const weatherData = { temp: 58, condition: 'clear', conditionText: 'Mostly Clear' }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getWeatherIcon = (condition) => {
    const hour = currentTime.getHours()
    const isNight = hour >= 18 || hour < 6
    if (isNight) return Moon
    switch (condition) {
      case 'clear': case 'sunny': return Sun
      case 'cloudy': return Cloud
      case 'rainy': return CloudRain
      case 'snowy': return Snowflake
      default: return Sun
    }
  }

  const formatTimeWeather = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const formatDayWeather = (date) => date.toLocaleDateString('en-US', { weekday: 'long' })
  const WeatherIcon = getWeatherIcon(weatherData.condition)

  const bgStyle = buildingBackgroundUrl ? { '--building-bg-image': `url(${buildingBackgroundUrl})` } : {}

  return (
    <div className="community-guidelines-container resident-inner-page" style={bgStyle}>
      <div className="inner-page-hero">
        <button className="inner-page-back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="inner-page-weather">
          <div className="weather-datetime">{formatDayWeather(currentTime)} | {formatTimeWeather(currentTime)}</div>
          <div className="weather-temp-row">
            <WeatherIcon size={20} className="weather-icon" />
            <span className="weather-temp">{weatherData.temp}°</span>
          </div>
          <div className="weather-condition">{weatherData.conditionText}</div>
        </div>
        <div className="inner-page-title-container">
          <h1 className="inner-page-title">Guidelines</h1>
        </div>
      </div>

      <main className="community-guidelines-content">
        <div className="community-guidelines-intro">
          <h2>Community Guidelines</h2>
          <p>How we keep this community great</p>
        </div>
        <GuidelinesContent />
      </main>
    </div>
  )
}

export default CommunityGuidelines
