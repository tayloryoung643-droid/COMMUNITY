import { useState, useRef, useCallback, useEffect } from 'react'
import {
  Upload, FileText, File, X, Sparkles, Loader2, Plus, Trash2, Edit3, Check,
  AlertTriangle, Users, CheckCircle, Send, Copy, Mail, ArrowLeft
} from 'lucide-react'
import {
  parseWithAI, parseCSVFile, parseExcelFile, processInviteBatch, saveInvitations, addToRoster
} from './services/invitationService'
import './ResidentImporter.css'

/**
 * Shared resident importer component used in both Onboarding and Settings.
 *
 * Props:
 *  - buildingId (string) — the building UUID
 *  - buildingName (string) — display name for the building
 *  - accessCode (string) — the building access code
 *  - userId (string) — the current user's auth ID
 *  - onComplete ({ sentCount, savedCount }) — called after invites are processed
 *  - onResidentsReady (residents[]) — optional, called when review data is ready (for onboarding flow)
 *  - compact (boolean) — if true, use less vertical padding (for Settings embed)
 */
function ResidentImporter({ buildingId, buildingName, accessCode, userId, onComplete, onResidentsReady, compact, mode = 'invite' }) {
  // Phase: 'input' | 'review' | 'sending' | 'done'
  const [phase, setPhase] = useState('input')

  // Input tab
  const [activeTab, setActiveTab] = useState('paste')
  const [pastedText, setPastedText] = useState('')
  const [uploadedFile, setUploadedFile] = useState(null)
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickEmails, setQuickEmails] = useState('')
  const fileInputRef = useRef(null)
  const [isDragOver, setIsDragOver] = useState(false)

  // Processing state
  const [isProcessing, setIsProcessing] = useState(false)
  const [processingText, setProcessingText] = useState('')
  const [parseError, setParseError] = useState('')

  // Review state
  const [residents, setResidents] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editValues, setEditValues] = useState({})
  const [selectAll, setSelectAll] = useState(true)

  // Send state
  const [sendProgress, setSendProgress] = useState({ sent: 0, total: 0 })
  const [sendResult, setSendResult] = useState(null)

  // Keep parent updated whenever residents change (for onboarding flow)
  const residentsRef = useRef(residents)
  residentsRef.current = residents
  useEffect(() => {
    if (onResidentsReady && residents.length > 0) {
      onResidentsReady(residents)
    }
  }, [residents]) // eslint-disable-line react-hooks/exhaustive-deps

  // ---- INPUT PHASE ----

  const handleFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) setUploadedFile(file)
  }

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) setUploadedFile(file)
  }, [])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragOver(false), [])

  const removeFile = () => {
    setUploadedFile(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  // Organize with AI — main entry point
  const handleOrganize = async () => {
    setIsProcessing(true)
    setParseError('')
    setProcessingText('AI is organizing your data...')

    try {
      let parsed

      if (activeTab === 'paste' && pastedText.trim()) {
        parsed = await parseWithAI(pastedText)
      } else if (activeTab === 'upload' && uploadedFile) {
        setProcessingText('Reading file...')
        const ext = uploadedFile.name.split('.').pop().toLowerCase()

        let fileResult
        if (ext === 'csv') {
          fileResult = await parseCSVFile(uploadedFile)
        } else if (['xlsx', 'xls'].includes(ext)) {
          fileResult = await parseExcelFile(uploadedFile)
        } else {
          throw new Error('Unsupported file type. Please use CSV or Excel.')
        }

        if (fileResult.needsAI) {
          setProcessingText('AI is organizing your data...')
          parsed = await parseWithAI(fileResult.rawText)
        } else {
          parsed = fileResult.residents
        }
      } else {
        setIsProcessing(false)
        return
      }

      if (!parsed || parsed.length === 0) {
        throw new Error('No residents found. Try a different format.')
      }

      setResidents(parsed)
      setPhase('review')
    } catch (err) {
      console.error('[ResidentImporter] Parse error:', err)
      setParseError(err.message || "Couldn't parse that data. Try reformatting or paste in a simpler format.")
    } finally {
      setIsProcessing(false)
      setProcessingText('')
    }
  }

  // Quick add emails
  const handleQuickAdd = () => {
    const emails = quickEmails.split(/[,\n;]/).map(e => e.trim()).filter(Boolean)
    if (emails.length === 0) return

    const parsed = emails.map((email, i) => {
      const namePart = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
      return {
        id: i + 1,
        name: namePart,
        email,
        unit: '',
        phone: '',
        selected: true,
        hasEmail: true
      }
    })

    setResidents(parsed)
    setPhase('review')
  }

  // ---- REVIEW PHASE ----

  const toggleSelect = (id) => {
    setResidents(prev => prev.map(r => r.id === id ? { ...r, selected: !r.selected } : r))
  }

  const toggleSelectAll = () => {
    const newState = !selectAll
    setSelectAll(newState)
    setResidents(prev => prev.map(r => ({ ...r, selected: newState })))
  }

  const startEdit = (resident) => {
    setEditingId(resident.id)
    setEditValues({ name: resident.name, email: resident.email, unit: resident.unit, phone: resident.phone })
  }

  const saveEdit = () => {
    setResidents(prev => prev.map(r =>
      r.id === editingId
        ? { ...r, ...editValues, hasEmail: !!editValues.email }
        : r
    ))
    setEditingId(null)
    setEditValues({})
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditValues({})
  }

  const deleteResident = (id) => {
    setResidents(prev => prev.filter(r => r.id !== id))
  }

  const readyCount = residents.filter(r => r.selected && r.hasEmail).length
  const noEmailCount = residents.filter(r => !r.hasEmail).length
  const selectedCount = residents.filter(r => r.selected).length

  // ---- SEND PHASE ----

  const handleSend = async () => {
    const toSend = residents.filter(r => r.selected)
    if (toSend.length === 0) return

    setPhase('sending')
    const withEmail = toSend.filter(r => r.hasEmail)
    setSendProgress({ sent: 0, total: withEmail.length })

    try {
      const result = await processInviteBatch(
        buildingId,
        userId,
        toSend,
        buildingName,
        (sent, total) => setSendProgress({ sent, total })
      )
      setSendResult(result)
      setPhase('done')
      if (onComplete) onComplete({ sentCount: result.emailsSent, savedCount: result.totalSaved })
    } catch (err) {
      console.error('[ResidentImporter] Send error:', err)
      setParseError(err.message || 'Failed to send invitations.')
      setPhase('review')
    }
  }

  const handleAddToRoster = async () => {
    const toAdd = residents.filter(r => r.selected)
    if (toAdd.length === 0) return

    setPhase('sending')
    setProcessingText('Adding to roster...')

    try {
      await addToRoster(buildingId, userId, toAdd)
      setSendResult({ totalSaved: toAdd.length, emailsSent: 0, emailsFailed: 0, savedWithoutEmail: 0, isRoster: true })
      setPhase('done')
      if (onComplete) onComplete({ sentCount: 0, savedCount: toAdd.length })
    } catch (err) {
      console.error('[ResidentImporter] Roster error:', err)
      setParseError(err.message || 'Failed to add to roster.')
      setPhase('review')
    }
  }

  const handleSaveWithoutSending = async () => {
    const toSave = residents.filter(r => r.selected)
    if (toSave.length === 0) return

    setPhase('sending')
    setProcessingText('Saving residents...')

    try {
      await saveInvitations(buildingId, userId, toSave)
      setSendResult({ totalSaved: toSave.length, emailsSent: 0, emailsFailed: 0, savedWithoutEmail: toSave.length })
      setPhase('done')
      if (onComplete) onComplete({ sentCount: 0, savedCount: toSave.length })
    } catch (err) {
      console.error('[ResidentImporter] Save error:', err)
      setParseError(err.message || 'Failed to save.')
      setPhase('review')
    }
  }

  const handleReset = () => {
    setPhase('input')
    setResidents([])
    setPastedText('')
    setUploadedFile(null)
    setQuickEmails('')
    setParseError('')
    setSendResult(null)
    setShowQuickAdd(false)
  }

  const codeCopied = useRef(false)
  const [codeCopiedState, setCodeCopiedState] = useState(false)
  const copyCode = () => {
    navigator.clipboard.writeText(accessCode || '')
    setCodeCopiedState(true)
    setTimeout(() => setCodeCopiedState(false), 2000)
  }

  // ============ RENDER ============

  // PHASE: INPUT
  if (phase === 'input') {
    return (
      <div className={`ri-container ${compact ? 'ri-compact' : ''}`}>
        {/* Tabs */}
        <div className="ri-tabs">
          <button className={`ri-tab ${activeTab === 'paste' ? 'active' : ''}`} onClick={() => setActiveTab('paste')}>
            <FileText size={16} />
            <span>Paste Anything</span>
          </button>
          <button className={`ri-tab ${activeTab === 'upload' ? 'active' : ''}`} onClick={() => setActiveTab('upload')}>
            <Upload size={16} />
            <span>Upload File</span>
          </button>
        </div>

        {/* Paste tab */}
        {activeTab === 'paste' && (
          <div className="ri-input-card">
            <textarea
              className="ri-textarea"
              placeholder={"John Smith, Unit 401, john@email.com\n402 - Sarah Johnson (sarah.j@gmail.com)\nMike Wilson lives in 403, mike@wilson.com\n\nPaste from Excel, emails, PDFs, or type manually - any format works!"}
              value={pastedText}
              onChange={(e) => setPastedText(e.target.value)}
              rows={10}
            />
          </div>
        )}

        {/* Upload tab */}
        {activeTab === 'upload' && (
          <div className="ri-input-card">
            {!uploadedFile ? (
              <div
                className={`ri-drop-zone ${isDragOver ? 'drag-over' : ''}`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload size={32} />
                <p className="ri-drop-title">Drop file here or click to upload</p>
                <p className="ri-drop-hint">CSV or Excel files (.csv, .xlsx, .xls)</p>
              </div>
            ) : (
              <div className="ri-file-row">
                <File size={22} />
                <div className="ri-file-info">
                  <span className="ri-file-name">{uploadedFile.name}</span>
                  <span className="ri-file-size">{(uploadedFile.size / 1024).toFixed(1)} KB</span>
                </div>
                <button className="ri-file-remove" onClick={removeFile}><X size={16} /></button>
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

        {/* Error */}
        {parseError && (
          <div className="ri-error">
            <AlertTriangle size={16} />
            <span>{parseError}</span>
          </div>
        )}

        {/* Organize button */}
        <button
          className="ri-organize-btn"
          onClick={handleOrganize}
          disabled={isProcessing || (activeTab === 'paste' ? !pastedText.trim() : !uploadedFile)}
        >
          {isProcessing ? (
            <><Loader2 size={18} className="spin" /> {processingText || 'Processing...'}</>
          ) : (
            <><Sparkles size={18} /> Organize with AI</>
          )}
        </button>

        {/* Quick add */}
        <div className="ri-quick-add-section">
          {!showQuickAdd ? (
            <button className="ri-quick-add-toggle" onClick={() => setShowQuickAdd(true)}>
              Just need to add a few emails?
            </button>
          ) : (
            <div className="ri-quick-add-form">
              <label>Email addresses (comma or newline separated)</label>
              <textarea
                className="ri-quick-textarea"
                value={quickEmails}
                onChange={(e) => setQuickEmails(e.target.value)}
                placeholder="john@email.com, sarah@email.com"
                rows={3}
              />
              <div className="ri-quick-add-actions">
                <button className="ri-btn-primary ri-btn-sm" onClick={handleQuickAdd} disabled={!quickEmails.trim()}>
                  <Plus size={14} /> Add
                </button>
                <button className="ri-btn-ghost ri-btn-sm" onClick={() => setShowQuickAdd(false)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // PHASE: REVIEW
  if (phase === 'review') {
    return (
      <div className={`ri-container ${compact ? 'ri-compact' : ''}`}>
        {/* Header */}
        <div className="ri-review-header">
          <div className="ri-review-title">
            <Users size={22} />
            <div>
              <h3>{residents.length} residents found</h3>
              <p>Review and edit before sending invitations</p>
            </div>
          </div>
        </div>

        {/* Select all */}
        <div className="ri-select-bar">
          <button className="ri-select-all" onClick={toggleSelectAll}>
            <div className={`ri-checkbox ${selectAll ? 'checked' : ''}`}>
              {selectAll && <Check size={12} />}
            </div>
            <span>{selectAll ? 'Deselect All' : 'Select All'}</span>
          </button>
          <span className="ri-select-count">{selectedCount} selected</span>
        </div>

        {/* Table */}
        <div className="ri-table-wrap">
          <table className="ri-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}></th>
                <th>Name</th>
                <th>Unit</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Status</th>
                <th style={{ width: 70 }}></th>
              </tr>
            </thead>
            <tbody>
              {residents.map((r, idx) => (
                <tr key={r.id} className={idx % 2 === 0 ? 'ri-row-even' : ''}>
                  {editingId === r.id ? (
                    <>
                      <td>
                        <div className={`ri-checkbox ${r.selected ? 'checked' : ''}`} onClick={() => toggleSelect(r.id)}>
                          {r.selected && <Check size={12} />}
                        </div>
                      </td>
                      <td><input className="ri-cell-input" value={editValues.name} onChange={e => setEditValues(p => ({ ...p, name: e.target.value }))} /></td>
                      <td><input className="ri-cell-input ri-cell-sm" value={editValues.unit} onChange={e => setEditValues(p => ({ ...p, unit: e.target.value }))} /></td>
                      <td><input className="ri-cell-input" value={editValues.email} onChange={e => setEditValues(p => ({ ...p, email: e.target.value }))} /></td>
                      <td><input className="ri-cell-input ri-cell-sm" value={editValues.phone} onChange={e => setEditValues(p => ({ ...p, phone: e.target.value }))} /></td>
                      <td></td>
                      <td>
                        <div className="ri-row-actions">
                          <button className="ri-action-btn ri-save" onClick={saveEdit}><Check size={14} /></button>
                          <button className="ri-action-btn ri-cancel" onClick={cancelEdit}><X size={14} /></button>
                        </div>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>
                        <div className={`ri-checkbox ${r.selected ? 'checked' : ''}`} onClick={() => toggleSelect(r.id)}>
                          {r.selected && <Check size={12} />}
                        </div>
                      </td>
                      <td>{r.name}</td>
                      <td>{r.unit || '—'}</td>
                      <td>{r.email || '—'}</td>
                      <td>{r.phone || '—'}</td>
                      <td>
                        {r.hasEmail ? (
                          <span className="ri-status ri-status-ready"><CheckCircle size={14} /> Ready</span>
                        ) : (
                          <span className="ri-status ri-status-warn"><AlertTriangle size={14} /> No email</span>
                        )}
                      </td>
                      <td>
                        <div className="ri-row-actions">
                          <button className="ri-action-btn" onClick={() => startEdit(r)}><Edit3 size={14} /></button>
                          <button className="ri-action-btn ri-delete" onClick={() => deleteResident(r.id)}><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="ri-review-summary">
          <span className="ri-summary-ready"><Mail size={14} /> {readyCount} residents ready to invite</span>
          {noEmailCount > 0 && (
            <span className="ri-summary-warn"><AlertTriangle size={14} /> {noEmailCount} without email</span>
          )}
        </div>

        {/* Actions */}
        <div className="ri-review-actions">
          {buildingId && mode === 'roster' && (
            <button className="ri-btn-primary" onClick={handleAddToRoster} disabled={selectedCount === 0}>
              <Plus size={16} /> Add {selectedCount} to Roster
            </button>
          )}
          {buildingId && mode === 'invite' && (
            <>
              <button className="ri-btn-primary" onClick={handleSend} disabled={readyCount === 0}>
                <Send size={16} /> Send {readyCount} Invitation{readyCount !== 1 ? 's' : ''}
              </button>
              <button className="ri-btn-secondary" onClick={handleSaveWithoutSending} disabled={selectedCount === 0}>
                Save without sending
              </button>
            </>
          )}
          <button className="ri-btn-ghost" onClick={handleReset}>
            <ArrowLeft size={14} /> Start over
          </button>
        </div>
      </div>
    )
  }

  // PHASE: SENDING
  if (phase === 'sending') {
    const pct = sendProgress.total > 0 ? Math.round((sendProgress.sent / sendProgress.total) * 100) : 0
    return (
      <div className={`ri-container ${compact ? 'ri-compact' : ''}`}>
        <div className="ri-sending-card">
          <Loader2 size={40} className="spin" />
          <h3>Sending invitation {sendProgress.sent} of {sendProgress.total}...</h3>
          <div className="ri-progress-bar">
            <div className="ri-progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="ri-sending-note">Please don't close this page</p>
        </div>
      </div>
    )
  }

  // PHASE: DONE
  if (phase === 'done' && sendResult) {
    return (
      <div className={`ri-container ${compact ? 'ri-compact' : ''}`}>
        <div className="ri-done-card">
          <div className="ri-done-icon"><CheckCircle size={48} /></div>
          <h3>{sendResult.isRoster
            ? `${sendResult.totalSaved} resident${sendResult.totalSaved !== 1 ? 's' : ''} added!`
            : sendResult.emailsSent > 0
              ? `${sendResult.emailsSent} invitation${sendResult.emailsSent !== 1 ? 's' : ''} sent!`
              : `${sendResult.totalSaved} resident${sendResult.totalSaved !== 1 ? 's' : ''} saved!`
          }</h3>

          {sendResult.savedWithoutEmail > 0 && (
            <p className="ri-done-sub">{sendResult.savedWithoutEmail} residents saved without email</p>
          )}

          {sendResult.emailsFailed > 0 && (
            <p className="ri-done-warn">{sendResult.emailsFailed} emails failed to send</p>
          )}

          {accessCode && (
            <div className="ri-done-code">
              <span>Share your building code:</span>
              <div className="ri-code-box">
                <span className="ri-code-value">{accessCode}</span>
                <button className="ri-code-copy" onClick={copyCode}>
                  {codeCopiedState ? <Check size={16} /> : <Copy size={16} />}
                  {codeCopiedState ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}

          <button className="ri-btn-primary" onClick={handleReset}>
            <Plus size={16} /> Import More Residents
          </button>
        </div>
      </div>
    )
  }

  return null
}

export default ResidentImporter
