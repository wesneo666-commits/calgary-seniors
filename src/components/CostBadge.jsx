const COST_LABEL = { Free: 'Free', 'At-cost': 'Paid' }
const COST_CLASS = { Free: 'badge badge-free', 'At-cost': 'badge badge-cost' }

// Some programs are tagged both Free and At-cost (e.g. a sliding scale, or
// free intro + paid ongoing sessions). Showing only cost[0] used to hide the
// other tag entirely — so filtering by "Paid" could surface a card whose
// only visible badge read "Free", which read to testers as the Paid filter
// being broken. Render one badge per tag that actually applies instead.
export default function CostBadge({ cost }) {
  if (!cost || cost.length === 0) return null
  const relevant = cost.filter((c) => c === 'Free' || c === 'At-cost')
  if (relevant.length === 0) return <span className="badge badge-unknown">Check with provider</span>
  return relevant.map((c) => (
    <span key={c} className={COST_CLASS[c]}>{COST_LABEL[c]}</span>
  ))
}
