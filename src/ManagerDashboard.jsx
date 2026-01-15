import { useState } from 'react'
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
  Trash2
} from 'lucide-react'
import './ManagerDashboard.css'
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

function ManagerDashboard({ onLogout, buildingData }) {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    priority: 'normal',
    sendPush: true
  })

  const [packageForm, setPackageForm] = useState({
    unit: '',
    residentName: '',
    carrier: 'USPS',
    trackingNumber: '',
    description: '',
    size: 'medium'
  })

  const [eventForm, setEventForm] = useState({
    title: '',
    date: '',
    startTime: '',
    endTime: '',
    location: '',
    description: '',
    type: 'social',
    maxAttendees: ''
  })

  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    unit: '',
    phone: ''
  })

  // Notifications state
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'message', title: 'New message from Sarah Mitchell', subtitle: 'Unit 1201', time: '2 min ago', unread: true, icon: MessageSquare },
    { id: 2, type: 'package', title: 'Package logged for Unit 805', subtitle: 'Amazon - Large box', time: '15 min ago', unread: true, icon: Package },
    { id: 3, type: 'elevator', title: 'Alex Rivera requested elevator booking', subtitle: 'Moving out - Jan 20', time: '1 hour ago', unread: true, icon: ArrowUpDown },
    { id: 4, type: 'event', title: '5 new RSVPs for Wine & Cheese Social', subtitle: 'Total: 18 attendees', time: '2 hours ago', unread: false, icon: Wine },
    { id: 5, type: 'maintenance', title: 'Maintenance request from Unit 402', subtitle: 'Plumbing issue', time: '3 hours ago', unread: false, icon: Wrench },
    { id: 6, type: 'resident', title: 'New resident joined', subtitle: 'Sarah from Unit 1201', time: '4 hours ago', unread: false, icon: UserPlus }
  ])

  // Demo building data
  const building = buildingData || {
    name: 'The Paramount',
    code: 'PARA123',
    manager: {
      name: 'Taylor Young',
      email: 'taylor@paramount.com'
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

  // Stats data with navigation targets
  const stats = [
    {
      id: 'residents',
      label: 'Residents Joined',
      value: '34/50',
      subtitle: '68% onboarded',
      icon: Users,
      color: 'blue',
      navTarget: 'residents'
    },
    {
      id: 'packages',
      label: 'Packages Pending',
      value: '12',
      subtitle: '3 over 48hrs',
      icon: Package,
      color: 'yellow',
      navTarget: 'packages'
    },
    {
      id: 'events',
      label: 'Events This Week',
      value: '3',
      subtitle: 'Next: Wine Social',
      icon: Calendar,
      color: 'purple',
      navTarget: 'calendar'
    },
    {
      id: 'messages',
      label: 'Unread Messages',
      value: '2',
      subtitle: '1 new today',
      icon: MessageSquare,
      color: 'cyan',
      navTarget: 'messages'
    }
  ]

  // Recent activity with navigation
  const recentActivity = [
    {
      id: 1,
      text: 'Sarah from 1201 joined the app',
      time: '2 min ago',
      icon: UserPlus,
      color: 'green',
      navTarget: 'residents',
      detail: 'Sarah Mitchell - Unit 1201'
    },
    {
      id: 2,
      text: 'New package logged for Unit 805',
      time: '15 min ago',
      icon: Package,
      color: 'blue',
      navTarget: 'packages',
      detail: 'Amazon package - Michael Chen'
    },
    {
      id: 3,
      text: 'Message from Unit 402',
      time: '1 hour ago',
      icon: Mail,
      color: 'purple',
      navTarget: 'messages',
      detail: 'Question about parking permit'
    },
    {
      id: 4,
      text: '5 RSVPs for Wine & Cheese Social',
      time: '2 hours ago',
      icon: Wine,
      color: 'pink',
      navTarget: 'calendar',
      detail: 'Total 18 attendees'
    },
    {
      id: 5,
      text: 'Maintenance request resolved - Unit 1102',
      time: '3 hours ago',
      icon: CheckCircle,
      color: 'green',
      navTarget: 'messages',
      detail: 'Plumbing issue fixed'
    }
  ]

  // All activity (for expanded view)
  const allActivity = [
    ...recentActivity,
    {
      id: 6,
      text: 'Elevator booking approved - Unit 905',
      time: '4 hours ago',
      icon: ArrowUpDown,
      color: 'cyan',
      navTarget: 'elevator',
      detail: 'Moving scheduled for Jan 18'
    },
    {
      id: 7,
      text: 'New bulletin listing posted',
      time: '5 hours ago',
      icon: ClipboardList,
      color: 'yellow',
      navTarget: 'bulletin',
      detail: 'Vintage couch for sale - $200'
    },
    {
      id: 8,
      text: 'FAQ updated - Parking section',
      time: '6 hours ago',
      icon: HelpCircle,
      color: 'purple',
      navTarget: 'faq',
      detail: 'Added guest parking info'
    },
    {
      id: 9,
      text: 'John from 503 updated profile',
      time: '7 hours ago',
      icon: User,
      color: 'blue',
      navTarget: 'residents',
      detail: 'Added emergency contact'
    },
    {
      id: 10,
      text: 'Community post liked by 12 residents',
      time: '8 hours ago',
      icon: Users,
      color: 'pink',
      navTarget: 'community',
      detail: 'Rooftop party photos'
    }
  ]

  // Quick actions
  const quickActions = [
    { id: 'announcement', label: 'Post Announcement', icon: Megaphone },
    { id: 'package', label: 'Log Package', icon: Package },
    { id: 'event', label: 'Create Event', icon: PartyPopper },
    { id: 'invite', label: 'Invite Resident', icon: UserPlus }
  ]

  // Upcoming events
  const upcomingEvents = [
    {
      id: 1,
      title: 'Wine & Cheese Social',
      date: 'Friday, Jan 17',
      time: '7:00 PM',
      location: 'Rooftop Lounge',
      rsvps: 18
    },
    {
      id: 2,
      title: 'Building Maintenance',
      date: 'Saturday, Jan 18',
      time: '9:00 AM - 12:00 PM',
      location: 'All Common Areas',
      type: 'maintenance'
    },
    {
      id: 3,
      title: 'Yoga in the Park',
      date: 'Sunday, Jan 19',
      time: '10:00 AM',
      location: 'Courtyard',
      rsvps: 8
    }
  ]

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

  // Handle announcement submit
  const handleAnnouncementSubmit = () => {
    setShowAnnouncementModal(false)
    setAnnouncementForm({ title: '', content: '', priority: 'normal', sendPush: true })
    showToastMessage('Announcement posted successfully!')
  }

  // Handle package submit
  const handlePackageSubmit = () => {
    setShowPackageModal(false)
    setPackageForm({ unit: '', residentName: '', carrier: 'USPS', trackingNumber: '', description: '', size: 'medium' })
    showToastMessage('Package logged successfully!')
  }

  // Handle event submit
  const handleEventSubmit = () => {
    setShowEventModal(false)
    setEventForm({ title: '', date: '', startTime: '', endTime: '', location: '', description: '', type: 'social', maxAttendees: '' })
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
                {recentActivity.map(item => (
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
                ))}
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
      {showAnnouncementModal && (
        <div className="modal-overlay" onClick={() => setShowAnnouncementModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Post Announcement</h3>
              <button className="modal-close" onClick={() => setShowAnnouncementModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Title *</label>
                <input
                  type="text"
                  placeholder="Announcement title..."
                  value={announcementForm.title}
                  onChange={e => setAnnouncementForm({...announcementForm, title: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Message *</label>
                <textarea
                  placeholder="Write your announcement..."
                  value={announcementForm.content}
                  onChange={e => setAnnouncementForm({...announcementForm, content: e.target.value})}
                  rows={5}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Priority</label>
                  <select
                    value={announcementForm.priority}
                    onChange={e => setAnnouncementForm({...announcementForm, priority: e.target.value})}
                  >
                    <option value="normal">Normal</option>
                    <option value="important">Important</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={announcementForm.sendPush}
                      onChange={e => setAnnouncementForm({...announcementForm, sendPush: e.target.checked})}
                    />
                    <span>Send push notification</span>
                  </label>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAnnouncementModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAnnouncementSubmit}
                disabled={!announcementForm.title || !announcementForm.content}
              >
                <Send size={18} />
                Post Announcement
              </button>
            </div>
          </div>
        </div>
      )}

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
      {showEventModal && (
        <div className="modal-overlay" onClick={() => setShowEventModal(false)}>
          <div className="modal-content large-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create Event</h3>
              <button className="modal-close" onClick={() => setShowEventModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Event Title *</label>
                <input
                  type="text"
                  placeholder="Event name..."
                  value={eventForm.title}
                  onChange={e => setEventForm({...eventForm, title: e.target.value})}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date *</label>
                  <input
                    type="date"
                    value={eventForm.date}
                    onChange={e => setEventForm({...eventForm, date: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>Start Time *</label>
                  <input
                    type="time"
                    value={eventForm.startTime}
                    onChange={e => setEventForm({...eventForm, startTime: e.target.value})}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={eventForm.endTime}
                    onChange={e => setEventForm({...eventForm, endTime: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Location *</label>
                  <div className="input-with-icon">
                    <MapPin size={16} />
                    <input
                      type="text"
                      placeholder="Event location"
                      value={eventForm.location}
                      onChange={e => setEventForm({...eventForm, location: e.target.value})}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label>Event Type</label>
                  <select
                    value={eventForm.type}
                    onChange={e => setEventForm({...eventForm, type: e.target.value})}
                  >
                    <option value="social">Social Event</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="meeting">Meeting</option>
                    <option value="class">Class/Workshop</option>
                    <option value="holiday">Holiday</option>
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  placeholder="Event details..."
                  value={eventForm.description}
                  onChange={e => setEventForm({...eventForm, description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Max Attendees (leave blank for unlimited)</label>
                <input
                  type="number"
                  placeholder="Optional limit"
                  value={eventForm.maxAttendees}
                  onChange={e => setEventForm({...eventForm, maxAttendees: e.target.value})}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEventModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleEventSubmit}
                disabled={!eventForm.title || !eventForm.date || !eventForm.startTime || !eventForm.location}
              >
                <PartyPopper size={18} />
                Create Event
              </button>
            </div>
          </div>
        </div>
      )}

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
