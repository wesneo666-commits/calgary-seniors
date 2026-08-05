import { useState } from 'react'

const KEY = 'csrg-hero-guidance-dismissed'

export default function HeroGuidance() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(KEY) === '1')
  // On mobile, the full note is long enough to push the results off-screen
  // on first load — collapse it to one line by default there (V4 mobile P0,
  // 2026-07-24). Desktop always shows the full text; CSS ignores this state.
  const [expanded, setExpanded] = useState(false)

  if (dismissed) return null

  function dismiss() {
    localStorage.setItem(KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="hero-guidance" role="note">
      <p className={`hero-guidance-text${expanded ? ' hero-guidance-text--expanded' : ''}`}>
        <strong>New here?</strong> Type a word like "fitness" or "meals" — or a postal code — to search.
        <span className="hero-guidance-more">
          {' '}Use the filters on the left to narrow by location, service type, cost, or format.
          This directory covers non-medical, community-based supports only — not family doctors, specialists, or referral-based medical care.
        </span>
        {!expanded && (
          <button type="button" className="hero-guidance-more-btn" onClick={() => setExpanded(true)}>
            More info
          </button>
        )}
      </p>
      <button
        className="hero-guidance-close"
        onClick={dismiss}
        aria-label="Dismiss this guidance"
        type="button"
      >
        ✕
      </button>
    </div>
  )
}
