import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../services/api'

export default function PricingPage() {
  const { user } = useAuth()

  const handleCheckout = async (priceId, mode) => {
    if (!user) {
      window.location.href = '/login'
      return
    }
    try {
      const res = await api.createCheckout({ price_id: priceId, mode })
      window.location.href = res.checkout_url
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="pricing-page">
      {!user && (
        <nav style={{ position: 'absolute', top: 20, left: 40, right: 40, display: 'flex', justifyContent: 'space-between' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
            <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 11 }}>CP</div>
            CareerPilot
          </Link>
          <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
        </nav>
      )}

      <h1>Simple, Fair Pricing</h1>
      <p>Start free. Upgrade when you're ready to go all in on your job search.</p>

      <div className="pricing-grid">
        <div className="pricing-card">
          <h3>Free</h3>
          <div className="price">$0</div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Get a taste of the platform</p>
          <ul>
            <li>3 resume tailors per month</li>
            <li>Cover letter generation</li>
            <li>Match score analysis</li>
            <li>PDF export</li>
          </ul>
          <Link to={user ? '/dashboard' : '/login'} className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }}>
            {user ? 'Go to Dashboard' : 'Get Started Free'}
          </Link>
        </div>

        <div className="pricing-card featured">
          <h3>Job Search Pro</h3>
          <div className="price">$29<span>/mo</span></div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>Everything you need, cancel anytime</p>
          <ul>
            <li>Unlimited resume tailoring</li>
            <li>Unlimited cover letters</li>
            <li>Interview prep questions</li>
            <li>LinkedIn profile optimizer</li>
            <li>Application tracker</li>
            <li>Suggested bullet points</li>
            <li>All PDF templates</li>
          </ul>
          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => handleCheckout('price_monthly', 'subscription')}>
            Start Pro — $29/mo
          </button>
        </div>

        <div className="pricing-card">
          <h3>90-Day Blitz</h3>
          <div className="price">$49<span> once</span></div>
          <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>90 days of full access — no recurring charge</p>
          <ul>
            <li>Everything in Pro</li>
            <li>90 days unlimited access</li>
            <li>One-time payment</li>
            <li>Perfect for active job searches</li>
          </ul>
          <button className="btn btn-secondary" style={{ width: '100%', justifyContent: 'center', marginTop: 8 }} onClick={() => handleCheckout('price_90day', 'payment')}>
            Get 90-Day Access — $49
          </button>
        </div>
      </div>
    </div>
  )
}
