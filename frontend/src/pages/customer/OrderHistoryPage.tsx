export default function OrderHistoryPage() {
  const demoOrders = [
    { id: 'KV-2026-042', date: 'Today, 2:30 PM', total: 487, items: 5, status: 'completed', emoji: '✅' },
    { id: 'KV-2026-039', date: 'Yesterday', total: 1250, items: 12, status: 'completed', emoji: '✅' },
    { id: 'KV-2026-035', date: '25 Mar', total: 340, items: 3, status: 'completed', emoji: '✅' },
    { id: 'KV-2026-028', date: '22 Mar', total: 890, items: 8, status: 'completed', emoji: '✅' },
  ]

  return (
    <div className="anim-slide">
      <div className="section-header">
        <span className="section-emoji">📋</span>
        <h2>Order History</h2>
      </div>

      <div className="stats-grid mb-2">
        <div className="stat-card green">
          <div className="stat-icon">🛍️</div>
          <div className="stat-value">42</div>
          <div className="stat-label">Orders</div>
        </div>
        <div className="stat-card blue">
          <div className="stat-icon">💰</div>
          <div className="stat-value">₹14.2K</div>
          <div className="stat-label">Spent</div>
        </div>
      </div>

      <div className="gap-row stagger">
        {demoOrders.map(o => (
          <div key={o.id} className="card card-interactive anim-scale" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>{o.emoji}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>{o.id}</div>
              <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>{o.date} · {o.items} items</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: 'var(--accent-green)' }}>₹{o.total}</div>
              <span className="badge badge-green">{o.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
