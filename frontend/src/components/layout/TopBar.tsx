import { useStore } from '../../store/useStore'
import { Link, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useToast } from '../ui/Toast'
import { 
  Search, 
  ShoppingCart, 
  User, 
  Menu, 
  Moon, 
  Sun, 
  Type,
  LogOut
} from 'lucide-react'

export default function TopBar() {
  const { 
    isHighContrast, 
    isLargeText, 
    toggleHighContrast, 
    toggleLargeText, 
    cartItems, 
    isAuthenticated, 
    openAuthModal, 
    toggleMobileMenu,
    userName,
    logout
  } = useStore()
  
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const { addToast } = useToast()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/browse?q=${encodeURIComponent(searchQuery)}`)
  }

  const handleToggleTheme = () => {
    toggleHighContrast()
    addToast({
      title: !isHighContrast ? 'Midnight Mode enabled' : 'Light Mode enabled',
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
        <form className="bk-search-bar" onSubmit={handleSearch}>
          <Search size={18} className="bk-search-icon" />
          <input type="text" placeholder='Search items...' value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)} />
        </form>

        {/* Right side */}
        <div className="bk-topbar-right">
          <div className="bk-a11y-toggles">
            <button 
              className={`bk-a11y-btn ${isHighContrast ? 'active' : ''}`} 
              onClick={handleToggleTheme}
              title={isHighContrast ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isHighContrast ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              className={`bk-a11y-btn ${isLargeText ? 'active' : ''}`} 
              onClick={toggleLargeText}
              title="Toggle Large Text"
            >
              <Type size={20} />
            </button>
          </div>
          
          {isAuthenticated ? (
            <div className="bk-user-menu">
              <span className="bk-user-name">Hi, {userName?.split(' ')[0]}</span>
              <button className="bk-icon-btn" onClick={logout} title="Logout">
                <LogOut size={20} />
              </button>
            </div>
          ) : (
            <button className="bk-login-btn" onClick={openAuthModal}>
              <User size={18} />
              Login
            </button>
          )}

          <Link to="/cart" className="bk-cart-pill">
            <ShoppingCart size={20} />
            <span className="bk-cart-label">My Cart</span>
            {cartItems.length > 0 && <span className="bk-cart-count">{cartItems.length}</span>}
          </Link>
        </div>
      </div>
    </header>
  )
}
