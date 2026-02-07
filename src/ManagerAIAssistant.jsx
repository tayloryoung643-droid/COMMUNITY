import { useState, useRef, useEffect } from 'react'
import {
  Sparkles,
  Send,
  Mic,
  Package,
  Users,
  MessageSquare,
  Calendar,
  ClipboardList,
  FileText,
  Trash2,
  Clock,
  ChevronRight,
  Plus,
  MoreVertical
} from 'lucide-react'
import './ManagerAIAssistant.css'
import { sendMessage, BM_SYSTEM_PROMPT } from './services/aiService'
import { fetchAllBuildingData, formatBuildingDataForAI } from './services/aiBuildingDataService'
import {
  getConversations,
  getConversation,
  createConversation,
  updateConversationMessages,
  deleteConversation,
  formatConversationTime
} from './services/aiConversationService'

function ManagerAIAssistant({ buildingData, dashboardData, userId }) {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Conversation persistence state
  const [conversations, setConversations] = useState([])
  const [currentConversationId, setCurrentConversationId] = useState(null)
  const [loadingConversations, setLoadingConversations] = useState(true)

  const building = buildingData || {
    name: 'The Paramount',
    manager: { name: 'Taylor Young' }
  }

  const managerFirstName = building.manager?.name?.split(' ')[0] || 'Manager'
  // Get buildingId from dashboardData (which has the full data structure)
  const buildingId = dashboardData?.building?.id
  const managerId = userId || dashboardData?.manager?.id

  // Build context string from dashboard data
  const getBuildingContext = () => {
    if (!dashboardData) return ''

    const stats = dashboardData.stats || {}
    const newResidents = dashboardData.newResidents || []
    const recentActivity = dashboardData.recentActivity || []
    const upcomingEvents = dashboardData.upcomingEvents || []

    let context = `
CURRENT BUILDING DATA (as of now):

Building Stats:
- Total residents: ${stats.totalResidents || 0}
- Residents joined: ${stats.residentsJoined || 0} (${stats.totalResidents ? Math.round((stats.residentsJoined || 0) / stats.totalResidents * 100) : 0}% onboarded)
- New residents this week: ${stats.newResidentsThisWeek || newResidents.length || 0}
- Packages pending pickup: ${stats.packagesPending || 0}
- Packages overdue (48+ hours): ${stats.packagesOverdue || 0}
- Unread messages: ${stats.unreadMessages || 0}
- Events this week: ${stats.eventsThisWeek || 0}
- Community posts today: ${stats.postsToday || 0}
- Engagement rate: ${stats.engagementRate || 0}%`

    if (newResidents.length > 0) {
      context += `

New Residents This Week:`
      newResidents.forEach(r => {
        context += `
- ${r.name} (Unit ${r.unit || 'TBD'}) - joined ${r.joinedAgo || 'recently'}`
      })
    }

    if (upcomingEvents.length > 0) {
      context += `

Upcoming Events:`
      upcomingEvents.forEach(e => {
        context += `
- ${e.title} - ${e.date} at ${e.time} (${e.location || 'TBD'})`
      })
    }

    if (recentActivity.length > 0) {
      context += `

Recent Activity:`
      recentActivity.slice(0, 5).forEach(a => {
        context += `
- ${a.text} (${a.time})`
      })
    }

    return context
  }

  // Quick action suggestions
  const suggestions = [
    { id: 1, text: 'How many packages are pending?', icon: Package },
    { id: 2, text: 'Who joined this week?', icon: Users },
    { id: 3, text: 'Show unread messages', icon: MessageSquare },
    { id: 4, text: 'What events are coming up?', icon: Calendar },
    { id: 5, text: 'Generate daily briefing', icon: FileText },
    { id: 6, text: 'Show maintenance requests', icon: ClipboardList }
  ]

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  // Load conversation history on mount
  useEffect(() => {
    if (buildingId && managerId) {
      loadConversations()
    } else {
      setLoadingConversations(false)
    }
  }, [buildingId, managerId])

  // Save messages whenever they change (debounced)
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      const timer = setTimeout(() => {
        saveCurrentConversation()
      }, 1000) // Save 1 second after last change
      return () => clearTimeout(timer)
    }
  }, [messages, currentConversationId])

  const loadConversations = async () => {
    try {
      setLoadingConversations(true)
      const convos = await getConversations(buildingId, managerId)
      setConversations(convos)
      console.log('[ManagerAIAssistant] Loaded conversations:', convos.length)
    } catch (err) {
      console.error('[ManagerAIAssistant] Error loading conversations:', err)
    } finally {
      setLoadingConversations(false)
    }
  }

  const saveCurrentConversation = async () => {
    if (!currentConversationId || messages.length === 0) return
    try {
      await updateConversationMessages(currentConversationId, messages)
      console.log('[ManagerAIAssistant] Conversation saved')
    } catch (err) {
      console.error('[ManagerAIAssistant] Error saving conversation:', err)
    }
  }

  const startNewConversation = async (firstMessage) => {
    if (!buildingId || !managerId) {
      console.warn('[ManagerAIAssistant] Cannot create conversation - missing buildingId or managerId')
      return null
    }
    try {
      const newConvo = await createConversation(buildingId, managerId, firstMessage)
      if (newConvo) {
        setCurrentConversationId(newConvo.id)
        // Refresh conversations list
        loadConversations()
        return newConvo.id
      }
    } catch (err) {
      console.error('[ManagerAIAssistant] Error creating conversation:', err)
    }
    return null
  }

  const loadConversation = async (conversationId) => {
    try {
      const convo = await getConversation(conversationId)
      if (convo) {
        setMessages(convo.messages || [])
        setCurrentConversationId(conversationId)
        setShowSuggestions(false)
        console.log('[ManagerAIAssistant] Loaded conversation:', conversationId)
      }
    } catch (err) {
      console.error('[ManagerAIAssistant] Error loading conversation:', err)
    }
  }

  const handleDeleteConversation = async (conversationId, e) => {
    e.stopPropagation()
    if (confirm('Delete this conversation?')) {
      const success = await deleteConversation(conversationId)
      if (success) {
        // If deleting current conversation, clear it
        if (conversationId === currentConversationId) {
          setMessages([])
          setCurrentConversationId(null)
          setShowSuggestions(true)
        }
        loadConversations()
      }
    }
  }

  const handleNewChat = () => {
    setMessages([])
    setCurrentConversationId(null)
    setShowSuggestions(true)
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Format timestamp
  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Handle sending a message
  const handleSend = async () => {
    if (!inputText.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputText.trim(),
      timestamp: Date.now()
    }

    // Create new conversation if this is the first message
    let activeConversationId = currentConversationId
    if (!activeConversationId && messages.length === 0) {
      activeConversationId = await startNewConversation(inputText.trim())
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setShowSuggestions(false)
    setIsTyping(true)
    setError(null)

    // Build conversation history for context
    const conversationHistory = [...messages, userMessage].map(msg => ({
      role: msg.type === 'user' ? 'user' : 'assistant',
      content: msg.text
    }))

    try {
      // Fetch ALL fresh building data before each query
      // Note: buildingId comes from the component-level variable (derived from dashboardData)
      console.log('[ManagerAIAssistant] dashboardData:', dashboardData)
      console.log('[ManagerAIAssistant] buildingData prop:', buildingData)
      console.log('[ManagerAIAssistant] building state:', building)
      console.log('[ManagerAIAssistant] Using buildingId:', buildingId)
      console.log('[ManagerAIAssistant] Using managerId:', managerId)

      const allData = buildingId ? await fetchAllBuildingData(buildingId) : null
      console.log('[ManagerAIAssistant] Fetched allData:', allData ? 'Data received' : 'No data')
      if (allData) {
        console.log('[ManagerAIAssistant] Residents count:', allData.residents?.length)
      }

      const fullContext = allData
        ? formatBuildingDataForAI(allData, { name: building.manager?.name || 'Property Manager' })
        : getBuildingContext()

      console.log('[ManagerAIAssistant] Context length:', fullContext?.length, 'chars')
      console.log('[ManagerAIAssistant] Context preview (first 500 chars):', fullContext?.substring(0, 500))

      // Custom system prompt with COMPLETE building data
      const systemPrompt = `${BM_SYSTEM_PROMPT}

Current building: ${building.name}
Manager: ${building.manager?.name || 'Property Manager'}
${fullContext}

IMPORTANT: Use the COMPLETE BUILDING DATA above to give accurate, specific answers. Include real names, unit numbers, dates, and numbers from the data. If asked about specific residents, packages, events, messages, or any building information - reference the actual data provided.`

      const response = await sendMessage(conversationHistory, systemPrompt)

      if (response.success) {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          text: response.message,
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, aiResponse])
      } else {
        setError(response.error || 'Failed to get response')
        // Show error as AI message
        const errorResponse = {
          id: Date.now() + 1,
          type: 'ai',
          text: `I'm sorry, I encountered an error: ${response.error}. Please try again.`,
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, errorResponse])
      }
    } catch (err) {
      setError('Network error')
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: "I'm having trouble connecting. Please check your internet connection and try again.",
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle suggestion click
  const handleSuggestionClick = async (suggestion) => {
    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: suggestion.text,
      timestamp: Date.now()
    }

    // Create new conversation if this is the first message
    let activeConversationId = currentConversationId
    if (!activeConversationId && messages.length === 0) {
      activeConversationId = await startNewConversation(suggestion.text)
    }

    setMessages(prev => [...prev, userMessage])
    setInputText('')
    setShowSuggestions(false)
    setIsTyping(true)
    setError(null)

    // Build conversation history
    const conversationHistory = [userMessage].map(msg => ({
      role: 'user',
      content: msg.text
    }))

    try {
      // Fetch ALL fresh building data before each query
      // Note: buildingId comes from the component-level variable (derived from dashboardData)
      const allData = buildingId ? await fetchAllBuildingData(buildingId) : null
      const fullContext = allData
        ? formatBuildingDataForAI(allData, { name: building.manager?.name || 'Property Manager' })
        : getBuildingContext()

      const systemPrompt = `${BM_SYSTEM_PROMPT}

Current building: ${building.name}
Manager: ${building.manager?.name || 'Property Manager'}
${fullContext}

IMPORTANT: Use the COMPLETE BUILDING DATA above to give accurate, specific answers. Include real names, unit numbers, dates, and numbers from the data. If asked about specific residents, packages, events, messages, or any building information - reference the actual data provided.`

      const response = await sendMessage(conversationHistory, systemPrompt)

      if (response.success) {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          text: response.message,
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, aiResponse])
      } else {
        const errorResponse = {
          id: Date.now() + 1,
          type: 'ai',
          text: `I'm sorry, I encountered an error: ${response.error}. Please try again.`,
          timestamp: Date.now()
        }
        setMessages(prev => [...prev, errorResponse])
      }
    } catch (err) {
      const errorResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: "I'm having trouble connecting. Please check your internet connection and try again.",
        timestamp: Date.now()
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle clear chat
  const handleClearChat = () => {
    setMessages([])
    setShowSuggestions(true)
  }

  // Handle key press
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Render markdown-like text (basic support for **bold**)
  const renderMessageText = (text) => {
    // Split by **text** pattern for bold
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i}>{part.slice(2, -2)}</strong>
      }
      // Handle _italic_ as well
      if (part.startsWith('_') && part.endsWith('_')) {
        return <em key={i}>{part.slice(1, -1)}</em>
      }
      return part
    })
  }

  // Render message with line breaks and formatting
  const renderMessage = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {renderMessageText(line)}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ))
  }

  return (
    <div className="manager-ai-assistant">
      {/* Left Sidebar */}
      <div className="ai-sidebar">
        <div className="ai-sidebar-header">
          <div className="ai-logo">
            <Sparkles size={24} />
          </div>
          <div className="ai-title-section">
            <h2>AI Assistant</h2>
            <p>Ask me anything about your building</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="ai-quick-actions">
          <h3>Quick Actions</h3>
          <div className="suggestion-chips">
            {suggestions.map(suggestion => (
              <button
                key={suggestion.id}
                className="suggestion-chip"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                <suggestion.icon size={14} />
                <span>{suggestion.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Conversation History */}
        <div className="ai-history">
          <div className="ai-history-header">
            <h3>Recent Conversations</h3>
            <button className="new-chat-btn" onClick={handleNewChat} title="New conversation">
              <Plus size={16} />
            </button>
          </div>
          {loadingConversations ? (
            <div className="history-placeholder">
              <Clock size={20} />
              <p>Loading conversations...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="history-placeholder">
              <Clock size={20} />
              <p>Your conversation history will appear here</p>
            </div>
          ) : (
            <div className="conversation-list">
              {conversations.map(convo => (
                <div
                  key={convo.id}
                  className={`conversation-item ${convo.id === currentConversationId ? 'active' : ''}`}
                  onClick={() => loadConversation(convo.id)}
                >
                  <div className="conversation-item-content">
                    <span className="conversation-title">{convo.title}</span>
                    <span className="conversation-time">{formatConversationTime(convo.updated_at)}</span>
                  </div>
                  <button
                    className="conversation-delete-btn"
                    onClick={(e) => handleDeleteConversation(convo.id, e)}
                    title="Delete conversation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="ai-chat-area">
        {/* Chat Header */}
        <div className="chat-header">
          <div className="chat-header-info">
            <span className="chat-status">
              <span className="status-dot" />
              Online
            </span>
          </div>
          {messages.length > 0 && (
            <button className="clear-chat-btn" onClick={handleClearChat}>
              <Trash2 size={16} />
              <span>Clear chat</span>
            </button>
          )}
        </div>

        {/* Messages Container */}
        <div className="messages-container">
          {/* Welcome Message */}
          <div className="welcome-message">
            <div className="ai-avatar">
              <Sparkles size={24} />
            </div>
            <div className="welcome-content">
              <h3>Hi {managerFirstName}! 👋</h3>
              <p>I'm your building assistant for <strong>{building.name}</strong>. Ask me anything about packages, residents, events, maintenance, or get a daily briefing!</p>
            </div>
          </div>

          {/* Show suggestions if no messages yet */}
          {showSuggestions && messages.length === 0 && (
            <div className="inline-suggestions">
              <p>Try asking:</p>
              <div className="inline-suggestion-list">
                {suggestions.slice(0, 4).map(suggestion => (
                  <button
                    key={suggestion.id}
                    className="inline-suggestion"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    {suggestion.text}
                    <ChevronRight size={14} />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {messages.map(message => (
            <div
              key={message.id}
              className={`chat-message ${message.type === 'user' ? 'user-message' : 'ai-message'}`}
            >
              {message.type === 'ai' && (
                <div className="message-avatar">
                  <Sparkles size={16} />
                </div>
              )}
              <div className="message-bubble">
                <div className="message-text">
                  {renderMessage(message.text)}
                </div>
                <span className="message-time">{formatTime(message.timestamp)}</span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="chat-message ai-message">
              <div className="message-avatar">
                <Sparkles size={16} />
              </div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="chat-input-area">
          <div className="chat-input-wrapper">
            <textarea
              ref={inputRef}
              placeholder="Ask about packages, residents, events..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={handleKeyPress}
              rows={1}
            />
            <div className="input-actions">
              <button className="mic-btn" title="Voice input (coming soon)">
                <Mic size={20} />
              </button>
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!inputText.trim()}
              >
                <Send size={20} />
              </button>
            </div>
          </div>
          <p className="input-hint">Press Enter to send, Shift+Enter for new line</p>
        </div>
      </div>
    </div>
  )
}

export default ManagerAIAssistant
