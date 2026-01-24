import './MobileShell.css'

function MobileShell({ children, bottomNav }) {
  return (
    <div className="mobile-shell-wrapper">
      {/* App surface - full width on mobile, phone frame on desktop */}
      <div className="mobile-shell-surface">
        {/* Main content with bottom padding for nav */}
        <div className="mobile-shell-content">
          {children}
        </div>

        {/* Bottom nav fixed to shell */}
        {bottomNav && (
          <div className="mobile-shell-nav">
            {bottomNav}
          </div>
        )}
      </div>
    </div>
  )
}

export default MobileShell
