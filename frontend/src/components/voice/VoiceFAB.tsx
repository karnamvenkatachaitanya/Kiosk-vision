import { useStore } from '../../store/useStore'

export default function VoiceFAB() {
  const { isVoiceOverlayOpen, openVoiceOverlay } = useStore()
  if (isVoiceOverlayOpen) return null

  return (
    <button className="voice-fab" onClick={openVoiceOverlay} aria-label="Voice command" id="voice-fab">
      🎙️
    </button>
  )
}
