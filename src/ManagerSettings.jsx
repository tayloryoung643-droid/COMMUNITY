import { useState, useRef, useEffect } from 'react'
import {
  User,
  Building2,
  Camera,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Save,
  CheckCircle,
  AlertTriangle,
  ChevronRight,
  MapPin,
  Home,
  Key,
  X,
  Upload,
  Trash2,
  Copy,
  Info,
  ImageIcon,
  Loader2,
  Users,
  Check,
  ChevronDown,
  ArrowRight
} from 'lucide-react'
import { uploadBuildingBackgroundImage, removeBuildingBackgroundImage, getBuildingById } from './services/buildingService'
import { updateUserProfile, uploadProfilePhoto, updateBuildingInfo, changePassword, getResidentCount } from './services/settingsService'
import { getInvitations, hasFAQEntries, hasInvitations, getInvitationStats } from './services/invitationService'
import ResidentImporter from './ResidentImporter'
import { useAuth } from './contexts/AuthContext'
import './ManagerSettings.css'

function ManagerSettings({ onNavigate }) {
  const { userProfile, user, refreshUserProfile } = useAuth()
  const buildingId = userProfile?.building_id

  const [activeTab, setActiveTab] = useState('profile')
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [showUnsavedModal, setShowUnsavedModal] = useState(false)
  const [pendingTab, setPendingTab] = useState(null)
  const [isSaving, setIsSaving] = useState(false)

  // Background image state
  const [backgroundImageUrl, setBackgroundImageUrl] = useState(null)
  const [backgroundImagePreview, setBackgroundImagePreview] = useState(null)
  const [selectedBackgroundFile, setSelectedBackgroundFile] = useState(null)
  const [isUploadingBackground, setIsUploadingBackground] = useState(false)
  const [backgroundUploadError, setBackgroundUploadError] = useState('')
  const backgroundFileInputRef = useRef(null)

  // Profile photo state
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [selectedAvatarFile, setSelectedAvatarFile] = useState(null)
  const avatarFileInputRef = useRef(null)

  // Profile Settings State
  const [profileData, setProfileData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: ''
  })

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  })
  const [isChangingPassword, setIsChangingPassword] = useState(false)

  // Building Settings State
  const [buildingData, setBuildingData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    description: '',
    totalUnits: ''
  })

  // Invite state
  const [accessCodeVisible, setAccessCodeVisible] = useState(false)
  const [accessCodeExpanded, setAccessCodeExpanded] = useState(false)
  const [residentCount, setResidentCount] = useState(0)
  const [previousInvites, setPreviousInvites] = useState([])
  const [inviteStats, setInviteStats] = useState({ total: 0, sent: 0, failed: 0, notInvited: 0 })

  // Onboarding checklist state
  const [checklistItems, setChecklistItems] = useState({
    buildingPhoto: false,
    buildingDescription: false,
    residentsInvited: false,
    faqSetup: false
  })

  // Settings tabs — only 3
  const settingsTabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'building', label: 'Building', icon: Building2 },
    { id: 'invite', label: 'Invite Residents', icon: Users }
  ]

  // Initialize profile from userProfile
  useEffect(() => {
    if (!userProfile) return
    const nameParts = (userProfile.full_name || '').split(' ')
    const firstName = nameParts[0] || ''
    const lastName = nameParts.slice(1).join(' ') || ''
    setProfileData({
      firstName,
      lastName,
      email: user?.email || userProfile.email || '',
      phone: userProfile.phone || ''
    })
  }, [userProfile, user])

  // Fetch building data on mount
  useEffect(() => {
    const fetchBuildingData = async () => {
      if (!buildingId) return
      try {
        const building = await getBuildingById(buildingId)
        if (building) {
          setBuildingData({
            name: building.name || '',
            address: building.address || '',
            city: building.city || '',
            state: building.state || '',
            zip: building.zip || '',
            description: building.description || '',
            totalUnits: building.total_units?.toString() || ''
          })
          if (building.background_image_url) {
            setBackgroundImageUrl(building.background_image_url)
          }
          // Update checklist
          setChecklistItems(prev => ({
            ...prev,
            buildingPhoto: !!building.background_image_path || !!building.background_image_url,
            buildingDescription: !!building.description
          }))
        }
      } catch (err) {
        console.error('[ManagerSettings] Error fetching building:', err)
      }
    }
    fetchBuildingData()
  }, [buildingId])

  // Fetch invite tab data
  useEffect(() => {
    if (!buildingId) return
    getResidentCount(buildingId).then(count => {
      setResidentCount(count)
      setChecklistItems(prev => ({ ...prev, residentsInvited: count > 0 }))
    })
    getInvitations(buildingId).then(invites => setPreviousInvites(invites))
    getInvitationStats(buildingId).then(stats => setInviteStats(stats))
    hasFAQEntries(buildingId).then(has => setChecklistItems(prev => ({ ...prev, faqSetup: has })))
    hasInvitations(buildingId).then(has => setChecklistItems(prev => ({ ...prev, residentsInvited: has || prev.residentsInvited })))
  }, [buildingId])

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
  const handleSave = async () => {
    setIsSaving(true)
    try {
      if (activeTab === 'profile') {
        // Upload avatar if changed
        if (selectedAvatarFile && user?.id) {
          await uploadProfilePhoto(user.id, selectedAvatarFile)
          setSelectedAvatarFile(null)
          setAvatarPreview(null)
        }
        // Save profile data
        if (user?.id) {
          const fullName = `${profileData.firstName} ${profileData.lastName}`.trim()
          await updateUserProfile(user.id, {
            full_name: fullName,
            phone: profileData.phone
          })
        }
        await refreshUserProfile()
      } else if (activeTab === 'building') {
        if (buildingId) {
          await updateBuildingInfo(buildingId, {
            name: buildingData.name,
            address: buildingData.address,
            city: buildingData.city,
            state: buildingData.state,
            zip: buildingData.zip,
            description: buildingData.description,
            total_units: buildingData.totalUnits
          })
        }
      }

      setHasChanges(false)
      showToastMessage('Settings saved successfully!')
    } catch (err) {
      console.error('[ManagerSettings] Save error:', err)
      showToastMessage(err.message || 'Failed to save. Please try again.')
    } finally {
      setIsSaving(false)
    }
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

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showToastMessage('Copied to clipboard!')
  }

  // Password change handler
  const handlePasswordChange = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      showToastMessage('Passwords do not match.')
      return
    }
    if (passwordData.newPassword.length < 6) {
      showToastMessage('Password must be at least 6 characters.')
      return
    }

    setIsChangingPassword(true)
    try {
      await changePassword(passwordData.newPassword)
      setPasswordData({ newPassword: '', confirmPassword: '' })
      showToastMessage('Password updated successfully!')
    } catch (err) {
      showToastMessage(err.message || 'Failed to change password.')
    } finally {
      setIsChangingPassword(false)
    }
  }

  // Avatar handlers
  const handleAvatarSelect = (e) => {
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
    markChanged()
  }

  // Background image handlers
  const handleBackgroundFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    setBackgroundUploadError('')

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setBackgroundUploadError('Please upload a JPG, PNG, or WebP image.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setBackgroundUploadError('Image must be less than 5MB.')
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => setBackgroundImagePreview(reader.result)
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
      setChecklistItems(prev => ({ ...prev, buildingPhoto: true }))
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
      setChecklistItems(prev => ({ ...prev, buildingPhoto: false }))
      showToastMessage('Building photo removed.')
    } catch (err) {
      console.error('[ManagerSettings] Remove error:', err)
      setBackgroundUploadError(err.message || 'Failed to remove image.')
    } finally {
      setIsUploadingBackground(false)
    }
  }

  // ResidentImporter completion handler
  const handleImportComplete = ({ sentCount, savedCount }) => {
    if (sentCount > 0) {
      showToastMessage(`${sentCount} invitation${sentCount !== 1 ? 's' : ''} sent!`)
    } else if (savedCount > 0) {
      showToastMessage(`${savedCount} resident${savedCount !== 1 ? 's' : ''} saved!`)
    }
    // Refresh invite data
    if (buildingId) {
      getInvitations(buildingId).then(invites => setPreviousInvites(invites))
      getInvitationStats(buildingId).then(stats => setInviteStats(stats))
      hasInvitations(buildingId).then(has => setChecklistItems(prev => ({ ...prev, residentsInvited: has })))
      getResidentCount(buildingId).then(count => setResidentCount(count))
    }
  }

  // Get avatar display
  const getAvatarInitials = () => {
    const f = profileData.firstName?.[0] || ''
    const l = profileData.lastName?.[0] || ''
    return `${f}${l}`.toUpperCase() || 'U'
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
                {avatarPreview ? (
                  <img src={avatarPreview} alt="Preview" />
                ) : userProfile?.avatar_signed_url ? (
                  <img src={userProfile.avatar_signed_url} alt="Profile" />
                ) : (
                  <span>{getAvatarInitials()}</span>
                )}
              </div>
              <button className="avatar-btn" onClick={() => avatarFileInputRef.current?.click()}>
                <Camera size={16} />
                Change Photo
              </button>
              <input
                ref={avatarFileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarSelect}
                style={{ display: 'none' }}
              />
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
              <label>Email Address</label>
              <div className="input-with-icon">
                <Mail size={16} />
                <input
                  type="email"
                  value={profileData.email}
                  readOnly
                  className="readonly-input"
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
              disabled={!passwordData.newPassword || passwordData.newPassword !== passwordData.confirmPassword || isChangingPassword}
              onClick={handlePasswordChange}
            >
              {isChangingPassword ? (
                <>
                  <Loader2 size={16} className="spin" />
                  Updating...
                </>
              ) : (
                'Update Password'
              )}
            </button>
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
          {/* Building Background Image Upload */}
          <div className="background-image-section" style={{ marginTop: 0, paddingTop: 0, borderTop: 'none' }}>
            <div className="background-image-header">
              <h4>Building Photo</h4>
              <p>This image appears as the header background in the Resident app</p>
            </div>

            <div className="background-image-preview-container">
              {backgroundImagePreview ? (
                <img src={backgroundImagePreview} alt="Preview" className="background-image-preview" />
              ) : backgroundImageUrl ? (
                <img src={backgroundImageUrl} alt="Building" className="background-image-preview" />
              ) : (
                <div className="background-image-placeholder">
                  <ImageIcon size={48} />
                  <span>No building photo set</span>
                  <span className="placeholder-hint">Using default image</span>
                </div>
              )}
            </div>

            <div className="background-image-controls">
              {selectedBackgroundFile ? (
                <div className="background-image-actions">
                  <button className="btn-primary" onClick={handleBackgroundUpload} disabled={isUploadingBackground}>
                    {isUploadingBackground ? (
                      <><Loader2 size={16} className="spin" /> Uploading...</>
                    ) : (
                      <><Save size={16} /> Save Photo</>
                    )}
                  </button>
                  <button className="btn-secondary" onClick={handleCancelBackgroundUpload} disabled={isUploadingBackground}>
                    Cancel
                  </button>
                </div>
              ) : (
                <div className="background-image-actions">
                  <button className="btn-secondary" onClick={() => backgroundFileInputRef.current?.click()} disabled={isUploadingBackground}>
                    <Upload size={16} /> Upload Building Photo
                  </button>
                  {backgroundImageUrl && (
                    <button className="btn-text-danger" onClick={handleRemoveBackground} disabled={isUploadingBackground}>
                      <Trash2 size={16} /> Remove Photo
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

            {backgroundUploadError && (
              <div className="background-image-error">
                <AlertTriangle size={14} />
                {backgroundUploadError}
              </div>
            )}

            <div className="background-image-guidance">
              <Info size={14} />
              <div>
                <span>For best results, use a landscape photo (horizontal)</span>
                <span>Recommended: 1920x1080 pixels or larger</span>
                <span>Max file size: 5MB &bull; Formats: JPG, PNG, WebP</span>
              </div>
            </div>
          </div>

          <div className="form-grid" style={{ marginTop: '1.5rem' }}>
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
    </div>
  )

  // Render Invite Residents
  const renderInviteResidents = () => {
    const accessCode = userProfile?.buildings?.access_code || '—'
    const totalUnits = parseInt(buildingData.totalUnits, 10) || 0
    const progressPct = totalUnits > 0 ? Math.min(100, Math.round((residentCount / totalUnits) * 100)) : 0

    return (
      <div className="settings-section">
        {/* 1. Setup Checklist (moved to top) */}
        <div className="settings-card">
          <div className="card-header">
            <h3>Setup Checklist</h3>
            <p>Complete these steps to get your building ready</p>
          </div>
          <div className="card-body">
            <div className="checklist">
              <div className={`checklist-item ${checklistItems.buildingPhoto ? 'done' : ''}`}>
                <div className="checklist-icon">
                  {checklistItems.buildingPhoto ? <Check size={16} /> : <span className="checklist-number">1</span>}
                </div>
                <span>Upload a building photo</span>
              </div>
              <div className={`checklist-item ${checklistItems.buildingDescription ? 'done' : ''}`}>
                <div className="checklist-icon">
                  {checklistItems.buildingDescription ? <Check size={16} /> : <span className="checklist-number">2</span>}
                </div>
                <span>Add a building description</span>
              </div>
              <div className={`checklist-item ${checklistItems.residentsInvited ? 'done' : ''}`}>
                <div className="checklist-icon">
                  {checklistItems.residentsInvited ? <Check size={16} /> : <span className="checklist-number">3</span>}
                </div>
                <span>Invite your first residents</span>
              </div>
              <div className={`checklist-item ${checklistItems.faqSetup ? 'done' : ''}`}>
                <div className="checklist-icon">
                  {checklistItems.faqSetup ? <Check size={16} /> : <span className="checklist-number">4</span>}
                </div>
                <span>Set up Building FAQ</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Import & Invite Residents */}
        <div className="settings-card">
          <div className="card-header">
            <h3>Import & Invite Residents</h3>
            <p>Paste a list, upload a file, or add emails to send invitation emails</p>
          </div>
          <div className="card-body">
            <ResidentImporter
              buildingId={buildingId}
              buildingName={buildingData.name || userProfile?.buildings?.name || ''}
              accessCode={accessCode}
              userId={user?.id}
              onComplete={handleImportComplete}
              compact
            />
          </div>
        </div>

        {/* 3. Invitation Summary Card (replaces previously invited list) */}
        <div className="settings-card">
          <div className="card-header">
            <h3>Invitation Summary</h3>
            <p>Overview of resident invitations for your building</p>
          </div>
          <div className="card-body">
            <div className="invite-summary-stats">
              <div className="summary-stat">
                <span className="summary-stat-value">{inviteStats.sent}</span>
                <span className="summary-stat-label">Total Sent</span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-value">{residentCount}</span>
                <span className="summary-stat-label">Joined</span>
              </div>
              <div className="summary-stat">
                <span className="summary-stat-value">{inviteStats.failed}</span>
                <span className="summary-stat-label">Failed</span>
              </div>
            </div>

            <div className="invite-summary-links">
              {onNavigate && (
                <button className="invite-summary-link" onClick={() => onNavigate('residents')}>
                  View All Residents <ArrowRight size={14} />
                </button>
              )}
              {inviteStats.failed > 0 && onNavigate && (
                <button className="invite-summary-link failed-link" onClick={() => onNavigate('residents')}>
                  View Failed Invites <ArrowRight size={14} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 4. Building Access Code (collapsible, collapsed by default) */}
        <div className="settings-card">
          <div
            className="card-header collapsible"
            onClick={() => setAccessCodeExpanded(!accessCodeExpanded)}
          >
            <div>
              <h3>Building Access Code</h3>
              <p>Share this code with residents so they can join your building</p>
            </div>
            <ChevronDown size={20} className={`collapse-chevron ${accessCodeExpanded ? 'expanded' : ''}`} />
          </div>
          {accessCodeExpanded && (
            <div className="card-body">
              <div className="access-code-display">
                <div className="access-code-value">
                  <Key size={20} />
                  <span className={accessCodeVisible ? 'code-revealed' : 'code-hidden-text'}>
                    {accessCodeVisible ? accessCode : '••••••••'}
                  </span>
                  <button className="code-toggle" onClick={() => setAccessCodeVisible(!accessCodeVisible)}>
                    {accessCodeVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                  <button className="code-copy" onClick={() => copyToClipboard(accessCode)}>
                    <Copy size={16} />
                  </button>
                </div>
              </div>

              <div className="resident-counter">
                <div className="resident-counter-header">
                  <span className="resident-counter-label">
                    <strong>{residentCount}</strong> of <strong>{totalUnits || '?'}</strong> residents joined
                  </span>
                  {totalUnits > 0 && <span className="resident-counter-pct">{progressPct}%</span>}
                </div>
                {totalUnits > 0 && (
                  <div className="resident-progress-bar">
                    <div className="resident-progress-fill" style={{ width: `${progressPct}%` }} />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Render content based on active tab
  const renderContent = () => {
    switch (activeTab) {
      case 'profile': return renderProfileSettings()
      case 'building': return renderBuildingSettings()
      case 'invite': return renderInviteResidents()
      default: return renderProfileSettings()
    }
  }

  const showSaveButton = activeTab !== 'invite'

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
          {showSaveButton && (
            <button
              className="btn-primary"
              disabled={!hasChanges || isSaving}
              onClick={handleSave}
            >
              {isSaving ? (
                <><Loader2 size={18} className="spin" /> Saving...</>
              ) : (
                <><Save size={18} /> Save Changes</>
              )}
            </button>
          )}
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
