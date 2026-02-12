import { useState } from 'react'
import { X, Send, Car, Box, ShoppingBag, Briefcase, Search } from 'lucide-react'
import { createListing } from '../services/bulletinService'
import './BulletinModal.css'

const CATEGORIES = [
  { id: 'parking', label: 'Parking', icon: Car },
  { id: 'storage', label: 'Storage', icon: Box },
  { id: 'items', label: 'For Sale', icon: ShoppingBag },
  { id: 'services', label: 'Services', icon: Briefcase },
  { id: 'iso', label: 'Looking For', icon: Search },
]

const CATEGORY_TO_DB = {
  parking: 'parking',
  storage: 'storage',
  items: 'for_sale',
  services: 'services',
  iso: 'wanted'
}

const EMPTY_FORM = {
  category: 'items',
  title: '',
  details: '',
  price: ''
}

function BulletinModal({ isOpen, onClose, onSuccess, userProfile, isInDemoMode }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => setForm(EMPTY_FORM)

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const getPlaceholder = () => {
    switch (form.category) {
      case 'parking': return 'e.g., Parking Spot P2-15'
      case 'storage': return 'e.g., Storage Locker S-42'
      case 'items': return 'e.g., IKEA Desk'
      case 'services': return 'e.g., Dog Walking'
      case 'iso': return 'e.g., Looking for Parking Spot'
      default: return 'Title'
    }
  }

  const getPricePlaceholder = () => {
    switch (form.category) {
      case 'iso': return 'What are you willing to pay?'
      case 'parking':
      case 'storage': return 'e.g., $150/month'
      case 'services': return 'e.g., $20/hour'
      default: return 'e.g., $100'
    }
  }

  const handleSubmit = async () => {
    if (!form.title.trim()) return

    setIsSubmitting(true)

    if (isInDemoMode) {
      const demoListing = {
        id: Date.now(),
        category: form.category,
        title: form.title,
        details: form.details,
        price: form.price,
        unit: 'Unit 1201',
        timestamp: Date.now()
      }
      resetForm()
      onClose()
      if (onSuccess) onSuccess(demoListing)
      setIsSubmitting(false)
    } else {
      try {
        const dbCategory = CATEGORY_TO_DB[form.category] || form.category
        await createListing({
          building_id: userProfile.building_id,
          author_id: userProfile.id,
          category: dbCategory,
          title: form.title,
          description: form.details,
          price: form.price ? parseFloat(form.price.replace(/[^0-9.]/g, '')) : null,
          status: 'active'
        })
        resetForm()
        onClose()
        if (onSuccess) onSuccess()
      } catch (err) {
        console.error('[BulletinModal] Error creating listing:', err?.message || err, err?.details || '', err?.code || '')
        alert('Failed to create listing. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="bulletin-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Post a Listing</h3>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Category</label>
            <div className="bulletin-category-select">
              {CATEGORIES.map(cat => {
                const IconComponent = cat.icon
                return (
                  <button
                    key={cat.id}
                    className={`bulletin-category-btn ${form.category === cat.id ? 'active' : ''}`}
                    onClick={() => setForm({ ...form, category: cat.id })}
                  >
                    <IconComponent size={16} />
                    <span>{cat.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="form-group">
            <label>Title *</label>
            <input
              type="text"
              placeholder={getPlaceholder()}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Details</label>
            <textarea
              placeholder="Describe your listing..."
              value={form.details}
              onChange={(e) => setForm({ ...form, details: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-group">
            <label>{form.category === 'iso' ? 'Budget (optional)' : 'Price'}</label>
            <input
              type="text"
              placeholder={getPricePlaceholder()}
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
            />
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!form.title.trim() || isSubmitting}
          >
            <Send size={16} />
            {isSubmitting ? 'Posting...' : 'Post Listing'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BulletinModal
