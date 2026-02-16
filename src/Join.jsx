import { useState, useEffect } from 'react'
import {
  Building2,
  Lock,
  ArrowRight,
  Loader2,
  CheckCircle,
  AlertCircle,
  Mail
} from 'lucide-react'
import { supabase } from './lib/supabase'
import './ResidentJoinBuilding.css'

function Join({ onSuccess, onBackToLogin }) {
  const [invite, setInvite] = useState(null)
  const [building, setBuilding] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Get token from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const hash = window.location.hash
    let token = params.get('token')

    // Try to get token from hash if not in search params (mobile edge case)
    if (!token && hash) {
      // Handle cases like #/join?token=xxx or #token=xxx
      const hashContent = hash.replace('#', '')
      if (hashContent.includes('token=')) {
        const hashParams = new URLSearchParams(hashContent.includes('?') ? hashContent.split('?')[1] : hashContent)
        token = hashParams.get('token')
      }
    }

    // Also try the full URL in case of weird encoding
    if (!token) {
      const fullUrl = window.location.href
      const tokenMatch = fullUrl.match(/[?&]token=([^&#]+)/)
      if (tokenMatch) {
        token = decodeURIComponent(tokenMatch[1])
      }
    }

    console.log('[Join] URL parsing:', {
      href: window.location.href,
      pathname: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
      foundToken: token ? 'yes' : 'no'
    })

    if (!token) {
      setError('No invitation token provided. Please use the link from your invitation email.')
      setLoading(false)
      return
    }

    lookupInvite(token)
  }, [])

  const lookupInvite = async (token) => {
    try {
      console.log('[Join] Looking up invite with token:', token)

      // Lookup invite by token
      const { data: inviteData, error: inviteError } = await supabase
        .from('invitations')
        .select('*, buildings(*)')
        .eq('token', token)
        .single()

      if (inviteError || !inviteData) {
        console.error('[Join] Invite lookup error:', inviteError)
        setError('Invalid or expired invitation link. Please contact your building manager for a new invite.')
        setLoading(false)
        return
      }

      // Check if already used
      if (inviteData.status === 'joined') {
        setError('This invitation has already been used. Please sign in with your account or contact your building manager.')
        setLoading(false)
        return
      }

      console.log('[Join] Invite found:', inviteData)
      setInvite(inviteData)
      setBuilding(inviteData.buildings)
      setLoading(false)
    } catch (err) {
      console.error('[Join] Unexpected error:', err)
      setError('Something went wrong. Please try again or contact support.')
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (submitError) setSubmitError('')
  }

  const validateForm = () => {
    if (!formData.password || formData.password.length < 8) {
      setSubmitError('Password must be at least 8 characters')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setSubmitError('Passwords do not match')
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    setSubmitError('')

    try {
      // 1. Create auth account with the invite email
      console.log('[Join] Creating auth account for:', invite.email)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: invite.email,
        password: formData.password,
      })

      if (authError) {
        if (authError.message.includes('already registered') ||
            authError.message.includes('already exists')) {
          setSubmitError('An account with this email already exists. Please sign in instead.')
        } else {
          setSubmitError(authError.message)
        }
        setIsSubmitting(false)
        return
      }

      const userId = authData.user?.id
      if (!userId) {
        setSubmitError('Failed to create account. Please try again.')
        setIsSubmitting(false)
        return
      }

      console.log('[Join] Auth account created:', userId)

      // 2. Create or update user profile
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('id', userId)
        .single()

      const userPayload = {
        building_id: invite.building_id,
        full_name: invite.name,
        email: invite.email,
        unit_number: invite.unit || null,
        phone: invite.phone || null,
        role: 'resident',
        trust_tier: 1,
      }

      if (existingUser) {
        console.log('[Join] Updating existing user...')
        const { error: updateError } = await supabase
          .from('users')
          .update(userPayload)
          .eq('id', userId)

        if (updateError) {
          console.error('[Join] Failed to update user:', updateError)
          setSubmitError('Failed to complete signup. Please try again.')
          setIsSubmitting(false)
          return
        }
      } else {
        console.log('[Join] Creating new user...')
        const { error: insertError } = await supabase
          .from('users')
          .insert({ id: userId, ...userPayload })

        if (insertError) {
          console.error('[Join] Failed to insert user:', insertError)
          setSubmitError('Failed to complete signup. Please try again.')
          setIsSubmitting(false)
          return
        }
      }

      // 3. Mark invite as joined
      console.log('[Join] Marking invite as joined...')
      const { error: updateInviteError } = await supabase
        .from('invitations')
        .update({
          status: 'joined',
          joined_at: new Date().toISOString()
        })
        .eq('id', invite.id)

      if (updateInviteError) {
        console.error('[Join] Failed to update invite status:', updateInviteError)
        // Don't fail the signup for this
      }

      console.log('[Join] Signup complete!')

      // Success - redirect to home
      if (onSuccess) {
        onSuccess({
          user: authData.user,
          building: building,
        })
      }

    } catch (err) {
      console.error('[Join] Unexpected error:', err)
      setSubmitError('Something went wrong. Please try again.')
      setIsSubmitting(false)
    }
  }

  // Loading state
  if (loading) {
    return (
      <div className="join-building-container">
        <div className="bg-gradient"></div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="join-building-content">
          <div className="join-building-card" style={{ textAlign: 'center', padding: '48px 28px' }}>
            <Loader2 size={32} className="spinner" style={{ color: '#5B8A8A', marginBottom: '16px' }} />
            <p style={{ color: '#6B7280', margin: 0 }}>Verifying your invitation...</p>
          </div>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="join-building-container">
        <div className="bg-gradient"></div>
        <div className="bg-orb bg-orb-1"></div>
        <div className="bg-orb bg-orb-2"></div>
        <div className="join-building-content">
          <div className="join-building-card">
            <div style={{ textAlign: 'center' }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '64px',
                height: '64px',
                background: 'rgba(239, 68, 68, 0.1)',
                borderRadius: '50%',
                marginBottom: '20px'
              }}>
                <AlertCircle size={32} style={{ color: '#dc2626' }} />
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '600', color: '#2D3748', margin: '0 0 12px 0' }}>
                Invitation Not Found
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', margin: '0 0 24px 0', lineHeight: '1.6' }}>
                {error}
              </p>
              <button
                onClick={onBackToLogin}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  color: '#5B8A8A',
                  background: 'rgba(91, 138, 138, 0.1)',
                  border: '1px solid rgba(91, 138, 138, 0.2)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Get first name for greeting
  const firstName = invite?.name?.split(' ')[0] || 'there'

  // Valid invite - show signup form
  return (
    <div className="join-building-container">
      <div className="bg-gradient"></div>
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <div className="join-building-content">
        <div className="join-building-card">
          {/* Building Info Banner */}
          <div className="building-banner">
            <div className="building-banner-icon">
              <Building2 size={24} />
            </div>
            <div className="building-banner-info">
              <span className="building-banner-label">You're invited to</span>
              <h3 className="building-banner-name">{building?.name || 'Your Building'}</h3>
              {building?.address && (
                <p className="building-banner-address">{building.address}</p>
              )}
            </div>
            <CheckCircle size={20} className="building-banner-check" />
          </div>

          {/* Header */}
          <div className="join-building-header">
            <h1>Welcome, {firstName}!</h1>
            <p>Set up your password to join your neighbors on Community</p>
          </div>

          {/* Email Display */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '14px 16px',
            background: 'rgba(91, 138, 138, 0.06)',
            border: '1px solid rgba(91, 138, 138, 0.12)',
            borderRadius: '12px',
            marginBottom: '20px'
          }}>
            <Mail size={18} style={{ color: '#5B8A8A' }} />
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '11px', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Your email
              </span>
              <p style={{ fontSize: '14px', color: '#2D3748', margin: '2px 0 0 0', fontWeight: '500' }}>
                {invite?.email}
              </p>
            </div>
          </div>

          {/* Error */}
          {submitError && (
            <div className="join-error">
              {submitError}
            </div>
          )}

          {/* Form */}
          <div className="join-form">
            <div className="input-group">
              <label>Create Password</label>
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
              <label>Confirm Password</label>
              <div className="input-wrapper">
                <Lock size={18} className="input-icon" />
                <input
                  type="password"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                />
              </div>
            </div>

            <button
              className="join-submit-btn"
              onClick={handleSubmit}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="spinner" />
                  <span>Creating account...</span>
                </>
              ) : (
                <>
                  <span>Join {building?.name || 'Building'}</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </div>

          {/* Unit info if available */}
          {invite?.unit && (
            <p style={{
              fontSize: '12px',
              color: '#6B7280',
              textAlign: 'center',
              marginTop: '16px'
            }}>
              You'll be registered as a resident of Unit {invite.unit}
            </p>
          )}

          {/* Terms */}
          <p className="join-terms">
            By joining, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  )
}

export default Join
