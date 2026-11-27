import { useEffect, useRef, useState } from 'react'
import { SERVICE_AREA_GROUPS, GROUP_ICONS, serviceAreaLabel, serviceGroupSlug } from '../utils/constants.js'

// Every typed word must appear somewhere in the text, in any order, so
// "education" finds "Learning & education" and "home care" finds "Home care".
function matches(text, words) {
  const t = text.toLowerCase()
  return words.every((w) => t.includes(w))
}

// The groups and items left once the typed words are applied. A group whose
// own name matches keeps all of its items.
function filterGroups(query) {
  const words = query.toLowerCase().replace(/&/g, ' ').split(/\s+/).filter(Boolean)
  if (words.length === 0) return SERVICE_AREA_GROUPS
  return SERVICE_AREA_GROUPS.flatMap((group) => {
    if (matches(group.group, words)) return [group]
    const items = group.items.filter((item) => matches(item.label, words))
    return items.length ? [{ ...group, items }] : []
  })
}

// Several service types can be ticked (V5, 2026-11-13): choosing one keeps
// the list open; "All" clears them. `value` is an array of '_group_X' and
// subcategory values.
export default function ServiceTypeSelect({ value = [], onChange, labelledBy }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const wrapRef = useRef(null)
  const searchRef = useRef(null)

  // Start each opening with an empty search box. Focus it straight away on
  // a computer; on a phone that would pop the keyboard over the list, so
  // people tap the box when they want to type.
  useEffect(() => {
    if (!open) return
    setQuery('')
    if (window.matchMedia?.('(pointer: fine)').matches) searchRef.current?.focus()
  }, [open])

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    function handleKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    window.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      window.removeEventListener('keydown', handleKey)
    }
  }, [])

  const first = value[0]
  const triggerSlug = !first
    ? null
    : first.startsWith('_group_')
      ? GROUP_ICONS[first.slice(7)]?.slug
      : serviceGroupSlug(first)
  const triggerLabel = value.length === 0
    ? 'All'
    : value.length === 1
      ? serviceAreaLabel(first)
      : `${value.length} service types`

  const isOn = (v) => value.includes(v)
  const groups = filterGroups(query)

  function pick(v) {
    if (v === '') {
      onChange([])
      setOpen(false)
      return
    }
    onChange(isOn(v) ? value.filter((x) => x !== v) : [...value, v])
  }

  return (
    <div className="service-select-wrap" ref={wrapRef}>
      <button
        type="button"
        className="filter-select service-select-trigger"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby={labelledBy}
      >
        <span className="service-select-current">
          {first && <span className={`service-select-dot service-select-dot--${triggerSlug}`} aria-hidden="true" />}
          {triggerLabel}
        </span>
        <span aria-hidden="true" className="service-select-caret">▾</span>
      </button>

      {open && (
        <ul className="service-select-list" role="listbox" aria-label="Select service types" aria-multiselectable="true">
          <li className="service-select-search" role="presentation">
            <input
              ref={searchRef}
              type="search"
              className="service-select-search-input"
              placeholder="Type to search, e.g. education"
              aria-label="Search service types"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                // Escape clears the typing first, then closes the list.
                if (e.key === 'Escape' && query) { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); setQuery('') }
              }}
            />
          </li>
          {!query && (
          <li>
            <button
              type="button"
              className={`service-select-option service-select-all${value.length === 0 ? ' service-select-option--active' : ''}`}
              role="option"
              aria-selected={value.length === 0}
              onClick={() => pick('')}
            >
              All
            </button>
          </li>
          )}
          {query && groups.length === 0 && (
            <li className="service-select-empty" role="presentation">
              No service types match "{query}".
            </li>
          )}
          {groups.map((group) => {
            const groupValue = `_group_${group.group}`
            // Each group wears the same petal colour as its service pills on
            // the cards (V5 F-05) so the dropdown and the cards read as one key.
            const slug = GROUP_ICONS[group.group]?.slug ?? 'home'
            return (
              <li key={group.group} className={`service-select-section service-select-section--${slug}`}>
                <button
                  type="button"
                  className={`service-select-option service-select-group${isOn(groupValue) ? ' service-select-option--active' : ''}`}
                  role="option"
                  aria-selected={isOn(groupValue)}
                  onClick={() => pick(groupValue)}
                >
                  <span className="service-select-dot" aria-hidden="true" />
                  {isOn(groupValue) && <span aria-hidden="true">✓ </span>}{group.group}
                </button>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.value}>
                      <button
                        type="button"
                        className={`service-select-option service-select-item${isOn(item.value) ? ' service-select-option--active' : ''}`}
                        role="option"
                        aria-selected={isOn(item.value)}
                        onClick={() => pick(item.value)}
                      >
                        {isOn(item.value) && <span aria-hidden="true">✓ </span>}{item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
