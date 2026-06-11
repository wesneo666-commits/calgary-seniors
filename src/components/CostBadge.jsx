export default function CostBadge({ cost }) {
  if (!cost || cost.length === 0) return null
  const primary = cost[0]
  const cls =
    primary === 'Free'     ? 'badge badge-free'
    : primary === 'At-cost'  ? 'badge badge-cost'
    : 'badge badge-unknown'
  const label =
    primary === 'Free'     ? 'Free'
    : primary === 'At-cost'  ? 'Paid'
    : 'Check with provider'
  return <span className={cls}>{label}</span>
}
