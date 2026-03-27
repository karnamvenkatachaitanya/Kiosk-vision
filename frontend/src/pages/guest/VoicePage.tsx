import { useStore } from '../../store/useStore'

export default function VoicePage() {
  const { openVoiceOverlay } = useStore()

  return (
    <div className="anim-slide">
      <div className="text-center" style={{ paddingTop: '2rem' }}>
        <h1 style={{ fontSize: 'var(--text-2xl)', fontWeight: 800, marginBottom: '0.5rem' }}>🎙️ Voice Order</h1>
        <p className="text-muted mb-2">Speak your shopping list</p>
      </div>

      {/* Giant voice button */}
      <div className="text-center" style={{ padding: '2rem 0' }}>
        <button className="voice-ring" onClick={openVoiceOverlay}
          style={{ width: '160px', height: '160px', fontSize: '4rem', margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-blue), var(--accent-purple))', border: 'none', cursor: 'pointer' }}>
          🎙️
        </button>
        <p style={{ color: 'var(--accent-blue)', fontWeight: 600, marginTop: '1.5rem', fontSize: 'var(--text-lg)' }}>
          Tap to speak
        </p>
      </div>

      {/* Example utterances – visual hints */}
      <div className="section-header mt-3">
        <span className="section-emoji">💡</span>
        <h2>Try Saying</h2>
      </div>
      <div className="gap-row">
        {[
          { emoji: '🌾', text: '"2 kg rice and 1 kg sugar"' },
          { emoji: '🔍', text: '"Where is toothpaste?"' },
          { emoji: '🛒', text: '"Show my cart"' },
          { emoji: '🥛', text: '"Add bread and milk"' },
        ].map(ex => (
          <div key={ex.text} className="card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.8rem 1rem' }}>
            <span style={{ fontSize: '1.5rem' }}>{ex.emoji}</span>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{ex.text}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
