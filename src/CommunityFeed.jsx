import { useState, useEffect } from 'react'
import { MessageSquare, HelpCircle, Flag, Heart, MessageCircle, Share2, MoreHorizontal, Send, X, Sparkles, Users, Hand, ChevronDown, ChevronUp, Search, Sun, Cloud, CloudRain, Snowflake, Moon } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getPosts, createPost, likePost, unlikePost, getUserLikes } from './services/communityPostService'
import { getBuildingBackgroundImage } from './services/buildingService'
import HamburgerMenu from './HamburgerMenu'
import EmptyState from './components/EmptyState'
import './CommunityFeed.css'

// Demo posts data - used when in demo mode
// Use a module-level variable to persist posts across component remounts
let demoPostsCache = null

const DEMO_POSTS = [
  {
    id: 1,
    type: 'share',
    text: "Just moved into unit 1205! Excited to meet everyone. Anyone have recommendations for good restaurants nearby?",
    author: 'Emily Chen',
    unit: 'Unit 1205',
    timestamp: Date.now() - 3600000,
    likes: 12,
    comments: 3,
    commentsList: [
      { id: 101, author: 'Sarah Mitchell', firstName: 'Sarah', unit: 'Unit 1201', text: 'Welcome to the building! You should try Bella Italia on Main St - amazing pasta!', timestamp: Date.now() - 3000000, replies: [] },
      { id: 102, author: 'David Kim', firstName: 'David', unit: 'Unit 1507', text: 'Welcome Emily! The Thai place on Oak Ave is great too.', timestamp: Date.now() - 2400000, replies: [] },
      { id: 103, author: 'Marcus Johnson', firstName: 'Marcus', unit: 'Unit 804', text: 'Looking forward to meeting you at the next building social!', timestamp: Date.now() - 1800000, replies: [] }
    ]
  },
  {
    id: 2,
    type: 'ask',
    text: "Does anyone know if there's a package room or do we pick up from the front desk?",
    author: 'Marcus Johnson',
    unit: 'Unit 804',
    timestamp: Date.now() - 7200000,
    likes: 3,
    comments: 2,
    commentsList: [
      { id: 201, author: 'Building Staff', firstName: 'Staff', unit: 'Management', text: 'Hi Marcus! Packages are held at the front desk. You\'ll get a notification when something arrives.', timestamp: Date.now() - 6800000, replies: [] },
      { id: 202, author: 'Jessica Patel', firstName: 'Jessica', unit: 'Unit 402', text: 'They also have lockers for Amazon packages - ask the front desk for the code!', timestamp: Date.now() - 6000000, replies: [] }
    ]
  },
  {
    id: 3,
    type: 'report',
    text: "The elevator on the east side has been making a strange noise. Just wanted to give everyone a heads up and let management know.",
    author: 'Sarah Mitchell',
    unit: 'Unit 1201',
    timestamp: Date.now() - 14400000,
    likes: 18,
    comments: 2,
    commentsList: [
      { id: 301, author: 'Building Staff', firstName: 'Staff', unit: 'Management', text: 'Thanks for reporting this Sarah! We\'ve contacted the elevator company and a technician will be here tomorrow morning.', timestamp: Date.now() - 13000000, replies: [] },
      { id: 302, author: 'David Kim', firstName: 'David', unit: 'Unit 1507', text: 'I noticed that too. Thanks for flagging it!', timestamp: Date.now() - 12000000, replies: [] }
    ]
  },
  {
    id: 4,
    type: 'share',
    text: "Beautiful sunset from the rooftop tonight! Love living here.",
    author: 'David Kim',
    unit: 'Unit 1507',
    timestamp: Date.now() - 28800000,
    likes: 45,
    comments: 4,
    commentsList: [
      { id: 401, author: 'Emily Chen', firstName: 'Emily', unit: 'Unit 1205', text: 'Wow, that sounds amazing! I need to check out the rooftop.', timestamp: Date.now() - 27000000, replies: [] },
      { id: 402, author: 'Sarah Mitchell', firstName: 'Sarah', unit: 'Unit 1201', text: 'The rooftop is the best feature of this building!', timestamp: Date.now() - 26000000, replies: [] },
      { id: 403, author: 'Jessica Patel', firstName: 'Jessica', unit: 'Unit 402', text: 'Perfect spot for morning coffee too ☕', timestamp: Date.now() - 25000000, replies: [] },
      { id: 404, author: 'Marcus Johnson', firstName: 'Marcus', unit: 'Unit 804', text: 'We should organize a rooftop hangout sometime!', timestamp: Date.now() - 24000000, replies: [] }
    ]
  },
  {
    id: 5,
    type: 'ask',
    text: "Is the gym open 24/7 or are there specific hours? Just moved in last week.",
    author: 'Jessica Patel',
    unit: 'Unit 402',
    timestamp: Date.now() - 43200000,
    likes: 7,
    comments: 2,
    commentsList: [
      { id: 501, author: 'Building Staff', firstName: 'Staff', unit: 'Management', text: 'Welcome Jessica! The gym is open 24/7 - just use your key fob to access it.', timestamp: Date.now() - 42000000, replies: [] },
      { id: 502, author: 'David Kim', firstName: 'David', unit: 'Unit 1507', text: 'Pro tip: it\'s usually empty before 7am if you like a quiet workout!', timestamp: Date.now() - 40000000, replies: [] }
    ]
  }
]

// Demo neighbors data
const DEMO_NEIGHBORS = [
  { id: 1, name: "Sarah Chen", unit: "1201", floor: 12, color: "blue", waved: false },
  { id: 2, name: "Michael Torres", unit: "1203", floor: 12, color: "purple", waved: false },
  { id: 3, name: "Emily Rodriguez", unit: "1205", floor: 12, color: "cyan", waved: false },
  { id: 4, name: "David Kim", unit: "1207", floor: 12, color: "green", waved: false },
  { id: 5, name: "Jessica Patel", unit: "1102", floor: 11, color: "pink", waved: false },
  { id: 6, name: "James Wilson", unit: "1104", floor: 11, color: "orange", waved: false },
  { id: 7, name: "Maria Garcia", unit: "1106", floor: 11, color: "blue", waved: false },
  { id: 8, name: "Robert Lee", unit: "1301", floor: 13, color: "purple", waved: false },
  { id: 9, name: "Amanda Brown", unit: "1303", floor: 13, color: "cyan", waved: false },
  { id: 10, name: "Chris Johnson", unit: "1305", floor: 13, color: "green", waved: false },
  { id: 11, name: "Lisa Anderson", unit: "1307", floor: 13, color: "pink", waved: false },
  { id: 12, name: "Daniel Martinez", unit: "1002", floor: 10, color: "orange", waved: false },
  { id: 13, name: "Sophie Taylor", unit: "1004", floor: 10, color: "blue", waved: false }
]

function CommunityFeed({ onNavigate }) {
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  // Weather and time state - matches Home exactly
  const [currentTime, setCurrentTime] = useState(new Date())
  const weatherData = {
    temp: 58,
    condition: 'clear',
    conditionText: 'Mostly Clear'
  }

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

  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showPostModal, setShowPostModal] = useState(false)
  const [postType, setPostType] = useState('share')
  const [postText, setPostText] = useState('')
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [mobileNeighborsExpanded, setMobileNeighborsExpanded] = useState(false)

  // Building background image
  const [buildingBgUrl, setBuildingBgUrl] = useState(null)

  // Fetch building background image
  useEffect(() => {
    const fetchBuildingBg = async () => {
      if (isInDemoMode) return
      const buildingId = userProfile?.building_id
      if (!buildingId) return
      try {
        const url = await getBuildingBackgroundImage(buildingId)
        if (url) setBuildingBgUrl(url)
      } catch (err) {
        console.warn('[CommunityFeed] Failed to load building background:', err)
      }
    }
    fetchBuildingBg()
  }, [isInDemoMode, userProfile?.building_id])

  // Neighbors data and state
  const currentUserFloor = userProfile?.unit_number
    ? parseInt(userProfile.unit_number.toString().slice(0, -2)) || 1
    : 12
  const [expandedFloors, setExpandedFloors] = useState([currentUserFloor])
  const [neighbors, setNeighbors] = useState([])

  useEffect(() => {
    // Load neighbors based on mode
    if (isInDemoMode) {
      console.log('[CommunityFeed] MODE: DEMO - neighbors.length:', DEMO_NEIGHBORS.length)
      setNeighbors(DEMO_NEIGHBORS)
    } else {
      console.log('[CommunityFeed] MODE: REAL - neighbors will be fetched from DB')
      setNeighbors([])
    }

    async function loadPosts() {
      if (isInDemoMode) {
        // Use cached demo posts if available (persists new posts across navigation)
        const postsToUse = demoPostsCache || DEMO_POSTS
        console.log('[CommunityFeed] MODE: DEMO - posts.length:', postsToUse.length, 'fromCache:', !!demoPostsCache)
        setPosts(postsToUse)
        setLoading(false)
        return
      }

      // Real mode
      const buildingId = userProfile?.building_id
      console.log('[CommunityFeed] MODE: REAL - fetching for building:', buildingId)

      if (!buildingId) {
        console.log('[CommunityFeed] No building_id - showing empty state')
        setPosts([])
        setLoading(false)
        return
      }

      try {
        // Fetch posts and user's likes in parallel
        const [postsData, userLikedPostIds] = await Promise.all([
          getPosts(buildingId),
          userProfile?.id ? getUserLikes(userProfile.id) : Promise.resolve([])
        ])

        const likedSet = new Set(userLikedPostIds)

        const transformedData = (postsData || []).map(post => ({
          id: post.id,
          type: post.type || 'share',
          text: post.content,
          author: post.author?.full_name || 'Anonymous',
          unit: `Unit ${post.author?.unit_number || 'N/A'}`,
          timestamp: new Date(post.created_at).getTime(),
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          userLiked: likedSet.has(post.id)
        }))
        setPosts(transformedData)
        setLikedPosts(likedSet)
        console.log('[CommunityFeed] Posts fetched:', transformedData.length, 'User likes:', likedSet.size)
      } catch (err) {
        console.error('[CommunityFeed] Error loading posts:', err)
        setError('Unable to load posts. Please try again.')
      } finally {
        setLoading(false)
      }
    }
    loadPosts()
  }, [isInDemoMode, userProfile])

  // Toggle floor expansion
  const toggleFloor = (floor) => {
    setExpandedFloors(prev =>
      prev.includes(floor)
        ? prev.filter(f => f !== floor)
        : [...prev, floor]
    )
  }

  // Handle Wave toggle
  const handleWave = (neighborId) => {
    setNeighbors(neighbors.map(neighbor => {
      if (neighbor.id === neighborId) {
        return { ...neighbor, waved: !neighbor.waved }
      }
      return neighbor
    }))
  }

  // Get initials from name
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('')
  }

  // Group neighbors by floor
  const neighborsByFloor = neighbors.reduce((acc, neighbor) => {
    if (!acc[neighbor.floor]) {
      acc[neighbor.floor] = []
    }
    acc[neighbor.floor].push(neighbor)
    return acc
  }, {})

  // Sort floors with current floor first, then descending
  const sortedFloors = Object.keys(neighborsByFloor)
    .map(Number)
    .sort((a, b) => {
      if (a === currentUserFloor) return -1
      if (b === currentUserFloor) return 1
      return b - a
    })

  // Filter neighbors by search query
  const filteredNeighborsByFloor = searchQuery.trim()
    ? Object.fromEntries(
        Object.entries(neighborsByFloor).map(([floor, residents]) => [
          floor,
          residents.filter(n =>
            n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            n.unit.includes(searchQuery)
          )
        ]).filter(([, residents]) => residents.length > 0)
      )
    : neighborsByFloor

  const filteredSortedFloors = searchQuery.trim()
    ? Object.keys(filteredNeighborsByFloor).map(Number).sort((a, b) => {
        if (a === currentUserFloor) return -1
        if (b === currentUserFloor) return 1
        return b - a
      })
    : sortedFloors

  // Post type configurations
  const postTypes = [
    { type: 'share', label: 'Share', icon: MessageSquare, color: '#3b82f6' },
    { type: 'ask', label: 'Ask', icon: HelpCircle, color: '#8b5cf6' },
    { type: 'report', label: 'Report', icon: Flag, color: '#ef4444' },
  ]

  const getPostTypeConfig = (type) => {
    return postTypes.find(pt => pt.type === type) || postTypes[0]
  }

  const getPostPlaceholder = () => {
    switch(postType) {
      case 'share': return "What's on your mind? Share with your neighbors..."
      case 'ask': return "What would you like to ask your neighbors?"
      case 'report': return "Describe the issue you'd like to report..."
      default: return "Write something..."
    }
  }

  const getPostTitle = () => {
    switch(postType) {
      case 'share': return "Share with neighbors"
      case 'ask': return "Ask your neighbors"
      case 'report': return "Report an issue"
      default: return "New post"
    }
  }

  const handlePostSubmit = async () => {
    if (!postText.trim()) return

    if (isInDemoMode) {
      // Demo mode: add to local state and update the cache
      const newPost = {
        id: Date.now(),
        type: postType,
        text: postText.trim(),
        author: 'You',
        unit: 'Unit 1201',
        timestamp: Date.now(),
        likes: 0,
        comments: 0,
        commentsList: []
      }
      const updatedPosts = [newPost, ...posts]
      setPosts(updatedPosts)
      // Update the cache so posts persist across navigation
      demoPostsCache = updatedPosts
    } else {
      // Real mode: save to Supabase
      try {
        console.log('[CommunityFeed] Creating post for building:', userProfile.building_id, 'user:', userProfile.id)
        const newPost = await createPost({
          building_id: userProfile.building_id,
          user_id: userProfile.id,
          type: postType,
          content: postText.trim()
        })
        console.log('[CommunityFeed] Post created successfully:', newPost)
        // Reload posts
        const data = await getPosts(userProfile.building_id)
        const transformedData = data.map(post => ({
          id: post.id,
          type: post.type || 'share',
          text: post.content,
          author: post.author?.full_name || 'Anonymous',
          unit: `Unit ${post.author?.unit_number || 'N/A'}`,
          timestamp: new Date(post.created_at).getTime(),
          likes: post.likes_count || 0,
          comments: post.comments_count || 0
        }))
        setPosts(transformedData)
      } catch (err) {
        console.error('[CommunityFeed] Error creating post:', err)
        setError('Failed to create post. Please try again.')
        return // Don't close modal on error
      }
    }

    setShowPostModal(false)
    setPostText('')
  }

  const handleLike = async (postId) => {
    console.log('[CommunityFeed] handleLike called:', { postId, isInDemoMode, userId: userProfile?.id })
    const isCurrentlyLiked = likedPosts.has(postId)
    console.log('[CommunityFeed] isCurrentlyLiked:', isCurrentlyLiked)

    // Optimistic update
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })

    if (!isInDemoMode && userProfile?.id) {
      // Real mode: update in Supabase
      console.log('[CommunityFeed] Calling Supabase for like action...')
      try {
        if (isCurrentlyLiked) {
          console.log('[CommunityFeed] Calling unlikePost:', postId, userProfile.id)
          await unlikePost(postId, userProfile.id)
        } else {
          console.log('[CommunityFeed] Calling likePost:', postId, userProfile.id)
          await likePost(postId, userProfile.id)
        }
        console.log('[CommunityFeed] Like action successful')
      } catch (err) {
        console.error('[CommunityFeed] Error updating like:', err)
        // Revert optimistic update on error
        setLikedPosts(prev => {
          const newSet = new Set(prev)
          if (isCurrentlyLiked) {
            newSet.add(postId)
          } else {
            newSet.delete(postId)
          }
          return newSet
        })
      }
    } else {
      console.log('[CommunityFeed] Skipping Supabase call - demo mode or no user:', { isInDemoMode, hasUserId: !!userProfile?.id })
    }
  }

  const formatTimeAgo = (timestamp) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  // CSS variable for building background image
  const bgStyle = buildingBgUrl ? { '--building-bg-image': `url(${buildingBgUrl})` } : {}

  // Loading state
  if (loading) {
    return (
      <div className="community-feed-container resident-inner-page" style={bgStyle}>
        <div className="inner-page-hero">
          <HamburgerMenu onNavigate={onNavigate} currentScreen="community" />
          <div className="inner-page-weather">
            <div className="weather-datetime">{formatDay(currentTime)} | {formatTime(currentTime)}</div>
            <div className="weather-temp-row">
              <WeatherIcon size={20} className="weather-icon" />
              <span className="weather-temp">{weatherData.temp}°</span>
            </div>
            <div className="weather-condition">{weatherData.conditionText}</div>
          </div>
          <div className="inner-page-title-container">
            <h1 className="inner-page-title">Community</h1>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh', color: '#9CA3AF' }}>
          Loading posts...
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="community-feed-container resident-inner-page" style={bgStyle}>
        <div className="inner-page-hero">
          <HamburgerMenu onNavigate={onNavigate} currentScreen="community" />
          <div className="inner-page-weather">
            <div className="weather-datetime">{formatDay(currentTime)} | {formatTime(currentTime)}</div>
            <div className="weather-temp-row">
              <WeatherIcon size={20} className="weather-icon" />
              <span className="weather-temp">{weatherData.temp}°</span>
            </div>
            <div className="weather-condition">{weatherData.conditionText}</div>
          </div>
          <div className="inner-page-title-container">
            <h1 className="inner-page-title">Community</h1>
          </div>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '30vh', color: '#ef4444' }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="community-feed-container resident-inner-page" style={bgStyle}>
      {/* Hero Section with Weather and Title */}
      <div className="inner-page-hero">
        {/* Hamburger Menu */}
        <HamburgerMenu onNavigate={onNavigate} currentScreen="community" />

        {/* Weather Widget - matches Home exactly */}
        <div className="inner-page-weather">
          <div className="weather-datetime">
            {formatDay(currentTime)} | {formatTime(currentTime)}
          </div>
          <div className="weather-temp-row">
            <WeatherIcon size={20} className="weather-icon" />
            <span className="weather-temp">{weatherData.temp}°</span>
          </div>
          <div className="weather-condition">{weatherData.conditionText}</div>
        </div>

        {/* Page Title - centered like "The Paramount" */}
        <div className="inner-page-title-container">
          <h1 className="inner-page-title">Community</h1>
        </div>
      </div>

      <main className="community-split-layout">
        {/* Left Column - Neighbors Sidebar */}
        <aside className="neighbors-sidebar">
          {/* Desktop view */}
          <div className="sidebar-desktop">
            <div className="sidebar-header">
              <Users size={18} />
              <h2>Neighbors</h2>
            </div>

            <div className="sidebar-search">
              <Search size={16} />
              <input
                type="text"
                placeholder="Search neighbors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="sidebar-floors">
              {filteredSortedFloors.map((floor) => {
                const isExpanded = expandedFloors.includes(floor)
                const floorNeighbors = filteredNeighborsByFloor[floor]
                const isYourFloor = floor === currentUserFloor

                return (
                  <div key={floor} className={`sidebar-floor ${isExpanded ? 'expanded' : ''}`}>
                    <button
                      className="sidebar-floor-header"
                      onClick={() => toggleFloor(floor)}
                    >
                      <div className="floor-header-left">
                        <span className="floor-name">
                          {isYourFloor ? `Floor ${floor}` : `Floor ${floor}`}
                        </span>
                        <span className="floor-count">({floorNeighbors.length})</span>
                        {isYourFloor && <span className="your-floor-badge">YOUR FLOOR</span>}
                      </div>
                      <div className="floor-chevron">
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="sidebar-residents">
                        {floorNeighbors.map((neighbor) => (
                          <div key={neighbor.id} className="sidebar-resident-row">
                            <div className={`sidebar-avatar avatar-ring-${neighbor.color}`}>
                              {getInitials(neighbor.name)}
                            </div>
                            <div className="sidebar-resident-info">
                              <span className="sidebar-resident-name">{neighbor.name}</span>
                              <span className="sidebar-resident-unit">{neighbor.unit}</span>
                            </div>
                            <button
                              className={`sidebar-wave-btn ${neighbor.waved ? 'waved' : ''}`}
                              onClick={() => handleWave(neighbor.id)}
                            >
                              <Hand size={14} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Mobile collapsed view */}
          <div className="sidebar-mobile">
            <button
              className="mobile-neighbors-toggle"
              onClick={() => setMobileNeighborsExpanded(!mobileNeighborsExpanded)}
            >
              <div className="mobile-toggle-left">
                <Users size={18} />
                <span>Neighbors</span>
              </div>
              <div className="mobile-toggle-right">
                <span className="neighbor-count">{neighbors.length}</span>
                {mobileNeighborsExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
              </div>
            </button>

            {mobileNeighborsExpanded && (
              <div className="mobile-neighbors-content">
                <div className="sidebar-search">
                  <Search size={16} />
                  <input
                    type="text"
                    placeholder="Search neighbors..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="sidebar-floors">
                  {filteredSortedFloors.map((floor) => {
                    const isExpanded = expandedFloors.includes(floor)
                    const floorNeighbors = filteredNeighborsByFloor[floor]
                    const isYourFloor = floor === currentUserFloor

                    return (
                      <div key={floor} className={`sidebar-floor ${isExpanded ? 'expanded' : ''}`}>
                        <button
                          className="sidebar-floor-header"
                          onClick={() => toggleFloor(floor)}
                        >
                          <div className="floor-header-left">
                            <span className="floor-name">Floor {floor}</span>
                            <span className="floor-count">({floorNeighbors.length})</span>
                            {isYourFloor && <span className="your-floor-badge">YOUR FLOOR</span>}
                          </div>
                          <div className="floor-chevron">
                            {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="sidebar-residents">
                            {floorNeighbors.map((neighbor) => (
                              <div key={neighbor.id} className="sidebar-resident-row">
                                <div className={`sidebar-avatar avatar-ring-${neighbor.color}`}>
                                  {getInitials(neighbor.name)}
                                </div>
                                <div className="sidebar-resident-info">
                                  <span className="sidebar-resident-name">{neighbor.name}</span>
                                  <span className="sidebar-resident-unit">{neighbor.unit}</span>
                                </div>
                                <button
                                  className={`sidebar-wave-btn ${neighbor.waved ? 'waved' : ''}`}
                                  onClick={() => handleWave(neighbor.id)}
                                >
                                  <Hand size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right Column - Feed */}
        <section className="feed-column">
          {/* New Post Button */}
          <button className="new-post-button" onClick={() => setShowPostModal(true)}>
            <Sparkles size={20} />
            <span>Share something with your neighbors</span>
          </button>

          {/* Post Type Filters */}
          <div className="post-filters">
            <button
              className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
              onClick={() => setActiveFilter('all')}
            >
              All
            </button>
            {postTypes.map(pt => {
              const IconComponent = pt.icon
              return (
                <button
                  key={pt.type}
                  className={`filter-btn ${activeFilter === pt.type ? 'active' : ''}`}
                  onClick={() => setActiveFilter(pt.type)}
                >
                  <IconComponent size={14} />
                  <span>{pt.label}</span>
                </button>
              )
            })}
          </div>

          {/* Posts Feed */}
          <div className="posts-feed">
            {posts.filter(p => activeFilter === 'all' || p.type === activeFilter).length === 0 ? (
              <EmptyState
                icon="message"
                title="No posts yet"
                subtitle="Be the first to share something with your neighbors!"
                ctaLabel="Create Post"
                onCta={() => setShowPostModal(true)}
              />
            ) : (
              posts.filter(p => activeFilter === 'all' || p.type === activeFilter).map((post) => {
                const typeConfig = getPostTypeConfig(post.type)
                const IconComponent = typeConfig.icon
                const isLiked = likedPosts.has(post.id)

                // Handler to open post detail
                const handlePostClick = () => {
                  console.log('[CommunityFeed] handlePostClick called for post:', post.id, post.text?.substring(0, 30))
                  if (onNavigate) {
                    console.log('[CommunityFeed] Navigating to PostDetail')
                    onNavigate('PostDetail', post)
                  } else {
                    console.log('[CommunityFeed] onNavigate is not defined!')
                  }
                }

                return (
                  <article
                    key={post.id}
                    className="post-card"
                    onClick={handlePostClick}
                  >
                    <div className="author-avatar" style={{ background: `linear-gradient(135deg, ${typeConfig.color}, ${typeConfig.color}88)` }}>
                      {post.author.charAt(0)}
                    </div>
                    <div className="post-body">
                      <div className="post-header">
                        <span className="author-name">{post.author}</span>
                        <span className="header-separator">·</span>
                        <span className="post-unit">{post.unit}</span>
                        <span className="header-separator">·</span>
                        <span className="post-time">{formatTimeAgo(post.timestamp)}</span>
                      </div>

                      <div className="post-content">
                        <p>{post.text}</p>
                      </div>

                      <div className="post-footer">
                        <div className="post-type-badge" style={{ background: `${typeConfig.color}15`, color: typeConfig.color }}>
                          <IconComponent size={11} />
                          <span>{typeConfig.label}</span>
                        </div>
                        <div className="post-actions">
                          <button
                            className={`action-btn ${isLiked ? 'liked' : ''}`}
                            onClick={(e) => { e.stopPropagation(); handleLike(post.id); }}
                          >
                            <Heart size={16} fill={isLiked ? '#ef4444' : 'none'} />
                            <span>{post.likes + (isLiked ? 1 : 0)}</span>
                          </button>
                          <button
                            className="action-btn"
                            onClick={(e) => { e.stopPropagation(); handlePostClick(); }}
                          >
                            <MessageCircle size={16} />
                            <span>{post.comments}</span>
                          </button>
                          <button className="action-btn" onClick={(e) => e.stopPropagation()}>
                            <Share2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                )
              })
            )}
          </div>
        </section>
      </main>

      {/* Post Modal */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="post-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{getPostTitle()}</h3>
              <button className="modal-close" onClick={() => setShowPostModal(false)}>
                <X size={20} />
              </button>
            </div>

            {/* Post Type Selector */}
            <div className="post-type-selector">
              {postTypes.map(pt => {
                const IconComponent = pt.icon
                return (
                  <button
                    key={pt.type}
                    className={`type-btn ${postType === pt.type ? 'active' : ''}`}
                    onClick={() => setPostType(pt.type)}
                    style={{
                      '--type-color': pt.color,
                      background: postType === pt.type ? `${pt.color}20` : 'transparent',
                      borderColor: postType === pt.type ? pt.color : 'var(--glass-border)'
                    }}
                  >
                    <IconComponent size={16} style={{ color: pt.color }} />
                    <span>{pt.label}</span>
                  </button>
                )
              })}
            </div>

            <div className="modal-body">
              <textarea
                className="post-input"
                placeholder={getPostPlaceholder()}
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows={4}
                autoFocus
              />
            </div>
            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setShowPostModal(false)}>
                Cancel
              </button>
              <button
                className="modal-submit"
                onClick={handlePostSubmit}
                disabled={!postText.trim()}
              >
                <Send size={16} />
                <span>Post</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CommunityFeed
