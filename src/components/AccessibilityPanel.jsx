import { useEffect, useRef } from 'react'
import { TEXT_SIZES, FONTS, SPACINGS } from '../hooks/useAccessibility.js'

export default function AccessibilityPanel({ prefs, set, onClose }) {
  const panelRef = useRef(null)

  useEffect(() => {
    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    function handleKey(e) {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [onClose])

  return (
    <div className="a11y-panel" ref={panelRef} role="region" aria-label="Accessibility preferences">
      <div className="a11y-grid">

        {/* Text size */}
        <div className="a11y-card">
          <p className="a11y-card-title">Text size</p>
          <div className="a11y-size-options">
            {TEXT_SIZES.map((s, i) => (
              <button
                key={s.label}
                className={`a11y-size-btn${prefs.sizeIndex === i ? ' a11y-active' : ''}`}
                style={{ fontSize: s.px + 'px' }}
                onClick={() => set('sizeIndex', i)}
                aria-pressed={prefs.sizeIndex === i}
              >
                {prefs.sizeIndex === i && <span className="a11y-check">✓ </span>}
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Contrast */}
        <div className="a11y-card">
          <p className="a11y-card-title">Contrast</p>
          <div className="a11y-options">
            <button
              className={`a11y-contrast-btn a11y-contrast-normal${prefs.contrast === 'normal' ? ' a11y-active' : ''}`}
              onClick={() => set('contrast', 'normal')}
              aria-pressed={prefs.contrast === 'normal'}
            >
              {prefs.contrast === 'normal' && <span className="a11y-check">✓ </span>}Normal
            </button>
            <button
              className={`a11y-contrast-btn a11y-contrast-high${prefs.contrast === 'high' ? ' a11y-active' : ''}`}
              onClick={() => set('contrast', 'high')}
              aria-pressed={prefs.contrast === 'high'}
            >
              {prefs.contrast === 'high' && <span className="a11y-check">✓ </span>}High contrast
            </button>
          </div>
        </div>

        {/* Font */}
        <div className="a11y-card">
          <p className="a11y-card-title">Font</p>
          <div className="a11y-options">
            {FONTS.map((f) => (
              <button
                key={f.key}
                className={`a11y-option-btn${prefs.fontKey === f.key ? ' a11y-active' : ''}`}
                style={{ fontFamily: f.family }}
                onClick={() => set('fontKey', f.key)}
                aria-pressed={prefs.fontKey === f.key}
              >
                {prefs.fontKey === f.key && <span className="a11y-check">✓ </span>}
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text spacing */}
        <div className="a11y-card">
          <p className="a11y-card-title">Text spacing</p>
          <div className="a11y-options">
            {SPACINGS.map((s) => (
              <button
                key={s.key}
                className={`a11y-option-btn${prefs.spacing === s.key ? ' a11y-active' : ''}`}
                onClick={() => set('spacing', s.key)}
                aria-pressed={prefs.spacing === s.key}
              >
                {prefs.spacing === s.key && <span className="a11y-check">✓ </span>}
                {s.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
