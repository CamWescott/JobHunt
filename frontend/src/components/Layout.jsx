import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const [devOpen, setDevOpen] = useState(false)
  const [currentPlan, setCurrentPlan] = useState(null)
  const [switching, setSwitching] = useState(false)

  const handleSignOut = () => {
    signOut()
    navigate('/')
  }

  const initial = user?.email?.charAt(0).toUpperCase() || '?'

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">CP</div>
          <h1>CareerPilot</h1>
        </div>
        <nav>
          <NavLink to="/dashboard" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
            Dashboard
          </NavLink>
          <NavLink to="/tailor" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
            Resume Tailor
          </NavLink>
          <NavLink to="/applications" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
            Applications
          </NavLink>
          <NavLink to="/interview-prep" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
            Interview Prep
          </NavLink>
          <NavLink to="/linkedin" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
            LinkedIn
          </NavLink>
          <NavLink to="/pricing" className={({ isActive }) => isActive ? 'active' : ''}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            Pricing
          </NavLink>
        </nav>
        <div className="sidebar-footer">
          {/* Dev Tools Toggle */}
          <div style={{ marginBottom: 10 }}>
            <button
              onClick={async () => {
                if (!devOpen && currentPlan === null) {
                  try {
                    const sub = await api.getSubscriptionStatus()
                    setCurrentPlan(sub.is_active ? sub.plan : 'free')
                  } catch { setCurrentPlan('free') }
                }
                setDevOpen(!devOpen)
              }}
              style={{
                width: '100%', padding: '6px 10px', fontSize: 12,
                background: devOpen ? 'var(--primary)' : 'var(--bg-input)',
                color: devOpen ? 'white' : 'var(--text-dim)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
                cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              Dev Tools
            </button>
            {devOpen && (
              <div style={{
                marginTop: 8, padding: 10, background: 'var(--bg)',
                border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              }}>
                <div style={{ fontSize: 11, color: 'var(--text-dim)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Switch Plan</div>
                {[
                  { id: 'free', label: 'Free' },
                  { id: 'pro', label: 'Job Search Pro' },
                  { id: '90day_blitz', label: '90-Day Blitz' },
                ].map(plan => (
                  <button
                    key={plan.id}
                    disabled={switching}
                    onClick={async () => {
                      setSwitching(true)
                      try {
                        await api.setPlan(plan.id)
                        setCurrentPlan(plan.id)
                        window.location.reload()
                      } catch (err) {
                        alert('Failed: ' + err.message)
                      } finally {
                        setSwitching(false)
                      }
                    }}
                    style={{
                      display: 'block', width: '100%', padding: '7px 10px', marginBottom: 4,
                      fontSize: 12, textAlign: 'left', cursor: switching ? 'wait' : 'pointer',
                      background: currentPlan === plan.id ? 'var(--primary)' : 'var(--bg-input)',
                      color: currentPlan === plan.id ? 'white' : 'var(--text)',
                      border: currentPlan === plan.id ? '1px solid var(--primary-light)' : '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {currentPlan === plan.id ? '● ' : '○ '}{plan.label}
                  </button>
                ))}
                <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 6 }}>
                  Page will reload after switching
                </div>
              </div>
            )}
          </div>

          <div className="user-info">
            <div className="user-avatar">{initial}</div>
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.email}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1, justifyContent: 'center' }} onClick={handleSignOut}>
              Sign Out
            </button>
            <button
              className="btn btn-sm"
              style={{ justifyContent: 'center', background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', fontSize: 11, padding: '4px 8px', cursor: 'pointer', borderRadius: 'var(--radius-sm)' }}
              onClick={async () => {
                if (!window.confirm('Are you sure you want to delete your account? This will permanently remove all your data including resumes, tailoring history, applications, and subscription. This cannot be undone.')) return
                if (!window.confirm('This is irreversible. Type OK in the next prompt to confirm.')) return
                try {
                  await api.deleteAccount()
                  await signOut()
                  navigate('/')
                } catch (err) {
                  alert('Failed to delete account: ' + err.message)
                }
              }}
            >
              Delete
            </button>
          </div>
          <div style={{ marginTop: 10, display: 'flex', justifyContent: 'center', gap: 12, fontSize: 11 }}>
            <a href="/privacy" style={{ color: 'var(--text-dim)' }}>Privacy</a>
            <a href="/terms" style={{ color: 'var(--text-dim)' }}>Terms</a>
          </div>
        </div>
      </aside>
      <main className="main-content">
        {children}
      </main>
    </div>
  )
}
