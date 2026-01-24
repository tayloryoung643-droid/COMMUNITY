import { Home as HomeIcon, Calendar, MessageSquare, Building2 } from 'lucide-react'
import './BottomNav.css'

function BottomNav({ currentScreen, onNavigate }) {
  const isActive = (screen) => {
    if (screen === 'home') return currentScreen === 'home'
    if (screen === 'calendar') return currentScreen === 'calendar' || currentScreen === 'events'
    if (screen === 'community') return currentScreen === 'community'
    if (screen === 'building') return currentScreen === 'building' || currentScreen === 'settings' || currentScreen === 'building-info'
    return false
  }

  return (
    <nav className="global-bottom-nav">
      <button
        className={`nav-tab ${isActive('home') ? 'active' : ''}`}
        onClick={() => onNavigate('Home')}
      >
        <HomeIcon size={22} />
        <span>Home</span>
      </button>
      <button
        className={`nav-tab ${isActive('calendar') ? 'active' : ''}`}
        onClick={() => onNavigate('Calendar')}
      >
        <Calendar size={22} />
        <span>Events</span>
      </button>
      <button
        className={`nav-tab ${isActive('community') ? 'active' : ''}`}
        onClick={() => onNavigate('Community')}
      >
        <MessageSquare size={22} />
        <span>Community</span>
      </button>
      <button
        className={`nav-tab ${isActive('building') ? 'active' : ''}`}
        onClick={() => onNavigate('Building')}
      >
        <Building2 size={22} />
        <span>Building</span>
      </button>
    </nav>
  )
}

export default BottomNav
