import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import CrisisBanner from '../components/CrisisBanner'
import api from '../api/axios'

const MOOD_META = [
  null,
  { emoji: '😢', label: 'Very low',   color: '#E53E3E', bg: '#FFF5F5' },
  { emoji: '😔', label: 'Low',        color: '#E53E3E', bg: '#FFF5F5' },
  { emoji: '😟', label: 'Below average', color: '#DD6B20', bg: '#FFFAF0' },
  { emoji: '😐', label: 'Okay',       color: '#DD6B20', bg: '#FFFAF0' },
  { emoji: '🙁', label: 'Average',    color: '#D69E2E', bg: '#FFFFF0' },
  { emoji: '😶', label: 'Alright',    color: '#D69E2E', bg: '#FFFFF0' },
  { emoji: '🙂', label: 'Good',       color: '#38A169', bg: '#F0FFF4' },
  { emoji: '😊', label: 'Pretty good', color: '#38A169', bg: '#F0FFF4' },
  { emoji: '😄', label: 'Great',      color: '#2F855A', bg: '#E6FFFA' },
  { emoji: '🤩', label: 'Excellent',  color: '#2F855A', bg: '#E6FFFA' },
]

const ENERGY_META = [
  null,
  { label: 'Exhausted',      color: '#E53E3E' },
  { label: 'Very tired',     color: '#E53E3E' },
  { label: 'Tired',          color: '#DD6B20' },
  { label: 'Low energy',     color: '#DD6B20' },
  { label: 'Moderate',       color: '#D69E2E' },
  { label: 'Fair energy',    color: '#D69E2E' },
  { label: 'Energised',      color: '#38A169' },
  { label: 'Good energy',    color: '#38A169' },
  { label: 'Very energised', color: '#2F855A' },
  { label: 'Full of energy', color: '#2F855A' },
]

const ANXIETY_META = [
  null,
  { label: 'Very calm',      color: '#2F855A' },
  { label: 'Calm',           color: '#38A169' },
  { label: 'Mostly calm',    color: '#38A169' },
  { label: 'Slightly anxious', color: '#D69E2E' },
  { label: 'Mild anxiety',   color: '#D69E2E' },
  { label: 'Noticeable',     color: '#DD6B20' },
  { label: 'Anxious',        color: '#DD6B20' },
  { label: 'Very anxious',   color: '#E53E3E' },
  { label: 'High anxiety',   color: '#E53E3E' },
  { label: 'Overwhelmed',    color: '#C53030' },
]

function SliderField({ label, hint, value, onChange, meta }) {
  const m = meta[value]
  return (
    <div className="slider-group">
      <div className="slider-header">
        <span className="slider-label">{label}</span>
        <span className="slider-val" style={{ color: m?.color }}>{value}<span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-muted)' }}>/10</span></span>
      </div>
      <input
        type="range" min="1" max="10" value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ '--thumb-color': m?.color }}
      />
      {m && (
        <div className="mood-badge" style={{ background: m.bg, color: m.color }}>
          {'emoji' in m && <span style={{ fontSize: '1.2rem' }}>{m.emoji}</span>}
          <span>{m.label}</span>
          {hint && <span style={{ marginLeft: 'auto', fontSize: '0.78rem', color: 'var(--text-muted)', fontWeight: 400 }}>{hint}</span>}
        </div>
      )}
    </div>
  )
}

function SuccessCard({ mood, energy, anxiety, onNewCheckin }) {
  const m = MOOD_META[mood]
  return (
    <div className="checkin-success">
      <span className="success-icon">✅</span>
      <h3>Check-in saved!</h3>
      <p className="success-msg">
        Great job checking in. Tracking consistently helps you spot patterns over time.
      </p>
      <div className="checkin-summary">
        <div className="checkin-summary-item">
          <span className="sum-label">Mood</span>
          <span className="sum-value" style={{ color: m?.color }}>
            {m?.emoji} {mood}
          </span>
        </div>
        <div className="checkin-summary-item">
          <span className="sum-label">Energy</span>
          <span className="sum-value" style={{ color: ENERGY_META[energy]?.color }}>{energy}</span>
        </div>
        <div className="checkin-summary-item">
          <span className="sum-label">Anxiety</span>
          <span className="sum-value" style={{ color: ANXIETY_META[anxiety]?.color }}>{anxiety}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn-primary" style={{ width: 'auto' }} onClick={onNewCheckin}>
          + Log Another
        </button>
        <Link to="/dashboard" className="btn btn-secondary" style={{ width: 'auto' }}>
          View Dashboard
        </Link>
        <Link to="/history" className="btn btn-secondary" style={{ width: 'auto' }}>
          View History
        </Link>
      </div>
    </div>
  )
}

export default function CheckIn() {
  const [mood,    setMood]    = useState(5)
  const [energy,  setEnergy]  = useState(5)
  const [anxiety, setAnxiety] = useState(5)

  const [lastCheckin, setLastCheckin] = useState(null)
  const [showCrisis,  setShowCrisis]  = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [serverError, setServerError] = useState('')

  const { register, handleSubmit, reset } = useForm({ defaultValues: { notes: '' } })

  const resetForm = () => {
    setLastCheckin(null)
    setShowCrisis(false)
    setMood(5)
    setEnergy(5)
    setAnxiety(5)
    reset()
  }

  const onSubmit = async (data) => {
    setServerError('')
    setLoading(true)
    try {
      const res = await api.post('/checkins/', { mood, energy, anxiety, notes: data.notes })
      setLastCheckin({ mood, energy, anxiety })
      reset()
      if (res.data.crisis_resources) setShowCrisis(true)
    } catch (err) {
      const errData = err.response?.data
      const msg = errData
        ? Object.values(errData).flat()[0]
        : 'Something went wrong. Please try again.'
      setServerError(msg)
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div>
      <div className="page-header">
        <h1>Daily Check-in</h1>
        <p>{today} — Take a moment to check in with yourself.</p>
      </div>

      {showCrisis && <CrisisBanner onDismiss={() => setShowCrisis(false)} />}

      {lastCheckin && !showCrisis ? (
        <SuccessCard
          mood={lastCheckin.mood}
          energy={lastCheckin.energy}
          anxiety={lastCheckin.anxiety}
          onNewCheckin={resetForm}
        />
      ) : (
        <div className="card" style={{ maxWidth: 580 }}>
          {serverError && <div className="alert alert-error">{serverError}</div>}

          <form onSubmit={handleSubmit(onSubmit)}>
            <SliderField
              label="How's your mood?"
              hint="Overall emotional state"
              value={mood}
              onChange={setMood}
              meta={MOOD_META}
            />

            <div className="divider" />

            <SliderField
              label="Energy level"
              hint="Physical & mental energy"
              value={energy}
              onChange={setEnergy}
              meta={ENERGY_META}
            />

            <div className="divider" />

            <SliderField
              label="Anxiety level"
              hint="1 = very calm, 10 = very anxious"
              value={anxiety}
              onChange={setAnxiety}
              meta={ANXIETY_META}
            />

            <div className="divider" />

            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="notes">Anything on your mind? <span style={{ fontWeight: 400, color: 'var(--text-muted)' }}>(optional)</span></label>
              <textarea
                id="notes"
                placeholder="Write a few words about how your day went, what's affecting your mood, or anything else..."
                style={{ minHeight: 100 }}
                {...register('notes')}
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving your check-in...' : 'Save Check-in'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
