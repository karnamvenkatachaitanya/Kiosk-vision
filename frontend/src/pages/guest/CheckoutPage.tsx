import { useState } from 'react'
import { useStore } from '../../store/useStore'

export default function CheckoutPage() {
  const { cartItems, cartTotal, deliveryType, setDeliveryType, clearCart, rewardPoints } = useStore()
  const [step, setStep] = useState<'delivery' | 'payment' | 'done'>('delivery')
  const tax = Math.round(cartTotal * 0.05)
  const total = cartTotal + tax

  if (step === 'done') {
    return (
      <div className="anim-slide text-center" style={{ paddingTop: '3rem' }}>
        <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>✅</div>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>Order Placed!</h1>
        <p className="text-muted mb-2">Order #KV-2026-001</p>
        <div className="card" style={{ textAlign: 'left' }}>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 800, color: 'var(--accent-green)', marginBottom: '0.5rem' }}>₹{total}</div>
          <div className="text-muted">{cartItems.length} items · {deliveryType.replace('_', ' ')}</div>
        </div>
        <p style={{ color: 'var(--accent-green)', fontWeight: 600, marginTop: '1rem' }}>
          +{Math.floor(total / 10)} reward points earned! 🎉
        </p>
      </div>
    )
  }

  return (
    <div className="anim-slide">
      <div className="section-header">
        <span className="section-emoji">{step === 'delivery' ? '🚚' : '💳'}</span>
        <h2>{step === 'delivery' ? 'Delivery' : 'Payment'}</h2>
      </div>

      {step === 'delivery' && (
        <>
          <div className="mega-grid cols-1 stagger">
            <button className={`mega-btn ${deliveryType === 'pickup' ? 'accent-blue' : ''}`}
              onClick={() => setDeliveryType('pickup')}
              style={{ flexDirection: 'row', gap: '1rem', justifyContent: 'flex-start', paddingLeft: '1.5rem' }}>
              <span className="mega-icon">🏪</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Pickup</div>
                <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Collect at counter</div>
              </div>
            </button>
            <button className={`mega-btn ${deliveryType === 'service_boy' ? 'accent-green' : ''}`}
              onClick={() => setDeliveryType('service_boy')}
              style={{ flexDirection: 'row', gap: '1rem', justifyContent: 'flex-start', paddingLeft: '1.5rem' }}>
              <span className="mega-icon">🧑‍💼</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Service Boy</div>
                <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Delivered to you in-store</div>
              </div>
            </button>
            <button className={`mega-btn ${deliveryType === 'home_delivery' ? 'accent-orange' : ''}`}
              onClick={() => setDeliveryType('home_delivery')}
              style={{ flexDirection: 'row', gap: '1rem', justifyContent: 'flex-start', paddingLeft: '1.5rem' }}>
              <span className="mega-icon">🏠</span>
              <div style={{ textAlign: 'left' }}>
                <div style={{ fontWeight: 700, fontSize: 'var(--text-base)' }}>Home Delivery</div>
                <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Delivered to your door</div>
              </div>
            </button>
          </div>
          <button className="btn btn-primary btn-xl btn-full mt-2" onClick={() => setStep('payment')}>
            Continue → Payment
          </button>
        </>
      )}

      {step === 'payment' && (
        <>
          {rewardPoints > 0 && (
            <div className="alert alert-info mb-2">
              <span className="alert-icon">⭐</span>
              <span className="alert-text">You have {rewardPoints} reward points (₹{Math.floor(rewardPoints / 10)} value)</span>
            </div>
          )}
          <div className="mega-grid stagger">
            <button className="mega-btn accent-blue" onClick={() => { clearCart(); setStep('done') }}>
              <span className="mega-icon">📱</span>
              <span className="mega-label">UPI / QR</span>
            </button>
            <button className="mega-btn accent-green" onClick={() => { clearCart(); setStep('done') }}>
              <span className="mega-icon">💵</span>
              <span className="mega-label">Cash</span>
            </button>
          </div>
          <div className="card mt-2 text-center">
            <div className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>Amount to Pay</div>
            <div style={{ fontSize: 'var(--text-3xl)', fontWeight: 800, color: 'var(--accent-green)' }}>₹{total}</div>
          </div>
        </>
      )}
    </div>
  )
}
