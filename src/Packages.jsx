import { ArrowLeft, Package, Truck, Mail, CheckCircle } from 'lucide-react'
import './Packages.css'

function Packages({ onBack }) {
  // Fake package data - later this will come from a real database
  const packages = [
    {
      id: 1,
      carrier: "Amazon",
      icon: Package,
      gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
      dateArrived: "2026-01-10",
      status: "Ready for Pickup",
      location: "Mailroom"
    },
    {
      id: 2,
      carrier: "FedEx",
      icon: Truck,
      gradient: "linear-gradient(135deg, #8b5cf6, #ec4899)",
      dateArrived: "2026-01-09",
      status: "Ready for Pickup",
      location: "Front Desk"
    },
    {
      id: 3,
      carrier: "UPS",
      icon: Truck,
      gradient: "linear-gradient(135deg, #10b981, #06b6d4)",
      dateArrived: "2026-01-08",
      status: "Ready for Pickup",
      location: "Locker 5"
    },
    {
      id: 4,
      carrier: "USPS",
      icon: Mail,
      gradient: "linear-gradient(135deg, #3b82f6, #06b6d4)",
      dateArrived: "2026-01-06",
      status: "Picked Up",
      location: "Mailroom"
    },
    {
      id: 5,
      carrier: "Amazon",
      icon: Package,
      gradient: "linear-gradient(135deg, #f59e0b, #ef4444)",
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
      {/* Background orbs */}
      <div className="bg-orb bg-orb-1"></div>
      <div className="bg-orb bg-orb-2"></div>

      <header className="packages-header">
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>
        <h1 className="page-title-light">Packages</h1>
      </header>

      <div className="packages-summary">
        <div className="summary-card">
          <Package size={24} />
          <p className="packages-count">
            {waitingCount === 0
              ? "No packages waiting"
              : `${waitingCount} package${waitingCount === 1 ? '' : 's'} waiting for pickup`}
          </p>
        </div>
      </div>

      <main className="packages-list">
        {packages.map((pkg, index) => {
          const IconComponent = pkg.icon
          return (
            <article
              key={pkg.id}
              className={`package-card ${pkg.status === "Picked Up" ? "picked-up" : ""} animate-in delay-${(index % 6) + 1}`}
            >
              <div className="card-accent"></div>
              <div className="package-header">
                <div className="package-carrier">
                  <div className="carrier-icon-wrapper" style={{ background: pkg.gradient }}>
                    <IconComponent size={22} strokeWidth={2} />
                  </div>
                  <span className="carrier-name">{pkg.carrier}</span>
                </div>
                <span
                  className={`package-status ${pkg.status === "Ready for Pickup" ? "ready" : "completed"}`}
                >
                  {pkg.status === "Picked Up" && <CheckCircle size={14} />}
                  {pkg.status}
                </span>
              </div>

              <div className="package-details">
                <div className="package-detail-item">
                  <span className="detail-label">Arrived</span>
                  <span className="detail-value">
                    {formatDate(pkg.dateArrived)}
                    <span className="detail-secondary">{getDaysAgo(pkg.dateArrived)}</span>
                  </span>
                </div>
                <div className="package-detail-item">
                  <span className="detail-label">Location</span>
                  <span className="detail-value">{pkg.location}</span>
                </div>
              </div>
            </article>
          )
        })}
      </main>
    </div>
  )
}

export default Packages
