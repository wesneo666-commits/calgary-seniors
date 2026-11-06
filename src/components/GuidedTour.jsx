import { useState, useEffect, useLayoutEffect, useRef, useCallback } from 'react'

// First-visit guided tour (2026-10-20 review, B-04): dims the page, lights up
// one control at a time and explains it in a small card with Back / Next.
// Each step is animated: the spotlight glides to the next control, a pointer
// travels with it and taps it, then the card pops out from the control.
// Asked for because round 1 testers didn't know what "filters" meant and
// skipped filters they had to scroll to see.
//
// A step's `target` is a list of selectors; the first one visible on this
// screen is used, so phones point at the Filters button rather than the
// hidden drawer. A target can carry its own body text for that case. Steps
// with nothing visible (voice search on small phones) are skipped, which is
// how one list serves both the landing page and the directory.
const STEPS = [
  {
    title: 'Welcome to EngAGE',
    body: 'EngAGE is a trusted online directory of non-medical, community-based services in Calgary. This short tour shows you the main parts of the directory. It takes about a minute, and you can close it at any time.',
  },
  {
    target: ['.search-input-wrap'],
    title: 'Search in your own words',
    body: 'Type what you are looking for, such as "exercise classes" or "help getting to appointments." You can also type a postal code, like T2N, to find services near you.',
  },
  {
    target: ['.search-btn'],
    title: 'Then press Search',
    body: 'Press the Search button, or the Enter key, to see your results.',
  },
  {
    target: ['.voice-btn'],
    title: 'Or say it out loud',
    body: 'Select Voice search and speak instead of typing.',
  },
  {
    target: [
      { selector: '.filter-aside .filter-panel' },
      {
        selector: '.mobile-filter-btn',
        body: 'Tap this button to show only the services that suit you. For example, only free services, or only ones in your part of the city.',
      },
      {
        // Landing page: the four Location / Service Type / Cost / Format buttons
        selector: '.landing-filters',
        body: 'Choose Service Type, Location, Cost or Format to see only the services that suit you. For example, only free services, or only ones in your part of the city.',
      },
    ],
    title: 'Narrow the list with filters',
    body: 'Filters show only the services that suit you. For example, only free services, or only ones in your part of the city. Choose as many as you like, and scroll down to see them all.',
  },
  {
    // Landing page only; skipped in the directory, where the cards are shown
    target: ['.landing-browse-btn'],
    title: 'Or see everything',
    body: 'Select Browse Full Directory to see every service, then narrow the list from there.',
  },
  {
    target: ['.results-list .program-card'],
    title: 'Select a service to learn more',
    body: 'Each card shows a service and who runs it. Select one to see the full details, including how to contact them. You can print or share it from there.',
  },
  {
    target: ['.a11y-toggle-btn'],
    title: 'Make the text easier to read',
    body: 'Use Text & Display to make the words bigger or change the colours.',
  },
  {
    target: ['.help-btn'],
    title: 'Help is always here',
    body: 'Select How to use this whenever you need a reminder. You can take this tour again from there.',
  },
]

// Brand dressing (V5 round 3): each step after the welcome takes the next of
// the five ring colours, so the walk-through moves through the logo's palette.
const ACCENTS = ['slate', 'sage', 'plum', 'amber', 'ember']
const ASSET = import.meta.env.BASE_URL

const FOCUSABLE = 'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])'
const GAP = 14     // space between the lit-up control and the card
const MARGIN = 12  // keep the card this far from the screen edge
const PAD = 6      // spotlight padding around the control
const GLIDE_MS = 550   // spotlight and pointer travel time (matches the CSS)
const SCROLL_WAIT_MS = 700  // fallback where the browser lacks 'scrollend'

function prefersReducedMotion() {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}

function isVisible(el) {
  if (!el) return false
  const style = window.getComputedStyle(el)
  if (style.display === 'none' || style.visibility === 'hidden') return false
  const r = el.getBoundingClientRect()
  return r.width > 0 && r.height > 0 && r.right > 0 && r.left < window.innerWidth
}

// The element (and any screen-specific body text) a step points at, or
// null when the step has no target or none of its targets are on screen.
function resolveTarget(step) {
  for (const t of step.target ?? []) {
    const { selector, body } = typeof t === 'string' ? { selector: t } : t
    const el = document.querySelector(selector)
    if (isVisible(el)) return { el, body }
  }
  return null
}

function isAvailable(step) {
  return !step.target || resolveTarget(step) !== null
}

// Where the card goes relative to the lit-up box: below, above, right or
// left — whichever fits first. If none fit (a tall filter panel on a short
// screen) it docks to the top or bottom edge, away from the control.
function placeCard(hole, card) {
  const vw = window.innerWidth
  const vh = window.innerHeight
  const clampX = (x) => Math.min(Math.max(x, MARGIN), vw - card.width - MARGIN)
  const clampY = (y) => Math.min(Math.max(y, MARGIN), vh - card.height - MARGIN)
  const centreX = hole.left + hole.width / 2
  const centreY = hole.top + hole.height / 2

  if (hole.bottom + GAP + card.height + MARGIN <= vh) {
    const left = clampX(centreX - card.width / 2)
    return { top: hole.bottom + GAP, left, side: 'bottom', arrow: centreX - left }
  }
  if (hole.top - GAP - card.height - MARGIN >= 0) {
    const left = clampX(centreX - card.width / 2)
    return { top: hole.top - GAP - card.height, left, side: 'top', arrow: centreX - left }
  }
  if (hole.right + GAP + card.width + MARGIN <= vw) {
    const top = clampY(centreY - card.height / 2)
    return { top, left: hole.right + GAP, side: 'right', arrow: centreY - top }
  }
  if (hole.left - GAP - card.width - MARGIN >= 0) {
    const top = clampY(centreY - card.height / 2)
    return { top, left: hole.left - GAP - card.width, side: 'left', arrow: centreY - top }
  }
  const dockTop = centreY > vh / 2
  return {
    top: dockTop ? MARGIN : vh - card.height - MARGIN,
    left: clampX((vw - card.width) / 2),
    side: null,
  }
}

// A zero-size spotlight in the middle of the screen: the whole page dims,
// and the first real step grows the spotlight out from here.
function centreHole() {
  const left = window.innerWidth / 2
  const top = window.innerHeight / 2
  return { top, left, width: 0, height: 0, right: left, bottom: top }
}

function holeAround(el) {
  const r = el.getBoundingClientRect()
  // Clamp to the screen so a tall panel's spotlight doesn't run off it, and
  // never above the top edge while the control is still off screen.
  const top = Math.max(r.top - PAD, 4)
  const bottom = Math.max(Math.min(r.bottom + PAD, window.innerHeight - 4), top)
  const left = r.left - PAD
  const width = r.width + PAD * 2
  return { top, left, width, height: bottom - top, right: left + width, bottom }
}

// Where the pointer's tip lands: the middle of the control, or near the top
// of a tall one (the filter panel) so it points at the heading.
function pointerSpot(hole) {
  return { x: hole.left + hole.width / 2, y: hole.top + Math.min(hole.height / 2, 48) }
}

function PointerIcon() {
  return (
    <svg width="40" height="44" viewBox="0 0 26 30" aria-hidden="true">
      <path
        d="M3 2v21l5.5-5.2 3.6 8.6 4-1.7-3.6-8.4H20z"
        fill="#fff"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default function GuidedTour({ onClose }) {
  const [index, setIndex] = useState(0)
  // 'moving' while the page scrolls and the spotlight glides over; 'shown'
  // once the pointer has tapped and the card is up.
  const [phase, setPhase] = useState('moving')
  const [hole, setHole] = useState(centreHole)
  const [glide, setGlide] = useState(false)
  const [pos, setPos] = useState(null)
  const cardRef = useRef(null)
  const primaryRef = useRef(null)
  const prevElRef = useRef(null)

  const step = STEPS[index]
  const resolved = step.target ? resolveTarget(step) : null
  const body = resolved?.body ?? step.body

  // Step numbers count only the steps that apply on this screen, so a phone
  // without voice search reads "Step 3 of 6", not "of 7".
  const available = STEPS.map(isAvailable)
  const total = available.filter(Boolean).length
  const position = available.slice(0, index + 1).filter(Boolean).length
  const isLast = !available.slice(index + 1).some(Boolean)

  const go = useCallback((dir) => {
    let i = index + dir
    while (i >= 0 && i < STEPS.length && !isAvailable(STEPS[i])) i += dir
    if (i < 0) return
    if (i >= STEPS.length) onClose()
    else setIndex(i)
  }, [index, onClose])

  // Each step: hide the card, scroll the control into view (the spotlight
  // rides along on the previous control meanwhile), glide the spotlight and
  // pointer onto it, then show the card. After that the spotlight sticks to
  // the control, without the glide, if the page scrolls or resizes.
  useLayoutEffect(() => {
    const reduced = prefersReducedMotion()
    const el = resolved?.el ?? null
    const timers = []
    let settled = false
    setPhase('moving')

    function measure(target) {
      const card = cardRef.current?.getBoundingClientRect()
      if (!card) return
      if (!target) {
        setHole(centreHole())
        setPos({
          top: Math.max((window.innerHeight - card.height) / 2, MARGIN),
          left: Math.max((window.innerWidth - card.width) / 2, MARGIN),
          side: null,
        })
        return
      }
      const h = holeAround(target)
      setHole(h)
      setPos(placeCard(h, card))
    }

    function settle() {
      if (settled) return
      settled = true
      prevElRef.current = el
      setGlide(!reduced)
      measure(el)
      timers.push(setTimeout(() => {
        setGlide(false)
        setPhase('shown')
      }, reduced ? 0 : GLIDE_MS))
    }

    function follow() {
      if (!settled) {
        if (prevElRef.current) measure(prevElRef.current)
        return
      }
      setGlide(false)
      measure(el)
    }

    let scrolling = false
    if (el) {
      // Centre the control and its card together when both fit on screen,
      // so the card can sit below without covering it (phones especially);
      // otherwise bring the control to the top.
      const r = el.getBoundingClientRect()
      const combined = r.height + GAP + (cardRef.current?.offsetHeight ?? 0)
      const vh = window.innerHeight
      const desiredTop = combined + MARGIN * 2 <= vh ? (vh - combined) / 2 : MARGIN
      const maxScroll = document.documentElement.scrollHeight - vh
      const top = Math.min(Math.max(window.scrollY + r.top - desiredTop, 0), maxScroll)
      if (Math.abs(top - window.scrollY) > 2) {
        scrolling = true
        window.scrollTo({ top, behavior: reduced ? 'auto' : 'smooth' })
      }
    }
    if (scrolling && !reduced) {
      window.addEventListener('scrollend', settle, { once: true })
      timers.push(setTimeout(settle, SCROLL_WAIT_MS))
    } else {
      settle()
    }

    window.addEventListener('scroll', follow, true)
    window.addEventListener('resize', follow)
    return () => {
      timers.forEach(clearTimeout)
      window.removeEventListener('scrollend', settle)
      window.removeEventListener('scroll', follow, true)
      window.removeEventListener('resize', follow)
    }
    // resolved.el is derived from index; re-run per step only.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  // Focus the main button once the card is up, so keyboard and screen-reader
  // users land in it; Escape closes; Tab stays inside the card.
  const shown = phase === 'shown'
  useEffect(() => {
    if (shown) primaryRef.current?.focus({ preventScroll: true })
  }, [index, shown])

  useEffect(() => {
    const previouslyFocused = document.activeElement
    function handleKey(e) {
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'Tab' && cardRef.current) {
        const focusable = [...cardRef.current.querySelectorAll(FOCUSABLE)]
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus() }
        }
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      previouslyFocused?.focus?.({ preventScroll: true })
    }
  }, [onClose])

  const isWelcome = index === 0
  const hasTarget = Boolean(resolved)
  const spot = pointerSpot(hole)
  const stepDots = available.map((ok, i) => (ok && i > 0 ? i : null)).filter((i) => i !== null)

  return (
    <div className="tour-root">
      {/* Catches clicks on the dimmed page so nothing underneath changes mid-tour. */}
      <div className="tour-blocker" aria-hidden="true" />

      {/* Its huge outer shadow is the dimmed page; the box itself is the
          lit-up control. Glides between controls via CSS transitions. */}
      <div
        className={[
          'tour-spotlight',
          glide && 'tour-spotlight--glide',
          !hasTarget && 'tour-spotlight--empty',
          shown && hasTarget && 'tour-spotlight--live',
        ].filter(Boolean).join(' ')}
        aria-hidden="true"
        style={{
          transform: `translate(${hole.left}px, ${hole.top}px)`,
          width: hole.width,
          height: hole.height,
        }}
      />

      <div
        className={[
          'tour-pointer',
          glide && 'tour-pointer--glide',
          hasTarget && 'tour-pointer--visible',
        ].filter(Boolean).join(' ')}
        aria-hidden="true"
        style={{ transform: `translate(${spot.x}px, ${spot.y}px)` }}
      >
        {/* Keyed by step so the tap and ripple replay on every control. */}
        <span key={`${index}-${shown}`} className={`tour-pointer-inner${shown ? ' tour-pointer-inner--tap' : ''}`}>
          <span className="tour-ripple" />
          <PointerIcon />
        </span>
      </div>

      <div
        ref={cardRef}
        className={[
          'tour-card',
          pos?.side && `tour-card--${pos.side}`,
          shown && pos && 'tour-card--shown',
          isWelcome ? 'tour-card--welcome' : `tour-card--${ACCENTS[(position - 2) % ACCENTS.length]}`,
        ].filter(Boolean).join(' ')}
        role="dialog"
        aria-modal="true"
        aria-labelledby="tour-title"
        aria-describedby="tour-body"
        style={pos ? { top: pos.top, left: pos.left, '--tour-arrow': `${pos.arrow ?? 0}px` } : undefined}
      >
        {pos?.side && <span className="tour-arrow" aria-hidden="true" />}

        <div className="tour-card-head">
          {isWelcome ? (
            <img className="tour-logo" src={`${ASSET}engage-logo.svg`} alt="EngAGE: Calgary Directory for Aging Well" />
          ) : (
            <p className="tour-progress">
              <img className="tour-mark" src={`${ASSET}engage-mark.svg`} alt="" />
              Step {position - 1} of {total - 1}
            </p>
          )}
          <button type="button" className="tour-close" onClick={onClose} aria-label="Close the tour">
            <span aria-hidden="true">✕</span>
          </button>
        </div>

        <h2 id="tour-title" className="tour-title" aria-live="polite">{step.title}</h2>
        <p id="tour-body" className="tour-body">{body}</p>

        {!isWelcome && (
          <ol className="tour-dots" aria-hidden="true">
            {stepDots.map((i) => (
              <li
                key={i}
                className={`tour-dot${i === index ? ' tour-dot--current' : i < index ? ' tour-dot--done' : ''}`}
              />
            ))}
          </ol>
        )}

        <div className="tour-actions">
          {isWelcome ? (
            <button type="button" className="tour-btn tour-btn--secondary" onClick={onClose}>
              No thanks
            </button>
          ) : (
            <button type="button" className="tour-btn tour-btn--secondary" onClick={() => go(-1)}>
              ← Back
            </button>
          )}
          <button
            ref={primaryRef}
            type="button"
            className="tour-btn tour-btn--primary"
            onClick={() => go(1)}
          >
            {isWelcome ? 'Show me around' : isLast ? 'Finish' : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}
