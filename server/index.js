import express from 'express'
import cors from 'cors'
import * as store from './db.js'

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 4000

// ---- Server-Sent Events hub (real-time "live" updates) ----
const clients = new Set()

function broadcast(collection) {
  const payload = JSON.stringify(store.getAll(collection))
  for (const res of clients) {
    res.write(`event: ${collection}\n`)
    res.write(`data: ${payload}\n\n`)
  }
}

app.get('/api/stream', (req, res) => {
  res.set({
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
  })
  res.flushHeaders()
  res.write('retry: 3000\n\n')

  // Send current snapshots immediately so new subscribers are in sync.
  for (const c of ['users', 'needs', 'matches']) {
    res.write(`event: ${c}\n`)
    res.write(`data: ${JSON.stringify(store.getAll(c))}\n\n`)
  }

  clients.add(res)
  const ping = setInterval(() => res.write(': ping\n\n'), 25000)
  req.on('close', () => {
    clearInterval(ping)
    clients.delete(res)
  })
})

// ---- Auth ----
app.post('/api/auth/signup', (req, res) => {
  const { role, name, email, password } = req.body || {}
  if (!role || !name || !email || !password)
    return res.status(400).json({ error: 'Missing required fields.' })
  if (store.findUserByEmail(email))
    return res.status(409).json({ error: 'An account with that email already exists.' })
  const user = store.insert('users', {
    role, name, email, password,
    skills: [], availability: 'anytime', location: null,
  })
  broadcast('users')
  res.status(201).json(user)
})

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {}
  const user = store.findUserByEmail(email)
  if (!user || user.password !== password)
    return res.status(401).json({ error: 'Invalid email or password.' })
  res.json(user)
})

// ---- Collections ----
for (const c of ['users', 'needs', 'matches']) {
  app.get(`/api/${c}`, (req, res) => res.json(store.getAll(c)))
}

app.get('/api/users/:id', (req, res) => {
  const u = store.getById('users', req.params.id)
  if (!u) return res.status(404).json({ error: 'Not found' })
  res.json(u)
})

app.post('/api/needs', (req, res) => {
  const need = store.insert('needs', { status: 'open', source: 'ngo', ...req.body })
  broadcast('needs')
  res.status(201).json(need)
})

// Public help request (e.g. from a community member / WhatsApp handoff).
app.post('/api/help', (req, res) => {
  const { title, category, urgency, skills, location, requesterName, requesterPhone, description, photo } = req.body || {}
  if (!title || !location) return res.status(400).json({ error: 'Title and location are required.' })
  const need = store.insert('needs', {
    ngoId: 'public',
    ngoName: requesterName ? `${requesterName} (community)` : 'Community request',
    title,
    category: category || 'medical',
    urgency: urgency || 'high',
    skills: skills || [],
    location,
    requesterName: requesterName || null,
    requesterPhone: requesterPhone || null,
    description: description || null,
    photo: photo || null,
    status: 'open',
    source: 'whatsapp',
  })
  broadcast('needs')
  res.status(201).json(need)
})

app.patch('/api/needs/:id', (req, res) => {
  const need = store.patch('needs', req.params.id, req.body)
  if (!need) return res.status(404).json({ error: 'Not found' })
  broadcast('needs')
  res.json(need)
})

app.patch('/api/users/:id', (req, res) => {
  const user = store.patch('users', req.params.id, req.body)
  if (!user) return res.status(404).json({ error: 'Not found' })
  broadcast('users')
  res.json(user)
})

app.post('/api/matches', (req, res) => {
  const match = store.insert('matches', { status: 'accepted', ...req.body })
  broadcast('matches')
  res.status(201).json(match)
})

store.seedIfEmpty()
app.listen(PORT, () => console.log(`[server] ReliefLink API on http://localhost:${PORT}`))
