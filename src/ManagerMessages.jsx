import { useState, useEffect, useRef } from 'react'
import {
  Search,
  Send,
  Archive,
  CheckCircle,
  ArrowLeft,
  Phone,
  Mail,
  MoreVertical,
  Plus,
  Users,
  X
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getMessages, sendMessage, markConversationAsRead, getResidents } from './services/messageService'
import './ManagerMessages.css'

// Demo messages data - used when in demo mode
const DEMO_MESSAGES = [
  {
    id: 1,
    resident: {
      id: 'demo-1',
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
      id: 'demo-2',
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
      id: 'demo-3',
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
  }
]

function ManagerMessages() {
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [showMobileDetail, setShowMobileDetail] = useState(false)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [residents, setResidents] = useState([])
  const [residentSearch, setResidentSearch] = useState('')
  const messagesEndRef = useRef(null)

  useEffect(() => {
    async function loadMessages() {
      if (isInDemoMode) {
        setConversations(DEMO_MESSAGES)
        setLoading(false)
        return
      }

      try {
        const data = await getMessages(userProfile?.building_id)

        // Group messages by conversation partner (resident)
        const conversationMap = new Map()

        data.forEach(msg => {
          // Determine who the resident is (the person who isn't the manager)
          const isManagerSender = msg.from_user_id === userProfile?.id
          const residentId = isManagerSender ? msg.to_user_id : msg.from_user_id
          const resident = isManagerSender ? msg.recipient : msg.sender

          // Skip if resident info is missing or it's a manager-to-manager message
          if (!resident || resident.role === 'manager' || resident.role === 'property_manager') {
            return
          }

          if (!conversationMap.has(residentId)) {
            conversationMap.set(residentId, {
              id: residentId,
              resident: {
                id: residentId,
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
            sender: isManagerSender ? 'manager' : 'resident',
            text: msg.content,
            timestamp: new Date(msg.created_at).getTime()
          })

          // Mark as unread if message is TO manager and not read
          if (!isManagerSender && !msg.is_read) {
            conv.unread = true
          }
        })

        // Sort threads by timestamp
        conversationMap.forEach(conv => {
          conv.thread.sort((a, b) => a.timestamp - b.timestamp)
        })

        setConversations(Array.from(conversationMap.values()))
      } catch (err) {
        console.error('[ManagerMessages] Error loading messages:', err)
        setError('Failed to load messages. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadMessages()
  }, [isInDemoMode, userProfile])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (selectedConversation) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [selectedConversation?.thread])

  // Load residents for new message modal
  const loadResidents = async () => {
    if (isInDemoMode) {
      setResidents([
        { id: 'demo-new-1', full_name: 'New Resident 1', unit_number: '101' },
        { id: 'demo-new-2', full_name: 'New Resident 2', unit_number: '202' }
      ])
      return
    }

    const buildingId = userProfile?.building_id
    if (!buildingId) {
      console.warn('[ManagerMessages] No building_id available to load residents')
      return
    }

    try {
      const data = await getResidents(buildingId)
      setResidents(data || [])
    } catch (err) {
      console.error('[ManagerMessages] Error loading residents:', err)
    }
  }

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

  // Filter conversations based on search and filter
  const filteredConversations = conversations.filter(conv => {
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch = searchQuery === '' ||
      conv.resident.name.toLowerCase().includes(searchLower) ||
      conv.resident.unit.includes(searchQuery) ||
      conv.thread.some(t => t.text.toLowerCase().includes(searchLower))

    if (activeFilter === 'unread') return matchesSearch && conv.unread
    if (activeFilter === 'archived') return matchesSearch && conv.archived
    return matchesSearch && !conv.archived
  })

  // Handle selecting a conversation
  const handleSelectConversation = async (conv) => {
    setSelectedConversation(conv)
    setShowMobileDetail(true)

    // Mark as read
    if (conv.unread) {
      setConversations(prev => prev.map(c =>
        c.id === conv.id ? { ...c, unread: false } : c
      ))

      if (!isInDemoMode) {
        try {
          await markConversationAsRead(userProfile?.id, conv.resident.id)
        } catch (err) {
          console.error('[ManagerMessages] Error marking as read:', err)
        }
      }
    }
  }

  // Handle back button on mobile
  const handleBackToList = () => {
    setShowMobileDetail(false)
  }

  // Handle sending a reply
  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedConversation) return

    const messageText = replyText.trim()
    setReplyText('')

    const newMessage = {
      id: Date.now(),
      sender: 'manager',
      text: messageText,
      timestamp: Date.now()
    }

    // Optimistically update UI
    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, thread: [...conv.thread, newMessage] }
        : conv
    ))

    setSelectedConversation(prev => ({
      ...prev,
      thread: [...prev.thread, newMessage]
    }))

    if (!isInDemoMode) {
      try {
        await sendMessage({
          building_id: userProfile.building_id,
          from_user_id: userProfile.id,
          to_user_id: selectedConversation.resident.id,
          content: messageText
        })
      } catch (err) {
        console.error('[ManagerMessages] Error sending message:', err)
        // Could revert optimistic update here
      }
    }
  }

  // Handle starting a new conversation
  const handleStartNewConversation = async (resident) => {
    setShowNewMessageModal(false)
    setResidentSearch('')

    // Check if conversation already exists
    const existing = conversations.find(c => c.resident.id === resident.id)
    if (existing) {
      handleSelectConversation(existing)
      return
    }

    // Create new conversation entry
    const newConv = {
      id: resident.id,
      resident: {
        id: resident.id,
        name: resident.full_name,
        unit: resident.unit_number,
        email: resident.email || '',
        phone: resident.phone || ''
      },
      unread: false,
      archived: false,
      thread: []
    }

    setConversations(prev => [newConv, ...prev])
    setSelectedConversation(newConv)
    setShowMobileDetail(true)
  }

  // Handle archive/unarchive
  const handleToggleArchive = () => {
    if (!selectedConversation) return

    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, archived: !conv.archived }
        : conv
    ))

    setSelectedConversation(prev => ({ ...prev, archived: !prev.archived }))
  }

  // Handle mark as resolved
  const handleMarkResolved = () => {
    if (!selectedConversation) return

    setConversations(prev => prev.map(conv =>
      conv.id === selectedConversation.id
        ? { ...conv, archived: true }
        : conv
    ))

    setSelectedConversation(null)
    setShowMobileDetail(false)
  }

  // Get preview text from last message
  const getPreview = (thread) => {
    if (thread.length === 0) return 'No messages yet'
    const lastMessage = thread[thread.length - 1]
    const prefix = lastMessage.sender === 'manager' ? 'You: ' : ''
    return prefix + lastMessage.text
  }

  // Get last message time
  const getLastTime = (thread) => {
    if (thread.length === 0) return Date.now()
    return thread[thread.length - 1].timestamp
  }

  // Filter residents for new message modal
  const filteredResidents = residents.filter(r => {
    if (!residentSearch) return true
    const search = residentSearch.toLowerCase()
    return r.full_name?.toLowerCase().includes(search) ||
           r.unit_number?.includes(search)
  })

  // Loading state
  if (loading) {
    return (
      <div className="manager-messages">
        <div className="messages-loading">
          Loading messages...
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="manager-messages">
        <div className="messages-error">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className={`manager-messages ${showMobileDetail ? 'show-detail' : ''}`}>
      {/* Message List */}
      <div className="messages-list-panel">
        {/* Header with New Message Button */}
        <div className="messages-list-header">
          <h2>Messages</h2>
          <button
            className="new-message-btn"
            onClick={() => {
              loadResidents()
              setShowNewMessageModal(true)
            }}
          >
            <Plus size={18} />
            <span>New</span>
          </button>
        </div>

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
            {conversations.filter(c => c.unread && !c.archived).length > 0 && (
              <span className="filter-count">
                {conversations.filter(c => c.unread && !c.archived).length}
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

        {/* Conversations List */}
        <div className="messages-list">
          {filteredConversations.length === 0 ? (
            <div className="no-messages">
              <Users size={32} />
              <p>No messages found</p>
              <button
                className="start-conversation-btn"
                onClick={() => {
                  loadResidents()
                  setShowNewMessageModal(true)
                }}
              >
                Start a conversation
              </button>
            </div>
          ) : (
            filteredConversations
              .sort((a, b) => getLastTime(b.thread) - getLastTime(a.thread))
              .map(conv => (
                <button
                  key={conv.id}
                  className={`message-item ${conv.unread ? 'unread' : ''} ${selectedConversation?.id === conv.id ? 'selected' : ''}`}
                  onClick={() => handleSelectConversation(conv)}
                >
                  <div className="message-avatar">
                    {getInitials(conv.resident.name)}
                  </div>
                  <div className="message-content">
                    <div className="message-header">
                      <span className="message-name">{conv.resident.name}</span>
                      <span className="message-time">{formatTime(getLastTime(conv.thread))}</span>
                    </div>
                    <span className="message-unit">Unit {conv.resident.unit}</span>
                    <p className="message-preview">{getPreview(conv.thread)}</p>
                  </div>
                  {conv.unread && <div className="unread-dot" />}
                </button>
              ))
          )}
        </div>
      </div>

      {/* Message Detail */}
      <div className="messages-detail-panel">
        {selectedConversation ? (
          <>
            {/* Detail Header */}
            <div className="detail-header">
              <button className="back-btn" onClick={handleBackToList}>
                <ArrowLeft size={20} />
              </button>
              <div className="detail-resident">
                <div className="detail-avatar">
                  {getInitials(selectedConversation.resident.name)}
                </div>
                <div className="detail-info">
                  <span className="detail-name">{selectedConversation.resident.name}</span>
                  <span className="detail-unit">Unit {selectedConversation.resident.unit}</span>
                </div>
              </div>
              <div className="detail-contact">
                {selectedConversation.resident.phone && (
                  <a href={`tel:${selectedConversation.resident.phone}`} className="contact-btn" title="Call">
                    <Phone size={18} />
                  </a>
                )}
                {selectedConversation.resident.email && (
                  <a href={`mailto:${selectedConversation.resident.email}`} className="contact-btn" title="Email">
                    <Mail size={18} />
                  </a>
                )}
                <button className="contact-btn" title="More options">
                  <MoreVertical size={18} />
                </button>
              </div>
            </div>

            {/* Thread */}
            <div className="message-thread">
              {selectedConversation.thread.length === 0 ? (
                <div className="empty-thread">
                  <p>No messages yet. Send a message to start the conversation.</p>
                </div>
              ) : (
                selectedConversation.thread.map(msg => (
                  <div
                    key={msg.id}
                    className={`thread-message ${msg.sender === 'manager' ? 'sent' : 'received'}`}
                  >
                    <div className="thread-bubble">
                      <p>{msg.text}</p>
                    </div>
                    <span className="thread-time">{formatMessageTime(msg.timestamp)}</span>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Reply Box */}
            <div className="reply-box">
              <div className="reply-actions">
                <button
                  className={`action-btn ${selectedConversation.archived ? 'archived' : ''}`}
                  onClick={handleToggleArchive}
                  title={selectedConversation.archived ? 'Unarchive' : 'Archive'}
                >
                  <Archive size={18} />
                  <span>{selectedConversation.archived ? 'Unarchive' : 'Archive'}</span>
                </button>
                {!selectedConversation.archived && (
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

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="modal-overlay" onClick={() => setShowNewMessageModal(false)}>
          <div className="new-message-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>New Message</h3>
              <button className="modal-close" onClick={() => setShowNewMessageModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="resident-search">
                <Search size={18} />
                <input
                  type="text"
                  placeholder="Search residents by name or unit..."
                  value={residentSearch}
                  onChange={(e) => setResidentSearch(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="resident-list">
                {filteredResidents.length === 0 ? (
                  <div className="no-residents">
                    <p>{residentSearch ? 'No residents match your search' : 'No residents have joined the app yet. Only residents who have signed up will appear here.'}</p>
                  </div>
                ) : (
                  filteredResidents.map(resident => (
                    <button
                      key={resident.id}
                      className="resident-item"
                      onClick={() => handleStartNewConversation(resident)}
                    >
                      <div className="resident-avatar">
                        {getInitials(resident.full_name || 'U')}
                      </div>
                      <div className="resident-info">
                        <span className="resident-name">{resident.full_name}</span>
                        <span className="resident-unit">Unit {resident.unit_number}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerMessages
