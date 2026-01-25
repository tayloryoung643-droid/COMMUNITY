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
import ManagerDashboard from './ManagerDashboard'
import ResidentSignupEntry from './ResidentSignupEntry'
import ResidentAddressSearch from './ResidentAddressSearch'
import ResidentJoinBuilding from './ResidentJoinBuilding'
import ResidentCreateBuilding from './ResidentCreateBuilding'

function App() {
  const { user, userProfile, loading, isDemoMode, signIn, signOut, loginAsDemo, refreshUserProfile } = useAuth()
  const [buildingCode, setBuildingCode] = useState('')
  const [currentScreen, setCurrentScreen] = useState('login')
  const [authError, setAuthError] = useState('')
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [selectedPost, setSelectedPost] = useState(null)
  const [previousScreen, setPreviousScreen] = useState('home')

  // Resident signup flow state
  const [selectedBuilding, setSelectedBuilding] = useState(null)
  const [searchedAddress, setSearchedAddress] = useState('')

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
    } catch {
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
    // Navigate to resident home
    setCurrentScreen('home')
  }

  const handleManagerLogin = async (email, password) => {
    setAuthError('')
    const { data, error } = await signIn(email, password)
    if (error) {
      setAuthError(error.message)
      return { error }
    }
    // Navigate to manager dashboard on successful login
    setCurrentScreen('manager-dashboard')
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

    // Clear localStorage onboarding data since we're done
    localStorage.removeItem('onboardingData')

    // Show success message and go to dashboard
    if (formData.invitesSent) {
      alert(`Success! Invites sent to ${formData.inviteCount} residents!`)
    }
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

  // Show loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        backgroundColor: '#0f172a',
        color: 'white',
        fontSize: '18px'
      }}>
        Loading...
      </div>
    )
  }

  // Define which screens are resident screens (should show bottom nav)
  const residentScreens = [
    'home', 'announcements', 'packages', 'events', 'neighbors', 'emergency',
    'elevator-booking', 'community', 'bulletin-board', 'settings', 'building-info',
    'calendar', 'building', 'event-detail', 'post-detail'
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
        <Neighbors onBack={handleBack} />
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
        <CommunityFeed onNavigate={handleNavigation} posts={posts} onAddPost={handleAddPost} />
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
        <Settings onBack={handleBack} onLogout={handleLogout} onNavigate={handleNavigation} />
      </MobileShell>
    )
  }

  if (currentScreen === 'building-info') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <BuildingInfo onBack={() => setCurrentScreen('settings')} />
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
        <PostDetail post={selectedPost} onBack={handlePostDetailBack} onNavigate={handleNavigation} />
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
        onBack={() => setCurrentScreen('resident-address-search')}
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
      <ManagerDashboard
        onLogout={handleLogout}
        buildingData={buildingData}
      />
    )
  }

  if (currentScreen === 'home') {
    return (
      <MobileShell bottomNav={bottomNav}>
        <Home buildingCode={buildingCode} onNavigate={handleNavigation} />
      </MobileShell>
    )
  }

  // Otherwise, show the Login screen
  return (
    <Login
      onResidentLogin={handleResidentLogin}
      onManagerLogin={handleManagerLogin}
      onRegisterClick={handleRegisterClick}
      onDemoLogin={handleDemoLogin}
      onResidentSignupClick={handleResidentSignupClick}
      authError={authError}
    />
  )
}

export default App
