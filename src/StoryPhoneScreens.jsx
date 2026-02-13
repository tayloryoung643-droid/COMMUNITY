/* Phone screen components for the "See it in 90 seconds" storytelling section */

// ==========================================
// RESIDENT FLOW SCREENS
// ==========================================

export function ResidentHomeScreen() {
  return (
    <>
      <div className="story-phone-header">
        <div style={{ fontSize: 9, opacity: 0.7 }}>Saturday | 9:30 AM</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>58°</div>
        <div style={{ fontSize: 8, opacity: 0.6 }}>Mostly Clear</div>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 16, opacity: 0.6, marginTop: 2 }}>The George</div>
      </div>
      <div className="story-phone-body">
        <div className="story-phone-section-label">TODAY AT THE GEORGE</div>
        <div className="story-phone-post">
          <div className="story-phone-post-header">
            <div className="story-phone-avatar" style={{ background: '#5a7a6a' }}>F</div>
            <span className="story-phone-author">Faima</span>
            <span className="story-phone-role">· Management</span>
          </div>
          <div className="story-phone-post-text" style={{ fontWeight: 600 }}>Pool Closed for Maintenance</div>
          <div className="story-phone-post-text">The rooftop pool will be closed Jan 15-17...</div>
          <div className="story-phone-actions">
            <span>❤️ 5</span>
            <span>💬 2</span>
          </div>
        </div>
        <div className="story-phone-card">
          <span style={{ fontSize: 12 }}>📅</span>
          <div>
            <div className="story-phone-card-title">Rooftop BBQ</div>
            <div className="story-phone-card-sub">This Saturday, 4 PM</div>
          </div>
        </div>
        <div className="story-phone-card">
          <span style={{ fontSize: 12 }}>📋</span>
          <div>
            <div className="story-phone-card-title">Bulletin Board</div>
            <div className="story-phone-card-sub">5 active listings</div>
          </div>
        </div>
      </div>
      <div className="story-phone-nav">
        <div className="story-phone-nav-item active"><span>🏠</span><span className="story-phone-nav-label">Home</span></div>
        <div className="story-phone-nav-item"><span>📅</span><span className="story-phone-nav-label">Events</span></div>
        <div className="story-phone-nav-item"><span>💬</span><span className="story-phone-nav-label">Community</span></div>
        <div className="story-phone-nav-item"><span>🏢</span><span className="story-phone-nav-label">Building</span></div>
      </div>
    </>
  )
}

export function ResidentAnnouncementScreen() {
  return (
    <>
      <div className="story-phone-header" style={{ paddingBottom: 4 }}>
        <div className="story-phone-title" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10 }}>←</span> Home
        </div>
      </div>
      <div className="story-phone-body">
        <div className="story-phone-post" style={{ border: '1px solid rgba(90, 122, 106, 0.2)' }}>
          <div style={{ marginBottom: 4 }}>
            <span className="story-phone-badge pinned">📌 PINNED</span>
          </div>
          <div className="story-phone-post-header">
            <div className="story-phone-avatar" style={{ background: '#5a7a6a' }}>F</div>
            <span className="story-phone-author">Faima</span>
            <span className="story-phone-role">· Management</span>
          </div>
          <div className="story-phone-post-text" style={{ fontWeight: 600, marginBottom: 2 }}>Pool Closed for Maintenance</div>
          <div className="story-phone-post-text">The rooftop pool will be closed Jan 15-17 for annual maintenance. Sorry for the inconvenience!</div>
          <div style={{ fontSize: 7, color: '#8A8075', marginTop: 4 }}>2 hours ago</div>
          <div className="story-phone-actions">
            <span>❤️ 5</span>
            <span>💬 2</span>
          </div>
        </div>
        <div className="story-phone-post" style={{ opacity: 0.6 }}>
          <div className="story-phone-post-header">
            <div className="story-phone-avatar" style={{ background: '#b8977e' }}>T</div>
            <span className="story-phone-author">Taylor</span>
            <span className="story-phone-role">· Management</span>
          </div>
          <div className="story-phone-post-text" style={{ fontWeight: 600 }}>Welcome to COMMUNITY! 🎉</div>
          <div className="story-phone-post-text">We're excited to launch this app for The George...</div>
        </div>
      </div>
      <div className="story-phone-nav">
        <div className="story-phone-nav-item active"><span>🏠</span><span className="story-phone-nav-label">Home</span></div>
        <div className="story-phone-nav-item"><span>📅</span><span className="story-phone-nav-label">Events</span></div>
        <div className="story-phone-nav-item"><span>💬</span><span className="story-phone-nav-label">Community</span></div>
        <div className="story-phone-nav-item"><span>🏢</span><span className="story-phone-nav-label">Building</span></div>
      </div>
    </>
  )
}

export function ResidentFeedScreen() {
  return (
    <>
      <div className="story-phone-header" style={{ paddingBottom: 6 }}>
        <div className="story-phone-title" style={{ fontSize: 14, fontWeight: 700 }}>Community</div>
        <div style={{ display: 'flex', gap: 4, marginTop: 4 }}>
          <span className="story-phone-filter-pill active">All</span>
          <span className="story-phone-filter-pill">Ask</span>
          <span className="story-phone-filter-pill">Share</span>
        </div>
      </div>
      <div className="story-phone-body">
        <div className="story-phone-post">
          <div className="story-phone-post-header">
            <div className="story-phone-avatar" style={{ background: '#3b82f6' }}>E</div>
            <span className="story-phone-author">Emily C.</span>
            <span className="story-phone-role">· 1205</span>
            <span className="story-phone-badge share" style={{ marginLeft: 'auto' }}>SHARE</span>
          </div>
          <div className="story-phone-post-text">Just moved into unit 1205! Excited to meet everyone. 🎉</div>
          <div className="story-phone-actions">
            <span>❤️ 12</span>
            <span>💬 3</span>
          </div>
        </div>
        <div className="story-phone-post">
          <div className="story-phone-post-header">
            <div className="story-phone-avatar" style={{ background: '#8b5cf6' }}>M</div>
            <span className="story-phone-author">Marcus J.</span>
            <span className="story-phone-role">· 804</span>
            <span className="story-phone-badge ask" style={{ marginLeft: 'auto' }}>ASK</span>
          </div>
          <div className="story-phone-post-text">Does anyone have a ladder I could borrow this weekend?</div>
          <div className="story-phone-actions">
            <span>❤️ 3</span>
            <span>💬 2</span>
          </div>
        </div>
        <div className="story-phone-post" style={{ opacity: 0.5 }}>
          <div className="story-phone-post-header">
            <div className="story-phone-avatar" style={{ background: '#ef4444' }}>S</div>
            <span className="story-phone-author">Sarah M.</span>
            <span className="story-phone-role">· 302</span>
          </div>
          <div className="story-phone-post-text">Found a set of keys in the lobby...</div>
        </div>
      </div>
      <div className="story-phone-nav">
        <div className="story-phone-nav-item"><span>🏠</span><span className="story-phone-nav-label">Home</span></div>
        <div className="story-phone-nav-item"><span>📅</span><span className="story-phone-nav-label">Events</span></div>
        <div className="story-phone-nav-item active"><span>💬</span><span className="story-phone-nav-label">Community</span></div>
        <div className="story-phone-nav-item"><span>🏢</span><span className="story-phone-nav-label">Building</span></div>
      </div>
    </>
  )
}

export function ResidentEventsScreen() {
  return (
    <>
      <div className="story-phone-header" style={{ paddingBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="story-phone-title" style={{ fontSize: 14, fontWeight: 700, marginBottom: 0 }}>Events</div>
          <div style={{ width: 18, height: 18, borderRadius: '50%', background: '#5a7a6a', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>+</div>
        </div>
        <div className="story-phone-section-label" style={{ marginTop: 6 }}>UPCOMING</div>
      </div>
      <div className="story-phone-body">
        <div className="story-phone-event">
          <div className="story-phone-event-icon">📅</div>
          <div style={{ flex: 1 }}>
            <div className="story-phone-event-title">Rooftop BBQ</div>
            <div className="story-phone-event-meta">Sat, Jan 15 · 6 PM</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 2, alignItems: 'center' }}>
              <span className="story-phone-event-tag social">Social</span>
              <span style={{ fontSize: 7, color: '#8A8075' }}>18 going</span>
            </div>
          </div>
          <span className="story-phone-rsvp-btn">RSVP</span>
        </div>
        <div className="story-phone-event">
          <div className="story-phone-event-icon">🧘</div>
          <div style={{ flex: 1 }}>
            <div className="story-phone-event-title">Yoga in the Courtyard</div>
            <div className="story-phone-event-meta">Sun, Jan 12 · 8 AM</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 2, alignItems: 'center' }}>
              <span className="story-phone-event-tag social">Social</span>
              <span style={{ fontSize: 7, color: '#8A8075' }}>12 going</span>
            </div>
          </div>
          <span className="story-phone-rsvp-btn">RSVP</span>
        </div>
        <div className="story-phone-event" style={{ opacity: 0.6 }}>
          <div className="story-phone-event-icon">🏛️</div>
          <div style={{ flex: 1 }}>
            <div className="story-phone-event-title">Building Town Hall</div>
            <div className="story-phone-event-meta">Tue, Jan 20 · 7 PM</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 2, alignItems: 'center' }}>
              <span className="story-phone-event-tag meeting">Meeting</span>
              <span style={{ fontSize: 7, color: '#8A8075' }}>25 going</span>
            </div>
          </div>
        </div>
      </div>
      <div className="story-phone-nav">
        <div className="story-phone-nav-item"><span>🏠</span><span className="story-phone-nav-label">Home</span></div>
        <div className="story-phone-nav-item active"><span>📅</span><span className="story-phone-nav-label">Events</span></div>
        <div className="story-phone-nav-item"><span>💬</span><span className="story-phone-nav-label">Community</span></div>
        <div className="story-phone-nav-item"><span>🏢</span><span className="story-phone-nav-label">Building</span></div>
      </div>
    </>
  )
}

// ==========================================
// MANAGER FLOW SCREENS
// ==========================================

export function ManagerCreateAnnouncementScreen() {
  return (
    <>
      <div className="story-phone-header" style={{ paddingBottom: 4 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="story-phone-title" style={{ marginBottom: 0 }}>New Announcement</div>
          <span style={{ fontSize: 10, color: '#8A8075' }}>✕</span>
        </div>
      </div>
      <div className="story-phone-body" style={{ padding: '4px 10px' }}>
        <div style={{ fontSize: 7, fontWeight: 600, color: '#8A8075', marginBottom: 2 }}>Category</div>
        <div className="story-phone-input" style={{ color: '#1A1A1A' }}>General ▾</div>
        <div style={{ fontSize: 7, fontWeight: 600, color: '#8A8075', marginBottom: 2, marginTop: 4 }}>Title</div>
        <div className="story-phone-input" style={{ color: '#1A1A1A', fontWeight: 600 }}>Pool Closed for Maintenance</div>
        <div style={{ fontSize: 7, fontWeight: 600, color: '#8A8075', marginBottom: 2, marginTop: 4 }}>Message</div>
        <div className="story-phone-textarea">The rooftop pool will be closed Jan 15-17 for annual maintenance. Sorry for the inconvenience!</div>
        <div className="story-phone-toggle-row">
          <span style={{ fontSize: 8, color: '#4A4A4A' }}>Notify all residents</span>
          <div className="story-phone-toggle on" />
        </div>
        <div className="story-phone-btn" style={{ marginTop: 8 }}>Post Announcement</div>
      </div>
    </>
  )
}

export function ResidentPinnedAnnouncementScreen() {
  return (
    <>
      <div className="story-phone-header">
        <div style={{ fontSize: 9, opacity: 0.7 }}>Saturday | 9:30 AM</div>
        <div style={{ fontSize: 18, fontWeight: 700 }}>58°</div>
        <div style={{ fontSize: 8, opacity: 0.6 }}>Mostly Clear</div>
        <div style={{ fontFamily: "'DM Serif Display', Georgia, serif", fontSize: 16, opacity: 0.6, marginTop: 2 }}>The George</div>
      </div>
      <div className="story-phone-body">
        <div className="story-phone-section-label">TODAY AT THE GEORGE</div>
        <div className="story-phone-post" style={{ border: '1px solid rgba(90, 122, 106, 0.25)', background: 'rgba(90, 122, 106, 0.06)' }}>
          <div style={{ marginBottom: 3 }}>
            <span className="story-phone-badge pinned">📌 PINNED</span>
          </div>
          <div className="story-phone-post-header">
            <div className="story-phone-avatar" style={{ background: '#5a7a6a' }}>F</div>
            <span className="story-phone-author">Faima</span>
            <span className="story-phone-role">· Management</span>
          </div>
          <div className="story-phone-post-text" style={{ fontWeight: 600 }}>Pool Closed for Maintenance</div>
          <div className="story-phone-post-text">The rooftop pool will be closed Jan 15-17...</div>
        </div>
        <div className="story-phone-card">
          <span style={{ fontSize: 12 }}>📅</span>
          <div>
            <div className="story-phone-card-title">Rooftop BBQ</div>
            <div className="story-phone-card-sub">This Saturday, 4 PM</div>
          </div>
        </div>
        <div className="story-phone-card">
          <span style={{ fontSize: 12 }}>📋</span>
          <div>
            <div className="story-phone-card-title">Bulletin Board</div>
            <div className="story-phone-card-sub">5 active listings</div>
          </div>
        </div>
      </div>
      <div className="story-phone-nav">
        <div className="story-phone-nav-item active"><span>🏠</span><span className="story-phone-nav-label">Home</span></div>
        <div className="story-phone-nav-item"><span>📅</span><span className="story-phone-nav-label">Events</span></div>
        <div className="story-phone-nav-item"><span>💬</span><span className="story-phone-nav-label">Community</span></div>
        <div className="story-phone-nav-item"><span>🏢</span><span className="story-phone-nav-label">Building</span></div>
      </div>
    </>
  )
}

export function ResidentPostDetailScreen() {
  return (
    <>
      <div className="story-phone-header" style={{ paddingBottom: 4 }}>
        <div className="story-phone-title" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10 }}>←</span> Community
        </div>
      </div>
      <div className="story-phone-body">
        <div className="story-phone-post">
          <div className="story-phone-post-header">
            <div className="story-phone-avatar" style={{ background: '#8b5cf6' }}>M</div>
            <span className="story-phone-author">Marcus J.</span>
            <span className="story-phone-role">· 804</span>
            <span className="story-phone-badge ask" style={{ marginLeft: 'auto' }}>ASK</span>
          </div>
          <div className="story-phone-post-text">Does anyone have a ladder I could borrow this weekend?</div>
          <div className="story-phone-actions">
            <span>❤️ 3</span>
            <span>💬 2</span>
          </div>
        </div>
        <div style={{ padding: '0 2px' }}>
          <div className="story-phone-comment">
            <div className="story-phone-avatar" style={{ background: '#5a7a6a', width: 14, height: 14, fontSize: 7 }}>F</div>
            <div className="story-phone-comment-body">
              <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginBottom: 1 }}>
                <span style={{ fontSize: 8, fontWeight: 600 }}>Faima</span>
                <span style={{ fontSize: 7, color: '#8A8075' }}>· Staff</span>
              </div>
              <div style={{ fontSize: 8, color: '#4A4A4A', lineHeight: 1.4 }}>Hi Marcus! Check the Building Info tab for the elevator booking link.</div>
            </div>
          </div>
          <div className="story-phone-comment">
            <div className="story-phone-avatar" style={{ background: '#ef4444', width: 14, height: 14, fontSize: 7 }}>S</div>
            <div className="story-phone-comment-body">
              <div style={{ display: 'flex', gap: 3, alignItems: 'center', marginBottom: 1 }}>
                <span style={{ fontSize: 8, fontWeight: 600 }}>Sarah M.</span>
                <span style={{ fontSize: 7, color: '#8A8075' }}>· 302</span>
              </div>
              <div style={{ fontSize: 8, color: '#4A4A4A', lineHeight: 1.4 }}>I have one! DM me 😊</div>
            </div>
          </div>
        </div>
      </div>
      <div className="story-phone-reply-bar">
        <div className="story-phone-reply-input">Write a reply...</div>
        <div className="story-phone-send-btn">↑</div>
      </div>
    </>
  )
}

export function ManagerMessagesScreen() {
  return (
    <>
      <div className="story-phone-header" style={{ paddingBottom: 4 }}>
        <div className="story-phone-title" style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ fontSize: 10 }}>←</span> Sarah Mitchell
        </div>
        <div className="story-phone-subtitle">Unit 1201</div>
      </div>
      <div className="story-phone-body" style={{ display: 'flex', flexDirection: 'column', gap: 4, padding: '8px 8px' }}>
        <div className="story-phone-bubble received">
          Hi! I'm having trouble with my key fob. It stopped working this morning.
        </div>
        <div className="story-phone-bubble sent">
          Hi Sarah! I'll reprogram your fob. Can you stop by the office between 9-5?
        </div>
        <div className="story-phone-bubble received">
          Great, I'll come by at lunch. Thanks! 😊
        </div>
        <div className="story-phone-bubble sent">
          Sounds good! I'll have a new one ready for you. 👍
        </div>
      </div>
      <div className="story-phone-reply-bar">
        <div className="story-phone-reply-input">Type a message...</div>
        <div className="story-phone-send-btn">↑</div>
      </div>
    </>
  )
}

export function ManagerEventsScreen() {
  return (
    <>
      <div className="story-phone-header" style={{ paddingBottom: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="story-phone-title" style={{ fontSize: 14, fontWeight: 700, marginBottom: 0 }}>Events</div>
          <div className="story-phone-btn" style={{ width: 'auto', padding: '3px 8px', fontSize: 7 }}>+ Create Event</div>
        </div>
        <div className="story-phone-section-label" style={{ marginTop: 6 }}>UPCOMING</div>
      </div>
      <div className="story-phone-body">
        <div className="story-phone-event">
          <div className="story-phone-event-icon">📅</div>
          <div style={{ flex: 1 }}>
            <div className="story-phone-event-title">Rooftop BBQ</div>
            <div className="story-phone-event-meta">Sat, Jan 15 · 6 PM</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 2, alignItems: 'center' }}>
              <span className="story-phone-event-tag social">Social</span>
              <span style={{ fontSize: 7, color: '#8A8075' }}>18 RSVPs</span>
            </div>
          </div>
        </div>
        <div className="story-phone-event">
          <div className="story-phone-event-icon">🏛️</div>
          <div style={{ flex: 1 }}>
            <div className="story-phone-event-title">Building Town Hall</div>
            <div className="story-phone-event-meta">Tue, Jan 20 · 7 PM</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 2, alignItems: 'center' }}>
              <span className="story-phone-event-tag meeting">Meeting</span>
              <span style={{ fontSize: 7, color: '#8A8075' }}>25 RSVPs</span>
            </div>
          </div>
        </div>
        <div className="story-phone-event">
          <div className="story-phone-event-icon">🧘</div>
          <div style={{ flex: 1 }}>
            <div className="story-phone-event-title">Yoga in the Courtyard</div>
            <div className="story-phone-event-meta">Sun, Jan 12 · 8 AM</div>
            <div style={{ display: 'flex', gap: 4, marginTop: 2, alignItems: 'center' }}>
              <span className="story-phone-event-tag social">Social</span>
              <span style={{ fontSize: 7, color: '#8A8075' }}>12 RSVPs</span>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
