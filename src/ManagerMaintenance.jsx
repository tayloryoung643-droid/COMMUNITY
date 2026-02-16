import { useState, useEffect } from 'react'
import {
  Wrench,
  Clock,
  CheckCircle,
  AlertTriangle,
  User,
  Search,
  ChevronDown
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getBuildingRequests, updateRequestStatus } from './services/maintenanceService'
import './ManagerMaintenance.css'

const DEMO_REQUESTS = [
  {
    id: 1,
    title: 'Leaking kitchen faucet',
    description: 'The kitchen faucet has been dripping constantly for a few days now. Getting worse.',
    urgency: 'medium',
    status: 'pending',
    unit_number: '1201',
    user: { full_name: 'Sarah Mitchell', unit_number: '1201' },
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 86400000).toISOString()
  },
  {
    id: 2,
    title: 'Broken hallway light',
    description: 'The light outside unit 805 in the hallway has been flickering and is now out.',
    urgency: 'low',
    status: 'in_progress',
    unit_number: '805',
    user: { full_name: 'Mike Thompson', unit_number: '805' },
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 86400000).toISOString()
  },
  {
    id: 3,
    title: 'AC not cooling',
    description: 'Air conditioning unit is running but not producing cold air. Temperature inside is 82°F.',
    urgency: 'high',
    status: 'pending',
    unit_number: '402',
    user: { full_name: 'Jessica Kim', unit_number: '402' },
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 4,
    title: 'Clogged bathroom drain',
    description: 'Bathroom sink is draining very slowly. Tried plunging but no improvement.',
    urgency: 'medium',
    status: 'resolved',
    unit_number: '1104',
    user: { full_name: 'Alex Rivera', unit_number: '1104' },
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 86400000).toISOString()
  },
  {
    id: 5,
    title: 'Elevator noise on floor 12',
    description: 'Loud grinding noise when elevator passes floor 12. Happening for a week now.',
    urgency: 'high',
    status: 'in_progress',
    unit_number: '1201',
    user: { full_name: 'Sarah Mitchell', unit_number: '1201' },
    created_at: new Date(Date.now() - 3 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 1 * 86400000).toISOString()
  },
  {
    id: 6,
    title: 'Window seal broken',
    description: 'The seal on the bedroom window is cracked and cold air is coming through.',
    urgency: 'low',
    status: 'closed',
    unit_number: '309',
    user: { full_name: 'Chris Walker', unit_number: '309' },
    created_at: new Date(Date.now() - 14 * 86400000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 86400000).toISOString()
  }
]

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
  in_progress: { label: 'In Progress', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
  resolved: { label: 'Resolved', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
  closed: { label: 'Closed', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.12)' }
}

const URGENCY_CONFIG = {
  low: { label: 'Low', color: '#6b7280' },
  medium: { label: 'Medium', color: '#f59e0b' },
  high: { label: 'High', color: '#ef4444' },
  emergency: { label: 'Emergency', color: '#dc2626' }
}

function ManagerMaintenance() {
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [requests, setRequests] = useState(isInDemoMode ? DEMO_REQUESTS : [])
  const [loading, setLoading] = useState(!isInDemoMode)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [openStatusMenu, setOpenStatusMenu] = useState(null)

  useEffect(() => {
    async function loadRequests() {
      if (isInDemoMode) return

      const buildingId = userProfile?.building_id
      if (!buildingId) {
        setLoading(false)
        return
      }

      try {
        const data = await getBuildingRequests(buildingId)
        setRequests(data)
      } catch (err) {
        console.error('[ManagerMaintenance] Error loading requests:', err)
      } finally {
        setLoading(false)
      }
    }
    loadRequests()
  }, [isInDemoMode, userProfile?.building_id])

  const showToastMsg = (msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleStatusChange = async (requestId, newStatus) => {
    setOpenStatusMenu(null)

    // Optimistic update
    setRequests(prev => prev.map(r =>
      r.id === requestId ? { ...r, status: newStatus, updated_at: new Date().toISOString() } : r
    ))

    if (!isInDemoMode) {
      try {
        await updateRequestStatus(requestId, newStatus)
      } catch (err) {
        console.error('[ManagerMaintenance] Error updating status:', err)
        showToastMsg('Failed to update status')
        return
      }
    }

    showToastMsg(`Status updated to ${STATUS_CONFIG[newStatus].label}`)
  }

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (hours < 24) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    if (days < 14) return '1 week ago'
    return `${Math.floor(days / 7)} weeks ago`
  }

  // Stats
  const pendingCount = requests.filter(r => r.status === 'pending').length
  const inProgressCount = requests.filter(r => r.status === 'in_progress').length
  const resolvedCount = requests.filter(r => r.status === 'resolved').length
  const highUrgencyCount = requests.filter(r => r.urgency === 'high' || r.urgency === 'emergency').length

  const stats = [
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'yellow' },
    { label: 'In Progress', value: inProgressCount, icon: Wrench, color: 'blue' },
    { label: 'Resolved', value: resolvedCount, icon: CheckCircle, color: 'green' },
    { label: 'High Priority', value: highUrgencyCount, icon: AlertTriangle, color: 'red' }
  ]

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'in_progress', label: 'In Progress' },
    { id: 'resolved', label: 'Resolved' }
  ]

  const getFilteredRequests = () => {
    let filtered = [...requests]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.title.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query) ||
        (r.user?.full_name || '').toLowerCase().includes(query) ||
        (r.unit_number || '').toLowerCase().includes(query)
      )
    }

    if (activeFilter !== 'all') {
      filtered = filtered.filter(r => r.status === activeFilter)
    }

    // Sort: pending first, then in_progress, then by date
    const statusOrder = { pending: 0, in_progress: 1, resolved: 2, closed: 3 }
    filtered.sort((a, b) => {
      const sDiff = (statusOrder[a.status] || 0) - (statusOrder[b.status] || 0)
      if (sDiff !== 0) return sDiff
      return new Date(b.created_at) - new Date(a.created_at)
    })

    return filtered
  }

  const filteredRequests = getFilteredRequests()

  if (loading) {
    return (
      <div className="manager-maintenance">
        <div className="mm-header">
          <div className="mm-header-left">
            <h2>Maintenance</h2>
            <p>Manage resident maintenance requests</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', color: '#9CA3AF' }}>
          Loading requests...
        </div>
      </div>
    )
  }

  return (
    <div className="manager-maintenance">
      {/* Header */}
      <div className="mm-header">
        <div className="mm-header-left">
          <h2>Maintenance</h2>
          <p>Manage resident maintenance requests</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mm-stats">
        {stats.map((stat, i) => (
          <div key={i} className={`mm-stat-card mm-stat-${stat.color}`}>
            <div className="mm-stat-icon">
              <stat.icon size={20} />
            </div>
            <div className="mm-stat-content">
              <span className="mm-stat-value">{stat.value}</span>
              <span className="mm-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mm-toolbar">
        <div className="mm-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search requests..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="mm-filters">
          {filters.map(f => (
            <button
              key={f.id}
              className={`mm-filter-tab ${activeFilter === f.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Request Cards */}
      <div className="mm-request-list">
        {filteredRequests.length === 0 ? (
          <div className="mm-empty">
            <Wrench size={48} />
            <h3>No requests found</h3>
            <p>
              {searchQuery
                ? 'Try a different search term'
                : activeFilter !== 'all'
                  ? 'No requests with this status'
                  : 'No maintenance requests yet'}
            </p>
          </div>
        ) : (
          filteredRequests.map(req => {
            const status = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending
            const urgency = URGENCY_CONFIG[req.urgency] || URGENCY_CONFIG.low
            return (
              <div key={req.id} className="mm-request-card">
                <div className="mm-card-top">
                  <div className="mm-card-badges">
                    <span className="mm-status-badge" style={{ background: status.bg, color: status.color }}>
                      {status.label}
                    </span>
                    <span className="mm-urgency-badge" style={{ color: urgency.color }}>
                      <AlertTriangle size={12} />
                      {urgency.label}
                    </span>
                  </div>
                  <span className="mm-card-time">{formatTimeAgo(req.created_at)}</span>
                </div>

                <h3 className="mm-card-title">{req.title}</h3>
                <p className="mm-card-desc">{req.description}</p>
                {req.photo_signed_url && (
                  <img
                    src={req.photo_signed_url}
                    alt="Maintenance issue"
                    className="mm-card-photo"
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                )}

                <div className="mm-card-meta">
                  <div className="mm-card-resident">
                    <User size={14} />
                    <span>{req.user?.full_name || 'Unknown'}</span>
                    <span className="mm-card-unit">Unit {req.unit_number || req.user?.unit_number || '?'}</span>
                  </div>
                </div>

                <div className="mm-card-actions">
                  <div className="mm-status-dropdown-wrapper">
                    <button
                      className="mm-status-dropdown-btn"
                      onClick={() => setOpenStatusMenu(openStatusMenu === req.id ? null : req.id)}
                    >
                      Update Status
                      <ChevronDown size={14} />
                    </button>
                    {openStatusMenu === req.id && (
                      <div className="mm-status-dropdown">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <button
                            key={key}
                            className={`mm-status-option ${req.status === key ? 'current' : ''}`}
                            onClick={() => handleStatusChange(req.id, key)}
                            disabled={req.status === key}
                          >
                            <span className="mm-status-dot" style={{ background: cfg.color }} />
                            {cfg.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Toast */}
      {showToast && (
        <div className="mm-toast">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Click outside to close status menus */}
      {openStatusMenu && (
        <div className="mm-backdrop" onClick={() => setOpenStatusMenu(null)} />
      )}
    </div>
  )
}

export default ManagerMaintenance
