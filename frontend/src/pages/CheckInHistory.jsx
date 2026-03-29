import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

function getMoodColor(mood) {
  if (mood <= 3) return '#E53E3E'
  if (mood <= 5) return '#DD6B20'
  if (mood <= 7) return '#D69E2E'
  return '#38A169'
}

function getMoodLabel(mood) {
  if (mood <= 2) return 'Very low'
  if (mood <= 4) return 'Low'
  if (mood <= 6) return 'Okay'
  if (mood <= 8) return 'Good'
  return 'Great'
}

function formatFull(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
  })
}

const FILTERS = [
  { label: 'All',       value: 'all' },
  { label: '😊 Good (7+)',    value: 'good' },
  { label: '😐 Okay (4–6)',   value: 'okay' },
  { label: '😔 Low (1–3)',    value: 'low' },
]

export default function CheckInHistory() {
  const [checkins, setCheckins] = useState([])
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [filter, setFilter]     = useState('all')

  useEffect(() => {
    api
      .get('/checkins/')
      .then((res) => {
        const data = Array.isArray(res.data) ? res.data : (res.data?.results ?? [])
        setCheckins(data)
      })
      .catch(() => setError('Failed to load your check-in history.'))
      .finally(() => setLoading(false))
  }, [])

  const filtered = checkins.filter((c) => {
    if (filter === 'good') return c.mood >= 7
    if (filter === 'okay') return c.mood >= 4 && c.mood <= 6
    if (filter === 'low')  return c.mood <= 3
    return true
  })

  if (loading) return <div className="loading">Loading your history</div>

  return (
    <div>
      <div className="page-header">
        <h1>Check-in History</h1>
        <p>
          {checkins.length > 0
            ? `${checkins.length} check-in${checkins.length !== 1 ? 's' : ''} total — keep the streak going!`
            : 'Your check-in history will appear here.'}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {checkins.length === 0 && !error && (
        <div className="empty-state">
          <span className="empty-icon">📅</span>
          <h3>No check-ins yet</h3>
          <p>Start logging your mood daily to build a history of your wellbeing.</p>
          <Link to="/checkin" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
            Log Your First Check-in
          </Link>
        </div>
      )}

      {checkins.length > 0 && (
        <>
          <div className="filter-bar">
            {FILTERS.map((f) => (
              <button
                key={f.value}
                className={`filter-btn ${filter === f.value ? 'active' : ''}`}
                onClick={() => setFilter(f.value)}
              >
                {f.label}
              </button>
            ))}
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state" style={{ padding: '2rem 0' }}>
              <span className="empty-icon">🔍</span>
              <p>No check-ins match this filter.</p>
            </div>
          ) : (
            <div className="history-list">
              {filtered.map((c) => {
                const color = getMoodColor(c.mood)
                return (
                  <div className="history-card" key={c.id}>
                    {/* Mood badge */}
                    <div
                      className="history-mood-badge"
                      style={{ background: `${color}18`, color }}
                    >
                      <span className="hm-num">{c.mood}</span>
                      <span className="hm-label">{getMoodLabel(c.mood)}</span>
                    </div>

                    {/* Date + notes */}
                    <div className="history-main">
                      <div className="history-date">
                        {formatFull(c.created_at)} &middot; {formatTime(c.created_at)}
                      </div>
                      <div className="history-notes">
                        {c.notes || <em style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No notes</em>}
                      </div>
                    </div>

                    {/* Energy + Anxiety */}
                    <div className="history-metrics">
                      <div className="metric-pill">
                        <span className="mp-val">⚡{c.energy}</span>
                        <span>Energy</span>
                      </div>
                      <div className="metric-pill">
                        <span className="mp-val">🌀{c.anxiety}</span>
                        <span>Anxiety</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          <div style={{ marginTop: '1.5rem' }}>
            <Link to="/checkin" className="btn btn-primary" style={{ width: 'auto' }}>
              + Log Today's Check-in
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
