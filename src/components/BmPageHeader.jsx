import './BmPageHeader.css'

/**
 * Shared Building Manager Page Header
 * Displays building background image as a hero header across all BM pages
 * Matches the Resident side pattern for consistency
 */
function BmPageHeader({
  title,
  subtitle,
  backgroundUrl,
  isGreeting = false
}) {
  // Default fallback image
  const defaultImage = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80'
  const imageUrl = backgroundUrl || defaultImage

  return (
    <header className="bm-page-header" style={{ '--header-bg': `url(${imageUrl})` }}>
      <div className="bm-header-image" />
      <div className="bm-header-overlay" />
      <div className="bm-header-gradient" />
      <div className="bm-header-content">
        <h1 className={`bm-header-title ${isGreeting ? 'greeting' : ''}`}>{title}</h1>
        {subtitle && <p className="bm-header-subtitle">{subtitle}</p>}
      </div>
    </header>
  )
}

export default BmPageHeader
