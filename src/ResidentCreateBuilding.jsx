import { useState } from 'react'
import {
  Building2,
  User,
  Mail,
  Lock,
  Hash,
  MapPin,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Sparkles
} from 'lucide-react'
import { supabase } from './lib/supabase'
import './ResidentCreateBuilding.css'

function ResidentCreateBuilding({ initialAddress, onBack, onSuccess }) {
  const [formData, setFormData] = useState({
    // Building info
    buildingAddress: initialAddress || '',
    buildingName: '',
    // User info
    name: '',
    email: '',
    password: '',
    unitNumber: ''
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.buildingAddress.trim()) {
      setError('Please enter your building address')
      return false
    }
    if (!formData.name.trim()) {
      setError('Please enter your name')
      return false
    }
    if (!formData.email.trim()) {
      setError('Please enter your email')
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError('Please enter a valid email address')
      return false
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Password must be at least 8 characters')
      return false
    }
    return true
  }

  // Generate a building code from address
  const generateBuildingCode = (address) => {
    // Take first letters of words and add random numbers
    const words = address.split(/\s+/).filter(w => w.length > 2)
    const prefix = words.slice(0, 3).map(w => w[0].toUpperCase()).join('')
    const suffix = Math.floor(Math.random() * 9000 + 1000)
    return `${prefix}${suffix}`
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setError('')

    try {
      // 1. Create auth account
      console.log('[ResidentCreate] Creating auth account...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        if (authError.message.includes('already registered') ||
            authError.message.includes('already exists')) {
          setError('An account with this email already exists. Please sign in instead.')
        } else {
          setError(authError.message)
        }
        setIsLoading(false)
        return
      }

      const userId = authData.user?.id
      if (!userId) {
        setError('Failed to create account. Please try again.')
        setIsLoading(false)
        return
      }

      console.log('[ResidentCreate] Auth account created:', userId)

      // 2. Create the building
      const buildingName = formData.buildingName.trim() || formData.buildingAddress
      const buildingCode = generateBuildingCode(formData.buildingAddress)

      console.log('[ResidentCreate] Creating building...')
      const { data: newBuilding, error: buildingError } = await supabase
        .from('buildings')
        .insert({
          name: buildingName,
          address: formData.buildingAddress,
          access_code: buildingCode,
          building_mode: 'resident_only', // Resident-created building
        })
        .select()
        .single()

      if (buildingError) {
        console.error('[ResidentCreate] Failed to create building:', buildingError)
        setError('Failed to create building. Please try again.')
        setIsLoading(false)
        return
      }

      console.log('[ResidentCreate] Building created:', newBuilding)
      console.log('[ResidentCreate] Assigned building to user:', newBuilding.id)

      if (!newBuilding.id) {
        console.error('[ResidentCreate] Building created but has no ID!')
        setError('Failed to create building. Please try again.')
        setIsLoading(false)
        return
      }

      // 3. Create or update user profile
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (existingUser) {
        console.log('[ResidentCreate] Updating existing user with building_id:', newBuilding.id)
        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            building_id: newBuilding.id,
            full_name: formData.name,
            unit_number: formData.unitNumber || null,
            role: 'resident',
            trust_tier: 1, // First resident gets posting ability
          })
          .eq('id', userId)
          .select()
          .single()

        if (updateError) {
          console.error('[ResidentCreate] Failed to update user:', updateError)
          setError('Failed to complete signup. Please try again.')
          setIsLoading(false)
          return
        }
        console.log('[ResidentCreate] User updated, building_id is now:', updatedUser?.building_id)
      } else {
        console.log('[ResidentCreate] Inserting new user with building_id:', newBuilding.id)
        const { data: insertedUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: formData.email,
            building_id: newBuilding.id,
            full_name: formData.name,
            unit_number: formData.unitNumber || null,
            role: 'resident',
            trust_tier: 1, // First resident gets posting ability
          })
          .select()
          .single()

        if (insertError) {
          console.error('[ResidentCreate] Failed to insert user:', insertError)
          setError('Failed to complete signup. Please try again.')
          setIsLoading(false)
          return
        }
        console.log('[ResidentCreate] User inserted, building_id is now:', insertedUser?.building_id)
      }

      console.log('[ResidentCreate] User profile created/updated with building_id:', newBuilding.id)

      // Success!
      onSuccess({
        user: authData.user,
        building: newBuilding,
        isNewBuilding: true,
      })

    } catch (err) {
      console.error('[ResidentCreate] Unexpected error:', err)
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="create-building-container">
      {/* Ambient Background */}
      <div className="bg-gradient"></div>
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <div className="create-building-content">
        {/* Back Button */}
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="create-building-card">
          {/* Header */}
          <div className="create-building-header">
            <div className="create-building-icon">
              <Building2 size={24} />
              <Sparkles size={14} className="sparkle" />
            </div>
            <h1>Add your building</h1>
            <p>Be the first to bring Community to your building</p>
          </div>

          {/* Error */}
          {error && (
            <div className="create-error">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="create-form">
            {/* Building Section */}
            <div className="form-section">
              <h3 className="section-title">Building Information</h3>

              <div className="input-group">
                <label>Building Address <span className="required">*</span></label>
                <div className="input-wrapper">
                  <MapPin size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="123 Main Street, City, State"
                    value={formData.buildingAddress}
                    onChange={(e) => handleChange('buildingAddress', e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Building Name <span className="optional">(optional)</span></label>
                <div className="input-wrapper">
                  <Building2 size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g., The Paramount, Sunset Apartments"
                    value={formData.buildingName}
                    onChange={(e) => handleChange('buildingName', e.target.value)}
                  />
                </div>
                <span className="input-hint">Leave blank to use the address as the name</span>
              </div>
            </div>

            {/* User Section */}
            <div className="form-section">
              <h3 className="section-title">Your Information</h3>

              <div className="input-group">
                <label>Your Name <span className="required">*</span></label>
                <div className="input-wrapper">
                  <User size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Email <span className="required">*</span></label>
                <div className="input-wrapper">
                  <Mail size={18} className="input-icon" />
                  <input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Password <span className="required">*</span></label>
                <div className="input-wrapper">
                  <Lock size={18} className="input-icon" />
                  <input
                    type="password"
                    placeholder="Minimum 8 characters"
                    value={formData.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                  />
                </div>
              </div>

              <div className="input-group">
                <label>Unit Number <span className="optional">(optional)</span></label>
                <div className="input-wrapper">
                  <Hash size={18} className="input-icon" />
                  <input
                    type="text"
                    placeholder="e.g., 1201, 5B"
                    value={formData.unitNumber}
                    onChange={(e) => handleChange('unitNumber', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <button
              className="create-submit-btn"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Creating building...</span>
                </>
              ) : (
                <>
                  <span>Create Building & Join</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Info Box */}
          <div className="first-resident-info">
            <Sparkles size={16} />
            <p>
              As the first resident, you'll help build your building's community.
              Invite neighbors to join once you're set up!
            </p>
          </div>

          {/* Terms */}
          <p className="create-terms">
            By creating a building, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResidentCreateBuilding
