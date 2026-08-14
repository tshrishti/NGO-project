// Frontend data layer backed by the Node/Express + SQLite API.
//
// Real-time "live" updates come from a single Server-Sent Events stream
// (/api/stream); the server pushes the full collection whenever it changes.
// A small in-memory cache lets getAll() stay synchronous for the UI.
//
// The public surface (subscribe / getAll / add / update) matches the old
// localStorage layer, so components didn't need to change.

const API = '/api'
const cache = { users: [], needs: [], matches: [] }
const listeners = new Map() // collection -> Set<callback>

let source = null

function notify(collection) {
  const set = listeners.get(collection)
  if (set) set.forEach((cb) => cb(cache[collection]))
}

function ensureStream() {
  if (source) return
  source = new EventSource(`${API}/stream`)
  for (const c of ['users', 'needs', 'matches']) {
    source.addEventListener(c, (e) => {
      try {
        cache[c] = JSON.parse(e.data)
        notify(c)
      } catch {
        /* ignore malformed frame */
      }
    })
  }
  source.onerror = () => {
    // EventSource auto-reconnects; nothing to do.
  }
}

async function fetchInitial(collection) {
  try {
    const res = await fetch(`${API}/${collection}`)
    if (res.ok) {
      cache[collection] = await res.json()
      notify(collection)
    }
  } catch {
    /* offline — stream will backfill when it connects */
  }
}

export function getAll(collection) {
  return cache[collection] || []
}

export function getById(collection, id) {
  return (cache[collection] || []).find((d) => d.id === id) || null
}

// Subscribe to live updates for a collection. Returns an unsubscribe fn.
export function subscribe(collection, callback) {
  if (!listeners.has(collection)) listeners.set(collection, new Set())
  listeners.get(collection).add(callback)
  ensureStream()
  callback(cache[collection] || []) // fire with current cache
  fetchInitial(collection) // and refresh from the API
  return () => listeners.get(collection)?.delete(callback)
}

export async function add(collection, data) {
  const res = await fetch(`${API}/${collection}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed')
  return res.json()
}

export async function update(collection, id, patch) {
  const res = await fetch(`${API}/${collection}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error || 'Request failed')
  return res.json()
}

// Auth helpers (dedicated endpoints).
export async function apiSignup(payload) {
  const res = await fetch(`${API}/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Sign up failed')
  return data
}

export async function apiLogin(payload) {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Login failed')
  return data
}

// Public help request (community member) → creates a need on the server.
export async function apiHelp(payload) {
  const res = await fetch(`${API}/help`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || 'Could not submit request')
  return data
}
