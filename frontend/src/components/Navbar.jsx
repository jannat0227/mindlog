import { useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const NAV_LINKS = [
  { to: '/dashboard',  label: 'Dashboard', icon: '📊' },
  { to: '/checkin',    label: 'Check-in',  icon: '✏️' },
  { to: '/history',    label: 'History',   icon: '📅' },
  { to: '/journal',    label: 'Journal',   icon: '📓' },
  { to: '/settings',   label: 'Settings',  icon: '⚙️' },
]

export default function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <>
      <nav className="navbar">
        <NavLink to="/dashboard" className="navbar-brand">
          <span className="brand-icon">🧠</span>
          MindLog
        </NavLink>

        <ul className="navbar-links">
          {NAV_LINKS.map(({ to, label }) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) => isActive ? 'active' : ''}>
                {label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="navbar-right">
          <span className="navbar-user">Hi, {user?.username} 👋</span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Log out
          </button>
          <button
            className={`hamburger ${mobileOpen ? 'open' : ''}`}
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`mobile-menu ${mobileOpen ? 'open' : ''}`} role="navigation">
        <ul>
          {NAV_LINKS.map(({ to, label, icon }) => (
            <li key={to}>
              <NavLink to={to} className={({ isActive }) => isActive ? 'active' : ''}>
                <span>{icon}</span> {label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="mobile-menu-footer">
          <span className="user-pill">Signed in as <strong>{user?.username}</strong></span>
          <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </>
  )
}
