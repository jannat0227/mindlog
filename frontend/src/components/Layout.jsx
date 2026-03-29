import { Outlet, useLocation } from 'react-router-dom'
import { useEffect, useRef } from 'react'
import Navbar from './Navbar'
import { useNotifications } from '../hooks/useNotifications'

export default function Layout() {
  const { checkAndNotify } = useNotifications()
  const location = useLocation()
  const mainRef = useRef(null)

  // Daily reminder check every minute
  useEffect(() => {
    const interval = setInterval(checkAndNotify, 60000)
    return () => clearInterval(interval)
  }, [])

  // Fade-in animation on route change
  useEffect(() => {
    const el = mainRef.current
    if (!el) return
    el.classList.remove('page-enter')
    void el.offsetWidth // force reflow
    el.classList.add('page-enter')
  }, [location.pathname])

  return (
    <div className="app-layout">
      <Navbar />
      <main className="main-content page-enter" ref={mainRef}>
        <Outlet />
      </main>
    </div>
  )
}
