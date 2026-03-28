import { useStore } from '../../store/useStore'
import { Link } from 'react-router-dom'

export default function CartPage() {
  const { cartItems, cartTotal, updateQuantity, removeFromCart, clearCart } = useStore()
  const tax = Math.round(cartTotal * 0.05)
  const total = cartTotal + tax

  if (cartItems.length === 0) {
    return (
      <div className="anim-slide text-center" style={{ paddingTop: '3rem' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🛒</div>
        <h2 style={{ marginBottom: '0.5rem' }}>Cart is Empty</h2>
        <p className="text-muted mb-2">Add items using voice, scan, or browse</p>
        <div className="mega-grid">
          <Link to="/voice" className="mega-btn accent-blue">
            <span className="mega-icon">🎙️</span><span className="mega-label">Voice</span>
          </Link>
          <Link to="/browse" className="mega-btn accent-green">
            <span className="mega-icon">🛍️</span><span className="mega-label">Browse</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="anim-slide">
      <div className="section-header">
        <span className="section-emoji">🛒</span>
        <h2>My Cart ({cartItems.length})</h2>
      </div>

      {cartItems.map(item => (
        <div key={item.product_id} className="product-card">
          <div className="product-emoji">{item.product_emoji}</div>
          <div className="product-details">
            <div className="product-name">{item.product_name}</div>
            <div className="qty-control" style={{ marginTop: '0.4rem' }}>
              <button className="qty-btn minus" onClick={() => updateQuantity(item.product_id, -1)}>−</button>
              <span className="qty-value">{item.quantity}</span>
              <button className="qty-btn" onClick={() => updateQuantity(item.product_id, 1)}>+</button>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="product-price">₹{item.total_price}</div>
            <button style={{ fontSize: '0.7rem', color: 'var(--accent-red)', marginTop: '0.3rem' }}
              onClick={() => removeFromCart(item.product_id)}>Remove</button>
          </div>
        </div>
      ))}

      {/* Totals */}
      <div className="card mt-2">
        <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span className="text-muted">Subtotal</span>
          <span>₹{cartTotal}</span>
        </div>
        <div className="flex-row" style={{ justifyContent: 'space-between', marginBottom: '0.4rem' }}>
          <span className="text-muted">Tax (5%)</span>
          <span>₹{tax}</span>
        </div>
        <div className="flex-row" style={{
          justifyContent: 'space-between', paddingTop: '0.6rem',
          borderTop: '1px solid var(--border)', fontWeight: 800, fontSize: 'var(--text-xl)'
        }}>
          <span>Total</span>
          <span className="text-green">₹{total}</span>
        </div>
      </div>

      <div className="gap-row mt-2">
        <Link to="/checkout" className="btn btn-success btn-xl btn-full btn-icon">
          ✅ Checkout — ₹{total}
        </Link>
        <button className="btn btn-outline btn-full" onClick={clearCart}>🗑️ Clear Cart</button>
      </div>
    </div>
  )
}
