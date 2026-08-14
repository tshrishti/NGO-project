import { useState } from 'react'
import { apiHelp } from '../data/store'
import { CATEGORIES, URGENCIES, CATEGORY_SKILLS, MAP_CENTER } from '../data/seed'
import LocationPicker from '../components/LocationPicker'
import { waLink, helpRequestMessage } from '../lib/whatsapp'
import { fileToCompressedDataURL } from '../lib/image'
import { useLanguage } from '../context/LanguageContext'

export default function RequestHelp() {
  const { lang } = useLanguage()
  const [form, setForm] = useState({
    requesterName: '',
    requesterPhone: '',
    title: '',
    category: 'medical',
    urgency: 'high',
    description: '',
    photo: null,
    location: { ...MAP_CENTER },
  })
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  function set(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
  }

  async function onPhoto(e) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      set('photo', await fileToCompressedDataURL(file))
    } catch {
      /* ignore */
    }
  }

  function useMyLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) =>
      set('location', { lat: pos.coords.latitude, lng: pos.coords.longitude })
    )
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    try {
      await apiHelp({
        ...form,
        skills: CATEGORY_SKILLS[form.category] || [],
      })
      setDone(true)
    } catch (err) {
      setError(err.message)
    }
  }

  if (done) {
    return (
      <div className="center-screen">
        <div className="card narrow" style={{ width: '100%', textAlign: 'center' }}>
          <div style={{ fontSize: 44 }}>✅</div>
          <h2>Request sent</h2>
          <p className="muted">
            Your need is now live on the map and nearby skilled volunteers have been alerted.
            A volunteer will reach out — keep your phone handy.
          </p>
          <a
            className="btn block"
            href={waLink(undefined, helpRequestMessage(form, lang))}
            target="_blank"
            rel="noreferrer"
            style={{ marginTop: 12 }}
          >
            💬 Also notify us on WhatsApp
          </a>
          <button className="btn secondary block" style={{ marginTop: 10 }} onClick={() => setDone(false)}>
            Submit another request
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container narrow">
      <div className="card">
        <h2>Request help</h2>
        <p className="muted small">
          Tell us what you need and where. It appears live on the map and nearby volunteers with the
          right skills get an instant alert.
        </p>
        <form onSubmit={submit}>
          <div className="grid cols-2">
            <div>
              <label>Your name</label>
              <input value={form.requesterName} onChange={(e) => set('requesterName', e.target.value)} placeholder="Optional" />
            </div>
            <div>
              <label>WhatsApp / phone</label>
              <input value={form.requesterPhone} onChange={(e) => set('requesterPhone', e.target.value)} placeholder="e.g. 9198XXXXXXXX" />
            </div>
          </div>

          <label>What do you need?</label>
          <input value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="e.g. Insulin for elderly patient" required />

          <label>Category</label>
          <div className="chips">
            {CATEGORIES.map((c) => (
              <span key={c} className={`chip ${form.category === c ? 'on' : ''}`} onClick={() => set('category', c)}>
                {c}
              </span>
            ))}
          </div>

          <label>Urgency</label>
          <div className="chips">
            {URGENCIES.map((u) => (
              <span key={u} className={`chip ${form.urgency === u ? 'on' : ''}`} onClick={() => set('urgency', u)}>
                {u}
              </span>
            ))}
          </div>

          <label>Details (optional)</label>
          <textarea rows={3} value={form.description} onChange={(e) => set('description', e.target.value)} placeholder="Anything volunteers should know…" />

          <label>Photo (optional)</label>
          <div className="photo-field">
            <label className="btn secondary" style={{ cursor: 'pointer' }}>
              📷 Add photo
              <input type="file" accept="image/*" onChange={onPhoto} hidden />
            </label>
            {form.photo && (
              <div className="photo-preview">
                <img src={form.photo} alt="preview" />
                <button type="button" className="photo-remove" onClick={() => set('photo', null)} aria-label="Remove photo">✕</button>
              </div>
            )}
          </div>

          <label>Your location — click the map or use current location</label>
          <button type="button" className="btn secondary" onClick={useMyLocation} style={{ marginBottom: 8 }}>
            📍 Use my location
          </button>
          <LocationPicker value={form.location} onChange={(loc) => set('location', loc)} />

          {error && <div className="error">{error}</div>}

          <div className="row-between" style={{ marginTop: 18 }}>
            <button className="btn" type="submit">Send request</button>
            <a className="btn secondary" href={waLink(undefined, helpRequestMessage(form, lang))} target="_blank" rel="noreferrer">
              💬 Send via WhatsApp
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}
