import { useLocation, Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'

type Tab = { path: string; icon: string; label: string; badge?: number }

export default function BottomNav() {
  const { pathname } = useLocation()
  const { role, cartItems } = useStore()

  const guestTabs: Tab[] = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/browse', icon: '🛍️', label: 'Shop' },
    { path: '/scan', icon: '📷', label: 'Scan' },
    { path: '/cart', icon: '🛒', label: 'Cart', badge: cartItems.length },
    { path: '/profile', icon: '👤', label: 'Me' },
  ]

  const supervisorTabs: Tab[] = [
    { path: '/supervisor', icon: '🏠', label: 'Home' },
    { path: '/supervisor/billing', icon: '🧾', label: 'Bill' },
    { path: '/supervisor/inventory', icon: '📦', label: 'Stock' },
    { path: '/supervisor/expiry', icon: '⚠️', label: 'Expiry' },
    { path: '/profile', icon: '👤', label: 'Me' },
  ]

  const ownerTabs: Tab[] = [
    { path: '/owner', icon: '🏠', label: 'Home' },
    { path: '/owner/analytics', icon: '📊', label: 'Stats' },
    { path: '/owner/staff', icon: '👥', label: 'Staff' },
    { path: '/supervisor/inventory', icon: '📦', label: 'Stock' },
    { path: '/profile', icon: '👤', label: 'Me' },
  ]

  const tabs = role === 'owner' ? ownerTabs
    : role === 'supervisor' ? supervisorTabs
    : guestTabs

  return (
    <nav className="bottom-nav" role="navigation" aria-label="Main navigation">
      <div className="bottom-nav-inner">
        {tabs.map(t => {
          const isActive = pathname === t.path
          return (
            <Link key={t.path} to={t.path}
              className={`nav-tab ${isActive ? 'active' : ''}`}
              aria-label={t.label}>
              <div className={`nav-icon-wrap ${isActive ? 'active' : ''}`}>
                <span className="nav-emoji">{t.icon}</span>
              </div>
              <span className="nav-label">{t.label}</span>
              {t.badge ? <span className="cart-badge">{t.badge}</span> : null}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
