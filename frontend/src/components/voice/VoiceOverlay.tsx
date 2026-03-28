import { useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { useVoice } from '../../hooks/useVoice'

export default function VoiceOverlay() {
  const { isVoiceOverlayOpen, closeVoiceOverlay, lastTranscript } = useStore()
  const { startRecording, stopRecording, isRecording, isProcessing } = useVoice()

  useEffect(() => {
    if (isVoiceOverlayOpen) {
      startRecording()
    } else {
      stopRecording()
    }
  }, [isVoiceOverlayOpen, startRecording, stopRecording])

  if (!isVoiceOverlayOpen) return null

  // Ensure unmounting immediately stops recording 
  // via the useEffect dependency array logic above.

  return (
    <div className="voice-overlay" role="dialog" aria-label="Voice command">
      <div 
        className={`voice-ring ${isProcessing ? 'processing' : ''}`} 
        onClick={isRecording ? stopRecording : undefined} 
        aria-label="Stop listening"
      >
        {isProcessing ? '⏳' : (isRecording ? '⏹️' : '🎙️')}
      </div>

      <div className="voice-transcript">
        {isProcessing ? '🔄 Analyzing your speech...' : 
          lastTranscript || (isRecording ? '🔴 Listening...' : 'Tap mic to speak')}
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
