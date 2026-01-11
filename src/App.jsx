import { useState } from 'react'
import './App.css'
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
import ManagerOnboardingStep1 from './ManagerOnboardingStep1'
import ManagerOnboardingStep2 from './ManagerOnboardingStep2'
import ManagerOnboardingStep3 from './ManagerOnboardingStep3'
import ManagerOnboardingStep4 from './ManagerOnboardingStep4'
import ManagerDashboard from './ManagerDashboard'

function App() {
  const [buildingCode, setBuildingCode] = useState('')
  const [currentScreen, setCurrentScreen] = useState('login')

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
      comments: 3
    },
    {
      id: 2,
      type: 'ask',
      text: 'Does anyone have a ladder I could borrow this weekend? Need to change some light bulbs in the high ceilings.',
      author: 'Mike T.',
      unit: 'Unit 805',
      timestamp: Date.now() - 7200000, // 2 hours ago
      likes: 2,
      comments: 5
    },
    {
      id: 3,
      type: 'report',
      text: 'Heads up - the west elevator is making a strange noise again. Might want to avoid it until maintenance checks it out.',
      author: 'Jennifer K.',
      unit: 'Unit 1504',
      timestamp: Date.now() - 14400000, // 4 hours ago
      likes: 12,
      comments: 4
    },
    {
      id: 4,
      type: 'share',
      text: "Moving in next week! So excited to be part of this community. Can't wait to meet everyone at the rooftop BBQ!",
      author: 'Alex R.',
      unit: 'Unit 802',
      timestamp: Date.now() - 86400000, // 1 day ago
      likes: 24,
      comments: 11
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

  // Store manager onboarding data
  const [onboardingData, setOnboardingData] = useState(null)

  const handleResidentLogin = (code) => {
    setBuildingCode(code)
    setCurrentScreen('home')
  }

  const handleManagerLogin = (email, password) => {
    // For now, just log and show alert - will implement actual auth later
    console.log('Manager login:', email)
    alert('Manager login coming soon! Use the register link to set up a new building.')
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

  const handleOnboardingStep4Launch = (formData) => {
    setOnboardingData(formData)
    // Show success message and go to dashboard
    if (formData.invitesSent) {
      alert(`Success! Invites sent to ${formData.inviteCount} residents!`)
    }
    setCurrentScreen('manager-dashboard')
  }

  const handleOnboardingStep4Skip = (formData) => {
    setOnboardingData(formData)
    setCurrentScreen('manager-dashboard')
  }

  const handleDemoLogin = () => {
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
    setCurrentScreen('manager-dashboard')
  }

  const handleNavigation = (featureTitle) => {
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
    }
  }

  const handleBack = () => {
    // Go back to the Home screen
    setCurrentScreen('home')
  }

  const handleLogout = () => {
    // Reset to login screen and clear building code
    setBuildingCode('')
    setCurrentScreen('login')
  }

  // Show different screens based on currentScreen value
  if (currentScreen === 'announcements') {
    return <Announcements onBack={handleBack} />
  }

  if (currentScreen === 'packages') {
    return <Packages onBack={handleBack} />
  }

  if (currentScreen === 'events') {
    return <Events onBack={handleBack} />
  }

  if (currentScreen === 'neighbors') {
    return <Neighbors onBack={handleBack} />
  }

  if (currentScreen === 'emergency') {
    return <Emergency onBack={handleBack} />
  }

  if (currentScreen === 'elevator-booking') {
    return <ElevatorBooking onBack={handleBack} />
  }

  if (currentScreen === 'community') {
    return <CommunityFeed onBack={handleBack} posts={posts} onAddPost={handleAddPost} />
  }

  if (currentScreen === 'bulletin-board') {
    return <BulletinBoard onBack={handleBack} />
  }

  if (currentScreen === 'settings') {
    return <Settings onBack={handleBack} onLogout={handleLogout} onNavigate={handleNavigation} />
  }

  if (currentScreen === 'building-info') {
    return <BuildingInfo onBack={() => setCurrentScreen('settings')} />
  }

  if (currentScreen === 'calendar') {
    return <CalendarView onBack={handleBack} />
  }

  if (currentScreen === 'manager-onboarding-step1') {
    return (
      <ManagerOnboardingStep1
        onBack={() => setCurrentScreen('login')}
        onContinue={handleOnboardingStep1Continue}
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
    return <Home buildingCode={buildingCode} onNavigate={handleNavigation} />
  }

  // Otherwise, show the Login screen
  return (
    <Login
      onResidentLogin={handleResidentLogin}
      onManagerLogin={handleManagerLogin}
      onRegisterClick={handleRegisterClick}
      onDemoLogin={handleDemoLogin}
    />
  )
}

export default App
