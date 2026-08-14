import { useEffect, useState } from 'react'

// Response-time SLA per urgency (hours from when the need was posted).
export const SLA_HOURS = { high: 2, medium: 6, low: 24 }

export function deadlineFor(need) {
  const hours = SLA_HOURS[need.urgency] ?? 24
  return (need.createdAt || Date.now()) + hours * 3600 * 1000
}

// Returns { ms, overdue, label } remaining until the SLA deadline.
export function slaRemaining(need, now = Date.now()) {
  const ms = deadlineFor(need) - now
  const overdue = ms < 0
  const abs = Math.abs(ms)
  const h = Math.floor(abs / 3600000)
  const m = Math.floor((abs % 3600000) / 60000)
  const s = Math.floor((abs % 60000) / 1000)
  const pad = (n) => String(n).padStart(2, '0')
  const label = h > 0 ? `${h}h ${pad(m)}m` : `${m}m ${pad(s)}s`
  return { ms, overdue, label }
}

// Ticking clock hook (re-renders on an interval) for live countdowns.
export function useNow(intervalMs = 1000) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
