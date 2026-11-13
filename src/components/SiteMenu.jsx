import { useEffect, useRef, useState } from 'react'
import LineIcon from './LineIcon.jsx'

// Phone header menu (V5 round 6, 2026-11-13): About, How to use this and
// Text & Display sit behind a ☰ Menu button in the top right corner, beside
// Home, instead of a block of buttons under the logo. Hidden on larger
// screens, where those three stay as buttons in the header.
export default function SiteMenu({ onAbout, onHelp, onDisplay, aboutCurrent }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)
  const buttonRef = useRef(null)

  // Escape or a tap outside closes it.
  useEffect(() => {
    if (!open) return undefined
    function onKey(e) {
      if (e.key === 'Escape') { setOpen(false); buttonRef.current?.focus() }
    }
    function onPointer(e) {
      if (!wrapRef.current?.contains(e.target)) setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    document.addEventListener('pointerdown', onPointer)
    return () => {
      window.removeEventListener('keydown', onKey)
      document.removeEventListener('pointerdown', onPointer)
    }
  }, [open])

  function choose(action) {
    return (e) => {
      setOpen(false)
      action(e)
    }
  }

  return (
    <div className="site-menu" ref={wrapRef}>
      <button
        ref={buttonRef}
        type="button"
        className="site-menu-btn"
        aria-expanded={open}
        aria-controls="site-menu-list"
        onClick={() => setOpen((v) => !v)}
      >
        <LineIcon name={open ? 'close' : 'menu'} size={20} /> Menu
      </button>
      {open && (
        <ul className="site-menu-list" id="site-menu-list">
          <li>
            <a
              href="?view=about"
              className="site-menu-item"
              onClick={choose(onAbout)}
              aria-current={aboutCurrent ? 'page' : undefined}
            >
              About EngAGE
            </a>
          </li>
          <li>
            <button type="button" className="site-menu-item" onClick={choose(onHelp)}>
              How to use this
            </button>
          </li>
          <li>
            <button type="button" className="site-menu-item" onClick={choose(onDisplay)}>
              Text &amp; Display
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
