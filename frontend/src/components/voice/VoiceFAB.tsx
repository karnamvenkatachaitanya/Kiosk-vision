import { useStore } from '../../store/useStore'
import { Mic } from 'lucide-react'

export default function VoiceFAB() {
  const { isVoiceOverlayOpen, openVoiceOverlay } = useStore()
  if (isVoiceOverlayOpen) return null

  return (
    <button className="voice-fab" onClick={openVoiceOverlay} aria-label="Voice command" id="voice-fab">
      <Mic size={32} strokeWidth={2.5} />
    </button>
  )
}
