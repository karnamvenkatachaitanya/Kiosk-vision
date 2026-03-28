import { useLocation, Link } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { 
  Home, 
  ShoppingBag, 
  Scan, 
  ShoppingCart, 
  User, 
  Receipt, 
  Package, 
  AlertTriangle, 
  BarChart2, 
  Users,
  Info
} from 'lucide-react'

type Tab = { path: string; icon: any; label: string; badge?: number }

export default function Sidebar() {
  const { pathname } = useLocation()
  const { role, cartItems, isMobileMenuOpen, closeMobileMenu } = useStore()

  const guestTabs: Tab[] = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/browse', icon: ShoppingBag, label: 'Shop' },
    { path: '/scan', icon: Scan, label: 'Scan' },
    { path: '/cart', icon: ShoppingCart, label: 'Cart', badge: cartItems.length },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  const supervisorTabs: Tab[] = [
    { path: '/supervisor', icon: Home, label: 'Home' },
    { path: '/supervisor/billing', icon: Receipt, label: 'Bill' },
    { path: '/supervisor/inventory', icon: Package, label: 'Stock' },
    { path: '/supervisor/expiry', icon: AlertTriangle, label: 'Expiry' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  const ownerTabs: Tab[] = [
    { path: '/owner', icon: Home, label: 'Home' },
    { path: '/owner/analytics', icon: BarChart2, label: 'Stats' },
    { path: '/owner/staff', icon: Users, label: 'Staff' },
    { path: '/supervisor/inventory', icon: Package, label: 'Stock' },
    { path: '/profile', icon: User, label: 'Profile' },
  ]

  const tabs = role === 'owner' ? ownerTabs
    : role === 'supervisor' ? supervisorTabs
    : guestTabs

  return (
    <>
      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={closeMobileMenu}></div>
      <aside className={`bk-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="bk-sidebar-header">
          <span className="bk-sidebar-logo">Kiosk Vision</span>
          <button className="bk-sidebar-close" onClick={closeMobileMenu}>×</button>
        </div>
        
        <nav className="bk-sidebar-nav" role="navigation" aria-label="Main navigation">
          {tabs.map(t => {
            const isActive = pathname === t.path
            const Icon = t.icon
            return (
              <Link key={t.path} to={t.path}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
                onClick={closeMobileMenu}
                aria-label={t.label}>
                <span className="sidebar-icon"><Icon size={22} strokeWidth={isActive ? 2.5 : 2} /></span>
                <span className="sidebar-label">{t.label}</span>
                {t.badge ? <span className="sidebar-badge">{t.badge}</span> : null}
              </Link>
            )
          })}
        </nav>

        <div className="bk-sidebar-footer">
          <div className="sidebar-info">
            <Info size={14} />
            <span>Store v1.0.4</span>
          </div>
        </div>
      </aside>
    </>
  )
}
