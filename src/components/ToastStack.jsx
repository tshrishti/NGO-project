import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationsContext'

// Transient pop-up alerts (top-right). Click to jump to matches.
export default function ToastStack() {
  const { toasts, dismissToast } = useNotifications()
  const navigate = useNavigate()
  if (!toasts.length) return null
  return (
    <div className="toast-stack">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast ${t.urgency || ''}`}
          onClick={() => {
            navigate('/matches')
            dismissToast(t.id)
          }}
        >
          <span className="toast-ic">🔔</span>
          <div className="grow">
            <div className="toast-title">{t.title}</div>
            <div className="toast-body">{t.body}</div>
          </div>
          <button
            className="toast-x"
            onClick={(e) => {
              e.stopPropagation()
              dismissToast(t.id)
            }}
            aria-label="Dismiss"
          >
            ✕
          </button>
        </div>
      ))}
    </div>
  )
}
