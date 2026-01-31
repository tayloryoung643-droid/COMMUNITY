import { useState, useEffect } from 'react'
import { X, Package } from 'lucide-react'
import { addPackage } from '../services/packageService'
import { getResidents } from '../services/messageService'
import './PackageModal.css'

const CARRIERS = [
  { id: 'amazon', name: 'Amazon' },
  { id: 'usps', name: 'USPS' },
  { id: 'ups', name: 'UPS' },
  { id: 'fedex', name: 'FedEx' },
  { id: 'dhl', name: 'DHL' },
  { id: 'other', name: 'Other' }
]

const PACKAGE_SIZES = [
  { id: 'small', name: 'Small (envelope/small box)' },
  { id: 'medium', name: 'Medium (shoebox)' },
  { id: 'large', name: 'Large (moving box)' },
  { id: 'oversized', name: 'Oversized (furniture)' }
]

function PackageModal({ isOpen, onClose, onSuccess, userProfile, isInDemoMode }) {
  const [form, setForm] = useState({
    residentId: '',
    carrier: 'amazon',
    size: 'medium',
    packageCount: 1,
    notes: '',
    sendNotification: true
  })
  const [residents, setResidents] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [loadingResidents, setLoadingResidents] = useState(true)

  // Load residents when modal opens
  useEffect(() => {
    if (!isOpen) return

    async function loadResidents() {
      if (isInDemoMode) {
        // Demo residents
        setResidents([
          { id: 1, full_name: 'Sarah Mitchell', unit_number: '1201' },
          { id: 2, full_name: 'Mike Thompson', unit_number: '805' },
          { id: 3, full_name: 'Lisa Chen', unit_number: '908' },
          { id: 4, full_name: 'David Park', unit_number: '1502' },
          { id: 5, full_name: 'Emma Davis', unit_number: '603' }
        ])
        setLoadingResidents(false)
        return
      }

      try {
        const data = await getResidents(userProfile?.building_id)
        setResidents(data || [])
      } catch (err) {
        console.error('[PackageModal] Error loading residents:', err)
        setResidents([])
      } finally {
        setLoadingResidents(false)
      }
    }

    loadResidents()
  }, [isOpen, isInDemoMode, userProfile?.building_id])

  const resetForm = () => {
    setForm({
      residentId: '',
      carrier: 'amazon',
      size: 'medium',
      packageCount: 1,
      notes: '',
      sendNotification: true
    })
  }

  const handleSubmit = async () => {
    if (!form.residentId) return

    setIsSubmitting(true)
    const resident = residents.find(r => r.id === form.residentId || r.id === parseInt(form.residentId))

    if (isInDemoMode) {
      // Demo mode: just return demo package data
      const demoPackage = {
        id: Date.now(),
        residentName: resident?.full_name || 'Unknown Resident',
        unit: resident?.unit_number || 'N/A',
        carrier: form.carrier,
        size: form.size,
        quantity: form.packageCount,
        notes: form.notes,
        status: 'pending',
        arrivalDate: new Date()
      }
      resetForm()
      onClose()
      if (onSuccess) onSuccess(demoPackage)
      setIsSubmitting(false)
    } else {
      // Real mode: save to Supabase
      try {
        const packageData = {
          building_id: userProfile.building_id,
          resident_id: form.residentId,
          carrier: form.carrier,
          size: form.size,
          package_count: form.packageCount,
          notes: form.notes,
          status: 'pending',
          arrival_date: new Date().toISOString()
        }

        console.log('[PackageModal] Creating package:', packageData)
        const created = await addPackage(packageData)
        console.log('[PackageModal] Package created:', created)

        resetForm()
        onClose()
        if (onSuccess) onSuccess(created)
      } catch (err) {
        console.error('[PackageModal] Error creating package:', err)
        alert('Failed to log package. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content package-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Log New Package</h3>
          <button className="modal-close" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Resident / Unit *</label>
            <select
              value={form.residentId}
              onChange={e => setForm({ ...form, residentId: e.target.value })}
              disabled={loadingResidents}
            >
              <option value="">
                {loadingResidents ? 'Loading residents...' : 'Select resident...'}
              </option>
              {residents.map(resident => (
                <option key={resident.id} value={resident.id}>
                  {resident.full_name} - Unit {resident.unit_number}
                </option>
              ))}
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Carrier *</label>
              <select
                value={form.carrier}
                onChange={e => setForm({ ...form, carrier: e.target.value })}
              >
                {CARRIERS.map(carrier => (
                  <option key={carrier.id} value={carrier.id}>{carrier.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Package Size</label>
              <select
                value={form.size}
                onChange={e => setForm({ ...form, size: e.target.value })}
              >
                {PACKAGE_SIZES.map(size => (
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
              value={form.packageCount}
              onChange={e => setForm({ ...form, packageCount: parseInt(e.target.value) || 1 })}
            />
          </div>

          <div className="form-group">
            <label>Notes (optional)</label>
            <textarea
              placeholder="e.g., Fragile, Refrigerated, Requires signature..."
              value={form.notes}
              onChange={e => setForm({ ...form, notes: e.target.value })}
              rows={2}
            />
          </div>

          <div className="form-group checkbox-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={form.sendNotification}
                onChange={e => setForm({ ...form, sendNotification: e.target.checked })}
              />
              <span>Send notification to resident</span>
            </label>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!form.residentId || isSubmitting}
          >
            <Package size={18} />
            {isSubmitting ? 'Logging...' : 'Log Package'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PackageModal
