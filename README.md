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
| Database  | Supabase (Postgres) | Users, resumes, applications     |
| Frontend  | React + Vite        | Clean dashboard experience       |
| Auth      | Supabase Auth       | Email/Google login               |
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

### 2. Set up environment variables

```bash
cp backend/.env.example backend/.env
# Fill in your API keys
```

You'll need:
- **Anthropic API key** from [console.anthropic.com](https://console.anthropic.com)
- **Supabase project** from [supabase.com](https://supabase.com) (URL, anon key, service role key, JWT secret)
- **Stripe account** from [stripe.com](https://stripe.com) (secret key, webhook secret, price IDs)

### 3. Set up the database

Run `supabase_schema.sql` in your Supabase SQL Editor to create all tables and RLS policies.

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
      auth.py            # Signup/signin
      resume.py          # Upload/parse resumes
      tailor.py          # AI tailoring, interview prep, LinkedIn
      applications.py    # Application tracker CRUD
      payments.py        # Stripe checkout + webhooks
    services/
      claude_service.py  # Anthropic API integration
      pdf_export.py      # PDF generation
      supabase_client.py # Database client
    utils/
      auth.py            # JWT verification
      resume_parser.py   # PDF/DOCX text extraction
    models/
      schemas.py         # Pydantic models

frontend/
  src/
    App.jsx              # Routes
    pages/
      Landing.jsx        # Marketing landing page
      Login.jsx          # Auth (sign in/up)
      Dashboard.jsx      # Overview + stats
      TailorPage.jsx     # Resume tailoring UI
      ApplicationsPage.jsx # Application tracker
      InterviewPrepPage.jsx # Interview questions
      LinkedInPage.jsx   # LinkedIn optimizer
      PricingPage.jsx    # Pricing plans
    components/
      Layout.jsx         # Sidebar + main layout
    hooks/
      useAuth.jsx        # Auth context
    services/
      api.js             # API client
    styles/
      index.css          # Full stylesheet
```

## Monetization

| Tier     | Price   | What They Get                          |
|----------|---------|----------------------------------------|
| Free     | $0      | 3 tailors/month                        |
| Pro      | $19/mo  | Unlimited everything                   |
| Lifetime | $149    | Everything, forever                    |
