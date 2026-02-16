import { useState, useEffect } from 'react'
import {
  Flag,
  CheckCircle,
  Clock,
  AlertTriangle,
  XCircle,
  User,
  Search,
  ChevronDown
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabase'
import './ManagerReports.css'

const DEMO_REPORTS = [
  {
    id: 1,
    content_type: 'post',
    reason: 'Spam or solicitation',
    details: null,
    status: 'pending',
    created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
    reporter: { full_name: 'Sarah Mitchell', unit_number: '1201' },
    content_preview: 'Buy my amazing crypto course! Limited time offer...'
  },
  {
    id: 2,
    content_type: 'post',
    reason: 'Harassment or bullying',
    details: null,
    status: 'pending',
    created_at: new Date(Date.now() - 1 * 86400000).toISOString(),
    reporter: { full_name: 'Mike Thompson', unit_number: '805' },
    content_preview: 'Some people in this building are so annoying and should just move out...'
  },
  {
    id: 3,
    content_type: 'post',
    reason: 'Privacy violation',
    details: 'They posted someone\'s phone number without permission',
    status: 'action_taken',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    reporter: { full_name: 'Jessica Kim', unit_number: '402' },
    content_preview: 'If you need to reach the guy in 1104, his number is 555-...'
  },
  {
    id: 4,
    content_type: 'post',
    reason: 'Other',
    details: 'This post is misleading about building policy',
    status: 'dismissed',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    reporter: { full_name: 'Alex Rivera', unit_number: '1104' },
    content_preview: 'FYI the building manager said we can have pets over 50lbs now!'
  }
]

const STATUS_CONFIG = {
  pending: { label: 'Pending Review', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', icon: Clock },
  reviewed: { label: 'Reviewed', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', icon: CheckCircle },
  action_taken: { label: 'Action Taken', color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', icon: CheckCircle },
  dismissed: { label: 'Dismissed', color: '#6b7280', bg: 'rgba(107, 114, 128, 0.12)', icon: XCircle }
}

function ManagerReports() {
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [reports, setReports] = useState(isInDemoMode ? DEMO_REPORTS : [])
  const [loading, setLoading] = useState(!isInDemoMode)
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [openStatusMenu, setOpenStatusMenu] = useState(null)

  useEffect(() => {
    async function loadReports() {
      if (isInDemoMode) return

      const buildingId = userProfile?.building_id
      if (!buildingId) { setLoading(false); return }

      try {
        // Fetch reports for this building
        const { data: reportsData, error } = await supabase
          .from('content_reports')
          .select('*')
          .eq('building_id', buildingId)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('[ManagerReports] Error fetching reports:', error)
          setLoading(false)
          return
        }

        if (!reportsData || reportsData.length === 0) {
          setReports([])
          setLoading(false)
          return
        }

        // Fetch reporter profiles
        const reporterIds = [...new Set(reportsData.map(r => r.reporter_id).filter(Boolean))]
        let profiles = []
        if (reporterIds.length > 0) {
          const { data: profileData } = await supabase
            .from('users')
            .select('id, full_name, unit_number')
            .in('id', reporterIds)
          profiles = profileData || []
        }

        // Fetch content previews for posts
        const postIds = reportsData.filter(r => r.content_type === 'post').map(r => r.content_id)
        let posts = []
        if (postIds.length > 0) {
          const { data: postData } = await supabase
            .from('community_posts')
            .select('id, content')
            .in('id', postIds)
          posts = postData || []
        }

        const enriched = reportsData.map(report => {
          const reporter = profiles.find(p => p.id === report.reporter_id)
          const post = posts.find(p => p.id === report.content_id)
          return {
            ...report,
            reporter: {
              full_name: reporter?.full_name || 'Unknown',
              unit_number: reporter?.unit_number || '?'
            },
            content_preview: post?.content || '(Content unavailable)'
          }
        })

        setReports(enriched)
      } catch (err) {
        console.error('[ManagerReports] Error:', err)
      } finally {
        setLoading(false)
      }
    }
    loadReports()
  }, [isInDemoMode, userProfile?.building_id])

  const showToastMsg = (msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleStatusChange = async (reportId, newStatus) => {
    setOpenStatusMenu(null)
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: newStatus } : r))

    if (!isInDemoMode) {
      try {
        const { error } = await supabase
          .from('content_reports')
          .update({ status: newStatus })
          .eq('id', reportId)
        if (error) {
          console.error('[ManagerReports] Error updating status:', error)
          showToastMsg('Failed to update status')
          return
        }
      } catch (err) {
        console.error('[ManagerReports] Error:', err)
        showToastMsg('Failed to update status')
        return
      }
    }

    showToastMsg(`Report marked as ${STATUS_CONFIG[newStatus].label}`)
  }

  const formatTimeAgo = (dateStr) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)
    if (hours < 24) return 'Today'
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days} days ago`
    return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? 's' : ''} ago`
  }

  // Stats
  const pendingCount = reports.filter(r => r.status === 'pending').length
  const reviewedCount = reports.filter(r => r.status === 'reviewed').length
  const actionCount = reports.filter(r => r.status === 'action_taken').length
  const dismissedCount = reports.filter(r => r.status === 'dismissed').length

  const stats = [
    { label: 'Pending', value: pendingCount, icon: Clock, color: 'yellow' },
    { label: 'Reviewed', value: reviewedCount, icon: CheckCircle, color: 'blue' },
    { label: 'Action Taken', value: actionCount, icon: AlertTriangle, color: 'green' },
    { label: 'Dismissed', value: dismissedCount, icon: XCircle, color: 'gray' }
  ]

  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'action_taken', label: 'Action Taken' },
    { id: 'dismissed', label: 'Dismissed' }
  ]

  const getFiltered = () => {
    let filtered = [...reports]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      filtered = filtered.filter(r =>
        r.reason.toLowerCase().includes(q) ||
        (r.details || '').toLowerCase().includes(q) ||
        (r.content_preview || '').toLowerCase().includes(q) ||
        (r.reporter?.full_name || '').toLowerCase().includes(q)
      )
    }
    if (activeFilter !== 'all') {
      filtered = filtered.filter(r => r.status === activeFilter)
    }
    // Pending first
    const order = { pending: 0, reviewed: 1, action_taken: 2, dismissed: 3 }
    filtered.sort((a, b) => {
      const diff = (order[a.status] || 0) - (order[b.status] || 0)
      if (diff !== 0) return diff
      return new Date(b.created_at) - new Date(a.created_at)
    })
    return filtered
  }

  const filteredReports = getFiltered()

  if (loading) {
    return (
      <div className="manager-reports">
        <div className="mr-header">
          <div className="mr-header-left">
            <h2>Content Reports</h2>
            <p>Review flagged community content</p>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '40vh', color: '#9CA3AF' }}>
          Loading reports...
        </div>
      </div>
    )
  }

  return (
    <div className="manager-reports">
      <div className="mr-header">
        <div className="mr-header-left">
          <h2>Content Reports</h2>
          <p>Review flagged community content</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mr-stats">
        {stats.map((stat, i) => (
          <div key={i} className={`mr-stat-card mr-stat-${stat.color}`}>
            <div className="mr-stat-icon">
              <stat.icon size={20} />
            </div>
            <div className="mr-stat-content">
              <span className="mr-stat-value">{stat.value}</span>
              <span className="mr-stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div className="mr-toolbar">
        <div className="mr-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search reports..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="mr-filters">
          {filters.map(f => (
            <button
              key={f.id}
              className={`mr-filter-tab ${activeFilter === f.id ? 'active' : ''}`}
              onClick={() => setActiveFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Report Cards */}
      <div className="mr-report-list">
        {filteredReports.length === 0 ? (
          <div className="mr-empty">
            <Flag size={48} />
            <h3>No reports found</h3>
            <p>
              {searchQuery
                ? 'Try a different search term'
                : activeFilter !== 'all'
                  ? 'No reports with this status'
                  : 'No content has been reported yet'}
            </p>
          </div>
        ) : (
          filteredReports.map(report => {
            const status = STATUS_CONFIG[report.status] || STATUS_CONFIG.pending
            const StatusIcon = status.icon
            return (
              <div key={report.id} className="mr-report-card">
                <div className="mr-card-top">
                  <span className="mr-status-badge" style={{ background: status.bg, color: status.color }}>
                    <StatusIcon size={12} />
                    {status.label}
                  </span>
                  <span className="mr-card-time">{formatTimeAgo(report.created_at)}</span>
                </div>

                <div className="mr-card-reason">
                  <Flag size={14} />
                  <span>{report.reason}</span>
                </div>

                {report.details && (
                  <p className="mr-card-details">"{report.details}"</p>
                )}

                <div className="mr-card-preview">
                  <p>{report.content_preview}</p>
                </div>

                <div className="mr-card-meta">
                  <div className="mr-card-reporter">
                    <User size={14} />
                    <span>Reported by {report.reporter?.full_name}</span>
                    <span className="mr-card-unit">Unit {report.reporter?.unit_number}</span>
                  </div>
                </div>

                <div className="mr-card-actions">
                  <div className="mr-status-dropdown-wrapper">
                    <button
                      className="mr-status-dropdown-btn"
                      onClick={() => setOpenStatusMenu(openStatusMenu === report.id ? null : report.id)}
                    >
                      Update Status
                      <ChevronDown size={14} />
                    </button>
                    {openStatusMenu === report.id && (
                      <div className="mr-status-dropdown">
                        {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                          <button
                            key={key}
                            className={`mr-status-option ${report.status === key ? 'current' : ''}`}
                            onClick={() => handleStatusChange(report.id, key)}
                            disabled={report.status === key}
                          >
                            <span className="mr-status-dot" style={{ background: cfg.color }} />
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
        <div className="mr-toast">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {openStatusMenu && (
        <div className="mr-backdrop" onClick={() => setOpenStatusMenu(null)} />
      )}
    </div>
  )
}

export default ManagerReports
