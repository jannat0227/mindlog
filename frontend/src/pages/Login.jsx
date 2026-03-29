import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { login } = useAuth()
  const navigate  = useNavigate()
  const location  = useLocation()
  const justRegistered = location.state?.registered

  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setServerError('')
    setLoading(true)
    try {
      await login(data.username, data.password)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid username or password.'
      setServerError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="logo-icon">🧠</div>
          <span className="logo-text">MindLog</span>
        </div>

        <h2>Welcome back</h2>
        <p className="subtitle">Sign in to continue tracking your wellbeing</p>

        {justRegistered && (
          <div className="alert alert-success">
            Account created! Please sign in.
          </div>
        )}

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Your username"
              autoComplete="username"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && <span className="form-error">{errors.username.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="Your password"
              autoComplete="current-password"
              {...register('password', { required: 'Password is required' })}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="switch-link">
          Don't have an account? <Link to="/register">Create one</Link>
        </p>
      </div>
    </div>
  )
}
