import { useState } from 'react'

export default function ScanPage() {
  const [mode, setMode] = useState<'barcode' | 'label' | 'list'>('barcode')

  return (
    <div className="anim-slide">
      <div className="section-header">
        <span className="section-emoji">📷</span>
        <h2>Scan</h2>
      </div>

      {/* Mode selector – big icons */}
      <div className="mega-grid cols-3 mb-2">
        <button className={`mega-btn ${mode === 'barcode' ? 'accent-blue' : ''}`} onClick={() => setMode('barcode')}>
          <span className="mega-icon">📊</span>
          <span className="mega-label">Barcode</span>
        </button>
        <button className={`mega-btn ${mode === 'label' ? 'accent-green' : ''}`} onClick={() => setMode('label')}>
          <span className="mega-icon">🏷️</span>
          <span className="mega-label">Label</span>
        </button>
        <button className={`mega-btn ${mode === 'list' ? 'accent-orange' : ''}`} onClick={() => setMode('list')}>
          <span className="mega-icon">📝</span>
          <span className="mega-label">List</span>
        </button>
      </div>

      {/* Camera viewport */}
      <div className="gesture-viewport" style={{ marginBottom: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', background: 'var(--bg-secondary)' }}>
          <div className="text-center">
            <div style={{ fontSize: '3rem', marginBottom: '0.5rem' }}>
              {mode === 'barcode' ? '📊' : mode === 'label' ? '🏷️' : '📝'}
            </div>
            <p className="text-muted" style={{ fontSize: 'var(--text-sm)' }}>
              {mode === 'barcode' ? 'Point at barcode' : mode === 'label' ? 'Point at product label' : 'Point at handwritten list'}
            </p>
          </div>
        </div>
      </div>

      <button className="btn btn-primary btn-xl btn-full btn-icon" id="btn-open-camera">
        📷 Open Camera
      </button>

      <div className="card mt-2">
        <h3 style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>Recent Scans</h3>
        <p className="text-muted" style={{ fontSize: 'var(--text-xs)' }}>No scans yet — point your camera to begin</p>
      </div>
    </div>
  )
}
