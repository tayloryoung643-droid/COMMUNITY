import { useState, useEffect, useRef } from 'react'
import {
  FileText,
  Plus,
  Search,
  Upload,
  X,
  Eye,
  Download,
  Edit3,
  Trash2,
  CheckCircle,
  AlertTriangle,
  File,
  Filter,
  ToggleLeft,
  ToggleRight,
  Loader2,
  ChevronDown,
  FileCheck,
  FileWarning,
  ClipboardList,
  ScrollText
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import {
  getDocuments,
  uploadDocument,
  getSignedUrl,
  deleteDocument,
  updateDocument,
  formatFileSize,
  DOC_TYPE_LABELS,
  DOC_TYPE_COLORS
} from './services/buildingDocumentsService'
import './ManagerDocuments.css'

// Demo documents for demo mode
const DEMO_DOCUMENTS = [
  {
    id: '1',
    title: 'Building Bylaws 2024',
    doc_type: 'bylaws',
    file_path: 'demo/bylaws.pdf',
    mime_type: 'application/pdf',
    file_size: 245000,
    is_visible: true,
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    title: 'Community Rules & Regulations',
    doc_type: 'rules',
    file_path: 'demo/rules.pdf',
    mime_type: 'application/pdf',
    file_size: 189000,
    is_visible: true,
    created_at: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    title: 'Move-In Checklist',
    doc_type: 'checklist',
    file_path: 'demo/checklist.pdf',
    mime_type: 'application/pdf',
    file_size: 78000,
    is_visible: true,
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '4',
    title: 'Maintenance Request Form',
    doc_type: 'form',
    file_path: 'demo/form.pdf',
    mime_type: 'application/pdf',
    file_size: 54000,
    is_visible: true,
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '5',
    title: 'Pet Policy Addendum',
    doc_type: 'other',
    file_path: 'demo/pet-policy.pdf',
    mime_type: 'application/pdf',
    file_size: 92000,
    is_visible: false,
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
  }
]

function ManagerDocuments() {
  const { user, userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // Modal states
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [showViewModal, setShowViewModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showRenameModal, setShowRenameModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [viewUrl, setViewUrl] = useState('')

  // Upload form state
  const [uploadFile, setUploadFile] = useState(null)
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDocType, setUploadDocType] = useState('other')
  const [uploadVisible, setUploadVisible] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  // Edit state
  const [editTitle, setEditTitle] = useState('')

  // Toast state
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })

  const fileInputRef = useRef(null)
  const dropZoneRef = useRef(null)

  // Load documents on mount
  useEffect(() => {
    loadDocuments()
  }, [isInDemoMode, userProfile?.building_id])

  const loadDocuments = async () => {
    if (isInDemoMode) {
      setDocuments(DEMO_DOCUMENTS)
      setLoading(false)
      return
    }

    const buildingId = userProfile?.building_id
    if (!buildingId) {
      setDocuments([])
      setLoading(false)
      return
    }

    try {
      const data = await getDocuments(buildingId, true)
      setDocuments(data || [])
    } catch (err) {
      console.error('[ManagerDocuments] Error loading documents:', err)
      showToast('Failed to load documents', 'error')
    } finally {
      setLoading(false)
    }
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type })
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000)
  }

  // Filter documents
  const getFilteredDocuments = () => {
    let filtered = [...documents]

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(doc =>
        doc.title.toLowerCase().includes(query)
      )
    }

    if (filterType !== 'all') {
      filtered = filtered.filter(doc => doc.doc_type === filterType)
    }

    return filtered
  }

  // Group documents by type
  const getGroupedDocuments = () => {
    const filtered = getFilteredDocuments()
    const grouped = {}

    Object.keys(DOC_TYPE_LABELS).forEach(type => {
      const typeDocs = filtered.filter(doc => doc.doc_type === type)
      if (typeDocs.length > 0) {
        grouped[type] = typeDocs
      }
    })

    return grouped
  }

  // Stats
  const stats = {
    total: documents.length,
    visible: documents.filter(d => d.is_visible).length,
    hidden: documents.filter(d => !d.is_visible).length,
    bylaws: documents.filter(d => d.doc_type === 'bylaws').length
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Please select a PDF file', 'error')
        return
      }
      setUploadFile(file)
      if (!uploadTitle) {
        // Default title from filename without extension
        setUploadTitle(file.name.replace(/\.pdf$/i, ''))
      }
    }
  }

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.add('drag-over')
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.remove('drag-over')
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    dropZoneRef.current?.classList.remove('drag-over')

    const file = e.dataTransfer.files?.[0]
    if (file) {
      if (file.type !== 'application/pdf') {
        showToast('Please drop a PDF file', 'error')
        return
      }
      setUploadFile(file)
      if (!uploadTitle) {
        setUploadTitle(file.name.replace(/\.pdf$/i, ''))
      }
    }
  }

  // Handle upload
  const handleUpload = async () => {
    if (!uploadFile || !uploadTitle.trim()) {
      showToast('Please select a file and enter a title', 'error')
      return
    }

    if (isInDemoMode) {
      // Simulate upload in demo mode
      setUploading(true)
      setUploadProgress(0)

      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 100) {
            clearInterval(progressInterval)
            return 100
          }
          return prev + 20
        })
      }, 200)

      setTimeout(() => {
        const newDoc = {
          id: crypto.randomUUID(),
          title: uploadTitle.trim(),
          doc_type: uploadDocType,
          file_path: `demo/${crypto.randomUUID()}.pdf`,
          mime_type: 'application/pdf',
          file_size: uploadFile.size,
          is_visible: uploadVisible,
          created_at: new Date().toISOString()
        }
        setDocuments(prev => [newDoc, ...prev])
        resetUploadForm()
        setShowUploadModal(false)
        showToast('Document uploaded successfully')
      }, 1200)
      return
    }

    const buildingId = userProfile?.building_id
    if (!buildingId) {
      showToast('Building not found', 'error')
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      // Simulate progress (actual upload doesn't provide progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90))
      }, 200)

      const newDoc = await uploadDocument({
        buildingId,
        file: uploadFile,
        title: uploadTitle.trim(),
        docType: uploadDocType,
        isVisible: uploadVisible,
        createdBy: user?.id
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      setDocuments(prev => [newDoc, ...prev])
      resetUploadForm()
      setShowUploadModal(false)
      showToast('Document uploaded successfully')
    } catch (err) {
      console.error('[ManagerDocuments] Upload error:', err)
      showToast(err.message || 'Failed to upload document', 'error')
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const resetUploadForm = () => {
    setUploadFile(null)
    setUploadTitle('')
    setUploadDocType('other')
    setUploadVisible(true)
    setUploading(false)
    setUploadProgress(0)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle view document
  const handleView = async (doc) => {
    if (isInDemoMode) {
      showToast('Document preview not available in demo mode', 'error')
      return
    }

    try {
      const url = await getSignedUrl(doc.file_path)
      setViewUrl(url)
      setSelectedDocument(doc)
      setShowViewModal(true)
    } catch (err) {
      console.error('[ManagerDocuments] View error:', err)
      showToast('Failed to load document', 'error')
    }
  }

  // Handle download
  const handleDownload = async (doc) => {
    if (isInDemoMode) {
      showToast('Download not available in demo mode', 'error')
      return
    }

    try {
      const url = await getSignedUrl(doc.file_path)
      const link = document.createElement('a')
      link.href = url
      link.download = `${doc.title}.pdf`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('[ManagerDocuments] Download error:', err)
      showToast('Failed to download document', 'error')
    }
  }

  // Handle visibility toggle
  const handleToggleVisibility = async (doc) => {
    if (isInDemoMode) {
      setDocuments(prev => prev.map(d =>
        d.id === doc.id ? { ...d, is_visible: !d.is_visible } : d
      ))
      showToast(`Document ${doc.is_visible ? 'hidden from' : 'visible to'} residents`)
      return
    }

    try {
      await updateDocument(doc.id, { is_visible: !doc.is_visible })
      setDocuments(prev => prev.map(d =>
        d.id === doc.id ? { ...d, is_visible: !d.is_visible } : d
      ))
      showToast(`Document ${doc.is_visible ? 'hidden from' : 'visible to'} residents`)
    } catch (err) {
      console.error('[ManagerDocuments] Toggle visibility error:', err)
      showToast('Failed to update visibility', 'error')
    }
  }

  // Handle rename
  const openRenameModal = (doc) => {
    setSelectedDocument(doc)
    setEditTitle(doc.title)
    setShowRenameModal(true)
  }

  const handleRename = async () => {
    if (!editTitle.trim()) {
      showToast('Please enter a title', 'error')
      return
    }

    if (isInDemoMode) {
      setDocuments(prev => prev.map(d =>
        d.id === selectedDocument.id ? { ...d, title: editTitle.trim() } : d
      ))
      setShowRenameModal(false)
      showToast('Document renamed')
      return
    }

    try {
      await updateDocument(selectedDocument.id, { title: editTitle.trim() })
      setDocuments(prev => prev.map(d =>
        d.id === selectedDocument.id ? { ...d, title: editTitle.trim() } : d
      ))
      setShowRenameModal(false)
      showToast('Document renamed')
    } catch (err) {
      console.error('[ManagerDocuments] Rename error:', err)
      showToast('Failed to rename document', 'error')
    }
  }

  // Handle delete
  const openDeleteModal = (doc) => {
    setSelectedDocument(doc)
    setShowDeleteModal(true)
  }

  const handleDelete = async () => {
    if (isInDemoMode) {
      setDocuments(prev => prev.filter(d => d.id !== selectedDocument.id))
      setShowDeleteModal(false)
      showToast('Document deleted')
      return
    }

    try {
      await deleteDocument(selectedDocument)
      setDocuments(prev => prev.filter(d => d.id !== selectedDocument.id))
      setShowDeleteModal(false)
      showToast('Document deleted')
    } catch (err) {
      console.error('[ManagerDocuments] Delete error:', err)
      showToast('Failed to delete document', 'error')
    }
  }

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const filteredDocuments = getFilteredDocuments()
  const groupedDocuments = filterType === 'all' ? getGroupedDocuments() : null

  // Loading state
  if (loading) {
    return (
      <div className="manager-documents">
        <div className="documents-loading">
          <Loader2 size={32} className="spin" />
          <p>Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="manager-documents">
      {/* Header */}
      <div className="documents-header">
        <div className="documents-header-left">
          <h2>Building Documents</h2>
          <p>Upload and manage documents for your building</p>
        </div>
        <button className="upload-btn" onClick={() => setShowUploadModal(true)}>
          <Upload size={18} />
          Upload Document
        </button>
      </div>

      {/* Stats Row */}
      <div className="documents-stats">
        <div className="stat-card stat-blue">
          <div className="stat-icon">
            <FileText size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.total}</span>
            <span className="stat-label">Total Documents</span>
          </div>
        </div>
        <div className="stat-card stat-green">
          <div className="stat-icon">
            <Eye size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.visible}</span>
            <span className="stat-label">Visible to Residents</span>
          </div>
        </div>
        <div className="stat-card stat-yellow">
          <div className="stat-icon">
            <FileWarning size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.hidden}</span>
            <span className="stat-label">Hidden</span>
          </div>
        </div>
        <div className="stat-card stat-purple">
          <div className="stat-icon">
            <ScrollText size={20} />
          </div>
          <div className="stat-content">
            <span className="stat-value">{stats.bylaws}</span>
            <span className="stat-label">Bylaws & Rules</span>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="documents-toolbar">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="filter-wrapper">
          <button
            className={`filter-btn ${showFilterMenu ? 'active' : ''}`}
            onClick={() => setShowFilterMenu(!showFilterMenu)}
          >
            <Filter size={16} />
            {filterType === 'all' ? 'All Types' : DOC_TYPE_LABELS[filterType]}
            <ChevronDown size={14} />
          </button>
          {showFilterMenu && (
            <div className="filter-menu">
              <button
                className={filterType === 'all' ? 'active' : ''}
                onClick={() => { setFilterType('all'); setShowFilterMenu(false) }}
              >
                All Types
              </button>
              {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => (
                <button
                  key={key}
                  className={filterType === key ? 'active' : ''}
                  onClick={() => { setFilterType(key); setShowFilterMenu(false) }}
                >
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Documents List */}
      <div className="documents-content">
        {filteredDocuments.length === 0 ? (
          <div className="documents-empty">
            <FileText size={48} />
            <h3>No Documents</h3>
            <p>
              {searchQuery || filterType !== 'all'
                ? 'No documents match your filters'
                : 'Upload building documents for your residents'}
            </p>
            {!searchQuery && filterType === 'all' && (
              <button className="empty-upload-btn" onClick={() => setShowUploadModal(true)}>
                <Upload size={18} />
                Upload Building Documents
              </button>
            )}
          </div>
        ) : filterType === 'all' && groupedDocuments ? (
          // Grouped view
          Object.entries(groupedDocuments).map(([type, docs]) => (
            <div key={type} className="document-group">
              <div className="group-header">
                <span
                  className="group-badge"
                  style={{ backgroundColor: DOC_TYPE_COLORS[type] }}
                >
                  {DOC_TYPE_LABELS[type]}
                </span>
                <span className="group-count">{docs.length} document{docs.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="documents-list">
                {docs.map(doc => (
                  <DocumentRow
                    key={doc.id}
                    doc={doc}
                    onView={() => handleView(doc)}
                    onDownload={() => handleDownload(doc)}
                    onToggleVisibility={() => handleToggleVisibility(doc)}
                    onRename={() => openRenameModal(doc)}
                    onDelete={() => openDeleteModal(doc)}
                    formatDate={formatDate}
                  />
                ))}
              </div>
            </div>
          ))
        ) : (
          // Flat list view
          <div className="documents-list">
            {filteredDocuments.map(doc => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                onView={() => handleView(doc)}
                onDownload={() => handleDownload(doc)}
                onToggleVisibility={() => handleToggleVisibility(doc)}
                onRename={() => openRenameModal(doc)}
                onDelete={() => openDeleteModal(doc)}
                formatDate={formatDate}
                showType
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="modal-overlay" onClick={() => !uploading && setShowUploadModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Upload Document</h3>
              <button
                className="modal-close"
                onClick={() => !uploading && setShowUploadModal(false)}
                disabled={uploading}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              {/* Drop Zone */}
              <div
                ref={dropZoneRef}
                className={`upload-dropzone ${uploadFile ? 'has-file' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadFile ? (
                  <div className="selected-file">
                    <FileCheck size={32} />
                    <span className="file-name">{uploadFile.name}</span>
                    <span className="file-size">{formatFileSize(uploadFile.size)}</span>
                    <button
                      className="remove-file"
                      onClick={(e) => { e.stopPropagation(); setUploadFile(null) }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload size={32} />
                    <p>Drag and drop a PDF file here</p>
                    <span>or click to browse</span>
                  </>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="application/pdf,.pdf"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                />
              </div>

              {/* Title Input */}
              <div className="form-group">
                <label>Document Title</label>
                <input
                  type="text"
                  placeholder="Enter document title"
                  value={uploadTitle}
                  onChange={e => setUploadTitle(e.target.value)}
                />
              </div>

              {/* Doc Type Dropdown */}
              <div className="form-group">
                <label>Document Type</label>
                <select
                  value={uploadDocType}
                  onChange={e => setUploadDocType(e.target.value)}
                >
                  {Object.entries(DOC_TYPE_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              {/* Visibility Toggle */}
              <div className="form-group visibility-toggle">
                <label>Visible to Residents</label>
                <button
                  className={`toggle-btn ${uploadVisible ? 'active' : ''}`}
                  onClick={() => setUploadVisible(!uploadVisible)}
                >
                  {uploadVisible ? <ToggleRight size={24} /> : <ToggleLeft size={24} />}
                  <span>{uploadVisible ? 'Visible' : 'Hidden'}</span>
                </button>
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <span>{uploadProgress}%</span>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button
                className="btn-secondary"
                onClick={() => { resetUploadForm(); setShowUploadModal(false) }}
                disabled={uploading}
              >
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleUpload}
                disabled={!uploadFile || !uploadTitle.trim() || uploading}
              >
                {uploading ? (
                  <>
                    <Loader2 size={18} className="spin" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Upload
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {showViewModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="modal-content view-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedDocument.title}</h3>
              <div className="view-modal-actions">
                <button
                  className="download-btn"
                  onClick={() => handleDownload(selectedDocument)}
                >
                  <Download size={18} />
                  Download
                </button>
                <button className="modal-close" onClick={() => setShowViewModal(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="modal-body pdf-viewer">
              <iframe
                src={viewUrl}
                title={selectedDocument.title}
                width="100%"
                height="100%"
              />
            </div>
          </div>
        </div>
      )}

      {/* Rename Modal */}
      {showRenameModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowRenameModal(false)}>
          <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Rename Document</h3>
              <button className="modal-close" onClick={() => setShowRenameModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>Document Title</label>
                <input
                  type="text"
                  placeholder="Enter new title"
                  value={editTitle}
                  onChange={e => setEditTitle(e.target.value)}
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowRenameModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleRename}
                disabled={!editTitle.trim()}
              >
                <CheckCircle size={18} />
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDocument && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content small-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Document</h3>
              <button className="modal-close" onClick={() => setShowDeleteModal(false)}>
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <div className="delete-warning">
                <AlertTriangle size={32} />
                <p>Are you sure you want to delete "{selectedDocument.title}"?</p>
                <span>This action cannot be undone.</span>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete}>
                <Trash2 size={18} />
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast.show && (
        <div className={`toast-notification ${toast.type}`}>
          {toast.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{toast.message}</span>
        </div>
      )}
    </div>
  )
}

// Document Row Component
function DocumentRow({ doc, onView, onDownload, onToggleVisibility, onRename, onDelete, formatDate, showType = false }) {
  const [showActions, setShowActions] = useState(false)

  return (
    <div className={`document-row ${!doc.is_visible ? 'hidden-doc' : ''}`}>
      <div className="document-icon">
        <FileText size={24} />
      </div>
      <div className="document-info">
        <span className="document-title">{doc.title}</span>
        <div className="document-meta">
          {showType && (
            <span
              className="type-badge"
              style={{ backgroundColor: DOC_TYPE_COLORS[doc.doc_type] }}
            >
              {DOC_TYPE_LABELS[doc.doc_type]}
            </span>
          )}
          <span className="document-size">{formatFileSize(doc.file_size)}</span>
          <span className="document-date">{formatDate(doc.created_at)}</span>
          {!doc.is_visible && (
            <span className="hidden-badge">Hidden</span>
          )}
        </div>
      </div>
      <div className="document-actions">
        <button className="action-btn view" onClick={onView} title="View">
          <Eye size={16} />
        </button>
        <button className="action-btn download" onClick={onDownload} title="Download">
          <Download size={16} />
        </button>
        <button
          className={`action-btn visibility ${doc.is_visible ? 'visible' : 'hidden'}`}
          onClick={onToggleVisibility}
          title={doc.is_visible ? 'Hide from residents' : 'Show to residents'}
        >
          {doc.is_visible ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
        </button>
        <div className="more-actions">
          <button
            className="action-btn more"
            onClick={() => setShowActions(!showActions)}
          >
            <Edit3 size={16} />
          </button>
          {showActions && (
            <>
              <div className="actions-backdrop" onClick={() => setShowActions(false)} />
              <div className="actions-menu">
                <button onClick={() => { onRename(); setShowActions(false) }}>
                  <Edit3 size={14} />
                  Rename
                </button>
                <button className="delete" onClick={() => { onDelete(); setShowActions(false) }}>
                  <Trash2 size={14} />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default ManagerDocuments
