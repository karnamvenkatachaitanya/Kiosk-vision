import { useState, useEffect } from 'react'
import { inventoryAPI } from '../../services/api'

export default function InventoryPage() {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const res = await inventoryAPI.listProducts()
        setProducts(res.data)
      } catch (e) {
        console.error("Failed to load inventory:", e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // Calculate live low-stock metrics (below minimum threshold)
  const lowStock = products.filter(p => p.stock_quantity <= (p.min_stock_level || 15))

  return (
    <div className="anim-slide">
      <div className="section-header">
        <span className="section-emoji">📦</span>
        <h2>Inventory</h2>
      </div>

      {/* Low stock alerts */}
      {lowStock.length > 0 && (
        <div className="alert alert-warning mb-2">
          <span className="alert-icon">⚠️</span>
          <span className="alert-text">{lowStock.length} products need restocking</span>
        </div>
      )}

      <div className="mega-grid cols-1 mb-2">
        <button className="mega-btn accent-green" style={{ flexDirection: 'row', gap: '1rem', justifyContent: 'flex-start', paddingLeft: '1.5rem' }}>
          <span className="mega-icon">➕</span>
          <div style={{ textAlign: 'left' }}>
            <div style={{ fontWeight: 700 }}>Add Product</div>
            <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Scan barcode or enter manually</div>
          </div>
        </button>
      </div>

      {/* Product list */}
      {loading ? (
        <div className="stagger" style={{ opacity: 0.5 }}>Loading live database...</div>
      ) : (
        <div className="stagger">
          {products.map(p => {
             const isCritical = p.stock_quantity <= (p.min_stock_level || 15) / 2
             const isLow = p.stock_quantity <= (p.min_stock_level || 15)
             return (
              <div key={p._id || p.id} className="product-card anim-scale">
                <div className="product-emoji">📦</div>
                <div className="product-details">
                  <div className="product-name">{p.name || "Unknown Product"}</div>
                  <div className="product-meta">
                    Stock: <span style={{
                      color: isCritical ? 'var(--accent-red)' : isLow ? 'var(--accent-orange)' : 'var(--accent-green)',
                      fontWeight: 700
                    }}>{p.stock_quantity}</span>
                  </div>
                </div>
                <span className={`badge ${isCritical ? 'badge-red' : isLow ? 'badge-orange' : 'badge-green'}`}>
                  {isCritical ? '🔴 Critical' : isLow ? '🟡 Low' : '🟢 OK'}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
