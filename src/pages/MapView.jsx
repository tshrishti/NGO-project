import { useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import { useCollection } from '../lib/useCollection'
import { useAuth } from '../context/AuthContext'
import { MAP_CENTER, CATEGORIES, URGENCIES } from '../data/seed'
import { pinIcon } from '../lib/icons'
import { add, update } from '../data/store'
import { waLink, volunteerMessage } from '../lib/whatsapp'
import { directionsLink } from '../lib/maps'
import SlaBadge from '../components/SlaBadge'
import { useLanguage } from '../context/LanguageContext'

export default function MapView() {
  const needs = useCollection('needs')
  const { user } = useAuth()
  const { lang } = useLanguage()

  const [category, setCategory] = useState('all')
  const [urgency, setUrgency] = useState('all')
  const [query, setQuery] = useState('')
  const [showFulfilled, setShowFulfilled] = useState(false)

  const visible = needs.filter((n) => {
    if (!n.location) return false
    if (!showFulfilled && n.status === 'fulfilled') return false
    if (category !== 'all' && n.category !== category) return false
    if (urgency !== 'all' && n.urgency !== urgency) return false
    if (query && !n.title.toLowerCase().includes(query.toLowerCase())) return false
    return true
  })

  function accept(need) {
    add('matches', { needId: need.id, volunteerId: user.id, volunteerName: user.name, status: 'accepted' })
    update('needs', need.id, { status: 'assigned', assignedTo: user.id, assignedName: user.name, assignedAt: Date.now() })
  }

  return (
    <div className="map-wrap">
      <div className="map-filter">
        <input
          className="map-search"
          placeholder="🔎 Search needs…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <div className="chips">
          <span className={`chip ${category === 'all' ? 'on' : ''}`} onClick={() => setCategory('all')}>all</span>
          {CATEGORIES.map((c) => (
            <span key={c} className={`chip ${category === c ? 'on' : ''}`} onClick={() => setCategory(c)}>{c}</span>
          ))}
        </div>
        <div className="chips">
          <span className={`chip ${urgency === 'all' ? 'on' : ''}`} onClick={() => setUrgency('all')}>any urgency</span>
          {URGENCIES.map((u) => (
            <span key={u} className={`chip ${urgency === u ? 'on' : ''}`} onClick={() => setUrgency(u)}>{u}</span>
          ))}
        </div>
        <label className="map-check">
          <input type="checkbox" checked={showFulfilled} onChange={(e) => setShowFulfilled(e.target.checked)} />
          Show fulfilled
        </label>
      </div>

      <MapContainer center={[MAP_CENTER.lat, MAP_CENTER.lng]} zoom={12} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {visible.map((n) => (
          <Marker key={n.id} position={[n.location.lat, n.location.lng]} icon={pinIcon(n.urgency)}>
            <Popup>
              <div style={{ minWidth: 190 }}>
                {n.photo && (
                  <img src={n.photo} alt="" className="popup-photo" />
                )}
                <strong>{n.title}</strong>
                <div style={{ margin: '6px 0', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                  <span className={`badge ${n.urgency}`}>{n.urgency}</span>
                  <span className="badge status">{n.status}</span>
                  <SlaBadge need={n} compact />
                </div>
                <div style={{ fontSize: 13, color: 'var(--muted)' }}>
                  {n.category} · by {n.ngoName}
                </div>
                <div style={{ fontSize: 12, marginTop: 6 }}>
                  Skills: {n.skills?.join(', ') || '—'}
                </div>
                {n.status === 'assigned' && (
                  <div style={{ fontSize: 12, marginTop: 6, color: 'var(--accent)' }}>
                    Assigned to {n.assignedName}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                  {user?.role === 'volunteer' && n.status === 'open' && (
                    <button className="btn" onClick={() => accept(n)}>I'll help</button>
                  )}
                  {(n.requesterPhone || user?.role === 'volunteer') && (
                    <a className="btn secondary" href={waLink(n.requesterPhone, volunteerMessage(n, user?.name, lang))} target="_blank" rel="noreferrer">
                      💬 WhatsApp
                    </a>
                  )}
                  <a className="btn secondary" href={directionsLink(n.location)} target="_blank" rel="noreferrer">
                    🗺️ Directions
                  </a>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      <div className="map-legend">
        <strong>Urgency</strong>
        <div className="row"><span className="dot high" /> High</div>
        <div className="row"><span className="dot medium" /> Medium</div>
        <div className="row"><span className="dot low" /> Low</div>
        <div className="small muted" style={{ marginTop: 6 }}>{visible.length} shown</div>
      </div>
    </div>
  )
}
