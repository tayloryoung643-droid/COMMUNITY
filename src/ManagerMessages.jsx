import { useState, useEffect } from 'react'
import {
  Search,
  Send,
  Archive,
  CheckCircle,
  ArrowLeft,
  Phone,
  Mail,
  MoreVertical
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getMessages, sendMessage } from './services/messageService'
import './ManagerMessages.css'

// Demo messages data - used when in demo mode
const DEMO_MESSAGES = [
  {
    id: 1,
    resident: {
      name: 'Sarah Mitchell',
      unit: '1201',
      email: 'sarah.m@email.com',
      phone: '(555) 123-4567'
    },
    unread: true,
    archived: false,
    thread: [
      {
        id: 1,
        sender: 'resident',
        text: "Hi! I'm having trouble with my key fob. It stopped working this morning and I can't get into the building. Can someone help?",
        timestamp: Date.now() - 3600000
      }
    ]
  },
  {
    id: 2,
    resident: {
      name: 'Mike Thompson',
      unit: '805',
      email: 'mike.t@email.com',
      phone: '(555) 234-5678'
    },
    unread: true,
    archived: false,
    thread: [
      {
        id: 1,
        sender: 'resident',
        text: "When will the gym reopen? It's been closed for 3 days now and I haven't seen any updates.",
        timestamp: Date.now() - 7200000
      },
      {
        id: 2,
        sender: 'manager',
        text: "Hi Mike, thanks for reaching out. The gym is undergoing equipment maintenance. We expect it to reopen tomorrow morning.",
        timestamp: Date.now() - 5400000
      },
      {
        id: 3,
        sender: 'resident',
        text: "Great, thanks for the update! Will there be any new equipment?",
        timestamp: Date.now() - 3600000
      }
    ]
  },
  {
    id: 3,
    resident: {
      name: 'Jessica Kim',
      unit: '402',
      email: 'jessica.k@email.com',
      phone: '(555) 345-6789'
    },
    unread: false,
    archived: false,
    thread: [
      {
        id: 1,
        sender: 'resident',
        text: "There's a package for me that's been sitting in the mail room for over a week. It's a large box from Amazon. Can you help me locate it?",
        timestamp: Date.now() - 86400000
      },
      {
        id: 2,
        sender: 'manager',
        text: "Hi Jessica, I found your package! It was placed in the overflow storage area due to its size. You can pick it up from the concierge desk.",
        timestamp: Date.now() - 82800000
      },
      {
        id: 3,
        sender: 'resident',
        text: "Thank you so much! I'll grab it after work today.",
        timestamp: Date.now() - 79200000
      }
    ]
  },
  {
    id: 4,
    resident: {
      name: 'Alex Rivera',
      unit: '1104',
      email: 'alex.r@email.com',
      phone: '(555) 456-7890'
    },
    unread: false,
    archived: false,
    thread: [
      {
        id: 1,
        sender: 'resident',
        text: "Can we get recycling bins added to the 11th floor? Currently we have to go down to the 1st floor to recycle, which is inconvenient.",
        timestamp: Date.now() - 172800000
      },
      {
        id: 2,
        sender: 'manager',
        text: "That's a great suggestion, Alex! I'll bring this up at the next building committee meeting and see what we can do.",
        timestamp: Date.now() - 158400000
      }
    ]
  },
  {
    id: 5,
    resident: {
      name: 'Chris Walker',
      unit: '309',
      email: 'chris.w@email.com',
      phone: '(555) 567-8901'
    },
    unread: false,
    archived: false,
    thread: [
      {
        id: 1,
        sender: 'resident',
        text: "Thank you for fixing the elevator so quickly! I know it was an emergency repair and the team did a great job getting it done over the weekend.",
        timestamp: Date.now() - 259200000
      },
      {
        id: 2,
        sender: 'manager',
        text: "Thank you for the kind words, Chris! I'll pass along your appreciation to the maintenance team. We're glad we could get it fixed quickly.",
        timestamp: Date.now() - 252000000
      }
    ]
  },
  {
    id: 6,
    resident: {
      name: 'Emily Chen',
      unit: '1507',
      email: 'emily.c@email.com',
      phone: '(555) 678-9012'
    },
    unread: false,
    archived: true,
    thread: [
      {
        id: 1,
        sender: 'resident',
        text: "Is there a way to reserve the rooftop lounge for a private party?",
        timestamp: Date.now() - 604800000
      },
      {
        id: 2,
        sender: 'manager',
        text: "Yes! You can reserve the rooftop lounge through the building app. Go to Calendar > Book Space and select the date you'd like.",
        timestamp: Date.now() - 601200000
      },
      {
        id: 3,
        sender: 'resident',
        text: "Perfect, I found it. Thanks!",
        timestamp: Date.now() - 597600000
      }
    ]
  }
]

function ManagerMessages() {
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [showMobileDetail, setShowMobileDetail] = useState(false)

  useEffect(() => {
    console.log('[ManagerMessages] Demo mode:', isInDemoMode)

    async function loadMessages() {
      if (isInDemoMode) {
        console.log('Demo mode: using fake messages')
        setMessages(DEMO_MESSAGES)
        setLoading(false)
      } else {
        console.log('Real mode: fetching messages from Supabase')
        try {
          const data = await getMessages(userProfile?.building_id)
          // Transform data to match component structure
          // Group messages by conversation/resident
          const conversationMap = new Map()
          data.forEach(msg => {
            const residentId = msg.sender_id === userProfile?.id ? msg.recipient_id : msg.sender_id
            const resident = msg.sender_id === userProfile?.id ? msg.recipient : msg.sender
            if (!conversationMap.has(residentId)) {
              conversationMap.set(residentId, {
                id: residentId,
                resident: {
                  name: resident?.full_name || 'Unknown',
                  unit: resident?.unit_number || 'N/A',
                  email: resident?.email || '',
                  phone: resident?.phone || ''
                },
                unread: false,
                archived: false,
                thread: []
              })
            }
            const conv = conversationMap.get(residentId)
            conv.thread.push({
              id: msg.id,
              sender: msg.sender_id === userProfile?.id ? 'manager' : 'resident',
              text: msg.content,
              timestamp: new Date(msg.created_at).getTime()
            })
            if (!msg.read && msg.recipient_id === userProfile?.id) {
              conv.unread = true
            }
          })
          setMessages(Array.from(conversationMap.values()))
        } catch (err) {
          console.error('Error loading messages:', err)
          setError('Failed to load messages. Please try again.')
        } finally {
          setLoading(false)
        }
      }
    }
    loadMessages()
  }, [isInDemoMode, userProfile])

  // Format timestamp to relative time
  const formatTime = (timestamp) => {
    const diff = Date.now() - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return 'Yesterday'
    if (days < 7) return `${days}d ago`
    return new Date(timestamp).toLocaleDateString()
  }

  // Format timestamp for thread messages
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
      return `Today at ${timeStr}`
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday at ${timeStr}`
    } else {
      return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${timeStr}`
    }
  }

  // Get initials from name
  const getInitials = (name) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase()
  }

  // Filter messages based on search and filter
  const filteredMessages = messages.filter(msg => {
    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = searchQuery === '' ||
      msg.resident.name.toLowerCase().includes(searchLower) ||
      msg.resident.unit.includes(searchQuery) ||
      msg.thread.some(t => t.text.toLowerCase().includes(searchLower))

    // Tab filter
    if (activeFilter === 'unread') return matchesSearch && msg.unread
    if (activeFilter === 'archived') return matchesSearch && msg.archived
    return matchesSearch && !msg.archived
  })

  // Handle selecting a message
  const handleSelectMessage = (msg) => {
    setSelectedMessage(msg)
    setShowMobileDetail(true)

    // Mark as read
    if (msg.unread) {
      setMessages(prev => prev.map(m =>
        m.id === msg.id ? { ...m, unread: false } : m
      ))
    }
  }

  // Handle back button on mobile
  const handleBackToList = () => {
    setShowMobileDetail(false)
  }

  // Handle sending a reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMessage) return

    const newMessage = {
      id: Date.now(),
      sender: 'manager',
      text: replyText.trim(),
      timestamp: Date.now()
    }

    if (isInDemoMode) {
      // Demo mode: update local state only
      setMessages(prev => prev.map(msg =>
        msg.id === selectedMessage.id
          ? { ...msg, thread: [...msg.thread, newMessage] }
          : msg
      ))

      setSelectedMessage(prev => ({
        ...prev,
        thread: [...prev.thread, newMessage]
      }))
    } else {
      // Real mode: send to Supabase
      try {
        await sendMessage({
          building_id: userProfile.building_id,
          sender_id: userProfile.id,
          recipient_id: selectedMessage.id,
          content: replyText.trim()
        })

        setMessages(prev => prev.map(msg =>
          msg.id === selectedMessage.id
            ? { ...msg, thread: [...msg.thread, newMessage] }
            : msg
        ))

        setSelectedMessage(prev => ({
          ...prev,
          thread: [...prev.thread, newMessage]
        }))
      } catch (err) {
        console.error('Error sending message:', err)
      }
    }

    setReplyText('')
  }

  // Handle archive/unarchive
  const handleToggleArchive = () => {
    if (!selectedMessage) return

    setMessages(prev => prev.map(msg =>
      msg.id === selectedMessage.id
        ? { ...msg, archived: !msg.archived }
        : msg
    ))

    setSelectedMessage(prev => ({ ...prev, archived: !prev.archived }))
  }

  // Handle mark as resolved (archive)
  const handleMarkResolved = () => {
    if (!selectedMessage) return

    setMessages(prev => prev.map(msg =>
      msg.id === selectedMessage.id
        ? { ...msg, archived: true }
        : msg
    ))

    setSelectedMessage(null)
    setShowMobileDetail(false)
  }

  // Get preview text from last message
  const getPreview = (thread) => {
    const lastMessage = thread[thread.length - 1]
    const prefix = lastMessage.sender === 'manager' ? 'You: ' : ''
    return prefix + lastMessage.text
  }

  // Get last message time
  const getLastTime = (thread) => {
    return thread[thread.length - 1].timestamp
  }

  // Loading state
  if (loading) {
    return (
      <div className="manager-messages">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'rgba(255,255,255,0.7)' }}>
          Loading messages...
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="manager-messages">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#ef4444' }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className={`manager-messages ${showMobileDetail ? 'show-detail' : ''}`}>
      {/* Message List */}
      <div className="messages-list-panel">
        {/* Search Bar */}
        <div className="messages-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="messages-filters">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
          </button>
          <button
            className={`filter-btn ${activeFilter === 'unread' ? 'active' : ''}`}
            onClick={() => setActiveFilter('unread')}
          >
            Unread
            {messages.filter(m => m.unread && !m.archived).length > 0 && (
              <span className="filter-count">
                {messages.filter(m => m.unread && !m.archived).length}
              </span>
            )}
          </button>
          <button
            className={`filter-btn ${activeFilter === 'archived' ? 'active' : ''}`}
            onClick={() => setActiveFilter('archived')}
          >
            Archived
          </button>
        </div>

        {/* Messages List */}
        <div className="messages-list">
          {filteredMessages.length === 0 ? (
            <div className="no-messages">
              <p>No messages found</p>
            </div>
          ) : (
            filteredMessages
              .sort((a, b) => getLastTime(b.thread) - getLastTime(a.thread))
              .map(msg => (
                <button
                  key={msg.id}
                  className={`message-item ${msg.unread ? 'unread' : ''} ${selectedMessage?.id === msg.id ? 'selected' : ''}`}
                  onClick={() => handleSelectMessage(msg)}
                >
                  <div className="message-avatar">
                    {getInitials(msg.resident.name)}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-name">{msg.resident.name}</span>
                      <span className="message-time">{formatTime(getLastTime(msg.thread))}</span>
                    </div>
                    <span className="message-unit">Unit {msg.resident.unit}</span>
                    <p className="message-preview">{getPreview(msg.thread)}</p>
                  </div>
                  {msg.unread && <div className="unread-dot" />}
                </button>
              ))
          )}
        </div>
      </div>

      {/* Message Detail */}
      <div className="messages-detail-panel">
        {selectedMessage ? (
          <>
            {/* Detail Header */}
            <div className="detail-header">
              <button className="back-btn" onClick={handleBackToList}>
                <ArrowLeft size={20} />
              </button>
              <div className="detail-resident">
                <div className="detail-avatar">
                  {getInitials(selectedMessage.resident.name)}
                </div>
                <div className="detail-info">
                  <span className="detail-name">{selectedMessage.resident.name}</span>
                  <span className="detail-unit">Unit {selectedMessage.resident.unit}</span>
                </div>
              </div>
              <div className="detail-contact">
                <a href={`tel:${selectedMessage.resident.phone}`} className="contact-btn" title="Call">
                  <Phone size={18} />
                </a>
                <a href={`mailto:${selectedMessage.resident.email}`} className="contact-btn" title="Email">
                  <Mail size={18} />
                </a>
                <button className="contact-btn" title="More options">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Thread */}
            <div className="message-thread">
              {selectedMessage.thread.map(msg => (
                <div
                  key={msg.id}
                  className={`thread-message ${msg.sender === 'manager' ? 'sent' : 'received'}`}
                >
                  <div className="thread-bubble">
                    <p>{msg.text}</p>
                  </div>
                  <span className="thread-time">{formatMessageTime(msg.timestamp)}</span>
                </div>
              ))}
            </div>

            {/* Reply Box */}
            <div className="reply-box">
              <div className="reply-actions">
                <button
                  className={`action-btn ${selectedMessage.archived ? 'archived' : ''}`}
                  onClick={handleToggleArchive}
                  title={selectedMessage.archived ? 'Unarchive' : 'Archive'}
                >
                  <Archive size={18} />
                  <span>{selectedMessage.archived ? 'Unarchive' : 'Archive'}</span>
                </button>
                {!selectedMessage.archived && (
                  <button
                    className="action-btn resolve"
                    onClick={handleMarkResolved}
                    title="Mark as Resolved"
                  >
                    <CheckCircle size={18} />
                    <span>Mark Resolved</span>
                  </button>
                )}
              </div>
              <div className="reply-input-row">
                <textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendReply()
                    }
                  }}
                  rows={1}
                />
                <button
                  className="send-btn"
                  onClick={handleSendReply}
                  disabled={!replyText.trim()}
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="no-selection">
            <div className="no-selection-icon">
              <Mail size={48} />
            </div>
            <h3>Select a message</h3>
            <p>Choose a conversation from the list to view details</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default ManagerMessages
