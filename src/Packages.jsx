import { useState, useEffect } from 'react'
import { ArrowLeft, Package, Truck, Mail, CheckCircle, Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getPackages } from './services/packageService'
import './Packages.css'

// Demo package data - used when in demo mode
const DEMO_PACKAGES = [
  {
    id: 1,
    carrier: "Amazon",
    icon: "Package",
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    dateArrived: "2026-01-10",
    status: "Ready for Pickup",
    location: "Mailroom"
  },
  {
    id: 2,
    carrier: "FedEx",
    icon: "Truck",
    gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    dateArrived: "2026-01-09",
    status: "Ready for Pickup",
    location: "Front Desk"
  },
  {
    id: 3,
    carrier: "UPS",
    icon: "Truck",
    gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
    dateArrived: "2026-01-08",
    status: "Ready for Pickup",
    location: "Locker 5"
  },
  {
    id: 4,
    carrier: "USPS",
    icon: "Mail",
    gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    dateArrived: "2026-01-06",
    status: "Picked Up",
    location: "Mailroom"
  },
  {
    id: 5,
    carrier: "Amazon",
    icon: "Package",
    gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
    dateArrived: "2026-01-05",
    status: "Picked Up",
    location: "Locker 3"
  }
]

// Map icon names to components
const iconMap = {
  Package: Package,
  Truck: Truck,
  Mail: Mail
}

// Helper to get gradient based on carrier
const getCarrierGradient = (carrier) => {
  const gradients = {
    Amazon: "linear-gradient(135deg, #f59e0b, #ef4444)",
    FedEx: "linear-gradient(135deg, #8b5cf6, #ec4899)",
    UPS: "linear-gradient(135deg, #10b981, #06b6d4)",
    USPS: "linear-gradient(135deg, #3b82f6, #06b6d4)",
    DHL: "linear-gradient(135deg, #fbbf24, #f59e0b)",
    default: "linear-gradient(135deg, #6b7280, #374151)"
  }
  return gradients[carrier] || gradients.default
}

// Helper to get icon based on carrier
const getCarrierIcon = (carrier) => {
  if (carrier === "USPS") return Mail
  if (carrier === "Amazon") return Package
  return Truck
}

function Packages({ onBack }) {
  const { userProfile, isDemoMode } = useAuth()
  const [packages, setPackages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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

  // Check for demo mode using both isDemoMode flag and userProfile.is_demo
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  useEffect(() => {
    console.log('Auth state:', { isDemoMode, userProfile, isInDemoMode })

    async function loadPackages() {
      if (isInDemoMode) {
        console.log('Demo mode: using fake packages')
        setPackages(DEMO_PACKAGES)
        setLoading(false)
      } else {
        console.log('Real mode: fetching packages from Supabase')
        try {
          const data = await getPackages(userProfile?.building_id)
          // Transform Supabase data to match our format
          const transformedData = data.map(pkg => ({
            id: pkg.id,
            carrier: pkg.carrier,
            icon: pkg.carrier, // Will be mapped by getCarrierIcon
            gradient: getCarrierGradient(pkg.carrier),
            dateArrived: pkg.arrival_date,
            status: pkg.status === 'picked_up' ? 'Picked Up' : 'Ready for Pickup',
            location: pkg.location || 'Mailroom'
          }))
          setPackages(transformedData)
        } catch (err) {
          console.error('Error loading packages:', err)
          setError('Failed to load packages. Please try again.')
        } finally {
          setLoading(false)
        }
      }
    }
    loadPackages()
  }, [isInDemoMode, userProfile])

  // Count packages waiting for pickup
  const waitingPackages = packages.filter(pkg => pkg.status === "Ready for Pickup")
  const waitingCount = waitingPackages.length

  // Helper function to format dates nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { month: 'short', day: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  // Helper function to get days since arrival
  const getDaysAgo = (dateString) => {
    const today = new Date()
    const arrivedDate = new Date(dateString)
    const diffTime = today - arrivedDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    if (diffDays < 0) return "Upcoming"
    return `${diffDays} days ago`
  }

  // Loading state
  if (loading) {
    return (
      <div className="packages-container resident-inner-page">
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
            <h1 className="inner-page-title">Packages</h1>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh', color: '#9CA3AF' }}>
          Loading packages...
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="packages-container resident-inner-page">
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
            <h1 className="inner-page-title">Packages</h1>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh', color: '#ef4444' }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="packages-container resident-inner-page">
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
          <h1 className="inner-page-title">Packages</h1>
        </div>
      </div>

      <div className="packages-summary">
        <div className="summary-card">
          <Package size={24} />
          <p className="packages-count">
            {waitingCount === 0
              ? "No packages waiting"
              : `${waitingCount} package${waitingCount === 1 ? '' : 's'} waiting for pickup`}
          </p>
        </div>
      </div>

      <main className="packages-list">
        {packages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'rgba(255,255,255,0.6)'
          }}>
            No packages found
          </div>
        ) : (
          packages.map((pkg, index) => {
            // Get the icon component - handle both demo and real data
            const IconComponent = isInDemoMode
              ? (iconMap[pkg.icon] || Package)
              : getCarrierIcon(pkg.carrier)

            return (
              <article
                key={pkg.id}
                className={`package-card ${pkg.status === "Picked Up" ? "picked-up" : ""} animate-in delay-${(index % 6) + 1}`}
              >
                <div className="card-accent"></div>
                <div className="package-header">
                  <div className="package-carrier">
                    <div className="carrier-icon-wrapper" style={{ background: pkg.gradient }}>
                      <IconComponent size={22} strokeWidth={2} />
                    </div>
                    <span className="carrier-name">{pkg.carrier}</span>
                  </div>
                  <span
                    className={`package-status ${pkg.status === "Ready for Pickup" ? "ready" : "completed"}`}
                  >
                    {pkg.status === "Picked Up" && <CheckCircle size={14} />}
                    {pkg.status}
                  </span>
                </div>

                <div className="package-details">
                  <div className="package-detail-item">
                    <span className="detail-label">Arrived</span>
                    <span className="detail-value">
                      {formatDate(pkg.dateArrived)}
                      <span className="detail-secondary">{getDaysAgo(pkg.dateArrived)}</span>
                    </span>
                  </div>
                  <div className="package-detail-item">
                    <span className="detail-label">Location</span>
                    <span className="detail-value">{pkg.location}</span>
                  </div>
                </div>
              </article>
            )
          })
        )}
      </main>
    </div>
  )
}

export default Packages
