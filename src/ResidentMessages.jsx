import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, Send, Sun, Cloud, Moon, MessageCircle } from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getConversation, sendMessage, getBuildingManager, markConversationAsRead } from './services/messageService'
import './ResidentMessages.css'

function ResidentMessages({ onBack, onNavigate }) {
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [manager, setManager] = useState(null)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)

  // Weather and time state - matches other pages
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

  const getWeatherIcon = () => {
    const hour = currentTime.getHours()
    const isNight = hour >= 18 || hour < 6
    if (isNight) return Moon
    return weatherData.condition === 'cloudy' ? Cloud : Sun
  }

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDay = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const WeatherIcon = getWeatherIcon()

  // Load conversation on mount
  useEffect(() => {
    async function loadConversation() {
      if (isInDemoMode) {
        // Demo mode: show demo conversation
        setManager({ id: 'demo-manager', full_name: 'Property Manager', role: 'manager' })
        setMessages([
          {
            id: 1,
            from_user_id: 'demo-manager',
            to_user_id: userProfile?.id,
            content: "Welcome to Skyline Towers! I'm your building manager. Feel free to reach out if you have any questions or concerns.",
            created_at: new Date(Date.now() - 86400000).toISOString(),
            is_read: true
          },
          {
            id: 2,
            from_user_id: userProfile?.id,
            to_user_id: 'demo-manager',
            content: "Hi! Thanks for the warm welcome. Quick question - what are the gym hours?",
            created_at: new Date(Date.now() - 82800000).toISOString(),
            is_read: true
          },
          {
            id: 3,
            from_user_id: 'demo-manager',
            to_user_id: userProfile?.id,
            content: "The gym is open 24/7 for residents! Just use your key fob to access it. Let me know if you need anything else.",
            created_at: new Date(Date.now() - 79200000).toISOString(),
            is_read: true
          }
        ])
        setLoading(false)
        return
      }

      // Real mode: fetch from Supabase
      try {
        // First, get the building manager
        const mgr = await getBuildingManager(userProfile?.building_id)
        if (!mgr) {
          setError('Unable to find building manager')
          setLoading(false)
          return
        }
        setManager(mgr)

        // Get conversation with manager
        const conv = await getConversation(userProfile?.id, mgr.id)
        setMessages(conv)

        // Mark messages from manager as read
        await markConversationAsRead(userProfile?.id, mgr.id)
      } catch (err) {
        console.error('[ResidentMessages] Error loading conversation:', err)
        setError('Failed to load messages')
      } finally {
        setLoading(false)
      }
    }

    loadConversation()
  }, [userProfile, isInDemoMode])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Format message timestamp
  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })

    if (date.toDateString() === today.toDateString()) {
      return `Today ${timeStr}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday ${timeStr}`
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${timeStr}`
    }
  }

  // Handle send message
  const handleSend = async () => {
    if (!newMessage.trim() || !manager || sending) return

    const messageText = newMessage.trim()
    setNewMessage('')
    setSending(true)

    if (isInDemoMode) {
      // Demo mode: add to local state
      const demoMessage = {
        id: Date.now(),
        from_user_id: userProfile?.id,
        to_user_id: manager.id,
        content: messageText,
        created_at: new Date().toISOString(),
        is_read: false
      }
      setMessages(prev => [...prev, demoMessage])
      setSending(false)
      return
    }

    // Real mode: send to Supabase
    try {
      const sent = await sendMessage({
        building_id: userProfile?.building_id,
        from_user_id: userProfile?.id,
        to_user_id: manager.id,
        content: messageText
      })
      setMessages(prev => [...prev, sent])
    } catch (err) {
      console.error('[ResidentMessages] Error sending message:', err)
      setNewMessage(messageText) // Restore message on error
      alert('Failed to send message. Please try again.')
    } finally {
      setSending(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Check if message is from current user
  const isFromMe = (msg) => msg.from_user_id === userProfile?.id

  if (loading) {
    return (
      <div className="resident-messages resident-inner-page">
        <div className="inner-page-hero">
          <button className="inner-page-back-btn" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
          <div className="inner-page-title-container">
            <h1 className="inner-page-title">Messages</h1>
          </div>
        </div>
        <div className="messages-loading">
          <p>Loading messages...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="resident-messages resident-inner-page">
        <div className="inner-page-hero">
          <button className="inner-page-back-btn" onClick={onBack}>
            <ChevronLeft size={24} />
          </button>
          <div className="inner-page-title-container">
            <h1 className="inner-page-title">Messages</h1>
          </div>
        </div>
        <div className="messages-error">
          <p>{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="resident-messages resident-inner-page">
      {/* Hero Section */}
      <div className="inner-page-hero">
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
          <h1 className="inner-page-title">Messages</h1>
          {manager && (
            <p className="inner-page-subtitle">with {manager.full_name || 'Building Manager'}</p>
          )}
        </div>
      </div>

      {/* Messages Thread */}
      <div className="messages-thread">
        {messages.length === 0 ? (
          <div className="messages-empty">
            <MessageCircle size={48} />
            <h3>No messages yet</h3>
            <p>Send a message to your building manager to get started.</p>
          </div>
        ) : (
          messages.map(msg => (
            <div
              key={msg.id}
              className={`message-bubble ${isFromMe(msg) ? 'sent' : 'received'}`}
            >
              <div className="bubble-content">
                <p>{msg.content}</p>
              </div>
              <span className="bubble-time">{formatMessageTime(msg.created_at)}</span>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="message-input-container">
        <div className="message-input-row">
          <textarea
            className="message-input"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <button
            className="send-btn"
            onClick={handleSend}
            disabled={!newMessage.trim() || sending}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  )
}

export default ResidentMessages
