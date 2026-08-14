import { useEffect, useRef } from 'react'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../context/NotificationsContext'
import { useCollection } from '../lib/useCollection'
import { skillOverlap, haversineKm } from '../lib/matching'
import { playAlarm } from '../lib/sound'
import { ALERT_RADIUS_KM } from '../config'

// Role-aware real-time alerts driven by the live needs feed:
//  • Volunteer: new OPEN need matching their skills within range → alert + alarm
//  • Volunteer: their assigned task marked FULFILLED → "task completed"
//  • NGO: their posted need becomes ASSIGNED → "a volunteer accepted"
// Renders nothing.
export default function VolunteerAlerts() {
  const { user } = useAuth()
  const needs = useCollection('needs')
  const { push } = useNotifications()
  const prev = useRef(null) // Map<id, status>

  useEffect(() => {
    if (!user) {
      prev.current = null
      return
    }
    const cur = new Map(needs.map((n) => [n.id, n.status]))
    // Baseline on first pass (no alerts for pre-existing data).
    if (prev.current === null) {
      prev.current = cur
      return
    }

    const matches = (n) => {
      if (!user.skills?.length || !user.location || !n.location) return false
      return skillOverlap(user.skills, n.skills) > 0 && haversineKm(user.location, n.location) <= ALERT_RADIUS_KM
    }

    for (const n of needs) {
      const before = prev.current.get(n.id)

      if (before === undefined) {
        // Brand-new need
        if (user.role === 'volunteer' && n.status === 'open' && matches(n)) {
          const dist = haversineKm(user.location, n.location)
          push({
            type: 'match', urgency: n.urgency, needId: n.id,
            title: 'New task near you',
            body: `${n.title} · ${dist.toFixed(1)} km away · ${Math.round(skillOverlap(user.skills, n.skills))}% skill match`,
          })
          playAlarm()
        }
      } else if (before !== n.status) {
        // Status transition
        if (user.role === 'ngo' && n.ngoId === user.id && n.status === 'assigned') {
          push({
            type: 'accepted', urgency: n.urgency, needId: n.id,
            title: 'A volunteer accepted 🎉',
            body: `${n.assignedName || 'A volunteer'} is helping with "${n.title}"`,
          })
          playAlarm()
        }
        if (user.role === 'volunteer' && n.assignedTo === user.id && n.status === 'fulfilled') {
          push({
            type: 'done', urgency: n.urgency, needId: n.id,
            title: 'Task completed ✅',
            body: `"${n.title}" was marked fulfilled. Thank you!`,
          })
        }
      }
    }
    prev.current = cur
  }, [needs, user, push])

  return null
}
