import { useState, useRef, useEffect } from 'react'
import {
  User,
  Building2,
  Bell,
  Shield,
  Plug,
  Camera,
  Mail,
  Phone,
  Lock,
  Globe,
  Clock,
  Calendar,
  Eye,
  EyeOff,
  RefreshCw,
  Save,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  Monitor,
  Smartphone,
  MapPin,
  Home,
  Key,
  Dumbbell,
  Waves,
  Package,
  Car,
  Leaf,
  Zap,
  Utensils,
  X,
  Upload,
  Download,
  Trash2,
  ExternalLink,
  Copy,
  Info,
  ImageIcon,
  Loader2
} from 'lucide-react'
import { uploadBuildingBackgroundImage, removeBuildingBackgroundImage, getBuildingById } from './services/buildingService'
import { useAuth } from './contexts/AuthContext'
import './ManagerSettings.css'

function ManagerSettings() {
  const { userProfile } = useAuth()
  const buildingId = userProfile?.building_id

  const [activeTab, setActiveTab] = useState('profile')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [pendingTab, setPendingTab] = useState(null)

  // Background image state
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(null)
  const [backgroundImagePreview, setBackgroundImagePreview] = useState(null)
  const [selectedBackgroundFile, setSelectedBackgroundFile] = useState(null)
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)
  const [backgroundUploadError, setBackgroundUploadError] = useState('')
  const backgroundFileInputRef = useRef(null)

  // Fetch building data on mount
  useEffect(() => {
    const fetchBuildingData = async () => {
      if (!buildingId) return
      try {
        const building = await getBuildingById(buildingId)
        if (building?.background_image_url) {
          setBackgroundImageUrl(building.background_image_url)
        }
      } catch (err) {
        console.error('[ManagerSettings] Error fetching building:', err)
      }
    }
    fetchBuildingData()
  }, [buildingId])

  // Profile Settings State
  const [profileData, setProfileData] = useState({
    firstName: 'Taylor',
    lastName: 'Young',
    email: 'taylor.young@theparamount.com',
    phone: '(555) 123-4567',
    role: 'Property Manager',
    memberSince: 'January 2023',
    avatar: null
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'America/Los_Angeles',
    dateFormat: 'MM/DD/YYYY',
    timeFormat: '12h'
  })

  // Building Settings State
  const [buildingData, setBuildingData] = useState({
    name: 'The Paramount',
    address: '1234 Main Street',
    city: 'Los Angeles',
    state: 'CA',
    zip: '90012',
    description: 'A luxury high-rise apartment building in the heart of downtown Los Angeles, featuring modern amenities and stunning city views.',
    yearBuilt: '2018',
    totalUnits: '50',
    totalFloors: '15'
  })

  const [accessCodes, setAccessCodes] = useState({
    mainEntrance: { code: 'PARA2024', lastChanged: 'Dec 15, 2024', visible: false },
    garage: { code: '4589#', lastChanged: 'Nov 20, 2024', visible: false },
    packageRoom: { code: '1234', lastChanged: 'Oct 5, 2024', visible: false },
    gym: { code: '7890', lastChanged: 'Sep 1, 2024', visible: false }
  })

  const [operatingHours, setOperatingHours] = useState({
    office: { start: '09:00', end: '17:00', days: 'Mon-Fri' },
    gym: { hours: '24/7' },
    pool: { start: '06:00', end: '22:00', days: 'Daily' },
    packageRoom: { hours: '24/7' }
  })

  const [amenities, setAmenities] = useState({
    pool: true,
    gym: true,
    rooftop: true,
    bbqArea: true,
    dogPark: false,
    bikeStorage: true,
    evCharging: true,
    businessCenter: true,
    yogaStudio: false,
    gameRoom: true,
    guestSuites: false,
    concierge: true
  })

  // Notification Settings State
  const [managerNotifications, setManagerNotifications] = useState({
    newResident: true,
    newMessage: true,
    packageLogged: true,
    maintenanceRequest: true,
    elevatorBooking: true,
    bulletinListing: true,
    weeklySummary: true,
    monthlyReport: true
  })

  const [notificationDelivery, setNotificationDelivery] = useState({
    email: true,
    push: true,
    sms: false,
    notificationEmail: 'taylor.young@theparamount.com',
    notificationPhone: '(555) 123-4567'
  })

  const [residentNotifications, setResidentNotifications] = useState({
    packageAlerts: true,
    announcements: true,
    eventReminders: true,
    maintenanceUpdates: true,
    allowCustomization: true
  })

  // Security Settings State
  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '1hour',
    multipleDevices: true
  })

  const [verificationSettings, setVerificationSettings] = useState({
    emailVerification: true,
    unitVerification: true,
    manualApproval: false
  })

  const [activityLog] = useState([
    { action: 'Login successful', date: 'Jan 14, 2026 9:32 AM', device: 'Chrome on MacOS' },
    { action: 'Settings updated', date: 'Jan 13, 2026 4:15 PM', device: 'Chrome on MacOS' },
    { action: 'Announcement posted', date: 'Jan 13, 2026 2:30 PM', device: 'Safari on iPhone' },
    { action: 'New resident approved', date: 'Jan 12, 2026 11:45 AM', device: 'Chrome on MacOS' },
    { action: 'Password changed', date: 'Jan 10, 2026 3:22 PM', device: 'Chrome on MacOS' }
  ])

  // Integration Settings State
  const [integrations, setIntegrations] = useState({
    googleCalendar: false,
    outlook: false,
    slack: false,
    stripe: false
  })

  const [apiSettings] = useState({
    apiKey: 'pk_live_xxxxxxxxxxxxxxxxxxxxxxxxxx',
    webhookUrl: ''
  })

  const [showApiKey, setShowApiKey] = useState(false)

  // Settings tabs
  const settingsTabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'building', label: 'Building Settings', icon: Building2 },
    { id: 'notifications', label: 'Notification Settings', icon: Bell },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'integrations', label: 'Integrations', icon: Plug }
  ]

  // Show toast message
  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Handle tab change
  const handleTabChange = (tabId) => {
    if (hasChanges) {
      setPendingTab(tabId)
      setShowUnsavedModal(true)
    } else {
      setActiveTab(tabId)
    }
  }

  // Handle save
  const handleSave = () => {
    setHasChanges(false)
    showToastMessage('Settings saved successfully!')
  }

  // Handle discard changes
  const handleDiscardChanges = () => {
    setHasChanges(false)
    setShowUnsavedModal(false)
    if (pendingTab) {
      setActiveTab(pendingTab)
      setPendingTab(null)
    }
  }

  // Mark changes
  const markChanged = () => {
    setHasChanges(true)
  }

  // Toggle code visibility
  const toggleCodeVisibility = (codeKey) => {
    setAccessCodes(prev => ({
      ...prev,
      [codeKey]: { ...prev[codeKey], visible: !prev[codeKey].visible }
    }))
  }

  // Generate new code
  const generateNewCode = (codeKey) => {
    const newCode = Math.random().toString(36).substring(2, 8).toUpperCase()
    setAccessCodes(prev => ({
      ...prev,
      [codeKey]: {
        ...prev[codeKey],
        code: newCode,
        lastChanged: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
      }
    }))
    markChanged()
    showToastMessage('New code generated!')
  }

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showToastMessage('Copied to clipboard!')
  }

  // Background image handlers
  const handleBackgroundFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBackgroundUploadError('')

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setBackgroundUploadError('Please upload a JPG, PNG, or WebP image.')
      return
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setBackgroundUploadError('Image must be less than 5MB.')
      return
    }

    // Create preview
    const reader = new FileReader()
    reader.onloadend = () => {
      setBackgroundImagePreview(reader.result)
    }
    reader.readAsDataURL(file)

    setSelectedBackgroundFile(file)
  }

  const handleBackgroundUpload = async () => {
    if (!selectedBackgroundFile || !buildingId) return

    setIsUploadingBackground(true)
    setBackgroundUploadError('')

    try {
      const { url } = await uploadBuildingBackgroundImage(buildingId, selectedBackgroundFile)
      setBackgroundImageUrl(url)
      setBackgroundImagePreview(null)
      setSelectedBackgroundFile(null)
      showToastMessage('Building photo uploaded successfully!')
    } catch (err) {
      console.error('[ManagerSettings] Upload error:', err)
      setBackgroundUploadError(err.message || 'Failed to upload image.')
    } finally {
      setIsUploadingBackground(false)
    }
  }

  const handleCancelBackgroundUpload = () => {
    setBackgroundImagePreview(null)
    setSelectedBackgroundFile(null)
    setBackgroundUploadError('')
    if (backgroundFileInputRef.current) {
      backgroundFileInputRef.current.value = ''
    }
  }

  const handleRemoveBackground = async () => {
    if (!buildingId) return

    if (!window.confirm('Are you sure you want to remove the building photo? The default image will be shown to residents.')) {
      return
    }

    setIsUploadingBackground(true)
    try {
      await removeBuildingBackgroundImage(buildingId)
      setBackgroundImageUrl(null)
      showToastMessage('Building photo removed.')
    } catch (err) {
      console.error('[ManagerSettings] Remove error:', err)
      setBackgroundUploadError(err.message || 'Failed to remove image.')
    } finally {
      setIsUploadingBackground(false)
    }
  }

  // Render Profile Settings
  const renderProfileSettings = () => (
    <div className="settings-section">
      {/* Profile Information */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Profile Information</h3>
          <p>Update your personal information and photo</p>
        </div>
        <div className="card-body">
          <div className="profile-header">
            <div className="avatar-upload">
              <div className="avatar-preview">
                {profileData.avatar ? (
                  <img src={profileData.avatar} alt="Profile" />
                ) : (
                  <span>{profileData.firstName[0]}{profileData.lastName[0]}</span>
                )}
              </div>
              <button className="avatar-btn">
                <Camera size={16} />
                Change Photo
              </button>
            </div>
            <div className="profile-meta">
              <span className="role-badge">{profileData.role}</span>
              <span className="member-since">Member since {profileData.memberSince}</span>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group">
              <label>First Name *</label>
              <input
                type="text"
                value={profileData.firstName}
                onChange={e => { setProfileData({...profileData, firstName: e.target.value}); markChanged() }}
              />
            </div>
            <div className="form-group">
              <label>Last Name *</label>
              <input
                type="text"
                value={profileData.lastName}
                onChange={e => { setProfileData({...profileData, lastName: e.target.value}); markChanged() }}
              />
            </div>
            <div className="form-group">
              <label>Email Address *</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  value={profileData.email}
                  onChange={e => { setProfileData({...profileData, email: e.target.value}); markChanged() }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <div className="input-with-icon">
                <Phone size={16} />
                <input
                  type="tel"
                  value={profileData.phone}
                  onChange={e => { setProfileData({...profileData, phone: e.target.value}); markChanged() }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Change Password</h3>
          <p>Update your password to keep your account secure</p>
        </div>
        <div className="card-body">
          <div className="form-stack">
            <div className="form-group">
              <label>Current Password</label>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="Enter current password"
                  value={passwordData.currentPassword}
                  onChange={e => setPasswordData({...passwordData, currentPassword: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group">
              <label>New Password</label>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="Enter new password"
                  value={passwordData.newPassword}
                  onChange={e => setPasswordData({...passwordData, newPassword: e.target.value})}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Confirm New Password</label>
              <div className="input-with-icon">
                <Lock size={16} />
                <input
                  type="password"
                  placeholder="Confirm new password"
                  value={passwordData.confirmPassword}
                  onChange={e => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                />
              </div>
            </div>
            <button
              className="btn-secondary"
              disabled={!passwordData.currentPassword || !passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword}
            >
              Update Password
            </button>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Preferences</h3>
          <p>Customize your display and regional settings</p>
        </div>
        <div className="card-body">
          <div className="form-grid">
            <div className="form-group">
              <label>Language</label>
              <div className="input-with-icon">
                <Globe size={16} />
                <select
                  value={preferences.language}
                  onChange={e => { setPreferences({...preferences, language: e.target.value}); markChanged() }}
                >
                  <option value="en">English</option>
                  <option value="es">Spanish</option>
                  <option value="fr">French</option>
                  <option value="de">German</option>
                  <option value="zh">Chinese</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Timezone</label>
              <div className="input-with-icon">
                <Clock size={16} />
                <select
                  value={preferences.timezone}
                  onChange={e => { setPreferences({...preferences, timezone: e.target.value}); markChanged() }}
                >
                  <option value="America/Los_Angeles">Pacific Time (PT)</option>
                  <option value="America/Denver">Mountain Time (MT)</option>
                  <option value="America/Chicago">Central Time (CT)</option>
                  <option value="America/New_York">Eastern Time (ET)</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Date Format</label>
              <div className="input-with-icon">
                <Calendar size={16} />
                <select
                  value={preferences.dateFormat}
                  onChange={e => { setPreferences({...preferences, dateFormat: e.target.value}); markChanged() }}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
            <div className="form-group">
              <label>Time Format</label>
              <div className="input-with-icon">
                <Clock size={16} />
                <select
                  value={preferences.timeFormat}
                  onChange={e => { setPreferences({...preferences, timeFormat: e.target.value}); markChanged() }}
                >
                  <option value="12h">12-hour (1:00 PM)</option>
                  <option value="24h">24-hour (13:00)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  // Render Building Settings
  const renderBuildingSettings = () => (
    <div className="settings-section">
      {/* Building Information */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Building Information</h3>
          <p>Update your building details and description</p>
        </div>
        <div className="card-body">
          <div className="building-header">
            <div className="building-logo-upload">
              <div className="building-logo-preview">
                <Building2 size={32} />
              </div>
              <button className="avatar-btn">
                <Upload size={16} />
                Upload Logo
              </button>
            </div>
          </div>

          {/* Building Background Image Upload */}
          <div className="background-image-section">
            <div className="background-image-header">
              <h4>Building Photo</h4>
              <p>This image appears as the header background in the Resident app</p>
            </div>

            {/* Current or Preview Image */}
            <div className="background-image-preview-container">
              {backgroundImagePreview ? (
                <img
                  src={backgroundImagePreview}
                  alt="Preview"
                  className="background-image-preview"
                />
              ) : backgroundImageUrl ? (
                <img
                  src={backgroundImageUrl}
                  alt="Building"
                  className="background-image-preview"
                />
              ) : (
                <div className="background-image-placeholder">
                  <ImageIcon size={48} />
                  <span>No building photo set</span>
                  <span className="placeholder-hint">Using default image</span>
                </div>
              )}
            </div>

            {/* Upload Controls */}
            <div className="background-image-controls">
              {selectedBackgroundFile ? (
                // Show Save/Cancel when file selected
                <div className="background-image-actions">
                  <button
                    className="btn-primary"
                    onClick={handleBackgroundUpload}
                    disabled={isUploadingBackground}
                  >
                    {isUploadingBackground ? (
                      <>
                        <Loader2 size={16} className="spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Save size={16} />
                        Save Photo
                      </>
                    )}
                  </button>
                  <button
                    className="btn-secondary"
                    onClick={handleCancelBackgroundUpload}
                    disabled={isUploadingBackground}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                // Show Upload/Remove buttons
                <div className="background-image-actions">
                  <button
                    className="btn-secondary"
                    onClick={() => backgroundFileInputRef.current?.click()}
                    disabled={isUploadingBackground}
                  >
                    <Upload size={16} />
                    Upload Building Photo
                  </button>
                  {backgroundImageUrl && (
                    <button
                      className="btn-text-danger"
                      onClick={handleRemoveBackground}
                      disabled={isUploadingBackground}
                    >
                      <Trash2 size={16} />
                      Remove Photo
                    </button>
                  )}
                </div>
              )}

              <input
                ref={backgroundFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleBackgroundFileSelect}
                style={{ display: 'none' }}
              />
            </div>

            {/* Error Message */}
            {backgroundUploadError && (
              <div className="background-image-error">
                <AlertTriangle size={14} />
                {backgroundUploadError}
              </div>
            )}

            {/* Guidance Text */}
            <div className="background-image-guidance">
              <Info size={14} />
              <div>
                <span>For best results, use a landscape photo (horizontal)</span>
                <span>Recommended: 1920×1080 pixels or larger</span>
                <span>Max file size: 5MB • Formats: JPG, PNG, WebP</span>
              </div>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-group full-width">
              <label>Building Name *</label>
              <div className="input-with-icon">
                <Building2 size={16} />
                <input
                  type="text"
                  value={buildingData.name}
                  onChange={e => { setBuildingData({...buildingData, name: e.target.value}); markChanged() }}
                />
              </div>
            </div>
            <div className="form-group full-width">
              <label>Street Address *</label>
              <div className="input-with-icon">
                <MapPin size={16} />
                <input
                  type="text"
                  value={buildingData.address}
                  onChange={e => { setBuildingData({...buildingData, address: e.target.value}); markChanged() }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>City *</label>
              <input
                type="text"
                value={buildingData.city}
                onChange={e => { setBuildingData({...buildingData, city: e.target.value}); markChanged() }}
              />
            </div>
            <div className="form-group">
              <label>State *</label>
              <input
                type="text"
                value={buildingData.state}
                onChange={e => { setBuildingData({...buildingData, state: e.target.value}); markChanged() }}
              />
            </div>
            <div className="form-group">
              <label>ZIP Code *</label>
              <input
                type="text"
                value={buildingData.zip}
                onChange={e => { setBuildingData({...buildingData, zip: e.target.value}); markChanged() }}
              />
            </div>
            <div className="form-group">
              <label>Year Built</label>
              <input
                type="text"
                value={buildingData.yearBuilt}
                onChange={e => { setBuildingData({...buildingData, yearBuilt: e.target.value}); markChanged() }}
              />
            </div>
            <div className="form-group">
              <label>Total Units</label>
              <div className="input-with-icon">
                <Home size={16} />
                <input
                  type="number"
                  value={buildingData.totalUnits}
                  onChange={e => { setBuildingData({...buildingData, totalUnits: e.target.value}); markChanged() }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Total Floors</label>
              <input
                type="number"
                value={buildingData.totalFloors}
                onChange={e => { setBuildingData({...buildingData, totalFloors: e.target.value}); markChanged() }}
              />
            </div>
            <div className="form-group full-width">
              <label>Building Description</label>
              <textarea
                value={buildingData.description}
                onChange={e => { setBuildingData({...buildingData, description: e.target.value}); markChanged() }}
                rows={4}
                placeholder="Describe your building..."
              />
            </div>
          </div>
        </div>
      </div>

      {/* Access Codes */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Building Access Codes</h3>
          <p>Manage access codes for building entry points</p>
        </div>
        <div className="card-body">
          <div className="access-codes-grid">
            {Object.entries(accessCodes).map(([key, value]) => {
              const labels = {
                mainEntrance: 'Main Entrance',
                garage: 'Garage',
                packageRoom: 'Package Room',
                gym: 'Gym'
              }
              return (
                <div key={key} className="access-code-item">
                  <div className="code-header">
                    <Key size={16} />
                    <span className="code-label">{labels[key]}</span>
                  </div>
                  <div className="code-value">
                    <span className={value.visible ? '' : 'code-hidden'}>
                      {value.visible ? value.code : '••••••'}
                    </span>
                    <button
                      className="code-toggle"
                      onClick={() => toggleCodeVisibility(key)}
                    >
                      {value.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                    <button
                      className="code-copy"
                      onClick={() => copyToClipboard(value.code)}
                    >
                      <Copy size={14} />
                    </button>
                  </div>
                  <div className="code-footer">
                    <span className="code-changed">Changed: {value.lastChanged}</span>
                    <button
                      className="code-generate"
                      onClick={() => generateNewCode(key)}
                    >
                      <RefreshCw size={12} />
                      Generate New
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Operating Hours */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Operating Hours</h3>
          <p>Set the operating hours for building facilities</p>
        </div>
        <div className="card-body">
          <div className="hours-grid">
            <div className="hours-item">
              <div className="hours-label">
                <Building2 size={16} />
                <span>Management Office</span>
              </div>
              <div className="hours-inputs">
                <input
                  type="time"
                  value={operatingHours.office.start}
                  onChange={e => { setOperatingHours({...operatingHours, office: {...operatingHours.office, start: e.target.value}}); markChanged() }}
                />
                <span>to</span>
                <input
                  type="time"
                  value={operatingHours.office.end}
                  onChange={e => { setOperatingHours({...operatingHours, office: {...operatingHours.office, end: e.target.value}}); markChanged() }}
                />
                <span className="hours-days">{operatingHours.office.days}</span>
              </div>
            </div>
            <div className="hours-item">
              <div className="hours-label">
                <Dumbbell size={16} />
                <span>Fitness Center</span>
              </div>
              <div className="hours-badge">24/7 Access</div>
            </div>
            <div className="hours-item">
              <div className="hours-label">
                <Waves size={16} />
                <span>Pool</span>
              </div>
              <div className="hours-inputs">
                <input
                  type="time"
                  value={operatingHours.pool.start}
                  onChange={e => { setOperatingHours({...operatingHours, pool: {...operatingHours.pool, start: e.target.value}}); markChanged() }}
                />
                <span>to</span>
                <input
                  type="time"
                  value={operatingHours.pool.end}
                  onChange={e => { setOperatingHours({...operatingHours, pool: {...operatingHours.pool, end: e.target.value}}); markChanged() }}
                />
                <span className="hours-days">{operatingHours.pool.days}</span>
              </div>
            </div>
            <div className="hours-item">
              <div className="hours-label">
                <Package size={16} />
                <span>Package Room</span>
              </div>
              <div className="hours-badge">24/7 Access</div>
            </div>
          </div>
        </div>
      </div>

      {/* Amenities */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Building Amenities</h3>
          <p>Select amenities available in your building (shown to residents)</p>
        </div>
        <div className="card-body">
          <div className="amenities-grid">
            {[
              { key: 'pool', label: 'Swimming Pool', icon: Waves },
              { key: 'gym', label: 'Fitness Center', icon: Dumbbell },
              { key: 'rooftop', label: 'Rooftop Lounge', icon: Building2 },
              { key: 'bbqArea', label: 'BBQ Area', icon: Utensils },
              { key: 'dogPark', label: 'Dog Park', icon: Leaf },
              { key: 'bikeStorage', label: 'Bike Storage', icon: Car },
              { key: 'evCharging', label: 'EV Charging', icon: Zap },
              { key: 'businessCenter', label: 'Business Center', icon: Monitor },
              { key: 'yogaStudio', label: 'Yoga Studio', icon: Leaf },
              { key: 'gameRoom', label: 'Game Room', icon: Monitor },
              { key: 'guestSuites', label: 'Guest Suites', icon: Home },
              { key: 'concierge', label: 'Concierge', icon: User }
            ].map(amenity => (
              <label key={amenity.key} className={`amenity-item ${amenities[amenity.key] ? 'active' : ''}`}>
                <input
                  type="checkbox"
                  checked={amenities[amenity.key]}
                  onChange={e => { setAmenities({...amenities, [amenity.key]: e.target.checked}); markChanged() }}
                />
                <amenity.icon size={20} />
                <span>{amenity.label}</span>
              </label>
            ))}
          </div>
        </div>
      </div>
    </div>
  )

  // Render Notification Settings
  const renderNotificationSettings = () => (
    <div className="settings-section">
      {/* Manager Notifications */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Manager Notifications</h3>
          <p>Choose which notifications you want to receive</p>
        </div>
        <div className="card-body">
          <div className="notifications-list">
            {[
              { key: 'newResident', label: 'New resident joins', desc: 'When a new resident signs up for the app' },
              { key: 'newMessage', label: 'New message received', desc: 'Direct messages from residents' },
              { key: 'packageLogged', label: 'Package logged', desc: 'When a new package is logged in the system' },
              { key: 'maintenanceRequest', label: 'Maintenance request submitted', desc: 'New maintenance or repair requests' },
              { key: 'elevatorBooking', label: 'Elevator booking needs approval', desc: 'Pending elevator reservation requests' },
              { key: 'bulletinListing', label: 'New bulletin board listing', desc: 'New items posted to the bulletin board' },
              { key: 'weeklySummary', label: 'Weekly activity summary', desc: 'Summary of building activity every Monday' },
              { key: 'monthlyReport', label: 'Monthly report', desc: 'Detailed monthly analytics and reports' }
            ].map(notif => (
              <div key={notif.key} className="notification-item">
                <div className="notification-info">
                  <span className="notification-label">{notif.label}</span>
                  <span className="notification-desc">{notif.desc}</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={managerNotifications[notif.key]}
                    onChange={e => { setManagerNotifications({...managerNotifications, [notif.key]: e.target.checked}); markChanged() }}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Notification Delivery */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Notification Delivery</h3>
          <p>How you want to receive notifications</p>
        </div>
        <div className="card-body">
          <div className="delivery-options">
            <div className="delivery-item">
              <div className="delivery-info">
                <Mail size={20} />
                <div>
                  <span className="delivery-label">Email Notifications</span>
                  <span className="delivery-desc">Receive notifications via email</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationDelivery.email}
                  onChange={e => { setNotificationDelivery({...notificationDelivery, email: e.target.checked}); markChanged() }}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="delivery-item">
              <div className="delivery-info">
                <Smartphone size={20} />
                <div>
                  <span className="delivery-label">Push Notifications</span>
                  <span className="delivery-desc">Receive push notifications on your device</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationDelivery.push}
                  onChange={e => { setNotificationDelivery({...notificationDelivery, push: e.target.checked}); markChanged() }}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="delivery-item">
              <div className="delivery-info">
                <Phone size={20} />
                <div>
                  <span className="delivery-label">SMS Notifications</span>
                  <span className="delivery-desc">Receive text messages for urgent alerts</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={notificationDelivery.sms}
                  onChange={e => { setNotificationDelivery({...notificationDelivery, sms: e.target.checked}); markChanged() }}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: '1.5rem' }}>
            <div className="form-group">
              <label>Notification Email</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  value={notificationDelivery.notificationEmail}
                  onChange={e => { setNotificationDelivery({...notificationDelivery, notificationEmail: e.target.value}); markChanged() }}
                />
              </div>
            </div>
            <div className="form-group">
              <label>Notification Phone</label>
              <div className="input-with-icon">
                <Phone size={16} />
                <input
                  type="tel"
                  value={notificationDelivery.notificationPhone}
                  onChange={e => { setNotificationDelivery({...notificationDelivery, notificationPhone: e.target.value}); markChanged() }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Resident Notifications */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Resident Notifications</h3>
          <p>Control which notifications residents receive by default</p>
        </div>
        <div className="card-body">
          <div className="notifications-list">
            {[
              { key: 'packageAlerts', label: 'Package arrival alerts', desc: 'Notify residents when packages arrive' },
              { key: 'announcements', label: 'Building announcements', desc: 'Important building-wide announcements' },
              { key: 'eventReminders', label: 'Event reminders', desc: 'Reminders for upcoming building events' },
              { key: 'maintenanceUpdates', label: 'Maintenance updates', desc: 'Updates on maintenance requests and schedules' }
            ].map(notif => (
              <div key={notif.key} className="notification-item">
                <div className="notification-info">
                  <span className="notification-label">{notif.label}</span>
                  <span className="notification-desc">{notif.desc}</span>
                </div>
                <label className="toggle-switch">
                  <input
                    type="checkbox"
                    checked={residentNotifications[notif.key]}
                    onChange={e => { setResidentNotifications({...residentNotifications, [notif.key]: e.target.checked}); markChanged() }}
                  />
                  <span className="toggle-slider"></span>
                </label>
              </div>
            ))}
          </div>

          <div className="notification-item highlight" style={{ marginTop: '1rem' }}>
            <div className="notification-info">
              <span className="notification-label">Allow residents to customize</span>
              <span className="notification-desc">Let residents choose their own notification preferences</span>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={residentNotifications.allowCustomization}
                onChange={e => { setResidentNotifications({...residentNotifications, allowCustomization: e.target.checked}); markChanged() }}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )

  // Render Security Settings
  const renderSecuritySettings = () => (
    <div className="settings-section">
      {/* Access Control */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Access Control</h3>
          <p>Manage your account security settings</p>
        </div>
        <div className="card-body">
          <div className="security-options">
            <div className="security-item">
              <div className="security-info">
                <Shield size={20} />
                <div>
                  <span className="security-label">Two-Factor Authentication</span>
                  <span className="security-desc">Add an extra layer of security to your account</span>
                </div>
              </div>
              <div className="security-actions">
                {securitySettings.twoFactorEnabled ? (
                  <span className="status-badge enabled">Enabled</span>
                ) : (
                  <button className="btn-secondary small" onClick={() => { setSecuritySettings({...securitySettings, twoFactorEnabled: true}); markChanged() }}>
                    Enable 2FA
                  </button>
                )}
              </div>
            </div>

            <div className="security-item">
              <div className="security-info">
                <Clock size={20} />
                <div>
                  <span className="security-label">Session Timeout</span>
                  <span className="security-desc">Automatically log out after inactivity</span>
                </div>
              </div>
              <select
                value={securitySettings.sessionTimeout}
                onChange={e => { setSecuritySettings({...securitySettings, sessionTimeout: e.target.value}); markChanged() }}
                className="security-select"
              >
                <option value="15min">15 minutes</option>
                <option value="30min">30 minutes</option>
                <option value="1hour">1 hour</option>
                <option value="4hours">4 hours</option>
                <option value="never">Never</option>
              </select>
            </div>

            <div className="security-item">
              <div className="security-info">
                <Monitor size={20} />
                <div>
                  <span className="security-label">Allow Multiple Devices</span>
                  <span className="security-desc">Stay logged in on multiple devices simultaneously</span>
                </div>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={securitySettings.multipleDevices}
                  onChange={e => { setSecuritySettings({...securitySettings, multipleDevices: e.target.checked}); markChanged() }}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Activity Log */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Activity Log</h3>
          <p>Recent activity on your account</p>
        </div>
        <div className="card-body">
          <div className="activity-log">
            {activityLog.map((item, index) => (
              <div key={index} className="activity-log-item">
                <div className="activity-log-info">
                  <span className="activity-action">{item.action}</span>
                  <span className="activity-device">{item.device}</span>
                </div>
                <span className="activity-date">{item.date}</span>
              </div>
            ))}
          </div>
          <button className="btn-text">
            View full activity log
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Resident Verification */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Resident Verification</h3>
          <p>Control how new residents are verified</p>
        </div>
        <div className="card-body">
          <div className="notifications-list">
            <div className="notification-item">
              <div className="notification-info">
                <span className="notification-label">Require email verification</span>
                <span className="notification-desc">New residents must verify their email address</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={verificationSettings.emailVerification}
                  onChange={e => { setVerificationSettings({...verificationSettings, emailVerification: e.target.checked}); markChanged() }}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="notification-item">
              <div className="notification-info">
                <span className="notification-label">Require unit verification</span>
                <span className="notification-desc">Verify residents live in the unit they claim</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={verificationSettings.unitVerification}
                  onChange={e => { setVerificationSettings({...verificationSettings, unitVerification: e.target.checked}); markChanged() }}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
            <div className="notification-item">
              <div className="notification-info">
                <span className="notification-label">Manual approval for new residents</span>
                <span className="notification-desc">Review and approve each new resident manually</span>
              </div>
              <label className="toggle-switch">
                <input
                  type="checkbox"
                  checked={verificationSettings.manualApproval}
                  onChange={e => { setVerificationSettings({...verificationSettings, manualApproval: e.target.checked}); markChanged() }}
                />
                <span className="toggle-slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Data & Privacy */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Data & Privacy</h3>
          <p>Manage your building data</p>
        </div>
        <div className="card-body">
          <div className="data-actions">
            <button className="data-action-btn">
              <Download size={18} />
              <div>
                <span className="action-label">Export Building Data</span>
                <span className="action-desc">Download all building data as CSV</span>
              </div>
            </button>
            <button className="data-action-btn warning">
              <Trash2 size={18} />
              <div>
                <span className="action-label">Delete Inactive Residents</span>
                <span className="action-desc">Remove residents who haven't logged in for 1+ year</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  // Render Integration Settings
  const renderIntegrationSettings = () => (
    <div className="settings-section">
      {/* Connected Services */}
      <div className="settings-card">
        <div className="card-header">
          <h3>Connected Services</h3>
          <p>Connect external services to enhance functionality</p>
        </div>
        <div className="card-body">
          <div className="integrations-list">
            <div className="integration-item">
              <div className="integration-info">
                <div className="integration-icon google">
                  <Calendar size={20} />
                </div>
                <div>
                  <span className="integration-label">Google Calendar</span>
                  <span className="integration-desc">Sync building events with Google Calendar</span>
                </div>
              </div>
              {integrations.googleCalendar ? (
                <div className="integration-actions">
                  <span className="status-badge connected">Connected</span>
                  <button className="btn-text-danger" onClick={() => { setIntegrations({...integrations, googleCalendar: false}); markChanged() }}>
                    Disconnect
                  </button>
                </div>
              ) : (
                <button className="btn-secondary small" onClick={() => { setIntegrations({...integrations, googleCalendar: true}); markChanged() }}>
                  Connect
                </button>
              )}
            </div>

            <div className="integration-item">
              <div className="integration-info">
                <div className="integration-icon outlook">
                  <Mail size={20} />
                </div>
                <div>
                  <span className="integration-label">Microsoft Outlook</span>
                  <span className="integration-desc">Sync calendar and receive email notifications</span>
                </div>
              </div>
              {integrations.outlook ? (
                <div className="integration-actions">
                  <span className="status-badge connected">Connected</span>
                  <button className="btn-text-danger" onClick={() => { setIntegrations({...integrations, outlook: false}); markChanged() }}>
                    Disconnect
                  </button>
                </div>
              ) : (
                <button className="btn-secondary small" onClick={() => { setIntegrations({...integrations, outlook: true}); markChanged() }}>
                  Connect
                </button>
              )}
            </div>

            <div className="integration-item">
              <div className="integration-info">
                <div className="integration-icon slack">
                  <MessageSquareIcon size={20} />
                </div>
                <div>
                  <span className="integration-label">Slack</span>
                  <span className="integration-desc">Get notifications in your Slack workspace</span>
                </div>
              </div>
              {integrations.slack ? (
                <div className="integration-actions">
                  <span className="status-badge connected">Connected</span>
                  <button className="btn-text-danger" onClick={() => { setIntegrations({...integrations, slack: false}); markChanged() }}>
                    Disconnect
                  </button>
                </div>
              ) : (
                <button className="btn-secondary small" onClick={() => { setIntegrations({...integrations, slack: true}); markChanged() }}>
                  Connect
                </button>
              )}
            </div>

            <div className="integration-item coming-soon">
              <div className="integration-info">
                <div className="integration-icon stripe">
                  <Zap size={20} />
                </div>
                <div>
                  <span className="integration-label">Stripe Payments</span>
                  <span className="integration-desc">Collect rent and fees online</span>
                </div>
              </div>
              <span className="coming-soon-badge">Coming Soon</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Access */}
      <div className="settings-card">
        <div className="card-header">
          <h3>API Access</h3>
          <p>Manage API keys for custom integrations</p>
        </div>
        <div className="card-body">
          <div className="api-section">
            <div className="api-key-display">
              <label>API Key</label>
              <div className="api-key-value">
                <code>{showApiKey ? apiSettings.apiKey : '••••••••••••••••••••••••••••'}</code>
                <button
                  className="code-toggle"
                  onClick={() => setShowApiKey(!showApiKey)}
                >
                  {showApiKey ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
                <button
                  className="code-copy"
                  onClick={() => copyToClipboard(apiSettings.apiKey)}
                >
                  <Copy size={14} />
                </button>
              </div>
              <div className="api-actions">
                <button className="btn-secondary small">
                  <RefreshCw size={14} />
                  Generate New Key
                </button>
              </div>
            </div>

            <div className="form-group" style={{ marginTop: '1.5rem' }}>
              <label>Webhook URL</label>
              <div className="input-with-icon">
                <ExternalLink size={16} />
                <input
                  type="url"
                  placeholder="https://your-server.com/webhook"
                  value={apiSettings.webhookUrl}
                  onChange={() => markChanged()}
                />
              </div>
              <span className="form-hint">Receive real-time events at this URL</span>
            </div>
          </div>

          <div className="api-docs-link">
            <Info size={16} />
            <span>View our <a href="#" onClick={e => e.preventDefault()}>API Documentation</a> for integration guides</span>
          </div>
        </div>
      </div>
    </div>
  )

  // Simple message square icon component
  const MessageSquareIcon = ({ size }) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
    </svg>
  )

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileSettings()
      case 'building': return renderBuildingSettings()
      case 'notifications': return renderNotificationSettings()
      case 'security': return renderSecuritySettings()
      case 'integrations': return renderIntegrationSettings()
      default: return renderProfileSettings()
    }
  }

  return (
    <div className="manager-settings">
      {/* Header */}
      <div className="settings-header">
        <div className="settings-header-left">
          <h2>Settings</h2>
          <p>Manage your account and building preferences</p>
        </div>
        <div className="settings-header-actions">
          {hasChanges && (
            <span className="unsaved-indicator">
              <AlertTriangle size={14} />
              Unsaved changes
            </span>
          )}
          <button
            className="btn-primary"
            disabled={!hasChanges}
            onClick={handleSave}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>
      </div>

      {/* Settings Layout */}
      <div className="settings-layout">
        {/* Sidebar Navigation */}
        <nav className="settings-nav">
          {settingsTabs.map(tab => (
            <button
              key={tab.id}
              className={`settings-nav-item ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => handleTabChange(tab.id)}
            >
              <tab.icon size={20} />
              <span>{tab.label}</span>
              <ChevronRight size={16} className="nav-arrow" />
            </button>
          ))}
        </nav>

        {/* Content Area */}
        <div className="settings-content">
          {renderContent()}
        </div>
      </div>

      {/* Unsaved Changes Modal */}
      {showUnsavedModal && (
        <div className="modal-overlay" onClick={() => setShowUnsavedModal(false)}>
          <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Unsaved Changes</h3>
              <button className="modal-close" onClick={() => setShowUnsavedModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="warning-message">
                <AlertTriangle size={32} />
                <p>You have unsaved changes. Do you want to save them before leaving?</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-text-danger" onClick={handleDiscardChanges}>
                Discard Changes
              </button>
              <button className="btn-secondary" onClick={() => setShowUnsavedModal(false)}>
                Keep Editing
              </button>
              <button className="btn-primary" onClick={() => { handleSave(); handleDiscardChanges() }}>
                Save & Continue
              </button>
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

export default ManagerSettings
