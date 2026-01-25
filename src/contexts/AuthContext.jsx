import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

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

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Real session exists - disable demo mode
        setIsDemoMode(false)
        loadUserProfile(session.user.id)
      }
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        // Real session exists - disable demo mode
        setIsDemoMode(false)
        loadUserProfile(session.user.id)
      } else {
        setUserProfile(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadUserProfile = async (userId) => {
    try {
      // Fetch user profile first (without buildings join to avoid RLS issues)
      const { data: profile, error: profileError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) {
        console.error('Error loading user profile:', profileError)
        return
      }

      if (!profile) {
        console.error('No user profile found for:', userId)
        return
      }

      // Fetch building separately if user has a building_id
      let profileWithBuilding = { ...profile }
      if (profile.building_id) {
        const { data: building, error: buildingError } = await supabase
          .from('buildings')
          .select('*')
          .eq('id', profile.building_id)
          .single()

        if (!buildingError && building) {
          profileWithBuilding.buildings = building
        }
      }

      setUserProfile(profileWithBuilding)
      // Note: isDemoMode is only set true by explicit loginAsDemo() call
      // Real users loaded from DB should never be in demo mode
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

    return { data: demoUser, error: null }
  }

  // Force refresh user profile (useful after signup)
  const refreshUserProfile = async () => {
    if (user?.id) {
      await loadUserProfile(user.id)
    }
  }

  const value = {
    user,
    userProfile,
    loading,
    isDemoMode,
    signUp,
    signIn,
    signOut,
    loginAsDemo,
    refreshUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
