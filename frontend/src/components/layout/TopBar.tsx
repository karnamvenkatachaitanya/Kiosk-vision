import { useStore } from '../../store/useStore'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useToast } from '../ui/Toast'

export default function TopBar() {
  const { isHighContrast, isLargeText, toggleHighContrast, toggleLargeText, cartItems, isAuthenticated, openAuthModal, toggleMobileMenu } = useStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { addToast } = useToast()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/browse?q=${encodeURIComponent(searchQuery)}`)
  }

  const handleToggleAccessibility = (label: string, toggle: () => void, active: boolean) => {
    toggle()
    addToast({
      title: `${label} ${!active ? 'enabled' : 'disabled'}`,
      type: 'info',
      duration: 1500
    })
  }

  return (
    <header className="bk-topbar">
      <div className="bk-topbar-inner">
        {/* Hamburger (Mobile) */}
        <button className="bk-hamburger" aria-label="Open menu" onClick={toggleMobileMenu}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M3 12H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 6H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M3 18H21" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {/* Logo + Delivery */}
        <div className="bk-topbar-left">
          <Link to="/" className="bk-logo">Kiosk Vision</Link>
        </div>

        {/* Search Bar */}
        <form className="bk-search" onSubmit={handleSearch}>
          <span className="bk-search-icon">🔍</span>
          <input type="text" placeholder='Search "bread"' value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)} className="bk-search-input" />
        </form>

        {/* Right side */}
        <div className="bk-topbar-right">
          <div className="bk-a11y-toggles">
            <button className={`bk-a11y ${isHighContrast ? 'on' : ''}`} onClick={() => handleToggleAccessibility('High Contrast', toggleHighContrast, isHighContrast)} title="High Contrast">◐</button>
            <button className={`bk-a11y ${isLargeText ? 'on' : ''}`} onClick={() => handleToggleAccessibility('Large Text', toggleLargeText, isLargeText)} title="Large Text">A+</button>
          </div>
          {!isAuthenticated && (
            <button className="bk-login-btn" onClick={openAuthModal}>Login</button>
          )}
          <Link to="/cart" className="bk-cart-btn">
            🛒 <span>My Cart</span>
            {cartItems.length > 0 && <span className="bk-cart-count">{cartItems.length}</span>}
          </Link>
        </div>
      </div>
    </header>
  )
}
