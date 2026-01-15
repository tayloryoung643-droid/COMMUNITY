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
  Wine
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

function ManagerDashboard({ onLogout, buildingData }) {
  const [activeNav, setActiveNav] = useState('dashboard')
  const [sidebarOpen, setSidebarOpen] = useState(false)

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

  // Stats data
  const stats = [
    {
      label: 'Residents Joined',
      value: '34/50',
      subtitle: '68% onboarded',
      icon: Users,
      color: 'blue'
    },
    {
      label: 'Packages Pending',
      value: '12',
      subtitle: '3 over 48hrs',
      icon: Package,
      color: 'yellow'
    },
    {
      label: 'Events This Week',
      value: '3',
      subtitle: 'Next: Wine Social',
      icon: Calendar,
      color: 'purple'
    },
    {
      label: 'Unread Messages',
      value: '2',
      subtitle: '1 new today',
      icon: MessageSquare,
      color: 'cyan'
    }
  ]

  // Recent activity
  const recentActivity = [
    {
      id: 1,
      text: 'Sarah from 1201 joined the app',
      time: '2 min ago',
      icon: UserPlus,
      color: 'green'
    },
    {
      id: 2,
      text: 'New package logged for Unit 805',
      time: '15 min ago',
      icon: Package,
      color: 'blue'
    },
    {
      id: 3,
      text: 'Message from Unit 402',
      time: '1 hour ago',
      icon: Mail,
      color: 'purple'
    },
    {
      id: 4,
      text: '5 RSVPs for Wine & Cheese Social',
      time: '2 hours ago',
      icon: Wine,
      color: 'pink'
    },
    {
      id: 5,
      text: 'Maintenance request resolved - Unit 1102',
      time: '3 hours ago',
      icon: CheckCircle,
      color: 'green'
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
      date: 'Friday, Jan 12',
      time: '7:00 PM',
      location: 'Rooftop Lounge',
      rsvps: 18
    },
    {
      id: 2,
      title: 'Building Maintenance',
      date: 'Saturday, Jan 13',
      time: '9:00 AM - 12:00 PM',
      location: 'All Common Areas',
      type: 'maintenance'
    },
    {
      id: 3,
      title: 'Yoga in the Park',
      date: 'Sunday, Jan 14',
      time: '10:00 AM',
      location: 'Courtyard',
      rsvps: 8
    }
  ]

  // Handle nav click
  const handleNavClick = (itemId) => {
    setActiveNav(itemId)
    setSidebarOpen(false)
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

    if (activeNav === 'dashboard') {
      return (
        <div className="dashboard-home">
          {/* Stats Row */}
          <div className="stats-row">
            {stats.map((stat, index) => (
              <div key={index} className={`stat-card stat-${stat.color}`}>
                <div className="stat-icon">
                  <stat.icon size={20} />
                </div>
                <div className="stat-content">
                  <span className="stat-value">{stat.value}</span>
                  <span className="stat-label">{stat.label}</span>
                  <span className="stat-subtitle">{stat.subtitle}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="dashboard-grid">
            {/* Recent Activity */}
            <div className="dashboard-card activity-card">
              <div className="card-header">
                <h3>Recent Activity</h3>
                <button className="view-all-btn">View all</button>
              </div>
              <div className="activity-list">
                {recentActivity.map(item => (
                  <div key={item.id} className="activity-item">
                    <div className={`activity-icon activity-${item.color}`}>
                      <item.icon size={16} />
                    </div>
                    <div className="activity-content">
                      <span className="activity-text">{item.text}</span>
                      <span className="activity-time">{item.time}</span>
                    </div>
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
                  <button key={action.id} className="quick-action-btn">
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
                <button className="view-all-btn">View calendar</button>
              </div>
              <div className="events-list">
                {upcomingEvents.map(event => (
                  <div key={event.id} className={`event-item ${event.type === 'maintenance' ? 'maintenance' : ''}`}>
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
        <button className="notification-btn mobile">
          <Bell size={20} />
          <span className="notification-badge">3</span>
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
            <button className="notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="page-content">
          {renderContent()}
        </div>
      </main>
    </div>
  )
}

export default ManagerDashboard
