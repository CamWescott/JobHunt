import { Link } from 'react-router-dom'

export default function TermsPage() {
  return (
    <div className="legal-page">
      <nav style={{ position: 'absolute', top: 20, left: 40, right: 40, display: 'flex', justifyContent: 'space-between' }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 11 }}>CP</div>
          CareerPilot
        </Link>
        <Link to="/login" className="btn btn-primary btn-sm">Sign In</Link>
      </nav>

      <div className="legal-content">
        <h1>Terms of Service</h1>
        <p className="legal-updated">Last updated: April 9, 2026</p>

        <p>
          Welcome to CareerPilot. By creating an account or using our services, you agree to these
          Terms of Service ("Terms"). Please read them carefully.
        </p>

        <h2>1. Service Description</h2>
        <p>
          CareerPilot is an AI-powered job application tool that helps you tailor resumes, generate cover
          letters, prepare for interviews, optimize LinkedIn profiles, and track job applications. The
          service uses artificial intelligence (Anthropic's Claude) to generate content based on your inputs.
        </p>

        <h2>2. Account Registration</h2>
        <ul>
          <li>You must provide a valid email address to create an account.</li>
          <li>You are responsible for maintaining the security of your account credentials.</li>
          <li>You must be at least 16 years old to use the service.</li>
          <li>One account per person. Sharing accounts is not permitted.</li>
        </ul>

        <h2>3. Free and Paid Plans</h2>
        <ul>
          <li><strong>Free plan:</strong> Includes 2 resume tailoring sessions per month with core features.</li>
          <li><strong>Job Search Pro ($29/month):</strong> Unlimited access to all features. Billed monthly, cancel anytime.</li>
          <li><strong>90-Day Blitz ($49 one-time):</strong> Full access for 90 days from purchase date. No recurring charges. Access expires automatically after 90 days.</li>
        </ul>

        <h2>4. Payments and Refunds</h2>
        <ul>
          <li>Payments are processed securely through Stripe.</li>
          <li><strong>Monthly subscriptions:</strong> You may cancel at any time. Access continues until the end of your current billing period. No partial refunds for unused time.</li>
          <li><strong>90-Day Blitz:</strong> This is a one-time, non-recurring payment. Refund requests within the first 7 days will be considered on a case-by-case basis if the service has not been used.</li>
          <li>Prices may change with 30 days notice. Existing subscribers will be grandfathered at their current rate for at least one billing cycle.</li>
        </ul>

        <h2>5. AI-Generated Content</h2>
        <ul>
          <li>All AI-generated content (tailored resumes, cover letters, interview questions, suggestions) is provided as a starting point. <strong>You are responsible for reviewing and editing all output before using it.</strong></li>
          <li>We do not guarantee that AI-generated content is accurate, complete, error-free, or suitable for any specific purpose.</li>
          <li>We do not guarantee that using CareerPilot will result in job interviews or employment.</li>
          <li>AI outputs may occasionally contain errors, hallucinations, or inappropriate content. Always verify facts, dates, and claims before submitting materials to employers.</li>
        </ul>

        <h2>6. Your Content and Data</h2>
        <ul>
          <li>You retain ownership of all content you upload (resumes, job descriptions, application notes).</li>
          <li>You grant us a limited license to process your content solely for the purpose of providing the service.</li>
          <li>Your content is sent to Anthropic's Claude API for AI processing. This is essential to how the service works.</li>
          <li>You may delete your account and all associated data at any time.</li>
          <li>See our <Link to="/privacy">Privacy Policy</Link> for full details on data handling.</li>
        </ul>

        <h2>7. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the service to generate fraudulent, misleading, or deceptive application materials</li>
          <li>Misrepresent qualifications, experience, or credentials in generated content</li>
          <li>Attempt to circumvent usage limits or access controls</li>
          <li>Use automated tools (bots, scrapers) to access the service</li>
          <li>Resell, redistribute, or white-label the service without permission</li>
          <li>Upload content that contains malware, illegal material, or content that violates others' rights</li>
        </ul>

        <h2>8. Service Availability</h2>
        <ul>
          <li>We aim to keep the service available 24/7 but do not guarantee uninterrupted access.</li>
          <li>The service depends on third-party providers (Firebase, Anthropic, Stripe, Render). Outages in these services may affect CareerPilot.</li>
          <li>We reserve the right to modify, suspend, or discontinue the service with reasonable notice.</li>
        </ul>

        <h2>9. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, CareerPilot and its operators shall not be liable for
          any indirect, incidental, special, consequential, or punitive damages, including but not limited
          to loss of employment opportunities, arising from your use of the service.
        </p>
        <p>
          Our total liability for any claim related to the service is limited to the amount you have
          paid us in the 12 months preceding the claim, or $50, whichever is greater.
        </p>

        <h2>10. Account Termination</h2>
        <ul>
          <li>You may delete your account at any time through the app.</li>
          <li>We may suspend or terminate accounts that violate these Terms.</li>
          <li>Upon termination, your data will be deleted in accordance with our <Link to="/privacy">Privacy Policy</Link>.</li>
        </ul>

        <h2>11. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. We will notify you of material changes via email
          or an in-app notice. Continued use of the service after changes take effect constitutes
          acceptance of the updated Terms.
        </p>

        <h2>12. Contact</h2>
        <p>
          If you have questions about these Terms, contact us at:
        </p>
        <p><strong>Email:</strong> support@careerpilot.app</p>

        <div className="legal-footer">
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/">Back to Home</Link>
        </div>
      </div>
    </div>
  )
}
