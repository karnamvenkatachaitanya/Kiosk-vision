const products = [
  { id: 'p001', name: 'Basmati Rice (5kg)', emoji: '🌾', stock: 50, status: 'ok' },
  { id: 'p002', name: 'Wheat Flour (1kg)', emoji: '🌾', stock: 100, status: 'ok' },
  { id: 'p003', name: 'Sugar (1kg)', emoji: '🧂', stock: 8, status: 'low' },
  { id: 'p004', name: 'Toor Dal (1kg)', emoji: '🫘', stock: 60, status: 'ok' },
  { id: 'p005', name: 'Sunflower Oil (1L)', emoji: '🫒', stock: 3, status: 'critical' },
  { id: 'p006', name: 'Milk (500ml)', emoji: '🥛', stock: 30, status: 'ok' },
  { id: 'p007', name: 'White Bread', emoji: '🍞', stock: 5, status: 'low' },
  { id: 'p008', name: 'Tea (250g)', emoji: '🍵', stock: 45, status: 'ok' },
]

export default function InventoryPage() {
  const lowStock = products.filter(p => p.status !== 'ok')

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
      <div className="stagger">
        {products.map(p => (
          <div key={p.id} className="product-card anim-scale">
            <div className="product-emoji">{p.emoji}</div>
            <div className="product-details">
              <div className="product-name">{p.name}</div>
              <div className="product-meta">
                Stock: <span style={{
                  color: p.status === 'critical' ? 'var(--accent-red)' : p.status === 'low' ? 'var(--accent-orange)' : 'var(--accent-green)',
                  fontWeight: 700
                }}>{p.stock}</span>
              </div>
            </div>
            <span className={`badge ${p.status === 'critical' ? 'badge-red' : p.status === 'low' ? 'badge-orange' : 'badge-green'}`}>
              {p.status === 'critical' ? '🔴 Critical' : p.status === 'low' ? '🟡 Low' : '🟢 OK'}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
