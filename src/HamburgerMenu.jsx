import { useState } from 'react'
import { Menu, X, Bell, Home as HomeIcon, MessageSquare, Mail, Calendar, Package, Building2, Settings, LogOut, Wrench, Users, Wine } from 'lucide-react'
import './HamburgerMenu.css'

function HamburgerMenu({ onNavigate, unreadMessages = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  // Sample notifications data
  const notifications = [
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

      {/* Notifications Panel */}
      {notificationsOpen && (
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
        </div>
      )}

      {/* Menu Overlay and Panel */}
      <div className={`global-menu-overlay ${menuOpen ? 'menu-open' : ''}`} onClick={() => setMenuOpen(false)}>
        <div className={`global-menu-panel ${menuOpen ? 'menu-open' : ''}`} onClick={e => e.stopPropagation()}>
          <div className="global-menu-header">
            <span className="global-menu-title">The Paramount</span>
            <button
              className="global-menu-close-btn"
              onClick={() => setMenuOpen(false)}
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
          </div>

          {/* User Avatar */}
          <div className="global-menu-user">
            <div className="global-menu-avatar">
              <img
                src="/images/profile-taylor.jpg"
                alt="Taylor"
              />
            </div>
          </div>

          <nav className="global-menu-nav">
            <button className="global-menu-item" onClick={() => handleMenuItemClick('Home')}>
              <HomeIcon size={20} />
              <span>Home</span>
            </button>
            <button className="global-menu-item" onClick={() => handleMenuItemClick('Community')}>
              <MessageSquare size={20} />
              <span>Community</span>
            </button>
            <button className="global-menu-item" onClick={() => handleMenuItemClick('Messages')}>
              <Mail size={20} />
              <span>Messages</span>
              {unreadMessages > 0 && (
                <span className="global-menu-badge">{unreadMessages}</span>
              )}
            </button>
            <button className="global-menu-item" onClick={() => handleMenuItemClick('Calendar')}>
              <Calendar size={20} />
              <span>Calendar</span>
            </button>
            <button className="global-menu-item" onClick={() => handleMenuItemClick('Packages')}>
              <Package size={20} />
              <span>Packages</span>
            </button>
            <button className="global-menu-item" onClick={() => handleMenuItemClick('Building')}>
              <Building2 size={20} />
              <span>Building</span>
            </button>
            <button className="global-menu-item" onClick={() => handleMenuItemClick('Settings')}>
              <Settings size={20} />
              <span>Settings</span>
            </button>
            <button className="global-menu-item global-menu-item-logout" onClick={() => handleMenuItemClick('Logout')}>
              <LogOut size={20} />
              <span>Log out</span>
            </button>
          </nav>
        </div>
      </div>
    </>
  )
}

export default HamburgerMenu
