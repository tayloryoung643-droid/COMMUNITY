import { useState, useEffect } from 'react'
import './App.css'
import { useAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabase'
import Login from './Login'
import Home from './Home'
import Announcements from './Announcements'
import Packages from './Packages'
import Events from './Events'
import Neighbors from './Neighbors'
import Emergency from './Emergency'
import ElevatorBooking from './ElevatorBooking'
import CommunityFeed from './CommunityFeed'
import BulletinBoard from './BulletinBoard'
import Settings from './Settings'
import CalendarView from './CalendarView'
import BuildingInfo from './BuildingInfo'
import Building from './Building'
import BottomNav from './BottomNav'
import MobileShell from './MobileShell'
import EventDetail from './EventDetail'
import PostDetail from './PostDetail'
import ManagerOnboardingStep1 from './ManagerOnboardingStep1'
import ManagerOnboardingStep2 from './ManagerOnboardingStep2'
import ManagerOnboardingStep3 from './ManagerOnboardingStep3'
import ManagerOnboardingStep4 from './ManagerOnboardingStep4'
import { processInviteBatch } from './services/invitationService'
import ManagerDashboard from './ManagerDashboard'
import LoadingSplash from './components/LoadingSplash'
import ResidentSignupEntry from './ResidentSignupEntry'
import ResidentAddressSearch from './ResidentAddressSearch'
import ResidentJoinBuilding from './ResidentJoinBuilding'
import ResidentCreateBuilding from './ResidentCreateBuilding'
import Join from './Join'
import ResidentMessages from './ResidentMessages'
import ResidentFAQ from './ResidentFAQ'
import ResidentDocuments from './ResidentDocuments'
import InviteNeighbors from './InviteNeighbors'

function App() {
  const { user, userProfile, loading, isDemoMode, signIn, signOut, loginAsDemo, refreshUserProfile } = useAuth()
  const [buildingCode, setBuildingCode] = useState('')
  const [currentScreen, setCurrentScreen] = useState('login')
  const [authError, setAuthError] = useState('')
  const [loginTransitioning, setLoginTransitioning] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [previousScreen, setPreviousScreen] = useState('home')

  // Resident signup flow state
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [searchedAddress, setSearchedAddress] = useState('')

  // Check for /join URL path on initial load
  useEffect(() => {
    const path = window.location.pathname
    const params = new URLSearchParams(window.location.search)
    const hash = window.location.hash

    // Check for token in query params OR hash (some mobile browsers put params in hash)
    let token = params.get('token')

    // If token not in search params, check if it's in the hash (mobile edge case)
    if (!token && hash.includes('token=')) {
      const hashParams = new URLSearchParams(hash.replace('#', '').replace('/join?', ''))
      token = hashParams.get('token')
    }

    // Match /join with or without trailing slash
    const isJoinPath = path === '/join' || path === '/join/' || path.startsWith('/join?')

    if (isJoinPath && token) {
      // Token-based invite (from manager)
      if (!params.get('token')) {
        window.history.replaceState({}, '', `/join?token=${token}`)
      }
      setCurrentScreen('join')
      return
    }

    // Match /join/[building-id] — shareable invite link from residents
    const buildingIdMatch = path.match(/^\/join\/([0-9a-f-]{36})$/i)
    if (buildingIdMatch) {
      const buildingId = buildingIdMatch[1]
      // Look up the building and route to join flow
      supabase
        .from('buildings')
        .select('*')
        .eq('id', buildingId)
        .single()
        .then(({ data: buildingData, error }) => {
          if (!error && buildingData) {
            setSelectedBuilding(buildingData)
            setCurrentScreen('resident-join-building')
          } else {
            console.warn('[App] Building not found for invite link:', buildingId)
            window.history.replaceState({}, '', '/')
            setCurrentScreen('login')
          }
        })
    }
  }, [])

  // Redirect authenticated users to the correct screen on app load or after login
  useEffect(() => {
    // Don't redirect if we're on the join screen
    if (currentScreen === 'join') return

    // Route once profile is loaded — covers both initial load and login transition
    if (!loading && user && userProfile && !isDemoMode && (currentScreen === 'login' || loginTransitioning)) {
      setLoginTransitioning(false)
      if (userProfile.role === 'manager') {
        setCurrentScreen('manager-dashboard')
      } else {
        setCurrentScreen('home')
      }
    }
  }, [loading, user, userProfile, isDemoMode, currentScreen, loginTransitioning])

  // Community posts state - seed with some example posts
  const [posts, setPosts] = useState([
    {
      id: 1,
      type: 'share',
      text: "Just made fresh banana bread and have extra! Anyone want some? I'm in unit 1201.",
      author: 'Sarah M.',
      unit: 'Unit 1201',
      timestamp: Date.now() - 1800000, // 30 min ago
      likes: 8,
      comments: 3,
      commentsList: [
        { id: 101, author: 'Mike T.', firstName: 'Mike', unit: 'Unit 805', text: 'Yes please! I\'ll swing by in 10 minutes!', timestamp: Date.now() - 1500000, replies: [] },
        { id: 102, author: 'Jennifer K.', firstName: 'Jennifer', unit: 'Unit 1504', text: 'That sounds amazing! Save me a slice?', timestamp: Date.now() - 1200000, replies: [] },
        { id: 103, author: 'Alex R.', firstName: 'Alex', unit: 'Unit 802', text: 'So kind of you! Love this community 💛', timestamp: Date.now() - 900000, replies: [] }
      ]
    },
    {
      id: 2,
      type: 'ask',
      text: 'Does anyone have a ladder I could borrow this weekend? Need to change some light bulbs in the high ceilings.',
      author: 'Mike T.',
      unit: 'Unit 805',
      timestamp: Date.now() - 7200000, // 2 hours ago
      likes: 2,
      comments: 2,
      commentsList: [
        { id: 201, author: 'Sarah M.', firstName: 'Sarah', unit: 'Unit 1201', text: 'I have a 6ft ladder you can borrow! DM me to arrange pickup.', timestamp: Date.now() - 6000000, replies: [] },
        { id: 202, author: 'Building Staff', firstName: 'Staff', unit: 'Management', text: 'We also have a ladder in the maintenance closet - ask the front desk!', timestamp: Date.now() - 5400000, replies: [] }
      ]
    },
    {
      id: 3,
      type: 'report',
      text: 'Heads up - the west elevator is making a strange noise again. Might want to avoid it until maintenance checks it out.',
      author: 'Jennifer K.',
      unit: 'Unit 1504',
      timestamp: Date.now() - 14400000, // 4 hours ago
      likes: 12,
      comments: 2,
      commentsList: [
        { id: 301, author: 'Building Staff', firstName: 'Staff', unit: 'Management', text: 'Thanks for the heads up! Technician has been called and should arrive within the hour.', timestamp: Date.now() - 13000000, replies: [] },
        { id: 302, author: 'Mike T.', firstName: 'Mike', unit: 'Unit 805', text: 'Noticed this too. Thanks for reporting!', timestamp: Date.now() - 12000000, replies: [] }
      ]
    },
    {
      id: 4,
      type: 'share',
      text: "Moving in next week! So excited to be part of this community. Can't wait to meet everyone at the rooftop BBQ!",
      author: 'Alex R.',
      unit: 'Unit 802',
      timestamp: Date.now() - 86400000, // 1 day ago
      likes: 24,
      comments: 3,
      commentsList: [
        { id: 401, author: 'Sarah M.', firstName: 'Sarah', unit: 'Unit 1201', text: 'Welcome to the building! You\'re going to love it here.', timestamp: Date.now() - 80000000, replies: [] },
        { id: 402, author: 'Jennifer K.', firstName: 'Jennifer', unit: 'Unit 1504', text: 'The rooftop BBQ is the best! See you there!', timestamp: Date.now() - 75000000, replies: [] },
        { id: 403, author: 'Mike T.', firstName: 'Mike', unit: 'Unit 805', text: 'Welcome neighbor! Let us know if you need help moving in.', timestamp: Date.now() - 70000000, replies: [] }
      ]
    }
  ])

  // Add a new post
  const handleAddPost = (newPost) => {
    const post = {
      id: Date.now(),
      type: newPost.type,
      text: newPost.text,
      author: 'You',
      unit: 'Unit 1201',
      timestamp: Date.now(),
      likes: 0,
      comments: 0
    }
    setPosts(prevPosts => [post, ...prevPosts])
  }

  // Store manager onboarding data with localStorage persistence
  const [onboardingData, setOnboardingData] = useState(() => {
    // Try to restore from localStorage on initial load
    try {
      const saved = localStorage.getItem('onboardingData')
      return saved ? JSON.parse(saved) : null
    } catch (e) {
      console.error('Auth error:', e)
      return null
    }
  })

  // Persist onboarding data to localStorage whenever it changes
  useEffect(() => {
    if (onboardingData) {
      try {
        // Don't persist file objects (they can't be serialized)
        const dataToSave = {
          ...onboardingData,
          building: onboardingData.building ? {
            ...onboardingData.building,
            logo: null // Don't persist File objects
          } : null
        }
        localStorage.setItem('onboardingData', JSON.stringify(dataToSave))
      } catch (e) {
        console.error('Failed to save onboarding data:', e)
      }
    }
  }, [onboardingData])

  const handleResidentLogin = (code, building) => {
    setBuildingCode(code)
    setSelectedBuilding(building)
    setCurrentScreen('home')
  }

  // Resident Signup Flow Handlers
  const handleResidentSignupClick = () => {
    setCurrentScreen('resident-signup-entry')
  }

  const handleResidentHaveCode = () => {
    // Go back to login to enter code
    setCurrentScreen('login')
  }

  const handleResidentFindBuilding = () => {
    setCurrentScreen('resident-address-search')
  }

  const handleResidentSelectBuilding = (building) => {
    setSelectedBuilding(building)
    setCurrentScreen('resident-join-building')
  }

  const handleResidentCreateBuilding = (address) => {
    setSearchedAddress(address)
    setCurrentScreen('resident-create-building')
  }

  const handleResidentSignupSuccess = async (result) => {
    console.log('[App] Resident signup success:', result)
    setBuildingCode(result.building?.access_code || '')
    setSelectedBuilding(result.building)
    // Refresh user profile to ensure it's loaded after signup
    await refreshUserProfile()
    // Clear URL params and navigate to resident home
    window.history.replaceState({}, '', '/')
    setCurrentScreen('home')
  }

  const handleJoinSuccess = async (result) => {
    console.log('[App] Join via invite success:', result)
    setBuildingCode(result.building?.access_code || '')
    setSelectedBuilding(result.building)
    // Refresh user profile to ensure it's loaded after signup
    await refreshUserProfile()
    // Clear URL params and navigate to resident home
    window.history.replaceState({}, '', '/')
    setCurrentScreen('home')
  }

  const handleJoinBackToLogin = () => {
    // Clear URL params and go to login
    window.history.replaceState({}, '', '/')
    setCurrentScreen('login')
  }

  const handleResidentEmailLogin = async (email, password) => {
    setAuthError('')
    const { data, error } = await signIn(email, password)
    if (error) {
      setAuthError(error.message)
      return { error }
    }
    // Show splash while profile loads — useEffect will route once userProfile is ready
    setLoginTransitioning(true)
    return { data }
  }

  const handleManagerLogin = async (email, password) => {
    setAuthError('')
    const { data, error } = await signIn(email, password)
    if (error) {
      setAuthError(error.message)
      return { error }
    }
    // Show splash while profile loads — useEffect will route once userProfile is ready
    setLoginTransitioning(true)
    return { data }
  }

  const handleRegisterClick = () => {
    setCurrentScreen('manager-onboarding-step1')
  }

  const handleOnboardingStep1Continue = (formData) => {
    setOnboardingData(formData)
    setCurrentScreen('manager-onboarding-step2')
  }

  const handleOnboardingStep2Continue = (formData) => {
    setOnboardingData(formData)
    setCurrentScreen('manager-onboarding-step3')
  }

  const handleOnboardingStep2Skip = (formData) => {
    setOnboardingData(formData)
    setCurrentScreen('manager-onboarding-step3')
  }

  const handleOnboardingStep3Continue = (formData) => {
    setOnboardingData(formData)
    setCurrentScreen('manager-onboarding-step4')
  }

  const handleOnboardingStep3Skip = (formData) => {
    setOnboardingData(formData)
    setCurrentScreen('manager-onboarding-step4')
  }

  // Shared function to create building and link manager
  const createBuildingAndLinkManager = async (formData) => {
    try {
      // 1. FIRST: Create the auth account (or sign in if already exists)
      console.log('[Onboarding] Creating auth account for:', formData.manager.email)

      let authUser = null

      // Try to sign up first
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: formData.manager.email,
        password: formData.manager.password,
      })

      if (signUpError) {
        // Check if user already exists - try signing in instead
        if (signUpError.message.includes('already registered') ||
            signUpError.message.includes('already exists') ||
            signUpError.message.includes('User already registered')) {
          console.log('[Onboarding] User exists, attempting sign in...')

          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: formData.manager.email,
            password: formData.manager.password,
          })

          if (signInError) {
            console.error('[Onboarding] Sign in failed:', signInError)
            return { success: false, error: `Account exists but sign in failed: ${signInError.message}` }
          }

          authUser = signInData.user
          console.log('[Onboarding] Signed in existing user:', authUser.id)
        } else {
          // Some other signup error
          console.error('[Onboarding] Sign up failed:', signUpError)
          return { success: false, error: `Failed to create account: ${signUpError.message}` }
        }
      } else {
        authUser = signUpData.user
        console.log('[Onboarding] Created new auth user:', authUser.id)
      }

      if (!authUser) {
        return { success: false, error: 'Failed to authenticate user' }
      }

      // 2. Insert the building into public.buildings
      console.log('[Onboarding] Creating building...')
      const { data: newBuilding, error: buildingError } = await supabase
        .from('buildings')
        .insert({
          name: formData.building.name,
          address: formData.building.address,
          total_floors: formData.building.floors,
          total_units: formData.building.units,
          access_code: formData.building.code,
        })
        .select()
        .single()

      if (buildingError) {
        console.error('[Onboarding] Failed to create building:', buildingError)
        return { success: false, error: `Failed to create building: ${buildingError.message}` }
      }

      console.log('[Onboarding] Building created:', newBuilding)

      // 3. Update the user's record with building_id and role='manager'
      console.log('[Onboarding] Linking user to building...')
      console.log('[Onboarding] Auth user ID:', authUser.id)
      console.log('[Onboarding] Building ID to set:', newBuilding.id)

      // First check if user row exists
      const { data: existingUser, error: fetchError } = await supabase
        .from('users')
        .select('id, email, building_id')
        .eq('id', authUser.id)
        .single()

      console.log('[Onboarding] Fetch existing user result:', { existingUser, fetchError })

      if (existingUser) {
        // User row exists, update it
        console.log('[Onboarding] User row exists, updating with building_id...')

        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update({
            building_id: newBuilding.id,
            role: 'manager',
            full_name: formData.manager?.name || null,
            phone: formData.manager?.phone || null,
          })
          .eq('id', authUser.id)
          .select()
          .single()

        console.log('[Onboarding] Update result:', { updatedUser, updateError })

        if (updateError) {
          console.error('[Onboarding] Failed to update user:', updateError)
          return { success: false, error: `Failed to link manager to building: ${updateError.message}` }
        }

        // Verify the update worked
        if (!updatedUser || updatedUser.building_id !== newBuilding.id) {
          console.error('[Onboarding] Update may have been blocked by RLS. Expected building_id:', newBuilding.id, 'Got:', updatedUser?.building_id)
          return { success: false, error: 'Failed to update user - RLS may be blocking the update. Check Supabase policies.' }
        }

        console.log('[Onboarding] User successfully updated:', updatedUser)
      } else {
        // User row doesn't exist, insert it
        console.log('[Onboarding] User row does not exist, inserting new row...')

        const { data: insertedUser, error: insertError } = await supabase
          .from('users')
          .insert({
            id: authUser.id,
            email: formData.manager.email,
            building_id: newBuilding.id,
            role: 'manager',
            full_name: formData.manager?.name || null,
            phone: formData.manager?.phone || null,
          })
          .select()
          .single()

        console.log('[Onboarding] Insert result:', { insertedUser, insertError })

        if (insertError) {
          console.error('[Onboarding] Failed to insert user:', insertError)
          return { success: false, error: `Failed to create manager profile: ${insertError.message}` }
        }

        console.log('[Onboarding] User successfully inserted:', insertedUser)
      }

      console.log('[Onboarding] User linked to building:', newBuilding.id)

      return { success: true, building: newBuilding, user: authUser }
    } catch (err) {
      console.error('[Onboarding] Unexpected error:', err)
      return { success: false, error: err.message }
    }
  }

  const handleOnboardingStep4Launch = async (formData) => {
    setOnboardingData(formData)

    // Create building and link manager in Supabase
    const result = await createBuildingAndLinkManager(formData)

    if (!result.success) {
      alert(`Error: ${result.error}\n\nPlease try again.`)
      return // Don't navigate away on error
    }

    // Send real invites if residents were imported
    if (formData.invitesSent && formData.residents?.length > 0) {
      try {
        const selectedResidents = formData.residents.filter(r => r.selected !== false)
        if (selectedResidents.length > 0) {
          const inviteResult = await processInviteBatch(
            result.building.id,
            result.user.id,
            selectedResidents,
            result.building.name
          )
          console.log('[Onboarding] Invites sent:', inviteResult)
          alert(`Success! ${inviteResult.emailsSent} invite${inviteResult.emailsSent !== 1 ? 's' : ''} sent to your residents!`)
        }
      } catch (err) {
        console.error('[Onboarding] Failed to send invites:', err)
        // Non-blocking: building was still created successfully
        alert('Building created! Some invites may not have sent. You can resend from Settings.')
      }
    }

    // Clear localStorage onboarding data since we're done
    localStorage.removeItem('onboardingData')
    setCurrentScreen('manager-dashboard')
  }

  const handleOnboardingStep4Skip = async (formData) => {
    setOnboardingData(formData)

    // Create building and link manager in Supabase
    const result = await createBuildingAndLinkManager(formData)

    if (!result.success) {
      alert(`Error: ${result.error}\n\nPlease try again.`)
      return // Don't navigate away on error
    }

    // Clear localStorage onboarding data since we're done
    localStorage.removeItem('onboardingData')

    setCurrentScreen('manager-dashboard')
  }

  const handleDemoLogin = async (role = 'manager') => {
    const { data, error } = await loginAsDemo(role)
    if (!error) {
      // Set demo building data for testing
      setOnboardingData({
        building: {
          name: 'The Paramount',
          code: 'PARA123'
        },
        manager: {
          name: 'Taylor Young',
          email: 'taylor@paramount.com'
        }
      })
      if (role === 'manager') {
        setCurrentScreen('manager-dashboard')
      } else {
        setCurrentScreen('home')
      }
    }
  }

  const handleNavigation = (featureTitle, eventData = null) => {
    // Handle logout
    if (featureTitle === 'Logout') {
      handleLogout()
      return
    }

    // Handle event detail navigation
    if (featureTitle === 'EventDetail' && eventData) {
      setPreviousScreen(currentScreen)
      setSelectedEvent(eventData)
      setCurrentScreen('event-detail')
      return
    }

    // Handle post detail navigation
    if (featureTitle === 'PostDetail' && eventData) {
      setPreviousScreen(currentScreen)
      setSelectedPost(eventData)
      setCurrentScreen('post-detail')
      return
    }

    // When someone clicks a feature card, navigate to that screen
    if (featureTitle === 'Announcements') {
      setCurrentScreen('announcements')
    } else if (featureTitle === 'Packages') {
      setCurrentScreen('packages')
    } else if (featureTitle === 'Events') {
      setCurrentScreen('events')
    } else if (featureTitle === 'Neighbors') {
      setCurrentScreen('neighbors')
    } else if (featureTitle === 'Emergency') {
      setCurrentScreen('emergency')
    } else if (featureTitle === 'Elevator Booking') {
      setCurrentScreen('elevator-booking')
    } else if (featureTitle === 'Community') {
      setCurrentScreen('community')
    } else if (featureTitle === 'Bulletin Board') {
      setCurrentScreen('bulletin-board')
    } else if (featureTitle === 'Settings') {
      setCurrentScreen('settings')
    } else if (featureTitle === 'Calendar') {
      setCurrentScreen('calendar')
    } else if (featureTitle === 'BuildingInfo') {
      setCurrentScreen('building-info')
    } else if (featureTitle === 'Building') {
      setCurrentScreen('building')
    } else if (featureTitle === 'Home') {
      setCurrentScreen('home')
    } else if (featureTitle === 'messages' || featureTitle === 'Messages') {
      setCurrentScreen('messages')
    } else if (featureTitle === 'FAQ' || featureTitle === 'faq') {
      setCurrentScreen('faq')
    } else if (featureTitle === 'Documents' || featureTitle === 'documents') {
      setCurrentScreen('documents')
    } else if (featureTitle === 'Invite Neighbors') {
      setCurrentScreen('invite-neighbors')
    }
  }

  const handleEventDetailBack = () => {
    setSelectedEvent(null)
    setCurrentScreen(previousScreen)
  }

  const handlePostDetailBack = () => {
    setSelectedPost(null)
    setCurrentScreen(previousScreen)
  }

  const handleBack = () => {
    // Go back to the Home screen
    setCurrentScreen('home')
  }

  const handleLogout = async () => {
    await signOut()
    // Reset to login screen and clear building code
    setBuildingCode('')
    setOnboardingData(null)
    // Clear localStorage onboarding data
    localStorage.removeItem('onboardingData')
    setCurrentScreen('login')
  }

  // Show loading splash while auth + profile loads, or during login transition
  if (loading || loginTransitioning) {
    return <LoadingSplash theme="neutral" />
  }


  // Define which screens are resident screens (should show bottom nav)
  const residentScreens = [
    'home', 'announcements', 'packages', 'events', 'neighbors', 'emergency',
    'elevator-booking', 'community', 'bulletin-board', 'settings', 'building-info',
    'calendar', 'building', 'event-detail', 'post-detail', 'messages', 'faq', 'documents',
    'invite-neighbors'
  ]
  const showBottomNav = residentScreens.includes(currentScreen)

  // Shared bottom nav for resident screens
  const bottomNav = <BottomNav currentScreen={currentScreen} onNavigate={handleNavigation} />

  // Show different screens based on currentScreen value
  if (currentScreen === 'announcements') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <Announcements onBack={handleBack} />
      </MobileShell>
    )
  }

  if (currentScreen === 'packages') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <Packages onBack={handleBack} />
      </MobileShell>
    )
  }

  if (currentScreen === 'events') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <Events onBack={handleBack} />
      </MobileShell>
    )
  }

  if (currentScreen === 'neighbors') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <Neighbors onBack={handleBack} isDemoMode={isDemoMode} userProfile={userProfile} onNavigate={handleNavigation} />
      </MobileShell>
    )
  }

  if (currentScreen === 'emergency') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <Emergency onBack={handleBack} />
      </MobileShell>
    )
  }

  if (currentScreen === 'elevator-booking') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <ElevatorBooking onBack={handleBack} />
      </MobileShell>
    )
  }

  if (currentScreen === 'community') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <CommunityFeed onNavigate={handleNavigation} posts={posts} onAddPost={handleAddPost} isDemoMode={isDemoMode} userProfile={userProfile} />
      </MobileShell>
    )
  }

  if (currentScreen === 'bulletin-board') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <BulletinBoard onBack={handleBack} />
      </MobileShell>
    )
  }

  if (currentScreen === 'settings') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <Settings onBack={handleBack} onLogout={handleLogout} onNavigate={handleNavigation} isDemoMode={isDemoMode} userProfile={userProfile} />
      </MobileShell>
    )
  }

  if (currentScreen === 'building-info') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <BuildingInfo onBack={() => setCurrentScreen('settings')} isDemoMode={isDemoMode} userProfile={userProfile} />
      </MobileShell>
    )
  }

  if (currentScreen === 'calendar') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <CalendarView onNavigate={handleNavigation} />
      </MobileShell>
    )
  }

  if (currentScreen === 'event-detail' && selectedEvent) {
    return (
      <MobileShell bottomNav={bottomNav}>
        <EventDetail event={selectedEvent} onBack={handleEventDetailBack} onNavigate={handleNavigation} />
      </MobileShell>
    )
  }

  if (currentScreen === 'post-detail' && selectedPost) {
    return (
      <MobileShell bottomNav={bottomNav}>
        <PostDetail post={selectedPost} onBack={handlePostDetailBack} onNavigate={handleNavigation} userProfile={userProfile} isDemoMode={isDemoMode} />
      </MobileShell>
    )
  }

  if (currentScreen === 'building') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <Building onNavigate={handleNavigation} />
      </MobileShell>
    )
  }

  if (currentScreen === 'messages') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <ResidentMessages
          onBack={() => setCurrentScreen('home')}
          onNavigate={handleNavigation}
        />
      </MobileShell>
    )
  }

  if (currentScreen === 'faq') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <ResidentFAQ
          onBack={() => setCurrentScreen('building')}
        />
      </MobileShell>
    )
  }

  if (currentScreen === 'documents') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <ResidentDocuments
          onBack={() => setCurrentScreen('building')}
        />
      </MobileShell>
    )
  }

  if (currentScreen === 'invite-neighbors') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <InviteNeighbors
          onBack={() => setCurrentScreen('building')}
        />
      </MobileShell>
    )
  }

  // Resident Signup Flow Screens
  if (currentScreen === 'resident-signup-entry') {
    return (
      <ResidentSignupEntry
        onBack={() => setCurrentScreen('login')}
        onHaveCode={handleResidentHaveCode}
        onFindBuilding={handleResidentFindBuilding}
        onDemoLogin={handleDemoLogin}
      />
    )
  }

  if (currentScreen === 'resident-address-search') {
    return (
      <ResidentAddressSearch
        onBack={() => setCurrentScreen('resident-signup-entry')}
        onSelectBuilding={handleResidentSelectBuilding}
        onCreateBuilding={handleResidentCreateBuilding}
      />
    )
  }

  if (currentScreen === 'resident-join-building' && selectedBuilding) {
    return (
      <ResidentJoinBuilding
        building={selectedBuilding}
        onBack={() => {
          window.history.replaceState({}, '', '/')
          setCurrentScreen('login')
        }}
        onSuccess={handleResidentSignupSuccess}
      />
    )
  }

  if (currentScreen === 'resident-create-building') {
    return (
      <ResidentCreateBuilding
        initialAddress={searchedAddress}
        onBack={() => setCurrentScreen('resident-address-search')}
        onSuccess={handleResidentSignupSuccess}
      />
    )
  }

  // Join via Invite Token
  if (currentScreen === 'join') {
    return (
      <Join
        onSuccess={handleJoinSuccess}
        onBackToLogin={handleJoinBackToLogin}
      />
    )
  }

  // Manager Onboarding Flow Screens
  if (currentScreen === 'manager-onboarding-step1') {
    return (
      <ManagerOnboardingStep1
        onBack={() => {
          // Clear onboarding data when going back to login
          setOnboardingData(null)
          localStorage.removeItem('onboardingData')
          setCurrentScreen('login')
        }}
        onContinue={handleOnboardingStep1Continue}
        initialData={onboardingData}
      />
    )
  }

  if (currentScreen === 'manager-onboarding-step2') {
    return (
      <ManagerOnboardingStep2
        onBack={() => setCurrentScreen('manager-onboarding-step1')}
        onContinue={handleOnboardingStep2Continue}
        onSkip={handleOnboardingStep2Skip}
        initialData={onboardingData}
      />
    )
  }

  if (currentScreen === 'manager-onboarding-step3') {
    return (
      <ManagerOnboardingStep3
        onBack={() => setCurrentScreen('manager-onboarding-step2')}
        onContinue={handleOnboardingStep3Continue}
        onSkip={handleOnboardingStep3Skip}
        initialData={onboardingData}
        isDemoMode={isDemoMode}
      />
    )
  }

  if (currentScreen === 'manager-onboarding-step4') {
    return (
      <ManagerOnboardingStep4
        onBack={() => setCurrentScreen('manager-onboarding-step3')}
        onLaunch={handleOnboardingStep4Launch}
        onSkip={handleOnboardingStep4Skip}
        initialData={onboardingData}
      />
    )
  }

  if (currentScreen === 'manager-dashboard') {
    const buildingData = onboardingData ? {
      name: onboardingData.building?.name || 'The Paramount',
      code: onboardingData.building?.code || 'PARA123',
      manager: {
        name: onboardingData.manager?.name || 'Taylor Young',
        email: onboardingData.manager?.email || 'taylor@paramount.com'
      }
    } : null

    return (
      <>
                <ManagerDashboard
          onLogout={handleLogout}
          buildingData={buildingData}
        />
      </>
    )
  }

  if (currentScreen === 'home') {
    return (
      <>
                <MobileShell bottomNav={bottomNav}>
          <Home buildingCode={buildingCode} onNavigate={handleNavigation} isDemoMode={isDemoMode} userProfile={userProfile} />
        </MobileShell>
      </>
    )
  }

  // Otherwise, show the Login screen
  return (
    <>
            <Login
        onResidentLogin={handleResidentLogin}
        onResidentEmailLogin={handleResidentEmailLogin}
        onManagerLogin={handleManagerLogin}
        onRegisterClick={handleRegisterClick}
        onDemoLogin={handleDemoLogin}
        onResidentSignupClick={handleResidentSignupClick}
        onResidentSelectBuilding={handleResidentSelectBuilding}
        onResidentCreateBuilding={handleResidentCreateBuilding}
        authError={authError}
      />
    </>
  )
}

export default App
