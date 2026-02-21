import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

// Helper to create signed URL for building background image
const createSignedBackgroundUrl = async (filePath) => {
  if (!filePath) return null

  try {
    const { data, error } = await supabase.storage
      .from('building-images')
      .createSignedUrl(filePath, 3600) // 1 hour expiry

    if (error) {
      console.warn('[AuthContext] Error creating signed URL:', error)
      return null
    }

    return data?.signedUrl || null
  } catch (err) {
    console.warn('[AuthContext] Failed to create signed URL:', err)
    return null
  }
}

// Preload an image to cache it in browser memory
const preloadImage = (url) => {
  if (!url) return Promise.resolve()

  return new Promise((resolve) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => resolve() // Resolve even on error to not block
    img.src = url
  })
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isDemoMode, setIsDemoMode] = useState(false)
  const [buildingBackgroundUrl, setBuildingBackgroundUrl] = useState(null)

  useEffect(() => {
    let initialLoadHandled = false

    // Check active session — handles initial page load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      initialLoadHandled = true
      setUser(session?.user ?? null)
      if (session?.user) {
        setIsDemoMode(false)
        try {
          await loadUserProfile(session.user.id)
        } catch (err) {
          console.warn('[AuthContext] Initial profile load failed:', err)
        }
      }
      setLoading(false)
    })

    // Listen for subsequent auth changes (login, logout, token refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      // Skip the INITIAL_SESSION event — getSession() already handles it
      if (!initialLoadHandled) return

      setUser(session?.user ?? null)
      if (session?.user) {
        setIsDemoMode(false)
        loadUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
    })

    // Safety timeout — never block the user for more than 5 seconds
    const safetyTimer = setTimeout(() => {
      setLoading(prev => {
        if (prev) console.warn('[AuthContext] Safety timeout — dismissing loading')
        return false
      })
    }, 5000)

    return () => {
      subscription.unsubscribe()
      clearTimeout(safetyTimer)
    }
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      console.time('[AuthContext] loadUserProfile total')

      // Step 1: Fetch user profile (need building_id before we can parallelize)
      console.time('[AuthContext] profile fetch')
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()
      console.timeEnd('[AuthContext] profile fetch')

      if (profileError) {
        console.error('Error loading user profile:', profileError)
        return
      }

      if (!profile) {
        console.error('No user profile found for:', userId)
        return
      }

      // Step 2: Fire all independent requests in parallel
      // - Avatar signed URL (if avatar exists)
      // - Building data (if building_id exists)
      console.time('[AuthContext] parallel fetches')
      const promises = []

      // Avatar signed URL
      const avatarPromiseIndex = profile.avatar_url ? promises.length : -1
      if (profile.avatar_url) {
        promises.push(
          supabase.storage
            .from('profile-images')
            .createSignedUrl(profile.avatar_url, 3600)
            .catch(err => { console.warn('[AuthContext] Avatar URL failed:', err); return null })
        )
      }

      // Building fetch
      const buildingPromiseIndex = profile.building_id ? promises.length : -1
      if (profile.building_id) {
        promises.push(
          supabase
            .from('buildings')
            .select('*')
            .eq('id', profile.building_id)
            .single()
        )
      }

      const results = await Promise.all(promises)
      console.timeEnd('[AuthContext] parallel fetches')

      // Process avatar result
      if (avatarPromiseIndex >= 0) {
        const avatarResult = results[avatarPromiseIndex]
        if (avatarResult?.data?.signedUrl) {
          profile.avatar_signed_url = avatarResult.data.signedUrl
        }
      }

      // Process building result + set profile immediately (don't wait for bg image)
      let profileWithBuilding = { ...profile }
      let bgImagePath = null
      if (buildingPromiseIndex >= 0) {
        const { data: building, error: buildingError } = results[buildingPromiseIndex]
        if (!buildingError && building) {
          profileWithBuilding.buildings = building
          bgImagePath = building.background_image_url
        }
      }

      // Set profile NOW — unblocks the UI render
      setUserProfile(profileWithBuilding)
      console.timeEnd('[AuthContext] loadUserProfile total')
      console.log('[AuthContext] Profile loaded:', {
        sessionUserId: userId,
        profileId: profileWithBuilding.id,
        buildingId: profileWithBuilding.building_id
      })

      // Step 3: Background image — fire-and-forget, don't block UI
      if (bgImagePath) {
        createSignedBackgroundUrl(bgImagePath).then(signedUrl => {
          if (signedUrl) {
            setBuildingBackgroundUrl(signedUrl)
            preloadImage(signedUrl)
          }
        })
      }
    } catch (error) {
      console.error('Error loading user profile:', error)
    }
  }

  const signUp = async (email, password, userData) => {
    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) throw authError

      // Create user profile
      const { error: profileError } = await supabase
        .from('users')
        .insert([
          {
            id: authData.user.id,
            email,
            full_name: userData.full_name,
            unit_number: userData.unit_number,
            building_id: userData.building_id,
            role: userData.role || 'resident',
            phone: userData.phone,
          },
        ])

      if (profileError) throw profileError

      return { data: authData, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      return { data, error: null }
    } catch (error) {
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      setIsDemoMode(false)
      // Clear user state immediately to prevent race conditions
      setUser(null)
      setUserProfile(null)
      setBuildingBackgroundUrl(null)
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const loginAsDemo = async (role = 'manager') => {
    // Set demo mode flag
    setIsDemoMode(true)

    // For now, create a temporary demo session
    // In production, you'd have actual demo accounts in the database
    const demoUser = {
      id: role === 'manager' ? 'demo-manager-id' : 'demo-resident-id',
      email: role === 'manager' ? 'demo@manager.community' : 'demo@resident.community',
    }

    const demoProfile = {
      id: demoUser.id,
      email: demoUser.email,
      full_name: role === 'manager' ? 'Taylor Young' : 'Demo Resident',
      unit_number: role === 'manager' ? null : '612',
      role: role,
      is_demo: true,
      trust_tier: role === 'manager' ? 2 : 1, // Managers get tier 2, residents get tier 1
      building_id: 'demo-building-id',
      buildings: {
        id: 'demo-building-id',
        name: 'The Paramount',
        access_code: 'PARA2024',
      },
    }

    setUser(demoUser)
    setUserProfile(demoProfile)
    setBuildingBackgroundUrl('https://jsjocdxqxfcashrhjbgn.supabase.co/storage/v1/object/public/building-images/5e3b6dae-b373-414e-9707-b6e182525ea6/background.jpg')

    return { data: demoUser, error: null }
  }

  // Force refresh user profile (useful after signup)
  // Accepts optional userId for cases where React state hasn't updated yet
  const refreshUserProfile = async (userId) => {
    const id = userId || user?.id
    if (id) {
      await loadUserProfile(id)
    }
  }

  const isResidentLed = userProfile?.buildings?.building_mode === 'resident_only'

  const value = {
    user,
    userProfile,
    loading,
    isDemoMode,
    isResidentLed,
    buildingBackgroundUrl,
    signUp,
    signIn,
    signOut,
    loginAsDemo,
    refreshUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
