import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  LineChart, Line, BarChart, Bar,
  ComposedChart, ScatterChart, Scatter,
  XAxis, YAxis, ZAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import api from '../api/axios'
import { useAuth } from '../context/AuthContext'

function getMoodColor(mood) {
  const m = parseFloat(mood)
  if (m <= 3) return '#E53E3E'
  if (m <= 5) return '#DD6B20'
  if (m <= 7) return '#D69E2E'
  return '#38A169'
}

function formatDate(dateStr) {
  if (!dateStr) return ''
  const parts = String(dateStr).split('T')[0].split('-')
  if (parts.length < 3) return dateStr
  const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]))
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
}

function safeFloat(val, fallback = '—') {
  const n = parseFloat(val)
  return isNaN(n) ? fallback : n.toFixed(1)
}

function OnboardingBanner() {
  return (
    <div className="onboarding-banner">
      <div className="ob-icon">🌱</div>
      <div>
        <h2>Welcome to MindLog!</h2>
        <p>
          This is your personal space to track your mood, journal your thoughts, and understand
          patterns in your mental wellbeing. Here's how to get started:
        </p>
        <div className="onboarding-steps">
          <div className="onboarding-step">
            <span className="step-num">1</span>
            Log your first daily check-in — rate your mood, energy, and anxiety
          </div>
          <div className="onboarding-step">
            <span className="step-num">2</span>
            Write a journal entry to capture what's on your mind
          </div>
          <div className="onboarding-step">
            <span className="step-num">3</span>
            After a few days, your mood trends and charts will appear here
          </div>
        </div>
        <div className="onboarding-actions">
          <Link to="/checkin" className="btn btn-primary" style={{ width: 'auto' }}>
            ✏️ &nbsp;Log your first check-in
          </Link>
          <Link to="/journal/new" className="btn btn-secondary" style={{ width: 'auto' }}>
            📓 &nbsp;Write a journal entry
          </Link>
        </div>
      </div>
    </div>
  )
}

function ScatterDot(props) {
  const { cx, cy, payload } = props
  return (
    <circle
      cx={cx} cy={cy} r={5}
      fill={getMoodColor(payload.mood)}
      fillOpacity={0.75}
      stroke="#fff" strokeWidth={1}
    />
  )
}

export default function Dashboard() {
  const { user } = useAuth()
  const [analytics, setAnalytics] = useState(null)
  const [recentCheckins, setRecentCheckins] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([api.get('/analytics/trends/'), api.get('/checkins/')])
      .then(([analyticsRes, checkinsRes]) => {
        setAnalytics(analyticsRes.data)
        const checkins = Array.isArray(checkinsRes.data)
          ? checkinsRes.data
          : (checkinsRes.data?.results ?? [])
        setRecentCheckins(checkins.slice(0, 5))
      })
      .catch((err) => {
        console.error('Dashboard error:', err)
        setError('Failed to load dashboard data.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading your dashboard</div>

  if (error) return (
    <div>
      <div className="alert alert-error">{error}</div>
      <button className="btn btn-secondary" style={{ width: 'auto' }} onClick={() => window.location.reload()}>
        Retry
      </button>
    </div>
  )

  const totalCheckins = analytics?.total_checkins ?? 0
  const totalJournal  = analytics?.total_journal_entries ?? 0
  const avgMood       = safeFloat(analytics?.overall?.avg_mood)
  const avgEnergy     = safeFloat(analytics?.overall?.avg_energy)
  const isNewUser     = totalCheckins === 0 && totalJournal === 0

  const trendData = (analytics?.daily_trends ?? []).slice(-14).map((d) => ({
    date:    formatDate(d.date),
    Mood:    safeFloat(d.avg_mood, null),
    Energy:  safeFloat(d.avg_energy, null),
    Anxiety: safeFloat(d.avg_anxiety, null),
  }))

  const distributionData = (analytics?.mood_distribution ?? []).map((d) => ({
    mood:  String(d.mood),
    count: d.count,
  }))

  const dowData = (analytics?.day_of_week_trends ?? []).map((d) => ({
    day:        d.day,
    'Avg Mood': d.avg_mood,
    'Anxiety':  d.avg_anxiety,
    count:      d.count,
  }))

  const scatterData = (analytics?.checkin_points ?? []).map((p) => ({
    anxiety: p.anxiety,
    mood:    p.mood,
    energy:  p.energy,
  }))

  // Greeting based on time of day
  const hour = new Date().getHours()
  const greeting =
    hour < 12 ? 'Good morning' :
    hour < 17 ? 'Good afternoon' : 'Good evening'

  return (
    <div>
      <div className="page-header">
        <h1>{greeting}, {user?.username} 👋</h1>
        <p>
          {isNewUser
            ? "Let's get you set up — your dashboard will come alive after your first check-in."
            : `You have ${totalCheckins} check-in${totalCheckins !== 1 ? 's' : ''} and ${totalJournal} journal entr${totalJournal !== 1 ? 'ies' : 'y'} recorded.`}
        </p>
      </div>

      {isNewUser && <OnboardingBanner />}

      {!isNewUser && (
        <>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-label">Total Check-ins</span>
              <span className="stat-value">{totalCheckins}</span>
              <span className="stat-sub">mood entries logged</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Average Mood</span>
              <span className="stat-value" style={{ color: avgMood !== '—' ? getMoodColor(avgMood) : undefined }}>
                {avgMood}
              </span>
              <span className="stat-sub">out of 10</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Avg Energy</span>
              <span className="stat-value">{avgEnergy}</span>
              <span className="stat-sub">out of 10</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Journal Entries</span>
              <span className="stat-value">{totalJournal}</span>
              <span className="stat-sub">thoughts recorded</span>
            </div>
          </div>

          {/* Row 1: Mood trend (wide) | Day-of-week pattern */}
          <div className="dashboard-grid">
            <div className="card">
              <h2>Mood Trend — Last 14 Days</h2>
              {trendData.length === 0 ? (
                <div className="empty-state" style={{ padding: '2rem 0' }}>
                  <span className="empty-icon">📈</span>
                  <p>Keep logging check-ins — your trend will appear here.</p>
                </div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={220}>
                    <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#718096' }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#718096' }} />
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }} />
                      <Line type="monotone" dataKey="Mood"    stroke="#5C6BC0" strokeWidth={2.5} dot={{ r: 3, fill: '#5C6BC0' }} connectNulls />
                      <Line type="monotone" dataKey="Energy"  stroke="#66BB6A" strokeWidth={2}   dot={{ r: 3, fill: '#66BB6A' }} strokeDasharray="4 2" connectNulls />
                      <Line type="monotone" dataKey="Anxiety" stroke="#EF9A9A" strokeWidth={2}   dot={{ r: 3, fill: '#EF9A9A' }} strokeDasharray="2 2" connectNulls />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    <span><span style={{ color: '#5C6BC0' }}>—</span> Mood</span>
                    <span><span style={{ color: '#66BB6A' }}>- -</span> Energy</span>
                    <span><span style={{ color: '#EF9A9A' }}>··</span> Anxiety</span>
                  </div>
                </div>
              )}
            </div>

            {/* Day-of-week pattern */}
            <div className="card">
              <h2>Day-of-Week Pattern</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', marginTop: '-0.25rem' }}>
                Average mood and anxiety by day
              </p>
              {dowData.every((d) => d['Avg Mood'] === null) ? (
                <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                  <span className="empty-icon">📅</span>
                  <p>Log check-ins across different days to see patterns.</p>
                </div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={220}>
                    <ComposedChart data={dowData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#718096' }} />
                      <YAxis domain={[0, 10]} tick={{ fontSize: 11, fill: '#718096' }} />
                      <Tooltip
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
                        formatter={(value, name) => value === null ? ['No data', name] : [Number(value).toFixed(1), name]}
                      />
                      <Bar dataKey="Avg Mood" fill="#5C6BC0" fillOpacity={0.8} radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="Anxiety" stroke="#EF9A9A" strokeWidth={2} dot={{ r: 3 }} connectNulls />
                    </ComposedChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    <span><span style={{ color: '#5C6BC0' }}>■</span> Avg Mood</span>
                    <span><span style={{ color: '#EF9A9A' }}>—</span> Avg Anxiety</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Row 2: Mood vs Anxiety scatter | Distribution + Recent */}
          <div className="dashboard-grid" style={{ marginTop: '1.25rem' }}>
            <div className="card">
              <h2>Mood vs Anxiety</h2>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', marginTop: '-0.25rem' }}>
                Each dot is one check-in — colour shows mood level
              </p>
              {scatterData.length === 0 ? (
                <div className="empty-state" style={{ padding: '1.5rem 0' }}>
                  <span className="empty-icon">🔵</span>
                  <p>Scatter plot will appear after your first check-in.</p>
                </div>
              ) : (
                <div className="chart-container">
                  <ResponsiveContainer width="100%" height={220}>
                    <ScatterChart margin={{ top: 10, right: 10, left: -15, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                      <XAxis
                        type="number" dataKey="anxiety" name="Anxiety"
                        domain={[1, 10]} tick={{ fontSize: 11, fill: '#718096' }}
                        label={{ value: 'Anxiety', position: 'insideBottom', offset: -2, fontSize: 11, fill: '#718096' }}
                      />
                      <YAxis
                        type="number" dataKey="mood" name="Mood"
                        domain={[1, 10]} tick={{ fontSize: 11, fill: '#718096' }}
                        label={{ value: 'Mood', angle: -90, position: 'insideLeft', offset: 12, fontSize: 11, fill: '#718096' }}
                      />
                      <ZAxis range={[40, 40]} />
                      <Tooltip
                        cursor={{ strokeDasharray: '3 3' }}
                        contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #E2E8F0' }}
                        formatter={(value, name) => [value, name]}
                      />
                      <Scatter data={scatterData} shape={<ScatterDot />} />
                    </ScatterChart>
                  </ResponsiveContainer>
                  <div className="chart-legend">
                    <span style={{ color: '#E53E3E' }}>● Low mood</span>
                    <span style={{ color: '#D69E2E' }}>● Okay</span>
                    <span style={{ color: '#38A169' }}>● Good mood</span>
                  </div>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* Distribution */}
              <div className="card">
                <h2>Mood Distribution</h2>
                {totalCheckins === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No data yet.</p>
                ) : (
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={165}>
                      <BarChart data={distributionData} margin={{ top: 5, right: 5, left: -25, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                        <XAxis dataKey="mood" tick={{ fontSize: 11, fill: '#718096' }} />
                        <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#718096' }} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [v, 'Check-ins']} />
                        <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                          {distributionData.map((entry) => (
                            <Cell key={entry.mood} fill={getMoodColor(entry.mood)} />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </div>

              {/* Recent check-ins */}
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.875rem' }}>
                  <h2 style={{ marginBottom: 0 }}>Recent Check-ins</h2>
                  <Link to="/history" style={{ fontSize: '0.8rem', color: 'var(--primary)', textDecoration: 'none', fontWeight: 600 }}>
                    View all →
                  </Link>
                </div>
                {recentCheckins.length === 0 ? (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>No check-ins yet.</p>
                ) : (
                  <div className="checkin-history">
                    {recentCheckins.map((c) => (
                      <div className="checkin-row" key={c.id}>
                        <span className="checkin-date">{formatDate(c.created_at)}</span>
                        <span className="mood-pill" style={{ background: getMoodColor(c.mood) }}>
                          {c.mood}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="quick-actions">
        <Link to="/checkin"    className="btn btn-primary"    style={{ width: 'auto' }}>✏️ &nbsp;New Check-in</Link>
        <Link to="/journal/new" className="btn btn-secondary" style={{ width: 'auto' }}>📓 &nbsp;New Journal Entry</Link>
        {totalCheckins > 0 && (
          <Link to="/history" className="btn btn-secondary" style={{ width: 'auto' }}>📅 &nbsp;View History</Link>
        )}
      </div>
    </div>
  )
}
