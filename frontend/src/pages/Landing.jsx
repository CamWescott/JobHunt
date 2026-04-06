import { Link } from 'react-router-dom'

const features = [
  {
    title: 'AI Resume Tailoring',
    desc: 'Upload your resume and paste a job description. Get a perfectly tailored resume in seconds, optimized with the right keywords.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
    ),
  },
  {
    title: 'Cover Letter Generator',
    desc: 'Get a compelling, role-specific cover letter that references the company and position by name. Never write one from scratch again.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
    ),
  },
  {
    title: 'Match Score Analysis',
    desc: 'See exactly how well your resume matches any job posting. Get actionable gap analysis and suggestions to improve.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
    ),
  },
  {
    title: 'Application Tracker',
    desc: 'Track every application from saved to offer. See your pipeline at a glance with stats and status updates.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1"/></svg>
    ),
  },
  {
    title: 'Interview Prep',
    desc: 'Get custom behavioral and technical questions based on the specific job. Practice with AI-generated suggested answers.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    ),
  },
  {
    title: 'LinkedIn Optimizer',
    desc: 'Optimize your headline, about section, and experience bullets. Stand out to recruiters with keyword-rich profiles.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z"/><rect x="2" y="9" width="4" height="12"/><circle cx="4" cy="4" r="2"/></svg>
    ),
  },
]

export default function Landing() {
  return (
    <div className="landing">
      <nav className="landing-nav">
        <div className="logo">
          <div style={{
            width: 36, height: 36, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontWeight: 800, fontSize: 13,
          }}>CP</div>
          CareerPilot
        </div>
        <div className="nav-links">
          <Link to="/pricing" className="btn btn-secondary btn-sm">Pricing</Link>
          <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      <section className="landing-hero">
        <h1>Land Your Dream Job with AI-Powered Applications</h1>
        <p>
          Upload your resume, paste a job description, and get a perfectly tailored resume,
          cover letter, match score, and interview prep — all in seconds.
        </p>
        <div className="hero-cta">
          <Link to="/login" className="btn btn-primary">Start Free — 3 Tailors/Month</Link>
          <Link to="/pricing" className="btn btn-secondary">View Pricing</Link>
        </div>
      </section>

      <section className="landing-features">
        <h2>Everything You Need to Get Hired</h2>
        <div className="features-grid">
          {features.map((f) => (
            <div className="feature-card" key={f.title}>
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
