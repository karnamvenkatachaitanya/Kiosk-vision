export default function AnalyticsPage() {
  const weeklyData = [
    { day: 'Mon', revenue: 32000, orders: 64 },
    { day: 'Tue', revenue: 28500, orders: 58 },
    { day: 'Wed', revenue: 41200, orders: 82 },
    { day: 'Thu', revenue: 35800, orders: 72 },
    { day: 'Fri', revenue: 48600, orders: 96 },
    { day: 'Sat', revenue: 52400, orders: 105 },
    { day: 'Sun', revenue: 42800, orders: 86 },
  ]

  const maxRevenue = Math.max(...weeklyData.map(d => d.revenue))

  const trending = [
    { name: 'Basmati Rice 5kg', emoji: '🌾', sold: 45, revenue: 15750 },
    { name: 'Toor Dal 1kg', emoji: '🫘', sold: 38, revenue: 4940 },
    { name: 'Milk 500ml', emoji: '🥛', sold: 120, revenue: 3360 },
    { name: 'Sugar 1kg', emoji: '🧂', sold: 35, revenue: 1470 },
    { name: 'Sunflower Oil 1L', emoji: '🫒', sold: 22, revenue: 3300 },
  ]

  const paymentSplit = [
    { method: 'UPI', icon: '📱', percent: 68, color: 'var(--accent-blue)' },
    { method: 'Cash', icon: '💵', percent: 32, color: 'var(--accent-green)' },
  ]

  return (
    <div className="anim-slide">
      <div className="section-header">
        <span className="section-emoji">📊</span>
        <h2>Analytics</h2>
      </div>

      {/* Weekly revenue chart (CSS-only bar chart) */}
      <div className="card mb-2">
        <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '1rem' }}>Weekly Revenue</h3>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: '4px', height: '120px' }}>
          {weeklyData.map(d => (
            <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <div style={{
                width: '100%', borderRadius: '4px 4px 0 0',
                background: 'linear-gradient(180deg, var(--accent-blue), var(--accent-purple))',
                height: `${(d.revenue / maxRevenue) * 100}%`,
                minHeight: '8px',
                transition: 'height 0.5s var(--ease)',
              }} />
              <span style={{ fontSize: '0.55rem', color: 'var(--text-muted)' }}>{d.day}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.5rem', fontSize: 'var(--text-xs)' }}>
          <span className="text-muted">This Week</span>
          <span className="text-green fw-800">₹{(weeklyData.reduce((s,d) => s+d.revenue, 0)/1000).toFixed(1)}K total</span>
        </div>
      </div>

      {/* Payment split */}
      <div className="card mb-2">
        <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>Payment Methods</h3>
        {paymentSplit.map(p => (
          <div key={p.method} style={{ marginBottom: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.3rem' }}>
              <span>{p.icon} {p.method}</span>
              <span className="fw-800">{p.percent}%</span>
            </div>
            <div style={{ height: '8px', background: 'var(--bg-elevated)', borderRadius: '4px', overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${p.percent}%`, background: p.color, borderRadius: '4px', transition: 'width 0.5s var(--ease)' }} />
            </div>
          </div>
        ))}
      </div>

      {/* Trending products */}
      <div className="section-header mt-2">
        <span className="section-emoji">🔥</span>
        <h2>Trending Products</h2>
      </div>
      {trending.map((p, i) => (
        <div key={p.name} className="product-card">
          <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-muted)', width: '28px', textAlign: 'center' }}>#{i+1}</div>
          <div className="product-emoji">{p.emoji}</div>
          <div className="product-details">
            <div className="product-name">{p.name}</div>
            <div className="product-meta">{p.sold} sold</div>
          </div>
          <span className="product-price">₹{(p.revenue/1000).toFixed(1)}K</span>
        </div>
      ))}
    </div>
  )
}
