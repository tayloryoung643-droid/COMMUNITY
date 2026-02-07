import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, Heart, MessageCircle, Share2, Send, Sun, Cloud, CloudRain, Snowflake, Moon, MessageSquare, HelpCircle, Flag, Check } from 'lucide-react'
import { addComment, getComments, likePost, unlikePost, hasUserLikedPost } from './services/communityPostService'
import { useAuth } from './contexts/AuthContext'
import './PostDetail.css'

function PostDetail({ post, onBack, onNavigate, userProfile, isDemoMode }) {
  // Get cached building background URL from context
  const { buildingBackgroundUrl } = useAuth()

  const [isLiked, setIsLiked] = useState(post?.userLiked || false)
  const [likeCount, setLikeCount] = useState(post?.likes || 0)
  const [comments, setComments] = useState(post?.commentsList || [])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLiking, setIsLiking] = useState(false)
  const commentInputRef = useRef(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const showToastMsg = (msg) => {
    setToastMessage(msg)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 2000)
  }

  const handleShare = () => {
    navigator.clipboard.writeText(post?.text || '').then(() => {
      showToastMsg('Copied!')
    }).catch(() => {
      showToastMsg('Failed to copy')
    })
  }

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

  // Fetch comments from Supabase for real users
  useEffect(() => {
    const fetchComments = async () => {
      if (isDemoMode || !post?.id) return

      try {
        const data = await getComments(post.id)
        if (data && data.length > 0) {
          const transformedComments = data.map(c => ({
            id: c.id,
            author: c.author?.full_name || 'Neighbor',
            firstName: c.author?.full_name?.split(' ')[0] || 'Neighbor',
            unit: c.author?.unit_number ? `Unit ${c.author.unit_number}` : '',
            text: c.content,
            timestamp: new Date(c.created_at).getTime(),
            replies: []
          }))
          setComments(transformedComments)
        }
      } catch (err) {
        console.error('[PostDetail] Error fetching comments:', err)
      }
    }

    fetchComments()
  }, [post?.id, isDemoMode])

  // Fetch like status from Supabase for real users
  useEffect(() => {
    const fetchLikeStatus = async () => {
      if (isDemoMode || !post?.id || !userProfile?.id) return

      try {
        const liked = await hasUserLikedPost(post.id, userProfile.id)
        console.log('[PostDetail] Like status fetched:', liked)
        setIsLiked(liked)
      } catch (err) {
        console.error('[PostDetail] Error fetching like status:', err)
      }
    }

    fetchLikeStatus()
  }, [post?.id, userProfile?.id, isDemoMode])

  // Focus comment input handler
  const focusCommentInput = () => {
    console.log('[PostDetail] Comment button clicked, focusing input')
    if (commentInputRef.current) {
      console.log('[PostDetail] Input ref found, focusing...')
      commentInputRef.current.focus()
      // Scroll the page to bottom to reveal the input
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    } else {
      console.log('[PostDetail] Input ref NOT found!')
    }
  }

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

  const handleLike = async () => {
    if (isLiking) return

    const wasLiked = isLiked

    // Optimistic update
    setIsLiked(!wasLiked)
    setLikeCount(prev => wasLiked ? prev - 1 : prev + 1)

    if (!isDemoMode && userProfile?.id && post?.id) {
      setIsLiking(true)
      try {
        if (wasLiked) {
          console.log('[PostDetail] Unliking post:', post.id)
          await unlikePost(post.id, userProfile.id)
        } else {
          console.log('[PostDetail] Liking post:', post.id)
          await likePost(post.id, userProfile.id)
        }
        console.log('[PostDetail] Like action successful')
      } catch (err) {
        console.error('[PostDetail] Error updating like:', err)
        // Revert optimistic update on error
        setIsLiked(wasLiked)
        setLikeCount(prev => wasLiked ? prev + 1 : prev - 1)
      } finally {
        setIsLiking(false)
      }
    }
  }

  const handlePostComment = async () => {
    if (!newComment.trim() || isSubmitting) return

    const commentText = newComment.trim()
    setIsSubmitting(true)

    if (isDemoMode) {
      // Demo mode: add to local state only
      const comment = {
        id: Date.now(),
        author: 'You',
        firstName: 'You',
        unit: 'Unit 1201',
        avatar: userAvatar,
        text: commentText,
        timestamp: Date.now(),
        replies: [],
        parentId: replyingTo
      }

      if (replyingTo) {
        setComments(prev => prev.map(c => {
          if (c.id === replyingTo) {
            return { ...c, replies: [...(c.replies || []), comment] }
          }
          return c
        }))
      } else {
        setComments(prev => [...prev, comment])
      }

      setNewComment('')
      setReplyingTo(null)
      setIsSubmitting(false)
    } else {
      // Real mode: save to Supabase
      console.log('[PostDetail] Attempting to post comment:', {
        postId: post.id,
        userId: userProfile?.id,
        content: commentText
      })

      if (!userProfile?.id) {
        console.error('[PostDetail] No user profile available')
        alert('Please log in to comment.')
        setIsSubmitting(false)
        return
      }

      if (!post?.id) {
        console.error('[PostDetail] No post ID available')
        alert('Unable to comment on this post.')
        setIsSubmitting(false)
        return
      }

      try {
        const newCommentData = await addComment(post.id, userProfile.id, commentText)
        console.log('[PostDetail] Comment created successfully:', newCommentData)

        const comment = {
          id: newCommentData.id,
          author: userProfile.full_name || 'You',
          firstName: userProfile.full_name?.split(' ')[0] || 'You',
          unit: userProfile.unit_number ? `Unit ${userProfile.unit_number}` : '',
          text: commentText,
          timestamp: Date.now(),
          replies: []
        }

        setComments(prev => [...prev, comment])
        setNewComment('')
        setReplyingTo(null)
      } catch (err) {
        console.error('[PostDetail] Error posting comment:', err)
        alert(`Failed to post comment: ${err.message || 'Please try again.'}`)
      } finally {
        setIsSubmitting(false)
      }
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

  // CSS variable for building background image
  const bgStyle = buildingBackgroundUrl ? { '--building-bg-image': `url(${buildingBackgroundUrl})` } : {}

  return (
    <div className="post-detail-container resident-inner-page" style={bgStyle}>
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
            <span>{comments.length} comments</span>
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
          <button className="post-action-btn" onClick={focusCommentInput}>
            <MessageCircle size={20} />
            <span>Comment</span>
          </button>
          <button className="post-action-btn" onClick={handleShare}>
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
              ref={commentInputRef}
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

      {/* Toast Notification */}
      {showToast && (
        <div className="copied-toast">
          <Check size={14} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  )
}

export default PostDetail
