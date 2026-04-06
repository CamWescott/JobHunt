import { useState, useRef } from 'react'
import { api } from '../services/api'

export default function TailorPage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [fileName, setFileName] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('resume')
  const [selectedTemplate, setSelectedTemplate] = useState('classic')
  const fileRef = useRef()

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setFileName(file.name)
    setError('')

    try {
      const res = await api.uploadResume(file)
      setResumeText(res.raw_text)
    } catch (err) {
      setError(err.message)
      setFileName('')
    }
  }

  const handleTailor = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both a resume and job description')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await api.tailorResume({
        resume_text: resumeText,
        job_description: jobDescription,
      })
      setResult(res.result)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleExportPdf = async (type) => {
    if (!result) return
    try {
      const text = type === 'resume' ? result.tailored_resume : result.cover_letter
      const res = type === 'resume'
        ? await api.exportResumePdf({ resume_text: text, job_description: '', template: selectedTemplate })
        : await api.exportCoverLetterPdf({ resume_text: '', job_description: text })

      // Decode base64 PDF data
      const byteString = atob(res.data)
      const bytes = new Uint8Array(byteString.length)
      for (let i = 0; i < byteString.length; i++) {
        bytes[i] = byteString.charCodeAt(i)
      }
      const blob = new Blob([bytes], { type: 'application/pdf' })

      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.filename
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError('Export failed: ' + err.message)
    }
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div>
      <div className="page-header">
        <h2>Resume Tailor</h2>
        <p>Upload your resume and paste a job description to get a tailored resume, cover letter, and match analysis.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="two-col">
        {/* Left: Inputs */}
        <div>
          {/* File Upload */}
          <div
            className={`file-upload ${fileName ? 'active' : ''}`}
            onClick={() => fileRef.current?.click()}
          >
            <input ref={fileRef} type="file" accept=".pdf,.docx,.txt" onChange={handleFileUpload} />
            <div className="upload-icon">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            </div>
            <p>{fileName ? '' : 'Click to upload resume (PDF, DOCX, TXT)'}</p>
            {fileName && <div className="filename">{fileName}</div>}
          </div>

          {/* Resume text area */}
          <div className="form-group" style={{ marginTop: 16 }}>
            <label>Resume Text {fileName && '(extracted from file)'}</label>
            <textarea
              className="form-input"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Or paste your resume text here..."
              style={{ minHeight: 200 }}
            />
          </div>

          {/* Job Description */}
          <div className="form-group">
            <label>Job Description</label>
            <textarea
              className="form-input"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the full job description here..."
              style={{ minHeight: 200 }}
            />
          </div>

          <button
            className="btn btn-primary"
            onClick={handleTailor}
            disabled={loading || !resumeText.trim() || !jobDescription.trim()}
            style={{ width: '100%', justifyContent: 'center', padding: '14px 20px' }}
          >
            {loading ? (
              <>
                <span className="spinner" />
                Analyzing with AI...
              </>
            ) : (
              'Tailor My Resume'
            )}
          </button>
        </div>

        {/* Right: Results */}
        <div>
          {loading && (
            <div className="loading-overlay">
              <div className="spinner" />
              <div>Claude is analyzing your resume...</div>
              <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>This usually takes 10-20 seconds</div>
            </div>
          )}

          {result && (
            <>
              {/* Match Score */}
              <div className="card" style={{ marginBottom: 16, textAlign: 'center' }}>
                <div className="stat-label">Match Score</div>
                <div
                  className={`match-score ${result.match_score >= 70 ? 'high' : result.match_score >= 40 ? 'medium' : 'low'}`}
                  style={{ fontSize: 36, marginTop: 8 }}
                >
                  {result.match_score}%
                </div>
              </div>

              {/* Tabs */}
              <div className="tabs">
                <button className={`tab ${activeTab === 'resume' ? 'active' : ''}`} onClick={() => setActiveTab('resume')}>Tailored Resume</button>
                <button className={`tab ${activeTab === 'cover' ? 'active' : ''}`} onClick={() => setActiveTab('cover')}>Cover Letter</button>
                <button className={`tab ${activeTab === 'analysis' ? 'active' : ''}`} onClick={() => setActiveTab('analysis')}>Analysis</button>
              </div>

              {activeTab === 'resume' && (
                <div className="result-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3>Tailored Resume</h3>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                      <button className="copy-btn" onClick={() => copyToClipboard(result.tailored_resume)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        Copy
                      </button>
                    </div>
                  </div>
                  <div className="result-content">{result.tailored_resume}</div>

                  {/* Template Selector + Export */}
                  <div style={{ marginTop: 16, padding: 16, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)' }}>
                    <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Choose PDF Template</label>
                    <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                      {[
                        { id: 'classic', name: 'Classic', desc: 'Traditional, clean lines' },
                        { id: 'modern', name: 'Modern', desc: 'Bold accent colors' },
                        { id: 'minimal', name: 'Minimal', desc: 'Clean, lots of whitespace' },
                      ].map(tmpl => (
                        <button
                          key={tmpl.id}
                          onClick={() => setSelectedTemplate(tmpl.id)}
                          style={{
                            flex: 1,
                            padding: '12px 10px',
                            background: selectedTemplate === tmpl.id ? 'var(--primary)' : 'var(--bg-input)',
                            border: selectedTemplate === tmpl.id ? '2px solid var(--primary-light)' : '2px solid var(--border)',
                            borderRadius: 'var(--radius-sm)',
                            color: selectedTemplate === tmpl.id ? 'white' : 'var(--text)',
                            textAlign: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                          }}
                        >
                          <div style={{ fontWeight: 600, fontSize: 14 }}>{tmpl.name}</div>
                          <div style={{ fontSize: 11, opacity: 0.7, marginTop: 2 }}>{tmpl.desc}</div>
                        </button>
                      ))}
                    </div>
                    <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }} onClick={() => handleExportPdf('resume')}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                      Download Resume PDF
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'cover' && (
                <div className="result-section">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <h3>Cover Letter</h3>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button className="copy-btn" onClick={() => copyToClipboard(result.cover_letter)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
                        Copy
                      </button>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleExportPdf('cover')}>Export PDF</button>
                    </div>
                  </div>
                  <div className="result-content">{result.cover_letter}</div>
                </div>
              )}

              {activeTab === 'analysis' && (
                <div className="result-section">
                  <h3>Keywords Added</h3>
                  <div className="tag-list">
                    {result.keywords_added.map((kw, i) => (
                      <span key={i} className="tag keyword">{kw}</span>
                    ))}
                  </div>

                  <h3 style={{ marginTop: 24 }}>Skill Gaps</h3>
                  <div className="tag-list">
                    {result.gaps.map((gap, i) => (
                      <span key={i} className="tag gap">{gap}</span>
                    ))}
                  </div>

                  <h3 style={{ marginTop: 24 }}>Suggestions</h3>
                  <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-muted)' }}>
                    {result.suggestions.map((s, i) => (
                      <li key={i} style={{ marginBottom: 8 }}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
