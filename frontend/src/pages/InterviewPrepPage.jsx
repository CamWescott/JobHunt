import { useState } from 'react'
import { api } from '../services/api'

function Accordion({ question, answer }) {
  const [open, setOpen] = useState(false)

  return (
    <div className="accordion-item">
      <button className="accordion-header" onClick={() => setOpen(!open)}>
        <span>{question}</span>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.15s' }}>
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {open && <div className="accordion-body">{answer}</div>}
    </div>
  )
}

export default function InterviewPrepPage() {
  const [resumeText, setResumeText] = useState('')
  const [jobDescription, setJobDescription] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError('Please provide both a resume and job description')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const res = await api.interviewPrep({
        resume_text: resumeText,
        job_description: jobDescription,
      })
      setResult(res)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h2>Interview Prep</h2>
        <p>Get custom interview questions and suggested answers based on the role and your experience.</p>
      </div>

      {error && <div className="error-message">{error}</div>}

      {!result && (
        <div style={{ maxWidth: 600 }}>
          <div className="form-group">
            <label>Your Resume</label>
            <textarea
              className="form-input"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste your resume text..."
              style={{ minHeight: 150 }}
            />
          </div>
          <div className="form-group">
            <label>Job Description</label>
            <textarea
              className="form-input"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description..."
              style={{ minHeight: 150 }}
            />
          </div>
          <button
            className="btn btn-primary"
            onClick={handleGenerate}
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '14px' }}
          >
            {loading ? <><span className="spinner" /> Generating Questions...</> : 'Generate Interview Prep'}
          </button>
        </div>
      )}

      {loading && (
        <div className="loading-overlay">
          <div className="spinner" />
          <div>Preparing your interview questions...</div>
        </div>
      )}

      {result && (
        <div>
          <button className="btn btn-secondary btn-sm" onClick={() => setResult(null)} style={{ marginBottom: 24 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
            New Prep
          </button>

          <h3 style={{ marginBottom: 12 }}>Behavioral Questions</h3>
          {result.behavioral_questions.map((q, i) => (
            <Accordion key={i} question={q.question} answer={q.suggested_answer} />
          ))}

          <h3 style={{ marginTop: 28, marginBottom: 12 }}>Technical Questions</h3>
          {result.technical_questions.map((q, i) => (
            <Accordion
              key={i}
              question={q.question}
              answer={Array.isArray(q.key_points) ? q.key_points.join('\n\n') : q.key_points}
            />
          ))}

          <h3 style={{ marginTop: 28, marginBottom: 12 }}>Questions to Ask the Interviewer</h3>
          <div className="card">
            <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-muted)' }}>
              {result.questions_to_ask.map((q, i) => (
                <li key={i} style={{ marginBottom: 8 }}>{q}</li>
              ))}
            </ul>
          </div>

          <h3 style={{ marginTop: 28, marginBottom: 12 }}>Research Tips</h3>
          <div className="card">
            <ul style={{ paddingLeft: 20, fontSize: 14, color: 'var(--text-muted)' }}>
              {result.company_research_tips.map((tip, i) => (
                <li key={i} style={{ marginBottom: 8 }}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
