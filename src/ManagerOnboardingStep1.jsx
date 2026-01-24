import { useState, useRef } from 'react'
import {
  Building2,
  MapPin,
  Layers,
  Hash,
  Key,
  User,
  Mail,
  Phone,
  Lock,
  Upload,
  X,
  Check,
  AlertCircle,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import './ManagerOnboardingStep1.css'

function ManagerOnboardingStep1({ onBack, onContinue, initialData }) {
  const fileInputRef = useRef(null)

  // Building Information - pre-populate from initialData if available
  const [buildingName, setBuildingName] = useState(initialData?.building?.name || '')
  const [buildingAddress, setBuildingAddress] = useState(initialData?.building?.address || '')
  const [numberOfFloors, setNumberOfFloors] = useState(initialData?.building?.floors?.toString() || '')
  const [numberOfUnits, setNumberOfUnits] = useState(initialData?.building?.units?.toString() || '')
  const [buildingCode, setBuildingCode] = useState(initialData?.building?.code || '')

  // Property Manager Information - pre-populate from initialData if available
  const [managerName, setManagerName] = useState(initialData?.manager?.name || '')
  const [managerEmail, setManagerEmail] = useState(initialData?.manager?.email || '')
  const [managerPhone, setManagerPhone] = useState(initialData?.manager?.phone || '')
  const [password, setPassword] = useState(initialData?.manager?.password || '')
  const [confirmPassword, setConfirmPassword] = useState(initialData?.manager?.password || '')
  const [logoFile, setLogoFile] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)

  // Validation
  const [touched, setTouched] = useState({})
  const [submitAttempted, setSubmitAttempted] = useState(false)

  // Building code validation
  const validateBuildingCode = (code) => {
    if (!code) return { valid: false, message: '' }
    if (code.length < 4) return { valid: false, message: 'Must be at least 4 characters' }
    if (code.length > 8) return { valid: false, message: 'Must be 8 characters or less' }
    if (!/^[a-zA-Z0-9]+$/.test(code)) return { valid: false, message: 'Letters and numbers only' }
    return { valid: true, message: 'Looks good!' }
  }

  const buildingCodeValidation = validateBuildingCode(buildingCode)

  // Email validation
  const validateEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  // Phone validation
  const validatePhone = (phone) => {
    return phone.replace(/\D/g, '').length >= 10
  }

  // Password validation
  const validatePassword = (pwd) => {
    return pwd.length >= 8
  }

  // Check if form is valid
  const isFormValid = () => {
    return (
      buildingName.trim() &&
      buildingAddress.trim() &&
      numberOfFloors &&
      numberOfUnits &&
      buildingCodeValidation.valid &&
      managerName.trim() &&
      validateEmail(managerEmail) &&
      validatePhone(managerPhone) &&
      validatePassword(password) &&
      password === confirmPassword
    )
  }

  // Handle field blur
  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }))
  }

  // Handle logo upload
  const handleLogoChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const removeLogo = () => {
    setLogoFile(null)
    setLogoPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle form submission
  const handleContinue = () => {
    setSubmitAttempted(true)

    if (!isFormValid()) {
      return
    }

    const formData = {
      building: {
        name: buildingName,
        address: buildingAddress,
        floors: parseInt(numberOfFloors),
        units: parseInt(numberOfUnits),
        code: buildingCode.toUpperCase(),
        logo: logoFile
      },
      manager: {
        name: managerName,
        email: managerEmail,
        phone: managerPhone,
        password: password
      }
    }

    onContinue(formData)
  }

  // Helper to show error
  const showError = (field, condition) => {
    return (touched[field] || submitAttempted) && condition
  }

  return (
    <div className="onboarding-container">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      {/* Header */}
      <header className="onboarding-header">
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="header-spacer"></div>
      </header>

      {/* Progress Indicator */}
      <div className="progress-section">
        <div className="progress-indicator">
          <div className="progress-step active">
            <div className="step-number">1</div>
            <span className="step-label">Details</span>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-number">2</div>
            <span className="step-label">FAQ</span>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-number">3</div>
            <span className="step-label">Residents</span>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-number">4</div>
            <span className="step-label">Launch</span>
          </div>
        </div>
        <p className="progress-text">Step 1 of 4</p>
      </div>

      {/* Main Content */}
      <main className="onboarding-content">
        <div className="onboarding-intro">
          <h1 className="onboarding-title">Let's set up your building</h1>
          <p className="onboarding-subtitle">
            Tell us about your property and we'll get you up and running in minutes.
          </p>
        </div>

        {/* Building Information Section */}
        <section className="form-section">
          <div className="section-header">
            <Building2 size={20} />
            <h2>Building Information</h2>
          </div>

          <div className="form-card">
            {/* Building Name */}
            <div className={`form-group ${showError('buildingName', !buildingName.trim()) ? 'error' : ''}`}>
              <label htmlFor="building-name">
                <Building2 size={16} />
                Building Name <span className="required">*</span>
              </label>
              <input
                id="building-name"
                type="text"
                placeholder="e.g., The Paramount Residences"
                value={buildingName}
                onChange={(e) => setBuildingName(e.target.value)}
                onBlur={() => handleBlur('buildingName')}
              />
              {showError('buildingName', !buildingName.trim()) && (
                <span className="error-message">Building name is required</span>
              )}
            </div>

            {/* Building Address */}
            <div className={`form-group ${showError('buildingAddress', !buildingAddress.trim()) ? 'error' : ''}`}>
              <label htmlFor="building-address">
                <MapPin size={16} />
                Building Address <span className="required">*</span>
              </label>
              <input
                id="building-address"
                type="text"
                placeholder="123 Main Street, City, State 12345"
                value={buildingAddress}
                onChange={(e) => setBuildingAddress(e.target.value)}
                onBlur={() => handleBlur('buildingAddress')}
              />
              {showError('buildingAddress', !buildingAddress.trim()) && (
                <span className="error-message">Building address is required</span>
              )}
            </div>

            {/* Floors and Units Row */}
            <div className="form-row">
              <div className={`form-group ${showError('numberOfFloors', !numberOfFloors) ? 'error' : ''}`}>
                <label htmlFor="floors">
                  <Layers size={16} />
                  Number of Floors <span className="required">*</span>
                </label>
                <input
                  id="floors"
                  type="number"
                  min="1"
                  placeholder="e.g., 15"
                  value={numberOfFloors}
                  onChange={(e) => setNumberOfFloors(e.target.value)}
                  onBlur={() => handleBlur('numberOfFloors')}
                />
                {showError('numberOfFloors', !numberOfFloors) && (
                  <span className="error-message">Required</span>
                )}
              </div>

              <div className={`form-group ${showError('numberOfUnits', !numberOfUnits) ? 'error' : ''}`}>
                <label htmlFor="units">
                  <Hash size={16} />
                  Number of Units <span className="required">*</span>
                </label>
                <input
                  id="units"
                  type="number"
                  min="1"
                  placeholder="e.g., 120"
                  value={numberOfUnits}
                  onChange={(e) => setNumberOfUnits(e.target.value)}
                  onBlur={() => handleBlur('numberOfUnits')}
                />
                {showError('numberOfUnits', !numberOfUnits) && (
                  <span className="error-message">Required</span>
                )}
              </div>
            </div>

            {/* Building Code */}
            <div className={`form-group ${showError('buildingCode', !buildingCodeValidation.valid && buildingCode) ? 'error' : ''} ${buildingCode && buildingCodeValidation.valid ? 'success' : ''}`}>
              <label htmlFor="building-code">
                <Key size={16} />
                Building Code <span className="required">*</span>
              </label>
              <input
                id="building-code"
                type="text"
                placeholder="e.g., PARA2024"
                value={buildingCode}
                onChange={(e) => setBuildingCode(e.target.value.toUpperCase())}
                onBlur={() => handleBlur('buildingCode')}
                maxLength={8}
              />
              <div className="input-helper-row">
                <span className="helper-text">Choose a memorable code for residents to join your building</span>
                {buildingCode && (
                  <span className={`validation-badge ${buildingCodeValidation.valid ? 'valid' : 'invalid'}`}>
                    {buildingCodeValidation.valid ? <Check size={12} /> : <AlertCircle size={12} />}
                    {buildingCodeValidation.message}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Property Manager Information Section */}
        <section className="form-section">
          <div className="section-header">
            <User size={20} />
            <h2>Property Manager Information</h2>
          </div>

          <div className="form-card">
            {/* Manager Name */}
            <div className={`form-group ${showError('managerName', !managerName.trim()) ? 'error' : ''}`}>
              <label htmlFor="manager-name">
                <User size={16} />
                Your Name <span className="required">*</span>
              </label>
              <input
                id="manager-name"
                type="text"
                placeholder="John Smith"
                value={managerName}
                onChange={(e) => setManagerName(e.target.value)}
                onBlur={() => handleBlur('managerName')}
              />
              {showError('managerName', !managerName.trim()) && (
                <span className="error-message">Your name is required</span>
              )}
            </div>

            {/* Email and Phone Row */}
            <div className="form-row">
              <div className={`form-group ${showError('managerEmail', !validateEmail(managerEmail)) ? 'error' : ''}`}>
                <label htmlFor="manager-email">
                  <Mail size={16} />
                  Email <span className="required">*</span>
                </label>
                <input
                  id="manager-email"
                  type="email"
                  placeholder="you@company.com"
                  value={managerEmail}
                  onChange={(e) => setManagerEmail(e.target.value)}
                  onBlur={() => handleBlur('managerEmail')}
                />
                {showError('managerEmail', !validateEmail(managerEmail)) && (
                  <span className="error-message">Valid email required</span>
                )}
              </div>

              <div className={`form-group ${showError('managerPhone', !validatePhone(managerPhone)) ? 'error' : ''}`}>
                <label htmlFor="manager-phone">
                  <Phone size={16} />
                  Phone <span className="required">*</span>
                </label>
                <input
                  id="manager-phone"
                  type="tel"
                  placeholder="(555) 123-4567"
                  value={managerPhone}
                  onChange={(e) => setManagerPhone(e.target.value)}
                  onBlur={() => handleBlur('managerPhone')}
                />
                {showError('managerPhone', !validatePhone(managerPhone)) && (
                  <span className="error-message">Valid phone required</span>
                )}
              </div>
            </div>

            {/* Password Row */}
            <div className="form-row">
              <div className={`form-group ${showError('password', !validatePassword(password)) ? 'error' : ''}`}>
                <label htmlFor="password">
                  <Lock size={16} />
                  Password <span className="required">*</span>
                </label>
                <input
                  id="password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onBlur={() => handleBlur('password')}
                />
                {showError('password', !validatePassword(password)) && (
                  <span className="error-message">Min 8 characters</span>
                )}
              </div>

              <div className={`form-group ${showError('confirmPassword', password !== confirmPassword) ? 'error' : ''}`}>
                <label htmlFor="confirm-password">
                  <Lock size={16} />
                  Confirm Password <span className="required">*</span>
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  placeholder="Re-enter password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onBlur={() => handleBlur('confirmPassword')}
                />
                {showError('confirmPassword', password !== confirmPassword && confirmPassword) && (
                  <span className="error-message">Passwords don't match</span>
                )}
              </div>
            </div>

            {/* Logo Upload */}
            <div className="form-group">
              <label>
                <Upload size={16} />
                Building Logo <span className="optional">(optional)</span>
              </label>

              {logoPreview ? (
                <div className="logo-preview-container">
                  <img src={logoPreview} alt="Building logo preview" className="logo-preview" />
                  <button className="remove-logo-btn" onClick={removeLogo}>
                    <X size={16} />
                    Remove
                  </button>
                </div>
              ) : (
                <div
                  className="logo-upload-area"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={24} />
                  <span>Click to upload logo</span>
                  <span className="upload-hint">PNG, JPG up to 2MB</span>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleLogoChange}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        </section>

        {/* Continue Button */}
        <div className="form-actions">
          <button
            className={`continue-btn ${isFormValid() ? '' : 'disabled'}`}
            onClick={handleContinue}
          >
            Continue to Step 2
            <ArrowRight size={20} />
          </button>
          {submitAttempted && !isFormValid() && (
            <p className="form-error-hint">Please fill in all required fields correctly</p>
          )}
        </div>
      </main>
    </div>
  )
}

export default ManagerOnboardingStep1
