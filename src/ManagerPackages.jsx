import { useState } from 'react'
import {
  Package,
  Plus,
  Search,
  MoreVertical,
  CheckCircle,
  Bell,
  Edit3,
  Trash2,
  X,
  Clock,
  AlertTriangle,
  TrendingUp,
  Filter,
  ChevronDown,
  Send,
  Box,
  Mail
} from 'lucide-react'
import './ManagerPackages.css'

function ManagerPackages() {
  const [activeFilter, setActiveFilter] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [showSortMenu, setShowSortMenu] = useState(false)
  const [showLogModal, setShowLogModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showPickupConfirm, setShowPickupConfirm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState(null)
  const [activeMenu, setActiveMenu] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Form state for logging new package
  const [packageForm, setPackageForm] = useState({
    residentId: '',
    carrier: 'amazon',
    size: 'medium',
    quantity: 1,
    notes: '',
    sendNotification: true
  })

  // Residents list for dropdown
  const residents = [
    { id: 1, name: 'Mike Thompson', unit: '805' },
    { id: 2, name: 'Sarah Mitchell', unit: '1201' },
    { id: 3, name: 'Jessica Kim', unit: '402' },
    { id: 4, name: 'Alex Rivera', unit: '1104' },
    { id: 5, name: 'Chris Walker', unit: '309' },
    { id: 6, name: 'Emma Davis', unit: '1507' },
    { id: 7, name: 'James Lee', unit: '203' },
    { id: 8, name: 'Taylor Young', unit: '612' },
    { id: 9, name: 'Lisa Chen', unit: '608' },
    { id: 10, name: 'Robert Martinez', unit: '1012' },
    { id: 11, name: 'David Park', unit: '1502' },
    { id: 12, name: 'Amanda White', unit: '305' }
  ]

  // Carriers
  const carriers = [
    { id: 'usps', name: 'USPS', color: '#004B87' },
    { id: 'ups', name: 'UPS', color: '#351C15' },
    { id: 'fedex', name: 'FedEx', color: '#4D148C' },
    { id: 'amazon', name: 'Amazon', color: '#FF9900' },
    { id: 'dhl', name: 'DHL', color: '#FFCC00' },
    { id: 'other', name: 'Other', color: '#64748b' }
  ]

  // Package sizes
  const packageSizes = [
    { id: 'envelope', name: 'Small (Envelope)', icon: Mail },
    { id: 'small', name: 'Small Box', icon: Box },
    { id: 'medium', name: 'Medium Box', icon: Package },
    { id: 'large', name: 'Large Box', icon: Package },
    { id: 'xlarge', name: 'Extra Large', icon: Package }
  ]

  // Packages data
  const [packages, setPackages] = useState([
    {
      id: 1,
      residentName: 'Mike Thompson',
      unit: '805',
      carrier: 'ups',
      size: 'medium',
      quantity: 1,
      arrivalDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'pending',
      notes: ''
    },
    {
      id: 2,
      residentName: 'Sarah Mitchell',
      unit: '1201',
      carrier: 'amazon',
      size: 'large',
      quantity: 2,
      arrivalDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'pending',
      notes: ''
    },
    {
      id: 3,
      residentName: 'Jessica Kim',
      unit: '402',
      carrier: 'fedex',
      size: 'medium',
      quantity: 1,
      arrivalDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      status: 'pending',
      notes: 'Fragile - Handle with care'
    },
    {
      id: 4,
      residentName: 'Alex Rivera',
      unit: '1104',
      carrier: 'usps',
      size: 'envelope',
      quantity: 1,
      arrivalDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'pending',
      notes: ''
    },
    {
      id: 5,
      residentName: 'Chris Walker',
      unit: '309',
      carrier: 'amazon',
      size: 'small',
      quantity: 1,
      arrivalDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
      status: 'pending',
      notes: ''
    },
    {
      id: 6,
      residentName: 'Emma Davis',
      unit: '1507',
      carrier: 'ups',
      size: 'large',
      quantity: 1,
      arrivalDate: new Date(Date.now() - 18 * 60 * 60 * 1000),
      status: 'pending',
      notes: ''
    },
    {
      id: 7,
      residentName: 'James Lee',
      unit: '203',
      carrier: 'fedex',
      size: 'medium',
      quantity: 3,
      arrivalDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
      status: 'pending',
      notes: ''
    },
    {
      id: 8,
      residentName: 'Taylor Young',
      unit: '612',
      carrier: 'amazon',
      size: 'medium',
      quantity: 1,
      arrivalDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      status: 'picked_up',
      pickedUpAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      notes: ''
    },
    {
      id: 9,
      residentName: 'Lisa Chen',
      unit: '608',
      carrier: 'usps',
      size: 'envelope',
      quantity: 2,
      arrivalDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      status: 'picked_up',
      pickedUpAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
      notes: ''
    },
    {
      id: 10,
      residentName: 'Robert Martinez',
      unit: '1012',
      carrier: 'ups',
      size: 'large',
      quantity: 1,
      arrivalDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      status: 'picked_up',
      pickedUpAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
      notes: ''
    },
    {
      id: 11,
      residentName: 'David Park',
      unit: '1502',
      carrier: 'dhl',
      size: 'xlarge',
      quantity: 1,
      arrivalDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
      status: 'pending',
      notes: 'Requires signature'
    },
    {
      id: 12,
      residentName: 'Amanda White',
      unit: '305',
      carrier: 'amazon',
      size: 'small',
      quantity: 4,
      arrivalDate: new Date(Date.now() - 30 * 60 * 60 * 1000),
      status: 'pending',
      notes: ''
    }
  ])

  // Calculate stats
  const pendingPackages = packages.filter(p => p.status === 'pending')
  const over48Hours = pendingPackages.filter(p => {
    const hoursWaiting = (Date.now() - p.arrivalDate.getTime()) / (1000 * 60 * 60)
    return hoursWaiting >= 48
  })
  const pickedUpToday = packages.filter(p => {
    if (p.status !== 'picked_up' || !p.pickedUpAt) return false
    const today = new Date()
    const pickupDate = new Date(p.pickedUpAt)
    return pickupDate.toDateString() === today.toDateString()
  })

  // Calculate average wait time for picked up packages
  const avgWaitTime = () => {
    const pickedUp = packages.filter(p => p.status === 'picked_up' && p.pickedUpAt)
    if (pickedUp.length === 0) return '0'
    const totalHours = pickedUp.reduce((sum, p) => {
      return sum + (p.pickedUpAt.getTime() - p.arrivalDate.getTime()) / (1000 * 60 * 60)
    }, 0)
    const avgHours = totalHours / pickedUp.length
    if (avgHours < 24) return `${Math.round(avgHours)} hrs`
    return `${(avgHours / 24).toFixed(1)} days`
  }

  const stats = [
    {
      label: 'Total Pending',
      value: pendingPackages.length,
      icon: Package,
      color: 'blue'
    },
    {
      label: 'Over 48 Hours',
      value: over48Hours.length,
      icon: AlertTriangle,
      color: 'red'
    },
    {
      label: 'Picked Up Today',
      value: pickedUpToday.length,
      icon: CheckCircle,
      color: 'green'
    },
    {
      label: 'Avg Wait Time',
      value: avgWaitTime(),
      icon: Clock,
      color: 'purple'
    }
  ]

  const filters = [
    { id: 'all', label: 'All Packages' },
    { id: 'pending', label: 'Pending Pickup' },
    { id: 'picked_up', label: 'Picked Up' },
    { id: 'over48', label: `Over 48hrs (${over48Hours.length})` }
  ]

  const sortOptions = [
    { id: 'newest', label: 'Newest First' },
    { id: 'oldest', label: 'Oldest First' },
    { id: 'longest', label: 'Longest Wait' },
    { id: 'unit', label: 'By Unit' }
  ]

  // Get hours waiting
  const getHoursWaiting = (arrivalDate) => {
    return (Date.now() - arrivalDate.getTime()) / (1000 * 60 * 60)
  }

  // Format time ago
  const formatTimeAgo = (date) => {
    const hoursAgo = (Date.now() - date.getTime()) / (1000 * 60 * 60)
    if (hoursAgo < 1) return 'Just now'
    if (hoursAgo < 24) return `${Math.round(hoursAgo)} hours ago`
    const daysAgo = Math.floor(hoursAgo / 24)
    if (daysAgo === 1) return 'Yesterday'
    return `${daysAgo} days ago`
  }

  // Format pickup time
  const formatPickupTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  // Get carrier info
  const getCarrier = (carrierId) => {
    return carriers.find(c => c.id === carrierId) || carriers.find(c => c.id === 'other')
  }

  // Filter and sort packages
  const getFilteredPackages = () => {
    let filtered = [...packages]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(p =>
        p.residentName.toLowerCase().includes(query) ||
        p.unit.toLowerCase().includes(query)
      )
    }

    // Apply filter
    if (activeFilter === 'pending') {
      filtered = filtered.filter(p => p.status === 'pending')
    } else if (activeFilter === 'picked_up') {
      filtered = filtered.filter(p => p.status === 'picked_up')
    } else if (activeFilter === 'over48') {
      filtered = filtered.filter(p => p.status === 'pending' && getHoursWaiting(p.arrivalDate) >= 48)
    }

    // Apply sort
    if (sortBy === 'newest') {
      filtered.sort((a, b) => b.arrivalDate - a.arrivalDate)
    } else if (sortBy === 'oldest') {
      filtered.sort((a, b) => a.arrivalDate - b.arrivalDate)
    } else if (sortBy === 'longest') {
      filtered.sort((a, b) => {
        if (a.status === 'picked_up' && b.status === 'pending') return 1
        if (a.status === 'pending' && b.status === 'picked_up') return -1
        return a.arrivalDate - b.arrivalDate
      })
    } else if (sortBy === 'unit') {
      filtered.sort((a, b) => a.unit.localeCompare(b.unit, undefined, { numeric: true }))
    }

    return filtered
  }

  // Show toast
  const showToastMessage = (message) => {
    setToastMessage(message)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  // Reset form
  const resetForm = () => {
    setPackageForm({
      residentId: '',
      carrier: 'amazon',
      size: 'medium',
      quantity: 1,
      notes: '',
      sendNotification: true
    })
  }

  // Handle log new package
  const handleLogPackage = () => {
    const resident = residents.find(r => r.id === parseInt(packageForm.residentId))
    if (!resident) return

    const newPackage = {
      id: Date.now(),
      residentName: resident.name,
      unit: resident.unit,
      carrier: packageForm.carrier,
      size: packageForm.size,
      quantity: packageForm.quantity,
      arrivalDate: new Date(),
      status: 'pending',
      notes: packageForm.notes
    }

    setPackages(prev => [newPackage, ...prev])
    setShowLogModal(false)
    resetForm()
    showToastMessage(`Package logged for ${resident.name} (Unit ${resident.unit})${packageForm.sendNotification ? ' - Notification sent!' : ''}`)
  }

  // Handle mark as picked up
  const handleMarkPickedUp = () => {
    setPackages(prev => prev.map(p => {
      if (p.id === selectedPackage.id) {
        return {
          ...p,
          status: 'picked_up',
          pickedUpAt: new Date()
        }
      }
      return p
    }))
    setShowPickupConfirm(false)
    setSelectedPackage(null)
    showToastMessage('Package marked as picked up!')
  }

  // Handle send reminder
  const handleSendReminder = (pkg) => {
    setActiveMenu(null)
    showToastMessage(`Reminder sent to ${pkg.residentName}!`)
  }

  // Handle delete package
  const handleDeletePackage = () => {
    setPackages(prev => prev.filter(p => p.id !== selectedPackage.id))
    setShowDeleteConfirm(false)
    setSelectedPackage(null)
    showToastMessage('Package deleted')
  }

  // Open edit modal
  const openEditModal = (pkg) => {
    setSelectedPackage(pkg)
    const resident = residents.find(r => r.name === pkg.residentName && r.unit === pkg.unit)
    setPackageForm({
      residentId: resident ? resident.id.toString() : '',
      carrier: pkg.carrier,
      size: pkg.size,
      quantity: pkg.quantity,
      notes: pkg.notes,
      sendNotification: false
    })
    setActiveMenu(null)
    setShowEditModal(true)
  }

  // Handle edit package
  const handleEditPackage = () => {
    const resident = residents.find(r => r.id === parseInt(packageForm.residentId))
    if (!resident) return

    setPackages(prev => prev.map(p => {
      if (p.id === selectedPackage.id) {
        return {
          ...p,
          residentName: resident.name,
          unit: resident.unit,
          carrier: packageForm.carrier,
          size: packageForm.size,
          quantity: packageForm.quantity,
          notes: packageForm.notes
        }
      }
      return p
    }))
    setShowEditModal(false)
    setSelectedPackage(null)
    resetForm()
    showToastMessage('Package updated!')
  }

  const filteredPackages = getFilteredPackages()

  return (
    <div className="manager-packages">
      {/* Header */}
      <div className="packages-header">
        <div className="packages-header-left">
          <h2>Packages</h2>
          <p>Manage building package deliveries</p>
        </div>
        <button className="log-package-btn" onClick={() => setShowLogModal(true)}>
          <Plus size={18} />
          <span>Log New Package</span>
        </button>
      </div>

      {/* Stats Row */}
      <div className="packages-stats">
        {stats.map((stat, index) => (
          <div key={index} className={`stat-card stat-${stat.color}`}>
            <div className="stat-icon">
              <stat.icon size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="packages-toolbar">
        <div className="search-wrapper">
          <Search size={18} />
          <input
            type="text"
            placeholder="Search by name or unit..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="toolbar-right">
          <div className="filter-tabs">
            {filters.map(filter => (
              <button
                key={filter.id}
                className={`filter-tab ${activeFilter === filter.id ? 'active' : ''} ${filter.id === 'over48' && over48Hours.length > 0 ? 'warning' : ''}`}
                onClick={() => setActiveFilter(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="sort-dropdown">
            <button
              className="sort-btn"
              onClick={() => setShowSortMenu(!showSortMenu)}
            >
              <Filter size={16} />
              Sort
              <ChevronDown size={14} />
            </button>
            {showSortMenu && (
              <div className="sort-menu">
                {sortOptions.map(option => (
                  <button
                    key={option.id}
                    className={sortBy === option.id ? 'active' : ''}
                    onClick={() => {
                      setSortBy(option.id)
                      setShowSortMenu(false)
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Packages Grid */}
      <div className="packages-grid">
        {filteredPackages.length === 0 ? (
          <div className="no-packages">
            <Package size={48} />
            <h3>No packages found</h3>
            <p>
              {searchQuery
                ? 'Try a different search term'
                : activeFilter !== 'all'
                  ? 'No packages match this filter'
                  : 'Log a new package to get started'}
            </p>
          </div>
        ) : (
          filteredPackages.map(pkg => {
            const carrier = getCarrier(pkg.carrier)
            const hoursWaiting = getHoursWaiting(pkg.arrivalDate)
            const isOver48 = pkg.status === 'pending' && hoursWaiting >= 48
            const isOver72 = pkg.status === 'pending' && hoursWaiting >= 72

            return (
              <div
                key={pkg.id}
                className={`package-card ${pkg.status} ${isOver48 ? 'overdue' : ''} ${isOver72 ? 'critical' : ''}`}
              >
                {/* Status indicator */}
                {pkg.status === 'pending' && isOver72 && (
                  <div className="status-indicator critical">
                    <AlertTriangle size={14} />
                    <span>Over 72 hrs</span>
                  </div>
                )}
                {pkg.status === 'pending' && isOver48 && !isOver72 && (
                  <div className="status-indicator overdue">
                    <span className="red-dot"></span>
                    <span>Over 48 hrs</span>
                  </div>
                )}
                {pkg.status === 'picked_up' && (
                  <div className="status-indicator picked-up">
                    <CheckCircle size={14} />
                    <span>Picked Up</span>
                  </div>
                )}

                {/* Card Header */}
                <div className="package-card-header">
                  <div className="resident-info">
                    <span className="resident-name">{pkg.residentName}</span>
                    <span className="resident-unit">Unit {pkg.unit}</span>
                  </div>
                  <div className="package-menu-wrapper">
                    <button
                      className="package-menu-btn"
                      onClick={() => setActiveMenu(activeMenu === pkg.id ? null : pkg.id)}
                    >
                      <MoreVertical size={18} />
                    </button>
                    {activeMenu === pkg.id && (
                      <div className="package-menu-dropdown">
                        {pkg.status === 'pending' && (
                          <button onClick={() => {
                            setSelectedPackage(pkg)
                            setActiveMenu(null)
                            setShowPickupConfirm(true)
                          }}>
                            <CheckCircle size={16} />
                            Mark as Picked Up
                          </button>
                        )}
                        {pkg.status === 'pending' && (
                          <button onClick={() => handleSendReminder(pkg)}>
                            <Bell size={16} />
                            Send Reminder
                          </button>
                        )}
                        <button onClick={() => openEditModal(pkg)}>
                          <Edit3 size={16} />
                          Edit Package Info
                        </button>
                        <div className="menu-divider"></div>
                        <button className="delete-btn" onClick={() => {
                          setSelectedPackage(pkg)
                          setActiveMenu(null)
                          setShowDeleteConfirm(true)
                        }}>
                          <Trash2 size={16} />
                          Delete Package
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Package Details */}
                <div className="package-details">
                  <div className="carrier-badge" style={{ background: `${carrier.color}20`, color: carrier.color }}>
                    <Package size={14} />
                    <span>{carrier.name}</span>
                  </div>

                  <div className="package-meta">
                    <div className="meta-item">
                      <Clock size={14} />
                      <span>{formatTimeAgo(pkg.arrivalDate)}</span>
                    </div>
                    {pkg.quantity > 1 && (
                      <div className="meta-item">
                        <Box size={14} />
                        <span>{pkg.quantity} packages</span>
                      </div>
                    )}
                  </div>

                  {pkg.notes && (
                    <div className="package-notes">
                      <span>{pkg.notes}</span>
                    </div>
                  )}

                  {pkg.status === 'picked_up' && pkg.pickedUpAt && (
                    <div className="pickup-time">
                      <CheckCircle size={14} />
                      <span>Picked up at {formatPickupTime(pkg.pickedUpAt)}</span>
                    </div>
                  )}
                </div>

                {/* Quick Actions for pending packages */}
                {pkg.status === 'pending' && (
                  <div className="package-actions">
                    <button
                      className="action-btn primary"
                      onClick={() => {
                        setSelectedPackage(pkg)
                        setShowPickupConfirm(true)
                      }}
                    >
                      <CheckCircle size={16} />
                      Mark Picked Up
                    </button>
                    <button
                      className="action-btn secondary"
                      onClick={() => handleSendReminder(pkg)}
                    >
                      <Bell size={16} />
                      Remind
                    </button>
                  </div>
                )}
              </div>
            )
          })
        )}
      </div>

      {/* Log New Package Modal */}
      {showLogModal && (
        <div className="modal-overlay" onClick={() => setShowLogModal(false)}>
          <div className="modal-content package-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Log New Package Arrival</h3>
              <button className="modal-close" onClick={() => setShowLogModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Resident / Unit *</label>
                <select
                  value={packageForm.residentId}
                  onChange={e => setPackageForm({ ...packageForm, residentId: e.target.value })}
                >
                  <option value="">Select resident...</option>
                  {residents.map(resident => (
                    <option key={resident.id} value={resident.id}>
                      {resident.name} - Unit {resident.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Carrier *</label>
                  <select
                    value={packageForm.carrier}
                    onChange={e => setPackageForm({ ...packageForm, carrier: e.target.value })}
                  >
                    {carriers.map(carrier => (
                      <option key={carrier.id} value={carrier.id}>{carrier.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Package Size</label>
                  <select
                    value={packageForm.size}
                    onChange={e => setPackageForm({ ...packageForm, size: e.target.value })}
                  >
                    {packageSizes.map(size => (
                      <option key={size.id} value={size.id}>{size.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Number of Packages</label>
                <input
                  type="number"
                  min="1"
                  value={packageForm.quantity}
                  onChange={e => setPackageForm({ ...packageForm, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  placeholder="e.g., Fragile, Refrigerated, Requires signature..."
                  value={packageForm.notes}
                  onChange={e => setPackageForm({ ...packageForm, notes: e.target.value })}
                  rows={2}
                />
              </div>

              <div className="form-group checkbox-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={packageForm.sendNotification}
                    onChange={e => setPackageForm({ ...packageForm, sendNotification: e.target.checked })}
                  />
                  <span>Send notification to resident</span>
                </label>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowLogModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleLogPackage}
                disabled={!packageForm.residentId}
              >
                <Package size={18} />
                Log Package
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Package Modal */}
      {showEditModal && selectedPackage && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content package-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Edit Package Info</h3>
              <button className="modal-close" onClick={() => setShowEditModal(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-group">
                <label>Resident / Unit *</label>
                <select
                  value={packageForm.residentId}
                  onChange={e => setPackageForm({ ...packageForm, residentId: e.target.value })}
                >
                  <option value="">Select resident...</option>
                  {residents.map(resident => (
                    <option key={resident.id} value={resident.id}>
                      {resident.name} - Unit {resident.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Carrier *</label>
                  <select
                    value={packageForm.carrier}
                    onChange={e => setPackageForm({ ...packageForm, carrier: e.target.value })}
                  >
                    {carriers.map(carrier => (
                      <option key={carrier.id} value={carrier.id}>{carrier.name}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Package Size</label>
                  <select
                    value={packageForm.size}
                    onChange={e => setPackageForm({ ...packageForm, size: e.target.value })}
                  >
                    {packageSizes.map(size => (
                      <option key={size.id} value={size.id}>{size.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Number of Packages</label>
                <input
                  type="number"
                  min="1"
                  value={packageForm.quantity}
                  onChange={e => setPackageForm({ ...packageForm, quantity: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  placeholder="e.g., Fragile, Refrigerated, Requires signature..."
                  value={packageForm.notes}
                  onChange={e => setPackageForm({ ...packageForm, notes: e.target.value })}
                  rows={2}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button
                className="btn-primary"
                onClick={handleEditPackage}
                disabled={!packageForm.residentId}
              >
                <CheckCircle size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mark as Picked Up Confirmation */}
      {showPickupConfirm && selectedPackage && (
        <div className="modal-overlay" onClick={() => setShowPickupConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Mark as Picked Up</h3>
              <button className="modal-close" onClick={() => setShowPickupConfirm(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="confirm-content">
                <CheckCircle size={48} className="confirm-icon success" />
                <p>Mark package for <strong>{selectedPackage.residentName}</strong> (Unit {selectedPackage.unit}) as picked up?</p>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowPickupConfirm(false)}>
                Cancel
              </button>
              <button className="btn-success" onClick={handleMarkPickedUp}>
                <CheckCircle size={18} />
                Confirm Pickup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && selectedPackage && (
        <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
          <div className="modal-content confirm-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Delete Package</h3>
              <button className="modal-close" onClick={() => setShowDeleteConfirm(false)}>
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              <div className="confirm-content">
                <Trash2 size={48} className="confirm-icon danger" />
                <p>Delete package record for <strong>{selectedPackage.residentName}</strong> (Unit {selectedPackage.unit})?</p>
                <span className="confirm-note">This action cannot be undone.</span>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDeletePackage}>
                <Trash2 size={18} />
                Delete Package
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
      {(activeMenu || showSortMenu) && (
        <div className="menu-backdrop" onClick={() => {
          setActiveMenu(null)
          setShowSortMenu(false)
        }} />
      )}
    </div>
  )
}

export default ManagerPackages
