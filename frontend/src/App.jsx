import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CheckIn from './pages/CheckIn'
import CheckInHistory from './pages/CheckInHistory'
import Journal from './pages/Journal'
import JournalForm from './pages/JournalForm'
import Settings from './pages/Settings'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login"    element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index                element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard"     element={<Dashboard />} />
            <Route path="checkin"       element={<CheckIn />} />
            <Route path="history"       element={<CheckInHistory />} />
            <Route path="journal"       element={<Journal />} />
            <Route path="journal/new"   element={<JournalForm />} />
            <Route path="journal/:id"   element={<JournalForm />} />
            <Route path="settings"      element={<Settings />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
