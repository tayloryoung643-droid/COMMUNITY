import { useState, useEffect } from 'react'
import {
  ArrowLeft,
  FileText,
  Search,
  Eye,
  Download,
  Filter,
  ChevronDown,
  Sun,
  Cloud,
  CloudRain,
  Snowflake,
  Moon,
  Loader2,
  X
} from 'lucide-react'
import { useAuth } from './contexts/AuthContext'
import {
  getDocuments,
  getSignedUrl,
  formatFileSize,
  DOC_TYPE_LABELS,
  DOC_TYPE_COLORS
} from './services/buildingDocumentsService'
import './ResidentDocuments.css'

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
  }
]

function ResidentDocuments({ onBack }) {
  const { userProfile, isDemoMode } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true

  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [showFilterMenu, setShowFilterMenu] = useState(false)

  // View modal state
  const [showViewModal, setShowViewModal] = useState(false)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [viewUrl, setViewUrl] = useState('')
  const [loadingView, setLoadingView] = useState(false)

  // Weather and time state
  const [currentTime, setCurrentTime] = useState(new Date())
  const weatherData = {
    temp: 58,
    condition: 'clear',
    conditionText: 'Mostly Clear'
  }

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  const getWeatherIcon = (condition) => {
    const hour = currentTime.getHours()
    const isNight = hour >= 18 || hour < 6
    if (isNight) return Moon
    switch (condition) {
      case 'clear':
      case 'sunny': return Sun
      case 'cloudy': return Cloud
      case 'rainy': return CloudRain
      case 'snowy': return Snowflake
      default: return Sun
    }
  }

  const formatTimeDisplay = (date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
  }

  const formatDayDisplay = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'long' })
  }

  const WeatherIcon = getWeatherIcon(weatherData.condition)

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
      // Pass isManager=false to only get visible documents
      const data = await getDocuments(buildingId, false)
      setDocuments(data || [])
    } catch (err) {
      console.error('[ResidentDocuments] Error loading documents:', err)
      setDocuments([])
    } finally {
      setLoading(false)
    }
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

  // Get available types for filter
  const getAvailableTypes = () => {
    const types = [...new Set(documents.map(d => d.doc_type))]
    return types
  }

  // Handle view document
  const handleView = async (doc) => {
    if (isInDemoMode) {
      alert('Document preview not available in demo mode')
      return
    }

    setLoadingView(true)
    setSelectedDocument(doc)
    setShowViewModal(true)

    try {
      const url = await getSignedUrl(doc.file_path)
      setViewUrl(url)
    } catch (err) {
      console.error('[ResidentDocuments] View error:', err)
      alert('Failed to load document')
      setShowViewModal(false)
    } finally {
      setLoadingView(false)
    }
  }

  // Handle download
  const handleDownload = async (doc) => {
    if (isInDemoMode) {
      alert('Download not available in demo mode')
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
      console.error('[ResidentDocuments] Download error:', err)
      alert('Failed to download document')
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
  const availableTypes = getAvailableTypes()

  // Loading state
  if (loading) {
    return (
      <div className="resident-documents resident-inner-page">
        <div className="inner-page-hero">
          <button className="inner-page-back-btn" onClick={onBack}>
            <ArrowLeft size={20} />
          </button>
          <div className="inner-page-weather">
            <div className="weather-datetime">{formatDayDisplay(currentTime)} | {formatTimeDisplay(currentTime)}</div>
            <div className="weather-temp-row">
              <WeatherIcon size={20} className="weather-icon" />
              <span className="weather-temp">{weatherData.temp}°</span>
            </div>
            <div className="weather-condition">{weatherData.conditionText}</div>
          </div>
          <div className="inner-page-title-container">
            <h1 className="inner-page-title">Documents</h1>
          </div>
        </div>
        <div className="documents-loading-state">
          <Loader2 size={32} className="spin" />
          <p>Loading documents...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="resident-documents resident-inner-page">
      {/* Hero Section */}
      <div className="inner-page-hero">
        <button className="inner-page-back-btn" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <div className="inner-page-weather">
          <div className="weather-datetime">{formatDayDisplay(currentTime)} | {formatTimeDisplay(currentTime)}</div>
          <div className="weather-temp-row">
            <WeatherIcon size={20} className="weather-icon" />
            <span className="weather-temp">{weatherData.temp}°</span>
          </div>
          <div className="weather-condition">{weatherData.conditionText}</div>
        </div>
        <div className="inner-page-title-container">
          <h1 className="inner-page-title">Documents</h1>
        </div>
      </div>

      <main className="resident-documents-content">
        {/* Search Bar */}
        <div className="docs-search-wrapper animate-in delay-1">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Pills */}
        {availableTypes.length > 1 && (
          <div className="docs-filter-pills animate-in delay-2">
            <button
              className={`filter-pill ${filterType === 'all' ? 'active' : ''}`}
              onClick={() => setFilterType('all')}
            >
              All
            </button>
            {availableTypes.map(type => (
              <button
                key={type}
                className={`filter-pill ${filterType === type ? 'active' : ''}`}
                onClick={() => setFilterType(type)}
                style={{ '--pill-color': DOC_TYPE_COLORS[type] }}
              >
                {DOC_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        )}

        {/* Documents List */}
        <div className="docs-list-container">
          {filteredDocuments.length === 0 ? (
            <div className="docs-empty-state animate-in delay-3">
              <FileText size={48} />
              <h3>No Documents</h3>
              <p>
                {searchQuery || filterType !== 'all'
                  ? 'No documents match your search'
                  : 'Building documents will appear here'}
              </p>
            </div>
          ) : filterType === 'all' && groupedDocuments ? (
            // Grouped view
            Object.entries(groupedDocuments).map(([type, docs], groupIndex) => (
              <div key={type} className={`docs-group animate-in delay-${groupIndex + 3}`}>
                <div className="docs-group-header">
                  <span
                    className="group-type-badge"
                    style={{ backgroundColor: DOC_TYPE_COLORS[type] }}
                  >
                    {DOC_TYPE_LABELS[type]}
                  </span>
                  <span className="group-count">{docs.length}</span>
                </div>
                <div className="docs-group-items">
                  {docs.map(doc => (
                    <DocumentCard
                      key={doc.id}
                      doc={doc}
                      onView={() => handleView(doc)}
                      onDownload={() => handleDownload(doc)}
                      formatDate={formatDate}
                    />
                  ))}
                </div>
              </div>
            ))
          ) : (
            // Flat list view
            <div className="docs-flat-list">
              {filteredDocuments.map((doc, index) => (
                <DocumentCard
                  key={doc.id}
                  doc={doc}
                  onView={() => handleView(doc)}
                  onDownload={() => handleDownload(doc)}
                  formatDate={formatDate}
                  showType
                  className={`animate-in delay-${index + 3}`}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* View Modal */}
      {showViewModal && selectedDocument && (
        <div className="docs-modal-overlay" onClick={() => setShowViewModal(false)}>
          <div className="docs-modal-content" onClick={e => e.stopPropagation()}>
            <div className="docs-modal-header">
              <h3>{selectedDocument.title}</h3>
              <div className="docs-modal-actions">
                <button
                  className="docs-download-btn"
                  onClick={() => handleDownload(selectedDocument)}
                >
                  <Download size={18} />
                  Download
                </button>
                <button className="docs-modal-close" onClick={() => setShowViewModal(false)}>
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="docs-modal-body">
              {loadingView ? (
                <div className="docs-loading-view">
                  <Loader2 size={32} className="spin" />
                  <p>Loading document...</p>
                </div>
              ) : (
                <iframe
                  src={viewUrl}
                  title={selectedDocument.title}
                  width="100%"
                  height="100%"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Document Card Component
function DocumentCard({ doc, onView, onDownload, formatDate, showType = false, className = '' }) {
  return (
    <div className={`doc-card ${className}`}>
      <div className="doc-card-icon">
        <FileText size={24} />
      </div>
      <div className="doc-card-content">
        <span className="doc-card-title">{doc.title}</span>
        <div className="doc-card-meta">
          {showType && (
            <span
              className="doc-type-badge"
              style={{ backgroundColor: DOC_TYPE_COLORS[doc.doc_type] }}
            >
              {DOC_TYPE_LABELS[doc.doc_type]}
            </span>
          )}
          <span className="doc-size">{formatFileSize(doc.file_size)}</span>
          <span className="doc-date">{formatDate(doc.created_at)}</span>
        </div>
      </div>
      <div className="doc-card-actions">
        <button className="doc-action-btn" onClick={onView} title="View">
          <Eye size={18} />
        </button>
        <button className="doc-action-btn" onClick={onDownload} title="Download">
          <Download size={18} />
        </button>
      </div>
    </div>
  )
}

export default ResidentDocuments
