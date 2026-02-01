import './BmPageHeader.css'

/**
 * BM Page Header - EXACT COPY of Resident hero section
 * Only difference: gradient fades to dark theme instead of cream
 */
function BmPageHeader({
  title,
  subtitle,
  backgroundUrl
}) {
  // Default fallback image (same as Resident side)
  const defaultImage = 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=80'
  const heroImageUrl = backgroundUrl || defaultImage

  return (
    <section className="bm-hero-section">
      <div className="bm-hero-image-container">
        {/* THE SAME building image - sharp in the hero */}
        <img
          src={heroImageUrl}
          alt="Building"
          className="bm-hero-image"
        />
        <div className="bm-hero-warm-overlay"></div>
        <div className="bm-hero-gradient-overlay"></div>

        {/* Page Title - Centered in Hero */}
        <div className="bm-hero-text-container">
          <h1 className="bm-hero-title">{title}</h1>
          {subtitle && <p className="bm-hero-subtitle">{subtitle}</p>}
        </div>
      </div>
    </section>
  )
}

export default BmPageHeader
