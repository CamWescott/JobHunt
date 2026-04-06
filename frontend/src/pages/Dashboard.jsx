import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../services/api'

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [subscription, setSubscription] = useState(null)
  const [recentHistory, setRecentHistory] = useState([])

  useEffect(() => {
    Promise.all([
      api.getApplicationStats().catch(() => null),
      api.getSubscriptionStatus().catch(() => null),
      api.getTailorHistory().catch(() => []),
    ]).then(([s, sub, history]) => {
      setStats(s)
      setSubscription(sub)
      setRecentHistory(Array.isArray(history) ? history.slice(0, 5) : [])
    })
  }, [])

  return (
    <div>
      <div className="page-header">
        <h2>Dashboard</h2>
        <p>Welcome to CareerPilot. Your AI-powered job application command center.</p>
      </div>

      {/* Quick Actions */}
      <div className="card-grid" style={{ marginBottom: 32 }}>
        <Link to="/tailor" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
          </div>
          <h3>Tailor Resume</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Upload resume + paste JD to get started</p>
        </Link>
        <Link to="/applications" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
          </div>
          <h3>Track Applications</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Manage your application pipeline</p>
        </Link>
        <Link to="/interview-prep" className="card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: 28, marginBottom: 8 }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          </div>
          <h3>Interview Prep</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Practice with AI-generated questions</p>
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <>
          <h3 style={{ marginBottom: 16 }}>Application Pipeline</h3>
          <div className="card-grid" style={{ marginBottom: 32 }}>
            <div className="stat-card">
              <div className="stat-label">Total</div>
              <div className="stat-value">{stats.total}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Applied</div>
              <div className="stat-value" style={{ color: 'var(--primary-light)' }}>{stats.applied}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Interviews</div>
              <div className="stat-value" style={{ color: '#38bdf8' }}>{stats.interview + stats.phone_screen}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Offers</div>
              <div className="stat-value" style={{ color: 'var(--success)' }}>{stats.offer}</div>
            </div>
          </div>
        </>
      )}

      {/* Usage */}
      {subscription && !subscription.is_active && (
        <div className="card" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3>Free Tier</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>
                {subscription.usage_count} / {subscription.usage_limit} tailors used this month
              </p>
            </div>
            <Link to="/pricing" className="btn btn-primary btn-sm">Upgrade to Pro</Link>
          </div>
          <div style={{ marginTop: 12, height: 6, background: 'var(--bg-input)', borderRadius: 3 }}>
            <div style={{
              height: '100%', borderRadius: 3,
              width: `${(subscription.usage_count / subscription.usage_limit) * 100}%`,
              background: subscription.usage_count >= subscription.usage_limit ? 'var(--danger)' : 'var(--primary)',
            }} />
          </div>
        </div>
      )}

      {subscription?.is_active && (
        <div className="card" style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h3 style={{ color: 'var(--success)' }}>Pro Plan Active</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Unlimited tailoring, cover letters, and more</p>
            </div>
            <span className="status-badge applied">Active</span>
          </div>
        </div>
      )}

      {/* Recent Activity */}
      {recentHistory.length > 0 && (
        <>
          <h3 style={{ marginBottom: 16 }}>Recent Tailoring</h3>
          <div className="card">
            {recentHistory.map((item) => (
              <div key={item.id} style={{ padding: '12px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span className={`match-score ${item.result.match_score >= 70 ? 'high' : item.result.match_score >= 40 ? 'medium' : 'low'}`} style={{ fontSize: 14, padding: '4px 10px' }}>
                    {item.result.match_score}%
                  </span>
                  <span style={{ marginLeft: 12, fontSize: 14 }}>
                    {item.result.keywords_added?.slice(0, 3).join(', ')}
                  </span>
                </div>
                <span style={{ color: 'var(--text-dim)', fontSize: 13 }}>
                  {new Date(item.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
