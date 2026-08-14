import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div className="landing">
      <div className="hero-banner">
        <div className="hero">
          <span className="eyebrow">⚡ Real-time community response</span>
          <h1>
            Match help to <span className="gradient-text">urgent needs</span>,<br />
            the moment they appear.
          </h1>
          <p>
            NGOs post community needs — medical, food, shelter, education — onto a live map.
            Volunteers get matched to the closest, best-fit tasks by skill and urgency, instantly.
          </p>
          <button className="btn" onClick={() => navigate('/map')}>
            View the live map →
          </button>
        </div>
      </div>

      <div className="role-cards">
        <div className="card" onClick={() => navigate('/auth?role=ngo')}>
          <div className="emoji">🏥</div>
          <h2>I'm an NGO</h2>
          <p className="muted small">
            Post needs with location and urgency. Watch volunteers get assigned in real time.
          </p>
          <button className="btn block" style={{ marginTop: 8 }}>Continue as NGO</button>
        </div>

        <div className="card" onClick={() => navigate('/auth?role=volunteer')}>
          <div className="emoji">🙋</div>
          <h2>I'm a Volunteer</h2>
          <p className="muted small">
            Set your skills and location. Get your top-matched tasks and start helping nearby.
          </p>
          <button className="btn block" style={{ marginTop: 8 }}>Continue as Volunteer</button>
        </div>
      </div>

      <div className="feature-row">
        <div className="card feature">
          <div className="fi">🛰️</div>
          <div>
            <h3>Live updates</h3>
            <p className="muted small">Real-time map &amp; cross-device sync</p>
          </div>
        </div>
        <div className="card feature">
          <div className="fi">🧠</div>
          <div>
            <h3>Smart matching</h3>
            <p className="muted small">Skill + proximity + urgency scoring</p>
          </div>
        </div>
        <div className="card feature">
          <div className="fi">🌍</div>
          <div>
            <h3>Free &amp; open</h3>
            <p className="muted small">OpenStreetMap · no billing setup</p>
          </div>
        </div>
      </div>
    </div>
  )
}
