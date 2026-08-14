import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

// Guards routes: requires login and (optionally) a specific role.
export default function ProtectedRoute({ role, children }) {
  const { user, ready } = useAuth()
  if (!ready) return <div className="center-screen muted">Loading…</div>
  if (!user) return <Navigate to="/auth" replace />
  if (role && user.role !== role) return <Navigate to="/" replace />
  return children
}
