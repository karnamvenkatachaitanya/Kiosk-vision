import { useState } from 'react'
import { useStore } from '../../store/useStore'

const categories = [
  { id: 'grains', icon: '🌾', label: 'Grains' },
  { id: 'pulses', icon: '🫘', label: 'Pulses' },
  { id: 'oils', icon: '🫒', label: 'Oils' },
  { id: 'dairy', icon: '🥛', label: 'Dairy' },
  { id: 'bakery', icon: '🍞', label: 'Bread' },
  { id: 'beverages', icon: '🍵', label: 'Drinks' },
  { id: 'snacks', icon: '🍪', label: 'Snacks' },
  { id: 'essentials', icon: '🧂', label: 'Kitchen' },
  { id: 'personal_care', icon: '🧴', label: 'Care' },
]

const demoProducts = [
  { id: 'p001', name: 'Basmati Rice (5kg)', emoji: '🌾', price: 350, category: 'grains', unit: 'bag' },
  { id: 'p002', name: 'Wheat Flour (1kg)', emoji: '🌾', price: 45, category: 'grains', unit: 'pack' },
  { id: 'p003', name: 'Sugar (1kg)', emoji: '🧂', price: 42, category: 'essentials', unit: 'pack' },
  { id: 'p004', name: 'Toor Dal (1kg)', emoji: '🫘', price: 130, category: 'pulses', unit: 'pack' },
  { id: 'p005', name: 'Sunflower Oil (1L)', emoji: '🫒', price: 150, category: 'oils', unit: 'bottle' },
  { id: 'p006', name: 'Milk (500ml)', emoji: '🥛', price: 28, category: 'dairy', unit: 'pack' },
  { id: 'p007', name: 'White Bread', emoji: '🍞', price: 40, category: 'bakery', unit: 'pack' },
  { id: 'p008', name: 'Tea Leaves (250g)', emoji: '🍵', price: 120, category: 'beverages', unit: 'pack' },
  { id: 'p009', name: 'Soap Bar', emoji: '🧴', price: 45, category: 'personal_care', unit: 'piece' },
  { id: 'p010', name: 'Toothpaste (100g)', emoji: '🪥', price: 55, category: 'personal_care', unit: 'tube' },
  { id: 'p011', name: 'Salt (1kg)', emoji: '🧂', price: 20, category: 'essentials', unit: 'pack' },
  { id: 'p012', name: 'Cream Biscuits', emoji: '🍪', price: 30, category: 'snacks', unit: 'pack' },
]

export default function BrowsePage() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const { addToCart } = useStore()

  const filtered = activeCategory
    ? demoProducts.filter(p => p.category === activeCategory)
    : demoProducts

  const handleAdd = (product: typeof demoProducts[0]) => {
    addToCart({
      product_id: product.id,
      product_name: product.name,
      product_emoji: product.emoji,
      quantity: 1,
      unit_price: product.price,
      total_price: product.price,
      added_via: 'manual',
    })
  }

  return (
    <div className="anim-slide">
      <div className="section-header">
        <span className="section-emoji">🛍️</span>
        <h2>Browse Products</h2>
      </div>

      {/* Category chips – icon-first for illiterate users */}
      <div className="chip-scroll mb-2">
        <button className={`chip ${!activeCategory ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>
          <span className="chip-icon">✨</span>
          <span className="chip-label">All</span>
        </button>
        {categories.map(c => (
          <button key={c.id} className={`chip ${activeCategory === c.id ? 'active' : ''}`}
            onClick={() => setActiveCategory(c.id)}>
            <span className="chip-icon">{c.icon}</span>
            <span className="chip-label">{c.label}</span>
          </button>
        ))}
      </div>

      {/* Product list */}
      <div className="stagger">
        {filtered.map(p => (
          <div key={p.id} className="product-card anim-scale">
            <div className="product-emoji">{p.emoji}</div>
            <div className="product-details">
              <div className="product-name">{p.name}</div>
              <div className="product-meta">{p.unit}</div>
            </div>
            <span className="product-price">₹{p.price}</span>
            <button className="add-btn" onClick={() => handleAdd(p)} aria-label={`Add ${p.name}`}>+</button>
          </div>
        ))}
      </div>
    </div>
  )
}
