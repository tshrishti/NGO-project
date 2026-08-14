import { slaRemaining, useNow } from '../lib/sla'

// Live SLA countdown badge for open needs. Shows time left to meet the
// response target for the need's urgency, or an "overdue" state.
export default function SlaBadge({ need, compact = false }) {
  const now = useNow(1000)
  if (need.status !== 'open') return null
  const { overdue, label } = slaRemaining(need, now)
  return (
    <span className={`sla ${overdue ? 'overdue' : ''} ${compact ? 'compact' : ''}`} title="Response time target">
      {overdue ? `⏰ overdue ${label}` : `⏳ ${label} left`}
    </span>
  )
}
