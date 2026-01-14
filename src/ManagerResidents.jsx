import { useState } from 'react'
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
  Users
} from 'lucide-react'
import './ManagerResidents.css'

function ManagerResidents() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)

  // Invite form state
  const [inviteForm, setInviteForm] = useState({
    firstName: '',
    lastName: '',
    unit: '',
    email: '',
    phone: '',
    moveInDate: ''
  })

  // Sample residents data
  const [residents, setResidents] = useState([
    {
      id: 1,
      firstName: 'Sarah',
      lastName: 'Mitchell',
      unit: '1201',
      email: 'sarah.mitchell@email.com',
      phone: '(555) 123-4567',
      status: 'active',
      joinDate: '2024-12-15'
    },
    {
      id: 2,
      firstName: 'Mike',
      lastName: 'Thompson',
      unit: '805',
      email: 'mike.t@email.com',
      phone: '(555) 234-5678',
      status: 'active',
      joinDate: '2024-11-20'
    },
    {
      id: 3,
      firstName: 'Jessica',
      lastName: 'Kim',
      unit: '402',
      email: 'jkim@email.com',
      phone: '(555) 345-6789',
      status: 'active',
      joinDate: '2024-12-01'
    },
    {
      id: 4,
      firstName: 'Alex',
      lastName: 'Rivera',
      unit: '1104',
      email: 'alex.rivera@email.com',
      phone: '(555) 456-7890',
      status: 'active',
      joinDate: '2024-10-15'
    },
    {
      id: 5,
      firstName: 'Chris',
      lastName: 'Walker',
      unit: '309',
      email: 'chris.w@email.com',
      phone: '(555) 567-8901',
      status: 'active',
      joinDate: '2024-11-05'
    },
    {
      id: 6,
      firstName: 'Emma',
      lastName: 'Davis',
      unit: '1507',
      email: 'emma.davis@email.com',
      phone: '',
      status: 'pending',
      joinDate: null,
      inviteSent: '2025-01-10'
    },
    {
      id: 7,
      firstName: 'James',
      lastName: 'Lee',
      unit: '203',
      email: 'jameslee@email.com',
      phone: '(555) 678-9012',
      status: 'pending',
      joinDate: null,
      inviteSent: '2025-01-12'
    },
    {
      id: 8,
      firstName: 'Taylor',
      lastName: 'Young',
      unit: '612',
      email: 'taylor.young@email.com',
      phone: '(555) 789-0123',
      status: 'active',
      joinDate: '2024-09-01'
    },
    {
      id: 9,
      firstName: 'Lisa',
      lastName: 'Chen',
      unit: '908',
      email: 'lisa.chen@email.com',
      phone: '(555) 890-1234',
      status: 'active',
      joinDate: '2024-12-20'
    },
    {
      id: 10,
      firstName: 'Robert',
      lastName: 'Martinez',
      unit: '1102',
      email: 'r.martinez@email.com',
      phone: '',
      status: 'inactive',
      joinDate: '2024-06-15',
      inactiveSince: '2024-12-01'
    }
  ])

  // Available units for invite dropdown
  const availableUnits = [
    '101', '102', '201', '202', '301', '302', '401', '501', '502',
    '601', '701', '702', '801', '901', '902', '1001', '1002', '1301',
    '1401', '1402', '1501', '1502', '1503', '1601', '1602'
  ]

  // Get initials from name
  const getInitials = (firstName, lastName) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase()
  }

  // Format date
  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Get status badge info
  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { label: 'Active', className: 'status-active' }
      case 'pending':
        return { label: 'Pending Invite', className: 'status-pending' }
      case 'inactive':
        return { label: 'Inactive', className: 'status-inactive' }
      default:
        return { label: status, className: '' }
    }
  }

  // Filter residents
  const filteredResidents = residents.filter(resident => {
    // Search filter
    const searchLower = searchQuery.toLowerCase()
    const fullName = `${resident.firstName} ${resident.lastName}`.toLowerCase()
    const matchesSearch = searchQuery === '' ||
      fullName.includes(searchLower) ||
      resident.unit.includes(searchQuery) ||
      resident.email.toLowerCase().includes(searchLower)

    // Status filter
    if (activeFilter === 'active') return matchesSearch && resident.status === 'active'
    if (activeFilter === 'pending') return matchesSearch && resident.status === 'pending'
    if (activeFilter === 'inactive') return matchesSearch && resident.status === 'inactive'
    return matchesSearch
  })

  // Stats
  const totalUnits = 50
  const activeCount = residents.filter(r => r.status === 'active').length
  const pendingCount = residents.filter(r => r.status === 'pending').length
  const inactiveCount = residents.filter(r => r.status === 'inactive').length
  const onboardedPercentage = Math.round((activeCount / totalUnits) * 100)

  // Handle invite form change
  const handleInviteChange = (field, value) => {
    setInviteForm(prev => ({ ...prev, [field]: value }))
  }

  // Handle send invite
  const handleSendInvite = () => {
    if (!inviteForm.firstName || !inviteForm.lastName || !inviteForm.unit || !inviteForm.email) {
      return
    }

    const newResident = {
      id: Date.now(),
      firstName: inviteForm.firstName,
      lastName: inviteForm.lastName,
      unit: inviteForm.unit,
      email: inviteForm.email,
      phone: inviteForm.phone,
      status: 'pending',
      joinDate: null,
      inviteSent: new Date().toISOString().split('T')[0]
    }

    setResidents(prev => [...prev, newResident])
    setShowInviteModal(false)
    setInviteForm({
      firstName: '',
      lastName: '',
      unit: '',
      email: '',
      phone: '',
      moveInDate: ''
    })
  }

  // Handle resend invite
  const handleResendInvite = (residentId) => {
    setResidents(prev => prev.map(r =>
      r.id === residentId
        ? { ...r, inviteSent: new Date().toISOString().split('T')[0] }
        : r
    ))
    setOpenMenuId(null)
  }

  // Handle remove resident
  const handleRemoveResident = (residentId) => {
    if (window.confirm('Are you sure you want to remove this resident from the building?')) {
      setResidents(prev => prev.filter(r => r.id !== residentId))
    }
    setOpenMenuId(null)
  }

  // Handle export
  const handleExport = () => {
    alert('Export functionality coming soon!')
  }

  // Close menu when clicking outside
  const handleClickOutside = () => {
    if (openMenuId) setOpenMenuId(null)
  }

  return (
    <div className="manager-residents" onClick={handleClickOutside}>
      {/* Header Section */}
      <div className="residents-header">
        <div className="residents-title-section">
          <h1>Residents</h1>
          <p className="residents-stats">
            <Users size={16} />
            <span><strong>{activeCount}</strong> of <strong>{totalUnits}</strong> residents onboarded ({onboardedPercentage}%)</span>
          </p>
        </div>
        <div className="residents-actions">
          <button className="btn-secondary" onClick={handleExport}>
            <Download size={18} />
            <span>Export List</span>
          </button>
          <button className="btn-primary" onClick={() => setShowInviteModal(true)}>
            <UserPlus size={18} />
            <span>Invite Resident</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="residents-controls">
        <div className="residents-search">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name, unit, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="residents-filters">
          <button
            className={`filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >
            All
            <span className="filter-count">{residents.length}</span>
          </button>
          <button
            className={`filter-btn ${activeFilter === 'active' ? 'active' : ''}`}
            onClick={() => setActiveFilter('active')}
          >
            Active
            <span className="filter-count">{activeCount}</span>
          </button>
          <button
            className={`filter-btn ${activeFilter === 'pending' ? 'active' : ''}`}
            onClick={() => setActiveFilter('pending')}
          >
            Pending Invites
            <span className="filter-count">{pendingCount}</span>
          </button>
          <button
            className={`filter-btn ${activeFilter === 'inactive' ? 'active' : ''}`}
            onClick={() => setActiveFilter('inactive')}
          >
            Inactive
            <span className="filter-count">{inactiveCount}</span>
          </button>
        </div>
      </div>

      {/* Residents Grid */}
      {filteredResidents.length === 0 ? (
        <div className="residents-empty">
          <div className="empty-icon">
            <Users size={48} />
          </div>
          <h3>No residents found</h3>
          <p>
            {searchQuery
              ? 'Try adjusting your search or filters'
              : 'Invite your first resident to get started'}
          </p>
          {!searchQuery && (
            <button className="btn-primary" onClick={() => setShowInviteModal(true)}>
              <UserPlus size={18} />
              <span>Invite Resident</span>
            </button>
          )}
        </div>
      ) : (
        <div className="residents-grid">
          {filteredResidents.map(resident => {
            const statusBadge = getStatusBadge(resident.status)
            return (
              <div key={resident.id} className="resident-card">
                <div className="resident-card-header">
                  <div className={`resident-avatar ${resident.status}`}>
                    {getInitials(resident.firstName, resident.lastName)}
                  </div>
                  <div className="resident-menu-wrapper">
                    <button
                      className="resident-menu-btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setOpenMenuId(openMenuId === resident.id ? null : resident.id)
                      }}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {openMenuId === resident.id && (
                      <div className="resident-menu" onClick={(e) => e.stopPropagation()}>
                        <button className="menu-item">
                          <User size={16} />
                          <span>View Profile</span>
                        </button>
                        <button className="menu-item">
                          <MessageSquare size={16} />
                          <span>Send Message</span>
                        </button>
                        {resident.status === 'pending' && (
                          <button
                            className="menu-item"
                            onClick={() => handleResendInvite(resident.id)}
                          >
                            <RefreshCw size={16} />
                            <span>Resend Invite</span>
                          </button>
                        )}
                        <div className="menu-divider" />
                        <button
                          className="menu-item danger"
                          onClick={() => handleRemoveResident(resident.id)}
                        >
                          <Trash2 size={16} />
                          <span>Remove from Building</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="resident-card-body">
                  <h3 className="resident-name">
                    {resident.firstName} {resident.lastName}
                  </h3>
                  <span className={`resident-status ${statusBadge.className}`}>
                    {statusBadge.label}
                  </span>

                  <div className="resident-details">
                    <div className="resident-detail">
                      <Home size={14} />
                      <span>Unit {resident.unit}</span>
                    </div>
                    <div className="resident-detail">
                      <Mail size={14} />
                      <span>{resident.email}</span>
                    </div>
                    {resident.phone && (
                      <div className="resident-detail">
                        <Phone size={14} />
                        <span>{resident.phone}</span>
                      </div>
                    )}
                    <div className="resident-detail">
                      <Calendar size={14} />
                      <span>
                        {resident.status === 'pending'
                          ? `Invited ${formatDate(resident.inviteSent)}`
                          : resident.status === 'inactive'
                            ? `Inactive since ${formatDate(resident.inactiveSince)}`
                            : `Joined ${formatDate(resident.joinDate)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="invite-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Invite New Resident</h2>
              <button className="modal-close" onClick={() => setShowInviteModal(false)}>
                <X size={24} />
              </button>
            </div>

            <div className="modal-body">
              <p className="modal-description">
                Send an invitation email with your building code so the resident can join the app.
              </p>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input
                    id="firstName"
                    type="text"
                    placeholder="John"
                    value={inviteForm.firstName}
                    onChange={(e) => handleInviteChange('firstName', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input
                    id="lastName"
                    type="text"
                    placeholder="Doe"
                    value={inviteForm.lastName}
                    onChange={(e) => handleInviteChange('lastName', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="unit">Unit Number *</label>
                  <select
                    id="unit"
                    value={inviteForm.unit}
                    onChange={(e) => handleInviteChange('unit', e.target.value)}
                  >
                    <option value="">Select unit...</option>
                    {availableUnits.map(unit => (
                      <option key={unit} value={unit}>Unit {unit}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="email">Email Address *</label>
                  <input
                    id="email"
                    type="email"
                    placeholder="john@email.com"
                    value={inviteForm.email}
                    onChange={(e) => handleInviteChange('email', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="phone">Phone Number</label>
                  <input
                    id="phone"
                    type="tel"
                    placeholder="(555) 123-4567"
                    value={inviteForm.phone}
                    onChange={(e) => handleInviteChange('phone', e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="moveInDate">Move-in Date</label>
                  <input
                    id="moveInDate"
                    type="date"
                    value={inviteForm.moveInDate}
                    onChange={(e) => handleInviteChange('moveInDate', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowInviteModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleSendInvite}
                disabled={!inviteForm.firstName || !inviteForm.lastName || !inviteForm.unit || !inviteForm.email}
              >
                <Mail size={18} />
                <span>Send Invite</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ManagerResidents
