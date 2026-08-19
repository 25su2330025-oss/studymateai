const apiUrl = process.env.NEXT_PUBLIC_AI_API_URL ?? "http://127.0.0.1:8000";

async function request<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${apiUrl}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.detail ?? "The AI service could not complete the request.");
  return payload as T;
}

export type TutorReply = { reply: string };
export type QuizQuestion = { question: string; options: string[]; correct_answer: "A" | "B" | "C" | "D"; explanation: string; topic: string; difficulty: "easy" | "medium" | "hard" };
export type QuizResponse = { questions: QuizQuestion[] };
export type StudyPlanItem = { date: string; subject: string; topic: string; duration: number; priority: "low" | "medium" | "high"; reason: string };
export type StudyPlanResponse = { plan: StudyPlanItem[] };

export const aiApi = {
  tutor: (body: { message: string; history: { role: "student" | "tutor"; message: string }[] }) => request<TutorReply>("/ai/tutor", body),
  quiz: (body: { subject: string; topic: string; difficulty: "easy" | "medium" | "hard"; number_of_questions: number }) => request<QuizResponse>("/ai/quiz", body),
  studyPlan: (body: { subjects: string[]; available_minutes: number; weak_topics: string[]; exam_date?: string }) => request<StudyPlanResponse>("/ai/study-plan", body),
};