import { useState, useEffect } from 'react'
import { api } from '../services/api'

const STATUS_OPTIONS = [
  { value: 'saved', label: 'Saved' },
  { value: 'applied', label: 'Applied' },
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'interview', label: 'Interview' },
  { value: 'offer', label: 'Offer' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
]

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ company: '', position: '', job_url: '', status: 'saved', notes: '' })
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState(null)

  const load = async () => {
    try {
      const [apps, s] = await Promise.all([
        api.listApplications(),
        api.getApplicationStats(),
      ])
      setApplications(apps)
      setStats(s)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e) => {
    e.preventDefault()
    try {
      await api.createApplication(form)
      setShowModal(false)
      setForm({ company: '', position: '', job_url: '', status: 'saved', notes: '' })
      load()
    } catch {
      // ignore
    }
  }

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.updateApplication(id, { status: newStatus })
      load()
    } catch {
      // ignore
    }
  }

  const handleDelete = async (id) => {
    try {
      await api.deleteApplication(id)
      load()
    } catch {
      // ignore
    }
  }

  if (loading) return <div className="loading-overlay"><div className="spinner" /></div>

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>Applications</h2>
          <p>Track every job application from saved to offer.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Add Application
        </button>
      </div>

      {/* Stats Bar */}
      {stats && (
        <div className="card-grid" style={{ marginBottom: 24, gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
          {STATUS_OPTIONS.map(s => (
            <div className="stat-card" key={s.value} style={{ padding: 14, textAlign: 'center' }}>
              <div className="stat-value" style={{ fontSize: 24 }}>{stats[s.value] || 0}</div>
              <div className="stat-label" style={{ fontSize: 11 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      {applications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60, color: 'var(--text-muted)' }}>
          <p>No applications yet. Click "Add Application" to get started.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'auto' }}>
          <table className="app-table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Position</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>
                    <strong>{app.company}</strong>
                    {app.job_url && (
                      <a href={app.job_url} target="_blank" rel="noreferrer" style={{ marginLeft: 8, fontSize: 12 }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                      </a>
                    )}
                  </td>
                  <td>{app.position}</td>
                  <td>
                    <select
                      className="status-badge"
                      value={app.status}
                      onChange={(e) => handleStatusChange(app.id, e.target.value)}
                      style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', color: 'var(--text)', padding: '6px 8px', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s.value} value={s.value}>{s.label}</option>
                      ))}
                    </select>
                  </td>
                  <td style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(app.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add Application</h3>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Company *</label>
                <input className="form-input" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Position *</label>
                <input className="form-input" value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Job URL</label>
                <input className="form-input" value={form.job_url} onChange={(e) => setForm({ ...form, job_url: e.target.value })} placeholder="https://..." />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select className="form-input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                  {STATUS_OPTIONS.map(s => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea className="form-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} style={{ minHeight: 80 }} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Application</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
