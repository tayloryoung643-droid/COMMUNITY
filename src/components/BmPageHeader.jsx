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
  const defaultImage = 'https://jsjocdxqxfcashrhjbgn.supabase.co/storage/v1/object/public/building-images/5e3b6dae-b373-414e-9707-b6e182525ea6/background.jpg'
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
