import { useState, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  MessageSquare,
  File,
  X,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  Car,
  PawPrint,
  Package,
  ScrollText,
  Phone
} from 'lucide-react'
import { extractFaqsFromText } from './services/faqService'
import './ManagerOnboardingStep2.css'

function ManagerOnboardingStep2({ onBack, onContinue, onSkip, initialData }) {
  const fileInputRef = useRef(null)

  // Input method tabs
  const [activeTab, setActiveTab] = useState('upload')

  // Upload state
  const [uploadedFiles, setUploadedFiles] = useState([])

  // Paste text state
  const [pastedText, setPastedText] = useState('')

  // Questions form state
  const [answers, setAnswers] = useState({
    gymHours: '',
    parkingPolicy: '',
    petPolicy: '',
    mailRoomHours: '',
    quietHours: '',
    laundryRules: ''
  })

  // AI processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')

  // Generated FAQ state - restore from initialData if available
  const [generatedFAQ, setGeneratedFAQ] = useState(initialData?.faq || null)
  const [expandedCategories, setExpandedCategories] = useState(
    initialData?.faq ? Object.keys(initialData.faq) : []
  )
  const [editingItem, setEditingItem] = useState(null)
  const [editValue, setEditValue] = useState('')

  // File upload handling
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files)
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const files = Array.from(e.dataTransfer.files)
    const newFiles = files.map(file => ({
      id: Date.now() + Math.random(),
      name: file.name,
      size: file.size,
      type: file.type,
      file: file
    }))
    setUploadedFiles(prev => [...prev, ...newFiles])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const removeFile = (fileId) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Check if we have any input
  const hasInput = () => {
    return uploadedFiles.length > 0 ||
           pastedText.trim().length > 0 ||
           Object.values(answers).some(a => a.trim().length > 0)
  }

  // Collect user input from whichever tab has content
  const collectInputText = async () => {
    const parts = []

    // Pasted text
    if (pastedText.trim()) {
      parts.push(pastedText.trim())
    }

    // Answered questions
    const questionLabels = {
      gymHours: 'Gym/fitness center hours',
      parkingPolicy: 'Parking policy',
      petPolicy: 'Pet policy',
      mailRoomHours: 'Mail room hours',
      quietHours: 'Quiet hours',
      laundryRules: 'Laundry room rules'
    }
    const answeredParts = Object.entries(answers)
      .filter(([, v]) => v.trim())
      .map(([k, v]) => `${questionLabels[k]}: ${v.trim()}`)
    if (answeredParts.length > 0) {
      parts.push(answeredParts.join('\n'))
    }

    // Uploaded files — read text content from each file
    for (const f of uploadedFiles) {
      try {
        const text = await f.file.text()
        if (text.trim()) parts.push(text.trim())
      } catch (err) {
        console.warn('[Onboarding FAQ] Could not read file:', f.name, err)
      }
    }

    return parts.join('\n\n')
  }

  // Category icon mapping for AI-returned categories
  const CATEGORY_ICONS = {
    'Amenities': Dumbbell,
    'Parking': Car,
    'Pets': PawPrint,
    'Packages & Mail': Package,
    'Building Policies': ScrollText,
    'General': ScrollText,
    'Maintenance': ScrollText,
    'Access & Security': ScrollText,
    'Billing & Payments': ScrollText,
    'Moving & Elevator': ScrollText,
    'Trash & Recycling': ScrollText,
    'Safety & Emergency': Phone,
  }

  // Generate FAQ using real AI extraction
  const generateFAQ = async () => {
    setIsProcessing(true)
    setProcessingStep('Collecting your content...')

    try {
      const inputText = await collectInputText()

      if (!inputText || inputText.trim().length < 50) {
        console.warn('[Onboarding FAQ] Input too short:', inputText?.length || 0, 'chars')
        setIsProcessing(false)
        setProcessingStep('')
        return
      }

      console.log('[Onboarding FAQ] Sending', inputText.length, 'chars to AI')
      setProcessingStep('AI is analyzing your content...')

      const result = await extractFaqsFromText(inputText)

      if (result.error || !result.items || result.items.length === 0) {
        console.error('[Onboarding FAQ] Extraction failed:', result.error)
        setProcessingStep(result.error || 'Could not generate FAQ. Try adding more content.')
        setTimeout(() => { setIsProcessing(false); setProcessingStep('') }, 3000)
        return
      }

      console.log('[Onboarding FAQ] Got', result.items.length, 'FAQ items from AI')

      // Group flat items into categorized structure the UI expects
      const grouped = {}
      let idCounter = 1
      for (const item of result.items) {
        const cat = item.category || 'General'
        const key = cat.toLowerCase().replace(/[^a-z0-9]/g, '_')
        if (!grouped[key]) {
          grouped[key] = {
            icon: CATEGORY_ICONS[cat] || ScrollText,
            title: cat,
            items: []
          }
        }
        grouped[key].items.push({
          id: idCounter++,
          question: item.question,
          answer: item.answer
        })
      }

      setGeneratedFAQ(grouped)
      setExpandedCategories(Object.keys(grouped))
    } catch (err) {
      console.error('[Onboarding FAQ] Unexpected error:', err)
      setProcessingStep('Something went wrong. Please try again.')
      setTimeout(() => { setIsProcessing(false); setProcessingStep('') }, 3000)
      return
    }

    setIsProcessing(false)
    setProcessingStep('')
  }

  // Toggle category expansion
  const toggleCategory = (categoryKey) => {
    setExpandedCategories(prev =>
      prev.includes(categoryKey)
        ? prev.filter(k => k !== categoryKey)
        : [...prev, categoryKey]
    )
  }

  // Edit FAQ item
  const startEditing = (categoryKey, itemId, currentAnswer) => {
    setEditingItem({ categoryKey, itemId })
    setEditValue(currentAnswer)
  }

  const saveEdit = () => {
    if (!editingItem) return

    setGeneratedFAQ(prev => ({
      ...prev,
      [editingItem.categoryKey]: {
        ...prev[editingItem.categoryKey],
        items: prev[editingItem.categoryKey].items.map(item =>
          item.id === editingItem.itemId
            ? { ...item, answer: editValue }
            : item
        )
      }
    }))

    setEditingItem(null)
    setEditValue('')
  }

  const cancelEdit = () => {
    setEditingItem(null)
    setEditValue('')
  }

  // Delete FAQ item
  const deleteItem = (categoryKey, itemId) => {
    setGeneratedFAQ(prev => ({
      ...prev,
      [categoryKey]: {
        ...prev[categoryKey],
        items: prev[categoryKey].items.filter(item => item.id !== itemId)
      }
    }))
  }

  // Add new FAQ item
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItemCategory, setNewItemCategory] = useState('amenities')
  const [newItemQuestion, setNewItemQuestion] = useState('')
  const [newItemAnswer, setNewItemAnswer] = useState('')

  const addNewItem = () => {
    if (!newItemQuestion.trim() || !newItemAnswer.trim()) return

    const newItem = {
      id: Date.now(),
      question: newItemQuestion,
      answer: newItemAnswer
    }

    setGeneratedFAQ(prev => ({
      ...prev,
      [newItemCategory]: {
        ...prev[newItemCategory],
        items: [...prev[newItemCategory].items, newItem]
      }
    }))

    setNewItemQuestion('')
    setNewItemAnswer('')
    setShowAddForm(false)

    // Expand the category where we added
    if (!expandedCategories.includes(newItemCategory)) {
      setExpandedCategories(prev => [...prev, newItemCategory])
    }
  }

  // Handle continue
  const handleContinue = () => {
    onContinue({
      ...initialData,
      faq: generatedFAQ
    })
  }

  // Handle skip
  const handleSkip = () => {
    onSkip({
      ...initialData,
      faq: null
    })
  }

  return (
    <div className="onboarding-container">
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      {/* Header */}
      <header className="onboarding-header">
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <div className="header-spacer"></div>
      </header>

      {/* Progress Indicator */}
      <div className="progress-section">
        <div className="progress-indicator">
          <div className="progress-step completed">
            <div className="step-number"><Check size={16} /></div>
            <span className="step-label">Details</span>
          </div>
          <div className="progress-line completed"></div>
          <div className="progress-step active">
            <div className="step-number">2</div>
            <span className="step-label">FAQ</span>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-number">3</div>
            <span className="step-label">Residents</span>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-number">4</div>
            <span className="step-label">Launch</span>
          </div>
        </div>
        <p className="progress-text">Step 2 of 4</p>
      </div>

      {/* Main Content */}
      <main className="onboarding-content">
        <div className="onboarding-intro">
          <div className="ai-badge">
            <Sparkles size={16} />
            <span>AI-Powered</span>
          </div>
          <h1 className="onboarding-title">Let's build your building's FAQ</h1>
          <p className="onboarding-subtitle">
            Upload documents, photos of bulletin boards, or paste text - or skip this and set up your FAQ later
          </p>
        </div>

        {/* Input Section - Only show if FAQ not generated yet */}
        {!generatedFAQ && !isProcessing && (
          <>
            {/* Input Method Tabs */}
            <div className="input-tabs">
              <button
                className={`input-tab ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <Upload size={18} />
                <span>Upload Documents</span>
              </button>
              <button
                className={`input-tab ${activeTab === 'paste' ? 'active' : ''}`}
                onClick={() => setActiveTab('paste')}
              >
                <FileText size={18} />
                <span>Paste Text</span>
              </button>
              <button
                className={`input-tab ${activeTab === 'questions' ? 'active' : ''}`}
                onClick={() => setActiveTab('questions')}
              >
                <MessageSquare size={18} />
                <span>Answer Questions</span>
              </button>
            </div>

            {/* Upload Documents Tab */}
            {activeTab === 'upload' && (
              <div className="input-card">
                <div
                  className="upload-zone"
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={32} />
                  <p className="upload-title">Drop files here or click to upload</p>
                  <p className="upload-hint">PDF, DOC, DOCX, or images (JPG, PNG)</p>
                  <p className="upload-examples">Building rules, welcome packets, bulletin board photos, etc.</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />

                {uploadedFiles.length > 0 && (
                  <div className="uploaded-files">
                    {uploadedFiles.map(file => (
                      <div key={file.id} className="uploaded-file">
                        <File size={18} />
                        <div className="file-info">
                          <span className="file-name">{file.name}</span>
                          <span className="file-size">{formatFileSize(file.size)}</span>
                        </div>
                        <button className="remove-file-btn" onClick={() => removeFile(file.id)}>
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Paste Text Tab */}
            {activeTab === 'paste' && (
              <div className="input-card">
                <textarea
                  className="paste-textarea"
                  placeholder="Paste any building information here - gym hours, parking rules, pet policies, mail room hours, move-in procedures, emergency contacts, etc."
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={10}
                />
                <p className="paste-hint">
                  Tip: You can paste content from multiple sources - the AI will sort it all out!
                </p>
              </div>
            )}

            {/* Answer Questions Tab */}
            {activeTab === 'questions' && (
              <div className="input-card">
                <p className="questions-intro">
                  Answer as many or as few as you'd like. Leave blank if not applicable.
                </p>

                <div className="question-group">
                  <label>What are the gym/fitness center hours?</label>
                  <input
                    type="text"
                    placeholder="e.g., 5 AM - 11 PM daily"
                    value={answers.gymHours}
                    onChange={(e) => setAnswers(prev => ({ ...prev, gymHours: e.target.value }))}
                  />
                </div>

                <div className="question-group">
                  <label>What's the parking policy?</label>
                  <textarea
                    placeholder="e.g., 1 spot per unit, guest parking in P1, no overnight guests without registration"
                    value={answers.parkingPolicy}
                    onChange={(e) => setAnswers(prev => ({ ...prev, parkingPolicy: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="question-group">
                  <label>Are pets allowed? Any restrictions?</label>
                  <textarea
                    placeholder="e.g., Dogs and cats allowed, max 2 pets, 50lb weight limit, $500 pet deposit"
                    value={answers.petPolicy}
                    onChange={(e) => setAnswers(prev => ({ ...prev, petPolicy: e.target.value }))}
                    rows={2}
                  />
                </div>

                <div className="question-group">
                  <label>What are the mail room hours?</label>
                  <input
                    type="text"
                    placeholder="e.g., 24/7 access with key fob"
                    value={answers.mailRoomHours}
                    onChange={(e) => setAnswers(prev => ({ ...prev, mailRoomHours: e.target.value }))}
                  />
                </div>

                <div className="question-group">
                  <label>Are there quiet hours?</label>
                  <input
                    type="text"
                    placeholder="e.g., 10 PM - 8 AM weekdays, 11 PM - 9 AM weekends"
                    value={answers.quietHours}
                    onChange={(e) => setAnswers(prev => ({ ...prev, quietHours: e.target.value }))}
                  />
                </div>

                <div className="question-group">
                  <label>Laundry room rules?</label>
                  <textarea
                    placeholder="e.g., Located on floors 3, 7, 11. Open 7 AM - 10 PM. Remove clothes promptly."
                    value={answers.laundryRules}
                    onChange={(e) => setAnswers(prev => ({ ...prev, laundryRules: e.target.value }))}
                    rows={2}
                  />
                </div>
              </div>
            )}

            {/* Generate Button */}
            <div className="generate-section">
              <button
                className={`generate-btn ${!hasInput() ? 'disabled' : ''}`}
                onClick={generateFAQ}
                disabled={!hasInput()}
              >
                <Sparkles size={20} />
                Generate FAQ with AI
              </button>
              {!hasInput() && (
                <p className="generate-hint">Add some content above to generate your FAQ</p>
              )}
            </div>
          </>
        )}

        {/* Processing State */}
        {isProcessing && (
          <div className="processing-section">
            <div className="processing-card">
              <div className="processing-spinner">
                <Loader2 size={48} className="spinner" />
                <Sparkles size={20} className="sparkle" />
              </div>
              <h2>AI is working its magic...</h2>
              <p className="processing-step">{processingStep}</p>
              <div className="processing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {/* Generated FAQ Results */}
        {generatedFAQ && !isProcessing && (
          <div className="faq-results">
            <div className="results-header">
              <div className="results-title">
                <Sparkles size={20} />
                <h2>Your FAQ is ready!</h2>
              </div>
              <p className="results-subtitle">
                Review and edit as needed. You're in control of what residents see.
              </p>
            </div>

            {/* FAQ Categories */}
            <div className="faq-categories">
              {Object.entries(generatedFAQ).map(([key, category]) => {
                const IconComponent = category.icon
                const isExpanded = expandedCategories.includes(key)

                return (
                  <div key={key} className={`faq-category ${isExpanded ? 'expanded' : ''}`}>
                    <button
                      className="category-header"
                      onClick={() => toggleCategory(key)}
                    >
                      <div className="category-left">
                        <div className="category-icon">
                          <IconComponent size={20} />
                        </div>
                        <span className="category-title">{category.title}</span>
                        <span className="category-count">{category.items.length} items</span>
                      </div>
                      <div className="category-chevron">
                        {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="category-items">
                        {category.items.map(item => (
                          <div key={item.id} className="faq-item">
                            <div className="faq-question">{item.question}</div>

                            {editingItem?.categoryKey === key && editingItem?.itemId === item.id ? (
                              <div className="faq-edit-form">
                                <textarea
                                  value={editValue}
                                  onChange={(e) => setEditValue(e.target.value)}
                                  rows={3}
                                />
                                <div className="edit-actions">
                                  <button className="save-btn" onClick={saveEdit}>
                                    <Check size={14} />
                                    Save
                                  </button>
                                  <button className="cancel-btn" onClick={cancelEdit}>
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <div className="faq-answer">{item.answer}</div>
                                <div className="faq-actions">
                                  <button
                                    className="edit-btn"
                                    onClick={() => startEditing(key, item.id, item.answer)}
                                  >
                                    <Edit3 size={14} />
                                    Edit
                                  </button>
                                  <button
                                    className="delete-btn"
                                    onClick={() => deleteItem(key, item.id)}
                                  >
                                    <Trash2 size={14} />
                                    Delete
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Add New FAQ Item */}
            {!showAddForm ? (
              <button className="add-faq-btn" onClick={() => setShowAddForm(true)}>
                <Plus size={18} />
                Add another FAQ
              </button>
            ) : (
              <div className="add-faq-form">
                <div className="add-form-header">
                  <h3>Add New FAQ</h3>
                  <button className="close-form-btn" onClick={() => setShowAddForm(false)}>
                    <X size={18} />
                  </button>
                </div>

                <div className="add-form-group">
                  <label>Category</label>
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value)}
                  >
                    {Object.entries(generatedFAQ).map(([key, cat]) => (
                      <option key={key} value={key}>{cat.title}</option>
                    ))}
                  </select>
                </div>

                <div className="add-form-group">
                  <label>Question</label>
                  <input
                    type="text"
                    placeholder="e.g., Is there a rooftop terrace?"
                    value={newItemQuestion}
                    onChange={(e) => setNewItemQuestion(e.target.value)}
                  />
                </div>

                <div className="add-form-group">
                  <label>Answer</label>
                  <textarea
                    placeholder="Enter the answer..."
                    value={newItemAnswer}
                    onChange={(e) => setNewItemAnswer(e.target.value)}
                    rows={3}
                  />
                </div>

                <button
                  className="add-item-btn"
                  onClick={addNewItem}
                  disabled={!newItemQuestion.trim() || !newItemAnswer.trim()}
                >
                  <Plus size={16} />
                  Add FAQ Item
                </button>
              </div>
            )}

            {/* Regenerate Option */}
            <button className="regenerate-btn" onClick={() => setGeneratedFAQ(null)}>
              <Sparkles size={16} />
              Start over with different content
            </button>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <button className="back-link" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Step 1
          </button>

          <div className="nav-right">
            <button className="skip-link" onClick={handleSkip}>
              Skip for now
            </button>
            {generatedFAQ && (
              <button className="continue-btn" onClick={handleContinue}>
                Continue to Step 3
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ManagerOnboardingStep2
