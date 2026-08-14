import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { SKILLS, MAP_CENTER } from '../data/seed'
import LocationPicker from '../components/LocationPicker'
import PageHeader from '../components/PageHeader'

export default function VolunteerDashboard() {
  const { user, updateProfile } = useAuth()
  const navigate = useNavigate()
  const [skills, setSkills] = useState(user.skills || [])
  const [availability, setAvailability] = useState(user.availability || 'anytime')
  const [location, setLocation] = useState(user.location || { ...MAP_CENTER })
  const [notice, setNotice] = useState('')

  function toggleSkill(s) {
    setSkills((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  function useMyLocation() {
    if (!navigator.geolocation) return
    navigator.geolocation.getCurrentPosition((pos) =>
      setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
    )
  }

  function save(e) {
    e.preventDefault()
    updateProfile({ skills, availability, location })
    setNotice('Profile saved.')
    setTimeout(() => setNotice(''), 3000)
  }

  return (
    <div className="container medium">
      <PageHeader icon="🙋" title={`Welcome, ${user.name}`} subtitle="Keep your skills and location current for the best matches.">
        <button className="btn" onClick={() => navigate('/matches')}>⚡ Find tasks</button>
      </PageHeader>
      <div className="card">
        <h2>Your volunteer profile</h2>
        <p className="muted small">
          Your skills and location power the matching algorithm — the more accurate, the better your matches.
        </p>
        <form onSubmit={save}>
          <label>Skills</label>
          <div className="chips">
            {SKILLS.map((s) => (
              <span
                key={s}
                className={`chip ${skills.includes(s) ? 'on' : ''}`}
                onClick={() => toggleSkill(s)}
              >
                {s}
              </span>
            ))}
          </div>

          <label>Availability</label>
          <select value={availability} onChange={(e) => setAvailability(e.target.value)}>
            <option value="anytime">Anytime</option>
            <option value="weekdays">Weekdays</option>
            <option value="weekends">Weekends</option>
            <option value="evenings">Evenings</option>
          </select>

          <label>Your location — click the map or use current location</label>
          <button type="button" className="btn secondary" onClick={useMyLocation} style={{ marginBottom: 8 }}>
            📍 Use my location
          </button>
          <LocationPicker value={location} onChange={setLocation} />

          {notice && <div className="notice">{notice}</div>}

          <div className="row-between" style={{ marginTop: 18 }}>
            <button className="btn" type="submit">Save profile</button>
            <button
              type="button"
              className="btn secondary"
              onClick={async () => {
                await updateProfile({ skills, availability, location })
                navigate('/matches')
              }}
            >
              Find tasks for me →
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
