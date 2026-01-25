import { useState } from 'react'
import {
  Building2,
  User,
  Mail,
  Lock,
  Hash,
  ArrowLeft,
  ArrowRight,
  Loader2,
  CheckCircle
} from 'lucide-react'
import { supabase } from './lib/supabase'
import './ResidentJoinBuilding.css'

function ResidentJoinBuilding({ building, onBack, onSuccess }) {
  const [formData, setFormData] = useState({
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

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsLoading(true)
    setError('')

    try {
      // 1. Create auth account
      console.log('[ResidentJoin] Creating auth account...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      })

      if (authError) {
        // Check if user already exists
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

      console.log('[ResidentJoin] Auth account created:', userId)

      // 2. Create or update user profile
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      if (existingUser) {
        // Update existing user
        const { error: updateError } = await supabase
          .from('users')
          .update({
            building_id: building.id,
            full_name: formData.name,
            unit_number: formData.unitNumber || null,
            role: 'resident',
            trust_tier: 1, // All residents get full access
          })
          .eq('id', userId)

        if (updateError) {
          console.error('[ResidentJoin] Failed to update user:', updateError)
          setError('Failed to complete signup. Please try again.')
          setIsLoading(false)
          return
        }
      } else {
        // Insert new user
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: userId,
            email: formData.email,
            building_id: building.id,
            full_name: formData.name,
            unit_number: formData.unitNumber || null,
            role: 'resident',
            trust_tier: 1, // All residents get full access
          })

        if (insertError) {
          console.error('[ResidentJoin] Failed to insert user:', insertError)
          setError('Failed to complete signup. Please try again.')
          setIsLoading(false)
          return
        }
      }

      console.log('[ResidentJoin] User profile created/updated')

      // Success!
      onSuccess({
        user: authData.user,
        building: building,
      })

    } catch (err) {
      console.error('[ResidentJoin] Unexpected error:', err)
      setError('Something went wrong. Please try again.')
      setIsLoading(false)
    }
  }

  return (
    <div className="join-building-container">
      {/* Ambient Background */}
      <div className="bg-gradient"></div>
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <div className="join-building-content">
        {/* Back Button */}
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="join-building-card">
          {/* Building Info Banner */}
          <div className="building-banner">
            <div className="building-banner-icon">
              <Building2 size={24} />
            </div>
            <div className="building-banner-info">
              <span className="building-banner-label">Joining</span>
              <h3 className="building-banner-name">{building.name}</h3>
              <p className="building-banner-address">{building.address}</p>
            </div>
            <CheckCircle size={20} className="building-banner-check" />
          </div>

          {/* Header */}
          <div className="join-building-header">
            <h1>Create your account</h1>
            <p>Join your neighbors on Community</p>
          </div>

          {/* Error */}
          {error && (
            <div className="join-error">
              {error}
            </div>
          )}

          {/* Form */}
          <div className="join-form">
            <div className="input-group">
              <label>Your Name</label>
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
              <label>Email</label>
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
              <label>Password</label>
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

            <button
              className="join-submit-btn"
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Join Building</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Terms */}
          <p className="join-terms">
            By joining, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default ResidentJoinBuilding
