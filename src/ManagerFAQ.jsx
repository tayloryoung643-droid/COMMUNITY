import { useState, useEffect, useRef } from 'react'
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
  Clock,
  Upload,
  FileUp,
  Clipboard,
  SkipForward,
  Sparkles,
  Loader2,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Save,
  CheckSquare,
  Square
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import {
  getFaqItems,
  replaceFaqItems,
  updateFaqItem,
  deleteFaqItem,
  createFaqItem,
  extractFaqsFromText
} from './services/faqService'
import { extractTextFromFile } from './services/fileReaderService'
import './ManagerFAQ.css'

// Demo FAQs data - used when in demo mode
const DEMO_FAQS = [
  {
    id: 1,
    category: 'General',
    question: 'What are the building\'s quiet hours?',
    answer: 'Quiet hours are 10:00 PM to 8:00 AM on weekdays, and 11:00 PM to 9:00 AM on weekends.',
    view_count: 156,
    is_visible: true,
    display_order: 0
  },
  {
    id: 2,
    category: 'General',
    question: 'Where can I find my building access code?',
    answer: 'Your building access code was sent to your email when you moved in. Contact the property manager to receive it again.',
    view_count: 89,
    is_visible: true,
    display_order: 1
  },
  {
    id: 3,
    category: 'Amenities',
    question: 'What are the gym hours?',
    answer: 'The fitness center is open 24/7 for residents. Use your key fob to access the gym at any time.',
    view_count: 203,
    is_visible: true,
    display_order: 2
  },
  {
    id: 4,
    category: 'Parking',
    question: 'How do I get a parking permit?',
    answer: 'Contact the property manager with your vehicle details. Monthly parking permits are $150/month.',
    view_count: 178,
    is_visible: true,
    display_order: 3
  },
  {
    id: 5,
    category: 'Maintenance',
    question: 'How do I submit a maintenance request?',
    answer: 'Use the Community app Messages section or email maintenance@building.com. For emergencies, call (555) 123-4567.',
    view_count: 234,
    is_visible: true,
    display_order: 4
  },
  {
    id: 6,
    category: 'Packages & Mail',
    question: 'Where do I pick up packages?',
    answer: 'All packages are held in the package room on the ground floor. You\'ll receive a notification when packages arrive.',
    view_count: 312,
    is_visible: true,
    display_order: 5
  }
]

// Category definitions with icons and colors
const CATEGORIES = [
  { id: 'General', label: 'General', icon: Building2, color: '#3b82f6' },
  { id: 'Amenities', label: 'Amenities', icon: Dumbbell, color: '#8b5cf6' },
  { id: 'Parking', label: 'Parking', icon: Car, color: '#06b6d4' },
  { id: 'Maintenance', label: 'Maintenance', icon: Wrench, color: '#f59e0b' },
  { id: 'Packages & Mail', label: 'Packages & Mail', icon: Package, color: '#10b981' },
  { id: 'Building Policies', label: 'Building Policies', icon: FileText, color: '#ec4899' },
  { id: 'Access & Security', label: 'Access & Security', icon: Phone, color: '#ef4444' },
  { id: 'Pets', label: 'Pets', icon: HelpCircle, color: '#84cc16' },
  { id: 'Billing & Payments', label: 'Billing & Payments', icon: FileText, color: '#a855f7' },
  { id: 'Moving & Elevator', label: 'Moving & Elevator', icon: Building2, color: '#14b8a6' },
  { id: 'Trash & Recycling', label: 'Trash & Recycling', icon: Package, color: '#78716c' },
  { id: 'Safety & Emergency', label: 'Safety & Emergency', icon: AlertCircle, color: '#dc2626' }
]

function ManagerFAQ() {
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true
  const fileInputRef = useRef(null)

  // Main state
  const [faqs, setFaqs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // View states
  const [currentView, setCurrentView] = useState('loading') // 'loading' | 'wizard' | 'import' | 'review' | 'manage'
  const [importMethod, setImportMethod] = useState(null) // 'paste' | 'file'

  // Import state
  const [pasteText, setPasteText] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [extractedItems, setExtractedItems] = useState([])
  const [extracting, setExtracting] = useState(false)
  const [extractError, setExtractError] = useState(null)

  // Import modal state (for importing from manage view)
  const [showImportModal, setShowImportModal] = useState(false)
  const [importTab, setImportTab] = useState('paste') // 'paste' | 'file'

  // Management state
  const [activeCategory, setActiveCategory] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFAQs, setExpandedFAQs] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedFAQ, setSelectedFAQ] = useState(null)
  const [activeMenu, setActiveMenu] = useState(null)

  // Bulk mode state
  const [bulkMode, setBulkMode] = useState(false)
  const [selectedFaqIds, setSelectedFaqIds] = useState([])
  const [showBulkCategoryModal, setShowBulkCategoryModal] = useState(false)
  const [bulkCategory, setBulkCategory] = useState('General')

  // Toast
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Form state
  const [faqForm, setFaqForm] = useState({
    category: 'General',
    question: '',
    answer: '',
    is_visible: true
  })

  // Load FAQs on mount
  useEffect(() => {
    loadFAQs()
  }, [isInDemoMode, userProfile?.building_id])

  const loadFAQs = async () => {
    setLoading(true)

    if (isInDemoMode) {
      setFaqs(DEMO_FAQS)
      setCurrentView('manage')
      setLoading(false)
      return
    }

    const buildingId = userProfile?.building_id
    if (!buildingId) {
      setCurrentView('wizard')
      setLoading(false)
      return
    }

    try {
      const data = await getFaqItems(buildingId, true)
      setFaqs(data || [])

      // Determine initial view based on whether FAQs exist
      if (!data || data.length === 0) {
        setCurrentView('wizard')
      } else {
        setCurrentView('manage')
      }
    } catch (err) {
      console.error('[ManagerFAQ] Error loading FAQs:', err)
      setError('Failed to load FAQs. Please try again.')
      setCurrentView('wizard')
    } finally {
      setLoading(false)
    }
  }

  // Get category info
  const getCategory = (categoryId) => {
    return CATEGORIES.find(c => c.id === categoryId) || CATEGORIES[0]
  }

  // Show toast
  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // ============================================================================
  // WIZARD HANDLERS
  // ============================================================================

  const handleWizardChoice = (choice) => {
    if (choice === 'skip') {
      setCurrentView('manage')
    } else if (choice === 'paste') {
      setImportMethod('paste')
      setCurrentView('import')
    } else if (choice === 'file') {
      setImportMethod('file')
      setCurrentView('import')
    }
  }

  // ============================================================================
  // IMPORT HANDLERS
  // ============================================================================

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (!file.name.endsWith('.txt')) {
        setExtractError('Only .txt files are supported at this time.')
        return
      }
      setUploadedFile(file)
      setExtractError(null)
    }
  }

  const handleExtractFAQs = async () => {
    setExtracting(true)
    setExtractError(null)

    try {
      let textContent = ''
      const method = showImportModal ? importTab : importMethod

      if (method === 'paste') {
        textContent = pasteText
      } else if (method === 'file' && uploadedFile) {
        textContent = await extractTextFromFile(uploadedFile)
      }

      if (!textContent || textContent.trim().length < 50) {
        setExtractError('Please provide more content to extract FAQs from (at least 50 characters).')
        setExtracting(false)
        return
      }

      const result = await extractFaqsFromText(textContent)

      if (result.error) {
        setExtractError(result.error)
      } else if (result.items.length === 0) {
        setExtractError('Could not extract any FAQ items from the provided content.')
      } else {
        setExtractedItems(result.items.map((item, index) => ({
          ...item,
          id: `temp-${index}`,
          is_visible: true,
          selected: true
        })))
        setShowImportModal(false)
        setCurrentView('review')
      }
    } catch (err) {
      console.error('[ManagerFAQ] Extract error:', err)
      setExtractError('An error occurred while extracting FAQs. Please try again.')
    } finally {
      setExtracting(false)
    }
  }

  const openImportModal = () => {
    setPasteText('')
    setUploadedFile(null)
    setExtractError(null)
    setImportTab('paste')
    setShowImportModal(true)
  }

  // ============================================================================
  // REVIEW HANDLERS
  // ============================================================================

  const handleUpdateExtractedItem = (index, field, value) => {
    setExtractedItems(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, [field]: value }
      }
      return item
    }))
  }

  const handleDeleteExtractedItem = (index) => {
    setExtractedItems(prev => prev.filter((_, i) => i !== index))
  }

  const handleToggleItemSelection = (index) => {
    setExtractedItems(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, selected: !item.selected }
      }
      return item
    }))
  }

  const handleSelectAll = () => {
    const allSelected = extractedItems.every(item => item.selected)
    setExtractedItems(prev => prev.map(item => ({ ...item, selected: !allSelected })))
  }

  const selectedCount = extractedItems.filter(item => item.selected).length

  const handlePublishFAQs = async () => {
    const itemsToPublish = extractedItems.filter(item => item.selected)

    if (itemsToPublish.length === 0) {
      showToastMessage('No FAQ items selected to publish.')
      return
    }

    if (isInDemoMode) {
      setFaqs(prev => [
        ...prev,
        ...itemsToPublish.map((item, index) => ({
          ...item,
          id: Date.now() + index,
          view_count: 0,
          display_order: prev.length + index
        }))
      ])
      setCurrentView('manage')
      showToastMessage(`${itemsToPublish.length} FAQs published!`)
      return
    }

    try {
      const meta = {
        createdBy: userProfile?.id,
        sourceType: importMethod || importTab,
        sourceName: uploadedFile?.name || null
      }

      // Add to existing FAQs rather than replacing all
      for (const item of itemsToPublish) {
        await createFaqItem({
          building_id: userProfile.building_id,
          category: item.category || 'General',
          question: item.question,
          answer: item.answer,
          is_visible: item.is_visible !== false,
          display_order: faqs.length,
          view_count: 0,
          created_by: meta.createdBy,
          source_type: meta.sourceType,
          source_name: meta.sourceName
        })
      }

      // Reload FAQs
      const data = await getFaqItems(userProfile.building_id, true)
      setFaqs(data || [])
      setCurrentView('manage')
      showToastMessage(`${itemsToPublish.length} FAQs published!`)

      // Reset import state
      setPasteText('')
      setUploadedFile(null)
      setExtractedItems([])
    } catch (err) {
      console.error('[ManagerFAQ] Publish error:', err)
      showToastMessage('Failed to publish FAQs. Please try again.')
    }
  }

  // ============================================================================
  // MANAGEMENT HANDLERS
  // ============================================================================

  const handleAddFAQ = async () => {
    if (isInDemoMode) {
      const newFAQ = {
        id: Date.now(),
        ...faqForm,
        view_count: 0,
        display_order: faqs.length
      }
      setFaqs(prev => [...prev, newFAQ])
    } else {
      try {
        await createFaqItem({
          building_id: userProfile.building_id,
          ...faqForm,
          view_count: 0,
          display_order: faqs.length
        })
        const data = await getFaqItems(userProfile.building_id, true)
        setFaqs(data || [])
      } catch (err) {
        console.error('[ManagerFAQ] Create error:', err)
        showToastMessage('Failed to add FAQ.')
        return
      }
    }

    setShowAddModal(false)
    resetForm()
    showToastMessage('FAQ added successfully!')
  }

  const handleEditFAQ = async () => {
    if (isInDemoMode) {
      setFaqs(prev => prev.map(faq => {
        if (faq.id === selectedFAQ.id) {
          return { ...faq, ...faqForm }
        }
        return faq
      }))
    } else {
      try {
        await updateFaqItem(selectedFAQ.id, faqForm)
        const data = await getFaqItems(userProfile.building_id, true)
        setFaqs(data || [])
      } catch (err) {
        console.error('[ManagerFAQ] Update error:', err)
        showToastMessage('Failed to update FAQ.')
        return
      }
    }

    setShowEditModal(false)
    setSelectedFAQ(null)
    resetForm()
    showToastMessage('FAQ updated!')
  }

  const handleDeleteFAQ = async () => {
    if (isInDemoMode) {
      setFaqs(prev => prev.filter(faq => faq.id !== selectedFAQ.id))
    } else {
      try {
        await deleteFaqItem(selectedFAQ.id)
        setFaqs(prev => prev.filter(faq => faq.id !== selectedFAQ.id))
      } catch (err) {
        console.error('[ManagerFAQ] Delete error:', err)
        showToastMessage('Failed to delete FAQ.')
        return
      }
    }

    setShowDeleteModal(false)
    setSelectedFAQ(null)
    showToastMessage('FAQ deleted')
  }

  const handleToggleVisibility = async (faq) => {
    const newVisibility = !faq.is_visible

    if (isInDemoMode) {
      setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, is_visible: newVisibility } : f))
    } else {
      try {
        await updateFaqItem(faq.id, { is_visible: newVisibility })
        setFaqs(prev => prev.map(f => f.id === faq.id ? { ...f, is_visible: newVisibility } : f))
      } catch (err) {
        console.error('[ManagerFAQ] Toggle visibility error:', err)
      }
    }

    setActiveMenu(null)
    showToastMessage(newVisibility ? 'FAQ visible to residents' : 'FAQ hidden from residents')
  }

  const resetForm = () => {
    setFaqForm({
      category: 'General',
      question: '',
      answer: '',
      is_visible: true
    })
  }

  const openEditModal = (faq) => {
    setSelectedFAQ(faq)
    setFaqForm({
      category: faq.category,
      question: faq.question,
      answer: faq.answer,
      is_visible: faq.is_visible
    })
    setActiveMenu(null)
    setShowEditModal(true)
  }

  const openDeleteModal = (faq) => {
    setSelectedFAQ(faq)
    setActiveMenu(null)
    setShowDeleteModal(true)
  }

  // ============================================================================
  // BULK ACTION HANDLERS
  // ============================================================================

  const toggleBulkMode = () => {
    setBulkMode(!bulkMode)
    setSelectedFaqIds([])
  }

  const toggleFaqSelection = (faqId) => {
    setSelectedFaqIds(prev =>
      prev.includes(faqId) ? prev.filter(id => id !== faqId) : [...prev, faqId]
    )
  }

  const handleBulkSelectAll = () => {
    const filtered = getFilteredFAQs()
    if (selectedFaqIds.length === filtered.length) {
      setSelectedFaqIds([])
    } else {
      setSelectedFaqIds(filtered.map(f => f.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedFaqIds.length === 0) return

    if (isInDemoMode) {
      setFaqs(prev => prev.filter(f => !selectedFaqIds.includes(f.id)))
    } else {
      try {
        for (const id of selectedFaqIds) {
          await deleteFaqItem(id)
        }
        setFaqs(prev => prev.filter(f => !selectedFaqIds.includes(f.id)))
      } catch (err) {
        console.error('[ManagerFAQ] Bulk delete error:', err)
        showToastMessage('Failed to delete some FAQs.')
        return
      }
    }

    showToastMessage(`${selectedFaqIds.length} FAQs deleted`)
    setSelectedFaqIds([])
    setBulkMode(false)
  }

  const handleBulkToggleVisibility = async (visible) => {
    if (selectedFaqIds.length === 0) return

    if (isInDemoMode) {
      setFaqs(prev => prev.map(f =>
        selectedFaqIds.includes(f.id) ? { ...f, is_visible: visible } : f
      ))
    } else {
      try {
        for (const id of selectedFaqIds) {
          await updateFaqItem(id, { is_visible: visible })
        }
        setFaqs(prev => prev.map(f =>
          selectedFaqIds.includes(f.id) ? { ...f, is_visible: visible } : f
        ))
      } catch (err) {
        console.error('[ManagerFAQ] Bulk visibility error:', err)
        showToastMessage('Failed to update some FAQs.')
        return
      }
    }

    showToastMessage(`${selectedFaqIds.length} FAQs ${visible ? 'shown' : 'hidden'}`)
    setSelectedFaqIds([])
    setBulkMode(false)
  }

  const handleBulkChangeCategory = async () => {
    if (selectedFaqIds.length === 0) return

    if (isInDemoMode) {
      setFaqs(prev => prev.map(f =>
        selectedFaqIds.includes(f.id) ? { ...f, category: bulkCategory } : f
      ))
    } else {
      try {
        for (const id of selectedFaqIds) {
          await updateFaqItem(id, { category: bulkCategory })
        }
        setFaqs(prev => prev.map(f =>
          selectedFaqIds.includes(f.id) ? { ...f, category: bulkCategory } : f
        ))
      } catch (err) {
        console.error('[ManagerFAQ] Bulk category error:', err)
        showToastMessage('Failed to update some FAQs.')
        return
      }
    }

    showToastMessage(`${selectedFaqIds.length} FAQs moved to ${bulkCategory}`)
    setSelectedFaqIds([])
    setBulkMode(false)
    setShowBulkCategoryModal(false)
  }

  // Filter FAQs
  const getFilteredFAQs = () => {
    let filtered = [...faqs]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(faq =>
        faq.question.toLowerCase().includes(query) ||
        faq.answer.toLowerCase().includes(query)
      )
    }

    if (activeCategory !== 'all') {
      filtered = filtered.filter(faq => faq.category === activeCategory)
    }

    return filtered
  }

  // Group FAQs by category
  const getGroupedFAQs = () => {
    const filtered = getFilteredFAQs()
    const grouped = {}

    CATEGORIES.forEach(cat => {
      const catFaqs = filtered.filter(faq => faq.category === cat.id)
      if (catFaqs.length > 0) {
        grouped[cat.id] = catFaqs
      }
    })

    // Add any FAQs with unknown categories to 'General'
    const unknownFaqs = filtered.filter(faq => !CATEGORIES.find(c => c.id === faq.category))
    if (unknownFaqs.length > 0) {
      grouped['General'] = [...(grouped['General'] || []), ...unknownFaqs]
    }

    return grouped
  }

  const toggleFAQ = (id) => {
    setExpandedFAQs(prev =>
      prev.includes(id) ? prev.filter(faqId => faqId !== id) : [...prev, id]
    )
  }

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  // Loading state
  if (loading || currentView === 'loading') {
    return (
      <div className="manager-faq">
        <div className="faq-loading">
          <Loader2 className="spin" size={32} />
          <span>Loading FAQs...</span>
        </div>
      </div>
    )
  }

  // Setup Wizard
  if (currentView === 'wizard') {
    return (
      <div className="manager-faq">
        <div className="faq-wizard">
          <div className="wizard-header">
            <HelpCircle size={48} />
            <h2>Set Up Building FAQs</h2>
            <p>Help your residents find answers quickly by importing your building's FAQ content.</p>
          </div>

          <div className="wizard-options">
            <button className="wizard-option" onClick={() => handleWizardChoice('paste')}>
              <div className="option-icon">
                <Clipboard size={32} />
              </div>
              <div className="option-content">
                <h3>Paste Text</h3>
                <p>Copy and paste your building rules, policies, or FAQ content</p>
              </div>
              <ChevronRight size={20} />
            </button>

            <button className="wizard-option" onClick={() => handleWizardChoice('file')}>
              <div className="option-icon">
                <FileUp size={32} />
              </div>
              <div className="option-content">
                <h3>Upload File</h3>
                <p>Upload a .txt file with your FAQ content</p>
              </div>
              <ChevronRight size={20} />
            </button>

            <button className="wizard-option skip-option" onClick={() => handleWizardChoice('skip')}>
              <div className="option-icon">
                <SkipForward size={32} />
              </div>
              <div className="option-content">
                <h3>Skip for Now</h3>
                <p>Set up FAQs later and add questions manually</p>
              </div>
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Import View (from wizard flow)
  if (currentView === 'import') {
    return (
      <div className="manager-faq">
        <div className="faq-import">
          <div className="import-header">
            <button className="back-btn" onClick={() => setCurrentView('wizard')}>
              <ArrowLeft size={20} />
              Back
            </button>
            <h2>{importMethod === 'paste' ? 'Paste FAQ Content' : 'Upload FAQ File'}</h2>
          </div>

          <div className="import-content">
            {importMethod === 'paste' ? (
              <div className="paste-section">
                <label>Paste your FAQ content below</label>
                <textarea
                  value={pasteText}
                  onChange={(e) => setPasteText(e.target.value)}
                  placeholder="Paste your building rules, policies, lease excerpts, or any FAQ content here...

The AI will analyze your text and organize it into clear Q&A pairs automatically."
                  rows={15}
                />
                <p className="paste-hint">
                  Tip: You can paste any format — the AI will extract questions and answers automatically.
                </p>
              </div>
            ) : (
              <div className="upload-section">
                <div
                  className="upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploadedFile ? (
                    <>
                      <FileText size={48} />
                      <p className="file-name">{uploadedFile.name}</p>
                      <p className="file-size">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                    </>
                  ) : (
                    <>
                      <Upload size={48} />
                      <p>Click to select a .txt file</p>
                      <p className="upload-hint">Only .txt files are supported</p>
                    </>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            {extractError && (
              <div className="extract-error">
                <AlertCircle size={18} />
                <span>{extractError}</span>
              </div>
            )}
          </div>

          <div className="import-footer">
            <button
              className="generate-btn"
              onClick={handleExtractFAQs}
              disabled={extracting || (importMethod === 'paste' ? !pasteText.trim() : !uploadedFile)}
            >
              {extracting ? (
                <>
                  <Loader2 className="spin" size={18} />
                  AI is organizing your document into FAQ entries...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Organize with AI
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Review View
  if (currentView === 'review') {
    const allSelected = extractedItems.length > 0 && extractedItems.every(item => item.selected)

    return (
      <div className="manager-faq">
        <div className="faq-review">
          <div className="review-header">
            <button className="back-btn" onClick={() => {
              if (showImportModal || faqs.length > 0) {
                setCurrentView('manage')
              } else {
                setCurrentView('import')
              }
            }}>
              <ArrowLeft size={20} />
              Back
            </button>
            <div className="review-title">
              <h2>Review & Edit FAQs</h2>
              <span className="item-count">AI generated {extractedItems.length} questions from your document</span>
            </div>
          </div>

          {/* Select all / summary bar */}
          {extractedItems.length > 0 && (
            <div className="review-summary">
              <button className="select-all-toggle" onClick={handleSelectAll}>
                {allSelected ? <CheckSquare size={18} /> : <Square size={18} />}
                <span>{allSelected ? 'Deselect All' : 'Select All'}</span>
              </button>
              <span className="selected-count">{selectedCount} of {extractedItems.length} selected</span>
            </div>
          )}

          <div className="review-content">
            {extractedItems.length === 0 ? (
              <div className="no-items">
                <AlertCircle size={48} />
                <p>No FAQ items to review. Go back and try again.</p>
              </div>
            ) : (
              extractedItems.map((item, index) => (
                <div key={item.id} className={`review-item ${!item.selected ? 'review-item-deselected' : ''}`}>
                  <div className="review-item-header">
                    <button
                      className="review-item-checkbox"
                      onClick={() => handleToggleItemSelection(index)}
                    >
                      {item.selected ? <CheckSquare size={18} /> : <Square size={18} />}
                    </button>
                    <span className="item-number">#{index + 1}</span>
                    <select
                      value={item.category}
                      onChange={(e) => handleUpdateExtractedItem(index, 'category', e.target.value)}
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.label}</option>
                      ))}
                    </select>
                    <button
                      className="delete-item-btn"
                      onClick={() => handleDeleteExtractedItem(index)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="review-item-body">
                    <div className="form-group">
                      <label>Question</label>
                      <input
                        type="text"
                        value={item.question}
                        onChange={(e) => handleUpdateExtractedItem(index, 'question', e.target.value)}
                        placeholder="Enter the question..."
                      />
                    </div>
                    <div className="form-group">
                      <label>Answer</label>
                      <textarea
                        value={item.answer}
                        onChange={(e) => handleUpdateExtractedItem(index, 'answer', e.target.value)}
                        placeholder="Enter the answer..."
                        rows={3}
                      />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="review-footer">
            <button className="cancel-btn" onClick={() => {
              setExtractedItems([])
              if (faqs.length > 0) {
                setCurrentView('manage')
              } else {
                setCurrentView('wizard')
              }
            }}>
              Cancel
            </button>
            <button
              className="publish-btn"
              onClick={handlePublishFAQs}
              disabled={selectedCount === 0}
            >
              <Save size={18} />
              Add {selectedCount} Selected
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Management View
  const filteredFAQs = getFilteredFAQs()
  const groupedFAQs = getGroupedFAQs()
  const totalViews = faqs.reduce((sum, faq) => sum + (faq.view_count || 0), 0)

  return (
    <div className="manager-faq">
      {/* Header */}
      <div className="faq-header">
        <div className="faq-header-left">
          <h2>Building FAQ</h2>
          <p>Manage frequently asked questions for residents</p>
        </div>
        <div className="faq-header-actions">
          <button className="reimport-btn" onClick={openImportModal}>
            <Upload size={16} />
            <span>Import FAQ</span>
          </button>
          {faqs.length > 0 && (
            <button
              className={`bulk-mode-btn ${bulkMode ? 'active' : ''}`}
              onClick={toggleBulkMode}
            >
              <CheckSquare size={16} />
              <span>{bulkMode ? 'Cancel' : 'Select'}</span>
            </button>
          )}
          <button className="add-faq-btn" onClick={() => setShowAddModal(true)}>
            <Plus size={18} />
            <span>Add Question</span>
          </button>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {bulkMode && selectedFaqIds.length > 0 && (
        <div className="bulk-action-bar">
          <span className="bulk-count">{selectedFaqIds.length} selected</span>
          <div className="bulk-actions">
            <button className="bulk-btn" onClick={() => handleBulkToggleVisibility(false)}>
              <EyeOff size={14} />
              Hide
            </button>
            <button className="bulk-btn" onClick={() => handleBulkToggleVisibility(true)}>
              <Eye size={14} />
              Show
            </button>
            <button className="bulk-btn" onClick={() => {
              setBulkCategory('General')
              setShowBulkCategoryModal(true)
            }}>
              <FileText size={14} />
              Category
            </button>
            <button className="bulk-btn bulk-btn-danger" onClick={handleBulkDelete}>
              <Trash2 size={14} />
              Delete
            </button>
          </div>
          <button className="bulk-select-all" onClick={handleBulkSelectAll}>
            {selectedFaqIds.length === filteredFAQs.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>
      )}

      {/* Stats Row */}
      {!bulkMode && (
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
              <span className="stat-value">{Object.keys(groupedFAQs).length}</span>
              <span className="stat-label">Categories</span>
            </div>
          </div>
          <div className="stat-card">
            <EyeOff size={20} />
            <div className="stat-content">
              <span className="stat-value">{faqs.filter(f => !f.is_visible).length}</span>
              <span className="stat-label">Hidden</span>
            </div>
          </div>
        </div>
      )}

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
          {CATEGORIES.filter(cat => groupedFAQs[cat.id]).map(cat => (
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

      {/* FAQ List */}
      <div className="faq-list">
        {filteredFAQs.length === 0 ? (
          <div className="no-faqs">
            <HelpCircle size={48} />
            <h3>No FAQs found</h3>
            <p>
              {searchQuery
                ? 'Try a different search term'
                : 'Add your first question or import FAQs to get started!'}
            </p>
            <div className="no-faqs-actions">
              <button className="import-btn" onClick={openImportModal}>
                <Upload size={18} />
                Import FAQs
              </button>
              <button className="add-first-btn" onClick={() => setShowAddModal(true)}>
                <Plus size={18} />
                Add Question
              </button>
            </div>
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
                      onToggleVisibility={() => handleToggleVisibility(faq)}
                      bulkMode={bulkMode}
                      isSelected={selectedFaqIds.includes(faq.id)}
                      onToggleSelect={() => toggleFaqSelection(faq.id)}
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
                  onToggleVisibility={() => handleToggleVisibility(faq)}
                  bulkMode={bulkMode}
                  isSelected={selectedFaqIds.includes(faq.id)}
                  onToggleSelect={() => toggleFaqSelection(faq.id)}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Import FAQ Modal */}
      {showImportModal && (
        <div className="modal-overlay" onClick={() => setShowImportModal(false)}>
          <div className="modal-content import-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Import FAQ</h3>
              <button className="modal-close" onClick={() => setShowImportModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="import-modal-tabs">
              <button
                className={`import-modal-tab ${importTab === 'paste' ? 'active' : ''}`}
                onClick={() => { setImportTab('paste'); setExtractError(null) }}
              >
                <Clipboard size={16} />
                Paste Text
              </button>
              <button
                className={`import-modal-tab ${importTab === 'file' ? 'active' : ''}`}
                onClick={() => { setImportTab('file'); setExtractError(null) }}
              >
                <FileUp size={16} />
                Upload File
              </button>
            </div>

            <div className="modal-body">
              {importTab === 'paste' ? (
                <div className="paste-section">
                  <textarea
                    value={pasteText}
                    onChange={(e) => setPasteText(e.target.value)}
                    placeholder="Paste your building rules, policies, lease excerpts, or any FAQ content here...

The AI will analyze your text and organize it into clear Q&A pairs."
                    rows={12}
                  />
                </div>
              ) : (
                <div className="upload-section">
                  <div
                    className="upload-dropzone"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {uploadedFile ? (
                      <>
                        <FileText size={48} />
                        <p className="file-name">{uploadedFile.name}</p>
                        <p className="file-size">{(uploadedFile.size / 1024).toFixed(1)} KB</p>
                      </>
                    ) : (
                      <>
                        <Upload size={48} />
                        <p>Click to select a .txt file</p>
                        <p className="upload-hint">Only .txt files are supported</p>
                      </>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".txt"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>
              )}

              {extractError && (
                <div className="extract-error">
                  <AlertCircle size={18} />
                  <span>{extractError}</span>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowImportModal(false)}>
                Cancel
              </button>
              <button
                className="generate-btn"
                onClick={handleExtractFAQs}
                disabled={extracting || (importTab === 'paste' ? !pasteText.trim() : !uploadedFile)}
              >
                {extracting ? (
                  <>
                    <Loader2 className="spin" size={18} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Organize with AI
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

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
                  {CATEGORIES.map(cat => (
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

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={faqForm.is_visible}
                    onChange={e => setFaqForm({ ...faqForm, is_visible: e.target.checked })}
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
                  {CATEGORIES.map(cat => (
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

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={faqForm.is_visible}
                    onChange={e => setFaqForm({ ...faqForm, is_visible: e.target.checked })}
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

      {/* Bulk Category Modal */}
      {showBulkCategoryModal && (
        <div className="modal-overlay" onClick={() => setShowBulkCategoryModal(false)}>
          <div className="modal-content delete-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Change Category</h3>
              <button className="modal-close" onClick={() => setShowBulkCategoryModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Move {selectedFaqIds.length} FAQs to:</label>
                <select
                  value={bulkCategory}
                  onChange={e => setBulkCategory(e.target.value)}
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowBulkCategoryModal(false)}>
                Cancel
              </button>
              <button className="btn-primary" onClick={handleBulkChangeCategory}>
                <CheckCircle size={18} />
                Change Category
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
  bulkMode,
  isSelected,
  onToggleSelect
}) {
  return (
    <div className={`faq-item ${isExpanded ? 'expanded' : ''} ${!faq.is_visible ? 'hidden-faq' : ''} ${bulkMode && isSelected ? 'bulk-selected' : ''}`}>
      <div className="faq-item-header" onClick={bulkMode ? onToggleSelect : onToggle}>
        {bulkMode && (
          <button className="bulk-checkbox" onClick={e => { e.stopPropagation(); onToggleSelect() }}>
            {isSelected ? <CheckSquare size={18} /> : <Square size={18} />}
          </button>
        )}
        <div className="faq-question">
          <span className="question-text">{faq.question}</span>
          {!faq.is_visible && (
            <span className="hidden-badge">
              <EyeOff size={12} />
              Hidden
            </span>
          )}
        </div>

        {!bulkMode && (
          <div className="faq-item-actions">
            <span className="faq-views">
              <Eye size={12} />
              {faq.view_count || 0}
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
                    {faq.is_visible ? <EyeOff size={14} /> : <Eye size={14} />}
                    {faq.is_visible ? 'Hide from Residents' : 'Show to Residents'}
                  </button>
                  <div className="menu-divider"></div>
                  <button className="delete-btn" onClick={e => { e.stopPropagation(); onDelete() }}>
                    <Trash2 size={14} />
                    Delete Question
                  </button>
                </div>
              )}
            </div>
            <button className="expand-btn">
              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
            </button>
          </div>
        )}
      </div>

      {isExpanded && !bulkMode && (
        <div className="faq-answer">
          <p>{faq.answer}</p>
        </div>
      )}
    </div>
  )
}

export default ManagerFAQ
