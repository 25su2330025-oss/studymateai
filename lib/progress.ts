import { createClient } from "@/lib/supabase/client";

export type UserProgressStats = {
  quizzes_completed: number;
  average_score: number;
  total_questions_answered: number;
  recent_results: RecentResult[];
};

export type RecentResult = {
  id: string;
  topic: string;
  difficulty: string;
  score: number;
  total_questions: number;
  percentage: number;
  created_at: string;
};

export const emptyStats: UserProgressStats = {
  quizzes_completed: 0,
  average_score: 0,
  total_questions_answered: 0,
  recent_results: [],
};

/**
 * Fetches aggregated progress statistics for the currently authenticated user.
 * Returns emptyStats if the user is not authenticated or has no quiz history.
 */
export async function fetchUserProgress(): Promise<UserProgressStats> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return emptyStats;

  // Fetch all quiz results for this user, joined with quiz metadata for topic/difficulty
  const { data: results, error } = await supabase
    .from("quiz_results")
    .select(
      `
      id,
      score,
      total_questions,
      percentage,
      created_at,
      quizzes ( topic, difficulty )
    `
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  if (error || !results || results.length === 0) return emptyStats;

  const quizzes_completed = results.length;

  const average_score =
    results.reduce((sum, r) => sum + Number(r.percentage), 0) / quizzes_completed;

  const total_questions_answered = results.reduce(
    (sum, r) => sum + r.total_questions,
    0
  );

  const recent_results: RecentResult[] = results.slice(0, 10).map((r) => {
    const quiz = Array.isArray(r.quizzes) ? r.quizzes[0] : r.quizzes;
    return {
      id: r.id,
      topic: quiz?.topic ?? "Unknown topic",
      difficulty: quiz?.difficulty ?? "medium",
      score: r.score,
      total_questions: r.total_questions,
      percentage: Number(r.percentage),
      created_at: r.created_at,
    };
  });

  return {
    quizzes_completed,
    average_score: Math.round(average_score),
    total_questions_answered,
    recent_results,
  };
}

/**
 * Saves a completed quiz and its result to Supabase for the authenticated user.
 * Returns the saved quiz_result id on success, or null on failure/unauthenticated.
 */
export async function saveQuizResult(params: {
  subject: string;
  topic: string;
  difficulty: "easy" | "medium" | "hard";
  questions: Array<{
    question: string;
    options: string[];
    correct_answer: "A" | "B" | "C" | "D";
    explanation: string;
    topic: string;
    difficulty: "easy" | "medium" | "hard";
  }>;
  score: number;
  total_questions: number;
}): Promise<string | null> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  // 1. Insert quiz record
  const { data: quizData, error: quizError } = await supabase
    .from("quizzes")
    .insert({
      user_id: user.id,
      topic: params.topic,
      difficulty: params.difficulty,
      total_questions: params.total_questions,
    })
    .select("id")
    .single();

  if (quizError || !quizData) return null;

  const quizId = quizData.id;

  // 2. Insert all quiz questions
  const questionRows = params.questions.map((q) => ({
    quiz_id: quizId,
    question: q.question,
    option_a: q.options[0] ?? "",
    option_b: q.options[1] ?? "",
    option_c: q.options[2] ?? "",
    option_d: q.options[3] ?? "",
    correct_answer: q.correct_answer,
    explanation: q.explanation || null,
  }));

  await supabase.from("quiz_questions").insert(questionRows);

  // 3. Insert quiz result
  const percentage =
    params.total_questions > 0
      ? Math.round((params.score / params.total_questions) * 10000) / 100
      : 0;

  const { data: resultData, error: resultError } = await supabase
    .from("quiz_results")
    .insert({
      user_id: user.id,
      quiz_id: quizId,
      score: params.score,
      total_questions: params.total_questions,
      percentage,
    })
    .select("id")
    .single();

  if (resultError || !resultData) return null;

  return resultData.id;
}
