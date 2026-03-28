import { useEffect } from 'react'
import { useStore } from '../../store/useStore'
import { useVoice } from '../../hooks/useVoice'
import { Mic, Square, Loader2, X } from 'lucide-react'

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

  return (
    <div className="voice-overlay anim-fade" role="dialog" aria-label="Voice command">
      <div 
        className={`voice-ring ${isProcessing ? 'processing' : ''}`} 
        onClick={isRecording ? stopRecording : undefined} 
        aria-label="Stop listening"
      >
        {isProcessing ? (
          <Loader2 className="anim-spin" size={48} strokeWidth={2.5} />
        ) : isRecording ? (
          <Square fill="currentColor" size={40} />
        ) : (
          <Mic size={48} strokeWidth={2.5} />
        )}
        
        {(isRecording || isProcessing) && (
          <div className="voice-dots">
            <div className="voice-dot"></div>
            <div className="voice-dot"></div>
            <div className="voice-dot"></div>
            <div className="voice-dot"></div>
            <div className="voice-dot"></div>
          </div>
        )}
      </div>

      <div className="voice-transcript">
        {isProcessing ? 'Analyzing your speech...' : 
          lastTranscript || (isRecording ? 'Listening...' : 'Tap mic to speak')}
      </div>

      <div className="voice-hint">
        Say: "Add 2 kg rice" · "Where is toothpaste?" · "Show my cart"
      </div>

      <button className="btn btn-outline btn-xl" onClick={closeVoiceOverlay} style={{ marginTop: '2rem' }}>
        <X size={20} />
        Close
      </button>
    </div>
  )
}
