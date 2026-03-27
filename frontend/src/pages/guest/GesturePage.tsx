export default function GesturePage() {
  return (
    <div className="anim-slide">
      <div className="section-header">
        <span className="section-emoji">🤌</span>
        <h2>Gesture Control</h2>
      </div>

      {/* Camera viewport */}
      <div className="gesture-viewport mb-2">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg-secondary)' }}>
          <div className="text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>🖐️</div>
            <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>Show your hand to the camera</p>
          </div>
        </div>
        <div className="gesture-overlay">
          <div className="gesture-badge">👆 Point Detected</div>
          <span className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>Confidence: 85%</span>
        </div>
      </div>

      <button className="btn btn-primary btn-xl btn-full btn-icon mb-2" id="btn-start-gesture">
        🎥 Start Camera
      </button>

      {/* Gesture guide – icon-heavy for illiterate users */}
      <div className="section-header mt-2">
        <span className="section-emoji">📖</span>
        <h2>Gesture Guide</h2>
      </div>

      <div className="mega-grid stagger">
        <div className="mega-btn">
          <span className="mega-icon">👆</span>
          <span className="mega-label">Select</span>
        </div>
        <div className="mega-btn">
          <span className="mega-icon">👍</span>
          <span className="mega-label">Confirm</span>
        </div>
        <div className="mega-btn">
          <span className="mega-icon">👎</span>
          <span className="mega-label">Cancel</span>
        </div>
        <div className="mega-btn">
          <span className="mega-icon">👋</span>
          <span className="mega-label">Hello</span>
        </div>
        <div className="mega-btn">
          <span className="mega-icon">👈</span>
          <span className="mega-label">Back</span>
        </div>
        <div className="mega-btn">
          <span className="mega-icon">🖐️</span>
          <span className="mega-label">Stop</span>
        </div>
      </div>
    </div>
  )
}
