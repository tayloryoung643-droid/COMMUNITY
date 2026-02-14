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
  AlertTriangle,
  MessageSquarePlus
} from 'lucide-react'
import './ManagerDashboard.css'
import { useAuth } from './contexts/AuthContext'
import { loadDashboardData, getIsDemoUser } from './services/managerDashboardService'
import { getBuildingBackgroundImage } from './services/buildingService'
import ManagerMessages from './ManagerMessages'
import ManagerResidents from './ManagerResidents'
import ManagerAIAssistant from './ManagerAIAssistant'
import ManagerCommunity from './ManagerCommunity'
import ManagerCalendar from './ManagerCalendar'
import ManagerPackages from './ManagerPackages'
import ManagerElevator from './ManagerElevator'
import ManagerBulletin from './ManagerBulletin'
import ManagerFAQ from './ManagerFAQ'
import ManagerDocuments from './ManagerDocuments'
import ManagerSettings from './ManagerSettings'
import ManagerFeedback from './ManagerFeedback'
import AnnouncementModal from './components/AnnouncementModal'
import EventModal from './components/EventModal'
import PackageModal from './components/PackageModal'
import FeedbackModal from './components/FeedbackModal'
import BmPageHeader from './components/BmPageHeader'
import LoadingSplash from './components/LoadingSplash'
import DemoTour from './components/DemoTour'

function ManagerDashboard({ onLogout, buildingData }) {
  // Auth context for demo detection and user info
  const { user, userProfile, isDemoMode } = useAuth()

  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Dashboard data state
  const [dashboardData, setDashboardData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [initialLoadDone, setInitialLoadDone] = useState(false)
  const [splashFading, setSplashFading] = useState(false)
  const [loadError, setLoadError] = useState(null)

  // Modal states
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [showPackageModal, setShowPackageModal] = useState(false)
  const [showEventModal, setShowEventModal] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const [showActivityModal, setShowActivityModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  // Toast state
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Building background image
  const [buildingBgUrl, setBuildingBgUrl] = useState(null)

  // Form states
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    unit: '',
    phone: ''
  })

  // Notifications state (will be populated from dashboardData)
  const [notifications, setNotifications] = useState([])

  // Load dashboard data AND building background together
  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true)
      setLoadError(null)

      try {
        const userId = user?.id || userProfile?.id
        const isDemo = getIsDemoUser(userProfile, isDemoMode)

        if (process.env.NODE_ENV === 'development') {
          console.log('[ManagerDashboard] Loading data - isDemo:', isDemo, 'userId:', userId)
        }

        if (isDemo) {
          const data = await loadDashboardData(userProfile, isDemoMode, userId)
          setDashboardData(data)
          const notificationIcons = { message: MessageSquare, package: Package, elevator: ArrowUpDown, event: Wine, maintenance: Wrench, resident: UserPlus }
          setNotifications(data.notifications?.map(n => ({ ...n, icon: notificationIcons[n.type] || Bell })) || [])
        } else if (buildingData) {
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
          const data = await loadDashboardData(userProfile, isDemoMode, userId)
          setDashboardData(data)
          if (data.error) setLoadError(data.error)
          const notificationIcons = { message: MessageSquare, package: Package, elevator: ArrowUpDown, event: Wine, maintenance: Wrench, resident: UserPlus }
          setNotifications(data.notifications?.map(n => ({ ...n, icon: notificationIcons[n.type] || Bell })) || [])
        }

        // Now fetch and preload the building background image before dismissing splash
        if (!isDemo) {
          const buildingId = userProfile?.building_id
          if (buildingId) {
            try {
              const url = await getBuildingBackgroundImage(buildingId)
              if (url) {
                setBuildingBgUrl(url)
                // Wait for image to actually load (or timeout after 5s)
                await Promise.race([
                  new Promise(resolve => {
                    const img = new window.Image()
                    img.onload = resolve
                    img.onerror = resolve
                    img.src = url
                  }),
                  new Promise(resolve => setTimeout(resolve, 5000))
                ])
              }
            } catch (err) {
              console.warn('[ManagerDashboard] Failed to load building background:', err)
            }
          }
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

  // Handle splash fade-out when initial data load completes (same pattern as Home.jsx)
  useEffect(() => {
    if (!isLoading && !initialLoadDone) {
      setSplashFading(true)
      const timer = setTimeout(() => {
        setInitialLoadDone(true)
        setSplashFading(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isLoading, initialLoadDone])

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

  // Get page header info based on active nav
  const getPageHeaderInfo = () => {
    const managerName = building.manager?.name?.split(' ')[0] || 'Manager'
    const buildingName = building.name || 'Your Building'

    const pageHeaders = {
      'dashboard': {
        title: `${getGreeting()}, ${managerName}`,
        subtitle: buildingName
      },
      'ai-assistant': {
        title: 'AI Assistant',
        subtitle: 'Your building management copilot'
      },
      'residents': {
        title: 'Residents',
        subtitle: `${statsData.residentsJoined || 0} residents in ${buildingName}`
      },
      'messages': {
        title: 'Messages',
        subtitle: 'Resident communications'
      },
      'community': {
        title: 'Community',
        subtitle: 'Posts and discussions'
      },
      'calendar': {
        title: 'Events',
        subtitle: 'Events and maintenance'
      },
      'packages': {
        title: 'Packages',
        subtitle: 'Deliveries and pickups'
      },
      'elevator': {
        title: 'Elevator Booking',
        subtitle: 'Move-in and move-out reservations'
      },
      'bulletin': {
        title: 'Bulletin Board',
        subtitle: 'Resident listings'
      },
      'faq': {
        title: 'Building FAQ',
        subtitle: 'Common questions and answers'
      },
      'documents': {
        title: 'Documents',
        subtitle: 'Building files and resources'
      },
      'feedback': {
        title: 'Help & Feedback',
        subtitle: 'Report bugs, suggest features, ask questions'
      },
      'settings': {
        title: 'Settings',
        subtitle: 'Building configuration'
      }
    }

    return pageHeaders[activeNav] || { title: 'Dashboard', subtitle: '' }
  }

  // Navigation items
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'ai-assistant', label: 'AI Assistant', icon: Sparkles },
    { id: 'residents', label: 'Residents', icon: Users },
    { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 2 },
    { id: 'divider1', divider: true },
    { id: 'community', label: 'Community', icon: Users },
    { id: 'calendar', label: 'Events', icon: Calendar },
    { id: 'packages', label: 'Packages', icon: Package },
    { id: 'elevator', label: 'Elevator Booking', icon: ArrowUpDown },
    { id: 'bulletin', label: 'Bulletin Board', icon: ClipboardList },
    { id: 'faq', label: 'Building FAQ', icon: HelpCircle },
    { id: 'documents', label: 'Documents', icon: FileText },
    { id: 'feedback', label: 'Help & Feedback', icon: MessageSquarePlus },
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
    { id: 'invite', label: 'Invite Resident', icon: UserPlus },
    { id: 'feedback', label: 'Send Feedback', icon: MessageSquarePlus }
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
      case 'feedback':
        setShowFeedbackModal(true)
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

  // Handle package success (from modal)
  const handlePackageSuccess = () => {
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
      return <ManagerAIAssistant buildingData={building} dashboardData={dashboardData} userId={user?.id || userProfile?.id} />
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

    if (activeNav === 'documents') {
      return <ManagerDocuments />
    }

    if (activeNav === 'feedback') {
      return <ManagerFeedback buildingName={building?.name} />
    }

    if (activeNav === 'settings') {
      return <ManagerSettings onNavigate={setActiveNav} />
    }

    if (activeNav === 'dashboard') {
      // Generate narrative summary based on real data
      const statsData = dashboardData?.stats || {}
      const newResidents = dashboardData?.newResidents || []

      const getNarrativeSummary = () => {
        const parts = []
        if (statsData.packagesPending > 0) parts.push('packages')
        if (statsData.unreadMessages > 0) parts.push('messages')
        if (statsData.postsToday > 0) parts.push('new posts')

        if (parts.length === 0) {
          return "A quiet morning. Check back for new activity."
        } else if (parts.length === 1) {
          return `You have ${parts[0]} to review.`
        } else {
          return `You have ${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]} to review.`
        }
      }

      // Transform activity to impact-based copy
      const getImpactActivityText = (item) => {
        switch (item.type) {
          case 'community_post':
            if (item.text.includes('You') || item.text.includes('posted')) {
              return item.text.replace('posted in Community', 'shared with the community')
            }
            return item.text
          case 'resident_joined':
            return `${item.text.split(' joined')[0]} joined your building`
          case 'package':
            return item.text
          case 'event_created':
            return `New event "${item.text.replace('New event: ', '')}" is live`
          case 'event_rsvp':
            return item.text
          default:
            return item.text
        }
      }

      return (
        <div className="dashboard-home-v2">
          {/* Two Column Layout - Cards float below BmPageHeader */}
          <div className="dashboard-columns">
            {/* LEFT COLUMN - Primary Narrative */}
            <div className="dashboard-column-left">
              {/* Today at Building Card */}
              <div className="narrative-card today-card-v2" data-tour="dashboard-overview">
                <h2 className="card-title-v2">Today at {building.name}</h2>
                <p className="narrative-summary">{getNarrativeSummary()}</p>
                <div className="status-pills">
                  <button
                    className={`status-pill ${statsData.packagesPending > 0 ? 'has-items' : 'all-clear'}`}
                    onClick={() => setActiveNav('packages')}
                  >
                    <Package size={14} />
                    <span>{statsData.packagesPending > 0 ? `${statsData.packagesPending} pending` : 'All on time'}</span>
                  </button>
                  <button
                    className={`status-pill ${statsData.postsToday > 0 ? 'has-items' : 'all-clear'}`}
                    onClick={() => setActiveNav('community')}
                  >
                    <MessageSquare size={14} />
                    <span>{statsData.postsToday > 0 ? `${statsData.postsToday} today` : 'Quiet so far'}</span>
                  </button>
                  <button
                    className={`status-pill ${statsData.unreadMessages > 0 ? 'needs-attention' : 'all-clear'}`}
                    onClick={() => setActiveNav('messages')}
                  >
                    <Mail size={14} />
                    <span>{statsData.unreadMessages > 0 ? `${statsData.unreadMessages} unread` : 'All caught up'}</span>
                  </button>
                </div>
              </div>

              {/* Welcome New Residents Tile */}
              {newResidents.length > 0 && (
                <button className="narrative-card welcome-card-v2" onClick={() => setActiveNav('residents')}>
                  <div className="welcome-content">
                    <div className="welcome-icon">
                      <UserPlus size={20} />
                    </div>
                    <div className="welcome-text">
                      <span className="welcome-headline">
                        Welcome {newResidents.slice(0, 2).map(r => r.name.split(' ')[0]).join(' & ')}
                        {newResidents.length > 2 ? ` +${newResidents.length - 2} more` : ''}!
                      </span>
                      <span className="welcome-subtext">
                        {newResidents.length} new {newResidents.length === 1 ? 'resident' : 'residents'} joined this week
                      </span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="welcome-arrow" />
                </button>
              )}

              {/* Activity Moments */}
              <div className="narrative-card activity-card-v2">
                <div className="card-header-v2">
                  <h3 className="card-title-v2">Activity Moments</h3>
                  <button className="view-all-link" onClick={() => setShowActivityModal(true)}>
                    View all
                  </button>
                </div>
                <div className="activity-list-v2">
                  {recentActivity.length > 0 ? (
                    recentActivity.slice(0, 5).map(item => (
                      <div
                        key={item.id}
                        className="activity-item-v2"
                        onClick={() => handleActivityClick(item)}
                      >
                        <div className={`activity-avatar activity-${item.color}`}>
                          <item.icon size={14} />
                        </div>
                        <div className="activity-content-v2">
                          <span className="activity-text-v2">{getImpactActivityText(item)}</span>
                          <span className="activity-time-v2">{item.time}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="activity-empty-v2">
                      <Bell size={20} />
                      <p>No recent activity</p>
                      <span>Activity from your building will appear here</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN - Controls + Summary */}
            <div className="dashboard-column-right">
              {/* Quick Actions Card */}
              <div className="narrative-card actions-card-v2">
                <h3 className="card-title-v2">Quick Actions</h3>
                <div className="quick-actions-v2" data-tour="quick-actions">
                  {quickActions.map(action => (
                    <button
                      key={action.id}
                      className="quick-action-v2"
                      onClick={() => handleQuickAction(action.id)}
                    >
                      <div className="action-icon-v2">
                        <action.icon size={18} />
                      </div>
                      <span className="action-label-v2">{action.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Building Snapshot Card */}
              <div className="narrative-card snapshot-card">
                <h3 className="card-title-v2">Building Snapshot</h3>
                <div className="snapshot-rows">
                  <button className="snapshot-row" onClick={() => setActiveNav('residents')}>
                    <div className="snapshot-info">
                      <Users size={16} />
                      <span className="snapshot-label">{statsData.residentsJoined || 0} neighbors joined</span>
                    </div>
                    <span className="snapshot-stat">{statsData.engagementRate || 0}% engaged</span>
                  </button>
                  <button className="snapshot-row" onClick={() => setActiveNav('packages')}>
                    <div className="snapshot-info">
                      <Package size={16} />
                      <span className="snapshot-label">{statsData.packagesPending || 0} packages pending</span>
                    </div>
                    <span className={`snapshot-stat ${statsData.packagesOverdue > 0 ? 'warning' : ''}`}>
                      {statsData.packagesOverdue > 0 ? `${statsData.packagesOverdue} overdue` : 'All on time'}
                    </span>
                  </button>
                  <button className="snapshot-row" onClick={() => setActiveNav('calendar')}>
                    <div className="snapshot-info">
                      <Calendar size={16} />
                      <span className="snapshot-label">{statsData.eventsThisWeek || 0} events this week</span>
                    </div>
                    <span className="snapshot-stat">
                      {statsData.nextEvent ? statsData.nextEvent : 'No upcoming'}
                    </span>
                  </button>
                  <button className="snapshot-row" onClick={() => setActiveNav('messages')}>
                    <div className="snapshot-info">
                      <MessageSquare size={16} />
                      <span className="snapshot-label">{statsData.unreadMessages || 0} messages</span>
                    </div>
                    <span className={`snapshot-stat ${statsData.unreadMessages > 0 ? 'needs-attention' : ''}`}>
                      {statsData.unreadMessages > 0 ? 'Needs attention' : 'All caught up'}
                    </span>
                  </button>
                </div>
              </div>

              {/* Coming Up This Week */}
              {upcomingEvents.length > 0 && (
                <div className="narrative-card events-card-v2">
                  <div className="card-header-v2">
                    <h3 className="card-title-v2">Coming Up</h3>
                    <button className="view-all-link" onClick={() => setActiveNav('calendar')}>
                      View calendar
                    </button>
                  </div>
                  <div className="events-list-v2">
                    {upcomingEvents.slice(0, 3).map(event => (
                      <div
                        key={event.id}
                        className="event-item-v2"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className="event-date-v2">
                          <span className="event-day-v2">{event.date.split(',')[0].slice(0, 3)}</span>
                        </div>
                        <div className="event-details-v2">
                          <span className="event-title-v2">{event.title}</span>
                          <span className="event-meta-v2">{event.time} • {event.location}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
      {/* Full-screen loading splash — covers sidebar, header, everything */}
      {!initialLoadDone && (
        <LoadingSplash theme="warm" message="Loading your dashboard..." fadeOut={splashFading} />
      )}

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
                data-tour={`nav-${item.id}`}
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
              {userProfile?.avatar_signed_url ? (
                <img src={userProfile.avatar_signed_url} alt="" className="manager-avatar-img" />
              ) : (
                building.manager.name.split(' ').map(n => n[0]).join('')
              )}
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
        {/* Page Header - Consistent across ALL pages */}
        <BmPageHeader
          title={getPageHeaderInfo().title}
          subtitle={getPageHeaderInfo().subtitle}
          backgroundUrl={buildingBgUrl}
        />

        {/* Top Bar - Notifications only, overlays on header */}
        <div className="top-bar top-bar-minimal">
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
      <PackageModal
        isOpen={showPackageModal}
        onClose={() => setShowPackageModal(false)}
        onSuccess={handlePackageSuccess}
        userProfile={userProfile}
        isInDemoMode={isDemoMode}
      />

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

      {/* Floating Feedback Button */}
      <button
        className="feedback-fab"
        onClick={() => setShowFeedbackModal(true)}
        aria-label="Send feedback"
      >
        ?
      </button>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        userProfile={userProfile}
        buildingId={building?.id}
        buildingName={building?.name}
        isDemoMode={isDemoMode}
        pageContext={`manager_${activeNav}`}
      />

      {/* Demo Tour */}
      {isDemoMode && <DemoTour role="manager" />}
    </div>
  )
}

export default ManagerDashboard
