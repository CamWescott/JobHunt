import { useState } from 'react'
import { api } from '../services/api'

export default function LinkedInPage() {
  const [currentProfile, setCurrentProfile] = useState('')
  const [targetRole, setTargetRole] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleOptimize = async () => {
    if (!currentProfile.trim() || !targetRole.trim()) {
      setError('Please provide your current profile and target role')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await api.linkedinOptimize({
        current_profile: currentProfile,
        target_role: targetRole,
        job_description: jobDescription || null,
      })
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div>
      <div className="page-header">
        <h2>LinkedIn Optimizer</h2>
        <p>Get an optimized headline, about section, and experience bullets for your target role.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="two-col">
        <div>
          <div className="form-group">
            <label>Current LinkedIn Profile</label>
            <textarea
              className="form-input"
              value={currentProfile}
              onChange={(e) => setCurrentProfile(e.target.value)}
              placeholder="Paste your current LinkedIn headline, about, and experience sections..."
              style={{ minHeight: 200 }}
            />
          </div>
          <div className="form-group">
            <label>Target Role</label>
            <input
              className="form-input"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="e.g. Senior Software Engineer"
            />
          </div>
          <div className="form-group">
            <label>Job Description (optional)</label>
            <textarea
              className="form-input"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste a specific JD to align your profile even more closely..."
              style={{ minHeight: 120 }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleOptimize}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          >
            {loading ? <><span className="spinner" /> Optimizing...</> : 'Optimize My LinkedIn'}
          </button>
        </div>

        <div>
          {loading && (
            <div className="loading-overlay">
              <div className="spinner" />
              <div>Optimizing your LinkedIn profile...</div>
            </div>
          )}

          {result && (
            <>
              <div className="result-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>Headline</h3>
                  <button className="copy-btn" onClick={() => copyToClipboard(result.headline)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Copy
                  </button>
                </div>
                <div className="result-content" style={{ maxHeight: 'none' }}>{result.headline}</div>
              </div>

              <div className="result-section">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3>About Section</h3>
                  <button className="copy-btn" onClick={() => copyToClipboard(result.about)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                    Copy
                  </button>
                </div>
                <div className="result-content">{result.about}</div>
              </div>

              <div className="result-section">
                <h3>Experience Bullets</h3>
                <div className="result-content">
                  {result.experience_bullets.map((b, i) => (
                    <div key={i} style={{ marginBottom: 8 }}>{b}</div>
                  ))}
                </div>
              </div>

              <div className="result-section">
                <h3>Skills to Add</h3>
                <div className="tag-list">
                  {result.skills_to_add.map((s, i) => (
                    <span key={i} className="tag keyword">{s}</span>
                  ))}
                </div>
              </div>

              <div className="result-section">
                <h3>Keywords</h3>
                <div className="tag-list">
                  {result.keywords.map((k, i) => (
                    <span key={i} className="tag">{k}</span>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
