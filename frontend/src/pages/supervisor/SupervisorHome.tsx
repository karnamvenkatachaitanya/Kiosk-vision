import { Link } from 'react-router-dom'

export default function SupervisorHome() {
  return (
    <div className="anim-slide">
      <div className="text-center mb-2">
        <div style={{ fontSize: '2.5rem' }}>🧑‍💼</div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>Supervisor</h1>
        <p className="text-muted">Manage billing, inventory & stock</p>
      </div>

      <div className="mega-grid stagger">
        <Link to="/supervisor/billing" className="mega-btn accent-green anim-scale">
          <span className="mega-icon">🧾</span>
          <span className="mega-label">Billing</span>
        </Link>
        <Link to="/scan" className="mega-btn accent-blue anim-scale">
          <span className="mega-icon">📊</span>
          <span className="mega-label">Barcode</span>
        </Link>
        <Link to="/supervisor/inventory" className="mega-btn accent-orange anim-scale">
          <span className="mega-icon">📦</span>
          <span className="mega-label">Products</span>
        </Link>
        <Link to="/supervisor/expiry" className="mega-btn accent-red anim-scale">
          <span className="mega-icon">⚠️</span>
          <span className="mega-label">Expiry</span>
        </Link>
      </div>

      {/* Quick stats */}
      <div className="section-header mt-3">
        <span className="section-emoji">📊</span>
        <h2>Today</h2>
      </div>
      <div className="stats-grid">
        <div className="stat-card green">
          <div className="stat-icon">🧾</div>
          <div className="stat-value">28</div>
          <div className="stat-label">Bills</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹14.2K</div>
          <div className="stat-label">Sales</div>
        </div>
        <div className="stat-card orange">
          <div className="stat-icon">📦</div>
          <div className="stat-value">5</div>
          <div className="stat-label">Low Stock</div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon">⚠️</div>
          <div className="stat-value">3</div>
          <div className="stat-label">Expiring</div>
        </div>
      </div>
    </div>
  )
}
