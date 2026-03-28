import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useState, useEffect } from 'react'
import { inventoryAPI } from '../../services/api'

const categories = [
  { id: 'grains', icon: '🌾', label: 'Atta, Rice\n& Dal', bg: '#fef3e2' },
  { id: 'dairy', icon: '🥛', label: 'Dairy, Bread\n& Eggs', bg: '#e8f5e9' },
  { id: 'fruits', icon: '🥬', label: 'Fruits &\nVegetables', bg: '#f1f8e9' },
  { id: 'beverages', icon: '🥤', label: 'Cold Drinks\n& Juices', bg: '#e3f2fd' },
  { id: 'snacks', icon: '🍿', label: 'Snacks &\nMunchies', bg: '#fff8e1' },
  { id: 'bakery', icon: '🍞', label: 'Bakery &\nBiscuits', bg: '#fce4ec' },
  { id: 'essentials', icon: '🧂', label: 'Masala, Oil\n& More', bg: '#fff3e0' },
  { id: 'personal_care', icon: '🧴', label: 'Personal\nCare', bg: '#f3e5f5' },
  { id: 'oils', icon: '🫒', label: 'Cooking\nOils & Ghee', bg: '#e0f2f1' },
  { id: 'cleaning', icon: '🧹', label: 'Cleaning\nEssentials', bg: '#e8eaf6' },
]

const promoCards = [
  { title: 'Kitchen Essentials', sub: 'Spices, salt, sugar & more', bg: 'linear-gradient(135deg, #ffd54f, #ffb300)', emoji: '🧂🫙🧈', cta: 'Order Now' },
  { title: 'Fresh Dairy Daily', sub: 'Milk, curd, paneer & cheese', bg: 'linear-gradient(135deg, #81c784, #43a047)', emoji: '🥛🧀🧈', cta: 'Order Now' },
  { title: 'Snack Time!', sub: 'Chips, biscuits, namkeen & more', bg: 'linear-gradient(135deg, #e57373, #ef5350)', emoji: '🍪🍿🥜', cta: 'Order Now' },
]

export default function HomePage() {
  const { role, openAuthModal, isAuthenticated, cartItems } = useStore()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [trending, setTrending] = useState<any[]>([])
  const { addToCart } = useStore()

  useEffect(() => {
    inventoryAPI.listProducts().then(res => {
      setTrending((res.data || []).slice(0, 10))
    }).catch(() => {})
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) navigate(`/browse?q=${encodeURIComponent(searchQuery)}`)
  }

  const handleAdd = (p: any) => {
    addToCart({ product_id: p._id || p.id, product_name: p.name, product_emoji: '📦', quantity: 1, unit_price: p.selling_price || p.price, total_price: p.selling_price || p.price, added_via: 'manual' })
  }

  return (
    <div className="bk-home">
      {/* ── Hero Banner ── */}
      <div className="bk-hero">
        <div className="bk-hero-content">
          <h1>Stock up on daily essentials</h1>
          <p>Get farm-fresh goodness & a range of exotic fruits, vegetables, eggs & more</p>
          <Link to="/browse" className="bk-hero-btn">Shop Now</Link>
        </div>
        <div className="bk-hero-emojis">🥦🍅🥕🥚🍎🥒</div>
      </div>

      {/* ── Promo Cards Row ── */}
      <div className="bk-promos">
        {promoCards.map((card, i) => (
          <Link to="/browse" key={i} className="bk-promo-card" style={{ background: card.bg }}>
            <div className="bk-promo-text">
              <h3>{card.title}</h3>
              <p>{card.sub}</p>
              <span className="bk-promo-cta">{card.cta}</span>
            </div>
            <span className="bk-promo-emojis">{card.emoji}</span>
          </Link>
        ))}
      </div>

      {/* ── Category Grid ── */}
      <div className="bk-categories-section">
        <div className="bk-categories-grid">
          {categories.map(c => (
            <Link to={`/browse?cat=${c.id}`} key={c.id} className="bk-category-item">
              <div className="bk-category-circle" style={{ background: c.bg }}>
                <span>{c.icon}</span>
              </div>
              <span className="bk-category-label">{c.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Trending Products ── */}
      {trending.length > 0 && (
        <div className="bk-section">
          <div className="bk-section-header">
            <h2>Bestsellers</h2>
            <Link to="/browse" className="bk-see-all">see all</Link>
          </div>
          <div className="bk-product-scroll">
            {trending.map(p => (
              <div key={p._id || p.id} className="bk-product-card">
                <div className="bk-product-img">
                  <span>📦</span>
                  {p.mrp && p.mrp > (p.selling_price || p.price) && (
                    <span className="bk-discount">{Math.round(((p.mrp - (p.selling_price || p.price)) / p.mrp) * 100)}%<br/>OFF</span>
                  )}
                </div>
                <div className="bk-product-body">
                  <div className="bk-product-name">{p.name || 'Item'}</div>
                  <div className="bk-product-unit">{p.unit || '1 unit'}</div>
                  <div className="bk-product-bottom">
                    <div className="bk-product-prices">
                      <span className="bk-price">₹{p.selling_price || p.price}</span>
                      {p.mrp && p.mrp > (p.selling_price || p.price) && (
                        <span className="bk-mrp">₹{p.mrp}</span>
                      )}
                    </div>
                    <button className="bk-add-btn" onClick={() => handleAdd(p)}>ADD</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions for accessibility (kiosk-specific) */}
      <div className="bk-section">
        <h2 className="bk-section-title">Quick Actions</h2>
        <div className="bk-quick-grid">
          <Link to="/voice" className="bk-quick-btn">
            <span className="bk-quick-icon">🎙️</span>
            <span>Voice Order</span>
          </Link>
          <Link to="/scan" className="bk-quick-btn">
            <span className="bk-quick-icon">📷</span>
            <span>Scan & Buy</span>
          </Link>
          <Link to="/map" className="bk-quick-btn">
            <span className="bk-quick-icon">🗺️</span>
            <span>Find in Store</span>
          </Link>
          <Link to="/gesture" className="bk-quick-btn">
            <span className="bk-quick-icon">🤌</span>
            <span>Gestures</span>
          </Link>
        </div>
      </div>

      {/* Login Prompt */}
      {role === 'guest' && (
        <div className="bk-login-bar" onClick={openAuthModal}>
          <span>🌟 <strong>Sign in</strong> for order history, points & instant re-order</span>
          <span className="bk-login-arrow">→</span>
        </div>
      )}

      {/* Role dashboards */}
      {(role === 'supervisor' || role === 'owner') && (
        <Link to={role === 'owner' ? '/owner' : '/supervisor'} className="bk-dashboard-btn">
          🔐 {role === 'owner' ? 'Owner Dashboard' : 'Supervisor Panel'}
        </Link>
      )}
    </div>
  )
}
