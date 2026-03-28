import { useStore } from '../../store/useStore'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'

export default function TopBar() {
  const { isHighContrast, isLargeText, toggleHighContrast, toggleLargeText, cartItems, isAuthenticated, openAuthModal } = useStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/browse?q=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <header className="bk-topbar">
      <div className="bk-topbar-inner">
        {/* Logo + Delivery */}
        <div className="bk-topbar-left">
          <Link to="/" className="bk-logo">Kiosk Vision</Link>
          <div className="bk-delivery-info">
            <span className="bk-delivery-time">Delivery in 10 minutes</span>
            <span className="bk-delivery-loc">📍 Kiosk Store</span>
          </div>
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
            <button className={`bk-a11y ${isHighContrast ? 'on' : ''}`} onClick={toggleHighContrast} title="High Contrast">◐</button>
            <button className={`bk-a11y ${isLargeText ? 'on' : ''}`} onClick={toggleLargeText} title="Large Text">A+</button>
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
