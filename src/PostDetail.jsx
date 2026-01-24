import { useState, useEffect } from 'react'
import { ChevronLeft, Heart, MessageCircle, Share2, Send, Sun, Cloud, CloudRain, Snowflake, Moon, MessageSquare, HelpCircle, Flag } from 'lucide-react'
import './PostDetail.css'

function PostDetail({ post, onBack, onNavigate }) {
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post?.likes || 0)
  const [comments, setComments] = useState(post?.commentsList || [])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)

  // Weather and time state - matches other pages exactly
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

  if (!post) {
    return null
  }

  // Post type configurations
  const postTypes = {
    share: { label: 'Share', icon: MessageSquare, color: '#3b82f6' },
    ask: { label: 'Ask', icon: HelpCircle, color: '#8b5cf6' },
    report: { label: 'Report', icon: Flag, color: '#ef4444' }
  }

  const typeConfig = postTypes[post.type] || postTypes.share
  const TypeIcon = typeConfig.icon

  // Format timestamp
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

  // User avatar for comments
  const userAvatar = '/images/profile-taylor.jpg'

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1)
    } else {
      setLikeCount(prev => prev + 1)
    }
    setIsLiked(!isLiked)
  }

  const handlePostComment = () => {
    if (newComment.trim()) {
      const comment = {
        id: Date.now(),
        author: 'You',
        firstName: 'You',
        unit: 'Unit 1201',
        avatar: userAvatar,
        text: newComment.trim(),
        timestamp: Date.now(),
        replies: [],
        parentId: replyingTo
      }

      if (replyingTo) {
        // Add as a reply to existing comment
        setComments(prev => prev.map(c => {
          if (c.id === replyingTo) {
            return { ...c, replies: [...(c.replies || []), comment] }
          }
          return c
        }))
      } else {
        // Add as new top-level comment
        setComments(prev => [...prev, comment])
      }

      setNewComment('')
      setReplyingTo(null)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handlePostComment()
    }
  }

  const handleReply = (commentId, authorName) => {
    setReplyingTo(commentId)
    setNewComment(`@${authorName} `)
  }

  const cancelReply = () => {
    setReplyingTo(null)
    setNewComment('')
  }

  return (
    <div className="post-detail-container resident-inner-page">
      {/* Hero Section */}
      <div className="inner-page-hero">
        {/* Back Button */}
        <button className="inner-page-back-btn" onClick={onBack}>
          <ChevronLeft size={24} />
        </button>

        {/* Weather Widget */}
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

        {/* Page Title */}
        <div className="inner-page-title-container">
          <h1 className="inner-page-title">Post</h1>
        </div>
      </div>

      {/* Content Section */}
      <div className="post-detail-content">
        {/* Author Card */}
        <div className="post-detail-author-card">
          <div className="post-detail-author">
            <div
              className="post-detail-avatar"
              style={{ background: `linear-gradient(135deg, ${typeConfig.color}, ${typeConfig.color}88)` }}
            >
              {post.author.charAt(0)}
            </div>
            <div className="post-detail-author-info">
              <span className="post-detail-author-name">{post.author}</span>
              <span className="post-detail-author-meta">
                {post.unit} • {formatTimeAgo(post.timestamp)}
              </span>
            </div>
          </div>
          <div
            className="post-detail-type-badge"
            style={{ background: `${typeConfig.color}15`, color: typeConfig.color }}
          >
            <TypeIcon size={12} />
            <span>{typeConfig.label}</span>
          </div>
        </div>

        {/* Full Post Content */}
        <div className="post-detail-body">
          <p className="post-detail-text">{post.text}</p>
        </div>

        {/* Reaction Summary */}
        <div className="post-detail-stats">
          <span className="stat-item">
            <Heart size={16} fill={likeCount > 0 ? '#ef4444' : 'none'} color={likeCount > 0 ? '#ef4444' : '#8A8075'} />
            <span>{likeCount} likes</span>
          </span>
          <span className="stat-item">
            <MessageCircle size={16} />
            <span>{post.comments + comments.length} comments</span>
          </span>
        </div>

        {/* Action Buttons */}
        <div className="post-detail-actions">
          <button
            className={`post-action-btn ${isLiked ? 'liked' : ''}`}
            onClick={handleLike}
          >
            <Heart size={20} fill={isLiked ? '#ef4444' : 'none'} />
            <span>Like</span>
          </button>
          <button className="post-action-btn">
            <MessageCircle size={20} />
            <span>Comment</span>
          </button>
          <button className="post-action-btn">
            <Share2 size={20} />
            <span>Share</span>
          </button>
        </div>

        {/* Comments Section */}
        <div className="post-detail-comments">
          <h3 className="comments-title">Comments</h3>

          {/* Comments List */}
          {comments.length > 0 ? (
            <div className="comments-list">
              {comments.map(comment => (
                <div key={comment.id} className="comment-item">
                  <div
                    className="comment-avatar"
                    style={{ background: comment.avatar ? 'transparent' : 'linear-gradient(135deg, #8A8075, #6B6560)' }}
                  >
                    {comment.avatar ? (
                      <img src={comment.avatar} alt={comment.author} />
                    ) : (
                      comment.author.charAt(0)
                    )}
                  </div>
                  <div className="comment-content">
                    <div className="comment-header">
                      <span className="comment-author">{comment.firstName || comment.author}</span>
                      <span className="comment-unit">{comment.unit}</span>
                      <span className="comment-time">{formatTimeAgo(comment.timestamp)}</span>
                    </div>
                    <p className="comment-text">{comment.text}</p>
                    <button
                      className="comment-reply-btn"
                      onClick={() => handleReply(comment.id, comment.firstName || comment.author)}
                    >
                      Reply
                    </button>

                    {/* Replies (one level max) */}
                    {comment.replies && comment.replies.length > 0 && (
                      <div className="comment-replies">
                        {comment.replies.map(reply => (
                          <div key={reply.id} className="comment-item reply">
                            <div
                              className="comment-avatar"
                              style={{ background: reply.avatar ? 'transparent' : 'linear-gradient(135deg, #8A8075, #6B6560)' }}
                            >
                              {reply.avatar ? (
                                <img src={reply.avatar} alt={reply.author} />
                              ) : (
                                reply.author.charAt(0)
                              )}
                            </div>
                            <div className="comment-content">
                              <div className="comment-header">
                                <span className="comment-author">{reply.firstName || reply.author}</span>
                                <span className="comment-unit">{reply.unit}</span>
                                <span className="comment-time">{formatTimeAgo(reply.timestamp)}</span>
                              </div>
                              <p className="comment-text">{reply.text}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="no-comments">
              <MessageCircle size={32} />
              <p>No comments yet. Be the first to comment!</p>
            </div>
          )}
        </div>
      </div>

      {/* Comment Input - Fixed at bottom */}
      <div className="comment-input-container">
        {replyingTo && (
          <div className="replying-to-indicator">
            <span>Replying to comment</span>
            <button onClick={cancelReply}>Cancel</button>
          </div>
        )}
        <div className="comment-input-row">
          <img
            src={userAvatar}
            alt="You"
            className="comment-input-avatar"
          />
          <div className="comment-input-wrapper">
            <input
              type="text"
              className="comment-input"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              className="comment-send-btn"
              onClick={handlePostComment}
              disabled={!newComment.trim()}
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PostDetail
