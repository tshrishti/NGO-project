import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const NotificationsContext = createContext(null)
const STORE_KEY = 'reliefLink:notifications'

let seq = Date.now()

function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    if (!raw) return { items: [], unread: 0 }
    const parsed = JSON.parse(raw)
    return { items: parsed.items || [], unread: parsed.unread || 0 }
  } catch {
    return { items: [], unread: 0 }
  }
}

export function NotificationsProvider({ children }) {
  const initial = load()
  const [items, setItems] = useState(initial.items) // full history (persisted)
  const [unread, setUnread] = useState(initial.unread)
  const [toasts, setToasts] = useState([]) // transient pop-ups (not persisted)

  // Persist history + unread count across refreshes.
  useEffect(() => {
    localStorage.setItem(STORE_KEY, JSON.stringify({ items, unread }))
  }, [items, unread])

  const dismissToast = useCallback((id) => {
    setToasts((t) => t.filter((x) => x.id !== id))
  }, [])

  const push = useCallback(
    (n) => {
      const item = { id: `n${++seq}`, ts: Date.now(), ...n }
      setItems((p) => [item, ...p].slice(0, 50))
      setUnread((u) => u + 1)
      setToasts((t) => [item, ...t].slice(0, 4))
      setTimeout(() => dismissToast(item.id), 7000)
    },
    [dismissToast]
  )

  const markAllRead = useCallback(() => setUnread(0), [])
  const clearAll = useCallback(() => { setItems([]); setUnread(0) }, [])

  return (
    <NotificationsContext.Provider value={{ items, unread, toasts, push, markAllRead, clearAll, dismissToast }}>
      {children}
    </NotificationsContext.Provider>
  )
}

export function useNotifications() {
  return useContext(NotificationsContext)
}
