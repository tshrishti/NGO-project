import { useEffect, useRef, useState } from 'react'
import { useCollection } from '../lib/useCollection'
import { CATEGORIES } from '../data/seed'
import { downloadCSV, printReport } from '../lib/report'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  PieChart, Pie, Cell, Legend,
} from 'recharts'

// Measure a container's width so charts get an explicit pixel width
// (avoids Recharts' ResponsiveContainer mis-measuring under StrictMode).
function useWidth() {
  const ref = useRef(null)
  const [width, setWidth] = useState(0)
  useEffect(() => {
    if (!ref.current) return
    const ro = new ResizeObserver((entries) => {
      setWidth(Math.floor(entries[0].contentRect.width))
    })
    ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, width]
}

const STATUS_COLORS = { open: '#f59e0b', assigned: '#6366f1', fulfilled: '#10b981' }

function avgResponseMinutes(needs) {
  const assigned = needs.filter((n) => n.assignedAt && n.createdAt)
  if (!assigned.length) return null
  const total = assigned.reduce((s, n) => s + (n.assignedAt - n.createdAt), 0)
  return Math.round(total / assigned.length / 60000)
}

export default function Impact() {
  const needs = useCollection('needs')
  const users = useCollection('users')

  const fulfilled = needs.filter((n) => n.status === 'fulfilled').length
  const assigned = needs.filter((n) => n.status === 'assigned').length
  const open = needs.filter((n) => n.status === 'open').length
  const volunteers = users.filter((u) => u.role === 'volunteer').length
  const respMin = avgResponseMinutes(needs)
  const [barRef, barW] = useWidth()
  const [pieRef, pieW] = useWidth()

  const byCategory = CATEGORIES.map((c) => ({
    category: c,
    needs: needs.filter((n) => n.category === c).length,
  }))

  const byStatus = [
    { name: 'Open', value: open, key: 'open' },
    { name: 'Assigned', value: assigned, key: 'assigned' },
    { name: 'Fulfilled', value: fulfilled, key: 'fulfilled' },
  ].filter((d) => d.value > 0)

  // Leaderboard: points per volunteer (fulfilled = 10, in-progress = 5).
  const board = {}
  for (const n of needs) {
    if (!n.assignedTo) continue
    const b = (board[n.assignedTo] ||= { id: n.assignedTo, name: n.assignedName || 'Volunteer', tasks: 0, points: 0 })
    b.tasks += 1
    b.points += n.status === 'fulfilled' ? 10 : 5
  }
  const leaders = Object.values(board).sort((a, b) => b.points - a.points).slice(0, 5)
  const medals = ['🥇', '🥈', '🥉']

  return (
    <div className="container report-area">
      <div className="row-between">
        <div>
          <h1>Impact dashboard</h1>
          <p className="muted">Live overview of community needs and volunteer response.</p>
        </div>
        <div className="report-actions">
          <button className="btn secondary" onClick={() => downloadCSV(needs)}>⬇️ Export CSV</button>
          <button className="btn secondary" onClick={printReport}>🖨️ Print / PDF</button>
        </div>
      </div>

      <div className="grid cols-3" style={{ marginTop: 16 }}>
        <div className="card stat">
          <div className="ic">✅</div>
          <div className="num">{fulfilled}</div>
          <div className="lbl">Needs fulfilled</div>
        </div>
        <div className="card stat">
          <div className="ic">🙋</div>
          <div className="num">{volunteers}</div>
          <div className="lbl">Active volunteers</div>
        </div>
        <div className="card stat">
          <div className="ic">⏱️</div>
          <div className="num">{respMin != null ? `${respMin}m` : '—'}</div>
          <div className="lbl">Avg. response time</div>
        </div>
      </div>

      <div className="grid cols-2" style={{ marginTop: 16, alignItems: 'start' }}>
        <div className="card">
          <h3>Needs by category</h3>
          <div ref={barRef} style={{ width: '100%', height: 260 }}>
            {barW > 0 && (
              <BarChart width={barW} height={260} data={byCategory} margin={{ top: 10, right: 8, left: -18, bottom: 0 }} barCategoryGap="28%">
                <XAxis dataKey="category" stroke="var(--muted)" tickLine={false} axisLine={{ stroke: 'var(--border)' }} tick={{ fontSize: 13 }} />
                <YAxis allowDecimals={false} stroke="var(--muted)" tickLine={false} axisLine={false} width={34} />
                <Tooltip cursor={{ fill: 'var(--panel-2)' }} contentStyle={{ background: 'var(--panel-solid)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, boxShadow: 'var(--shadow-sm)' }} />
                <Bar dataKey="needs" fill="#6366f1" radius={[8, 8, 0, 0]} maxBarSize={64} />
              </BarChart>
            )}
          </div>
        </div>

        <div className="card">
          <h3>Status breakdown</h3>
          <div ref={pieRef} style={{ width: '100%', height: 260 }}>
            {byStatus.length === 0 ? (
              <p className="muted">No needs yet.</p>
            ) : (
              pieW > 0 && (
                <PieChart width={pieW} height={260}>
                  <Pie data={byStatus} dataKey="value" nameKey="name" outerRadius={90} innerRadius={48} paddingAngle={2} label>
                    {byStatus.map((d) => (
                      <Cell key={d.key} fill={STATUS_COLORS[d.key]} stroke="var(--panel-solid)" strokeWidth={2} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={{ background: 'var(--panel-solid)', border: '1px solid var(--border)', color: 'var(--text)', borderRadius: 10, boxShadow: 'var(--shadow-sm)' }} />
                </PieChart>
              )
            )}
          </div>
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="row-between">
          <h3 style={{ margin: 0 }}>🏆 Top volunteers</h3>
          <span className="muted small">fulfilled = 10 pts · in-progress = 5 pts</span>
        </div>
        {leaders.length === 0 ? (
          <p className="muted small" style={{ marginTop: 12 }}>No volunteer activity yet — accepted tasks will appear here.</p>
        ) : (
          <div style={{ marginTop: 8 }}>
            {leaders.map((l, i) => (
              <div className="need-row leader-row" key={l.id}>
                <span className="leader-rank">{medals[i] || `#${i + 1}`}</span>
                <div className="grow">
                  <div className="need-title">{l.name}</div>
                  <div className="small muted">{l.tasks} task{l.tasks !== 1 ? 's' : ''} taken</div>
                </div>
                <span className="leader-points">{l.points} pts</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
