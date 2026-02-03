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
  ChevronRight
} from 'lucide-react'
import './ManagerAIAssistant.css'
import { sendMessage, BM_SYSTEM_PROMPT } from './services/aiService'

function ManagerAIAssistant({ buildingData }) {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
  const [error, setError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  const building = buildingData || {
    name: 'The Paramount',
    manager: { name: 'Taylor Young' }
  }

  const managerFirstName = building.manager.name.split(' ')[0]

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

    // Custom system prompt with building context
    const systemPrompt = `${BM_SYSTEM_PROMPT}

Current building: ${building.name}
Manager: ${building.manager.name}`

    try {
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

    const systemPrompt = `${BM_SYSTEM_PROMPT}

Current building: ${building.name}
Manager: ${building.manager.name}`

    try {
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

        {/* Conversation History Placeholder */}
        <div className="ai-history">
          <h3>Recent Conversations</h3>
          <div className="history-placeholder">
            <Clock size={20} />
            <p>Your conversation history will appear here</p>
          </div>
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
