import { Link, useNavigate } from 'react-router-dom'
import { useStore } from '../../store/useStore'
import { useState, useEffect } from 'react'
import { inventoryAPI } from '../../services/api'
import { useToast } from '../../components/ui/Toast'
import { 
  ShoppingBag, 
  Mic, 
  Search, 
  Camera, 
  Map as MapIcon, 
  Hand, 
  ChevronRight, 
  Plus,
  Star
} from 'lucide-react'
import './HomePage.css'

const categories = [
  { id: 'burgers', icon: '🍔', label: 'Burgers' },
  { id: 'pizza', icon: '🍕', label: 'Pizza' },
  { id: 'sides', icon: '🍟', label: 'Fries' },
  { id: 'beverages', icon: '🥤', label: 'Drinks' },
  { id: 'desserts', icon: '🍦', label: 'Desserts' },
  { id: 'combo', icon: '🍱', label: 'Combos' },
  { id: 'hot_drinks', icon: '☕', label: 'Coffee' },
  { id: 'healthy', icon: '🥗', label: 'Salads' },
]

const promoCards = [
  { title: 'Mega Burger Combo', sub: '2 Burgers + Fries + 2 Cokes', emoji: '🍔', discount: '30% OFF' },
  { title: 'Sizzling Pizzas', sub: 'Freshly baked, hot & cheesy', emoji: '🍕', discount: '20% OFF' },
  { title: 'Sweet Cravings', sub: 'Choco Lava & Sundaes', emoji: '🍨', discount: '25% OFF' },
]

const mockFoodProducts = [
  { _id: '1', name: 'Classic Cheeseburger', category: 'burgers', selling_price: 149, mrp: 199, unit: '1 pc', emoji: '🍔' },
  { _id: '2', name: 'Margherita Pizza', category: 'pizza', selling_price: 299, mrp: 399, unit: '8 inch', emoji: '🍕' },
  { _id: '3', name: 'French Fries (L)', category: 'sides', selling_price: 99, mrp: 129, unit: '1 portion', emoji: '🍟' },
  { _id: '4', name: 'Cold Coffee', category: 'beverages', selling_price: 129, mrp: 159, unit: '250 ml', emoji: '🥤' },
  { _id: '5', name: 'Chocolate Sundae', category: 'desserts', selling_price: 119, mrp: 149, unit: '1 pc', emoji: '🍨' },
  { _id: '6', name: 'Mega Combo Meal', category: 'combo', selling_price: 399, mrp: 549, unit: 'Serves 2', emoji: '🍱' },
]

export default function HomePage() {
  const { role, openAuthModal } = useStore()
  const navigate = useNavigate()
  const [trending, setTrending] = useState<any[]>([])
  const { addToCart } = useStore()
  const [heroSlide, setHeroSlide] = useState(0)

  useEffect(() => {
    inventoryAPI.listProducts().then(res => {
      if (res.data && res.data.length > 0) {
        setTrending(res.data.slice(0, 8))
      } else {
        setTrending(mockFoodProducts)
      }
    }).catch(() => {
      setTrending(mockFoodProducts)
    })
  }, [])

  // Auto-rotate hero
  useEffect(() => {
    const timer = setInterval(() => setHeroSlide(s => (s + 1) % 3), 4000)
    return () => clearInterval(timer)
  }, [])

  const { addToast } = useToast()

  const handleAdd = (p: any) => {
    addToCart({ product_id: p._id || p.id, product_name: p.name, product_emoji: p.emoji || '🍔', quantity: 1, unit_price: p.selling_price || p.price, total_price: p.selling_price || p.price, added_via: 'manual' })
    addToast({ title: `${p.emoji || '🍔'} ${p.name} added`, message: `₹${p.selling_price || p.price} · Added to cart`, type: 'success', duration: 2500 })
  }

  const heroSlides = [
    { title: 'Craving something delicious?', sub: 'Fresh, hot meals at your fingertips', emoji: '🍔🍟🥤', bg: 'hero-slide-1' },
    { title: 'Order in seconds', sub: 'Voice, scan, or tap — your choice', emoji: '🎙️📷👆', bg: 'hero-slide-2' },
    { title: 'Earn rewards every bite', sub: 'Sign in to collect loyalty points', emoji: '⭐🎁💎', bg: 'hero-slide-3' },
  ]

  return (
    <div className="hp anim-fade">
      {/* ── Hero Section ── */}
      <section className={`hp-hero ${heroSlides[heroSlide].bg}`}>
        <div className="hp-hero-content">
          <h1>{heroSlides[heroSlide].title}</h1>
          <p>{heroSlides[heroSlide].sub}</p>
          <div className="hp-hero-actions">
            <Link to="/browse" className="hp-hero-btn hp-hero-btn-primary">
              <ShoppingBag size={20} />
              Browse Menu
            </Link>
            <Link to="/voice" className="hp-hero-btn hp-hero-btn-outline">
              <Mic size={20} />
              Voice Order
            </Link>
          </div>
        </div>
        <div className="hp-hero-emoji">{heroSlides[heroSlide].emoji}</div>
        <div className="hp-hero-dots">
          {heroSlides.map((_, i) => (
            <button key={i} className={`hp-dot ${heroSlide === i ? 'active' : ''}`} onClick={() => setHeroSlide(i)} />
          ))}
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="hp-section anim-slide">
        <div className="hp-section-head">
          <h2>Shop by Category</h2>
          <Link to="/browse" className="hp-see-all">See all <ChevronRight size={16} /></Link>
        </div>
        <div className="hp-categories stagger">
          {categories.map(c => (
            <Link to={`/browse?cat=${c.id}`} key={c.id} className="hp-cat anim-scale">
              <div className="hp-cat-icon">{c.icon}</div>
              <span>{c.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Promo Cards ── */}
      <section className="hp-section anim-slide" style={{ animationDelay: '0.1s' }}>
        <div className="hp-section-head">
          <h2>Today's Deals</h2>
        </div>
        <div className="hp-promos stagger">
          {promoCards.map((card, i) => (
            <Link to="/browse" key={i} className={`hp-promo hp-promo-${i + 1} anim-scale`}>
              <div className="hp-promo-badge">{card.discount}</div>
              <div className="hp-promo-emoji">{card.emoji}</div>
              <div className="hp-promo-content">
                <h3>{card.title}</h3>
                <p>{card.sub}</p>
                <span className="hp-promo-cta">Order Now <ChevronRight size={14} /></span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Quick Actions ── */}
      <section className="hp-section anim-slide" style={{ animationDelay: '0.2s' }}>
        <div className="hp-section-head">
          <h2>Quick Actions</h2>
        </div>
        <div className="hp-quick-grid stagger">
          <Link to="/voice" className="hp-quick anim-scale">
            <div className="hp-quick-icon-wrap"><Mic size={28} /></div>
            <span className="hp-quick-label">Voice Order</span>
            <span className="hp-quick-desc">Just speak it</span>
          </Link>
          <Link to="/scan" className="hp-quick anim-scale">
            <div className="hp-quick-icon-wrap"><Camera size={28} /></div>
            <span className="hp-quick-label">Scan & Buy</span>
            <span className="hp-quick-desc">Point camera</span>
          </Link>
          <Link to="/map" className="hp-quick anim-scale">
            <div className="hp-quick-icon-wrap"><MapIcon size={28} /></div>
            <span className="hp-quick-label">Store Map</span>
            <span className="hp-quick-desc">Find items</span>
          </Link>
          <Link to="/gesture" className="hp-quick anim-scale">
            <div className="hp-quick-icon-wrap"><Hand size={28} /></div>
            <span className="hp-quick-label">Gestures</span>
            <span className="hp-quick-desc">Hands-free</span>
          </Link>
        </div>
      </section>

      {/* ── Trending Products ── */}
      {trending.length > 0 && (
        <section className="hp-section anim-slide" style={{ animationDelay: '0.3s' }}>
          <div className="hp-section-head">
            <h2>🔥 Bestsellers</h2>
            <Link to="/browse" className="hp-see-all">See all <ChevronRight size={16} /></Link>
          </div>
          <div className="hp-products-scroll stagger">
            {trending.map((p, i) => (
              <div key={p._id || p.id} className="hp-product anim-scale" style={{ animationDelay: `${0.4 + i * 0.05}s` }}>
                <div className="hp-product-img">
                  <span>{p.emoji || '🍔'}</span>
                  {p.mrp && p.mrp > (p.selling_price || p.price) && (
                    <div className="hp-product-discount">
                      {Math.round(((p.mrp - (p.selling_price || p.price)) / p.mrp) * 100)}% OFF
                    </div>
                  )}
                </div>
                <div className="hp-product-info">
                  <div className="hp-product-name">{p.name || 'Item'}</div>
                  <div className="hp-product-unit">{p.unit || '1 unit'}</div>
                  <div className="hp-product-footer">
                    <div className="hp-product-prices">
                      <span className="hp-price">₹{p.selling_price || p.price}</span>
                      {p.mrp && p.mrp > (p.selling_price || p.price) && (
                        <span className="hp-mrp">₹{p.mrp}</span>
                      )}
                    </div>
                    <button className="hp-add-btn" onClick={() => handleAdd(p)}>
                      <Plus size={16} />
                      ADD
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── Login Prompt ── */}
      {role === 'guest' && (
        <section className="hp-login-bar" onClick={openAuthModal}>
          <div className="hp-login-text">
            <div className="hp-login-icon-wrap">
              <Star size={20} fill="currentColor" />
            </div>
            <div>
              <strong>Sign in for rewards</strong>
              <span>History, points & re-order</span>
            </div>
          </div>
          <ChevronRight size={24} className="hp-login-arrow" />
        </section>
      )}

      {/* ── Role dashboards ── */}
      {(role === 'supervisor' || role === 'owner') && (
        <Link to={role === 'owner' ? '/owner' : '/supervisor'} className="hp-dashboard-btn">
          🔐 {role === 'owner' ? 'Owner Dashboard' : 'Supervisor Panel'}
        </Link>
      )}
    </div>
  )
}
