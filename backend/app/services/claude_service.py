import json
import anthropic

from app.config import get_settings


def get_client() -> anthropic.Anthropic:
    settings = get_settings()
    return anthropic.Anthropic(api_key=settings.anthropic_api_key)


def tailor_resume(resume_text: str, job_description: str) -> dict:
    """Use Claude to tailor a resume to a specific job description."""
    client = get_client()

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": f"""You are an expert resume writer and career coach with 20 years of experience.

Given this resume and job description, return a JSON object with these exact keys:
- "tailored_resume": the full resume rewritten to match the job. Preserve all true experience but reframe language, reorder bullets, and emphasize relevant skills. Use strong action verbs and quantify achievements where possible.
- "cover_letter": a compelling, specific cover letter (not generic). Reference the company and role by name. Keep it under 400 words.
- "match_score": integer 0-100 score of how well the ORIGINAL resume matched before tailoring
- "gaps": list of strings — skills or experience in the JD the candidate is missing
- "keywords_added": list of strings — keywords inserted into the tailored resume from the JD
- "suggestions": list of 3-5 specific things the candidate could do to strengthen their application

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON. No markdown, no preamble, no explanation.""",
            }
        ],
    )

    text = response.content[0].text
    # Handle potential markdown code blocks in response
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]
    return json.loads(text)


def generate_interview_prep(resume_text: str, job_description: str) -> dict:
    """Generate interview prep questions based on resume and JD."""
    client = get_client()

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": f"""You are an expert interview coach.

Given this resume and job description, return a JSON object with:
- "behavioral_questions": list of objects with "question" and "suggested_answer" keys (8-10 questions)
- "technical_questions": list of objects with "question" and "key_points" keys (5-8 questions)
- "questions_to_ask": list of 5 smart questions the candidate should ask the interviewer
- "company_research_tips": list of 3-5 specific things to research before the interview

RESUME:
{resume_text}

JOB DESCRIPTION:
{job_description}

Return ONLY valid JSON. No markdown, no preamble.""",
            }
        ],
    )

    text = response.content[0].text
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]
    return json.loads(text)


def optimize_linkedin(current_profile: str, target_role: str, job_description: str = "") -> dict:
    """Optimize LinkedIn profile sections."""
    client = get_client()

    jd_section = f"\nTARGET JOB DESCRIPTION:\n{job_description}" if job_description else ""

    response = client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=4096,
        messages=[
            {
                "role": "user",
                "content": f"""You are a LinkedIn optimization expert.

Given this profile and target role, return a JSON object with:
- "headline": an optimized LinkedIn headline (under 220 characters)
- "about": an optimized About section (under 2600 characters, compelling and keyword-rich)
- "experience_bullets": list of 5-8 rewritten experience bullets with strong metrics
- "skills_to_add": list of 10 skills to add to the profile
- "keywords": list of important keywords for this role to sprinkle throughout the profile

CURRENT PROFILE:
{current_profile}

TARGET ROLE: {target_role}
{jd_section}

Return ONLY valid JSON. No markdown, no preamble.""",
            }
        ],
    )

    text = response.content[0].text
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        text = text.rsplit("```", 1)[0]
    return json.loads(text)
