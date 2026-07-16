import { useState, useEffect } from 'react'

export const TEXT_SIZES = [
  { label: 'Small',   px: 16 },
  { label: 'Medium',  px: 19 },
  { label: 'Large',   px: 22 },
  { label: 'Maximum', px: 26 },
]

export const FONTS = [
  { key: 'standard', label: 'Standard (Hyperlegible)', family: "'Atkinson Hyperlegible', 'Segoe UI', system-ui, sans-serif" },
  { key: 'readable', label: 'Readable (Arial)',  family: 'Arial, Helvetica, sans-serif' },
  { key: 'wide',     label: 'Spacious (Verdana)', family: 'Verdana, Geneva, sans-serif' },
]

export const SPACINGS = [
  { key: 'normal',  label: 'Normal'  },
  { key: 'relaxed', label: 'Relaxed' },
  { key: 'wide',    label: 'Wide'    },
]

const KEY = 'csrg-accessibility'

export const DEFAULT_PREFS = { sizeIndex: 1, contrast: 'normal', fontKey: 'standard', spacing: 'normal' }

function load() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}')
    return {
      sizeIndex: typeof stored.sizeIndex === 'number' ? stored.sizeIndex : DEFAULT_PREFS.sizeIndex,
      contrast:  stored.contrast  || DEFAULT_PREFS.contrast,
      fontKey:   stored.fontKey   || DEFAULT_PREFS.fontKey,
      spacing:   stored.spacing   || DEFAULT_PREFS.spacing,
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
    html.dataset.contrast = prefs.contrast
    html.dataset.spacing  = prefs.spacing

    const font = FONTS.find((f) => f.key === prefs.fontKey)
    html.style.setProperty('--font-base', font ? font.family : "'Atkinson Hyperlegible', 'Segoe UI', system-ui, sans-serif")

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
