import { Link } from 'react-router-dom'

export default function OwnerHome() {
  return (
    <div className="anim-slide">
      <div className="text-center mb-2">
        <div style={{ fontSize: '2.5rem' }}>👑</div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Owner Dashboard</h1>
        <p className="text-muted">Business overview & management</p>
      </div>

      {/* Today's summary */}
      <div className="stats-grid mb-2 stagger">
        <div className="stat-card green anim-scale">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹42.8K</div>
          <div className="stat-label">Revenue</div>
        </div>
        <div className="stat-card blue anim-scale">
          <div className="stat-icon">🧾</div>
          <div className="stat-value">86</div>
          <div className="stat-label">Orders</div>
        </div>
        <div className="stat-card purple anim-scale">
          <div className="stat-icon">👥</div>
          <div className="stat-value">52</div>
          <div className="stat-label">Customers</div>
        </div>
        <div className="stat-card orange anim-scale">
          <div className="stat-icon">⭐</div>
          <div className="stat-value">₹497</div>
          <div className="stat-label">Avg Order</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mega-grid stagger">
        <Link to="/owner/analytics" className="mega-btn accent-blue anim-scale">
          <span className="mega-icon">📊</span>
          <span className="mega-label">Analytics</span>
        </Link>
        <Link to="/owner/staff" className="mega-btn accent-green anim-scale">
          <span className="mega-icon">👥</span>
          <span className="mega-label">Staff</span>
        </Link>
        <Link to="/supervisor/inventory" className="mega-btn accent-orange anim-scale">
          <span className="mega-icon">📦</span>
          <span className="mega-label">Inventory</span>
        </Link>
        <Link to="/supervisor/expiry" className="mega-btn accent-red anim-scale">
          <span className="mega-icon">⚠️</span>
          <span className="mega-label">Alerts</span>
        </Link>
      </div>

      {/* AI usage today */}
      <div className="section-header mt-3">
        <span className="section-emoji">🤖</span>
        <h2>AI Usage Today</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon">🎙️</div>
          <div className="stat-value">34</div>
          <div className="stat-label">Voice</div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon">📷</div>
          <div className="stat-value">18</div>
          <div className="stat-label">Scans</div>
        </div>
        <div className="stat-card purple">
          <div className="stat-icon">🤌</div>
          <div className="stat-value">12</div>
          <div className="stat-label">Gestures</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">📝</div>
          <div className="stat-value">6</div>
          <div className="stat-label">OCR Lists</div>
        </div>
      </div>
    </div>
  )
}
