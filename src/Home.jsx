import { useState, useEffect } from 'react'
import { Package, Calendar, Users, ChevronRight, X, Image, Send, Check, Cloud, Sun, CloudRain, Snowflake, Moon, HelpCircle, MessageSquare, UserPlus, Sparkles, ClipboardList, Heart, MessageCircle, Share2 } from 'lucide-react'
import HamburgerMenu from './HamburgerMenu'
import { eventsData } from './eventsData'
import { supabase } from './lib/supabase'
import { getHomeIntelligence, logEngagementEvent } from './services/homeIntelligenceService'
import { getPosts as getCommunityPosts } from './services/communityPostService'
import { getActiveListings } from './services/bulletinService'
import { useAuth } from './contexts/AuthContext'
import FeedbackModal from './components/FeedbackModal'
import LoadingSplash from './components/LoadingSplash'
import './Home.css'

function Home({ buildingCode, onNavigate, isDemoMode, userProfile }) {
  // Get cached building background URL from context
  const { buildingBackgroundUrl, isResidentLed } = useAuth()

  const floor = "12"
  const userUnit = userProfile?.unit_number || "1201"

  // Contact Manager modal state
  const [showContactModal, setShowContactModal] = useState(false)
  const [contactForm, setContactForm] = useState({
    subject: 'Maintenance Request',
    message: '',
    hasPhoto: false
  })
  const [showContactSuccess, setShowContactSuccess] = useState(false)

  const unreadMessages = 2 // Simulated unread count

  // Real data state (for non-demo users)
  const [realPackages, setRealPackages] = useState([])
  const [realEvents, setRealEvents] = useState([])
  const [realPosts, setRealPosts] = useState([])
  const [newJoiners, setNewJoiners] = useState([])
  const [bulletinListings, setBulletinListings] = useState([])
  const [dataLoading, setDataLoading] = useState(!isDemoMode)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [initialLoadDone, setInitialLoadDone] = useState(isDemoMode)
  const [splashFading, setSplashFading] = useState(false)

  // Home Intelligence state (context lines)
  const [contextLine1, setContextLine1] = useState(null)
  const [contextLine2, setContextLine2] = useState(null)

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Fetch real data for authenticated users
  useEffect(() => {
    const fetchRealData = async () => {
      if (isDemoMode) {
        console.log('[Home] MODE: DEMO - using hardcoded demo data')
        return
      }

      const buildingId = userProfile?.building_id
      if (!buildingId) {
        console.log('[Home] MODE: REAL but no building_id - showing empty states')
        return
      }

      console.log('[Home] MODE: REAL - fetching data for building:', buildingId)
      setDataLoading(true)

      try {
        // Fetch packages for this building
        const { data: packages, error: packagesError } = await supabase
          .from('packages')
          .select('*')
          .eq('building_id', buildingId)
          .eq('status', 'pending')
          .order('created_at', { ascending: false })
          .limit(5)

        if (!packagesError) {
          setRealPackages(packages || [])
          console.log('[Home] Packages fetched:', packages?.length || 0)
        }

        // Fetch events for this building
        const { data: events, error: eventsError } = await supabase
          .from('events')
          .select('*')
          .eq('building_id', buildingId)
          .gte('start_time', new Date().toISOString())
          .order('start_time', { ascending: true })
          .limit(5)

        if (!eventsError && events) {
          // Transform events to match the expected format
          const transformedEvents = events.map(event => {
            const eventDate = event.start_time ? new Date(event.start_time) : null
            const dateStr = eventDate ? eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : ''
            const timeStr = event.event_time || (eventDate ? eventDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }) : '')
            const location = event.location || ''

            return {
              id: event.id,
              title: event.title,
              date: dateStr,
              time: timeStr,
              location: location,
              category: event.category || 'social',
              description: event.description || '',
              // Create subtitle for Coming Up section display
              subtitle: [dateStr, timeStr, location].filter(Boolean).join(' · ')
            }
          })
          setRealEvents(transformedEvents)
          console.log('[Home] Events fetched:', transformedEvents.length)
        } else if (eventsError) {
          console.error('[Home] Events fetch error:', eventsError)
        }

        // Fetch community posts with dynamic like/comment counts + avatar signed URLs
        try {
          const postsData = await getCommunityPosts(buildingId)
          // Generate signed avatar URLs for post authors
          const avatarUrlMap = {}
          const authorsWithAvatars = (postsData || [])
            .filter(p => p.author?.avatar_url)
            .map(p => ({ id: p.author.id, avatar_url: p.author.avatar_url }))
            .filter((a, i, arr) => arr.findIndex(x => x.id === a.id) === i)
          await Promise.all(
            authorsWithAvatars.map(async (author) => {
              try {
                const { data: urlData } = await supabase.storage
                  .from('profile-images')
                  .createSignedUrl(author.avatar_url, 3600)
                if (urlData?.signedUrl) avatarUrlMap[author.id] = urlData.signedUrl
              } catch (e) { /* ignore */ }
            })
          )
          // Attach signed URLs to posts
          ;(postsData || []).forEach(post => {
            if (post.author?.id && avatarUrlMap[post.author.id]) {
              post.author.avatar_signed_url = avatarUrlMap[post.author.id]
            }
          })
          setRealPosts(postsData || [])
          console.log('[Home] Posts fetched:', postsData?.length || 0)
        } catch (postsError) {
          console.error('[Home] Posts fetch error:', postsError)
        }

        // Fetch new joiners (users who joined in the last 7 days)
        const sevenDaysAgo = new Date()
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

        const { data: joiners, error: joinersError } = await supabase
          .from('users')
          .select('id, full_name, unit_number, created_at')
          .eq('building_id', buildingId)
          .eq('role', 'resident')
          .gte('created_at', sevenDaysAgo.toISOString())
          .order('created_at', { ascending: false })
          .limit(5)

        if (!joinersError) {
          setNewJoiners(joiners || [])
          console.log('[Home] New joiners fetched:', joiners?.length || 0)
        }

        // Fetch bulletin listings for this building
        try {
          const bulletinData = await getActiveListings(buildingId)
          setBulletinListings(bulletinData || [])
          console.log('[Home] Bulletin listings fetched:', bulletinData?.length || 0)
        } catch (bulletinError) {
          console.error('[Home] Bulletin fetch error:', bulletinError)
          setBulletinListings([])
        }

        console.log('[Home] Data fetch complete:', {
          isDemoMode: false,
          buildingId,
          packages: packages?.length || 0,
          events: events?.length || 0,
          joiners: joiners?.length || 0
        })
      } catch (error) {
        console.error('[Home] Error fetching data:', error)
      } finally {
        setDataLoading(false)
      }
    }

    fetchRealData()
  }, [isDemoMode, userProfile?.building_id])

  // Handle splash fade-out when initial data load completes
  useEffect(() => {
    if (!dataLoading && !initialLoadDone) {
      setSplashFading(true)
      const timer = setTimeout(() => {
        setInitialLoadDone(true)
        setSplashFading(false)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [dataLoading, initialLoadDone])

  // Fetch Home Intelligence data (context lines) for real users
  useEffect(() => {
    const fetchHomeIntelligence = async () => {
      if (isDemoMode) {
        // Demo mode: show a static context line
        setContextLine1('3 events this week · 3 packages waiting · 4 new neighbors')
        setContextLine2(null)
        return
      }

      const buildingId = userProfile?.building_id
      const userId = userProfile?.id

      if (!buildingId || !userId) {
        setContextLine1(null)
        setContextLine2(null)
        return
      }

      try {
        const intelligence = await getHomeIntelligence({
          userId,
          buildingId,
          buildingName: userProfile?.buildings?.name || userProfile?.buildings?.address || 'Your Building'
        })

        setContextLine1(intelligence.contextLine1)
        setContextLine2(intelligence.contextLine2)

        console.log('[Home] Intelligence loaded:', {
          line1: intelligence.contextLine1,
          line2: intelligence.contextLine2,
          fromCache: intelligence.fromCache
        })
      } catch (err) {
        console.warn('[Home] Failed to load intelligence:', err.message)
        // Fail silently - context lines are optional enhancement
        setContextLine1(null)
        setContextLine2(null)
      }
    }

    fetchHomeIntelligence()
  }, [isDemoMode, userProfile])

  // Log home_view engagement event on mount (for real users)
  useEffect(() => {
    if (isDemoMode) return

    const buildingId = userProfile?.building_id
    const userId = userProfile?.id

    if (buildingId && userId) {
      logEngagementEvent({
        userId,
        buildingId,
        eventType: 'home_view'
      })
    }
  }, [isDemoMode, userProfile?.building_id, userProfile?.id])

  const subjectOptions = [
    'Maintenance Request',
    'Question',
    'Complaint',
    'Feedback',
    'Other'
  ]

  // Weather data (simulated - would come from weather API)
  const [currentTime, setCurrentTime] = useState(new Date())
  const weatherData = {
    temp: 58,
    condition: 'clear',
    conditionText: 'Mostly Clear'
  }

  // Update time every minute
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getWeatherIcon = (condition) => {
    const hour = currentTime.getHours()
    const isNight = hour >= 18 || hour < 6
    if (isNight) return Moon
    switch (condition) {
      case 'clear':
      case 'sunny': return Sun
      case 'cloudy': return Cloud
      case 'rainy': return CloudRain
      case 'snowy': return Snowflake
      default: return Sun
    }
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const WeatherIcon = getWeatherIcon(weatherData.condition)

  const handleContactSubmit = () => {
    if (contactForm.message.trim()) {
      // For now, just show success - would send email later
      setShowContactModal(false)
      setShowContactSuccess(true)
      setContactForm({ subject: 'Maintenance Request', message: '', hasPhoto: false })
      setTimeout(() => setShowContactSuccess(false), 3000)
    }
  }

  const handleFeatureClick = (featureTitle) => {
    // Log engagement for real users
    if (!isDemoMode && userProfile?.id && userProfile?.building_id) {
      const eventTypeMap = {
        'Packages': 'package_open',
        'Calendar': 'event_rsvp',
        'Community': 'post_open',
        'Bulletin Board': 'bulletin_open'
      }
      const eventType = eventTypeMap[featureTitle] || 'home_view'
      logEngagementEvent({
        userId: userProfile.id,
        buildingId: userProfile.building_id,
        eventType,
        entityType: featureTitle.toLowerCase()
      })
    }

    if (onNavigate) {
      onNavigate(featureTitle)
    }
  }

  // Default hero image URL
  const defaultHeroImageUrl = "https://jsjocdxqxfcashrhjbgn.supabase.co/storage/v1/object/public/building-images/5e3b6dae-b373-414e-9707-b6e182525ea6/background.jpg"

  // Hero image URL - use building's custom background if available, otherwise default
  // Used in BOTH the hero card AND the ambient background
  const heroImageUrl = buildingBackgroundUrl || defaultHeroImageUrl

  // Building name - use real building name for authenticated users
  const buildingName = isDemoMode
    ? 'Paramount'
    : (userProfile?.buildings?.name || userProfile?.buildings?.address || 'Your Building')

  // Get upcoming events - demo data for demo mode, real data for real users
  const upcomingEvents = isDemoMode ? eventsData : realEvents

  // Handler to open event detail
  const handleEventClick = (event) => {
    // Log engagement for real users
    if (!isDemoMode && userProfile?.id && userProfile?.building_id) {
      logEngagementEvent({
        userId: userProfile.id,
        buildingId: userProfile.building_id,
        eventType: 'event_rsvp',
        entityType: 'event',
        entityId: event.id,
        topic: event.category || 'social'
      })
    }

    if (onNavigate) {
      onNavigate('EventDetail', event)
    }
  }

  // Demo bulletin listings
  const demoBulletinListings = [
    {
      id: 'demo-bl-1',
      title: 'Parking Spot Available — P2 Level',
      price: '$150/mo',
      category: 'parking',
      created_at: new Date(Date.now() - 7200000).toISOString(),
      author: { full_name: 'David Kim', avatar_signed_url: null },
    },
    {
      id: 'demo-bl-2',
      title: 'Free Couch — Must Pick Up by Friday',
      price: 0,
      category: 'for_sale',
      created_at: new Date(Date.now() - 18000000).toISOString(),
      author: { full_name: 'Sarah Mitchell', avatar_signed_url: null },
    },
    {
      id: 'demo-bl-3',
      title: 'Looking for Dog Walker',
      price: '$20/walk',
      category: 'iso',
      created_at: new Date(Date.now() - 43200000).toISOString(),
      author: { full_name: 'Emily Chen', avatar_signed_url: null },
    },
  ]

  // Demo new joiners
  const demoNewJoiners = [
    { id: 'demo-j1', full_name: 'Emily Chen', unit_number: '1205', created_at: new Date(Date.now() - 86400000).toISOString() },
    { id: 'demo-j2', full_name: 'Marcus Johnson', unit_number: '908', created_at: new Date(Date.now() - 172800000).toISOString() },
  ]

  // Demo community posts
  const demoCommunityPosts = [
    {
      id: 99,
      type: 'ask',
      text: "Does anyone have a ladder I could borrow this weekend? Need to change some light bulbs in the high ceilings. Happy to return it Sunday evening!",
      author: 'Mike T.',
      unit: 'Unit 805',
      timestamp: Date.now() - 7200000,
      likes: 2,
      comments: 3
    },
    {
      id: 98,
      type: 'share',
      text: "Just made fresh banana bread and have extra! Anyone want some? I'm in unit 1201.",
      author: 'Sarah M.',
      unit: 'Unit 1201',
      timestamp: Date.now() - 14400000,
      likes: 8,
      comments: 5
    },
    {
      id: 97,
      type: 'share',
      text: "Welcome to all new residents this month! We're thrilled to have you at The Paramount. Don't forget to check the calendar for upcoming events and say hello in the Community feed!",
      author: 'The Paramount',
      unit: 'Management',
      timestamp: Date.now() - 28800000,
      likes: 12,
      comments: 4
    }
  ]

  // Transform all real posts for display
  const allCommunityPosts = isDemoMode ? demoCommunityPosts : realPosts.map(post => ({
    id: post.id,
    type: post.type || 'share',
    text: post.content || post.text,
    author: post.author?.full_name || 'Neighbor',
    authorAvatarUrl: post.author?.avatar_signed_url || null,
    unit: post.author?.role?.includes('manager') ? 'Management' : (post.author?.unit_number ? `Unit ${post.author.unit_number}` : ''),
    timestamp: new Date(post.created_at).getTime(),
    likes: post.likes_count ?? post.likes ?? 0,
    comments: post.comments_count ?? post.comments ?? 0,
    commentsList: []
  }))

  // For backwards compatibility
  const todayCommunityPost = allCommunityPosts.length > 0 ? allCommunityPosts[0] : null

  // Handler to open community post detail
  const handleCommunityPostClick = (post) => {
    // Log engagement for real users
    if (!isDemoMode && userProfile?.id && userProfile?.building_id) {
      logEngagementEvent({
        userId: userProfile.id,
        buildingId: userProfile.building_id,
        eventType: 'post_open',
        entityType: 'post',
        entityId: post.id,
        topic: post.type || 'share'
      })
    }

    if (onNavigate) {
      onNavigate('PostDetail', post)
    }
  }

  // Get post type badge info
  const getPostTypeBadge = (type) => {
    switch (type) {
      case 'ask':
        return { label: 'ASK', icon: HelpCircle, color: '#8b5cf6' }
      case 'share':
        return { label: 'SHARE', icon: MessageSquare, color: '#3b82f6' }
      default:
        return { label: type.toUpperCase(), icon: MessageSquare, color: '#6B7280' }
    }
  }

  return (
    <div
      className="home-page"
      style={{ '--hero-image': `url(${heroImageUrl})` }}
    >
      {/* Loading splash for initial data load */}
      {!initialLoadDone && (
        <LoadingSplash theme="warm" fadeOut={splashFading} />
      )}

      {/* Ambient background - real DOM element, same image as hero */}
      <div className="ambient-bg" aria-hidden="true" />

      {/* Single centered app container for perfect alignment */}
      <div className="app-container">
        {/* Hero Section with Building Image */}
        <section className="hero-section">
          <div className="hero-image-container">
            {/* THE SAME building image - sharp in the hero card */}
            <img
              src={heroImageUrl}
              alt="The Paramount Building"
              className="hero-image"
            />
            <div className="hero-warm-overlay"></div>
            <div className="hero-gradient-overlay"></div>

            {/* Hamburger Menu & Notification Bell */}
            <HamburgerMenu onNavigate={onNavigate} unreadMessages={unreadMessages} currentScreen="home" />

            {/* Weather Widget - Below top bar */}
            <div className="weather-widget">
              <div className="weather-datetime">
                {formatDay(currentTime)} | {formatTime(currentTime)}
              </div>
              <div className="weather-temp-row">
                <WeatherIcon size={20} className="weather-icon" />
                <span className="weather-temp">{weatherData.temp}°</span>
              </div>
              <div className="weather-condition">{weatherData.conditionText}</div>
            </div>

            {/* Building Name - Centered in Hero */}
            <div className="hero-text-container">
              {isDemoMode && <span className="hero-the">The</span>}
              <h1 className="hero-building-name">{buildingName}</h1>
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="main-content">
        {/* Today at Building */}
        <section className="today-section">
          <h2 className="section-title">Today at {isDemoMode ? 'The Paramount' : buildingName}</h2>

          {/* Home Intelligence Context Lines - subtle helper text */}
          {contextLine1 && (
            <div className="home-context-lines">
              <p className="context-line context-line-1">{contextLine1}</p>
              {contextLine2 && (
                <p className="context-line context-line-2">{contextLine2}</p>
              )}
            </div>
          )}

          {/* Packages Card - Demo or Real (hidden for resident-led buildings) */}
          {!isResidentLed && (isDemoMode ? (
            <>
              <button className="today-card" onClick={() => handleFeatureClick('Packages')}>
                <div className="today-card-icon package-icon"><Package size={20} /></div>
                <div className="today-card-content">
                  <span className="today-card-title">Amazon package ready for pickup</span>
                  <span className="today-card-subtitle">Front Desk · Large box</span>
                </div>
                <span className="today-card-time">9:00 AM</span>
              </button>
              <button className="today-card" onClick={() => handleFeatureClick('Packages')}>
                <div className="today-card-icon package-icon"><Package size={20} /></div>
                <div className="today-card-content">
                  <span className="today-card-title">UPS delivery arrived</span>
                  <span className="today-card-subtitle">Front Desk · Medium box</span>
                </div>
                <span className="today-card-time">10:30 AM</span>
              </button>
              <button className="today-card" onClick={() => handleFeatureClick('Packages')}>
                <div className="today-card-icon package-icon"><Package size={20} /></div>
                <div className="today-card-content">
                  <span className="today-card-title">FedEx envelope</span>
                  <span className="today-card-subtitle">Mailroom</span>
                </div>
                <span className="today-card-time">11:15 AM</span>
              </button>
            </>
          ) : realPackages.length > 0 ? (
            <button className="today-card" onClick={() => handleFeatureClick('Packages')}>
              <div className="today-card-icon package-icon">
                <Package size={20} />
              </div>
              <div className="today-card-content">
                <span className="today-card-title">{realPackages.length} {realPackages.length === 1 ? 'delivery' : 'deliveries'} ready for pickup</span>
                <span className="today-card-subtitle">Today</span>
              </div>
              <ChevronRight size={20} className="today-card-arrow" />
            </button>
          ) : (
            <div className="today-card empty-state-card">
              <div className="today-card-icon package-icon" style={{ opacity: 0.5 }}>
                <Package size={20} />
              </div>
              <div className="today-card-content">
                <span className="today-card-title" style={{ color: '#64748b' }}>No packages yet</span>
                <span className="today-card-subtitle">Check back later</span>
              </div>
            </div>
          ))}

          {/* Event Card - Demo or Real */}
          {isDemoMode ? (
            <>
              <button className="today-card" onClick={() => handleFeatureClick('Calendar')}>
                <div className="today-card-icon calendar-icon"><Calendar size={20} /></div>
                <div className="today-card-content">
                  <span className="today-card-title">Rooftop BBQ</span>
                  <span className="today-card-subtitle">Tonight · 6:00 PM · Rooftop</span>
                </div>
                <span className="today-card-time">6:00 PM</span>
              </button>
              <button className="today-card" onClick={() => handleFeatureClick('Calendar')}>
                <div className="today-card-icon calendar-icon"><Calendar size={20} /></div>
                <div className="today-card-content">
                  <span className="today-card-title">Wine & Cheese Social</span>
                  <span className="today-card-subtitle">This Friday · 7:00 PM · Rooftop Lounge</span>
                </div>
                <span className="today-card-time">Friday</span>
              </button>
            </>
          ) : realEvents.length > 0 ? (
            <button className="today-card" onClick={() => handleEventClick(realEvents[0])}>
              <div className="today-card-icon calendar-icon">
                <Calendar size={20} />
              </div>
              <div className="today-card-content">
                <span className="today-card-title">{realEvents[0].title}</span>
                <span className="today-card-subtitle">{realEvents[0].time || realEvents[0].date}</span>
              </div>
              <ChevronRight size={20} className="today-card-arrow" />
            </button>
          ) : (
            <div className="today-card empty-state-card">
              <div className="today-card-icon calendar-icon" style={{ opacity: 0.5 }}>
                <Calendar size={20} />
              </div>
              <div className="today-card-content">
                <span className="today-card-title" style={{ color: '#64748b' }}>No upcoming events</span>
                <span className="today-card-subtitle">Check back later</span>
              </div>
            </div>
          )}

          {/* Invite Neighbors Adoption Banner */}
          {(() => {
            const totalUnits = userProfile?.buildings?.total_units
            if (!totalUnits) return null
            return (
              <button className="invite-adoption-banner" onClick={() => handleFeatureClick('Invite Neighbors')}>
                <div className="invite-adoption-icon">
                  <UserPlus size={20} />
                </div>
                <div className="invite-adoption-content">
                  <span className="invite-adoption-title">Grow your community</span>
                  <span className="invite-adoption-subtitle">{totalUnits} units in your building — invite your neighbors!</span>
                </div>
                <ChevronRight size={18} className="invite-adoption-arrow" />
              </button>
            )
          })()}

          {/* Bulletin Board Preview */}
          {(() => {
            const listings = isDemoMode ? demoBulletinListings : bulletinListings
            return listings.length > 0 ? (
            <div className="bulletin-preview-section">
              <div className="bulletin-preview-header">
                <h3 className="bulletin-preview-title">
                  <ClipboardList size={16} />
                  Bulletin Board
                </h3>
                <button className="view-all-link-inline" onClick={() => handleFeatureClick('Bulletin Board')}>
                  View all →
                </button>
              </div>
              {listings.slice(0, 3).map(listing => {
                const price = listing.price == null || listing.price === 0 || listing.price === '0' ? 'Free' : (typeof listing.price === 'number' ? `$${listing.price}` : (String(listing.price).startsWith('$') ? listing.price : `$${listing.price}`))
                const ago = Date.now() - new Date(listing.created_at).getTime()
                const timeAgo = ago < 3600000 ? `${Math.floor(ago / 60000)}m` : ago < 86400000 ? `${Math.floor(ago / 3600000)}h` : `${Math.floor(ago / 86400000)}d`
                const catLabel = listing.category === 'iso' ? 'Looking For' : (listing.category || 'General').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
                const isManager = listing.author?.role === 'manager' || listing.author?.role === 'building_manager'
                const hasPoster = !!(listing.author_id || listing.user_id)
                const authorName = listing.author
                  ? (isManager ? 'Management' : (listing.author.full_name || 'Neighbor'))
                  : (hasPoster ? 'Neighbor' : 'Management')
                const authorAvatar = listing.author?.avatar_signed_url || null
                return (
                  <button key={listing.id} className="today-card bulletin-post-card" onClick={() => handleFeatureClick('Bulletin Board')}>
                    <div className="today-card-icon bulletin-avatar-icon">
                      {authorAvatar ? (
                        <img src={authorAvatar} alt="" style={{
                          width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%'
                        }} />
                      ) : (
                        authorName.charAt(0)
                      )}
                    </div>
                    <div className="today-card-content">
                      <div className="community-post-header">
                        <span className="community-post-author">{authorName}</span>
                        <span
                          className="community-post-badge"
                          style={{ background: 'rgba(90, 122, 106, 0.1)', color: '#5a7a6a' }}
                        >
                          {catLabel}
                        </span>
                      </div>
                      <span className="today-card-subtitle community-post-preview">{listing.title}</span>
                      <div className="community-post-footer">
                        <span className="post-stat bulletin-price">{price}</span>
                        <span className="post-stat">{timeAgo} ago</span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : !isDemoMode && (
            <button className="today-card bulletin-card" onClick={() => handleFeatureClick('Bulletin Board')}>
              <div className="today-card-icon bulletin-icon" style={{ opacity: 0.5 }}>
                <ClipboardList size={20} />
              </div>
              <div className="today-card-content">
                <span className="today-card-title" style={{ color: '#64748b' }}>Nothing posted yet</span>
                <span className="today-card-subtitle">Be the first on the Bulletin Board!</span>
              </div>
              <ChevronRight size={20} className="today-card-arrow" />
            </button>
          )
          })()}

          {/* New Joiners Welcome Tile */}
          {(() => {
            const joiners = isDemoMode ? demoNewJoiners : newJoiners
            return joiners.length > 0 && (
            <button className="today-card welcome-card" onClick={() => handleFeatureClick('Neighbors')}>
              <div className="today-card-icon welcome-icon">
                <Sparkles size={20} />
              </div>
              <div className="today-card-content">
                <span className="today-card-title">
                  Welcome {joiners.map(j => j.full_name?.split(' ')[0]).slice(0, 2).join(' & ')}{joiners.length > 2 ? ` +${joiners.length - 2} more` : ''}!
                </span>
                <span className="today-card-subtitle">
                  {joiners.length} new {joiners.length === 1 ? 'neighbor has' : 'neighbors have'} joined this week
                </span>
              </div>
              <ChevronRight size={20} className="today-card-arrow" />
            </button>
          )
          })()}

          {/* Community Section */}
          <div className="bulletin-preview-header" style={{ marginTop: '8px' }}>
            <h3 className="bulletin-preview-title">
              <MessageSquare size={16} />
              Community
            </h3>
            <button className="view-all-link-inline" onClick={() => handleFeatureClick('Community')}>
              View all →
            </button>
          </div>

          {/* Community Posts (capped at 3) */}
          {allCommunityPosts.length > 0 ? (
            allCommunityPosts.slice(0, 3).map((post) => (
              <button key={post.id} className="today-card community-post-card" onClick={() => handleCommunityPostClick(post)}>
                <div className="today-card-icon community-icon">
                  {post.authorAvatarUrl ? (
                    <img src={post.authorAvatarUrl} alt="" style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }} />
                  ) : (
                    post.author.charAt(0)
                  )}
                </div>
                <div className="today-card-content">
                  <div className="community-post-header">
                    <span className="community-post-author">{post.author}</span>
                    <span className="community-post-unit">{post.unit}</span>
                    <span
                      className="community-post-badge"
                      style={{ background: `${getPostTypeBadge(post.type).color}15`, color: getPostTypeBadge(post.type).color }}
                    >
                      {getPostTypeBadge(post.type).label}
                    </span>
                  </div>
                  <span className="today-card-subtitle community-post-preview">
                    {post.text.length > 80
                      ? post.text.substring(0, 80) + '...'
                      : post.text}
                  </span>
                  <div className="community-post-footer">
                    <span className="post-stat">
                      <Heart size={14} />
                      <span>{post.likes}</span>
                    </span>
                    <span className="post-stat">
                      <MessageCircle size={14} />
                      <span>{post.comments}</span>
                    </span>
                  </div>
                </div>
              </button>
            ))
          ) : !isDemoMode && (
            <div className="today-card empty-state-card">
              <div className="today-card-icon community-icon" style={{ opacity: 0.5 }}>
                <Users size={20} />
              </div>
              <div className="today-card-content">
                <span className="today-card-title" style={{ color: '#64748b' }}>No community posts yet</span>
                <span className="today-card-subtitle">Be the first to post!</span>
              </div>
            </div>
          )}

          {/* Feedback CTA Card */}
          <button className="feedback-cta-card" onClick={() => setShowFeedbackModal(true)}>
            <div className="feedback-cta-icon">
              <MessageSquare size={20} />
            </div>
            <div className="feedback-cta-content">
              <span className="feedback-cta-title">Help us improve COMMUNITY!</span>
              <span className="feedback-cta-subtitle">Report bugs, suggest features, or ask questions</span>
            </div>
            <ChevronRight size={18} style={{ color: '#999' }} />
          </button>
        </section>

                </main>

      </div>

      {/* Contact Manager Modal */}
      {showContactModal && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="contact-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Contact Building Manager</h2>
              <button className="modal-close" onClick={() => setShowContactModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="contact-form-group">
                <label className="contact-label">Subject</label>
                <select
                  className="contact-select"
                  value={contactForm.subject}
                  onChange={(e) => setContactForm(prev => ({ ...prev, subject: e.target.value }))}
                >
                  {subjectOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
              <div className="contact-form-group">
                <label className="contact-label">Message</label>
                <textarea
                  className="contact-textarea"
                  placeholder="Describe your issue or question..."
                  value={contactForm.message}
                  onChange={(e) => setContactForm(prev => ({ ...prev, message: e.target.value }))}
                  rows={5}
                />
              </div>
              <div className="contact-form-group">
                <button
                  className={`attach-photo-btn ${contactForm.hasPhoto ? 'has-photo' : ''}`}
                  onClick={() => setContactForm(prev => ({ ...prev, hasPhoto: !prev.hasPhoto }))}
                >
                  <Image size={18} />
                  <span>{contactForm.hasPhoto ? 'Photo attached' : 'Attach Photo (optional)'}</span>
                  {contactForm.hasPhoto && <Check size={16} className="check-icon" />}
                </button>
              </div>
              <div className="contact-unit-info">
                <span className="unit-label">From:</span>
                <span className="unit-value">Unit {userUnit}</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setShowContactModal(false)}>
                Cancel
              </button>
              <button
                className="modal-submit"
                onClick={handleContactSubmit}
                disabled={!contactForm.message.trim()}
              >
                <Send size={18} />
                <span>Send Message</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Success Toast */}
      {showContactSuccess && (
        <div className="contact-success-toast">
          <Check size={20} />
          <span>Message Sent!</span>
        </div>
      )}

      {/* Floating Feedback Button */}
      <button
        className="resident-feedback-fab"
        onClick={() => setShowFeedbackModal(true)}
        aria-label="Send feedback"
      >
        ?
      </button>

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={showFeedbackModal}
        onClose={() => setShowFeedbackModal(false)}
        userProfile={userProfile}
        buildingName={buildingName}
        isDemoMode={isDemoMode}
        pageContext="home"
      />
    </div>
  )
}

export default Home
