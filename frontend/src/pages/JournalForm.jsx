import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import api from '../api/axios'

export default function JournalForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEdit)
  const [serverError, setServerError] = useState('')
  const [deleteConfirm, setDeleteConfirm] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm()

  useEffect(() => {
    if (!isEdit) return
    api
      .get(`/journal/${id}/`)
      .then((res) => {
        reset({ title: res.data.title, body: res.data.body })
      })
      .catch(() => {
        setServerError('Could not load this entry.')
      })
      .finally(() => setFetching(false))
  }, [id, isEdit, reset])

  const onSubmit = async (data) => {
    setServerError('')
    setLoading(true)
    try {
      if (isEdit) {
        await api.patch(`/journal/${id}/`, data)
      } else {
        await api.post('/journal/', data)
      }
      navigate('/journal')
    } catch (err) {
      const errData = err.response?.data
      const msg = errData
        ? Object.values(errData).flat()[0]
        : 'Failed to save entry. Please try again.'
      setServerError(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) {
      setDeleteConfirm(true)
      return
    }
    setLoading(true)
    try {
      await api.delete(`/journal/${id}/`)
      navigate('/journal')
    } catch {
      setServerError('Failed to delete entry.')
      setLoading(false)
    }
  }

  if (fetching) return <div className="loading">Loading entry...</div>

  return (
    <div>
      <div className="page-header">
        <h1>{isEdit ? 'Edit Entry' : 'New Journal Entry'}</h1>
        <p>{isEdit ? 'Update your thoughts.' : 'Write freely — this is your space.'}</p>
      </div>

      {serverError && <div className="alert alert-error">{serverError}</div>}

      <div className="card" style={{ maxWidth: 700 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              type="text"
              placeholder="Give this entry a title"
              {...register('title', { required: 'Title is required' })}
            />
            {errors.title && <span className="form-error">{errors.title.message}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="body">Entry</label>
            <textarea
              id="body"
              placeholder="Write your thoughts here..."
              style={{ minHeight: 280 }}
              {...register('body', { required: 'Entry body is required' })}
            />
            {errors.body && <span className="form-error">{errors.body.message}</span>}
          </div>

          <div className="btn-group">
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Save Entry'}
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/journal')}
              disabled={loading}
            >
              Cancel
            </button>
            {isEdit && (
              <button
                type="button"
                className={`btn ${deleteConfirm ? 'btn-danger' : 'btn-secondary'}`}
                onClick={handleDelete}
                disabled={loading}
              >
                {deleteConfirm ? 'Confirm Delete' : 'Delete'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
