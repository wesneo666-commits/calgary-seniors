import { useEffect, useRef, useState } from 'react'
import { SERVICE_AREA_GROUPS, GROUP_ICONS, serviceAreaLabel, serviceGroupSlug } from '../utils/constants.js'

export default function ServiceTypeSelect({ value, onChange, labelledBy }) {
  const [open, setOpen] = useState(false)
  const wrapRef = useRef(null)

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

  const triggerSlug = !value
    ? null
    : value.startsWith('_group_')
      ? GROUP_ICONS[value.slice(7)]?.slug
      : serviceGroupSlug(value)

  function pick(v) {
    onChange(v)
    setOpen(false)
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
          {value && <span className={`service-select-dot service-select-dot--${triggerSlug}`} aria-hidden="true" />}
          {serviceAreaLabel(value)}
        </span>
        <span aria-hidden="true" className="service-select-caret">▾</span>
      </button>

      {open && (
        <ul className="service-select-list" role="listbox" aria-label="Select service type">
          <li>
            <button
              type="button"
              className={`service-select-option service-select-all${!value ? ' service-select-option--active' : ''}`}
              role="option"
              aria-selected={!value}
              onClick={() => pick('')}
            >
              All
            </button>
          </li>
          {SERVICE_AREA_GROUPS.map((group) => {
            const groupValue = `_group_${group.group}`
            // Each group wears the same petal colour as its service pills on
            // the cards (V5 F-05) so the dropdown and the cards read as one key.
            const slug = GROUP_ICONS[group.group]?.slug ?? 'home'
            return (
              <li key={group.group} className={`service-select-section service-select-section--${slug}`}>
                <button
                  type="button"
                  className={`service-select-option service-select-group${value === groupValue ? ' service-select-option--active' : ''}`}
                  role="option"
                  aria-selected={value === groupValue}
                  onClick={() => pick(groupValue)}
                >
                  <span className="service-select-dot" aria-hidden="true" />
                  {group.group}
                </button>
                <ul>
                  {group.items.map((item) => (
                    <li key={item.value}>
                      <button
                        type="button"
                        className={`service-select-option service-select-item${value === item.value ? ' service-select-option--active' : ''}`}
                        role="option"
                        aria-selected={value === item.value}
                        onClick={() => pick(item.value)}
                      >
                        {item.label}
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
