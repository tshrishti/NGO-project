import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import { useNotifications } from '../context/NotificationsContext'

function timeAgo(ts) {
  const s = Math.floor((Date.now() - ts) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  return `${Math.floor(s / 3600)}h ago`
}

export default function Nav() {
  const { user, logout } = useAuth()
  const { theme, toggle } = useTheme()
  const { items, unread, markAllRead, clearAll } = useNotifications()
  const navigate = useNavigate()
  const [bellOpen, setBellOpen] = useState(false)

  function handleLogout() {
    logout()
    navigate('/')
  }

  function toggleBell() {
    setBellOpen((o) => {
      if (!o) markAllRead()
      return !o
    })
  }

  return (
    <nav className="nav">
      <NavLink to="/" className="brand">
        <span className="logo">🤝</span>
        <span className="word">Relief<b>Link</b></span>
      </NavLink>
      <NavLink to="/map">Live Map</NavLink>
      <NavLink to="/impact">Impact</NavLink>
      <NavLink to="/request-help">Request Help</NavLink>
      {user?.role === 'ngo' && <NavLink to="/ngo">NGO Dashboard</NavLink>}
      {user?.role === 'volunteer' && (
        <>
          <NavLink to="/volunteer">My Profile</NavLink>
          <NavLink to="/matches">Find Tasks</NavLink>
          <NavLink to="/my-tasks">My Tasks</NavLink>
        </>
      )}
      <span className="spacer" />

      {user && (
        <div className="bell-wrap">
          <button className="theme-toggle bell" onClick={toggleBell} aria-label="Notifications">
            🔔
            {unread > 0 && <span className="bell-badge">{unread}</span>}
          </button>
          {bellOpen && (
            <div className="bell-panel">
              <div className="bell-head">
                <span>Alerts</span>
                {items.length > 0 && (
                  <button className="bell-clear" onClick={clearAll}>Clear</button>
                )}
              </div>
              {items.length === 0 ? (
                <div className="bell-empty muted small">No alerts yet. You'll be notified when a matching task appears nearby.</div>
              ) : (
                items.map((n) => (
                  <div
                    key={n.id}
                    className="bell-item"
                    onClick={() => { setBellOpen(false); navigate('/matches') }}
                  >
                    <div className="bell-item-title">{n.title}</div>
                    <div className="muted small">{n.body}</div>
                    <div className="bell-time">{timeAgo(n.ts)}</div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      )}

      <button
        className="theme-toggle"
        onClick={toggle}
        title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        aria-label="Toggle theme"
      >
        {theme === 'dark' ? '☀️' : '🌙'}
      </button>
      {user ? (
        <>
          <span className="who"><b>{user.name}</b> · {user.role}</span>
          <button className="btn ghost" onClick={handleLogout}>Log out</button>
        </>
      ) : (
        <NavLink to="/auth" className="btn">Sign in</NavLink>
      )}
    </nav>
  )
}
