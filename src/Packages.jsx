import './Packages.css'

function Packages({ onBack }) {
  // Fake package data - later this will come from a real database
  const packages = [
    {
      id: 1,
      carrier: "Amazon",
      carrierIcon: "📦",
      dateArrived: "2026-01-10",
      status: "Ready for Pickup",
      location: "Mailroom"
    },
    {
      id: 2,
      carrier: "FedEx",
      carrierIcon: "📮",
      dateArrived: "2026-01-09",
      status: "Ready for Pickup",
      location: "Front Desk"
    },
    {
      id: 3,
      carrier: "UPS",
      carrierIcon: "📫",
      dateArrived: "2026-01-08",
      status: "Ready for Pickup",
      location: "Locker 5"
    },
    {
      id: 4,
      carrier: "USPS",
      carrierIcon: "✉️",
      dateArrived: "2026-01-06",
      status: "Picked Up",
      location: "Mailroom"
    },
    {
      id: 5,
      carrier: "Amazon",
      carrierIcon: "📦",
      dateArrived: "2026-01-05",
      status: "Picked Up",
      location: "Locker 3"
    }
  ]

  // Count packages waiting for pickup
  const waitingPackages = packages.filter(pkg => pkg.status === "Ready for Pickup")
  const waitingCount = waitingPackages.length

  // Helper function to format dates nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const options = { month: 'short', day: 'numeric', year: 'numeric' }
    return date.toLocaleDateString('en-US', options)
  }

  // Helper function to get days since arrival
  const getDaysAgo = (dateString) => {
    const today = new Date('2026-01-10') // Using a fixed date for demo
    const arrivedDate = new Date(dateString)
    const diffTime = today - arrivedDate
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Yesterday"
    return `${diffDays} days ago`
  }

  return (
    <div className="packages-container">
      <header className="packages-header">
        <button className="back-button" onClick={onBack}>
          ← Back
        </button>
        <h1 className="page-title">Packages</h1>
      </header>

      <div className="packages-summary">
        <p className="packages-count">
          {waitingCount === 0
            ? "No packages waiting"
            : `You have ${waitingCount} package${waitingCount === 1 ? '' : 's'} waiting`}
        </p>
      </div>

      <main className="packages-list">
        {packages.map((pkg) => (
          <article
            key={pkg.id}
            className={`package-card ${pkg.status === "Picked Up" ? "picked-up" : ""}`}
          >
            <div className="package-header">
              <div className="package-carrier">
                <span className="carrier-icon">{pkg.carrierIcon}</span>
                <span className="carrier-name">{pkg.carrier}</span>
              </div>
              <span
                className={`package-status ${pkg.status === "Ready for Pickup" ? "ready" : "completed"}`}
              >
                {pkg.status}
              </span>
            </div>

            <div className="package-details">
              <div className="package-detail-item">
                <span className="detail-label">Arrived:</span>
                <span className="detail-value">
                  {formatDate(pkg.dateArrived)} ({getDaysAgo(pkg.dateArrived)})
                </span>
              </div>
              <div className="package-detail-item">
                <span className="detail-label">Location:</span>
                <span className="detail-value">{pkg.location}</span>
              </div>
            </div>
          </article>
        ))}
      </main>
    </div>
  )
}

export default Packages
