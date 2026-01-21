import { useState, useEffect } from 'react'
import {
  HelpCircle,
  Plus,
  Search,
  MoreVertical,
  Edit3,
  Trash2,
  ChevronDown,
  ChevronRight,
  X,
  CheckCircle,
  Eye,
  EyeOff,
  Building2,
  Dumbbell,
  Car,
  Wrench,
  Package,
  FileText,
  Phone,
  GripVertical,
  ExternalLink,
  Clock
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import { getFAQs, createFAQ, updateFAQ, deleteFAQ } from './services/faqService'
import './ManagerFAQ.css'

// Demo FAQs data - used when in demo mode
const DEMO_FAQS = [
  {
    id: 1,
    category: 'general',
    question: 'What are the building\'s quiet hours?',
    answer: 'Quiet hours are 10:00 PM to 8:00 AM on weekdays, and 11:00 PM to 9:00 AM on weekends. Please be considerate of your neighbors during these times.',
    views: 156,
    updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 2,
    category: 'general',
    question: 'Where can I find my building access code?',
    answer: 'Your building access code was sent to your email when you moved in. You can also contact the property manager to receive it again. For security reasons, we cannot share access codes over the phone.',
    views: 89,
    updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 3,
    category: 'general',
    question: 'Is there guest parking available?',
    answer: 'Yes, we have 5 guest parking spots available on a first-come, first-served basis in the P1 level. Guest parking is limited to 48 hours. Please register your guest\'s vehicle with the property manager.',
    views: 124,
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 4,
    category: 'amenities',
    question: 'What are the gym hours?',
    answer: 'The fitness center is open 24/7 for residents. Use your key fob to access the gym at any time. Please wipe down equipment after use and re-rack weights.',
    views: 203,
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 5,
    category: 'amenities',
    question: 'Can I reserve the rooftop lounge for private events?',
    answer: 'Yes! Contact the property manager at least 2 weeks in advance to reserve the rooftop lounge. There\'s a $100 refundable cleaning deposit required. Maximum capacity is 30 guests. Events must end by 10 PM.',
    views: 67,
    updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 6,
    category: 'amenities',
    question: 'Is the pool heated?',
    answer: 'Yes, the rooftop pool is heated year-round and maintained at 82°F. Pool hours are 6 AM to 10 PM daily. The pool is closed during thunderstorms and for weekly maintenance on Mondays from 8-10 AM.',
    views: 145,
    updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 7,
    category: 'parking',
    question: 'How do I get a parking permit?',
    answer: 'Contact the property manager with your vehicle make, model, color, and license plate number. Monthly parking permits are $150/month. Limited spots available - first come, first served with a waitlist.',
    views: 178,
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 8,
    category: 'parking',
    question: 'Is there bike storage?',
    answer: 'Yes, secure bike storage is available in the basement. Access it with your key fob through the main garage entrance. Each unit is allowed up to 2 bikes. Bike cages are available for $25/month.',
    views: 92,
    updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 9,
    category: 'maintenance',
    question: 'How do I submit a maintenance request?',
    answer: 'Use the Community app to submit maintenance requests through the Messages section, or email maintenance@theparamount.com. For emergencies, call (555) 123-4567. Include photos if possible to help us diagnose the issue.',
    views: 234,
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 10,
    category: 'maintenance',
    question: 'What is considered an emergency maintenance issue?',
    answer: 'Emergencies include: no heat when outside temp is below 55°F, no A/C when inside temp exceeds 85°F, major water leaks or flooding, gas leaks (evacuate and call 911), electrical hazards, lockouts, and broken windows or doors that affect security.',
    views: 87,
    updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 11,
    category: 'packages',
    question: 'Where do I pick up packages?',
    answer: 'All packages are held in the package room located on the ground floor next to the mail room. Use your key fob to access. You\'ll receive a notification in the Community app when packages arrive.',
    views: 312,
    updatedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 12,
    category: 'packages',
    question: 'How long will packages be held?',
    answer: 'Packages are held for 5 business days. After that, they may be returned to sender or relocated to overflow storage. You\'ll receive reminder notifications at 3 days and 5 days. Contact us if you need extended hold time for vacation.',
    views: 156,
    updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 13,
    category: 'policies',
    question: 'Are pets allowed?',
    answer: 'Yes! We allow up to 2 pets per unit. Dogs must be under 50 lbs. Restricted breeds include Pit Bulls, Rottweilers, and Dobermans. There\'s a $500 refundable pet deposit and $50/month pet rent per pet. All pets must be registered.',
    views: 267,
    updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 14,
    category: 'policies',
    question: 'Can I smoke in my unit?',
    answer: 'The Paramount is a 100% smoke-free building. Smoking (including vaping and marijuana) is prohibited in all units, common areas, and balconies. Smoking is only permitted in the designated outdoor smoking area near the west entrance.',
    views: 134,
    updatedAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 15,
    category: 'policies',
    question: 'What\'s the policy on subleasing?',
    answer: 'Subleasing requires written property manager approval. Submit a request at least 30 days in advance with the potential tenant\'s full name, contact info, employment verification, and background check consent. Minimum sublease term is 3 months.',
    views: 78,
    updatedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 16,
    category: 'contact',
    question: 'How do I contact the property manager?',
    answer: 'You can reach the property manager through: the Community app (Messages), email at manager@theparamount.com, phone at (555) 123-4560 (Mon-Fri 9AM-5PM), or visit the management office on the ground floor.',
    views: 198,
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    visible: true
  },
  {
    id: 17,
    category: 'contact',
    question: 'What should I do in an emergency?',
    answer: 'For life-threatening emergencies, call 911 immediately. For building emergencies (fire, gas leak, flood), activate the nearest fire alarm and evacuate. After-hours maintenance emergencies: call (555) 123-4567. The building\'s address is 1234 Main Street for emergency services.',
    views: 145,
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    visible: true
  }
]

function ManagerFAQ() {
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [expandedFAQs, setExpandedFAQs] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState(null)
  const [activeMenu, setActiveMenu] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Form state
  const [faqForm, setFaqForm] = useState({
    category: 'general',
    question: '',
    answer: '',
    link: '',
    visible: true
  })

  // Categories
  const categories = [
    { id: 'general', label: 'General Building Info', icon: Building2, color: '#3b82f6' },
    { id: 'amenities', label: 'Amenities & Facilities', icon: Dumbbell, color: '#8b5cf6' },
    { id: 'parking', label: 'Parking & Transportation', icon: Car, color: '#06b6d4' },
    { id: 'maintenance', label: 'Maintenance & Repairs', icon: Wrench, color: '#f59e0b' },
    { id: 'packages', label: 'Packages & Deliveries', icon: Package, color: '#10b981' },
    { id: 'policies', label: 'Policies & Rules', icon: FileText, color: '#ec4899' },
    { id: 'contact', label: 'Contact & Emergency', icon: Phone, color: '#ef4444' }
  ]

  useEffect(() => {
    console.log('[ManagerFAQ] Demo mode:', isInDemoMode)

    async function loadFAQs() {
      if (isInDemoMode) {
        console.log('Demo mode: using fake FAQs')
        setFaqs(DEMO_FAQS)
        setLoading(false)
      } else {
        console.log('Real mode: fetching FAQs from Supabase')
        try {
          const data = await getFAQs(userProfile?.building_id)
          const transformedData = data.map(faq => ({
            id: faq.id,
            category: faq.category,
            question: faq.question,
            answer: faq.answer,
            link: faq.link || '',
            views: faq.view_count || 0,
            updatedAt: new Date(faq.updated_at || faq.created_at),
            visible: faq.visible !== false
          }))
          setFaqs(transformedData)
        } catch (err) {
          console.error('Error loading FAQs:', err)
          setError('Failed to load FAQs. Please try again.')
        } finally {
          setLoading(false)
        }
      }
    }
    loadFAQs()
  }, [isInDemoMode, userProfile])

  // Get category info
  const getCategory = (categoryId) => {
    return categories.find(c => c.id === categoryId) || categories[0]
  }

  // Format date
  const formatDate = (date) => {
    const daysAgo = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (daysAgo === 0) return 'Today'
    if (daysAgo === 1) return 'Yesterday'
    if (daysAgo < 7) return `${daysAgo} days ago`
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  // Filter FAQs
  const getFilteredFAQs = () => {
    let filtered = [...faqs]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      )
    }

    // Apply category filter
    if (activeCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === activeCategory)
    }

    // In preview mode, only show visible FAQs
    if (showPreview) {
      filtered = filtered.filter(faq => faq.visible)
    }

    return filtered
  }

  // Group FAQs by category
  const getGroupedFAQs = () => {
    const filtered = getFilteredFAQs()
    const grouped = {}

    categories.forEach(cat => {
      const catFaqs = filtered.filter(faq => faq.category === cat.id)
      if (catFaqs.length > 0) {
        grouped[cat.id] = catFaqs
      }
    })

    return grouped
  }

  // Toggle FAQ expansion
  const toggleFAQ = (id) => {
    setExpandedFAQs(prev =>
      prev.includes(id) ? prev.filter(faqId => faqId !== id) : [...prev, id]
    )
  }

  // Show toast
  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Reset form
  const resetForm = () => {
    setFaqForm({
      category: 'general',
      question: '',
      answer: '',
      link: '',
      visible: true
    })
  }

  // Handle add FAQ
  const handleAddFAQ = async () => {
    const newFAQ = {
      id: Date.now(),
      category: faqForm.category,
      question: faqForm.question,
      answer: faqForm.answer,
      link: faqForm.link,
      views: 0,
      updatedAt: new Date(),
      visible: faqForm.visible
    }

    if (isInDemoMode) {
      // Demo mode: add to local state only
      setFaqs(prev => [newFAQ, ...prev])
    } else {
      // Real mode: save to Supabase
      try {
        await createFAQ({
          building_id: userProfile.building_id,
          category: faqForm.category,
          question: faqForm.question,
          answer: faqForm.answer,
          link: faqForm.link || null,
          visible: faqForm.visible
        })
        // Reload FAQs
        const data = await getFAQs(userProfile.building_id)
        const transformedData = data.map(faq => ({
          id: faq.id,
          category: faq.category,
          question: faq.question,
          answer: faq.answer,
          link: faq.link || '',
          views: faq.view_count || 0,
          updatedAt: new Date(faq.updated_at || faq.created_at),
          visible: faq.visible !== false
        }))
        setFaqs(transformedData)
      } catch (err) {
        console.error('Error creating FAQ:', err)
      }
    }

    setShowAddModal(false)
    resetForm()
    showToastMessage('FAQ added successfully!')
  }

  // Handle edit FAQ
  const handleEditFAQ = async () => {
    if (isInDemoMode) {
      // Demo mode: update local state only
      setFaqs(prev => prev.map(faq => {
        if (faq.id === selectedFAQ.id) {
          return {
            ...faq,
            category: faqForm.category,
            question: faqForm.question,
            answer: faqForm.answer,
            link: faqForm.link,
            visible: faqForm.visible,
            updatedAt: new Date()
          }
        }
        return faq
      }))
    } else {
      // Real mode: update in Supabase
      try {
        await updateFAQ(selectedFAQ.id, {
          category: faqForm.category,
          question: faqForm.question,
          answer: faqForm.answer,
          link: faqForm.link || null,
          visible: faqForm.visible
        })
        // Reload FAQs
        const data = await getFAQs(userProfile.building_id)
        const transformedData = data.map(faq => ({
          id: faq.id,
          category: faq.category,
          question: faq.question,
          answer: faq.answer,
          link: faq.link || '',
          views: faq.view_count || 0,
          updatedAt: new Date(faq.updated_at || faq.created_at),
          visible: faq.visible !== false
        }))
        setFaqs(transformedData)
      } catch (err) {
        console.error('Error updating FAQ:', err)
      }
    }

    setShowEditModal(false)
    setSelectedFAQ(null)
    resetForm()
    showToastMessage('FAQ updated!')
  }

  // Handle delete FAQ
  const handleDeleteFAQ = async () => {
    if (isInDemoMode) {
      // Demo mode: remove from local state only
      setFaqs(prev => prev.filter(faq => faq.id !== selectedFAQ.id))
    } else {
      // Real mode: delete from Supabase
      try {
        await deleteFAQ(selectedFAQ.id)
        setFaqs(prev => prev.filter(faq => faq.id !== selectedFAQ.id))
      } catch (err) {
        console.error('Error deleting FAQ:', err)
      }
    }

    setShowDeleteModal(false)
    setSelectedFAQ(null)
    showToastMessage('FAQ deleted')
  }

  // Open edit modal
  const openEditModal = (faq) => {
    setSelectedFAQ(faq)
    setFaqForm({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      link: faq.link || '',
      visible: faq.visible
    })
    setActiveMenu(null)
    setShowEditModal(true)
  }

  // Open delete modal
  const openDeleteModal = (faq) => {
    setSelectedFAQ(faq)
    setActiveMenu(null)
    setShowDeleteModal(true)
  }

  // Toggle visibility
  const toggleVisibility = (faq) => {
    setFaqs(prev => prev.map(f => {
      if (f.id === faq.id) {
        return { ...f, visible: !f.visible }
      }
      return f
    }))
    setActiveMenu(null)
    showToastMessage(faq.visible ? 'FAQ hidden from residents' : 'FAQ visible to residents')
  }

  const filteredFAQs = getFilteredFAQs()
  const groupedFAQs = getGroupedFAQs()
  const totalViews = faqs.reduce((sum, faq) => sum + faq.views, 0)

  // Loading state
  if (loading) {
    return (
      <div className="manager-faq">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: 'rgba(255,255,255,0.7)' }}>
          Loading FAQs...
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="manager-faq">
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh', color: '#ef4444' }}>
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="manager-faq">
      {/* Header */}
      <div className="faq-header">
        <div className="faq-header-left">
          <h2>Building FAQ</h2>
          <p>Manage frequently asked questions for residents</p>
        </div>
        <div className="faq-header-actions">
          <label className="preview-toggle">
            <input
              type="checkbox"
              checked={showPreview}
              onChange={e => setShowPreview(e.target.checked)}
            />
            <span className="toggle-slider"></span>
            <span className="toggle-label">Preview Mode</span>
          </label>
          <button className="add-faq-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Stats Row */}
      <div className="faq-stats">
        <div className="stat-card">
          <HelpCircle size={20} />
          <div className="stat-content">
            <span className="stat-value">{faqs.length}</span>
            <span className="stat-label">Total FAQs</span>
          </div>
        </div>
        <div className="stat-card">
          <Eye size={20} />
          <div className="stat-content">
            <span className="stat-value">{totalViews.toLocaleString()}</span>
            <span className="stat-label">Total Views</span>
          </div>
        </div>
        <div className="stat-card">
          <FileText size={20} />
          <div className="stat-content">
            <span className="stat-value">{categories.length}</span>
            <span className="stat-label">Categories</span>
          </div>
        </div>
        <div className="stat-card">
          <EyeOff size={20} />
          <div className="stat-content">
            <span className="stat-value">{faqs.filter(f => !f.visible).length}</span>
            <span className="stat-label">Hidden</span>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="faq-toolbar">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="category-tabs">
          <button
            className={`category-tab ${activeCategory === 'all' ? 'active' : ''}`}
            onClick={() => setActiveCategory('all')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              className={`category-tab ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.id)}
              style={{ '--cat-color': cat.color }}
            >
              <cat.icon size={14} />
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Preview Mode Banner */}
      {showPreview && (
        <div className="preview-banner">
          <Eye size={16} />
          <span>Preview Mode - Showing what residents will see</span>
        </div>
      )}

      {/* FAQ List */}
      <div className="faq-list">
        {filteredFAQs.length === 0 ? (
          <div className="no-faqs">
            <HelpCircle size={48} />
            <h3>No FAQs found</h3>
            <p>
              {searchQuery
                ? 'Try a different search term'
                : 'Add your first question to help residents!'}
            </p>
            <button className="add-first-btn" onClick={() => setShowAddModal(true)}>
              <Plus size={18} />
              Add Question
            </button>
          </div>
        ) : activeCategory === 'all' ? (
          // Grouped view
          Object.entries(groupedFAQs).map(([catId, catFaqs]) => {
            const category = getCategory(catId)
            const CategoryIcon = category.icon

            return (
              <div key={catId} className="faq-category-group">
                <div className="category-header" style={{ '--cat-color': category.color }}>
                  <CategoryIcon size={20} />
                  <h3>{category.label}</h3>
                  <span className="category-count">{catFaqs.length} questions</span>
                </div>

                <div className="category-faqs">
                  {catFaqs.map(faq => (
                    <FAQItem
                      key={faq.id}
                      faq={faq}
                      category={category}
                      isExpanded={expandedFAQs.includes(faq.id)}
                      onToggle={() => toggleFAQ(faq.id)}
                      activeMenu={activeMenu}
                      setActiveMenu={setActiveMenu}
                      onEdit={() => openEditModal(faq)}
                      onDelete={() => openDeleteModal(faq)}
                      onToggleVisibility={() => toggleVisibility(faq)}
                      showPreview={showPreview}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          // Single category view
          <div className="category-faqs">
            {filteredFAQs.map(faq => {
              const category = getCategory(faq.category)
              return (
                <FAQItem
                  key={faq.id}
                  faq={faq}
                  category={category}
                  isExpanded={expandedFAQs.includes(faq.id)}
                  onToggle={() => toggleFAQ(faq.id)}
                  activeMenu={activeMenu}
                  setActiveMenu={setActiveMenu}
                  onEdit={() => openEditModal(faq)}
                  onDelete={() => openDeleteModal(faq)}
                  onToggleVisibility={() => toggleVisibility(faq)}
                  showPreview={showPreview}
                  formatDate={formatDate}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Add FAQ Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content faq-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Add FAQ Question</h3>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={faqForm.category}
                  onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Question *</label>
                <input
                  type="text"
                  placeholder="Enter the question..."
                  value={faqForm.question}
                  onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Answer *</label>
                <textarea
                  placeholder="Enter the answer..."
                  value={faqForm.answer}
                  onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label>Link (optional)</label>
                <div className="link-input">
                  <ExternalLink size={16} />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={faqForm.link}
                    onChange={e => setFaqForm({ ...faqForm, link: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={faqForm.visible}
                    onChange={e => setFaqForm({ ...faqForm, visible: e.target.checked })}
                  />
                  <span>Show to residents</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowAddModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleAddFAQ}
                disabled={!faqForm.question || !faqForm.answer}
              >
                <Plus size={18} />
                Add Question
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit FAQ Modal */}
      {showEditModal && selectedFAQ && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content faq-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit FAQ Question</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={faqForm.category}
                  onChange={e => setFaqForm({ ...faqForm, category: e.target.value })}
                >
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Question *</label>
                <input
                  type="text"
                  placeholder="Enter the question..."
                  value={faqForm.question}
                  onChange={e => setFaqForm({ ...faqForm, question: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>Answer *</label>
                <textarea
                  placeholder="Enter the answer..."
                  value={faqForm.answer}
                  onChange={e => setFaqForm({ ...faqForm, answer: e.target.value })}
                  rows={5}
                />
              </div>

              <div className="form-group">
                <label>Link (optional)</label>
                <div className="link-input">
                  <ExternalLink size={16} />
                  <input
                    type="url"
                    placeholder="https://..."
                    value={faqForm.link}
                    onChange={e => setFaqForm({ ...faqForm, link: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={faqForm.visible}
                    onChange={e => setFaqForm({ ...faqForm, visible: e.target.checked })}
                  />
                  <span>Show to residents</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-danger-outline" onClick={() => {
                setShowEditModal(false)
                openDeleteModal(selectedFAQ)
              }}>
                <Trash2 size={18} />
                Delete
              </button>
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleEditFAQ}
                disabled={!faqForm.question || !faqForm.answer}
              >
                <CheckCircle size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {showDeleteModal && selectedFAQ && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete FAQ</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="delete-warning">
                <Trash2 size={32} />
                <p>Delete this FAQ?</p>
                <span className="delete-question">"{selectedFAQ.question}"</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeleteFAQ}>
                <Trash2 size={18} />
                Delete FAQ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showToast && (
        <div className="toast-notification">
          <CheckCircle size={18} />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Click outside to close menus */}
      {activeMenu && (
        <div className="menu-backdrop" onClick={() => setActiveMenu(null)} />
      )}
    </div>
  )
}

// FAQ Item Component
function FAQItem({
  faq,
  category,
  isExpanded,
  onToggle,
  activeMenu,
  setActiveMenu,
  onEdit,
  onDelete,
  onToggleVisibility,
  showPreview,
  formatDate
}) {
  return (
    <div className={`faq-item ${isExpanded ? 'expanded' : ''} ${!faq.visible ? 'hidden-faq' : ''}`}>
      <div className="faq-item-header" onClick={onToggle}>
        {!showPreview && (
          <div className="drag-handle">
            <GripVertical size={16} />
          </div>
        )}

        <div className="faq-question">
          <span className="question-text">{faq.question}</span>
          {!faq.visible && !showPreview && (
            <span className="hidden-badge">
              <EyeOff size={12} />
              Hidden
            </span>
          )}
        </div>

        <div className="faq-item-actions">
          {!showPreview && (
            <>
              <span className="faq-views">
                <Eye size={12} />
                {faq.views}
              </span>
              <div className="faq-menu-wrapper">
                <button
                  className="faq-menu-btn"
                  onClick={e => {
                    e.stopPropagation()
                    setActiveMenu(activeMenu === faq.id ? null : faq.id)
                  }}
                >
                  <MoreVertical size={16} />
                </button>
                {activeMenu === faq.id && (
                  <div className="faq-menu-dropdown">
                    <button onClick={e => { e.stopPropagation(); onEdit() }}>
                      <Edit3 size={14} />
                      Edit Question
                    </button>
                    <button onClick={e => { e.stopPropagation(); onToggleVisibility() }}>
                      {faq.visible ? <EyeOff size={14} /> : <Eye size={14} />}
                      {faq.visible ? 'Hide from Residents' : 'Show to Residents'}
                    </button>
                    <div className="menu-divider"></div>
                    <button className="delete-btn" onClick={e => { e.stopPropagation(); onDelete() }}>
                      <Trash2 size={14} />
                      Delete Question
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
          <button className="expand-btn">
            {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="faq-answer">
          <p>{faq.answer}</p>
          {faq.link && (
            <a href={faq.link} target="_blank" rel="noopener noreferrer" className="faq-link">
              <ExternalLink size={14} />
              Learn more
            </a>
          )}
          {!showPreview && (
            <div className="faq-meta">
              <span>
                <Clock size={12} />
                Updated {formatDate(faq.updatedAt)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default ManagerFAQ
