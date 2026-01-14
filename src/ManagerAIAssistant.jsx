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

function ManagerAIAssistant({ buildingData }) {
  const [messages, setMessages] = useState([])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(true)
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

  // Demo AI responses
  const getAIResponse = (question) => {
    const q = question.toLowerCase()

    if (q.includes('package') && q.includes('pending')) {
      return `You currently have **12 packages** pending pickup. 3 of them have been waiting for over 48 hours:

• **Unit 805** (Mike Thompson) - 3 days
• **Unit 1201** (Sarah Mitchell) - 2 days
• **Unit 402** (Jessica Kim) - 5 days

Would you like me to send reminder notifications?`
    }

    if (q.includes('joined') || q.includes('new resident')) {
      return `**3 new residents** joined ${building.name} this week:

• **Sarah Mitchell** (Unit 1201) - 2 days ago
• **Lisa Chen** (Unit 908) - 4 days ago
• **Mike Thompson** (Unit 805) - 6 days ago

You're now at **68% building adoption** (34 of 50 residents). Great progress! 🎉`
    }

    if (q.includes('unread') && q.includes('message')) {
      return `You have **2 unread messages**:

1. **Sarah Mitchell** (Unit 1201) - 1 hour ago
   _"Hi! I'm having trouble with my key fob..."_

2. **Mike Thompson** (Unit 805) - 2 hours ago
   _"When will the gym reopen?"_

Would you like me to open the Messages section?`
    }

    if (q.includes('event') && (q.includes('coming') || q.includes('upcoming'))) {
      return `Here are your upcoming events:

**This Week:**
• 🍷 **Wine & Cheese Social** - Friday, Jan 17 at 7:00 PM
  _Rooftop Lounge • 18 RSVPs_
• 🔧 **Building Maintenance** - Saturday, Jan 13 at 9:00 AM
  _All Common Areas_

**Next Week:**
• 🧘 **Yoga in the Park** - Sunday, Jan 21 at 10:00 AM
  _Courtyard • 8 RSVPs_

Would you like to create a new event?`
    }

    if (q.includes('briefing') || q.includes('daily') || q.includes('summary')) {
      return `Good afternoon, ${managerFirstName}! Here's your daily briefing for **${building.name}**:

📦 **Packages:** 12 pending (3 over 48hrs)
✉️ **Messages:** 2 unread
👥 **Residents:** 34 of 50 onboarded (68%)
📅 **Today:** No events scheduled
🎉 **This Week:** Wine & Cheese Social (Jan 17)

**🔔 Alerts:**
• Unit 805 package waiting 3 days
• 2 pending maintenance requests
• Emma Davis hasn't accepted invite (5 days)

You're doing great! Resident engagement is up **20%** this month. 📈`
    }

    if (q.includes('maintenance') && q.includes('request')) {
      return `You have **2 open maintenance requests**:

1. **Unit 1102** - Leaky faucet in bathroom
   _Submitted 2 days ago • Priority: Medium_

2. **Unit 309** - HVAC not cooling properly
   _Submitted today • Priority: High_

Both have been assigned to maintenance staff. Would you like to see the full maintenance log?`
    }

    if (q.includes('help') || q.includes('what can you')) {
      return `I can help you with lots of things! Here are some examples:

📦 **Packages** - Check pending pickups, send reminders
👥 **Residents** - See who's new, onboarding status
✉️ **Messages** - View unread messages, respond to inquiries
📅 **Events** - See upcoming events, RSVPs, create new ones
🔧 **Maintenance** - Track requests, assign work orders
📊 **Reports** - Generate briefings, see building stats

Just ask me anything in plain English!`
    }

    // Default response for other questions
    return `I'm not sure I understand that question yet. I can help you with:

• Package tracking and notifications
• Resident information and onboarding
• Messages and communications
• Events and RSVPs
• Maintenance requests
• Daily briefings and reports

Try asking something like "How many packages are pending?" or "Generate daily briefing"!`
  }

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
  const handleSend = () => {
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

    // Simulate AI thinking
    setTimeout(() => {
      const aiResponse = {
        id: Date.now() + 1,
        type: 'ai',
        text: getAIResponse(userMessage.text),
        timestamp: Date.now()
      }
      setIsTyping(false)
      setMessages(prev => [...prev, aiResponse])
    }, 1500)
  }

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setInputText(suggestion.text)
    inputRef.current?.focus()
    // Auto-send after a brief delay
    setTimeout(() => {
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

      setTimeout(() => {
        const aiResponse = {
          id: Date.now() + 1,
          type: 'ai',
          text: getAIResponse(suggestion.text),
          timestamp: Date.now()
        }
        setIsTyping(false)
        setMessages(prev => [...prev, aiResponse])
      }, 1500)
    }, 100)
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
