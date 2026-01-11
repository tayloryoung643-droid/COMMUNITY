import { useState, useRef } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  Upload,
  FileText,
  File,
  X,
  Sparkles,
  Loader2,
  Plus,
  Trash2,
  Edit3,
  Check,
  AlertTriangle,
  Users,
  CheckCircle
} from 'lucide-react'
import './ManagerOnboardingStep3.css'

function ManagerOnboardingStep3({ onBack, onContinue, onSkip, initialData }) {
  const fileInputRef = useRef(null)

  // Input method tabs
  const [activeTab, setActiveTab] = useState('paste')

  // Upload state
  const [uploadedFile, setUploadedFile] = useState(null)

  // Paste text state
  const [pastedText, setPastedText] = useState('')

  // AI processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingStep, setProcessingStep] = useState('')

  // Generated residents state
  const [residents, setResidents] = useState(null)
  const [editingRow, setEditingRow] = useState(null)
  const [editValues, setEditValues] = useState({})

  // Manual add form
  const [showAddForm, setShowAddForm] = useState(false)
  const [newResident, setNewResident] = useState({ name: '', unit: '', email: '' })

  // File upload handling
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      })
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) {
      setUploadedFile({
        name: file.name,
        size: file.size,
        type: file.type,
        file: file
      })
    }
  }

  const handleDragOver = (e) => {
    e.preventDefault()
  }

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  // Check if we have any input
  const hasInput = () => {
    return uploadedFile || pastedText.trim().length > 0
  }

  // Simulate AI processing
  const organizeResidents = async () => {
    setIsProcessing(true)

    const steps = [
      'Reading your data...',
      'Identifying resident information...',
      'Extracting names and units...',
      'Validating email addresses...',
      'Organizing resident list...'
    ]

    for (const step of steps) {
      setProcessingStep(step)
      await new Promise(resolve => setTimeout(resolve, 700))
    }

    // Simulate AI-organized resident data
    const simulatedResidents = {
      valid: [
        { id: 1, name: 'John Smith', unit: '401', email: 'john.smith@email.com', status: 'ready' },
        { id: 2, name: 'Sarah Johnson', unit: '402', email: 'sarah.j@gmail.com', status: 'ready' },
        { id: 3, name: 'Mike Wilson', unit: '403', email: 'mike@wilson.com', status: 'ready' },
        { id: 4, name: 'Emily Davis', unit: '404', email: 'emily.davis@outlook.com', status: 'ready' },
        { id: 5, name: 'Robert Brown', unit: '405', email: 'rbrown@company.com', status: 'ready' },
        { id: 6, name: 'Jennifer Martinez', unit: '501', email: 'jenn.martinez@email.com', status: 'ready' },
        { id: 7, name: 'David Lee', unit: '502', email: 'david.lee@gmail.com', status: 'ready' },
        { id: 8, name: 'Lisa Anderson', unit: '503', email: 'l.anderson@email.com', status: 'ready' },
        { id: 9, name: 'James Taylor', unit: '504', email: 'jtaylor@business.com', status: 'ready' },
        { id: 10, name: 'Amanda White', unit: '505', email: 'amanda.w@email.com', status: 'ready' },
        { id: 11, name: 'Christopher Harris', unit: '601', email: 'c.harris@company.com', status: 'ready' },
        { id: 12, name: 'Michelle Clark', unit: '602', email: 'michelle.clark@gmail.com', status: 'ready' },
        { id: 13, name: 'Daniel Lewis', unit: '603', email: 'dlewis@email.com', status: 'ready' },
        { id: 14, name: 'Jessica Robinson', unit: '604', email: 'jess.r@outlook.com', status: 'ready' },
        { id: 15, name: 'Matthew Walker', unit: '605', email: 'matt.walker@email.com', status: 'ready' },
        { id: 16, name: 'Ashley Hall', unit: '701', email: 'ashley.hall@gmail.com', status: 'ready' },
        { id: 17, name: 'Andrew Young', unit: '702', email: 'a.young@company.com', status: 'ready' },
        { id: 18, name: 'Stephanie King', unit: '703', email: 'stephanie.k@email.com', status: 'ready' },
        { id: 19, name: 'Joshua Wright', unit: '704', email: 'josh.wright@business.com', status: 'ready' },
        { id: 20, name: 'Nicole Scott', unit: '705', email: 'nicole.s@gmail.com', status: 'ready' },
        { id: 21, name: 'Ryan Green', unit: '801', email: 'ryan.green@email.com', status: 'ready' },
        { id: 22, name: 'Megan Adams', unit: '802', email: 'megan.a@outlook.com', status: 'ready' },
        { id: 23, name: 'Kevin Baker', unit: '803', email: 'kbaker@company.com', status: 'ready' },
        { id: 24, name: 'Lauren Nelson', unit: '804', email: 'lauren.n@email.com', status: 'ready' },
        { id: 25, name: 'Brandon Carter', unit: '805', email: 'b.carter@gmail.com', status: 'ready' },
        { id: 26, name: 'Rachel Mitchell', unit: '901', email: 'rachel.m@business.com', status: 'ready' },
        { id: 27, name: 'Justin Perez', unit: '902', email: 'justin.perez@email.com', status: 'ready' },
        { id: 28, name: 'Amber Roberts', unit: '903', email: 'amber.r@outlook.com', status: 'ready' },
        { id: 29, name: 'Tyler Turner', unit: '904', email: 'tturner@company.com', status: 'ready' },
        { id: 30, name: 'Kayla Phillips', unit: '905', email: 'kayla.p@gmail.com', status: 'ready' },
        { id: 31, name: 'Eric Campbell', unit: '1001', email: 'e.campbell@email.com', status: 'ready' },
        { id: 32, name: 'Heather Parker', unit: '1002', email: 'heather.p@business.com', status: 'ready' },
        { id: 33, name: 'Sean Evans', unit: '1003', email: 's.evans@outlook.com', status: 'ready' },
        { id: 34, name: 'Christina Edwards', unit: '1004', email: 'christina.e@email.com', status: 'ready' },
        { id: 35, name: 'Jason Collins', unit: '1005', email: 'jason.c@gmail.com', status: 'ready' },
        { id: 36, name: 'Brittany Stewart', unit: '1101', email: 'b.stewart@company.com', status: 'ready' },
        { id: 37, name: 'Mark Sanchez', unit: '1102', email: 'mark.s@email.com', status: 'ready' },
        { id: 38, name: 'Samantha Morris', unit: '1103', email: 'samantha.m@business.com', status: 'ready' },
        { id: 39, name: 'Derek Rogers', unit: '1104', email: 'd.rogers@outlook.com', status: 'ready' },
        { id: 40, name: 'Courtney Reed', unit: '1105', email: 'courtney.r@gmail.com', status: 'ready' },
        { id: 41, name: 'Patrick Cook', unit: '1201', email: 'p.cook@email.com', status: 'ready' },
        { id: 42, name: 'Melissa Morgan', unit: '1202', email: 'melissa.m@company.com', status: 'ready' },
        { id: 43, name: 'Adam Bell', unit: '1203', email: 'adam.bell@business.com', status: 'ready' },
        { id: 44, name: 'Danielle Murphy', unit: '1204', email: 'd.murphy@outlook.com', status: 'ready' }
      ],
      needsReview: [
        { id: 101, name: 'Bob', unit: '502', email: '', status: 'needs_email', issue: 'Missing email address' },
        { id: 102, name: 'Unit 1205 Resident', unit: '1205', email: 'resident1205@temp.com', status: 'needs_name', issue: 'Name not found - using placeholder' },
        { id: 103, name: 'Tom & Jane Miller', unit: '1206', email: 'miller.family@email.com', status: 'multiple', issue: 'Multiple residents detected - may need separate entries' }
      ]
    }

    setResidents(simulatedResidents)
    setIsProcessing(false)
    setProcessingStep('')
  }

  // Edit resident
  const startEditing = (resident) => {
    setEditingRow(resident.id)
    setEditValues({
      name: resident.name,
      unit: resident.unit,
      email: resident.email
    })
  }

  const saveEdit = (residentId, isNeedsReview = false) => {
    const listKey = isNeedsReview ? 'needsReview' : 'valid'

    setResidents(prev => ({
      ...prev,
      [listKey]: prev[listKey].map(r =>
        r.id === residentId
          ? {
              ...r,
              ...editValues,
              status: editValues.email && editValues.name ? 'ready' : r.status
            }
          : r
      )
    }))

    // If it was in needsReview and now has all info, move to valid
    if (isNeedsReview && editValues.email && editValues.name && !editValues.name.includes('Resident')) {
      const resident = residents.needsReview.find(r => r.id === residentId)
      if (resident) {
        setResidents(prev => ({
          valid: [...prev.valid, { ...resident, ...editValues, status: 'ready' }],
          needsReview: prev.needsReview.filter(r => r.id !== residentId)
        }))
      }
    }

    setEditingRow(null)
    setEditValues({})
  }

  const cancelEdit = () => {
    setEditingRow(null)
    setEditValues({})
  }

  // Delete resident
  const deleteResident = (residentId, isNeedsReview = false) => {
    const listKey = isNeedsReview ? 'needsReview' : 'valid'
    setResidents(prev => ({
      ...prev,
      [listKey]: prev[listKey].filter(r => r.id !== residentId)
    }))
  }

  // Add new resident
  const addResident = () => {
    if (!newResident.name.trim() || !newResident.unit.trim()) return

    const resident = {
      id: Date.now(),
      name: newResident.name,
      unit: newResident.unit,
      email: newResident.email,
      status: newResident.email ? 'ready' : 'needs_email'
    }

    if (newResident.email) {
      setResidents(prev => ({
        ...prev,
        valid: [...prev.valid, resident]
      }))
    } else {
      setResidents(prev => ({
        ...prev,
        needsReview: [...prev.needsReview, { ...resident, issue: 'Missing email address' }]
      }))
    }

    setNewResident({ name: '', unit: '', email: '' })
    setShowAddForm(false)
  }

  // Get total count
  const getTotalCount = () => {
    if (!residents) return 0
    return residents.valid.length + residents.needsReview.length
  }

  const getReadyCount = () => {
    if (!residents) return 0
    return residents.valid.length
  }

  // Handle continue
  const handleContinue = () => {
    onContinue({
      ...initialData,
      residents: residents
    })
  }

  // Handle skip
  const handleSkip = () => {
    onSkip({
      ...initialData,
      residents: null
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
          <div className="progress-step completed">
            <div className="step-number"><Check size={16} /></div>
            <span className="step-label">FAQ</span>
          </div>
          <div className="progress-line completed"></div>
          <div className="progress-step active">
            <div className="step-number">3</div>
            <span className="step-label">Residents</span>
          </div>
          <div className="progress-line"></div>
          <div className="progress-step">
            <div className="step-number">4</div>
            <span className="step-label">Launch</span>
          </div>
        </div>
        <p className="progress-text">Step 3 of 4</p>
      </div>

      {/* Main Content */}
      <main className="onboarding-content">
        <div className="onboarding-intro">
          <div className="ai-badge">
            <Sparkles size={16} />
            <span>AI-Powered</span>
          </div>
          <h1 className="onboarding-title">Import your residents</h1>
          <p className="onboarding-subtitle">
            Paste your resident list in any format - or skip this and add residents later from your dashboard
          </p>
        </div>

        {/* Input Section - Only show if residents not generated yet */}
        {!residents && !isProcessing && (
          <>
            {/* Input Method Tabs */}
            <div className="input-tabs">
              <button
                className={`input-tab ${activeTab === 'upload' ? 'active' : ''}`}
                onClick={() => setActiveTab('upload')}
              >
                <Upload size={18} />
                <span>Upload CSV/Excel</span>
              </button>
              <button
                className={`input-tab ${activeTab === 'paste' ? 'active' : ''}`}
                onClick={() => setActiveTab('paste')}
              >
                <FileText size={18} />
                <span>Paste Anything</span>
              </button>
            </div>

            {/* Upload Tab */}
            {activeTab === 'upload' && (
              <div className="input-card">
                {!uploadedFile ? (
                  <div
                    className="upload-zone"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={32} />
                    <p className="upload-title">Drop file here or click to upload</p>
                    <p className="upload-hint">CSV or Excel files (.csv, .xlsx, .xls)</p>
                    <p className="upload-examples">Export from your property management software or spreadsheet</p>
                  </div>
                ) : (
                  <div className="uploaded-file-single">
                    <File size={24} />
                    <div className="file-info">
                      <span className="file-name">{uploadedFile.name}</span>
                      <span className="file-size">{formatFileSize(uploadedFile.size)}</span>
                    </div>
                    <button className="remove-file-btn" onClick={removeFile}>
                      <X size={18} />
                    </button>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,.xlsx,.xls"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </div>
            )}

            {/* Paste Tab */}
            {activeTab === 'paste' && (
              <div className="input-card">
                <textarea
                  className="paste-textarea"
                  placeholder={`John Smith, Unit 401, john@email.com
402 - Sarah Johnson (sarah.j@gmail.com)
Mike Wilson lives in 403, mike@wilson.com

Paste from anywhere - we'll figure it out!`}
                  value={pastedText}
                  onChange={(e) => setPastedText(e.target.value)}
                  rows={12}
                />
                <p className="paste-hint">
                  Copy from Excel, emails, PDFs, or type manually - any format works!
                </p>
              </div>
            )}

            {/* Generate Button */}
            <div className="generate-section">
              <button
                className={`generate-btn ${!hasInput() ? 'disabled' : ''}`}
                onClick={organizeResidents}
                disabled={!hasInput()}
              >
                <Sparkles size={20} />
                Organize with AI
              </button>
              {!hasInput() && (
                <p className="generate-hint">Upload a file or paste resident data above</p>
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
              <h2>AI is organizing your resident list...</h2>
              <p className="processing-step">{processingStep}</p>
              <div className="processing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        {residents && !isProcessing && (
          <div className="residents-results">
            {/* Summary Bar */}
            <div className="results-summary">
              <div className="summary-icon">
                <Users size={24} />
              </div>
              <div className="summary-text">
                <span className="summary-count">Found {getTotalCount()} residents</span>
                <span className="summary-detail">
                  {getReadyCount()} ready to invite
                  {residents.needsReview.length > 0 && `, ${residents.needsReview.length} need review`}
                </span>
              </div>
              <CheckCircle size={24} className="summary-check" />
            </div>

            {/* Needs Review Section */}
            {residents.needsReview.length > 0 && (
              <div className="needs-review-section">
                <div className="needs-review-header">
                  <AlertTriangle size={18} />
                  <span>{residents.needsReview.length} entries need your attention</span>
                </div>
                <div className="residents-table">
                  {residents.needsReview.map(resident => (
                    <div key={resident.id} className="resident-row needs-review">
                      {editingRow === resident.id ? (
                        <div className="edit-row">
                          <input
                            type="text"
                            value={editValues.name}
                            onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Name"
                          />
                          <input
                            type="text"
                            value={editValues.unit}
                            onChange={(e) => setEditValues(prev => ({ ...prev, unit: e.target.value }))}
                            placeholder="Unit"
                          />
                          <input
                            type="email"
                            value={editValues.email}
                            onChange={(e) => setEditValues(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="Email"
                          />
                          <div className="edit-row-actions">
                            <button className="save-btn" onClick={() => saveEdit(resident.id, true)}>
                              <Check size={14} />
                            </button>
                            <button className="cancel-btn" onClick={cancelEdit}>
                              <X size={14} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="resident-info">
                            <span className="resident-name">{resident.name}</span>
                            <span className="resident-unit">Unit {resident.unit}</span>
                            <span className="resident-email">{resident.email || '—'}</span>
                          </div>
                          <div className="resident-status warning">
                            <AlertTriangle size={14} />
                            <span>{resident.issue}</span>
                          </div>
                          <div className="resident-actions">
                            <button className="edit-btn" onClick={() => startEditing(resident)}>
                              <Edit3 size={14} />
                            </button>
                            <button className="delete-btn" onClick={() => deleteResident(resident.id, true)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Valid Residents Table */}
            <div className="valid-residents-section">
              <div className="section-header-small">
                <CheckCircle size={18} />
                <span>Ready to invite ({residents.valid.length})</span>
              </div>
              <div className="residents-table">
                <div className="table-header">
                  <span>Name</span>
                  <span>Unit</span>
                  <span>Email</span>
                  <span>Status</span>
                  <span></span>
                </div>
                {residents.valid.map(resident => (
                  <div key={resident.id} className="resident-row">
                    {editingRow === resident.id ? (
                      <div className="edit-row">
                        <input
                          type="text"
                          value={editValues.name}
                          onChange={(e) => setEditValues(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Name"
                        />
                        <input
                          type="text"
                          value={editValues.unit}
                          onChange={(e) => setEditValues(prev => ({ ...prev, unit: e.target.value }))}
                          placeholder="Unit"
                        />
                        <input
                          type="email"
                          value={editValues.email}
                          onChange={(e) => setEditValues(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="Email"
                        />
                        <div className="edit-row-actions">
                          <button className="save-btn" onClick={() => saveEdit(resident.id, false)}>
                            <Check size={14} />
                          </button>
                          <button className="cancel-btn" onClick={cancelEdit}>
                            <X size={14} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="resident-name">{resident.name}</span>
                        <span className="resident-unit">{resident.unit}</span>
                        <span className="resident-email">{resident.email}</span>
                        <span className="resident-status ready">
                          <Check size={14} />
                          Ready to invite
                        </span>
                        <div className="resident-actions">
                          <button className="edit-btn" onClick={() => startEditing(resident)}>
                            <Edit3 size={14} />
                          </button>
                          <button className="delete-btn" onClick={() => deleteResident(resident.id, false)}>
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Add Manual Resident */}
            {!showAddForm ? (
              <button className="add-resident-btn" onClick={() => setShowAddForm(true)}>
                <Plus size={18} />
                Manually add resident
              </button>
            ) : (
              <div className="add-resident-form">
                <div className="add-form-header">
                  <h3>Add Resident</h3>
                  <button className="close-form-btn" onClick={() => setShowAddForm(false)}>
                    <X size={18} />
                  </button>
                </div>
                <div className="add-form-row">
                  <div className="add-form-group">
                    <label>Name <span className="required">*</span></label>
                    <input
                      type="text"
                      placeholder="John Smith"
                      value={newResident.name}
                      onChange={(e) => setNewResident(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div className="add-form-group">
                    <label>Unit <span className="required">*</span></label>
                    <input
                      type="text"
                      placeholder="401"
                      value={newResident.unit}
                      onChange={(e) => setNewResident(prev => ({ ...prev, unit: e.target.value }))}
                    />
                  </div>
                  <div className="add-form-group">
                    <label>Email</label>
                    <input
                      type="email"
                      placeholder="email@example.com"
                      value={newResident.email}
                      onChange={(e) => setNewResident(prev => ({ ...prev, email: e.target.value }))}
                    />
                  </div>
                </div>
                <button
                  className="add-resident-submit"
                  onClick={addResident}
                  disabled={!newResident.name.trim() || !newResident.unit.trim()}
                >
                  <Plus size={16} />
                  Add Resident
                </button>
              </div>
            )}

            {/* Start Over */}
            <button className="regenerate-btn" onClick={() => setResidents(null)}>
              <Sparkles size={16} />
              Start over with different data
            </button>
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="bottom-nav">
          <button className="back-link" onClick={onBack}>
            <ArrowLeft size={16} />
            Back to Step 2
          </button>

          <div className="nav-right">
            <button className="skip-link" onClick={handleSkip}>
              Skip for now
            </button>
            {residents && (
              <button className="continue-btn" onClick={handleContinue}>
                Continue with {getReadyCount()} residents
                <ArrowRight size={20} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default ManagerOnboardingStep3
