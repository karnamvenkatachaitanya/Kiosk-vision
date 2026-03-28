import { useState, useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { useSearchParams } from 'react-router-dom'
import { inventoryAPI } from '../../services/api'

const categories = [
  { id: 'grains', icon: '🌾', label: 'Grains', gradient: 'linear-gradient(135deg, #f6d365, #fda085)' },
  { id: 'pulses', icon: '🫘', label: 'Pulses', gradient: 'linear-gradient(135deg, #f093fb, #f5576c)' },
  { id: 'oils', icon: '🫒', label: 'Oils', gradient: 'linear-gradient(135deg, #4facfe, #00f2fe)' },
  { id: 'dairy', icon: '🥛', label: 'Dairy', gradient: 'linear-gradient(135deg, #43e97b, #38f9d7)' },
  { id: 'bakery', icon: '🍞', label: 'Bakery', gradient: 'linear-gradient(135deg, #fa709a, #fee140)' },
  { id: 'beverages', icon: '🍵', label: 'Drinks', gradient: 'linear-gradient(135deg, #fccb90, #d57eeb)' },
  { id: 'snacks', icon: '🍪', label: 'Snacks', gradient: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' },
  { id: 'essentials', icon: '🧂', label: 'Kitchen', gradient: 'linear-gradient(135deg, #ffecd2, #fcb69f)' },
  { id: 'personal_care', icon: '🧴', label: 'Care', gradient: 'linear-gradient(135deg, #89f7fe, #66a6ff)' },
]

const catMatchMap: Record<string, string[]> = {
  grains: ['rice', 'flour', 'grain', 'atta', 'wheat'],
  pulses: ['dal', 'pulse', 'beans', 'lentil', 'chana'],
  oils: ['oil', 'ghee'],
  dairy: ['dairy', 'milk', 'cheese', 'curd', 'paneer', 'butter'],
  bakery: ['bakery', 'bread', 'bun', 'cake'],
  beverages: ['beverage', 'tea', 'coffee', 'drink', 'juice'],
  snacks: ['snack', 'biscuit', 'chips', 'namkeen', 'cookie'],
  personal_care: ['personal', 'care', 'soap', 'shampoo', 'toothpaste'],
  essentials: ['spice', 'salt', 'sugar', 'masala', 'turmeric'],
}

export default function BrowsePage() {
  const [searchParams] = useSearchParams()
  const initialCat = searchParams.get('cat')
  const initialQuery = searchParams.get('q') || ''

  const [activeCategory, setActiveCategory] = useState<string | null>(initialCat)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set())
  const { addToCart } = useStore()

  useEffect(() => {
    async function load() {
      try {
        const res = await inventoryAPI.listProducts()
        setProducts(res.data || [])
      } catch { /* empty */ } finally { setLoading(false) }
    }
    load()
  }, [])

  const filtered = products.filter(p => {
    const cat = (p.category || '').toLowerCase()
    const name = (p.name || '').toLowerCase()
    const matchesCat = !activeCategory || (catMatchMap[activeCategory] || []).some(k => cat.includes(k) || name.includes(k))
    const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase())
    return matchesCat && matchesSearch
  })

  const handleAdd = (product: any) => {
    const pid = product._id || product.id
    addToCart({
      product_id: pid, product_name: product.name, product_emoji: '📦',
      quantity: 1, unit_price: product.selling_price || product.price,
      total_price: product.selling_price || product.price, added_via: 'manual',
    })
    setAddedIds(prev => new Set(prev).add(pid))
    setTimeout(() => setAddedIds(prev => { const n = new Set(prev); n.delete(pid); return n }), 1500)
  }

  const getCatGradient = (product: any) => {
    const cat = (product.category || '').toLowerCase()
    for (const c of categories) {
      if ((catMatchMap[c.id] || []).some(k => cat.includes(k))) return c.gradient
    }
    return 'linear-gradient(135deg, #667eea, #764ba2)'
  }

  const getCatEmoji = (product: any) => {
    const cat = (product.category || '').toLowerCase()
    for (const c of categories) {
      if ((catMatchMap[c.id] || []).some(k => cat.includes(k))) return c.icon
    }
    return '📦'
  }

  return (
    <div className="browse-page anim-slide">
      {/* Search */}
      <div className="search-bar">
        <span className="search-icon">🔍</span>
        <input type="text" placeholder="Search products..." value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)} className="search-input" />
        {searchQuery && (
          <button className="search-clear" onClick={() => setSearchQuery('')}>✕</button>
        )}
      </div>

      {/* Category Chips */}
      <div className="browse-chips">
        <button className={`browse-chip ${!activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>
          <span className="browse-chip-icon">✨</span><span>All</span>
        </button>
        {categories.map(c => (
          <button key={c.id} className={`browse-chip ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(activeCategory === c.id ? null : c.id)}>
            <span className="browse-chip-icon">{c.icon}</span><span>{c.label}</span>
          </button>
        ))}
      </div>

      {/* Results count */}
      <div className="browse-results-bar">
        <span>{loading ? 'Loading...' : `${filtered.length} products`}</span>
      </div>

      {/* Skeleton Loading */}
      {loading && (
        <div className="product-grid-2col">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card">
              <div className="skeleton-img shimmer" />
              <div className="skeleton-line shimmer" style={{ width: '80%' }} />
              <div className="skeleton-line shimmer" style={{ width: '50%' }} />
              <div className="skeleton-line-short shimmer" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="empty-state">
          <div className="empty-emoji">🔎</div>
          <h3>No products found</h3>
          <p>Try a different category or search term</p>
          <button className="btn btn-outline" onClick={() => { setActiveCategory(null); setSearchQuery('') }}>Clear Filters</button>
        </div>
      )}

      {/* Product Grid */}
      {!loading && filtered.length > 0 && (
        <div className="product-grid-2col stagger">
          {filtered.map(p => {
            const pid = p._id || p.id
            const isAdded = addedIds.has(pid)
            const inStock = p.stock === undefined || p.stock > 0
            return (
              <div key={pid} className={`product-tile ${!inStock ? 'out-of-stock' : ''}`}>
                <div className="product-tile-img" style={{ background: getCatGradient(p) }}>
                  <span className="product-tile-emoji">{getCatEmoji(p)}</span>
                  {!inStock && <span className="oos-badge">Out of Stock</span>}
                  {p.mrp && p.mrp > (p.selling_price || p.price) && (
                    <span className="discount-badge">
                      {Math.round(((p.mrp - (p.selling_price || p.price)) / p.mrp) * 100)}% OFF
                    </span>
                  )}
                </div>
                <div className="product-tile-body">
                  <div className="product-tile-name">{p.name || 'Unknown Item'}</div>
                  <div className="product-tile-unit">{p.unit || '1 unit'}</div>
                  <div className="product-tile-footer">
                    <div className="product-tile-prices">
                      <span className="product-tile-price">₹{p.selling_price || p.price}</span>
                      {p.mrp && p.mrp > (p.selling_price || p.price) && (
                        <span className="product-tile-mrp">₹{p.mrp}</span>
                      )}
                    </div>
                    {inStock && (
                      <button className={`tile-add-btn ${isAdded ? 'added' : ''}`}
                        onClick={() => handleAdd(p)} disabled={isAdded}>
                        {isAdded ? '✓' : 'ADD'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
