import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  Users,
  Copy,
  Check,
  Send,
  Mail,
  Hash,
  User,
  Loader2,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Moon
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getInvitesForBuilding, sendResidentInvite } from './services/residentInviteService'
import { supabase } from './lib/supabase'
import './InviteNeighbors.css'

function InviteNeighbors({ onBack }) {
  const { userProfile, isDemoMode, buildingBackgroundUrl } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [invites, setInvites] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendSuccess, setSendSuccess] = useState(false)
  const [residentCount, setResidentCount] = useState(0)

  const [form, setForm] = useState({
    name: '',
    unit: '',
    email: ''
  })

  // Weather and time
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

  const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  const formatDay = (date) => date.toLocaleDateString('en-US', { weekday: 'long' })
  const WeatherIcon = getWeatherIcon(weatherData.condition)

  const building = userProfile?.buildings
  const buildingId = userProfile?.building_id
  const totalUnits = building?.total_units
  const inviteUrl = buildingId ? `${window.location.origin}/join/${buildingId}` : null

  // Load invites + resident count
  useEffect(() => {
    const loadData = async () => {
      if (isInDemoMode) {
        setInvites([
          { id: '1', invitee_name: 'Margaret Chen', unit_number: '302', status: 'joined', created_at: new Date().toISOString() },
          { id: '2', invitee_name: 'Dave Wilson', unit_number: '415', status: 'pending', created_at: new Date().toISOString() },
          { id: '3', invitee_name: 'Unit 108', unit_number: '108', status: 'pending', created_at: new Date().toISOString() },
        ])
        setResidentCount(8)
        setLoading(false)
        return
      }

      const buildingId = userProfile?.building_id
      if (!buildingId) { setLoading(false); return }

      try {
        const [inviteData, countResult] = await Promise.all([
          getInvitesForBuilding(buildingId),
          supabase
            .from('users')
            .select('id', { count: 'exact', head: true })
            .eq('building_id', buildingId)
            .eq('role', 'resident')
        ])
        setInvites(inviteData)
        setResidentCount(countResult.count || 0)
      } catch (err) {
        console.error('[InviteNeighbors] Load error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [isInDemoMode, userProfile?.building_id])

  const handleCopyLink = async () => {
    if (!inviteUrl) return
    try {
      await navigator.clipboard.writeText(inviteUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Fallback
      const el = document.createElement('textarea')
      el.value = inviteUrl
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleSendInvite = async () => {
    if (!form.email.trim() || isInDemoMode) {
      if (isInDemoMode) {
        setSendSuccess(true)
        setTimeout(() => setSendSuccess(false), 2000)
      }
      return
    }

    setSending(true)
    try {
      await sendResidentInvite({
        buildingId: userProfile.building_id,
        invitedBy: userProfile.id,
        inviteeName: form.name || `Unit ${form.unit}`,
        inviteeEmail: form.email,
        unitNumber: form.unit,
        buildingName: building?.name || building?.address || 'your building',
      })
      // Refresh invites
      const updated = await getInvitesForBuilding(userProfile.building_id)
      setInvites(updated)
      setForm({ name: '', unit: '', email: '' })
      setSendSuccess(true)
      setTimeout(() => setSendSuccess(false), 2000)
    } catch (err) {
      console.error('[InviteNeighbors] Send error:', err)
    } finally {
      setSending(false)
    }
  }

  const bgStyle = buildingBackgroundUrl ? { '--building-bg-image': `url(${buildingBackgroundUrl})` } : {}

  return (
    <div className="invite-neighbors resident-inner-page" style={bgStyle}>
      {/* Hero */}
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
          <h1 className="inner-page-title">Invite Neighbors</h1>
        </div>
      </div>

      <main className="invite-content">
        {/* Building info banner */}
        <div className="invite-building-banner animate-in delay-1">
          <div className="invite-banner-icon">
            <Users size={20} />
          </div>
          <div className="invite-banner-info">
            <span className="invite-banner-name">{isInDemoMode ? 'The Paramount' : (building?.name || 'Your Building')}</span>
            <span className="invite-banner-stats">
              {isInDemoMode ? '456 Oak Street' : (building?.address || '')}
              {totalUnits ? ` · ${residentCount} of ${totalUnits} neighbors joined` : (residentCount > 0 ? ` · ${residentCount} neighbors` : '')}
            </span>
          </div>
        </div>

        {/* Share link section */}
        {inviteUrl && (
          <div className="invite-section animate-in delay-2">
            <h3 className="invite-section-title">Share invite link</h3>
            <div className="invite-link-row">
              <div className="invite-link-display">{inviteUrl}</div>
              <button className={`invite-copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopyLink}>
                {copied ? <><Check size={16} /> Copied</> : <><Copy size={16} /> Copy</>}
              </button>
            </div>
            <p className="invite-link-hint">Share via text, email, or your building's group chat</p>
          </div>
        )}

        <div className="invite-divider animate-in delay-3"><span>or</span></div>

        {/* Email invite form */}
        <div className="invite-section animate-in delay-3">
          <h3 className="invite-section-title">Send an email invite</h3>
          <div className="invite-form">
            <div className="invite-form-row">
              <div className="invite-input-wrapper">
                <User size={16} className="invite-input-icon" />
                <input
                  type="text"
                  placeholder="Neighbor's name"
                  value={form.name}
                  onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="invite-input-wrapper invite-input-unit">
                <Hash size={16} className="invite-input-icon" />
                <input
                  type="text"
                  placeholder="Unit #"
                  value={form.unit}
                  onChange={(e) => setForm(p => ({ ...p, unit: e.target.value }))}
                />
              </div>
            </div>
            <div className="invite-input-wrapper">
              <Mail size={16} className="invite-input-icon" />
              <input
                type="email"
                placeholder="Email address"
                value={form.email}
                onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              />
            </div>
            <button
              className="invite-send-btn"
              onClick={handleSendInvite}
              disabled={sending || (!form.email.trim() && !isInDemoMode)}
            >
              {sending ? (
                <><Loader2 size={16} className="spin" /> Sending...</>
              ) : sendSuccess ? (
                <><Check size={16} /> Invite Sent!</>
              ) : (
                <><Send size={16} /> Send Invite</>
              )}
            </button>
          </div>
        </div>

        {/* Sent invites list */}
        {invites.length > 0 && (
          <div className="invite-section animate-in delay-4">
            <h3 className="invite-section-title">Sent invites</h3>
            <div className="invite-list">
              {invites.map((invite) => (
                <div key={invite.id} className="invite-list-item">
                  <div className="invite-list-avatar">
                    {(invite.invitee_name || '?')[0].toUpperCase()}
                  </div>
                  <div className="invite-list-info">
                    <span className="invite-list-name">{invite.invitee_name || 'Invited'}</span>
                    {invite.unit_number && (
                      <span className="invite-list-unit">Unit {invite.unit_number}</span>
                    )}
                  </div>
                  <span className={`invite-list-status ${invite.status}`}>
                    {invite.status === 'joined' ? 'Joined' : 'Pending...'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default InviteNeighbors
