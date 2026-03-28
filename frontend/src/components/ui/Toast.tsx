import { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react'
import './Toast.css'

/* ─── Types ─── */
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'default'

export interface Toast {
  id: string
  title: string
  message?: string
  type: ToastType
  duration?: number
  action?: {
    label: string
    onClick: () => void
  }
}

interface ToastContextType {
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | null>(null)

/* ─── Hook ─── */
export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within ToastProvider')
  return ctx
}

/* ─── Single Toast Item ─── */
function ToastItem({ toast, onRemove }: { toast: Toast; onRemove: (id: string) => void }) {
  const [exiting, setExiting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const icons: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    default: '●',
  }

  const dismiss = useCallback(() => {
    setExiting(true)
    setTimeout(() => onRemove(toast.id), 300)
  }, [toast.id, onRemove])

  useEffect(() => {
    const duration = toast.duration || 3500
    timerRef.current = setTimeout(dismiss, duration)
    return () => clearTimeout(timerRef.current!)
  }, [toast.duration, dismiss])

  return (
    <div className={`toast-item toast-${toast.type} ${exiting ? 'toast-exit' : 'toast-enter'}`}>
      <div className={`toast-icon-badge toast-icon-${toast.type}`}>
        {icons[toast.type]}
      </div>
      <div className="toast-body">
        <div className="toast-title">{toast.title}</div>
        {toast.message && <div className="toast-message">{toast.message}</div>}
      </div>
      <div className="toast-actions">
        {toast.action && (
          <button className="toast-action-btn" onClick={() => { toast.action!.onClick(); dismiss() }}>
            {toast.action.label}
          </button>
        )}
        <button className="toast-close" onClick={dismiss} aria-label="Dismiss">✕</button>
      </div>
    </div>
  )
}

/* ─── Provider ─── */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
    setToasts(prev => {
      const next = [...prev, { ...toast, id }]
      // max 4 toasts visible
      return next.length > 4 ? next.slice(-4) : next
    })
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      <div className="toast-container">
        {toasts.map(toast => (
          <ToastItem key={toast.id} toast={toast} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
