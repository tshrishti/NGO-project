import { createContext, useContext, useEffect, useState } from 'react'
import { subscribe, update, apiSignup, apiLogin } from '../data/store'

const AuthContext = createContext(null)
const SESSION_KEY = 'reliefLink:session'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  // Keep the signed-in user in sync with live 'users' updates from the server
  // (e.g. after a profile edit, possibly from another device/tab).
  useEffect(() => {
    const id = localStorage.getItem(SESSION_KEY)
    const unsub = subscribe('users', (users) => {
      const current = localStorage.getItem(SESSION_KEY)
      if (!current) {
        setUser(null)
        setReady(true)
        return
      }
      const found = users.find((u) => u.id === current)
      if (found) {
        setUser(found)
        setReady(true)
      } else if (users.length) {
        // Users loaded but session id no longer valid — treat as logged out.
        setUser(null)
        setReady(true)
      }
      // else: users not loaded yet — stay "not ready" to avoid a false redirect
    })
    if (!id) setReady(true)
    return unsub
  }, [])

  async function signup({ role, name, email, password }) {
    const doc = await apiSignup({ role, name, email, password })
    localStorage.setItem(SESSION_KEY, doc.id)
    setUser(doc)
    return doc
  }

  async function login({ email, password }) {
    const u = await apiLogin({ email, password })
    localStorage.setItem(SESSION_KEY, u.id)
    setUser(u)
    return u
  }

  function logout() {
    localStorage.removeItem(SESSION_KEY)
    setUser(null)
  }

  async function updateProfile(patch) {
    if (!user) return
    const updated = await update('users', user.id, patch)
    setUser(updated)
    return updated
  }

  return (
    <AuthContext.Provider value={{ user, ready, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
