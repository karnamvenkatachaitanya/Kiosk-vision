import { useState } from 'react'

const pendingOrders = [
  { id: 'KV-045', customer: 'Priya S.', items: 5, total: 487, method: 'UPI' },
  { id: 'KV-044', customer: 'Guest', items: 3, total: 210, method: 'Cash' },
  { id: 'KV-043', customer: 'Ravi K.', items: 8, total: 1120, method: 'UPI' },
]

export default function BillingPage() {
  const [confirmed, setConfirmed] = useState<string[]>([])

  return (
    <div className="anim-slide">
      <div className="section-header">
        <span className="section-emoji">🧾</span>
        <h2>Billing</h2>
      </div>

      {/* Quick barcode scan */}
      <button className="btn btn-primary btn-xl btn-full btn-icon mb-2" id="btn-scan-barcode">
        📊 Scan Barcode to Bill
      </button>

      {/* Pending payments */}
      <div className="section-header mt-2">
        <span className="section-emoji">⏳</span>
        <h2>Pending</h2>
      </div>

      <div className="gap-row stagger">
        {pendingOrders.map(o => (
          <div key={o.id} className={`card ${confirmed.includes(o.id) ? '' : 'card-interactive'}`}
            style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ fontSize: '2rem' }}>{o.method === 'UPI' ? '📱' : '💵'}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{o.id}</div>
              <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>{o.customer} · {o.items} items</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, color: 'var(--accent-green)', fontSize: 'var(--text-lg)' }}>₹{o.total}</div>
              {confirmed.includes(o.id) ? (
                <span className="badge badge-green">Confirmed</span>
              ) : (
                <button className="btn btn-success" style={{ padding: '0.4rem 0.8rem', fontSize: 'var(--text-xs)', minHeight: 'auto' }}
                  onClick={() => setConfirmed([...confirmed, o.id])}>
                  ✅ Confirm
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
