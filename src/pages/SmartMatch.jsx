import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useCollection } from '../lib/useCollection'
import { findMatches } from '../lib/matching'
import { CATEGORY_ICONS } from '../data/seed'
import { add, update } from '../data/store'
import { waLink, volunteerMessage } from '../lib/whatsapp'
import { directionsLink } from '../lib/maps'
import SlaBadge from '../components/SlaBadge'
import { useLanguage } from '../context/LanguageContext'

export default function SmartMatch() {
  const { user } = useAuth()
  const { lang } = useLanguage()
  const needs = useCollection('needs')
  const [results, setResults] = useState(null)

  const hasProfile = user.skills?.length && user.location

  function run() {
    setResults(findMatches(user, needs, 5))
  }

  function accept(need) {
    add('matches', { needId: need.id, volunteerId: user.id, volunteerName: user.name, status: 'accepted' })
    update('needs', need.id, { status: 'assigned', assignedTo: user.id, assignedName: user.name, assignedAt: Date.now() })
    setResults((r) => r.filter((m) => m.need.id !== need.id))
  }

  return (
    <div className="container medium">
      <div className="card">
        <h2>Find tasks for me</h2>
        <p className="muted small">
          We score every open need using your skills (60%), how close it is (30%), and its urgency (10%).
        </p>
        {!hasProfile && (
          <div className="error">
            Add at least one skill and set your location on your profile first for accurate matches.
          </div>
        )}
        <button className="btn block" onClick={run} style={{ marginTop: 12 }}>
          ⚡ Find my best matches
        </button>
      </div>

      {results && (
        <div className="card" style={{ marginTop: 16 }}>
          <h3>Top {results.length} matches</h3>
          {results.length === 0 && <p className="muted">No open needs right now — check back soon.</p>}
          {results.map((m, i) => (
            <div className="match-card" key={m.need.id}>
              <div className="match-head">
                <span className="match-rank">#{i + 1}</span>
                <span className="cat-ic">{CATEGORY_ICONS[m.need.category] || '📍'}</span>
                <div className="grow">
                  <div className="need-title">{m.need.title}</div>
                  <div className="small muted">{m.need.category} · by {m.need.ngoName}</div>
                </div>
                <div className="match-score">{m.total}<small>%</small></div>
              </div>
              <div className="score-bar"><span style={{ width: `${m.total}%` }} /></div>
              <div className="small muted" style={{ margin: '10px 0 2px', display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
                <span className={`badge ${m.need.urgency}`}>{m.need.urgency}</span>
                <SlaBadge need={m.need} compact />
                <span>· skill {m.skillOverlap}% · {m.distanceKm.toFixed(1)} km · urgency {m.urgencyScore}%</span>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                <button className="btn" onClick={() => accept(m.need)}>I'll help</button>
                <a className="btn secondary" href={waLink(m.need.requesterPhone, volunteerMessage(m.need, user.name, lang))} target="_blank" rel="noreferrer">
                  💬 WhatsApp
                </a>
                <a className="btn secondary" href={directionsLink(m.need.location)} target="_blank" rel="noreferrer">
                  🗺️ Directions
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
