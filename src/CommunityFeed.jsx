import { useState } from 'react'
import { ArrowLeft, MessageSquare, HelpCircle, Flag, Heart, MessageCircle, Share2, MoreHorizontal, Send, X, Sparkles } from 'lucide-react'
import './CommunityFeed.css'

function CommunityFeed({ onBack, posts, onAddPost }) {
  const [showPostModal, setShowPostModal] = useState(false)
  const [postType, setPostType] = useState('share')
  const [postText, setPostText] = useState('')
  const [likedPosts, setLikedPosts] = useState(new Set())
  const [activeFilter, setActiveFilter] = useState('all')

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

  const handlePostSubmit = () => {
    if (postText.trim() && onAddPost) {
      onAddPost({
        type: postType,
        text: postText.trim(),
      })
      setShowPostModal(false)
      setPostText('')
    }
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

  return (
    <div className="community-feed-container">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <header className="community-feed-header">
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="page-title-light">Community</h1>
      </header>

      <main className="community-feed-content">
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
            <div className="empty-feed">
              <MessageSquare size={48} />
              <h3>No posts yet</h3>
              <p>Be the first to share something with your neighbors!</p>
            </div>
          ) : (
            posts.filter(p => activeFilter === 'all' || p.type === activeFilter).map((post) => {
              const typeConfig = getPostTypeConfig(post.type)
              const IconComponent = typeConfig.icon
              const isLiked = likedPosts.has(post.id)

              return (
                <article key={post.id} className="post-card">
                  <div className="post-header">
                    <div className="post-author">
                      <div className="author-avatar" style={{ background: `linear-gradient(135deg, ${typeConfig.color}, ${typeConfig.color}88)` }}>
                        {post.author.charAt(0)}
                      </div>
                      <div className="author-info">
                        <span className="author-name">{post.author}</span>
                        <span className="post-meta">
                          <span className="post-unit">{post.unit}</span>
                          <span className="meta-dot">·</span>
                          <span className="post-time">{formatTimeAgo(post.timestamp)}</span>
                        </span>
                      </div>
                    </div>
                    <div className="post-type-badge" style={{ background: `${typeConfig.color}20`, color: typeConfig.color }}>
                      <IconComponent size={12} />
                      <span>{typeConfig.label}</span>
                    </div>
                  </div>

                  <div className="post-content">
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
                    <button className="action-btn more-btn">
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </article>
              )
            })
          )}
        </div>
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
