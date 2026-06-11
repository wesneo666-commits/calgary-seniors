import { useState, useEffect } from 'react'

const SIZES = [
  { label: 'A',   px: 16 },
  { label: 'A+',  px: 19 },
  { label: 'A++', px: 22 },
]

const STORAGE_KEY = 'csrg-font-size'

export { SIZES }

export function useFontSize() {
  const [sizeIndex, setSizeIndex] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    const idx = SIZES.findIndex((s) => String(s.px) === stored)
    return idx >= 0 ? idx : 0
  })

  useEffect(() => {
    document.documentElement.style.fontSize = SIZES[sizeIndex].px + 'px'
    localStorage.setItem(STORAGE_KEY, String(SIZES[sizeIndex].px))
  }, [sizeIndex])

  return { sizeIndex, setSizeIndex }
}
