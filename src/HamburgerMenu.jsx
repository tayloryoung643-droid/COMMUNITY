import { useState } from 'react'
import { Menu, X, Home as HomeIcon, MessageSquare, Mail, Calendar, Package, Building2, Settings, LogOut } from 'lucide-react'
import './HamburgerMenu.css'

function HamburgerMenu({ onNavigate, unreadMessages = 0 }) {
  const [menuOpen, setMenuOpen] = useState(false)

  const handleMenuItemClick = (destination) => {
    setMenuOpen(false)
    if (onNavigate) {
      onNavigate(destination)
    }
  }

  return (
    <>
      {/* Hamburger Button - positioned in hero top-left */}
      <button
        className="global-hamburger-btn"
        onClick={() => setMenuOpen(true)}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>

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
