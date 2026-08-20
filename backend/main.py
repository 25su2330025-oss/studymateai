import json
import os
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from openai import APIError, AsyncOpenAI, AuthenticationError, RateLimitError
from pydantic import BaseModel, Field


# ============================================================
# ENVIRONMENT
# ============================================================

PROJECT_ROOT = Path(__file__).resolve().parent.parent

load_dotenv(PROJECT_ROOT / ".env.local")
load_dotenv(PROJECT_ROOT / ".env")


# ============================================================
# MODELS
# ============================================================

class TutorMessage(BaseModel):
    role: Literal["student", "tutor"]
    message: str = Field(min_length=1, max_length=8000)


class TutorRequest(BaseModel):
    message: str = Field(min_length=1, max_length=8000)
    history: list[TutorMessage] = Field(default_factory=list, max_length=20)


class TutorResponse(BaseModel):
    reply: str


class QuizRequest(BaseModel):
    subject: str = Field(min_length=1, max_length=120)
    topic: str = Field(min_length=1, max_length=200)
    difficulty: Literal["easy", "medium", "hard"] = "medium"
    number_of_questions: int = Field(default=5, ge=1, le=20)


class QuizQuestion(BaseModel):
    question: str
    options: list[str] = Field(min_length=4, max_length=4)
    correct_answer: Literal["A", "B", "C", "D"]
    explanation: str
    topic: str
    difficulty: Literal["easy", "medium", "hard"]


class QuizResponse(BaseModel):
    questions: list[QuizQuestion]


class StudyPlanRequest(BaseModel):
    subjects: list[str] = Field(min_length=1, max_length=20)
    available_minutes: int = Field(default=60, ge=15, le=720)
    weak_topics: list[str] = Field(default_factory=list, max_length=20)
    exam_date: str | None = None


class StudyPlanItem(BaseModel):
    date: str
    subject: str
    topic: str
    duration: int = Field(gt=0)
    priority: Literal["low", "medium", "high"]
    reason: str


class StudyPlanResponse(BaseModel):
    plan: list[StudyPlanItem]


# ============================================================
# FASTAPI
# ============================================================

app = FastAPI(
    title="StudyMate AI API",
    version="0.1.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000")
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# GEMINI CONFIGURATION
# ============================================================

GEMINI_BASE_URL = (
    "https://generativelanguage.googleapis.com/v1beta/openai/"
)


def get_client() -> AsyncOpenAI:
    api_key = os.getenv("GEMINI_API_KEY")

    if not api_key:
        raise HTTPException(
            status_code=503,
            detail="Gemini AI service is not configured."
        )

    return AsyncOpenAI(
        api_key=api_key,
        base_url=GEMINI_BASE_URL,
    )


def get_model() -> str:
    return os.getenv(
        "GEMINI_MODEL",
        "gemini-3.6-flash"
    )


# ============================================================
# COMMON ERROR HANDLER
# ============================================================

def handle_ai_error(error: Exception):
    message = str(error).lower()

    if (
        isinstance(error, AuthenticationError)
        or "401" in message
        or "authentication" in message
        or "api key" in message
        or "invalid api key" in message
    ):
        raise HTTPException(
            status_code=503,
            detail="The Gemini API key is invalid or unavailable."
        ) from error

    if (
        isinstance(error, RateLimitError)
        or "429" in message
        or "quota" in message
        or "rate limit" in message
    ):
        raise HTTPException(
            status_code=503,
            detail="The Gemini API quota or rate limit has been reached."
        ) from error

    raise HTTPException(
        status_code=502,
        detail="The Gemini AI service is temporarily unavailable."
    ) from error


# ============================================================
# JSON COMPLETION
# ============================================================

async def complete_json(
    system: str,
    prompt: str
) -> dict:

    client = get_client()

    try:
        response = await client.chat.completions.create(
            model=get_model(),
            temperature=0.3,
            response_format={
                "type": "json_object"
            },
            messages=[
                {
                    "role": "system",
                    "content": system
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
        )

    except (
        AuthenticationError,
        RateLimitError,
        APIError
    ) as error:
        handle_ai_error(error)

    content = response.choices[0].message.content

    if not content:
        raise HTTPException(
            status_code=502,
            detail="The AI returned an empty response."
        )

    content = content.strip()

    if content.startswith("```json"):
        content = content[7:]

    elif content.startswith("```"):
        content = content[3:]

    if content.endswith("```"):
        content = content[:-3]

    content = content.strip()

    try:
        return json.loads(content)

    except json.JSONDecodeError as error:
        raise HTTPException(
            status_code=502,
            detail="The AI returned invalid JSON."
        ) from error


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
async def health() -> dict[str, str]:
    return {
        "status": "ok",
        "ai": "gemini",
        "model": get_model(),
    }


# ============================================================
# AI TUTOR
# ============================================================

@app.post(
    "/ai/tutor",
    response_model=TutorResponse
)
async def tutor(
    request: TutorRequest
) -> TutorResponse:

    client = get_client()

    system_prompt = """
You are StudyMate, a concise, patient, and intelligent AI study tutor.

Your job is to help students understand difficult concepts.

Rules:
- Explain concepts clearly and simply.
- Use examples whenever useful.
- Break difficult topics into smaller parts.
- Encourage active recall.
- Ask short follow-up questions when appropriate.
- Do not overwhelm the student.
- If the student asks for an exam answer, structure it appropriately.
- Be supportive and encouraging.
"""

    messages = [
        {
            "role": "system",
            "content": system_prompt
        }
    ]

    for item in request.history:

        messages.append(
            {
                "role": (
                    "user"
                    if item.role == "student"
                    else "assistant"
                ),
                "content": item.message,
            }
        )

    messages.append(
        {
            "role": "user",
            "content": request.message,
        }
    )

    try:

        response = await client.chat.completions.create(
            model=get_model(),
            temperature=0.4,
            messages=messages,
        )

    except (
        AuthenticationError,
        RateLimitError,
        APIError
    ) as error:

        handle_ai_error(error)

    reply = response.choices[0].message.content

    if not reply:
        raise HTTPException(
            status_code=502,
            detail="The AI returned an empty response."
        )

    return TutorResponse(
        reply=reply
    )


# ============================================================
# AI QUIZ
# ============================================================

@app.post(
    "/ai/quiz",
    response_model=QuizResponse
)
async def quiz(
    request: QuizRequest
) -> QuizResponse:

    system_prompt = """
You are StudyMate AI, an educational quiz generator.

Return ONLY valid JSON.

The JSON must have this structure:

{
  "questions": [
    {
      "question": "Question text",
      "options": [
        "Option A",
        "Option B",
        "Option C",
        "Option D"
      ],
      "correct_answer": "A",
      "explanation": "Explanation",
      "topic": "Topic",
      "difficulty": "medium"
    }
  ]
}

Rules:
- Exactly four options per question.
- correct_answer must be A, B, C, or D.
- difficulty must be easy, medium, or hard.
- Questions must be educational and accurate.
- Do not include markdown.
"""

    prompt = f"""
Create {request.number_of_questions} multiple-choice questions.

Subject: {request.subject}

Topic: {request.topic}

Difficulty: {request.difficulty}

Return exactly {request.number_of_questions} questions.
"""

    data = await complete_json(
        system_prompt,
        prompt
    )

    try:
        return QuizResponse.model_validate(data)

    except ValueError as error:

        raise HTTPException(
            status_code=502,
            detail="The AI returned an invalid quiz format."
        ) from error


# ============================================================
# AI STUDY PLAN
# ============================================================

@app.post(
    "/ai/study-plan",
    response_model=StudyPlanResponse
)
async def study_plan(
    request: StudyPlanRequest
) -> StudyPlanResponse:

    system_prompt = """
You are StudyMate AI, an intelligent study planning assistant.

Create realistic and useful study plans for students.

Return ONLY valid JSON.

The JSON must have exactly this structure:

{
  "plan": [
    {
      "date": "YYYY-MM-DD",
      "subject": "Subject",
      "topic": "Topic",
      "duration": 60,
      "priority": "high",
      "reason": "Reason"
    }
  ]
}

Rules:
- duration must be an integer representing minutes.
- priority must be low, medium, or high.
- Give extra priority to weak topics.
- Make the plan realistic.
- Do not schedule impossible workloads.
- Return only JSON.
"""

    prompt = f"""
Create a practical study plan.

Subjects:
{request.subjects}

Available study time per day:
{request.available_minutes} minutes

Weak topics:
{request.weak_topics}

Exam date:
{request.exam_date or "Not provided"}

Create a balanced plan that focuses on weak topics while still covering
the other subjects.
"""

    data = await complete_json(
        system_prompt,
        prompt
    )

    try:
        return StudyPlanResponse.model_validate(data)

    except ValueError as error:

        raise HTTPException(
            status_code=502,
            detail="The AI returned an invalid study-plan format."
        ) from error
    