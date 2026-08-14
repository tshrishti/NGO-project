import { useAuth } from '../context/AuthContext'
import { useCollection } from '../lib/useCollection'
import { update } from '../data/store'
import { CATEGORY_ICONS } from '../data/seed'
import { waLink, volunteerMessage } from '../lib/whatsapp'
import { directionsLink } from '../lib/maps'
import PageHeader from '../components/PageHeader'
import { useLanguage } from '../context/LanguageContext'

export default function MyTasks() {
  const { user } = useAuth()
  const { lang } = useLanguage()
  const needs = useCollection('needs')

  const mine = needs
    .filter((n) => n.assignedTo === user.id)
    .sort((a, b) => (b.assignedAt || 0) - (a.assignedAt || 0))

  const active = mine.filter((n) => n.status === 'assigned')
  const done = mine.filter((n) => n.status === 'fulfilled')

  function complete(n) {
    update('needs', n.id, { status: 'fulfilled', fulfilledAt: Date.now() })
  }

  function Row({ n, showComplete }) {
    return (
      <div className="need-row" style={{ display: 'block' }}>
        <div className="row-between">
          <div className="need-title"><span className="cat-ic-sm">{CATEGORY_ICONS[n.category] || '📍'}</span> {n.title}</div>
          <span className={`badge ${n.urgency}`}>{n.urgency}</span>
        </div>
        <div className="small muted" style={{ margin: '6px 0' }}>
          {n.category} · by {n.ngoName}
          {n.requesterPhone ? ` · ${n.requesterName || 'requester'}` : ''}
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginTop: 6 }}>
          {showComplete ? (
            <button className="btn" onClick={() => complete(n)}>Mark completed</button>
          ) : (
            <span className="notice">✔ Completed</span>
          )}
          {n.requesterPhone && (
            <a className="btn secondary" href={waLink(n.requesterPhone, volunteerMessage(n, user.name, lang))} target="_blank" rel="noreferrer">
              💬 WhatsApp
            </a>
          )}
          <a className="btn secondary" href={directionsLink(n.location)} target="_blank" rel="noreferrer">
            🗺️ Directions
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="container medium">
      <PageHeader icon="✅" title="My tasks" subtitle="Tasks you've taken responsibility for.">
        <div className="header-stats">
          <span className="hstat"><b>{active.length}</b> active</span>
          <span className="hstat"><b>{done.length}</b> done</span>
        </div>
      </PageHeader>
      <div className="card">
        <h3 style={{ marginTop: 4 }}>Active ({active.length})</h3>
        {active.length === 0 ? (
          <p className="muted small">No active tasks. Find one on <a href="/matches">Find Tasks</a>.</p>
        ) : (
          active.map((n) => <Row key={n.id} n={n} showComplete />)
        )}

        {done.length > 0 && (
          <>
            <h3 style={{ marginTop: 22 }}>Completed ({done.length})</h3>
            {done.map((n) => <Row key={n.id} n={n} />)}
          </>
        )}
      </div>
    </div>
  )
}
