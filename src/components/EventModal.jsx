import { useState } from 'react'
import { X, Plus, Wine, Users, Wrench, Megaphone } from 'lucide-react'
import { createEvent, getEvents } from '../services/eventService'
import './EventModal.css'

const CATEGORIES = [
  { id: 'social', label: 'Social', color: '#8b5cf6', icon: Wine },
  { id: 'meeting', label: 'Meeting', color: '#3b82f6', icon: Users },
  { id: 'maintenance', label: 'Maintenance', color: '#f59e0b', icon: Wrench },
  { id: 'announcement', label: 'Announcement', color: '#10b981', icon: Megaphone }
]

function EventModal({ isOpen, onClose, onSuccess, userProfile, isInDemoMode }) {
  const [form, setForm] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    endTime: '',
    category: 'social',
    location: '',
    rsvpLimit: '',
    allowRsvp: true
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const resetForm = () => {
    setForm({
      title: '',
      description: '',
      date: '',
      time: '',
      endTime: '',
      category: 'social',
      location: '',
      rsvpLimit: '',
      allowRsvp: true
    })
  }

  const handleSubmit = async () => {
    if (!form.title || !form.date) return

    setIsSubmitting(true)
    const category = CATEGORIES.find(c => c.id === form.category)

    if (isInDemoMode) {
      // Demo mode: just return demo event data
      const demoEvent = {
        id: Date.now(),
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
      // Real mode: save to Supabase
      try {
        const startTime = form.time
          ? `${form.date}T${form.time}:00`
          : `${form.date}T00:00:00`
        const endTime = form.endTime
          ? `${form.date}T${form.endTime}:00`
          : null

        await createEvent({
          building_id: userProfile.building_id,
          title: form.title,
          description: form.description,
          start_time: startTime,
          end_time: endTime,
          event_time: form.time || null,
          category: form.category,
          location: form.location,
          created_by: userProfile.id
        })

        resetForm()
        onClose()
        if (onSuccess) onSuccess()
      } catch (err) {
        console.error('[EventModal] Error creating event:', err)
        alert('Failed to create event. Please try again.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content event-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create Event</h3>
          <button className="modal-close" onClick={onClose}>
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
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSubmit}
            disabled={!form.title || !form.date || isSubmitting}
          >
            <Plus size={18} />
            {isSubmitting ? 'Creating...' : 'Create Event'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EventModal
