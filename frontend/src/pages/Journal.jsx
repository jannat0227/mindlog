import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../api/axios'

function formatDate(dateStr) {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function Journal() {
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/journal/')
      .then((res) => {
        // handle both plain array and paginated response
        const data = Array.isArray(res.data) ? res.data : res.data?.results ?? []
        setEntries(data)
      })
      .catch((err) => {
        console.error('Journal load error:', err)
        setError('Failed to load journal entries. Please refresh.')
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Loading your journal...</div>

  return (
    <div>
      <div className="journal-header">
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1>Journal</h1>
          <p>Your private space to reflect and write freely.</p>
        </div>
        <Link to="/journal/new" className="btn btn-primary" style={{ width: 'auto', flexShrink: 0 }}>
          + New Entry
        </Link>
      </div>

      {error && (
        <div className="alert alert-error" style={{ marginTop: '1rem' }}>
          {error}
        </div>
      )}

      {!error && entries.length === 0 && (
        <div className="empty-state" style={{ marginTop: '2rem' }}>
          <span className="empty-icon">📓</span>
          <p>No journal entries yet. Start writing your thoughts!</p>
          <Link to="/journal/new" className="btn btn-primary" style={{ display: 'inline-flex', width: 'auto' }}>
            Write Your First Entry
          </Link>
        </div>
      )}

      {entries.length > 0 && (
        <div className="journal-list" style={{ marginTop: '1.25rem' }}>
          {entries.map((entry) => (
            <Link to={`/journal/${entry.id}`} className="journal-item" key={entry.id}>
              <h3>{entry.title}</h3>
              <p className="journal-date">{formatDate(entry.created_at)}</p>
              <p className="journal-excerpt">{entry.body}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
