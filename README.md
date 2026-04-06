# CareerPilot — AI Job Application Suite

One tool that handles the entire job application process: resume tailoring, cover letter generation, LinkedIn optimization, interview prep, and application tracking.

## Features

- **AI Resume Tailoring** — Upload your resume + paste a job description. Get a perfectly tailored resume with the right keywords, in seconds.
- **Cover Letter Generation** — Role-specific cover letters that reference the company and position by name.
- **Match Score Analysis** — See how well your resume matches any job posting, with gap analysis and suggestions.
- **Application Tracker** — Track every application from saved to offer with a visual pipeline.
- **Interview Prep** — Custom behavioral and technical questions with suggested answers, based on the specific role.
- **LinkedIn Optimizer** — Optimized headline, about section, experience bullets, and keyword suggestions.
- **PDF Export** — Download tailored resumes and cover letters as clean PDFs.

## Tech Stack

| Layer     | Tool                | Why                              |
|-----------|---------------------|----------------------------------|
| Backend   | Python + FastAPI    | API routes for each feature      |
| AI        | Anthropic Claude API| Core of all AI features          |
| Database  | Firebase Firestore  | NoSQL document store             |
| Frontend  | React + Vite        | Clean dashboard experience       |
| Auth      | Firebase Auth       | Email/Google login               |
| Payments  | Stripe              | $19/mo or $149 lifetime          |

## Getting Started

### 1. Clone and install

```bash
git clone <repo-url>
cd JobHunt

# Backend
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 2. Set up Firebase

1. Create a project at [Firebase Console](https://console.firebase.google.com)
2. Enable **Authentication** → Sign-in methods → Email/Password and Google
3. Create a **Firestore Database** (start in production mode)
4. Generate a service account key: Project Settings → Service Accounts → Generate New Private Key
5. Save the JSON file as `backend/firebase-service-account.json`
6. Deploy security rules: copy `firestore.rules` into the Firebase Console → Firestore → Rules
7. Deploy indexes: `firebase deploy --only firestore:indexes` (or create them manually when prompted by Firestore)

### 3. Set up environment variables

```bash
# Backend
cp backend/.env.example backend/.env
# Fill in: ANTHROPIC_API_KEY, STRIPE keys

# Frontend
cp frontend/.env.example frontend/.env.local
# Fill in your Firebase web app config values (from Firebase Console → Project Settings → Web App)
```

You'll need:
- **Anthropic API key** from [console.anthropic.com](https://console.anthropic.com)
- **Firebase project** config (API key, auth domain, project ID, etc.)
- **Firebase service account JSON** for the backend
- **Stripe account** from [stripe.com](https://stripe.com) (secret key, webhook secret, price IDs)

### 4. Run the app

```bash
# Terminal 1: Backend
cd backend
uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend
npm run dev
```

Visit `http://localhost:5173`

## Project Structure

```
backend/
  app/
    main.py              # FastAPI app + CORS
    config.py            # Environment settings
    routers/
      auth.py            # Token verification endpoint
      resume.py          # Upload/parse resumes
      tailor.py          # AI tailoring, interview prep, LinkedIn
      applications.py    # Application tracker CRUD
      payments.py        # Stripe checkout + webhooks
    services/
      claude_service.py  # Anthropic API integration
      firebase_client.py # Firestore client
      pdf_export.py      # PDF generation
    utils/
      auth.py            # Firebase ID token verification
      resume_parser.py   # PDF/DOCX text extraction
    models/
      schemas.py         # Pydantic models

frontend/
  src/
    App.jsx              # Routes
    pages/
      Landing.jsx        # Marketing landing page
      Login.jsx          # Auth (email/password + Google)
      Dashboard.jsx      # Overview + stats
      TailorPage.jsx     # Resume tailoring UI
      ApplicationsPage.jsx # Application tracker
      InterviewPrepPage.jsx # Interview questions
      LinkedInPage.jsx   # LinkedIn optimizer
      PricingPage.jsx    # Pricing plans
    components/
      Layout.jsx         # Sidebar + main layout
    hooks/
      useAuth.jsx        # Firebase auth context
    services/
      api.js             # API client
      firebase.js        # Firebase initialization
    styles/
      index.css          # Full stylesheet

firestore.rules          # Firestore security rules
firestore.indexes.json   # Composite index definitions
```

## Firestore Collections

| Collection       | Doc ID     | Key Fields                                              |
|-----------------|------------|--------------------------------------------------------|
| `resumes`       | UUID       | user_id, filename, raw_text, created_at                |
| `tailor_results`| UUID       | user_id, resume_text, job_description, result, created_at |
| `applications`  | UUID       | user_id, company, position, status, created_at, updated_at |
| `subscriptions` | user_id    | stripe_subscription_id, status, plan, current_period_end |

## Monetization

| Tier     | Price   | What They Get                          |
|----------|---------|----------------------------------------|
| Free     | $0      | 3 tailors/month                        |
| Pro      | $19/mo  | Unlimited everything                   |
| Lifetime | $149    | Everything, forever                    |
