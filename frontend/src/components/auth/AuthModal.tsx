import { useState } from 'react'
import { useStore } from '../../store/useStore'
import { authAPI } from '../../services/api'
import './AuthModal.css'

export default function AuthModal() {
  const { isAuthModalOpen, closeAuthModal, setAuth } = useStore()
  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [phone, setPhone] = useState('')
  const [pin, setPin] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isAuthModalOpen) return null

  const handleNumpadInput = (val: string) => {
    if (val === 'DEL') {
      if (document.activeElement?.id === 'pinInput') {
        setPin(p => p.slice(0, -1))
      } else {
        setPhone(p => p.slice(0, -1))
      }
      return
    }
    if (val === 'CLR') {
      if (document.activeElement?.id === 'pinInput') setPin('')
      else setPhone('')
      return
    }

    if (document.activeElement?.id === 'pinInput') {
      if (pin.length < 4) setPin(p => p + val)
    } else {
      if (phone.length < 10) setPhone(p => p + val)
    }
  }

  const handleSubmit = async () => {
    setError('')
    if (phone.length < 10) return setError('Invalid Phone Number')
    if (pin.length < 4) return setError('PIN must be 4 digits')
    if (mode === 'register' && !name) return setError('Name is required')

    setLoading(true)
    try {
      if (mode === 'login') {
        const res = await authAPI.login(phone, pin)
        if (res.data?.access_token) {
          setAuth(res.data.access_token, res.data.user_id || 'u', res.data.role || 'daily_customer', res.data.name || phone)
        }
      } else {
        const res = await authAPI.register({ name, phone, pin })
        if (res.data?.id) {
          // auto login after register
          const loginRes = await authAPI.login(phone, pin)
          setAuth(loginRes.data.access_token, res.data.id, 'daily_customer', name)
        }
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Authentication failed. Incorrect PIN?')
    }
    setLoading(false)
  }

  return (
    <div className="auth-overlay">
      <div className="auth-modal">
        <button className="close-btn" onClick={closeAuthModal}>✕</button>
        <div className="auth-header">
          <div className="auth-icon">🔐</div>
          <h2>{mode === 'login' ? 'Welcome Back!' : 'Create Account'}</h2>
          <p>{mode === 'login' ? 'Enter your details to sign in.' : 'Join to earn points.'}</p>
        </div>

        {error && <div className="alert alert-danger">{error}</div>}

        <div className="auth-form">
          {mode === 'register' && (
            <div className="input-group">
              <label>Full Name</label>
              <input type="text" placeholder="e.g. John Doe" value={name} onChange={e => setName(e.target.value)} />
            </div>
          )}
          <div className="input-group">
            <label>Phone Number</label>
            <input id="phoneInput" type="tel" maxLength={10} placeholder="10 Digits" value={phone} 
              onChange={e => setPhone(e.target.value)} readOnly />
          </div>
          <div className="input-group">
            <label>4-Digit PIN</label>
            <input id="pinInput" type="password" maxLength={4} placeholder="••••" value={pin} 
              onChange={e => setPin(e.target.value)} readOnly />
          </div>

          <div className="numpad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(n => (
              <button key={n} className="num-btn" onClick={() => handleNumpadInput(n.toString())}>{n}</button>
            ))}
            <button className="num-btn action" onClick={() => handleNumpadInput('DEL')}>⌫</button>
            <button className="num-btn" onClick={() => handleNumpadInput('0')}>0</button>
            <button className="num-btn action" onClick={() => handleNumpadInput('CLR')}>C</button>
          </div>

          <button className="btn btn-primary btn-xl btn-full mt-3 submit-btn" onClick={handleSubmit} disabled={loading}>
            {loading ? 'Processing...' : (mode === 'login' ? 'Sign In' : 'Register')}
          </button>
          
          <button className="btn btn-ghost btn-full mt-2" onClick={() => setMode(mode === 'login' ? 'register' : 'login')}>
            {mode === 'login' ? 'New here? Register now' : 'Already have an account? Sign in'}
          </button>
        </div>
      </div>
    </div>
  )
}
