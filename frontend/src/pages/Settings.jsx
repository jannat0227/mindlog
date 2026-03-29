import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { useAuth } from '../context/AuthContext'
import { useNotifications } from '../hooks/useNotifications'
import api from '../api/axios'

export default function Settings() {
  const { user } = useAuth()
  const {
    isSupported,
    requestPermission,
    saveReminderTime,
    getReminderTime,
    permission,
  } = useNotifications()

  const [pwSuccess, setPwSuccess] = useState('')
  const [pwError, setPwError] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(permission === 'granted')
  const [reminderTime, setReminderTime] = useState(getReminderTime())
  const [notifMsg, setNotifMsg] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm()

  const newPassword = watch('new_password')

  const onChangePassword = async (data) => {
    setPwError('')
    setPwSuccess('')
    setPwLoading(true)
    try {
      await api.post('/auth/change-password/', {
        old_password: data.old_password,
        new_password: data.new_password,
      })
      setPwSuccess('Password updated successfully.')
      reset()
    } catch (err) {
      const errData = err.response?.data
      const msg = errData?.error || Object.values(errData || {}).flat()[0] || 'Failed to update password.'
      setPwError(msg)
    } finally {
      setPwLoading(false)
    }
  }

  const handleNotifToggle = async (e) => {
    if (e.target.checked) {
      const result = await requestPermission()
      if (result === 'granted') {
        setNotifEnabled(true)
        setNotifMsg('Notifications enabled.')
      } else {
        setNotifEnabled(false)
        setNotifMsg('Permission denied. Please allow notifications in your browser settings.')
      }
    } else {
      setNotifEnabled(false)
      setNotifMsg('')
    }
  }

  const handleSaveReminder = () => {
    if (!reminderTime) return
    saveReminderTime(reminderTime)
    setNotifMsg(`Reminder set for ${reminderTime} daily.`)
  }

  return (
    <div>
      <div className="page-header">
        <h1>Settings</h1>
        <p>Manage your account and preferences.</p>
      </div>

      <div style={{ maxWidth: 600, display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

        {/* Profile */}
        <div className="card">
          <div className="settings-section">
            <h2>Profile</h2>
            <div className="info-row">
              <span className="label">Username</span>
              <span className="value">{user?.username}</span>
            </div>
            <div className="info-row">
              <span className="label">Email</span>
              <span className="value">{user?.email}</span>
            </div>
            <div className="info-row">
              <span className="label">Member since</span>
              <span className="value">
                {user?.created_at
                  ? new Date(user.created_at).toLocaleDateString('en-GB', {
                      day: 'numeric', month: 'long', year: 'numeric',
                    })
                  : '—'}
              </span>
            </div>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="settings-section" style={{ marginBottom: 0 }}>
            <h2>Change Password</h2>
            {pwSuccess && <div className="alert alert-success">{pwSuccess}</div>}
            {pwError && <div className="alert alert-error">{pwError}</div>}
            <form onSubmit={handleSubmit(onChangePassword)}>
              <div className="form-group">
                <label htmlFor="old_password">Current Password</label>
                <input
                  id="old_password"
                  type="password"
                  placeholder="Your current password"
                  {...register('old_password', { required: 'Current password is required' })}
                />
                {errors.old_password && (
                  <span className="form-error">{errors.old_password.message}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="new_password">New Password</label>
                <input
                  id="new_password"
                  type="password"
                  placeholder="At least 8 characters"
                  {...register('new_password', {
                    required: 'New password is required',
                    minLength: { value: 8, message: 'At least 8 characters' },
                  })}
                />
                {errors.new_password && (
                  <span className="form-error">{errors.new_password.message}</span>
                )}
              </div>
              <div className="form-group">
                <label htmlFor="confirm_password">Confirm New Password</label>
                <input
                  id="confirm_password"
                  type="password"
                  placeholder="Repeat new password"
                  {...register('confirm_password', {
                    required: 'Please confirm your new password',
                    validate: (val) => val === newPassword || 'Passwords do not match',
                  })}
                />
                {errors.confirm_password && (
                  <span className="form-error">{errors.confirm_password.message}</span>
                )}
              </div>
              <button type="submit" className="btn btn-primary" disabled={pwLoading}>
                {pwLoading ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        </div>

        {/* Notifications */}
        <div className="card">
          <div className="settings-section" style={{ marginBottom: 0 }}>
            <h2>Daily Reminder Notifications</h2>
            {!isSupported && (
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                Browser notifications are not supported in this browser.
              </p>
            )}
            {isSupported && (
              <>
                <div className="toggle-row">
                  <label htmlFor="notif-toggle">Enable daily reminders</label>
                  <label className="toggle">
                    <input
                      id="notif-toggle"
                      type="checkbox"
                      checked={notifEnabled}
                      onChange={handleNotifToggle}
                    />
                    <span className="toggle-slider" />
                  </label>
                </div>
                {notifEnabled && (
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginTop: '0.75rem' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label htmlFor="reminder-time">Reminder time</label>
                      <input
                        id="reminder-time"
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleSaveReminder}
                      style={{ marginBottom: 0 }}
                    >
                      Save
                    </button>
                  </div>
                )}
                {notifMsg && (
                  <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--success)' }}>
                    {notifMsg}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
