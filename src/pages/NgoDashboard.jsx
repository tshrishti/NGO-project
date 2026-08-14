import { useState } from 'react'
import { add, update } from '../data/store'
import { useCollection } from '../lib/useCollection'
import { useAuth } from '../context/AuthContext'
import { CATEGORIES, URGENCIES, CATEGORY_SKILLS, SKILLS, MAP_CENTER } from '../data/seed'
import LocationPicker from '../components/LocationPicker'
import SlaBadge from '../components/SlaBadge'
import PageHeader from '../components/PageHeader'
import { fileToCompressedDataURL } from '../lib/image'
import { CATEGORIES as CATS } from '../data/seed'

const empty = {
  title: '',
  category: 'medical',
  urgency: 'high',
  skills: CATEGORY_SKILLS.medical,
  location: { ...MAP_CENTER },
  photo: null,
}

export default function NgoDashboard() {
  const { user } = useAuth()
  const needs = useCollection('needs')
  const [form, setForm] = useState(empty)
  const [notice, setNotice] = useState('')

  const myNeeds = needs
    .filter((n) => n.ngoId === user.id)
    .sort((a, b) => b.createdAt - a.createdAt)

  function setCategory(category) {
    setForm((f) => ({ ...f, category, skills: CATEGORY_SKILLS[category] }))
  }

  function toggleSkill(skill) {
    setForm((f) => ({
      ...f,
      skills: f.skills.includes(skill)
        ? f.skills.filter((s) => s !== skill)
        : [...f.skills, skill],
    }))
  }

  function useMyLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) =>
      setForm((f) => ({ ...f, location: { lat: pos.coords.latitude, lng: pos.coords.longitude } }))
    )
  }

  async function onPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const dataUrl = await fileToCompressedDataURL(file)
      setForm((f) => ({ ...f, photo: dataUrl }))
    } catch {
      /* ignore invalid file */
    }
  }

  function submit(e) {
    e.preventDefault()
    add('needs', {
      ngoId: user.id,
      ngoName: user.name,
      title: form.title,
      category: form.category,
      urgency: form.urgency,
      skills: form.skills,
      location: form.location,
      photo: form.photo,
      status: 'open',
    })
    setForm(empty)
    setNotice('Need posted — it is now live on the map for volunteers.')
    setTimeout(() => setNotice(''), 4000)
  }

  return (
    <div className="container">
      <PageHeader icon="🏥" title={`Welcome, ${user.name}`} subtitle="Post community needs and track your response in real time.">
        <div className="header-stats">
          <span className="hstat"><b>{myNeeds.filter((n) => n.status === 'open').length}</b> open</span>
          <span className="hstat"><b>{myNeeds.filter((n) => n.status === 'assigned').length}</b> assigned</span>
          <span className="hstat"><b>{myNeeds.filter((n) => n.status === 'fulfilled').length}</b> fulfilled</span>
        </div>
      </PageHeader>

      <div className="grid cols-2" style={{ alignItems: 'start' }}>
      <div className="card">
        <h2>Post a new need</h2>
        <form onSubmit={submit}>
          <label>Title</label>
          <input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="e.g. Emergency medicine delivery"
            required
          />

          <label>Category</label>
          <div className="chips">
            {CATEGORIES.map((c) => (
              <span
                key={c}
                className={`chip ${form.category === c ? 'on' : ''}`}
                onClick={() => setCategory(c)}
              >
                {c}
              </span>
            ))}
          </div>

          <label>Urgency</label>
          <div className="chips">
            {URGENCIES.map((u) => (
              <span
                key={u}
                className={`chip ${form.urgency === u ? 'on' : ''}`}
                onClick={() => setForm({ ...form, urgency: u })}
              >
                {u}
              </span>
            ))}
          </div>

          <label>Skills required</label>
          <div className="chips">
            {SKILLS.map((s) => (
              <span
                key={s}
                className={`chip ${form.skills.includes(s) ? 'on' : ''}`}
                onClick={() => toggleSkill(s)}
              >
                {s}
              </span>
            ))}
          </div>

          <label>Location — click the map or use your current location</label>
          <button type="button" className="btn secondary" onClick={useMyLocation} style={{ marginBottom: 8 }}>
            📍 Use my location
          </button>
          <LocationPicker
            value={form.location}
            onChange={(loc) => setForm({ ...form, location: loc })}
          />

          <label>Photo (optional)</label>
          <div className="photo-field">
            <label className="btn secondary" style={{ cursor: 'pointer' }}>
              📷 Add photo
              <input type="file" accept="image/*" onChange={onPhoto} hidden />
            </label>
            {form.photo && (
              <div className="photo-preview">
                <img src={form.photo} alt="preview" />
                <button type="button" className="photo-remove" onClick={() => setForm({ ...form, photo: null })} aria-label="Remove photo">✕</button>
              </div>
            )}
          </div>

          {notice && <div className="notice">{notice}</div>}
          <button className="btn block" type="submit" style={{ marginTop: 18 }}>
            Post need
          </button>
        </form>
      </div>

      <div className="card">
        <NgoAnalytics needs={myNeeds} />
      </div>

      <div className="card" style={{ gridColumn: '1 / -1' }}>
        <h2>My needs ({myNeeds.length})</h2>
        {myNeeds.length === 0 && <p className="muted">No needs yet — post one on the left.</p>}
        {myNeeds.map((n) => (
          <div className="need-row" key={n.id}>
            {n.photo && <img src={n.photo} alt="" className="row-thumb" />}
            <div className="grow">
              <div className="need-title">{n.title}</div>
              <div className="small muted">
                {n.category} · <span className={`badge ${n.urgency}`}>{n.urgency}</span>{' '}
                <span className="badge status">{n.status}</span> <SlaBadge need={n} compact />
              </div>
            </div>
            {n.status === 'open' && (
              <span className="muted small">waiting for volunteer…</span>
            )}
            {n.status === 'assigned' && (
              <button className="btn" onClick={() => update('needs', n.id, { status: 'fulfilled', fulfilledAt: Date.now() })}>
                Mark fulfilled
              </button>
            )}
            {n.status === 'fulfilled' && <span className="notice">✔ Fulfilled</span>}
          </div>
        ))}
      </div>
      </div>
    </div>
  )
}

function NgoAnalytics({ needs }) {
  const total = needs.length
  const fulfilled = needs.filter((n) => n.status === 'fulfilled').length
  const rate = total ? Math.round((fulfilled / total) * 100) : 0

  const responded = needs.filter((n) => n.assignedAt && n.createdAt)
  const avgMin = responded.length
    ? Math.round(responded.reduce((s, n) => s + (n.assignedAt - n.createdAt), 0) / responded.length / 60000)
    : null

  const perCat = CATS.map((c) => {
    const list = needs.filter((n) => n.category === c)
    return { c, total: list.length, done: list.filter((n) => n.status === 'fulfilled').length }
  }).filter((r) => r.total > 0)

  return (
    <>
      <h2>Your analytics</h2>
      <div className="grid cols-2" style={{ marginBottom: 8 }}>
        <div className="mini-stat">
          <div className="num">{rate}%</div>
          <div className="lbl">Fulfilment rate</div>
        </div>
        <div className="mini-stat">
          <div className="num">{avgMin != null ? `${avgMin}m` : '—'}</div>
          <div className="lbl">Avg. response time</div>
        </div>
      </div>
      <h3 style={{ marginTop: 6 }}>By category</h3>
      {perCat.length === 0 ? (
        <p className="muted small">No needs yet.</p>
      ) : (
        perCat.map((r) => (
          <div key={r.c} className="cat-row">
            <span className="cat-name">{r.c}</span>
            <div className="cat-bar">
              <span style={{ width: `${r.total ? (r.done / r.total) * 100 : 0}%` }} />
            </div>
            <span className="cat-count small muted">{r.done}/{r.total}</span>
          </div>
        ))
      )}
    </>
  )
}
