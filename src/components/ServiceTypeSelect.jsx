import { useEffect, useRef, useState } from 'react'
import { SERVICE_AREA_GROUPS, serviceAreaLabel } from '../utils/constants.js'

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
        <span>{serviceAreaLabel(value)}</span>
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
              All types
            </button>
          </li>
          {SERVICE_AREA_GROUPS.map((group) => {
            const groupValue = `_group_${group.group}`
            return (
              <li key={group.group}>
                <button
                  type="button"
                  className={`service-select-option service-select-group${value === groupValue ? ' service-select-option--active' : ''}`}
                  role="option"
                  aria-selected={value === groupValue}
                  onClick={() => pick(groupValue)}
                >
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
