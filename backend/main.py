import json
import os
from pathlib import Path
from typing import Literal

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import APIError, AsyncOpenAI, AuthenticationError, RateLimitError
from dotenv import load_dotenv
from pydantic import BaseModel, Field

load_dotenv(Path(__file__).resolve().parent.parent / ".env.local")


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


app = FastAPI(title="StudyMate AI API", version="0.1.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=[os.getenv("FRONTEND_URL", "http://localhost:3000")],
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)


def get_client() -> AsyncOpenAI:
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="AI service is not configured.")
    return AsyncOpenAI(api_key=api_key)


async def complete_json(system: str, prompt: str) -> dict:
    client = get_client()
    try:
        response = await client.chat.completions.create(
            model=os.getenv("AI_MODEL", "gpt-4o-mini"),
            response_format={"type": "json_object"},
            temperature=0.3,
            messages=[{"role": "system", "content": system}, {"role": "user", "content": prompt}],
        )
    except RateLimitError as error:
        raise HTTPException(status_code=503, detail="The AI provider has no available quota.") from error
    except AuthenticationError as error:
        raise HTTPException(status_code=503, detail="The AI provider key is invalid or unavailable.") from error
    except APIError as error:
        raise HTTPException(status_code=502, detail="The AI provider is temporarily unavailable.") from error
    content = response.choices[0].message.content
    if not content:
        raise HTTPException(status_code=502, detail="The AI returned an empty response.")
    try:
        return json.loads(content)
    except json.JSONDecodeError as error:
        raise HTTPException(status_code=502, detail="The AI returned invalid structured data.") from error


@app.get("/health")
async def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/ai/tutor", response_model=TutorResponse)
async def tutor(request: TutorRequest) -> TutorResponse:
    client = get_client()
    messages = [{"role": "system", "content": "You are StudyMate, a concise and patient study tutor. Explain clearly, use examples, and encourage active recall."}]
    messages.extend({"role": "user" if item.role == "student" else "assistant", "content": item.message} for item in request.history)
    messages.append({"role": "user", "content": request.message})
    try:
        response = await client.chat.completions.create(model=os.getenv("AI_MODEL", "gpt-4o-mini"), temperature=0.4, messages=messages)
    except RateLimitError as error:
        raise HTTPException(status_code=503, detail="The AI provider has no available quota.") from error
    except AuthenticationError as error:
        raise HTTPException(status_code=503, detail="The AI provider key is invalid or unavailable.") from error
    except APIError as error:
        raise HTTPException(status_code=502, detail="The AI provider is temporarily unavailable.") from error
    reply = response.choices[0].message.content
    if not reply:
        raise HTTPException(status_code=502, detail="The AI returned an empty response.")
    return TutorResponse(reply=reply)


@app.post("/ai/quiz", response_model=QuizResponse)
async def quiz(request: QuizRequest) -> QuizResponse:
    data = await complete_json(
        "Return only valid JSON with a questions array. Each question needs question, options with exactly four strings, correct_answer as A/B/C/D, explanation, topic, and difficulty.",
        f"Create {request.number_of_questions} {request.difficulty} multiple-choice questions for {request.subject}, topic {request.topic}.",
    )
    try:
        return QuizResponse.model_validate(data)
    except ValueError as error:
        raise HTTPException(status_code=502, detail="The AI returned an invalid quiz format.") from error


@app.post("/ai/study-plan", response_model=StudyPlanResponse)
async def study_plan(request: StudyPlanRequest) -> StudyPlanResponse:
    data = await complete_json(
        "Return only valid JSON with a plan array. Each item needs date, subject, topic, duration as minutes, priority as low/medium/high, and reason.",
        f"Create a practical study plan for subjects {request.subjects}, {request.available_minutes} available minutes, weak topics {request.weak_topics}, and exam date {request.exam_date or 'not provided'}.",
    )
    try:
        return StudyPlanResponse.model_validate(data)
    except ValueError as error:
        raise HTTPException(status_code=502, detail="The AI returned an invalid study-plan format.") from error