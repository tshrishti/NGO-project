import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import { MAP_CENTER } from '../data/seed'
import { pinIcon } from '../lib/icons'

function ClickCapture({ onPick }) {
  useMapEvents({
    click(e) {
      onPick({ lat: e.latlng.lat, lng: e.latlng.lng })
    },
  })
  return null
}

// Small map where the user clicks to drop/move a location pin.
export default function LocationPicker({ value, onChange, height = 260 }) {
  const center = value || MAP_CENTER
  return (
    <div style={{ height, borderRadius: 10, overflow: 'hidden', border: '1px solid var(--border)' }}>
      <MapContainer center={[center.lat, center.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickCapture onPick={onChange} />
        {value && <Marker position={[value.lat, value.lng]} icon={pinIcon('medium')} />}
      </MapContainer>
    </div>
  )
}
