const expiryItems = [
  { name: 'Milk (500ml)', emoji: '🥛', expiry: '2026-04-03', days: 6, level: 'critical', qty: 30 },
  { name: 'White Bread', emoji: '🍞', expiry: '2026-04-01', days: 4, level: 'critical', qty: 25 },
  { name: 'Cream Biscuits', emoji: '🍪', expiry: '2026-08-01', days: 126, level: 'warning', qty: 65 },
  { name: 'Wheat Flour', emoji: '🌾', expiry: '2026-08-01', days: 126, level: 'warning', qty: 100 },
]

export default function ExpiryAlertsPage() {
  const critical = expiryItems.filter(i => i.level === 'critical')
  const warning = expiryItems.filter(i => i.level === 'warning')

  return (
    <div className="anim-slide">
      <div className="section-header">
        <span className="section-emoji">⚠️</span>
        <h2>Expiry Alerts</h2>
      </div>

      {critical.length > 0 && (
        <>
          <div className="alert alert-danger mb-1">
            <span className="alert-icon">🔴</span>
            <span className="alert-text">{critical.length} products expire within 7 days!</span>
          </div>
          {critical.map(i => (
            <div key={i.name} className="product-card" style={{ borderColor: 'rgba(255,61,61,0.3)' }}>
              <div className="product-emoji">{i.emoji}</div>
              <div className="product-details">
                <div className="product-name">{i.name}</div>
                <div className="product-meta" style={{ color: 'var(--accent-red)' }}>
                  Expires in {i.days} days · {i.qty} units
                </div>
              </div>
              <button className="btn btn-danger" style={{ padding: '0.4rem 0.8rem', fontSize: 'var(--text-xs)', minHeight: 'auto' }}>
                Action
              </button>
            </div>
          ))}
        </>
      )}

      {warning.length > 0 && (
        <div className="mt-2">
          <div className="section-header">
            <span className="section-emoji">🟡</span>
            <h2>Upcoming ({warning.length})</h2>
          </div>
          {warning.map(i => (
            <div key={i.name} className="product-card">
              <div className="product-emoji">{i.emoji}</div>
              <div className="product-details">
                <div className="product-name">{i.name}</div>
                <div className="product-meta">Expires: {i.expiry} · {i.qty} units</div>
              </div>
              <span className="badge badge-orange">{i.days}d</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
