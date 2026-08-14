import L from 'leaflet'

// Colored circular markers by urgency (avoids Leaflet's broken default
// icon paths under bundlers, and matches the map legend colors).
const COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' }

export function pinIcon(urgency = 'medium') {
  const color = COLORS[urgency] || COLORS.medium
  return L.divIcon({
    className: 'relief-pin',
    html: `<span style="
      display:block;width:20px;height:20px;border-radius:50% 50% 50% 0;
      background:${color};transform:rotate(-45deg);
      border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5);"></span>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20],
    popupAnchor: [0, -18],
  })
}
