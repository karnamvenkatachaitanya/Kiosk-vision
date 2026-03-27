import { useStore } from '../../store/useStore'

export default function VoiceOverlay() {
  const { isVoiceOverlayOpen, closeVoiceOverlay, lastTranscript, isVoiceActive } = useStore()

  if (!isVoiceOverlayOpen) return null

  return (
    <div className="voice-overlay" role="dialog" aria-label="Voice command">
      <div className="voice-ring" onClick={closeVoiceOverlay} aria-label="Stop listening">
        {isVoiceActive ? '⏹️' : '🎙️'}
      </div>

      <div className="voice-transcript">
        {lastTranscript || (isVoiceActive ? '🔴  Listening...' : 'Tap mic to speak')}
      </div>

      <div className="voice-hint">
        Say: "Add 2 kg rice" · "Where is toothpaste?" · "Show my cart"
      </div>

      <button className="btn btn-outline btn-xl" onClick={closeVoiceOverlay} style={{ marginTop: '1rem' }}>
        ✕ Close
      </button>
    </div>
  )
}
