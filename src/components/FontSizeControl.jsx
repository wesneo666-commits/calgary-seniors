import { SIZES } from '../hooks/useFontSize.js'

export default function FontSizeControl({ sizeIndex, setSizeIndex }) {
  return (
    <div className="font-size-control" role="group" aria-label="Text size">
      <span className="font-size-label" aria-hidden="true">Text size</span>
      {SIZES.map((size, i) => (
        <button
          key={size.label}
          className={`font-size-btn${i === sizeIndex ? ' font-size-btn--active' : ''}`}
          onClick={() => setSizeIndex(i)}
          aria-pressed={i === sizeIndex}
          aria-label={`Text size ${size.label}`}
          type="button"
        >
          {size.label}
        </button>
      ))}
    </div>
  )
}
