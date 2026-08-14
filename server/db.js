import Database from 'better-sqlite3'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const db = new Database(join(__dirname, 'reliefLink.db'))
db.pragma('journal_mode = WAL')

// Skills[] and location{lat,lng} are stored as JSON text columns.
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    skills TEXT DEFAULT '[]',
    availability TEXT DEFAULT 'anytime',
    location TEXT,
    createdAt INTEGER
  );
  CREATE TABLE IF NOT EXISTS needs (
    id TEXT PRIMARY KEY,
    ngoId TEXT NOT NULL,
    ngoName TEXT,
    title TEXT NOT NULL,
    category TEXT,
    urgency TEXT,
    skills TEXT DEFAULT '[]',
    location TEXT,
    status TEXT DEFAULT 'open',
    assignedTo TEXT,
    assignedName TEXT,
    assignedAt INTEGER,
    fulfilledAt INTEGER,
    requesterName TEXT,
    requesterPhone TEXT,
    description TEXT,
    photo TEXT,
    source TEXT DEFAULT 'ngo',
    createdAt INTEGER,
    updatedAt INTEGER
  );
  CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    needId TEXT NOT NULL,
    volunteerId TEXT NOT NULL,
    volunteerName TEXT,
    status TEXT DEFAULT 'accepted',
    createdAt INTEGER
  );
`)

const JSON_FIELDS = { users: ['skills', 'location'], needs: ['skills', 'location'], matches: [] }

// Add columns to an existing needs table if a prior DB predates them.
function migrate() {
  const cols = db.prepare(`PRAGMA table_info(needs)`).all().map((c) => c.name)
  const addCol = (name, def = 'TEXT') => {
    if (!cols.includes(name)) db.exec(`ALTER TABLE needs ADD COLUMN ${name} ${def}`)
  }
  addCol('requesterName')
  addCol('requesterPhone')
  addCol('description')
  addCol('photo')
  addCol("source", "TEXT DEFAULT 'ngo'")
}
migrate()

function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}

// Parse JSON columns back into objects/arrays on read.
function hydrate(collection, row) {
  if (!row) return row
  const out = { ...row }
  for (const f of JSON_FIELDS[collection]) {
    try {
      out[f] = row[f] ? JSON.parse(row[f]) : (f === 'skills' ? [] : null)
    } catch {
      out[f] = f === 'skills' ? [] : null
    }
  }
  return out
}

function serialize(collection, data) {
  const out = { ...data }
  for (const f of JSON_FIELDS[collection]) {
    if (out[f] !== undefined) out[f] = JSON.stringify(out[f])
  }
  return out
}

export function getAll(collection) {
  const rows = db.prepare(`SELECT * FROM ${collection} ORDER BY createdAt ASC`).all()
  return rows.map((r) => hydrate(collection, r))
}

export function getById(collection, id) {
  const row = db.prepare(`SELECT * FROM ${collection} WHERE id = ?`).get(id)
  return hydrate(collection, row)
}

export function findUserByEmail(email) {
  const row = db.prepare(`SELECT * FROM users WHERE email = ?`).get(email)
  return hydrate('users', row)
}

export function insert(collection, data) {
  const doc = serialize(collection, { id: uid(), createdAt: Date.now(), ...data })
  const keys = Object.keys(doc)
  const placeholders = keys.map((k) => `@${k}`).join(', ')
  db.prepare(`INSERT INTO ${collection} (${keys.join(', ')}) VALUES (${placeholders})`).run(doc)
  return getById(collection, doc.id)
}

export function patch(collection, id, changes) {
  const existing = db.prepare(`SELECT * FROM ${collection} WHERE id = ?`).get(id)
  if (!existing) return null
  const data = serialize(collection, { ...changes, updatedAt: Date.now() })
  const keys = Object.keys(data).filter((k) => k !== 'id')
  const setClause = keys.map((k) => `${k} = @${k}`).join(', ')
  db.prepare(`UPDATE ${collection} SET ${setClause} WHERE id = @id`).run({ ...data, id })
  return getById(collection, id)
}

export function seedIfEmpty() {
  const count = db.prepare('SELECT COUNT(*) AS c FROM needs').get().c
  if (count > 0) return

  const center = { lat: 12.9716, lng: 77.5946 }
  const jitter = (b, s = 0.05) => b + (Math.random() - 0.5) * s

  const ngo = insert('users', {
    role: 'ngo', name: 'Helping Hands NGO', email: 'ngo@demo.org',
    password: 'demo', skills: [], location: center,
  })

  insert('users', {
    role: 'volunteer', name: 'Asha Volunteer', email: 'asha@demo.org',
    password: 'demo', skills: ['First Aid', 'Cooking', 'Driving'],
    availability: 'weekends', location: { lat: jitter(center.lat), lng: jitter(center.lng) },
  })

  const demoNeeds = [
    { title: 'Emergency medicine delivery', category: 'medical', urgency: 'high', skills: ['First Aid', 'Driving'] },
    { title: 'Hot meals for shelter (200 people)', category: 'food', urgency: 'high', skills: ['Cooking', 'Food Distribution'] },
    { title: 'Repair damaged roof', category: 'shelter', urgency: 'medium', skills: ['Construction', 'Logistics'] },
    { title: 'After-school tutoring', category: 'education', urgency: 'low', skills: ['Teaching', 'Childcare'] },
    { title: 'Blood pressure check camp', category: 'medical', urgency: 'medium', skills: ['Nursing', 'First Aid'] },
    { title: 'Grocery kit distribution', category: 'food', urgency: 'low', skills: ['Food Distribution', 'Driving'] },
  ]
  for (const n of demoNeeds) {
    insert('needs', {
      ngoId: ngo.id, ngoName: ngo.name, title: n.title, category: n.category,
      urgency: n.urgency, skills: n.skills, status: 'open',
      location: { lat: jitter(center.lat, 0.09), lng: jitter(center.lng, 0.09) },
    })
  }
  console.log('[db] seeded demo data')
}

export default db
