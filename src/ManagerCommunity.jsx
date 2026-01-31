import { useState, useEffect } from 'react'
import {
  MessageSquare,
  HelpCircle,
  Flag,
  Heart,
  MessageCircle,
  Share2,
  MoreVertical,
  Send,
  X,
  Sparkles,
  Megaphone,
  Pin,
  PinOff,
  Edit3,
  Trash2,
  EyeOff,
  Check
} from 'lucide-react'
import './ManagerCommunity.css'
import { useAuth } from './contexts/AuthContext'
import { getPosts, createPost, deletePost } from './services/communityPostService'
import AnnouncementModal from './components/AnnouncementModal'

// Demo posts data - only shown for demo accounts
const DEMO_POSTS = [
  { id: 'a1', type: 'announcement', title: 'Pool Closed for Maintenance', text: 'The rooftop pool will be closed Jan 15-17 for annual maintenance. Sorry for the inconvenience!', author: 'Property Manager', unit: 'Management', timestamp: Date.now() - 3600000, likes: 5, comments: 2, pinned: true, category: 'maintenance' },
  { id: 'a2', type: 'announcement', title: 'Package Room Hours Update', text: 'Starting next week, the package room will be accessible 24/7 with your key fob. No more waiting for office hours!', author: 'Property Manager', unit: 'Management', timestamp: Date.now() - 172800000, likes: 12, comments: 4, pinned: false, category: 'general' },
  { id: 1, type: 'share', text: "Just made fresh banana bread and have extra! Anyone want some? I'm in unit 1201.", author: 'Sarah M.', unit: 'Unit 1201', timestamp: Date.now() - 1800000, likes: 8, comments: 3, pinned: false },
  { id: 2, type: 'ask', text: 'Does anyone have a ladder I could borrow this weekend? Need to change some light bulbs in the high ceilings.', author: 'Mike T.', unit: 'Unit 805', timestamp: Date.now() - 7200000, likes: 2, comments: 5, pinned: false },
  { id: 3, type: 'report', text: 'Heads up - the west elevator is making a strange noise again. Might want to avoid it until maintenance checks it out.', author: 'Jennifer K.', unit: 'Unit 1504', timestamp: Date.now() - 14400000, likes: 12, comments: 4, pinned: false },
  { id: 4, type: 'share', text: "Moving in next week! So excited to be part of this community. Can't wait to meet everyone at the rooftop BBQ!", author: 'Alex R.', unit: 'Unit 802', timestamp: Date.now() - 86400000, likes: 24, comments: 11, pinned: false }
]

function ManagerCommunity() {
  // Check if in demo mode
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [showPostModal, setShowPostModal] = useState(false)
  const [postType, setPostType] = useState('share')
  const [postText, setPostText] = useState('')
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [activeFilter, setActiveFilter] = useState('all')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)

  // Posts data - demo mode gets demo data, real mode fetches from Supabase
  const [posts, setPosts] = useState(isInDemoMode ? DEMO_POSTS : [])
  const [loading, setLoading] = useState(false)

  // Fetch posts from Supabase on mount (real mode only)
  useEffect(() => {
    if (isInDemoMode) return

    const fetchPosts = async () => {
      const buildingId = userProfile?.building_id
      if (!buildingId) return

      setLoading(true)
      try {
        const data = await getPosts(buildingId)
        const transformedPosts = (data || []).map(post => ({
          id: post.id,
          type: post.is_announcement ? 'announcement' : 'share',
          title: post.is_announcement ? post.content.split('\n')[0] : null,
          text: post.content,
          author: post.author?.full_name || 'Property Manager',
          unit: post.author?.unit_number ? `Unit ${post.author.unit_number}` : 'Management',
          timestamp: new Date(post.created_at).getTime(),
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          pinned: post.is_pinned || false,
          isFromSupabase: true
        }))
        setPosts(transformedPosts)
        console.log('[ManagerCommunity] Posts fetched:', transformedPosts.length)
      } catch (err) {
        console.error('[ManagerCommunity] Error fetching posts:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchPosts()
  }, [isInDemoMode, userProfile?.building_id])

  // Post type configurations
  const postTypes = [
    { type: 'share', label: 'Share', icon: MessageSquare, color: '#3b82f6' },
    { type: 'ask', label: 'Ask', icon: HelpCircle, color: '#8b5cf6' },
    { type: 'report', label: 'Report', icon: Flag, color: '#ef4444' }
  ]

  const getPostTypeConfig = (type) => {
    if (type === 'announcement') {
      return { type: 'announcement', label: 'Announcement', icon: Megaphone, color: '#f59e0b' }
    }
    return postTypes.find(pt => pt.type === type) || postTypes[0]
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

  const handleLike = (postId) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  // Handle pin/unpin post
  const handleTogglePin = (postId) => {
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, pinned: !post.pinned } : post
    ))
    setOpenMenuId(null)
  }

  // Handle delete post
  const handleDeletePost = async (post) => {
    if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      setOpenMenuId(null)
      return
    }

    if (!isInDemoMode && post.isFromSupabase) {
      try {
        await deletePost(post.id)
      } catch (err) {
        console.error('[ManagerCommunity] Error deleting post:', err)
        alert('Failed to delete post. Please try again.')
        setOpenMenuId(null)
        return
      }
    }

    setPosts(prev => prev.filter(p => p.id !== post.id))
    setOpenMenuId(null)
  }

  // Handle hide post (removes from view but keeps in data)
  const handleHidePost = (postId) => {
    setPosts(prev => prev.map(post =>
      post.id === postId ? { ...post, hidden: true } : post
    ))
    setOpenMenuId(null)
  }

  // Handle announcement success (from modal)
  const handleAnnouncementSuccess = async (demoAnnouncement) => {
    if (isInDemoMode && demoAnnouncement) {
      // Demo mode: add to local state
      setPosts(prev => [demoAnnouncement, ...prev])
    } else if (!isInDemoMode) {
      // Real mode: refresh posts from Supabase
      try {
        const data = await getPosts(userProfile.building_id)
        const transformedPosts = (data || []).map(post => ({
          id: post.id,
          type: post.is_announcement ? 'announcement' : 'share',
          title: post.is_announcement ? post.content.split('\n')[0] : null,
          text: post.content,
          author: post.author?.full_name || 'Property Manager',
          unit: post.author?.unit_number ? `Unit ${post.author.unit_number}` : 'Management',
          timestamp: new Date(post.created_at).getTime(),
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          pinned: post.is_pinned || false,
          isFromSupabase: true
        }))
        setPosts(transformedPosts)
      } catch (err) {
        console.error('[ManagerCommunity] Error refreshing posts:', err)
      }
    }

    // Show success message
    setShowSuccessMessage(true)
    setTimeout(() => setShowSuccessMessage(false), 3000)
  }

  // Handle regular post submit
  const handlePostSubmit = async () => {
    if (!postText.trim()) return

    if (isInDemoMode) {
      // Demo mode: local state only
      const newPost = {
        id: Date.now(),
        type: postType,
        text: postText.trim(),
        author: 'Property Manager',
        unit: 'Management',
        timestamp: Date.now(),
        likes: 0,
        comments: 0,
        pinned: false
      }
      setPosts(prev => [newPost, ...prev])
    } else {
      // Real mode: save to Supabase
      try {
        await createPost({
          building_id: userProfile.building_id,
          user_id: userProfile.id,
          content: postText.trim()
        })
        // Refresh posts
        const data = await getPosts(userProfile.building_id)
        const transformedPosts = (data || []).map(post => ({
          id: post.id,
          type: post.is_announcement ? 'announcement' : 'share',
          title: post.is_announcement ? post.content.split('\n')[0] : null,
          text: post.content,
          author: post.author?.full_name || 'Property Manager',
          unit: post.author?.unit_number ? `Unit ${post.author.unit_number}` : 'Management',
          timestamp: new Date(post.created_at).getTime(),
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
          pinned: post.is_pinned || false,
          isFromSupabase: true
        }))
        setPosts(transformedPosts)
      } catch (err) {
        console.error('[ManagerCommunity] Error creating post:', err)
        alert('Failed to post. Please try again.')
        return
      }
    }

    setShowPostModal(false)
    setPostText('')
  }

  // Close menus when clicking outside
  const handleClickOutside = () => {
    if (openMenuId) setOpenMenuId(null)
  }

  // Sort posts: pinned first, then by timestamp
  const sortedPosts = [...posts]
    .filter(p => !p.hidden)
    .filter(p => activeFilter === 'all' || p.type === activeFilter)
    .sort((a, b) => {
      if (a.pinned && !b.pinned) return -1
      if (!a.pinned && b.pinned) return 1
      return b.timestamp - a.timestamp
    })

  return (
    <div className="manager-community" onClick={handleClickOutside}>
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="success-toast">
          <Check size={18} />
          <span>Announcement posted successfully!</span>
        </div>
      )}

      {/* Header */}
      <div className="community-header">
        <div className="community-title-section">
          <h1>Community</h1>
          <p>Manage posts and announcements for your building</p>
        </div>
        <div className="community-actions">
          <button className="btn-secondary" onClick={() => setShowPostModal(true)}>
            <Sparkles size={18} />
            <span>New Post</span>
          </button>
          <button className="btn-primary" onClick={() => setShowAnnouncementModal(true)}>
            <Megaphone size={18} />
            <span>Post Announcement</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="community-filters">
        <button
          className={`filter-chip ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          All Posts
        </button>
        <button
          className={`filter-chip ${activeFilter === 'announcement' ? 'active' : ''}`}
          onClick={() => setActiveFilter('announcement')}
        >
          <Megaphone size={14} />
          Announcements
        </button>
        {postTypes.map(pt => {
          const IconComponent = pt.icon
          return (
            <button
              key={pt.type}
              className={`filter-chip ${activeFilter === pt.type ? 'active' : ''}`}
              onClick={() => setActiveFilter(pt.type)}
            >
              <IconComponent size={14} />
              {pt.label}
            </button>
          )
        })}
      </div>

      {/* Posts Feed */}
      <div className="community-feed">
        {sortedPosts.length === 0 ? (
          <div className="empty-feed">
            <MessageSquare size={48} />
            <h3>No posts yet</h3>
            <p>Post an announcement to get started!</p>
          </div>
        ) : (
          sortedPosts.map((post) => {
            const typeConfig = getPostTypeConfig(post.type)
            const IconComponent = typeConfig.icon
            const isLiked = likedPosts.has(post.id)
            const isAnnouncement = post.type === 'announcement'

            return (
              <article
                key={post.id}
                className={`community-post-card ${isAnnouncement ? 'announcement' : ''} ${post.pinned ? 'pinned' : ''}`}
              >
                {/* Pinned indicator */}
                {post.pinned && (
                  <div className="pinned-badge">
                    <Pin size={12} />
                    <span>Pinned</span>
                  </div>
                )}

                {/* Announcement label */}
                {isAnnouncement && (
                  <div className="announcement-label">
                    <Megaphone size={14} />
                    <span>Building Announcement</span>
                  </div>
                )}

                <div className="post-header">
                  <div className="post-author">
                    <div
                      className="author-avatar"
                      style={{ background: `linear-gradient(135deg, ${typeConfig.color}, ${typeConfig.color}88)` }}
                    >
                      {isAnnouncement ? <Megaphone size={18} /> : post.author.charAt(0)}
                    </div>
                    <div className="author-info">
                      <span className="author-name">
                        {isAnnouncement ? 'Property Manager' : post.author}
                      </span>
                      <span className="post-meta">
                        <span className="post-unit">{post.unit}</span>
                        <span className="meta-dot">·</span>
                        <span className="post-time">{formatTimeAgo(post.timestamp)}</span>
                      </span>
                    </div>
                  </div>

                  <div className="post-header-right">
                    <div
                      className="post-type-badge"
                      style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}
                    >
                      <IconComponent size={12} />
                      <span>{typeConfig.label}</span>
                    </div>

                    {/* Manager menu */}
                    <div className="post-menu-wrapper">
                      <button
                        className="post-menu-btn"
                        onClick={(e) => {
                          e.stopPropagation()
                          setOpenMenuId(openMenuId === post.id ? null : post.id)
                        }}
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenuId === post.id && (
                        <div className="post-menu" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="menu-item"
                            onClick={() => handleTogglePin(post.id)}
                          >
                            {post.pinned ? <PinOff size={16} /> : <Pin size={16} />}
                            <span>{post.pinned ? 'Unpin from Top' : 'Pin to Top'}</span>
                          </button>
                          <button className="menu-item">
                            <Edit3 size={16} />
                            <span>Edit Post</span>
                          </button>
                          <button
                            className="menu-item"
                            onClick={() => handleHidePost(post.id)}
                          >
                            <EyeOff size={16} />
                            <span>Hide Post</span>
                          </button>
                          <div className="menu-divider" />
                          <button
                            className="menu-item danger"
                            onClick={() => handleDeletePost(post)}
                          >
                            <Trash2 size={16} />
                            <span>Delete Post</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="post-content">
                  {isAnnouncement && post.title && (
                    <h3 className="announcement-title">{post.title}</h3>
                  )}
                  <p>{post.text}</p>
                </div>

                <div className="post-actions">
                  <button
                    className={`action-btn ${isLiked ? 'liked' : ''}`}
                    onClick={() => handleLike(post.id)}
                  >
                    <Heart size={18} fill={isLiked ? '#ef4444' : 'none'} />
                    <span>{post.likes + (isLiked ? 1 : 0)}</span>
                  </button>
                  <button className="action-btn">
                    <MessageCircle size={18} />
                    <span>{post.comments}</span>
                  </button>
                  <button className="action-btn">
                    <Share2 size={18} />
                  </button>
                </div>
              </article>
            )
          })
        )}
      </div>

      {/* Announcement Modal */}
      <AnnouncementModal
        isOpen={showAnnouncementModal}
        onClose={() => setShowAnnouncementModal(false)}
        onSuccess={handleAnnouncementSuccess}
        userProfile={userProfile}
        isInDemoMode={isInDemoMode}
      />

      {/* Regular Post Modal */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="post-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>New Post</h2>
              <button className="modal-close" onClick={() => setShowPostModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="post-type-selector">
              {postTypes.map(pt => {
                const IconComponent = pt.icon
                return (
                  <button
                    key={pt.type}
                    className={`type-btn ${postType === pt.type ? 'active' : ''}`}
                    onClick={() => setPostType(pt.type)}
                    style={{
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
                placeholder="What would you like to share with residents?"
                value={postText}
                onChange={(e) => setPostText(e.target.value)}
                rows={4}
                autoFocus
              />
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPostModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handlePostSubmit}
                disabled={!postText.trim()}
              >
                <Send size={18} />
                <span>Post</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerCommunity
