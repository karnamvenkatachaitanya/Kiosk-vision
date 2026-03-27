import { Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'

export default function HomePage() {
  const { role, userName } = useStore()

  const greeting = userName ? userName : role === 'guest' ? 'Welcome' : 'Hello'

  return (
    <div className="anim-slide">
      {/* Greeting */}
      <div className="text-center mb-2">
        <div style={{ fontSize: '2.5rem' }}>👋</div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800 }}>{greeting}!</h1>
        <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>How can I help you today?</p>
      </div>

      {/* Primary Actions – MEGA buttons for illiterate users */}
      <div className="mega-grid stagger">
        <Link to="/voice" className="mega-btn accent-blue anim-scale">
          <span className="mega-icon">🎙️</span>
          <span className="mega-label">Voice Order</span>
        </Link>
        <Link to="/browse" className="mega-btn accent-green anim-scale">
          <span className="mega-icon">🛍️</span>
          <span className="mega-label">Browse</span>
        </Link>
        <Link to="/scan" className="mega-btn accent-orange anim-scale">
          <span className="mega-icon">📷</span>
          <span className="mega-label">Scan</span>
        </Link>
        <Link to="/cart" className="mega-btn accent-purple anim-scale">
          <span className="mega-icon">🛒</span>
          <span className="mega-label">My Cart</span>
        </Link>
        <Link to="/map" className="mega-btn accent-yellow anim-scale">
          <span className="mega-icon">🗺️</span>
          <span className="mega-label">Find Item</span>
        </Link>
        <Link to="/gesture" className="mega-btn accent-red anim-scale">
          <span className="mega-icon">🤌</span>
          <span className="mega-label">Gestures</span>
        </Link>
      </div>

      {/* Quick access for returning customers */}
      {(role === 'daily_customer') && (
        <div className="mt-3">
          <div className="section-header">
            <span className="section-emoji">⚡</span>
            <h2>Quick Access</h2>
          </div>
          <div className="mega-grid cols-3">
            <Link to="/history" className="mega-btn">
              <span className="mega-icon">📋</span>
              <span className="mega-label">Orders</span>
            </Link>
            <Link to="/browse?wholesale=1" className="mega-btn">
              <span className="mega-icon">💰</span>
              <span className="mega-label">Wholesale</span>
            </Link>
            <Link to="/cart" className="mega-btn">
              <span className="mega-icon">⏩</span>
              <span className="mega-label">Re-order</span>
            </Link>
          </div>
        </div>
      )}

      {/* Role switch for supervisor/owner */}
      {(role === 'supervisor' || role === 'owner') && (
        <div className="mt-3">
          <Link to={role === 'owner' ? '/owner' : '/supervisor'}
            className="btn btn-primary btn-xl btn-full btn-icon">
            🔐 {role === 'owner' ? 'Owner Dashboard' : 'Supervisor Panel'}
          </Link>
        </div>
      )}
    </div>
  )
}
