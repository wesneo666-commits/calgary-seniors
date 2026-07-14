import { useState } from 'react'

const KEY = 'csrg-hero-guidance-dismissed'

export default function HeroGuidance() {
  const [dismissed, setDismissed] = useState(() => localStorage.getItem(KEY) === '1')

  if (dismissed) return null

  function dismiss() {
    localStorage.setItem(KEY, '1')
    setDismissed(true)
  }

  return (
    <div className="hero-guidance" role="note">
      <p className="hero-guidance-text">
        <strong>New here?</strong> Type a word like "fitness" or "meals" — or a postal code — to search.
        Use the filters on the left to narrow by location, service type, cost, or format.
        This directory covers non-medical, community-based supports only — not family doctors, specialists, or referral-based medical care.
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
