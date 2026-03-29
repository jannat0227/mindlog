import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1rem',
        background: 'var(--bg)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <span style={{ fontSize: '4rem' }}>🔍</span>
      <h1 style={{ fontSize: '1.75rem', color: 'var(--text)' }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-muted)' }}>
        The page you're looking for doesn't exist.
      </p>
      <Link to="/dashboard" className="btn btn-primary" style={{ width: 'auto', marginTop: '0.5rem' }}>
        Back to Dashboard
      </Link>
    </div>
  )
}
