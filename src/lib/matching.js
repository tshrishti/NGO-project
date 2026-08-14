// Smart matching algorithm.
//
//   matchScore = (skillOverlap * 0.6) + (proximityScore * 0.3) + (urgencyWeight * 0.1)
//
// All three sub-scores are normalized to 0..100 before weighting so the
// final score is an intuitive percentage.

const URGENCY_WEIGHT = { high: 1, medium: 0.5, low: 0.2 }

// Great-circle distance between two lat/lng points, in kilometers.
export function haversineKm(a, b) {
  const R = 6371 // Earth radius km
  const toRad = (d) => (d * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// skillOverlap = (matching skills / skills required) * 100
export function skillOverlap(volunteerSkills = [], requiredSkills = []) {
  if (!requiredSkills.length) return 0
  const vs = new Set(volunteerSkills)
  const matched = requiredSkills.filter((s) => vs.has(s)).length
  return (matched / requiredSkills.length) * 100
}

// proximityScore: closer = higher. 1/distance, scaled and capped to 0..100.
// (Within ~1km scores 100; falls off with distance.)
export function proximityScore(distanceKm) {
  if (distanceKm <= 1) return 100
  return Math.min(100, (1 / distanceKm) * 100)
}

export function urgencyScore(urgency) {
  return (URGENCY_WEIGHT[urgency] ?? 0.2) * 100
}

// Returns a full breakdown so the UI can explain the score.
export function scoreNeed(volunteer, need) {
  const overlap = skillOverlap(volunteer.skills, need.skills)
  const distanceKm = haversineKm(volunteer.location, need.location)
  const proximity = proximityScore(distanceKm)
  const urgency = urgencyScore(need.urgency)
  const total = overlap * 0.6 + proximity * 0.3 + urgency * 0.1
  return {
    need,
    total: Math.round(total),
    skillOverlap: Math.round(overlap),
    proximityScore: Math.round(proximity),
    urgencyScore: Math.round(urgency),
    distanceKm,
  }
}

// Rank open needs for a volunteer; returns top N with score breakdowns.
export function findMatches(volunteer, needs, limit = 5) {
  return needs
    .filter((n) => n.status === 'open')
    .map((n) => scoreNeed(volunteer, n))
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
}
