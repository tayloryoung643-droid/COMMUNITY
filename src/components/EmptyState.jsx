import { Calendar, Package, MessageSquare, Users, ArrowUpDown, ClipboardList } from 'lucide-react'
import './EmptyState.css'

// Map of icon names to components
const iconMap = {
  calendar: Calendar,
  package: Package,
  message: MessageSquare,
  users: Users,
  elevator: ArrowUpDown,
  bulletin: ClipboardList
}

/**
 * Reusable empty state component for when data queries return zero rows
 *
 * @param {string} icon - Icon name: 'calendar', 'package', 'message', 'users', 'elevator', 'bulletin'
 * @param {string} title - Main message (e.g., "No events yet")
 * @param {string} subtitle - Secondary message (e.g., "Check back later for upcoming events")
 * @param {string} ctaLabel - Optional button label (e.g., "Create Event")
 * @param {function} onCta - Optional callback when CTA button is clicked
 */
function EmptyState({ icon = 'calendar', title, subtitle, ctaLabel, onCta }) {
  const IconComponent = iconMap[icon] || Calendar

  return (
    <div className="empty-state-container">
      <div className="empty-state-icon">
        <IconComponent size={48} />
      </div>
      <h3 className="empty-state-title">{title}</h3>
      {subtitle && <p className="empty-state-subtitle">{subtitle}</p>}
      {ctaLabel && onCta && (
        <button className="empty-state-cta" onClick={onCta}>
          {ctaLabel}
        </button>
      )}
    </div>
  )
}

export default EmptyState
