import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Auth() {
  const { signup, login } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [mode, setMode] = useState('signup')
  const [role, setRole] = useState(params.get('role') || 'volunteer')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  function afterAuth(user) {
    navigate(user.role === 'ngo' ? '/ngo' : '/volunteer')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    try {
      const user =
        mode === 'signup'
          ? await signup({ role, name, email, password })
          : await login({ email, password })
      afterAuth(user)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="auth-split">
      <aside className="auth-aside">
        <div className="auth-aside-inner">
          <div className="auth-brand">
            <span className="logo">🤝</span> Relief<b>Link</b>
          </div>
          <h2 className="auth-tag">Help reaches people faster when it's coordinated.</h2>
          <ul className="auth-points">
            <li>📍 Post &amp; see urgent needs on a live map</li>
            <li>🧠 Smart matching by skill, distance &amp; urgency</li>
            <li>🔔 Real-time alerts when you're needed nearby</li>
            <li>💬 Connect over WhatsApp in your language</li>
          </ul>
          <div className="auth-cta-note">Join NGOs and volunteers already responding together.</div>
        </div>
      </aside>

      <div className="auth-main">
      <div className="card narrow" style={{ width: '100%' }}>
        <h2 style={{ textAlign: 'center' }}>
          Welcome to <span className="gradient-text">ReliefLink</span>
        </h2>
        <div className="segmented" style={{ marginBottom: 18 }}>
          <button
            className={mode === 'signup' ? 'active' : ''}
            onClick={() => setMode('signup')}
            type="button"
          >
            Sign up
          </button>
          <button
            className={mode === 'login' ? 'active' : ''}
            onClick={() => setMode('login')}
            type="button"
          >
            Log in
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {mode === 'signup' && (
            <>
              <label>I am a</label>
              <div className="chips">
                <span
                  className={`chip ${role === 'ngo' ? 'on' : ''}`}
                  onClick={() => setRole('ngo')}
                >
                  🏥 NGO
                </span>
                <span
                  className={`chip ${role === 'volunteer' ? 'on' : ''}`}
                  onClick={() => setRole('volunteer')}
                >
                  🙋 Volunteer
                </span>
              </div>

              <label>{role === 'ngo' ? 'Organization name' : 'Full name'}</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required />
            </>
          )}

          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          {error && <div className="error">{error}</div>}

          <button className="btn block" type="submit" style={{ marginTop: 18 }}>
            {mode === 'signup' ? 'Create account' : 'Log in'}
          </button>
        </form>

        <p className="muted small" style={{ marginTop: 14 }}>
          Demo accounts: <code>ngo@demo.org</code> / <code>asha@demo.org</code> — password{' '}
          <code>demo</code>
        </p>
      </div>
      </div>
    </div>
  )
}
