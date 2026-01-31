import { useState, useEffect } from 'react'
import {
  Building2,
  LayoutDashboard,
  Sparkles,
  Users,
  MessageSquare,
  Calendar,
  Package,
  ArrowUpDown,
  ClipboardList,
  HelpCircle,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  TrendingUp,
  Clock,
  UserPlus,
  Megaphone,
  Plus,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Mail,
  PartyPopper,
  Wine,
  Wrench,
  Send,
  MapPin,
  Image,
  Tag,
  FileText,
  User,
  Home,
  Phone,
  Eye,
  Trash2,
  Loader2,
  AlertTriangle
} from 'lucide-react'
import './ManagerDashboard.css'
import { useAuth } from './contexts/AuthContext'
import { loadDashboardData, getIsDemoUser } from './services/managerDashboardService'
import ManagerMessages from './ManagerMessages'
import ManagerResidents from './ManagerResidents'
import ManagerAIAssistant from './ManagerAIAssistant'
import ManagerCommunity from './ManagerCommunity'
import ManagerCalendar from './ManagerCalendar'
import ManagerPackages from './ManagerPackages'
import ManagerElevator from './ManagerElevator'
import ManagerBulletin from './ManagerBulletin'
import ManagerFAQ from './ManagerFAQ'
import ManagerSettings from './ManagerSettings'
import AnnouncementModal from './components/AnnouncementModal'
import EventModal from './components/EventModal'

function ManagerDashboard({ onLogout, buildingData }) {
  // Auth context for demo detection and user info
  const { user, userProfile, isDemoMode } = useAuth()

  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  // Modal states
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)

  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Form states
  const [packageForm, setPackageForm] = useState({
    unit: '',
    residentName: '',
    carrier: 'USPS',
    trackingNumber: '',
    description: '',
    size: 'medium'
  })

  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    unit: '',
    phone: ''
  })

  // Notifications state (will be populated from dashboardData)
  const [notifications, setNotifications] = useState([])

  // Load dashboard data on mount
  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true)
      setLoadError(null)

      try {
        // Determine user ID - use actual user id or demo id
        const userId = user?.id || userProfile?.id

        // Check if this is demo mode
        const isDemo = getIsDemoUser(userProfile, isDemoMode)

        if (process.env.NODE_ENV === 'development') {
          console.log('[ManagerDashboard] Loading data - isDemo:', isDemo, 'userId:', userId)
        }

        // For demo users OR if we have buildingData from onboarding, use that
        // This handles the case where a user just completed onboarding
        if (isDemo) {
          const data = await loadDashboardData(userProfile, isDemoMode, userId)
          setDashboardData(data)

          // Set notifications from demo data
          const notificationIcons = { message: MessageSquare, package: Package, elevator: ArrowUpDown, event: Wine, maintenance: Wrench, resident: UserPlus }
          setNotifications(data.notifications?.map(n => ({ ...n, icon: notificationIcons[n.type] || Bell })) || [])
        } else if (buildingData) {
          // Real user who just completed onboarding - use the passed buildingData
          // This is a transitional state before data is in Supabase
          setDashboardData({
            building: {
              id: 'new-building',
              name: buildingData.name,
              code: buildingData.code,
              totalUnits: buildingData.units || 50,
            },
            manager: {
              id: userId,
              name: buildingData.manager?.name || userProfile?.full_name || 'Property Manager',
              email: buildingData.manager?.email || userProfile?.email,
            },
            stats: {
              residentsJoined: 0,
              totalResidents: buildingData.units || 50,
              packagesPending: 0,
              packagesOverdue: 0,
              eventsThisWeek: 0,
              nextEvent: null,
              unreadMessages: 0,
              newMessagesToday: 0,
            },
            recentActivity: [],
            upcomingEvents: [],
            notifications: [],
            isLoaded: true,
            isEmpty: false,
          })
          setNotifications([])
        } else {
          // Real user - fetch from Supabase
          const data = await loadDashboardData(userProfile, isDemoMode, userId)
          setDashboardData(data)

          if (data.error) {
            setLoadError(data.error)
          }

          // Set notifications from real data
          const notificationIcons = { message: MessageSquare, package: Package, elevator: ArrowUpDown, event: Wine, maintenance: Wrench, resident: UserPlus }
          setNotifications(data.notifications?.map(n => ({ ...n, icon: notificationIcons[n.type] || Bell })) || [])
        }
      } catch (error) {
        console.error('[ManagerDashboard] Error loading dashboard:', error)
        setLoadError(error.message)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [user, userProfile, isDemoMode, buildingData])

  // Derive building info from dashboard data
  const building = dashboardData ? {
    name: dashboardData.building?.name || 'Your Building',
    code: dashboardData.building?.code || '',
    manager: {
      name: dashboardData.manager?.name || userProfile?.full_name || 'Property Manager',
      email: dashboardData.manager?.email || userProfile?.email || ''
    }
  } : {
    name: buildingData?.name || 'Your Building',
    code: buildingData?.code || '',
    manager: {
      name: buildingData?.manager?.name || userProfile?.full_name || 'Property Manager',
      email: buildingData?.manager?.email || userProfile?.email || ''
    }
  }

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'residents', label: 'Residents', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 2 },
    { id: 'divider1', divider: true },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'elevator', label: 'Elevator Booking', icon: ArrowUpDown },
    { id: 'bulletin', label: 'Bulletin Board', icon: ClipboardList },
    { id: 'faq', label: 'Building FAQ', icon: HelpCircle },
    { id: 'divider2', divider: true },
    { id: 'settings', label: 'Settings', icon: Settings }
  ]

  // Stats data with navigation targets - derived from dashboardData
  const statsData = dashboardData?.stats || {}
  const stats = [
    {
      id: 'residents',
      label: 'Residents Joined',
      value: `${statsData.residentsJoined || 0}/${statsData.totalResidents || 50}`,
      subtitle: statsData.totalResidents ? `${Math.round((statsData.residentsJoined || 0) / statsData.totalResidents * 100)}% onboarded` : 'No residents yet',
      icon: Users,
      color: 'blue',
      navTarget: 'residents'
    },
    {
      id: 'packages',
      label: 'Packages Pending',
      value: String(statsData.packagesPending || 0),
      subtitle: statsData.packagesOverdue > 0 ? `${statsData.packagesOverdue} over 48hrs` : 'All on time',
      icon: Package,
      color: 'yellow',
      navTarget: 'packages'
    },
    {
      id: 'events',
      label: 'Events This Week',
      value: String(statsData.eventsThisWeek || 0),
      subtitle: statsData.nextEvent ? `Next: ${statsData.nextEvent}` : 'No upcoming events',
      icon: Calendar,
      color: 'purple',
      navTarget: 'calendar'
    },
    {
      id: 'messages',
      label: 'Unread Messages',
      value: String(statsData.unreadMessages || 0),
      subtitle: statsData.newMessagesToday > 0 ? `${statsData.newMessagesToday} new today` : 'All caught up',
      icon: MessageSquare,
      color: 'cyan',
      navTarget: 'messages'
    }
  ]

  // Map activity types to icons
  const activityTypeIcons = {
    resident_joined: UserPlus,
    package: Package,
    message: Mail,
    event_rsvp: Wine,
    maintenance: CheckCircle,
    elevator: ArrowUpDown,
    elevator_booking: ArrowUpDown,
    bulletin: ClipboardList,
    faq: HelpCircle,
    profile: User,
    community: Users,
    community_post: MessageSquare,
    event_created: Calendar,
  }

  // Recent activity with navigation - from dashboardData
  const recentActivity = (dashboardData?.recentActivity || []).map(item => ({
    ...item,
    icon: activityTypeIcons[item.type] || Bell,
  }))

  // All activity (for expanded view) - for now same as recent, would come from full activity log
  const allActivity = recentActivity

  // Quick actions
  const quickActions = [
    { id: 'announcement', label: 'Post Announcement', icon: Megaphone },
    { id: 'package', label: 'Log Package', icon: Package },
    { id: 'event', label: 'Create Event', icon: PartyPopper },
    { id: 'invite', label: 'Invite Resident', icon: UserPlus }
  ]

  // Upcoming events - from dashboardData
  const upcomingEvents = dashboardData?.upcomingEvents || []

  // Show toast message
  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Handle nav click
  const handleNavClick = (itemId) => {
    setActiveNav(itemId)
    setSidebarOpen(false)
  }

  // Handle stat card click
  const handleStatClick = (stat) => {
    setActiveNav(stat.navTarget)
  }

  // Handle quick action click
  const handleQuickAction = (actionId) => {
    switch (actionId) {
      case 'announcement':
        setShowAnnouncementModal(true)
        break
      case 'package':
        setShowPackageModal(true)
        break
      case 'event':
        setShowEventModal(true)
        break
      case 'invite':
        setShowInviteModal(true)
        break
      default:
        break
    }
  }

  // Handle activity item click
  const handleActivityClick = (activity) => {
    setActiveNav(activity.navTarget)
  }

  // Handle event click
  const handleEventClick = (event) => {
    setActiveNav('calendar')
  }

  // Handle notification click
  const handleNotificationClick = (notification) => {
    // Mark as read
    setNotifications(prev => prev.map(n =>
      n.id === notification.id ? { ...n, unread: false } : n
    ))
    setShowNotifications(false)

    // Navigate based on type
    const navMap = {
      message: 'messages',
      package: 'packages',
      elevator: 'elevator',
      event: 'calendar',
      maintenance: 'messages',
      resident: 'residents'
    }
    setActiveNav(navMap[notification.type] || 'dashboard')
  }

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  // Get unread count
  const unreadCount = notifications.filter(n => n.unread).length

  // Handle announcement success (from modal)
  const handleAnnouncementSuccess = () => {
    showToastMessage('Announcement posted successfully!')
  }

  // Handle package submit
  const handlePackageSubmit = () => {
    setShowPackageModal(false)
    setPackageForm({ unit: '', residentName: '', carrier: 'USPS', trackingNumber: '', description: '', size: 'medium' })
    showToastMessage('Package logged successfully!')
  }

  // Handle event success (from modal)
  const handleEventSuccess = () => {
    showToastMessage('Event created successfully!')
  }

  // Handle invite submit
  const handleInviteSubmit = () => {
    setShowInviteModal(false)
    setInviteForm({ firstName: '', lastName: '', email: '', unit: '', phone: '' })
    showToastMessage('Invitation sent successfully!')
  }

  // Render content based on active nav
  const renderContent = () => {
    // Show loading state
    if (isLoading) {
      return (
        <div className="dashboard-loading">
          <Loader2 size={48} className="loading-spinner" />
          <p>Loading your dashboard...</p>
        </div>
      )
    }

    // Show empty state for real users with no building
    if (dashboardData?.isEmpty && !getIsDemoUser(userProfile, isDemoMode)) {
      return (
        <div className="dashboard-empty-state">
          <div className="empty-state-icon">
            <Building2 size={64} />
          </div>
          <h2>Welcome to Community!</h2>
          <p>You haven't set up a building yet. Create your building to start managing residents, packages, and events.</p>
          {loadError && (
            <div className="empty-state-error">
              <AlertTriangle size={16} />
              <span>{loadError}</span>
            </div>
          )}
          <div className="empty-state-actions">
            <button className="btn-primary" onClick={() => window.location.href = '/'}>
              <Plus size={18} />
              Create Your Building
            </button>
          </div>
        </div>
      )
    }

    if (activeNav === 'messages') {
      return <ManagerMessages />
    }

    if (activeNav === 'residents') {
      return <ManagerResidents />
    }

    if (activeNav === 'ai-assistant') {
      return <ManagerAIAssistant buildingData={building} />
    }

    if (activeNav === 'community') {
      return <ManagerCommunity />
    }

    if (activeNav === 'calendar') {
      return <ManagerCalendar />
    }

    if (activeNav === 'packages') {
      return <ManagerPackages />
    }

    if (activeNav === 'elevator') {
      return <ManagerElevator />
    }

    if (activeNav === 'bulletin') {
      return <ManagerBulletin />
    }

    if (activeNav === 'faq') {
      return <ManagerFAQ />
    }

    if (activeNav === 'settings') {
      return <ManagerSettings />
    }

    if (activeNav === 'dashboard') {
      return (
        <div className="dashboard-home">
          {/* Stats Row */}
          <div className="stats-row">
            {stats.map((stat, index) => (
              <div
                key={index}
                className={`stat-card stat-${stat.color} clickable`}
                onClick={() => handleStatClick(stat)}
              >
                <div className="stat-icon">
                  <stat.icon size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-subtitle">{stat.subtitle}</span>
                </div>
                <ChevronRight size={16} className="stat-arrow" />
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="dashboard-grid">
            {/* Recent Activity */}
            <div className="dashboard-card activity-card">
              <div className="card-header">
                <h3>Recent Activity</h3>
                <button className="view-all-btn" onClick={() => setShowActivityModal(true)}>
                  View all
                </button>
              </div>
              <div className="activity-list">
                {recentActivity.length > 0 ? (
                  recentActivity.map(item => (
                    <div
                      key={item.id}
                      className="activity-item clickable"
                      onClick={() => handleActivityClick(item)}
                    >
                      <div className={`activity-icon activity-${item.color}`}>
                        <item.icon size={16} />
                      </div>
                      <div className="activity-content">
                        <span className="activity-text">{item.text}</span>
                        <span className="activity-time">{item.time}</span>
                      </div>
                      <ChevronRight size={16} className="activity-arrow" />
                    </div>
                  ))
                ) : (
                  <div className="activity-empty-state">
                    <Bell size={24} style={{ opacity: 0.4 }} />
                    <p>No recent activity</p>
                    <span>Activity from your building will appear here</span>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="dashboard-card actions-card">
              <div className="card-header">
                <h3>Quick Actions</h3>
              </div>
              <div className="quick-actions">
                {quickActions.map(action => (
                  <button
                    key={action.id}
                    className="quick-action-btn"
                    onClick={() => handleQuickAction(action.id)}
                  >
                    <action.icon size={20} />
                    <span>{action.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Coming Up This Week */}
            <div className="dashboard-card events-card">
              <div className="card-header">
                <h3>Coming Up This Week</h3>
                <button className="view-all-btn" onClick={() => setActiveNav('calendar')}>
                  View calendar
                </button>
              </div>
              <div className="events-list">
                {upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    className={`event-item clickable ${event.type === 'maintenance' ? 'maintenance' : ''}`}
                    onClick={() => handleEventClick(event)}
                  >
                    <div className="event-date">
                      <span className="event-day">{event.date.split(',')[0]}</span>
                      <span className="event-date-full">{event.date.split(', ')[1]}</span>
                    </div>
                    <div className="event-details">
                      <span className="event-title">{event.title}</span>
                      <span className="event-meta">
                        <Clock size={12} />
                        {event.time} • {event.location}
                      </span>
                      {event.rsvps && (
                        <span className="event-rsvps">{event.rsvps} RSVPs</span>
                      )}
                    </div>
                    <ChevronRight size={18} className="event-arrow" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )
    }

    // Placeholder for other pages
    return (
      <div className="coming-soon">
        <div className="coming-soon-icon">
          {navItems.find(n => n.id === activeNav)?.icon && (
            <span>
              {(() => {
                const Icon = navItems.find(n => n.id === activeNav)?.icon
                return Icon ? <Icon size={48} /> : null
              })()}
            </span>
          )}
        </div>
        <h2>{navItems.find(n => n.id === activeNav)?.label}</h2>
        <p>This section is coming soon...</p>
        <button className="back-to-dashboard" onClick={() => setActiveNav('dashboard')}>
          Back to Dashboard
        </button>
      </div>
    )
  }

  return (
    <div className="manager-dashboard">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button className="menu-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="mobile-title">{building.name}</span>
        <button
          className="notification-btn mobile"
          onClick={() => setShowNotifications(!showNotifications)}
        >
          <Bell size={20} />
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </button>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="building-logo">
            <Building2 size={24} />
          </div>
          <div className="building-info">
            <span className="building-name">{building.name}</span>
            <span className="building-role">Property Manager</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          {navItems.map(item => {
            if (item.divider) {
              return <div key={item.id} className="nav-divider" />
            }
            return (
              <button
                key={item.id}
                className={`nav-item ${activeNav === item.id ? 'active' : ''}`}
                onClick={() => handleNavClick(item.id)}
              >
                <item.icon size={20} />
                <span>{item.label}</span>
                {item.badge && <span className="nav-badge">{item.badge}</span>}
              </button>
            )
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="manager-profile">
            <div className="manager-avatar">
              {building.manager.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div className="manager-info">
              <span className="manager-name">{building.manager.name}</span>
              <button className="logout-btn" onClick={onLogout}>
                <LogOut size={14} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Bar */}
        <div className="top-bar">
          <div className="greeting">
            <h1>{getGreeting()}, {building.manager.name.split(' ')[0]}</h1>
            <p>Here's what's happening at {building.name}</p>
          </div>
          <div className="top-bar-actions">
            <div className="notification-wrapper">
              <button
                className={`notification-btn ${showNotifications ? 'active' : ''}`}
                onClick={() => setShowNotifications(!showNotifications)}
              >
                <Bell size={20} />
                {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <>
                  <div className="notification-backdrop" onClick={() => setShowNotifications(false)} />
                  <div className="notifications-dropdown">
                    <div className="notifications-header">
                      <h4>Notifications</h4>
                      <button className="mark-read-btn" onClick={markAllAsRead}>
                        Mark all as read
                      </button>
                    </div>
                    <div className="notifications-list">
                      {notifications.map(notification => (
                        <div
                          key={notification.id}
                          className={`notification-item ${notification.unread ? 'unread' : ''}`}
                          onClick={() => handleNotificationClick(notification)}
                        >
                          <div className="notification-icon">
                            <notification.icon size={16} />
                          </div>
                          <div className="notification-content">
                            <span className="notification-title">{notification.title}</span>
                            <span className="notification-subtitle">{notification.subtitle}</span>
                            <span className="notification-time">{notification.time}</span>
                          </div>
                          {notification.unread && <span className="unread-dot" />}
                        </div>
                      ))}
                    </div>
                    <div className="notifications-footer">
                      <button className="view-all-notifications" onClick={() => setShowNotifications(false)}>
                        View all notifications
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {renderContent()}
        </div>
      </main>

      {/* Post Announcement Modal */}
      <AnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        onSuccess={handleAnnouncementSuccess}
        userProfile={userProfile}
        isInDemoMode={isDemoMode}
      />

      {/* Log Package Modal */}
      {showPackageModal && (
        <div className="modal-overlay" onClick={() => setShowPackageModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log New Package</h3>
              <button className="modal-close" onClick={() => setShowPackageModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>Unit Number *</label>
                  <div className="input-with-icon">
                    <Home size={16} />
                    <input
                      type="text"
                      placeholder="e.g., 1201"
                      value={packageForm.unit}
                      onChange={e => setPackageForm({...packageForm, unit: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Resident Name</label>
                  <div className="input-with-icon">
                    <User size={16} />
                    <input
                      type="text"
                      placeholder="Resident name"
                      value={packageForm.residentName}
                      onChange={e => setPackageForm({...packageForm, residentName: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Carrier *</label>
                  <select
                    value={packageForm.carrier}
                    onChange={e => setPackageForm({...packageForm, carrier: e.target.value})}
                  >
                    <option value="USPS">USPS</option>
                    <option value="UPS">UPS</option>
                    <option value="FedEx">FedEx</option>
                    <option value="Amazon">Amazon</option>
                    <option value="DHL">DHL</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Package Size</label>
                  <select
                    value={packageForm.size}
                    onChange={e => setPackageForm({...packageForm, size: e.target.value})}
                  >
                    <option value="small">Small (envelope/small box)</option>
                    <option value="medium">Medium (shoebox)</option>
                    <option value="large">Large (moving box)</option>
                    <option value="oversized">Oversized (furniture)</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Tracking Number</label>
                <input
                  type="text"
                  placeholder="Optional tracking number"
                  value={packageForm.trackingNumber}
                  onChange={e => setPackageForm({...packageForm, trackingNumber: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  placeholder="Brief description (e.g., Large Amazon box)"
                  value={packageForm.description}
                  onChange={e => setPackageForm({...packageForm, description: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPackageModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handlePackageSubmit}
                disabled={!packageForm.unit}
              >
                <Package size={18} />
                Log Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Event Modal */}
      <EventModal
        isOpen={showEventModal}
        onClose={() => setShowEventModal(false)}
        onSuccess={handleEventSuccess}
        userProfile={userProfile}
        isInDemoMode={isDemoMode}
      />

      {/* Invite Resident Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Invite Resident</h3>
              <button className="modal-close" onClick={() => setShowInviteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input
                    type="text"
                    placeholder="First name"
                    value={inviteForm.firstName}
                    onChange={e => setInviteForm({...inviteForm, firstName: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input
                    type="text"
                    placeholder="Last name"
                    value={inviteForm.lastName}
                    onChange={e => setInviteForm({...inviteForm, lastName: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email Address *</label>
                <div className="input-with-icon">
                  <Mail size={16} />
                  <input
                    type="email"
                    placeholder="resident@email.com"
                    value={inviteForm.email}
                    onChange={e => setInviteForm({...inviteForm, email: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Unit Number *</label>
                  <div className="input-with-icon">
                    <Home size={16} />
                    <input
                      type="text"
                      placeholder="e.g., 1201"
                      value={inviteForm.unit}
                      onChange={e => setInviteForm({...inviteForm, unit: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Phone (Optional)</label>
                  <div className="input-with-icon">
                    <Phone size={16} />
                    <input
                      type="tel"
                      placeholder="(555) 123-4567"
                      value={inviteForm.phone}
                      onChange={e => setInviteForm({...inviteForm, phone: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              <div className="invite-preview">
                <p>An email invitation will be sent to {inviteForm.email || 'the resident'} with instructions to join {building.name}.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowInviteModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleInviteSubmit}
                disabled={!inviteForm.firstName || !inviteForm.lastName || !inviteForm.email || !inviteForm.unit}
              >
                <Send size={18} />
                Send Invitation
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Activity Modal */}
      {showActivityModal && (
        <div className="modal-overlay" onClick={() => setShowActivityModal(false)}>
          <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>All Activity</h3>
              <button className="modal-close" onClick={() => setShowActivityModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body activity-modal-body">
              <div className="activity-list expanded">
                {allActivity.map(item => (
                  <div
                    key={item.id}
                    className="activity-item clickable"
                    onClick={() => { handleActivityClick(item); setShowActivityModal(false) }}
                  >
                    <div className={`activity-icon activity-${item.color}`}>
                      <item.icon size={16} />
                    </div>
                    <div className="activity-content">
                      <span className="activity-text">{item.text}</span>
                      <span className="activity-detail">{item.detail}</span>
                      <span className="activity-time">{item.time}</span>
                    </div>
                    <ChevronRight size={16} className="activity-arrow" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export default ManagerDashboard
