import { useState } from 'react'
import { ArrowLeft, Pin, Car, Box, ShoppingBag, Briefcase, Search, Plus, X, Send, MessageCircle, Clock, ChevronRight } from 'lucide-react'
import './BulletinBoard.css'

function BulletinBoard({ onBack }) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [showPostModal, setShowPostModal] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [selectedListing, setSelectedListing] = useState(null)
  const [postForm, setPostForm] = useState({
    category: 'parking',
    title: '',
    description: '',
    price: '',
    details: ''
  })

  // Categories
  const categories = [
    { id: 'all', label: 'All', icon: Pin },
    { id: 'parking', label: 'Parking', icon: Car },
    { id: 'storage', label: 'Storage', icon: Box },
    { id: 'items', label: 'For Sale', icon: ShoppingBag },
    { id: 'services', label: 'Services', icon: Briefcase },
    { id: 'iso', label: 'ISO', icon: Search },
  ]

  // Sample listings data
  const [listings] = useState([
    // Parking Spots
    {
      id: 1,
      category: 'parking',
      title: 'Parking Spot P2-15',
      details: 'Level P2, near elevator',
      price: '$150/month',
      unit: 'Unit 1504',
      timestamp: Date.now() - 86400000 * 2, // 2 days ago
      color: '#3b82f6'
    },
    {
      id: 2,
      category: 'parking',
      title: 'Parking Spot P1-08',
      details: 'Level P1, corner spot (extra wide)',
      price: '$200/month',
      unit: 'Unit 803',
      timestamp: Date.now() - 86400000 * 5,
      color: '#3b82f6'
    },
    // Storage Lockers
    {
      id: 3,
      category: 'storage',
      title: 'Storage Locker S-42',
      details: '4x4 ft, climate controlled',
      price: '$75/month',
      unit: 'Unit 1201',
      timestamp: Date.now() - 86400000 * 1,
      color: '#8b5cf6'
    },
    {
      id: 4,
      category: 'storage',
      title: 'Storage Locker S-18',
      details: '6x8 ft, ground level',
      price: '$120/month',
      unit: 'Unit 605',
      timestamp: Date.now() - 86400000 * 3,
      color: '#8b5cf6'
    },
    // Items for Sale
    {
      id: 5,
      category: 'items',
      title: 'Herman Miller Office Chair',
      details: 'Aeron, excellent condition, 2 years old',
      price: '$450',
      unit: 'Unit 1107',
      timestamp: Date.now() - 3600000 * 5, // 5 hours ago
      color: '#10b981'
    },
    {
      id: 6,
      category: 'items',
      title: 'IKEA Kallax Shelf Unit',
      details: '4x4, white, includes storage boxes',
      price: '$80',
      unit: 'Unit 902',
      timestamp: Date.now() - 86400000 * 1,
      color: '#10b981'
    },
    {
      id: 7,
      category: 'items',
      title: 'Dyson V11 Vacuum',
      details: 'Like new, all attachments included',
      price: '$350',
      unit: 'Unit 1504',
      timestamp: Date.now() - 86400000 * 4,
      color: '#10b981'
    },
    // Services
    {
      id: 8,
      category: 'services',
      title: 'Dog Walking',
      details: 'Available weekdays 9am-5pm. $20 per 30-min walk.',
      price: '$20/walk',
      unit: 'Unit 405',
      timestamp: Date.now() - 86400000 * 6,
      color: '#f59e0b'
    },
    {
      id: 9,
      category: 'services',
      title: 'Piano Lessons',
      details: 'Experienced teacher, all ages welcome. In-building lessons available.',
      price: '$50/hour',
      unit: 'Unit 1802',
      timestamp: Date.now() - 86400000 * 2,
      color: '#f59e0b'
    },
    {
      id: 10,
      category: 'services',
      title: 'Plant Watering Service',
      details: 'Going on vacation? I\'ll take care of your plants!',
      price: '$15/visit',
      unit: 'Unit 701',
      timestamp: Date.now() - 86400000 * 8,
      color: '#f59e0b'
    },
    // ISO (In Search Of)
    {
      id: 11,
      category: 'iso',
      title: 'Looking for Parking Spot',
      details: 'Preferably P1 or P2, need by Feb 1st',
      price: 'Budget: $180/mo',
      unit: 'Unit 1203',
      timestamp: Date.now() - 3600000 * 8,
      color: '#ec4899'
    },
    {
      id: 12,
      category: 'iso',
      title: 'ISO: Used Bicycle',
      details: 'Looking for a commuter bike, any brand',
      price: 'Budget: $200',
      unit: 'Unit 508',
      timestamp: Date.now() - 86400000 * 1,
      color: '#ec4899'
    },
  ])

  const formatTimeAgo = (timestamp) => {
    const now = Date.now()
    const diff = now - timestamp
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (hours < 1) return 'Just now'
    if (hours < 24) return `${hours}h ago`
    if (days === 1) return '1 day ago'
    return `${days} days ago`
  }

  const getCategoryLabel = (categoryId) => {
    const cat = categories.find(c => c.id === categoryId)
    return cat ? cat.label : categoryId
  }

  const filteredListings = activeCategory === 'all'
    ? listings
    : listings.filter(l => l.category === activeCategory)

  const handleContact = (listing) => {
    setSelectedListing(listing)
    setShowContactModal(true)
  }

  const handlePostSubmit = () => {
    if (postForm.title.trim()) {
      // In a real app, this would save to backend
      setShowPostModal(false)
      setPostForm({
        category: 'parking',
        title: '',
        description: '',
        price: '',
        details: ''
      })
    }
  }

  return (
    <div className="bulletin-board-container">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <header className="bulletin-board-header">
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="page-title-light">Bulletin Board</h1>
      </header>

      <main className="bulletin-board-content">
        {/* Post Listing Button */}
        <button className="post-listing-button" onClick={() => setShowPostModal(true)}>
          <Plus size={20} />
          <span>Post a Listing</span>
        </button>

        {/* Category Filters */}
        <div className="category-filters">
          {categories.map(cat => {
            const IconComponent = cat.icon
            return (
              <button
                key={cat.id}
                className={`category-btn ${activeCategory === cat.id ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat.id)}
              >
                <IconComponent size={16} />
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Listings */}
        <div className="listings-grid">
          {filteredListings.length === 0 ? (
            <div className="empty-listings">
              <Pin size={48} />
              <h3>No listings yet</h3>
              <p>Be the first to post in this category!</p>
            </div>
          ) : (
            filteredListings.map(listing => (
              <article key={listing.id} className="listing-card">
                <div className="listing-header">
                  <span
                    className="listing-category-tag"
                    style={{ background: `${listing.color}20`, color: listing.color }}
                  >
                    {getCategoryLabel(listing.category)}
                  </span>
                  <span className="listing-time">
                    <Clock size={12} />
                    {formatTimeAgo(listing.timestamp)}
                  </span>
                </div>

                <h3 className="listing-title">{listing.title}</h3>
                <p className="listing-details">{listing.details}</p>

                <div className="listing-footer">
                  <div className="listing-info">
                    <span className="listing-price">{listing.price}</span>
                    <span className="listing-unit">{listing.unit}</span>
                  </div>
                  <button
                    className="contact-btn"
                    onClick={() => handleContact(listing)}
                  >
                    <MessageCircle size={16} />
                    <span>Contact</span>
                  </button>
                </div>
              </article>
            ))
          )}
        </div>
      </main>

      {/* Post Listing Modal */}
      {showPostModal && (
        <div className="modal-overlay" onClick={() => setShowPostModal(false)}>
          <div className="bulletin-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Post a Listing</h3>
              <button className="modal-close" onClick={() => setShowPostModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Category Selection */}
              <div className="form-group">
                <label>Category</label>
                <div className="category-select">
                  {categories.filter(c => c.id !== 'all').map(cat => {
                    const IconComponent = cat.icon
                    return (
                      <button
                        key={cat.id}
                        className={`category-option ${postForm.category === cat.id ? 'active' : ''}`}
                        onClick={() => setPostForm({...postForm, category: cat.id})}
                      >
                        <IconComponent size={16} />
                        <span>{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Title */}
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  placeholder={
                    postForm.category === 'parking' ? 'e.g., Parking Spot P2-15' :
                    postForm.category === 'storage' ? 'e.g., Storage Locker S-42' :
                    postForm.category === 'items' ? 'e.g., IKEA Desk' :
                    postForm.category === 'services' ? 'e.g., Dog Walking' :
                    'e.g., Looking for Parking Spot'
                  }
                  value={postForm.title}
                  onChange={(e) => setPostForm({...postForm, title: e.target.value})}
                />
              </div>

              {/* Details */}
              <div className="form-group">
                <label>Details</label>
                <textarea
                  placeholder="Describe your listing..."
                  value={postForm.details}
                  onChange={(e) => setPostForm({...postForm, details: e.target.value})}
                  rows={3}
                />
              </div>

              {/* Price */}
              <div className="form-group">
                <label>{postForm.category === 'iso' ? 'Budget (optional)' : 'Price'}</label>
                <input
                  type="text"
                  placeholder={
                    postForm.category === 'parking' || postForm.category === 'storage'
                      ? 'e.g., $150/month'
                      : postForm.category === 'services'
                      ? 'e.g., $20/hour'
                      : 'e.g., $100'
                  }
                  value={postForm.price}
                  onChange={(e) => setPostForm({...postForm, price: e.target.value})}
                />
              </div>

              <p className="post-note">
                <Pin size={14} />
                Your listing will show "Posted by Unit 1201"
              </p>
            </div>

            <div className="modal-footer">
              <button className="modal-cancel" onClick={() => setShowPostModal(false)}>
                Cancel
              </button>
              <button
                className="modal-submit"
                onClick={handlePostSubmit}
                disabled={!postForm.title.trim()}
              >
                <Send size={16} />
                <span>Post Listing</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {showContactModal && selectedListing && (
        <div className="modal-overlay" onClick={() => setShowContactModal(false)}>
          <div className="contact-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Contact Poster</h3>
              <button className="modal-close" onClick={() => setShowContactModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="contact-listing-info">
                <h4>{selectedListing.title}</h4>
                <p className="contact-price">{selectedListing.price}</p>
              </div>

              <div className="contact-details">
                <p>This listing was posted by:</p>
                <div className="contact-unit-badge">
                  {selectedListing.unit}
                </div>
                <p className="contact-hint">
                  You can leave a note at their door or find them in the Neighbors directory to send a message.
                </p>
              </div>

              <button
                className="view-neighbor-btn"
                onClick={() => {
                  setShowContactModal(false)
                  // In a real app, this would navigate to the neighbor's profile
                }}
              >
                <span>View in Neighbors</span>
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default BulletinBoard
