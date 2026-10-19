import { useEffect, useRef } from 'react'
import { TEXT_SIZES } from '../hooks/useAccessibility.js'

export default function AccessibilityPanel({ prefs, set, reset, onClose }) {
  const panelRef = useRef(null)
  const closeButtonRef = useRef(null)

  useEffect(() => {
    const previouslyFocused = document.activeElement

    function handleClick(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) onClose()
    }
    function handleKey(e) {
      if (e.key === 'Escape') {
        onClose()
        return
      }

      if (e.key !== 'Tab' || !panelRef.current) return

      const focusable = [...panelRef.current.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )]
      if (focusable.length === 0) return

      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }

    closeButtonRef.current?.focus()
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
      previouslyFocused?.focus?.()
    }
  }, [onClose])

  return (
    <div
      className="a11y-panel"
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="display-settings-title"
    >
      <div className="a11y-panel-header">
        <h2 id="display-settings-title">Text &amp; Display</h2>
        <button
          ref={closeButtonRef}
          type="button"
          className="a11y-panel-close"
          onClick={onClose}
          aria-label="Close Text and Display settings"
        >
          <span aria-hidden="true">X</span>
        </button>
      </div>
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

      </div>

      <div className="a11y-reset-row">
        <button type="button" className="a11y-reset-btn" onClick={reset}>
          ↺ Reset to Default
        </button>
      </div>
    </div>
  )
}
