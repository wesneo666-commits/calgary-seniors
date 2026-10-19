import { useState, useEffect } from 'react'

export const TEXT_SIZES = [
  { label: 'Small',   px: 16 },
  { label: 'Medium',  px: 19 },
  { label: 'Large',   px: 22 },
  { label: 'Maximum', px: 26 },
]

// Font and spacing are no longer user choices (V5 DS-01): the most
// accessible options are applied for everyone — Atkinson Hyperlegible with
// relaxed spacing. Only text size and contrast remain adjustable.
const FONT_FAMILY = "'Atkinson Hyperlegible', 'Segoe UI', system-ui, sans-serif"
const SPACING = 'relaxed'

const KEY = 'csrg-accessibility'

export const DEFAULT_PREFS = { sizeIndex: 1, contrast: 'normal' }

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}')
    return {
      sizeIndex: typeof stored.sizeIndex === 'number' ? stored.sizeIndex : DEFAULT_PREFS.sizeIndex,
      contrast:  stored.contrast  || DEFAULT_PREFS.contrast,
    }
  } catch {
    return { ...DEFAULT_PREFS }
  }
}

export function useAccessibility() {
  const [prefs, setPrefs] = useState(load)

  useEffect(() => {
    const html = document.documentElement
    html.style.fontSize = TEXT_SIZES[prefs.sizeIndex].px + 'px'
    html.dataset.textSize = String(prefs.sizeIndex)
    html.dataset.contrast = prefs.contrast
    html.dataset.spacing  = SPACING
    html.style.setProperty('--font-base', FONT_FAMILY)

    localStorage.setItem(KEY, JSON.stringify(prefs))
  }, [prefs])

  function set(key, value) {
    setPrefs((p) => ({ ...p, [key]: value }))
  }

  function reset() {
    setPrefs({ ...DEFAULT_PREFS })
  }

  return { prefs, set, reset }
}
