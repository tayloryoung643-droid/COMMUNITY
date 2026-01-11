import { useState } from 'react'
import { ArrowLeft, Camera, User, Home, Calendar, FileText, Eye, EyeOff, Hand, Bell, Mail, Package, PartyPopper, MessageSquare, LogOut, ChevronRight, AlertTriangle, Phone, HelpCircle } from 'lucide-react'
import './Settings.css'

function Settings({ onBack, onLogout, onNavigate }) {
  // Profile state
  const [profile, setProfile] = useState({
    displayName: 'Taylor Young',
    unit: '1201',
    floor: '12',
    moveInDate: 'March 2023',
    bio: 'Coffee enthusiast, dog lover, and weekend hiker. Always happy to chat in the elevator!',
    showInDirectory: true
  })

  // Privacy state
  const [privacy, setPrivacy] = useState({
    showUnitOnListings: true,
    allowWaves: true
  })

  // Notifications state
  const [notifications, setNotifications] = useState({
    announcements: true,
    packages: true,
    events: false,
    messages: true
  })

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handlePrivacyChange = (field) => {
    setPrivacy(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleNotificationChange = (field) => {
    setNotifications(prev => ({ ...prev, [field]: !prev[field] }))
  }

  return (
    <div className="settings-container">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <header className="settings-header">
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="page-title-light">Settings</h1>
      </header>

      <main className="settings-content">
        {/* Profile Section */}
        <section className="settings-section">
          <h2 className="section-title">
            <User size={18} />
            <span>Profile</span>
          </h2>

          <div className="settings-card">
            {/* Profile Photo */}
            <div className="profile-photo-section">
              <div className="profile-photo">
                <span className="photo-placeholder">TY</span>
              </div>
              <button className="change-photo-btn">
                <Camera size={16} />
                <span>Change Photo</span>
              </button>
            </div>

            {/* Display Name */}
            <div className="form-group">
              <label>
                <User size={14} />
                Display Name
              </label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => handleProfileChange('displayName', e.target.value)}
                placeholder="Your name"
              />
            </div>

            {/* Unit Number (read-only) */}
            <div className="form-group">
              <label>
                <Home size={14} />
                Unit Number
              </label>
              <div className="readonly-field">Unit {profile.unit}</div>
            </div>

            {/* Floor (read-only) */}
            <div className="form-group">
              <label>
                <Home size={14} />
                Floor
              </label>
              <div className="readonly-field">Floor {profile.floor}</div>
            </div>

            {/* Move-in Date */}
            <div className="form-group">
              <label>
                <Calendar size={14} />
                Move-in Date
              </label>
              <input
                type="text"
                value={profile.moveInDate}
                onChange={(e) => handleProfileChange('moveInDate', e.target.value)}
                placeholder="e.g., March 2023"
              />
            </div>

            {/* Bio */}
            <div className="form-group">
              <label>
                <FileText size={14} />
                Bio
              </label>
              <textarea
                value={profile.bio}
                onChange={(e) => handleProfileChange('bio', e.target.value)}
                placeholder="Tell your neighbors a bit about yourself..."
                rows={3}
              />
            </div>

            {/* Show in Directory Toggle */}
            <div className="toggle-row">
              <div className="toggle-info">
                <Eye size={18} />
                <div className="toggle-text">
                  <span className="toggle-label">Show in Neighbor Directory</span>
                  <span className="toggle-description">Let other residents find you</span>
                </div>
              </div>
              <button
                className={`toggle-switch ${profile.showInDirectory ? 'active' : ''}`}
                onClick={() => handleProfileChange('showInDirectory', !profile.showInDirectory)}
              >
                <span className="toggle-knob"></span>
              </button>
            </div>
          </div>
        </section>

        {/* Privacy Section */}
        <section className="settings-section">
          <h2 className="section-title">
            <EyeOff size={18} />
            <span>Privacy</span>
          </h2>

          <div className="settings-card">
            <div className="toggle-row">
              <div className="toggle-info">
                <Home size={18} />
                <div className="toggle-text">
                  <span className="toggle-label">Show unit on Bulletin Board</span>
                  <span className="toggle-description">Display your unit number on listings</span>
                </div>
              </div>
              <button
                className={`toggle-switch ${privacy.showUnitOnListings ? 'active' : ''}`}
                onClick={() => handlePrivacyChange('showUnitOnListings')}
              >
                <span className="toggle-knob"></span>
              </button>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <Hand size={18} />
                <div className="toggle-text">
                  <span className="toggle-label">Allow neighbors to wave</span>
                  <span className="toggle-description">Receive friendly waves from neighbors</span>
                </div>
              </div>
              <button
                className={`toggle-switch ${privacy.allowWaves ? 'active' : ''}`}
                onClick={() => handlePrivacyChange('allowWaves')}
              >
                <span className="toggle-knob"></span>
              </button>
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="settings-section">
          <h2 className="section-title">
            <Bell size={18} />
            <span>Email Notifications</span>
          </h2>

          <div className="settings-card">
            <div className="toggle-row">
              <div className="toggle-info">
                <Mail size={18} />
                <div className="toggle-text">
                  <span className="toggle-label">Announcements</span>
                  <span className="toggle-description">Building updates and news</span>
                </div>
              </div>
              <button
                className={`toggle-switch ${notifications.announcements ? 'active' : ''}`}
                onClick={() => handleNotificationChange('announcements')}
              >
                <span className="toggle-knob"></span>
              </button>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <Package size={18} />
                <div className="toggle-text">
                  <span className="toggle-label">Package arrivals</span>
                  <span className="toggle-description">When packages arrive for you</span>
                </div>
              </div>
              <button
                className={`toggle-switch ${notifications.packages ? 'active' : ''}`}
                onClick={() => handleNotificationChange('packages')}
              >
                <span className="toggle-knob"></span>
              </button>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <PartyPopper size={18} />
                <div className="toggle-text">
                  <span className="toggle-label">Upcoming events</span>
                  <span className="toggle-description">Reminders for building events</span>
                </div>
              </div>
              <button
                className={`toggle-switch ${notifications.events ? 'active' : ''}`}
                onClick={() => handleNotificationChange('events')}
              >
                <span className="toggle-knob"></span>
              </button>
            </div>

            <div className="toggle-row">
              <div className="toggle-info">
                <MessageSquare size={18} />
                <div className="toggle-text">
                  <span className="toggle-label">Waves & messages</span>
                  <span className="toggle-description">When neighbors interact with you</span>
                </div>
              </div>
              <button
                className={`toggle-switch ${notifications.messages ? 'active' : ''}`}
                onClick={() => handleNotificationChange('messages')}
              >
                <span className="toggle-knob"></span>
              </button>
            </div>
          </div>
        </section>

        {/* Building Info & FAQ Section */}
        <section className="settings-section">
          <h2 className="section-title">
            <HelpCircle size={18} />
            <span>Resources</span>
          </h2>

          <div className="settings-card">
            <button className="settings-link-row" onClick={() => onNavigate && onNavigate('BuildingInfo')}>
              <div className="link-row-info">
                <HelpCircle size={18} />
                <div className="link-row-text">
                  <span className="link-row-label">Building Info & FAQ</span>
                  <span className="link-row-description">Hours, policies, and guidelines</span>
                </div>
              </div>
              <ChevronRight size={18} className="link-row-arrow" />
            </button>
          </div>
        </section>

        {/* Emergency Contacts Section */}
        <section className="settings-section">
          <h2 className="section-title">
            <AlertTriangle size={18} />
            <span>Emergency Contacts</span>
          </h2>

          <div className="settings-card emergency-card">
            <div className="emergency-contact">
              <div className="emergency-info">
                <span className="emergency-label">Building Emergency Line</span>
                <span className="emergency-number">416-555-0911</span>
              </div>
              <a href="tel:4165550911" className="call-btn">
                <Phone size={16} />
              </a>
            </div>

            <div className="emergency-contact">
              <div className="emergency-info">
                <span className="emergency-label">After-hours Maintenance</span>
                <span className="emergency-number">416-555-0199</span>
              </div>
              <a href="tel:4165550199" className="call-btn">
                <Phone size={16} />
              </a>
            </div>

            <div className="emergency-contact">
              <div className="emergency-info">
                <span className="emergency-label">Building Manager</span>
                <span className="emergency-number">416-555-0100</span>
              </div>
              <a href="tel:4165550100" className="call-btn">
                <Phone size={16} />
              </a>
            </div>

            <div className="emergency-contact emergency-911">
              <div className="emergency-info">
                <span className="emergency-label">911 / Fire / Poison Control</span>
                <span className="emergency-number">911</span>
              </div>
              <a href="tel:911" className="call-btn urgent">
                <Phone size={16} />
              </a>
            </div>
          </div>
        </section>

        {/* Account Section */}
        <section className="settings-section">
          <h2 className="section-title">
            <User size={18} />
            <span>Account</span>
          </h2>

          <div className="settings-card">
            <button className="logout-btn" onClick={onLogout}>
              <LogOut size={18} />
              <span>Log out</span>
              <ChevronRight size={18} className="logout-arrow" />
            </button>
          </div>
        </section>
      </main>
    </div>
  )
}

export default Settings
