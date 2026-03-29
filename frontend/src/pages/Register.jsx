import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api/axios'

export default function Register() {
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setServerError('')
    setLoading(true)
    try {
      await api.post('/auth/register/', {
        username:  data.username,
        email:     data.email,
        password:  data.password,
        password2: data.password2,
      })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      const d = err.response?.data
      if (d) {
        const first = Object.values(d).flat()[0]
        setServerError(typeof first === 'string' ? first : 'Registration failed.')
      } else {
        setServerError('Registration failed. Please try again.')
      }
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

        <h2>Create your account</h2>
        <p className="subtitle">Start your mental wellbeing journey today</p>

        {serverError && <div className="alert alert-error">{serverError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              id="username"
              type="text"
              placeholder="Choose a username"
              autoComplete="username"
              {...register('username', {
                required:  'Username is required',
                minLength: { value: 3, message: 'At least 3 characters' },
                pattern:   { value: /^\w+$/, message: 'Letters, numbers and underscores only' },
              })}
            />
            {errors.username && <span className="form-error">{errors.username.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              placeholder="your@email.com"
              autoComplete="email"
              {...register('email', {
                required: 'Email is required',
                pattern:  { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email address' },
              })}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              placeholder="At least 8 characters"
              autoComplete="new-password"
              {...register('password', {
                required:  'Password is required',
                minLength: { value: 8, message: 'At least 8 characters' },
              })}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password2">Confirm password</label>
            <input
              id="password2"
              type="password"
              placeholder="Repeat your password"
              autoComplete="new-password"
              {...register('password2', {
                required: 'Please confirm your password',
                validate: (val) => val === password || 'Passwords do not match',
              })}
            />
            {errors.password2 && <span className="form-error">{errors.password2.message}</span>}
          </div>

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="switch-link">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
