import { ArrowLeft, Calendar, Wrench, ClipboardList, HelpCircle, FileText, User, Settings, Phone, ChevronRight, Home as HomeIcon, MessageSquare, Building2 } from 'lucide-react'
import './Building.css'

function Building({ onBack, onNavigate }) {
  const handleFeatureClick = (featureTitle) => {
    if (onNavigate) {
      onNavigate(featureTitle)
    }
  }

  return (
    <div className="building-container">
      {/* Header */}
      <header className="building-header">
        <button className="back-button-glass" onClick={onBack}>
          <ArrowLeft size={20} />
        </button>
        <h1 className="page-title-light">Building</h1>
      </header>

      {/* Content */}
      <div className="building-content">
        {/* Quick Actions Section */}
        <section className="building-section">
          <h2 className="section-title">Quick Actions</h2>
          <div className="quick-actions-grid">
            <button className="quick-action-card teal" onClick={() => handleFeatureClick('Elevator Booking')}>
              <div className="quick-action-icon">
                <Calendar size={24} />
              </div>
              <span className="quick-action-label">Book Elevator</span>
            </button>
            <button className="quick-action-card orange" onClick={() => handleFeatureClick('Maintenance')}>
              <div className="quick-action-icon">
                <Wrench size={24} />
              </div>
              <span className="quick-action-label">Maintenance Request</span>
            </button>
          </div>
        </section>

        {/* Building Info Section */}
        <section className="building-section">
          <h2 className="section-title">Building Info</h2>
          <div className="list-card">
            <button className="list-item" onClick={() => handleFeatureClick('Bulletin Board')}>
              <div className="list-item-icon">
                <ClipboardList size={20} />
              </div>
              <span className="list-item-label">Bulletin Board</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
            <button className="list-item" onClick={() => handleFeatureClick('BuildingInfo')}>
              <div className="list-item-icon">
                <HelpCircle size={20} />
              </div>
              <span className="list-item-label">Building FAQ</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
            <button className="list-item" onClick={() => handleFeatureClick('Documents')}>
              <div className="list-item-icon">
                <FileText size={20} />
              </div>
              <span className="list-item-label">Documents & Forms</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
          </div>
        </section>

        {/* Account Section */}
        <section className="building-section">
          <h2 className="section-title">Account</h2>
          <div className="list-card">
            <button className="list-item" onClick={() => handleFeatureClick('Profile')}>
              <div className="list-item-icon">
                <User size={20} />
              </div>
              <span className="list-item-label">My Profile</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
            <button className="list-item" onClick={() => handleFeatureClick('Settings')}>
              <div className="list-item-icon">
                <Settings size={20} />
              </div>
              <span className="list-item-label">Settings</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
            <button className="list-item" onClick={() => handleFeatureClick('ContactManagement')}>
              <div className="list-item-icon">
                <Phone size={20} />
              </div>
              <span className="list-item-label">Contact Management</span>
              <ChevronRight size={18} className="list-item-arrow" />
            </button>
          </div>
        </section>
      </div>

    </div>
  )
}

export default Building
