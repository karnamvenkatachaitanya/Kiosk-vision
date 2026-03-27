import { useStore } from '../../store/useStore'

export default function TopBar() {
  const { isHighContrast, isLargeText, toggleHighContrast, toggleLargeText } = useStore()

  return (
    <header className="top-bar">
      <div className="top-bar-inner">
        <div className="brand">
          <div className="brand-icon">👁️</div>
          <span className="brand-name">Kiosk Vision</span>
        </div>
        <div className="a11y-bar">
          <button className={`a11y-toggle ${isHighContrast ? 'on' : ''}`} onClick={toggleHighContrast} title="High Contrast" aria-label="Toggle high contrast">◐</button>
          <button className={`a11y-toggle ${isLargeText ? 'on' : ''}`} onClick={toggleLargeText} title="Large Text" aria-label="Toggle large text">A+</button>
        </div>
      </div>
    </header>
  )
}
