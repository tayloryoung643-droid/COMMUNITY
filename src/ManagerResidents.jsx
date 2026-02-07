import { useState, useEffect } from 'react'
import {
  Search,
  UserPlus,
  Download,
  MoreVertical,
  User,
  MessageSquare,
  Mail,
  Trash2,
  RefreshCw,
  X,
  Calendar,
  Phone,
  Home,
  Users,
  SlidersHorizontal,
  ArrowUpAZ,
  ArrowDownAZ,
  Building,
  ChevronDown,
  Check,
  Send,
  Loader2,
  Edit3,
  Plus
} from 'lucide-react'
import './ManagerResidents.css'
import { useAuth } from './contexts/AuthContext'
import { supabase } from './lib/supabase'
import {
  getInvitations,
  addSingleResident,
  sendSingleInvite,
  deleteInvitation,
  sendInviteEmail,
  updateInvitationStatus
} from './services/invitationService'
import ResidentImporter from './ResidentImporter'

// Demo residents data
const DEMO_RESIDENTS = [
  { id: 1, firstName: 'Sarah', lastName: 'Mitchell', unit: '1201', email: 'sarah.mitchell@email.com', phone: '(555) 123-4567', status: 'joined', joinDate: '2024-12-15' },
  { id: 2, firstName: 'Mike', lastName: 'Thompson', unit: '805', email: 'mike.t@email.com', phone: '(555) 234-5678', status: 'joined', joinDate: '2024-11-20' },
  { id: 3, firstName: 'Jessica', lastName: 'Kim', unit: '402', email: 'jkim@email.com', phone: '(555) 345-6789', status: 'joined', joinDate: '2024-12-01' },
  { id: 4, firstName: 'Alex', lastName: 'Rivera', unit: '1104', email: 'alex.rivera@email.com', phone: '(555) 456-7890', status: 'joined', joinDate: '2024-10-15' },
  { id: 5, firstName: 'Chris', lastName: 'Walker', unit: '309', email: 'chris.w@email.com', phone: '(555) 567-8901', status: 'joined', joinDate: '2024-11-05' },
  { id: 6, firstName: 'Emma', lastName: 'Davis', unit: '1507', email: 'emma.davis@email.com', phone: '', status: 'sent', moveInDate: '2025-02-01' },
  { id: 7, firstName: 'James', lastName: 'Lee', unit: '203', email: 'jameslee@email.com', phone: '(555) 678-9012', status: 'not_invited', moveInDate: null },
  { id: 8, firstName: 'Taylor', lastName: 'Young', unit: '612', email: 'taylor.young@email.com', phone: '(555) 789-0123', status: 'joined', joinDate: '2024-09-01' },
  { id: 9, firstName: 'Lisa', lastName: 'Chen', unit: '908', email: 'lisa.chen@email.com', phone: '(555) 890-1234', status: 'joined', joinDate: '2024-12-20' },
  { id: 10, firstName: 'Robert', lastName: 'Martinez', unit: '1102', email: 'r.martinez@email.com', phone: '', status: 'failed', moveInDate: null }
]

function ManagerResidents() {
  const { userProfile, isDemoMode, user } = useAuth()
  const isInDemoMode = isDemoMode || userProfile?.is_demo === true
  const buildingId = userProfile?.building_id

  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addModalTab, setAddModalTab] = useState('single')
  const [openMenuId, setOpenMenuId] = useState(null)
  const [sortBy, setSortBy] = useState('name-asc')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [floorFilter, setFloorFilter] = useState('all')
  const [sendingInviteId, setSendingInviteId] = useState(null)

  // Add single resident form
  const [addForm, setAddForm] = useState({
    firstName: '', lastName: '', unit: '', email: '', phone: '', moveInDate: ''
  })
  const [addFormLoading, setAddFormLoading] = useState(false)

  // All residents (unified from users + invitations)
  const [allResidents, setAllResidents] = useState(isInDemoMode ? DEMO_RESIDENTS : [])
  const [isLoading, setIsLoading] = useState(!isInDemoMode)

  // Fetch unified data
  useEffect(() => {
    if (isInDemoMode) return
    fetchAllResidents()
  }, [isInDemoMode, buildingId]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAllResidents = async () => {
    if (!buildingId) return
    setIsLoading(true)

    try {
      // 1. Fetch joined users
      const { data: activeUsers, error: usersError } = await supabase
        .from('users')
        .select('*')
        .eq('building_id', buildingId)
        .eq('role', 'resident')
        .order('created_at', { ascending: false })

      if (usersError) console.error('[ManagerResidents] Users error:', usersError)

      const joinedEmails = new Set()
      const joined = (activeUsers || []).map(u => {
        const nameParts = (u.full_name || '').split(' ')
        if (u.email) joinedEmails.add(u.email.toLowerCase())
        return {
          id: u.id,
          firstName: nameParts[0] || 'Unknown',
          lastName: nameParts.slice(1).join(' ') || '',
          unit: u.unit_number || '',
          email: u.email || '',
          phone: u.phone || '',
          status: 'joined',
          joinDate: u.created_at ? u.created_at.split('T')[0] : null,
          source: 'users'
        }
      })

      // 2. Fetch invitations (not joined)
      const invitations = await getInvitations(buildingId)
      const invited = (invitations || [])
        .filter(inv => inv.status !== 'joined')
        .filter(inv => !inv.email || !joinedEmails.has(inv.email.toLowerCase()))
        .map(inv => {
          const nameParts = (inv.name || '').split(' ')
          return {
            id: inv.id,
            firstName: nameParts[0] || 'Unknown',
            lastName: nameParts.slice(1).join(' ') || '',
            unit: inv.unit || '',
            email: inv.email || '',
            phone: inv.phone || '',
            status: inv.status || 'not_invited',
            moveInDate: inv.move_in_date || null,
            invitedAt: inv.invited_at ? inv.invited_at.split('T')[0] : null,
            source: 'invitations'
          }
        })

      setAllResidents([...joined, ...invited])
    } catch (err) {
      console.error('[ManagerResidents] Fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  // Helpers
  const getInitials = (firstName, lastName) => {
    return `${firstName?.[0] || '?'}${lastName?.[0] || ''}`.toUpperCase()
  }

  const getFloor = (unit) => {
    if (!unit || unit.length <= 2) return 1
    return parseInt(unit.slice(0, -2)) || 1
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'joined': return { label: 'Joined', className: 'status-joined' }
      case 'sent': return { label: 'Invited', className: 'status-invited' }
      case 'not_invited': return { label: 'Not Yet Invited', className: 'status-not-invited' }
      case 'failed': return { label: 'Invite Failed', className: 'status-failed' }
      case 'pending': return { label: 'Invited', className: 'status-invited' }
      default: return { label: status, className: '' }
    }
  }

  const getStatusDateLabel = (resident) => {
    if (resident.status === 'joined') return `Joined ${formatDate(resident.joinDate)}`
    if (resident.status === 'sent' || resident.status === 'pending') return `Invited ${formatDate(resident.invitedAt)}`
    if (resident.moveInDate) return `Move-in ${formatDate(resident.moveInDate)}`
    return resident.invitedAt ? `Added ${formatDate(resident.invitedAt)}` : ''
  }

  // Unique floors
  const uniqueFloors = [...new Set(allResidents.filter(r => r.unit).map(r => getFloor(r.unit)))].sort((a, b) => a - b)

  // Sort options
  const sortOptions = [
    { id: 'name-asc', label: 'Name (A-Z)', icon: ArrowUpAZ },
    { id: 'name-desc', label: 'Name (Z-A)', icon: ArrowDownAZ },
    { id: 'floor-asc', label: 'Floor (Low to High)', icon: Building },
    { id: 'floor-desc', label: 'Floor (High to Low)', icon: Building },
    { id: 'newest', label: 'Newest First', icon: Calendar },
    { id: 'oldest', label: 'Oldest First', icon: Calendar }
  ]

  // Status counts
  const joinedCount = allResidents.filter(r => r.status === 'joined').length
  const invitedCount = allResidents.filter(r => r.status === 'sent' || r.status === 'pending').length
  const notInvitedCount = allResidents.filter(r => r.status === 'not_invited').length
  const failedCount = allResidents.filter(r => r.status === 'failed').length

  // Filter + Sort
  const filteredResidents = allResidents
    .filter(resident => {
      const searchLower = searchQuery.toLowerCase()
      const fullName = `${resident.firstName} ${resident.lastName}`.toLowerCase()
      const matchesSearch = searchQuery === '' ||
        fullName.includes(searchLower) ||
        resident.unit.includes(searchQuery) ||
        resident.email.toLowerCase().includes(searchLower)

      const matchesFloor = floorFilter === 'all' || getFloor(resident.unit) === parseInt(floorFilter)

      if (activeFilter === 'joined') return matchesSearch && matchesFloor && resident.status === 'joined'
      if (activeFilter === 'invited') return matchesSearch && matchesFloor && (resident.status === 'sent' || resident.status === 'pending')
      if (activeFilter === 'not_invited') return matchesSearch && matchesFloor && resident.status === 'not_invited'
      if (activeFilter === 'failed') return matchesSearch && matchesFloor && resident.status === 'failed'
      return matchesSearch && matchesFloor
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'name-asc': return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        case 'name-desc': return `${b.firstName} ${b.lastName}`.localeCompare(`${a.firstName} ${a.lastName}`)
        case 'floor-asc': return getFloor(a.unit) - getFloor(b.unit) || a.unit.localeCompare(b.unit)
        case 'floor-desc': return getFloor(b.unit) - getFloor(a.unit) || b.unit.localeCompare(a.unit)
        case 'newest': return new Date(b.joinDate || b.invitedAt || 0) - new Date(a.joinDate || a.invitedAt || 0)
        case 'oldest': return new Date(a.joinDate || a.invitedAt || 0) - new Date(b.joinDate || b.invitedAt || 0)
        default: return 0
      }
    })

  // Export CSV
  const handleExport = () => {
    const buildingName = userProfile?.buildings?.name || userProfile?.building_name || 'building'
    const dateStr = new Date().toISOString().split('T')[0]
    const filename = `${buildingName.replace(/\s+/g, '-').toLowerCase()}-residents-${dateStr}.csv`

    const headers = ['Name', 'Unit', 'Email', 'Phone', 'Status', 'Move-in Date']
    const rows = allResidents.map(r => [
      `${r.firstName} ${r.lastName}`,
      r.unit || '',
      r.email || '',
      r.phone || '',
      getStatusBadge(r.status).label,
      r.moveInDate || ''
    ])

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${(cell || '').replace(/"/g, '""')}"`).join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Add single resident
  const handleAddSingle = async () => {
    if (!addForm.firstName || !addForm.lastName) return

    if (isInDemoMode) {
      const newResident = {
        id: Date.now(),
        firstName: addForm.firstName,
        lastName: addForm.lastName,
        unit: addForm.unit,
        email: addForm.email,
        phone: addForm.phone,
        status: 'not_invited',
        moveInDate: addForm.moveInDate || null,
        source: 'invitations'
      }
      setAllResidents(prev => [...prev, newResident])
      resetAddForm()
      setShowAddModal(false)
      return
    }

    setAddFormLoading(true)
    try {
      const fullName = `${addForm.firstName} ${addForm.lastName}`.trim()
      await addSingleResident(buildingId, user?.id, {
        name: fullName,
        email: addForm.email?.trim() || null,
        unit: addForm.unit || null,
        phone: addForm.phone || null,
        moveInDate: addForm.moveInDate || null
      })
      resetAddForm()
      setShowAddModal(false)
      fetchAllResidents()
    } catch (err) {
      console.error('[ManagerResidents] Add error:', err)
      alert(err.message || 'Failed to add resident.')
    } finally {
      setAddFormLoading(false)
    }
  }

  const resetAddForm = () => {
    setAddForm({ firstName: '', lastName: '', unit: '', email: '', phone: '', moveInDate: '' })
  }

  // Send invite for a single row
  const handleSendInviteRow = async (resident) => {
    if (!resident.email || sendingInviteId) return

    if (isInDemoMode) {
      setAllResidents(prev => prev.map(r => r.id === resident.id ? { ...r, status: 'sent' } : r))
      return
    }

    setSendingInviteId(resident.id)
    try {
      const buildingName = userProfile?.buildings?.name || userProfile?.building_name || 'Your Building'
      const fullName = `${resident.firstName} ${resident.lastName}`.trim()
      const result = await sendSingleInvite(resident.id, resident.email, fullName, buildingName)
      if (result.success) {
        setAllResidents(prev => prev.map(r => r.id === resident.id ? { ...r, status: 'sent' } : r))
      } else {
        setAllResidents(prev => prev.map(r => r.id === resident.id ? { ...r, status: 'failed' } : r))
      }
    } catch (err) {
      console.error('[ManagerResidents] Send invite error:', err)
    } finally {
      setSendingInviteId(null)
    }
  }

  // Resend invite (for sent/failed)
  const handleResendInvite = async (resident) => {
    if (!resident.email) return
    setOpenMenuId(null)

    if (isInDemoMode) {
      setAllResidents(prev => prev.map(r => r.id === resident.id ? { ...r, status: 'sent' } : r))
      return
    }

    setSendingInviteId(resident.id)
    try {
      const buildingName = userProfile?.buildings?.name || userProfile?.building_name || 'Your Building'
      const fullName = `${resident.firstName} ${resident.lastName}`.trim()
      const emailResult = await sendInviteEmail(resident.email, fullName, buildingName)
      if (emailResult.success) {
        await updateInvitationStatus(resident.id, 'sent')
        setAllResidents(prev => prev.map(r => r.id === resident.id ? { ...r, status: 'sent' } : r))
      } else {
        await updateInvitationStatus(resident.id, 'failed')
        setAllResidents(prev => prev.map(r => r.id === resident.id ? { ...r, status: 'failed' } : r))
      }
    } catch (err) {
      console.error('[ManagerResidents] Resend error:', err)
    } finally {
      setSendingInviteId(null)
    }
  }

  // Remove resident
  const handleRemoveResident = async (resident) => {
    if (!window.confirm('Are you sure you want to remove this resident?')) {
      setOpenMenuId(null)
      return
    }

    if (isInDemoMode || resident.source !== 'invitations') {
      setAllResidents(prev => prev.filter(r => r.id !== resident.id))
      setOpenMenuId(null)
      return
    }

    try {
      await deleteInvitation(resident.id)
      setAllResidents(prev => prev.filter(r => r.id !== resident.id))
    } catch (err) {
      console.error('[ManagerResidents] Remove error:', err)
      alert(err.message || 'Failed to remove.')
    }
    setOpenMenuId(null)
  }

  // Roster import complete
  const handleRosterComplete = () => {
    setShowAddModal(false)
    fetchAllResidents()
  }

  const handleClickOutside = () => {
    if (openMenuId) setOpenMenuId(null)
    if (showSortMenu) setShowSortMenu(false)
  }

  const getCurrentSortLabel = () => {
    const option = sortOptions.find(o => o.id === sortBy)
    return option ? option.label : 'Sort'
  }

  // Render action menu items based on status
  const renderMenuItems = (resident) => {
    switch (resident.status) {
      case 'joined':
        return (
          <>
            <button className="menu-item"><MessageSquare size={16} /><span>Send Message</span></button>
            <div className="menu-divider" />
            <button className="menu-item danger" onClick={() => handleRemoveResident(resident)}>
              <Trash2 size={16} /><span>Remove</span>
            </button>
          </>
        )
      case 'sent':
      case 'pending':
        return (
          <>
            <button className="menu-item" onClick={() => handleResendInvite(resident)}>
              <RefreshCw size={16} /><span>Resend Invite</span>
            </button>
            <div className="menu-divider" />
            <button className="menu-item danger" onClick={() => handleRemoveResident(resident)}>
              <Trash2 size={16} /><span>Remove</span>
            </button>
          </>
        )
      case 'not_invited':
        return (
          <>
            {resident.email && (
              <button className="menu-item" onClick={() => { setOpenMenuId(null); handleSendInviteRow(resident) }}>
                <Send size={16} /><span>Send Invite</span>
              </button>
            )}
            <div className="menu-divider" />
            <button className="menu-item danger" onClick={() => handleRemoveResident(resident)}>
              <Trash2 size={16} /><span>Remove</span>
            </button>
          </>
        )
      case 'failed':
        return (
          <>
            <button className="menu-item" onClick={() => handleResendInvite(resident)}>
              <RefreshCw size={16} /><span>Resend Invite</span>
            </button>
            <div className="menu-divider" />
            <button className="menu-item danger" onClick={() => handleRemoveResident(resident)}>
              <Trash2 size={16} /><span>Remove</span>
            </button>
          </>
        )
      default:
        return (
          <button className="menu-item danger" onClick={() => handleRemoveResident(resident)}>
            <Trash2 size={16} /><span>Remove</span>
          </button>
        )
    }
  }

  const buildingName = userProfile?.buildings?.name || userProfile?.building_name || 'Your Building'

  return (
    <div className="manager-residents" onClick={handleClickOutside}>
      {/* Header */}
      <div className="residents-header">
        <div className="residents-title-section">
          <h1>Residents</h1>
          <p className="residents-stats">
            <Users size={16} />
            <span><strong>{allResidents.length}</strong> Residents at <strong>{buildingName}</strong> &middot; {joinedCount} joined, {invitedCount} invited, {notInvitedCount} not yet invited</span>
          </p>
        </div>
        <div className="residents-actions">
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={18} />
            <span>Export List</span>
          </button>
          <button className="btn-primary" onClick={() => { setShowAddModal(true); setAddModalTab('single') }}>
            <UserPlus size={18} />
            <span>Add Residents</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="residents-controls">
        <div className="residents-search-row">
          <div className="residents-search">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search by name, unit, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="floor-filter">
            <Building size={16} />
            <select value={floorFilter} onChange={(e) => setFloorFilter(e.target.value)}>
              <option value="all">All Floors</option>
              {uniqueFloors.map(floor => (
                <option key={floor} value={floor}>Floor {floor}</option>
              ))}
            </select>
          </div>

          <div className="sort-dropdown-wrapper">
            <button
              className="sort-dropdown-btn"
              onClick={(e) => { e.stopPropagation(); setShowSortMenu(!showSortMenu) }}
            >
              <SlidersHorizontal size={16} />
              <span>{getCurrentSortLabel()}</span>
              <ChevronDown size={16} className={showSortMenu ? 'rotated' : ''} />
            </button>
            {showSortMenu && (
              <div className="sort-dropdown-menu" onClick={(e) => e.stopPropagation()}>
                {sortOptions.map(option => (
                  <button
                    key={option.id}
                    className={`sort-option ${sortBy === option.id ? 'active' : ''}`}
                    onClick={() => { setSortBy(option.id); setShowSortMenu(false) }}
                  >
                    <option.icon size={16} />
                    <span>{option.label}</span>
                    {sortBy === option.id && <Check size={16} className="check-icon" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="residents-filters">
          <button className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`} onClick={() => setActiveFilter('all')}>
            All <span className="filter-count">{allResidents.length}</span>
          </button>
          <button className={`filter-btn ${activeFilter === 'joined' ? 'active' : ''}`} onClick={() => setActiveFilter('joined')}>
            Joined <span className="filter-count">{joinedCount}</span>
          </button>
          <button className={`filter-btn ${activeFilter === 'invited' ? 'active' : ''}`} onClick={() => setActiveFilter('invited')}>
            Invited <span className="filter-count">{invitedCount}</span>
          </button>
          <button className={`filter-btn ${activeFilter === 'not_invited' ? 'active' : ''}`} onClick={() => setActiveFilter('not_invited')}>
            Not Yet Invited <span className="filter-count">{notInvitedCount}</span>
          </button>
          {failedCount > 0 && (
            <button className={`filter-btn ${activeFilter === 'failed' ? 'active' : ''}`} onClick={() => setActiveFilter('failed')}>
              Failed <span className="filter-count">{failedCount}</span>
            </button>
          )}
        </div>
      </div>

      {/* Residents Grid */}
      {isLoading ? (
        <div className="residents-empty">
          <Loader2 size={32} className="spin" />
          <p>Loading residents...</p>
        </div>
      ) : filteredResidents.length === 0 ? (
        <div className="residents-empty">
          <div className="empty-icon"><Users size={48} /></div>
          <h3>No residents found</h3>
          <p>{searchQuery ? 'Try adjusting your search or filters' : 'Add your first resident to get started'}</p>
          {!searchQuery && (
            <button className="btn-primary" onClick={() => setShowAddModal(true)}>
              <UserPlus size={18} /><span>Add Residents</span>
            </button>
          )}
        </div>
      ) : (
        <div className="residents-grid">
          {filteredResidents.map(resident => {
            const statusBadge = getStatusBadge(resident.status)
            const isSending = sendingInviteId === resident.id
            return (
              <div key={`${resident.source}-${resident.id}`} className="resident-card">
                <div className="resident-card-header">
                  <div className={`resident-avatar ${resident.status}`}>
                    {getInitials(resident.firstName, resident.lastName)}
                  </div>
                  <div className="resident-header-actions">
                    {/* Per-row Send Invite button */}
                    {resident.status === 'not_invited' && resident.email && (
                      <button
                        className="btn-send-invite"
                        onClick={() => handleSendInviteRow(resident)}
                        disabled={isSending}
                      >
                        {isSending ? <Loader2 size={14} className="spin" /> : <Send size={14} />}
                        <span>{isSending ? 'Sending...' : 'Send Invite'}</span>
                      </button>
                    )}
                    <div className="resident-menu-wrapper">
                      <button
                        className="resident-menu-btn"
                        onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === resident.id ? null : resident.id) }}
                      >
                        <MoreVertical size={18} />
                      </button>
                      {openMenuId === resident.id && (
                        <div className="resident-menu" onClick={(e) => e.stopPropagation()}>
                          {renderMenuItems(resident)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="resident-card-body">
                  <h3 className="resident-name">{resident.firstName} {resident.lastName}</h3>
                  <span className={`resident-status ${statusBadge.className}`}>{statusBadge.label}</span>

                  <div className="resident-details">
                    {resident.unit && (
                      <div className="resident-detail"><Home size={14} /><span>Unit {resident.unit}</span></div>
                    )}
                    {resident.email && (
                      <div className="resident-detail"><Mail size={14} /><span>{resident.email}</span></div>
                    )}
                    {resident.phone && (
                      <div className="resident-detail"><Phone size={14} /><span>{resident.phone}</span></div>
                    )}
                    {getStatusDateLabel(resident) && (
                      <div className="resident-detail"><Calendar size={14} /><span>{getStatusDateLabel(resident)}</span></div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Residents Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="invite-modal add-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Add Residents</h2>
              <button className="modal-close" onClick={() => setShowAddModal(false)}>
                <X size={24} />
              </button>
            </div>

            {/* Modal tabs */}
            <div className="add-modal-tabs">
              <button className={`add-modal-tab ${addModalTab === 'single' ? 'active' : ''}`} onClick={() => setAddModalTab('single')}>
                <User size={16} /> Single
              </button>
              <button className={`add-modal-tab ${addModalTab === 'upload' ? 'active' : ''}`} onClick={() => setAddModalTab('upload')}>
                <Plus size={16} /> Upload File
              </button>
              <button className={`add-modal-tab ${addModalTab === 'paste' ? 'active' : ''}`} onClick={() => setAddModalTab('paste')}>
                <Edit3 size={16} /> Paste List
              </button>
            </div>

            <div className="modal-body">
              {addModalTab === 'single' && (
                <>
                  <p className="modal-description">Add a resident to your building roster. You can send them an invite later.</p>
                  <div className="form-row">
                    <div className="form-group">
                      <label>First Name *</label>
                      <input type="text" placeholder="John" value={addForm.firstName} onChange={e => setAddForm(p => ({ ...p, firstName: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Last Name *</label>
                      <input type="text" placeholder="Doe" value={addForm.lastName} onChange={e => setAddForm(p => ({ ...p, lastName: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Unit Number</label>
                      <input type="text" placeholder="e.g. 401" value={addForm.unit} onChange={e => setAddForm(p => ({ ...p, unit: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input type="email" placeholder="john@email.com" value={addForm.email} onChange={e => setAddForm(p => ({ ...p, email: e.target.value }))} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Phone Number</label>
                      <input type="tel" placeholder="(555) 123-4567" value={addForm.phone} onChange={e => setAddForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div className="form-group">
                      <label>Move-in Date</label>
                      <input type="date" value={addForm.moveInDate} onChange={e => setAddForm(p => ({ ...p, moveInDate: e.target.value }))} />
                    </div>
                  </div>
                </>
              )}

              {addModalTab === 'upload' && (
                <ResidentImporter
                  buildingId={buildingId}
                  buildingName={userProfile?.buildings?.name || ''}
                  accessCode=""
                  userId={user?.id}
                  onComplete={handleRosterComplete}
                  compact
                  mode="roster"
                />
              )}

              {addModalTab === 'paste' && (
                <ResidentImporter
                  buildingId={buildingId}
                  buildingName={userProfile?.buildings?.name || ''}
                  accessCode=""
                  userId={user?.id}
                  onComplete={handleRosterComplete}
                  compact
                  mode="roster"
                />
              )}
            </div>

            {addModalTab === 'single' && (
              <div className="modal-footer">
                <button className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button
                  className="btn-primary"
                  onClick={handleAddSingle}
                  disabled={!addForm.firstName || !addForm.lastName || addFormLoading}
                >
                  {addFormLoading ? <><Loader2 size={16} className="spin" /> Adding...</> : <><UserPlus size={16} /> Add Resident</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerResidents
