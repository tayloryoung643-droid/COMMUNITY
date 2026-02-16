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
  const hasImage = !!backgroundUrl

  return (
    <section className="bm-hero-section">
      <div className="bm-hero-image-container">
        {hasImage ? (
          <>
            <img
              src={backgroundUrl}
              alt="Building"
              className="bm-hero-image"
            />
            <div className="bm-hero-warm-overlay"></div>
            <div className="bm-hero-gradient-overlay"></div>
          </>
        ) : (
          <div className="bm-hero-gradient-fallback"></div>
        )}

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
