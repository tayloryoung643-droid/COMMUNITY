import { useState, useEffect } from 'react'
import { X, Plus, Check, Wine, Users, Wrench, Megaphone } from 'lucide-react'
import { createEvent, updateEvent } from '../services/eventService'
import './EventModal.css'

const CATEGORIES = [
  { id: 'social', label: 'Social', color: '#8b5cf6', icon: Wine },
  { id: 'meeting', label: 'Meeting', color: '#3b82f6', icon: Users },
  { id: 'maintenance', label: 'Maintenance', color: '#f59e0b', icon: Wrench },
  { id: 'announcement', label: 'Announcement', color: '#10b981', icon: Megaphone }
]

const EMPTY_FORM = {
  title: '',
  description: '',
  date: '',
  time: '',
  endTime: '',
  category: 'social',
  location: '',
  rsvpLimit: '',
  allowRsvp: true
}

function EventModal({ isOpen, onClose, onSuccess, userProfile, isInDemoMode, editingEvent }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isEditing = !!editingEvent

  // Pre-fill form when editing
  useEffect(() => {
    if (editingEvent) {
      setForm({
        title: editingEvent.title || '',
        description: editingEvent.description || '',
        date: editingEvent.date || (editingEvent.start_time ? editingEvent.start_time.split('T')[0] : ''),
        time: editingEvent.event_time || editingEvent.time || '',
        endTime: editingEvent.end_time ? editingEvent.end_time.split('T')[1]?.slice(0, 5) : '',
        category: editingEvent.category || 'social',
        location: editingEvent.location || '',
        rsvpLimit: editingEvent.rsvp_limit || '',
        allowRsvp: editingEvent.allow_rsvp !== false
      })
    } else {
      setForm(EMPTY_FORM)
    }
  }, [editingEvent])

  const resetForm = () => setForm(EMPTY_FORM)

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleSubmit = async () => {
    if (!form.title || !form.date) return

    setIsSubmitting(true)
    const category = CATEGORIES.find(c => c.id === form.category)

    if (isInDemoMode) {
      const demoEvent = {
        id: isEditing ? editingEvent.id : Date.now(),
        date: form.date,
        time: form.time || 'All Day',
        endTime: form.endTime,
        title: form.title,
        description: form.description,
        category: form.category,
        categoryLabel: category.label,
        icon: category.icon,
        color: category.color,
        location: form.location,
        allowRsvp: form.allowRsvp,
        rsvpLimit: form.rsvpLimit ? parseInt(form.rsvpLimit) : null,
        rsvps: []
      }
      resetForm()
      onClose()
      if (onSuccess) onSuccess(demoEvent)
      setIsSubmitting(false)
    } else {
      try {
        const startTime = form.time
          ? `${form.date}T${form.time}:00`
          : `${form.date}T00:00:00`
        const endTime = form.endTime
          ? `${form.date}T${form.endTime}:00`
          : null

        const eventData = {
          title: form.title,
          description: form.description,
          start_time: startTime,
          end_time: endTime,
          event_time: form.time || null,
          category: form.category,
          location: form.location
        }

        if (isEditing) {
          await updateEvent(editingEvent.id, eventData)
        } else {
          await createEvent({
            ...eventData,
            building_id: userProfile.building_id,
            created_by: userProfile.id
          })
        }

        resetForm()
        onClose()
        if (onSuccess) onSuccess()
      } catch (err) {
        console.error(`[EventModal] Error ${isEditing ? 'updating' : 'creating'} event:`, err)
        alert(`Failed to ${isEditing ? 'update' : 'create'} event. Please try again.`)
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-content event-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{isEditing ? 'Edit Event' : 'Create Event'}</h3>
          <button className="modal-close" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="form-group">
            <label>Event Title *</label>
            <input
              type="text"
              placeholder="Enter event title..."
              value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Add event details..."
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <input
                type="date"
                value={form.date}
                onChange={e => setForm({ ...form, date: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Category *</label>
              <select
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="time"
                value={form.time}
                onChange={e => setForm({ ...form, time: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="time"
                value={form.endTime}
                onChange={e => setForm({ ...form, endTime: e.target.value })}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              placeholder="e.g., Party Room, Rooftop, Lobby"
              value={form.location}
              onChange={e => setForm({ ...form, location: e.target.value })}
            />
          </div>

          <div className="form-row rsvp-row">
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={form.allowRsvp}
                  onChange={e => setForm({ ...form, allowRsvp: e.target.checked })}
                />
                <span>Allow RSVPs</span>
              </label>
            </div>
            {form.allowRsvp && (
              <div className="form-group">
                <label>RSVP Limit</label>
                <input
                  type="number"
                  placeholder="No limit"
                  value={form.rsvpLimit}
                  onChange={e => setForm({ ...form, rsvpLimit: e.target.value })}
                />
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!form.title || !form.date || isSubmitting}
          >
            {isEditing ? <Check size={18} /> : <Plus size={18} />}
            {isSubmitting
              ? (isEditing ? 'Saving...' : 'Creating...')
              : (isEditing ? 'Save Changes' : 'Create Event')
            }
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventModal
