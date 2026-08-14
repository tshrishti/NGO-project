// Open turn-by-turn directions to a location in Google Maps
// (works on web, Android, and iOS; iOS also offers Apple Maps).
export function directionsLink(location) {
  if (!location) return '#'
  return `https://www.google.com/maps/dir/?api=1&destination=${location.lat},${location.lng}`
}
