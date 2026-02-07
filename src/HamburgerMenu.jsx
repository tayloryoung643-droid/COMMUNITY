import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Menu, X, Bell, Home as HomeIcon, MessageSquare, MessageCircle, Calendar, Package, Building2, Settings, LogOut, ChevronRight, Wrench, Users, Wine, ClipboardList, CalendarClock, HelpCircle } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import FeedbackModal from './components/FeedbackModal'
import './HamburgerMenu.css'

// Demo notifications
const DEMO_NOTIFICATIONS = [
  {
    id: 1,
    type: 'package',
    title: 'Package Delivered',
    message: 'Your Amazon package has arrived at the front desk',
    time: '10 min ago',
    unread: true,
    icon: Package
  },
  {
    id: 2,
    type: 'event',
    title: 'Event Reminder',
    message: 'Wine & Cheese Social starts in 2 hours',
    time: '1 hour ago',
    unread: true,
    icon: Wine
  },
  {
    id: 3,
    type: 'maintenance',
    title: 'Maintenance Notice',
    message: 'Water shut-off scheduled for tomorrow 9am-12pm',
    time: '3 hours ago',
    unread: false,
    icon: Wrench
  },
  {
    id: 4,
    type: 'community',
    title: 'New Neighbor',
    message: 'Emily Chen just moved into Unit 1205',
    time: 'Yesterday',
    unread: false,
    icon: Users
  }
]

function HamburgerMenu({ onNavigate, unreadMessages = 0, currentScreen = 'home' }) {
  const { userProfile, isDemoMode } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  useEffect(() => {
    if (isDemoMode) {
      console.log('[HamburgerMenu] MODE: DEMO - showing demo notifications')
    } else {
      console.log('[HamburgerMenu] MODE: REAL - no notifications (empty)')
    }
  }, [isDemoMode])

  // Notifications: demo data for demo mode, empty for real users
  const notifications = isDemoMode ? DEMO_NOTIFICATIONS : []

  const unreadCount = notifications.filter(n => n.unread).length

  const handleMenuItemClick = (destination) => {
    setMenuOpen(false)
    setNotificationsOpen(false)
    if (onNavigate) {
      onNavigate(destination)
    }
  }

  const handleNotificationClick = (notification) => {
    setNotificationsOpen(false)
    // Navigate based on notification type
    if (notification.type === 'package') {
      onNavigate && onNavigate('Packages')
    } else if (notification.type === 'event') {
      onNavigate && onNavigate('Calendar')
    } else if (notification.type === 'community') {
      onNavigate && onNavigate('Community')
    }
  }

  // Map screen names to menu item identifiers
  const getActiveItem = () => {
    const screenMap = {
      'home': 'Home',
      'community': 'Community',
      'calendar': 'Calendar',
      'packages': 'Packages',
      'building': 'Building',
      'messages': 'Messages',
      'settings': 'Settings'
    }
    return screenMap[currentScreen] || ''
  }

  const activeItem = getActiveItem()

  // Notifications Panel - rendered via portal to document.body
  const notificationsPanel = notificationsOpen && createPortal(
    <div className="global-notifications-overlay" onClick={() => setNotificationsOpen(false)}>
      <div className="global-notifications-panel" onClick={e => e.stopPropagation()}>
        <div className="global-notifications-header">
          <span className="global-notifications-title">Notifications</span>
          <button
            className="global-notifications-close-btn"
            onClick={() => setNotificationsOpen(false)}
            aria-label="Close notifications"
          >
            <X size={20} />
          </button>
        </div>

        <div className="global-notifications-list">
          {notifications.length === 0 ? (
            <div className="global-notifications-empty">
              <Bell size={32} />
              <p>No notifications</p>
            </div>
          ) : (
            notifications.map(notification => {
              const IconComponent = notification.icon
              return (
                <button
                  key={notification.id}
                  className={`global-notification-item ${notification.unread ? 'unread' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className={`global-notification-icon ${notification.type}`}>
                    <IconComponent size={18} />
                  </div>
                  <div className="global-notification-content">
                    <span className="global-notification-item-title">{notification.title}</span>
                    <span className="global-notification-message">{notification.message}</span>
                    <span className="global-notification-time">{notification.time}</span>
                  </div>
                  {notification.unread && <div className="global-notification-dot" />}
                </button>
              )
            })
          )}
        </div>

        <button className="global-notifications-view-all" onClick={() => handleMenuItemClick('Messages')}>
          View All Messages
        </button>
      </div>
    </div>,
    document.body
  )

  // Menu Overlay - rendered via portal to document.body
  const menuOverlay = menuOpen && createPortal(
    <div className="global-menu-overlay" onClick={() => setMenuOpen(false)} />,
    document.body
  )

  // Menu Panel - rendered via portal to document.body
  const menuPanel = menuOpen && createPortal(
    <div className="global-menu-panel" onClick={e => e.stopPropagation()}>
      {/* Profile Header Row */}
      <button className="global-menu-profile" onClick={() => handleMenuItemClick('Settings')}>
        <div className="global-menu-profile-avatar">
          {isDemoMode ? (
            <img src="/images/profile-taylor.jpg" alt="Profile" />
          ) : userProfile?.avatar_signed_url ? (
            <img src={userProfile.avatar_signed_url} alt="Profile" style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              borderRadius: '50%'
            }} />
          ) : (
            <div style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
              color: 'white',
              fontSize: '18px',
              fontWeight: '600',
              borderRadius: '50%'
            }}>
              {(userProfile?.full_name || 'U').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="global-menu-profile-info">
          <span className="global-menu-profile-building">
            {isDemoMode ? 'The Paramount' : (userProfile?.buildings?.name || 'Your Building')}
          </span>
          <span className="global-menu-profile-user">
            {isDemoMode
              ? 'Jonathan Sterling · Apt. 406'
              : `${userProfile?.full_name || 'Resident'}${userProfile?.unit_number ? ` · Apt. ${userProfile.unit_number}` : ''}`
            }
          </span>
        </div>
        <ChevronRight size={20} className="global-menu-profile-chevron" />
      </button>

      {/* Navigation Items */}
      <nav className="global-menu-nav">
        <button
          className={`global-menu-item ${activeItem === 'Home' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('Home')}
        >
          <HomeIcon size={22} />
          <span>Home</span>
        </button>
        <button
          className={`global-menu-item ${activeItem === 'Community' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('Community')}
        >
          <MessageSquare size={22} />
          <span>Community</span>
        </button>
        <button
          className={`global-menu-item ${activeItem === 'Messages' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('messages')}
        >
          <MessageCircle size={22} />
          <span>Messages</span>
        </button>
        <button
          className={`global-menu-item ${activeItem === 'Calendar' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('Calendar')}
        >
          <Calendar size={22} />
          <span>Calendar</span>
        </button>
        <button
          className={`global-menu-item ${activeItem === 'Packages' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('Packages')}
        >
          <Package size={22} />
          <span>Packages</span>
        </button>
        <button
          className="global-menu-item"
          onClick={() => handleMenuItemClick('Bulletin Board')}
        >
          <ClipboardList size={22} />
          <span>Bulletin Board</span>
        </button>
        <button
          className={`global-menu-item ${activeItem === 'Building' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('Building')}
        >
          <Building2 size={22} />
          <span>Building</span>
        </button>
        <button
          className="global-menu-item"
          onClick={() => handleMenuItemClick('Elevator Booking')}
        >
          <CalendarClock size={22} />
          <span>Book Elevator</span>
        </button>
        <button
          className="global-menu-item"
          onClick={() => { setMenuOpen(false); setShowFeedbackModal(true) }}
        >
          <HelpCircle size={22} />
          <span>Help & Feedback</span>
        </button>
        <button
          className={`global-menu-item ${activeItem === 'Settings' ? 'active' : ''}`}
          onClick={() => handleMenuItemClick('Settings')}
        >
          <Settings size={22} />
          <span>Settings</span>
        </button>
        <button
          className="global-menu-item global-menu-item-logout"
          onClick={() => handleMenuItemClick('Logout')}
        >
          <LogOut size={22} />
          <span>Log out</span>
        </button>
      </nav>
    </div>,
    document.body
  )

  return (
    <>
      {/* Hamburger Button - positioned in hero top-left */}
      <button
        className="global-hamburger-btn"
        onClick={() => { setMenuOpen(true); setNotificationsOpen(false); }}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

      {/* Notification Button - positioned in hero top-right */}
      <button
        className="global-notification-btn"
        onClick={() => { setNotificationsOpen(!notificationsOpen); setMenuOpen(false); }}
        aria-label="Notifications"
      >
        <Bell size={22} />
        {unreadCount > 0 && (
          <span className="global-notification-badge">{unreadCount}</span>
        )}
      </button>

      {/* Panels rendered via portals to document.body */}
      {notificationsPanel}
      {menuOverlay}
      {menuPanel}

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        userProfile={userProfile}
        buildingName={userProfile?.buildings?.name || userProfile?.building_name}
        isDemoMode={isDemoMode}
        pageContext="hamburger_menu"
      />
    </>
  )
}

export default HamburgerMenu
