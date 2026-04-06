from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime
from enum import Enum


# --- Resume ---
class ResumeResponse(BaseModel):
    id: str
    user_id: str
    filename: str
    raw_text: str
    created_at: str


# --- Tailor ---
class TailorRequest(BaseModel):
    resume_text: str
    job_description: str
    resume_id: Optional[str] = None


class TailorResult(BaseModel):
    tailored_resume: str
    cover_letter: str
    match_score: int = Field(ge=0, le=100)
    gaps: list[str]
    keywords_added: list[str]
    suggestions: list[str]


class TailorResponse(BaseModel):
    id: str
    result: TailorResult
    created_at: str


# --- Applications ---
class ApplicationStatus(str, Enum):
    SAVED = "saved"
    APPLIED = "applied"
    PHONE_SCREEN = "phone_screen"
    INTERVIEW = "interview"
    OFFER = "offer"
    REJECTED = "rejected"
    WITHDRAWN = "withdrawn"


class ApplicationCreate(BaseModel):
    company: str
    position: str
    job_url: Optional[str] = None
    job_description: Optional[str] = None
    status: ApplicationStatus = ApplicationStatus.SAVED
    notes: Optional[str] = None
    tailor_id: Optional[str] = None


class ApplicationUpdate(BaseModel):
    company: Optional[str] = None
    position: Optional[str] = None
    job_url: Optional[str] = None
    status: Optional[ApplicationStatus] = None
    notes: Optional[str] = None


class ApplicationResponse(BaseModel):
    id: str
    user_id: str
    company: str
    position: str
    job_url: Optional[str]
    job_description: Optional[str]
    status: ApplicationStatus
    notes: Optional[str]
    tailor_id: Optional[str]
    created_at: str
    updated_at: str


# --- Payments ---
class CreateCheckoutRequest(BaseModel):
    price_id: str


class SubscriptionStatus(BaseModel):
    is_active: bool
    plan: Optional[str] = None
    current_period_end: Optional[str] = None
    usage_count: int = 0
    usage_limit: int = 3  # free tier limit


# --- Interview Prep ---
class InterviewPrepRequest(BaseModel):
    resume_text: str
    job_description: str


class InterviewPrepResponse(BaseModel):
    behavioral_questions: list[dict]
    technical_questions: list[dict]
    questions_to_ask: list[str]
    company_research_tips: list[str]


# --- LinkedIn ---
class LinkedInOptimizeRequest(BaseModel):
    current_profile: str
    target_role: str
    job_description: Optional[str] = None


class LinkedInOptimizeResponse(BaseModel):
    headline: str
    about: str
    experience_bullets: list[str]
    skills_to_add: list[str]
    keywords: list[str]
