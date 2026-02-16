import { useState, useEffect } from 'react'
import { ArrowLeft, Plus, X, Wrench, Clock, CheckCircle, AlertTriangle, Camera, Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { createRequest, getMyRequests, uploadMaintenancePhoto } from './services/maintenanceService'
import EmptyState from './components/EmptyState'
import './MaintenanceRequest.css'

const DEMO_REQUESTS = [
  {
    id: 1,
    title: 'Leaking kitchen faucet',
    description: 'The kitchen faucet has been dripping constantly for a few days now. Getting worse.',
    urgency: 'medium',
    status: 'in_progress',
    unit_number: '1201',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 2,
    title: 'Broken hallway light',
    description: 'The light outside unit 1201 in the hallway has been flickering and is now out.',
    urgency: 'low',
    status: 'resolved',
    unit_number: '1201',
    created_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 3,
    title: 'AC not cooling',
    description: 'Air conditioning unit is running but not producing cold air. Temperature inside is 82°F.',
    urgency: 'high',
    status: 'pending',
    unit_number: '1201',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString()
  }
]

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bg: '#fef3c7' },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: '#dbeafe' },
  resolved: { label: 'Resolved', color: '#10b981', bg: '#d1fae5' },
  closed: { label: 'Closed', color: '#6b7280', bg: '#f3f4f6' }
}

const URGENCY_CONFIG = {
  low: { label: 'Low', color: '#6b7280' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' },
  emergency: { label: 'Emergency', color: '#dc2626' }
}

function MaintenanceRequest({ onBack }) {
  const { user, userProfile, isDemoMode, buildingBackgroundUrl } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [photoFile, setPhotoFile] = useState(null)
  const [photoPreview, setPhotoPreview] = useState(null)
  const [form, setForm] = useState({
    title: '',
    description: '',
    urgency: 'medium'
  })

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

  useEffect(() => {
    async function loadRequests() {
      if (isInDemoMode) {
        setRequests(DEMO_REQUESTS)
        setLoading(false)
        return
      }

      const userId = user?.id || userProfile?.id
      if (!userId) {
        setRequests([])
        setLoading(false)
        return
      }

      try {
        const data = await getMyRequests(userId)
        setRequests(data)
      } catch (err) {
        console.error('[MaintenanceRequest] Error loading requests:', err)
      } finally {
        setLoading(false)
      }
    }
    loadRequests()
  }, [isInDemoMode, user, userProfile])

  const showToastMsg = (msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    const reader = new FileReader()
    reader.onloadend = () => setPhotoPreview(reader.result)
    reader.readAsDataURL(file)
  }

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.description.trim()) return
    setSubmitting(true)

    const unitNumber = userProfile?.unit_number || ''

    if (isInDemoMode) {
      const newReq = {
        id: Date.now(),
        title: form.title,
        description: form.description,
        urgency: form.urgency,
        status: 'pending',
        unit_number: unitNumber || '1201',
        created_at: new Date().toISOString()
      }
      setRequests(prev => [newReq, ...prev])
      setShowModal(false)
      resetForm()
      setSubmitting(false)
      showToastMsg('Demo mode — request added locally')
      return
    }

    try {
      const userId = user?.id || userProfile?.id
      const result = await createRequest({
        building_id: userProfile.building_id,
        user_id: userId,
        unit_number: unitNumber,
        title: form.title,
        description: form.description,
        urgency: form.urgency
      })

      if (photoFile && result?.id) {
        try {
          await uploadMaintenancePhoto(photoFile, result.id)
        } catch (photoErr) {
          console.error('[MaintenanceRequest] Photo upload failed:', photoErr)
        }
      }

      setRequests(prev => [result, ...prev])
      setShowModal(false)
      resetForm()
      showToastMsg('Request submitted successfully!')
    } catch (err) {
      console.error('[MaintenanceRequest] Submit error:', err)
      showToastMsg('Failed to submit request. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setForm({ title: '', description: '', urgency: 'medium' })
    setPhotoFile(null)
    setPhotoPreview(null)
  }

  const bgStyle = buildingBackgroundUrl ? { '--building-bg-image': `url(${buildingBackgroundUrl})` } : {}

  const heroSection = (
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
        <h1 className="inner-page-title">Maintenance</h1>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="maintenance-container resident-inner-page" style={bgStyle}>
        {heroSection}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh', color: '#9CA3AF' }}>
          Loading requests...
        </div>
      </div>
    )
  }

  return (
    <div className="maintenance-container resident-inner-page" style={bgStyle}>
      {heroSection}

      <main className="maintenance-content">
        <button className="new-request-button" onClick={() => setShowModal(true)}>
          <Plus size={20} />
          <span>New Request</span>
        </button>

        {requests.length === 0 ? (
          <EmptyState
            icon="package"
            title="No maintenance requests"
            subtitle="Submit a request when something needs fixing"
          />
        ) : (
          <div className="maintenance-list">
            {requests.map(req => {
              const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
              const urgency = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.low
              return (
                <div key={req.id} className="maintenance-card">
                  <div className="maintenance-card-header">
                    <span className="maintenance-status-badge" style={{ background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                    <span className="maintenance-time">{formatTimeAgo(req.created_at)}</span>
                  </div>
                  <h3 className="maintenance-card-title">{req.title}</h3>
                  <p className="maintenance-card-desc">{req.description}</p>
                  <div className="maintenance-card-footer">
                    <span className="maintenance-urgency" style={{ color: urgency.color }}>
                      <AlertTriangle size={14} />
                      {urgency.label}
                    </span>
                    {req.unit_number && (
                      <span className="maintenance-unit">Unit {req.unit_number}</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {/* New Request Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="maintenance-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">New Maintenance Request</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="Brief summary of the issue"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Description *</label>
                <textarea
                  placeholder="Describe the issue in detail..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Unit Number</label>
                <input
                  type="text"
                  value={userProfile?.unit_number || ''}
                  readOnly
                  className="readonly-input"
                />
              </div>

              <div className="form-group">
                <label>Urgency</label>
                <div className="urgency-options">
                  {Object.entries(URGENCY_CONFIG).map(([key, cfg]) => (
                    <button
                      key={key}
                      className={`urgency-btn ${form.urgency === key ? 'active' : ''}`}
                      onClick={() => setForm({ ...form, urgency: key })}
                      style={form.urgency === key ? { background: cfg.color, color: 'white' } : {}}
                    >
                      {cfg.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-group">
                <label>Photo (optional)</label>
                <div className="photo-upload-area">
                  {photoPreview ? (
                    <div className="photo-preview">
                      <img src={photoPreview} alt="Preview" />
                      <button className="remove-photo" onClick={() => { setPhotoFile(null); setPhotoPreview(null) }}>
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <label className="photo-upload-label">
                      <Camera size={24} />
                      <span>Tap to add photo</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={handlePhotoChange}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => { setShowModal(false); resetForm() }}>
                Cancel
              </button>
              <button
                className="modal-submit"
                onClick={handleSubmit}
                disabled={!form.title.trim() || !form.description.trim() || submitting}
              >
                <Wrench size={18} />
                {submitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div className="maintenance-toast">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export default MaintenanceRequest
