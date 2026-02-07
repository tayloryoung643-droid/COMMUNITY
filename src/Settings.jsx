import { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Camera, User, Home, Calendar, FileText, Eye, EyeOff, Hand, Bell, Mail, Package, PartyPopper, MessageSquare, LogOut, ChevronRight, AlertTriangle, Phone, HelpCircle, CheckCircle, Save, Loader2 } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { updateUserProfile, uploadProfilePhoto, getBuildingManagerContact } from './services/settingsService'
import './Settings.css'

function Settings({ onBack, onLogout, onNavigate, isDemoMode, userProfile }) {
  const { buildingBackgroundUrl, refreshUserProfile, user } = useAuth()

  // Profile state
  const [profile, setProfile] = useState({
    displayName: '',
    unit: '',
    floor: '',
    moveInDate: '',
    bio: '',
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

  // Photo state
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null)
  const fileInputRef = useRef(null)

  // Save state
  const [isSaving, setIsSaving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Emergency contact state
  const [managerContact, setManagerContact] = useState(null)

  // Initialize from userProfile
  useEffect(() => {
    if (!userProfile) return

    if (isDemoMode) {
      setProfile({
        displayName: 'Taylor Young',
        unit: '1201',
        floor: '12',
        moveInDate: 'March 2023',
        bio: 'Coffee enthusiast, dog lover, and weekend hiker. Always happy to chat in the elevator!',
        showInDirectory: true
      })
      setPrivacy({ showUnitOnListings: true, allowWaves: true })
      setNotifications({ announcements: true, packages: true, events: false, messages: true })
    } else {
      setProfile({
        displayName: userProfile.full_name || '',
        unit: userProfile.unit_number || '',
        floor: userProfile.unit_number ? userProfile.unit_number.toString().slice(0, -2) || '1' : '',
        moveInDate: userProfile.created_at ? new Date(userProfile.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '',
        bio: userProfile.bio || '',
        showInDirectory: userProfile.show_in_directory ?? true
      })
      setPrivacy({
        showUnitOnListings: userProfile.show_unit_on_bulletin ?? true,
        allowWaves: userProfile.allow_waves ?? true
      })
      setNotifications({
        announcements: userProfile.notify_announcements ?? true,
        packages: userProfile.notify_packages ?? true,
        events: userProfile.notify_events ?? false,
        messages: userProfile.notify_messages ?? true
      })
    }
  }, [userProfile, isDemoMode])

  // Fetch manager contact for emergency section
  useEffect(() => {
    if (isDemoMode || !userProfile?.building_id) return
    getBuildingManagerContact(userProfile.building_id).then(setManagerContact)
  }, [userProfile?.building_id, isDemoMode])

  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleProfileChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }))
  }

  const handlePrivacyChange = (field) => {
    setPrivacy(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const handleNotificationChange = (field) => {
    setNotifications(prev => ({ ...prev, [field]: !prev[field] }))
  }

  // Photo handlers
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showToastMessage('Please upload a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      showToastMessage('Image must be less than 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => setAvatarPreview(reader.result)
    reader.readAsDataURL(file)
    setSelectedAvatarFile(file)
  }

  // Save handler
  const handleSave = async () => {
    if (isDemoMode) {
      showToastMessage('Demo mode — changes not saved')
      return
    }

    setIsSaving(true)
    try {
      // Upload avatar if changed
      if (selectedAvatarFile && user?.id) {
        await uploadProfilePhoto(user.id, selectedAvatarFile)
        setSelectedAvatarFile(null)
        setAvatarPreview(null)
      }

      // Save all profile fields
      if (user?.id) {
        await updateUserProfile(user.id, {
          full_name: profile.displayName,
          bio: profile.bio,
          show_in_directory: profile.showInDirectory,
          show_unit_on_bulletin: privacy.showUnitOnListings,
          allow_waves: privacy.allowWaves,
          notify_announcements: notifications.announcements,
          notify_packages: notifications.packages,
          notify_events: notifications.events,
          notify_messages: notifications.messages
        })
      }

      await refreshUserProfile()
      showToastMessage('Settings saved!')
    } catch (err) {
      console.error('[Settings] Save error:', err)
      showToastMessage(err.message || 'Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  // Determine avatar display
  const getAvatarContent = () => {
    if (avatarPreview) {
      return <img src={avatarPreview} alt="Preview" />
    }
    if (isDemoMode) {
      return <img src="/images/profile-taylor.jpg" alt="Taylor Young" />
    }
    if (userProfile?.avatar_signed_url) {
      return <img src={userProfile.avatar_signed_url} alt={userProfile.full_name} />
    }
    return (
      <div style={{
        width: '100%', height: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
        color: 'white', fontSize: '24px', fontWeight: '600'
      }}>
        {(userProfile?.full_name || 'U').charAt(0).toUpperCase()}
      </div>
    )
  }

  const bgStyle = buildingBackgroundUrl ? { '--building-bg-image': `url(${buildingBackgroundUrl})` } : {}

  return (
    <div className="settings-container resident-inner-page" style={bgStyle}>
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
                {getAvatarContent()}
              </div>
              <button className="change-photo-btn" onClick={() => fileInputRef.current?.click()}>
                <Camera size={16} />
                <span>Change Photo</span>
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoSelect}
                style={{ display: 'none' }}
              />
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

            {/* Move-in Date (read-only) */}
            <div className="form-group">
              <label>
                <Calendar size={14} />
                Move-in Date
              </label>
              <div className="readonly-field">{profile.moveInDate || 'Not set'}</div>
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
            {managerContact && (
              <div className="emergency-contact">
                <div className="emergency-info">
                  <span className="emergency-label">Building Manager — {managerContact.full_name}</span>
                  <span className="emergency-number">
                    {managerContact.phone || 'Contact via the app'}
                  </span>
                </div>
                {managerContact.phone && (
                  <a href={`tel:${managerContact.phone.replace(/\D/g, '')}`} className="call-btn">
                    <Phone size={16} />
                  </a>
                )}
              </div>
            )}

            {isDemoMode && (
              <div className="emergency-contact">
                <div className="emergency-info">
                  <span className="emergency-label">Building Manager — Taylor Young</span>
                  <span className="emergency-number">Contact via the app</span>
                </div>
              </div>
            )}

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

        {/* Save Button */}
        <section className="settings-section">
          <button
            className="settings-save-btn"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? (
              <>
                <Loader2 size={18} className="spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save size={18} />
                <span>Save Changes</span>
              </>
            )}
          </button>
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

      {/* Toast Notification */}
      {showToast && (
        <div className="settings-toast">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export default Settings
