import { useStore } from '../../store/useStore'

export default function ProfilePage() {
  const { role, userName, rewardPoints, logout, isHighContrast, isLargeText, toggleHighContrast, toggleLargeText } = useStore()

  return (
    <div className="anim-slide">
      <div className="text-center mb-2">
        <div style={{
          width: '80px', height: '80px', borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '2rem', margin: '0 auto 0.75rem'
        }}>👤</div>
        <h1 style={{ fontSize: 'var(--text-xl)', fontWeight: 800 }}>{userName || 'Guest User'}</h1>
        <span className="badge badge-blue" style={{ marginTop: '0.25rem' }}>{role.replace('_', ' ')}</span>
      </div>

      {/* Reward points */}
      {role !== 'guest' && (
        <div className="card text-center mb-2" style={{ borderColor: 'rgba(255,214,0,0.3)' }}>
          <div style={{ fontSize: '2rem' }}>⭐</div>
          <div style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, color: 'var(--accent-yellow)' }}>{rewardPoints}</div>
          <div className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Reward Points</div>
        </div>
      )}

      {/* Accessibility settings – icon toggles */}
      <div className="section-header">
        <span className="section-emoji">♿</span>
        <h2>Accessibility</h2>
      </div>

      <div className="gap-row mb-2">
        {[
          { label: 'High Contrast', icon: '◐', active: isHighContrast, toggle: toggleHighContrast },
          { label: 'Large Text', icon: 'A+', active: isLargeText, toggle: toggleLargeText },
        ].map(s => (
          <div key={s.label} className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.8rem 1rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontSize: '1.2rem', width: '30px', textAlign: 'center' }}>{s.icon}</span>
              <span style={{ fontWeight: 600 }}>{s.label}</span>
            </span>
            <button onClick={s.toggle} style={{
              width: '48px', height: '28px', borderRadius: '14px',
              background: s.active ? 'var(--accent-blue)' : 'var(--bg-elevated)',
              border: '1.5px solid var(--border)', padding: '2px', cursor: 'pointer',
              transition: 'all var(--duration) var(--ease)',
            }}>
              <div style={{
                width: '22px', height: '22px', borderRadius: '50%', background: 'white',
                transform: s.active ? 'translateX(20px)' : 'translateX(0)',
                transition: 'transform var(--duration) var(--ease)',
              }} />
            </button>
          </div>
        ))}
      </div>

      {role === 'guest' ? (
        <button className="btn btn-primary btn-xl btn-full btn-icon" id="btn-register">
          📱 Register with Phone
        </button>
      ) : (
        <button className="btn btn-danger btn-full mt-2" onClick={logout}>
          🚪 Logout
        </button>
      )}
    </div>
  )
}
