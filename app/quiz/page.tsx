"use client";
import { useState } from "react";
import { aiApi, type QuizQuestion } from "@/lib/api";
import { AppShell, Button } from "@/components/ui";

export default function QuizPage() {
  const [subject, setSubject] = useState("Machine Learning");
  const [topic, setTopic] = useState("Kernel methods");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [selected, setSelected] = useState<Record<number, string>>({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generateQuiz() {
    setLoading(true);
    setError("");
    setSubmitted(false);
    setSelected({});
    try {
      const response = await aiApi.quiz({ subject, topic, difficulty, number_of_questions: 5 });
      setQuestions(response.questions);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The quiz service is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  return <AppShell title="AI quiz" description="Practice actively and turn mistakes into your next study move."><div className="grid gap-6 xl:grid-cols-[.7fr_1.3fr]"><aside className="panel h-fit p-6"><p className="eyebrow">Quiz builder</p><h2 className="display-font mt-2 text-xl font-bold">Set your focus</h2><div className="mt-6 space-y-4"><label className="block text-sm"><span className="mb-2 block text-slate-300">Subject</span><select value={subject} onChange={(event) => setSubject(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm"><option>Machine Learning</option><option>Python Programming</option><option>Data Mining</option></select></label><label className="block text-sm"><span className="mb-2 block text-slate-300">Topic</span><select value={topic} onChange={(event) => setTopic(event.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm"><option>Kernel methods</option><option>Decision trees</option><option>Model evaluation</option></select></label><label className="block text-sm"><span className="mb-2 block text-slate-300">Difficulty</span><select value={difficulty} onChange={(event) => setDifficulty(event.target.value as "easy" | "medium" | "hard")} className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-3 text-sm"><option value="medium">Medium</option><option value="easy">Easy</option><option value="hard">Hard</option></select></label><Button onClick={() => void generateQuiz()} className="mt-3 w-full">{loading ? "Generating..." : "Generate quiz"} {!loading && <span>✦</span>}</Button></div></aside><section className="panel p-6 sm:p-8">{error && <p role="alert" className="mb-5 rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}{questions.length === 0 ? <div className="grid min-h-[420px] place-items-center text-center"><div><p className="text-4xl">✦</p><h2 className="display-font mt-4 text-2xl font-bold">Your quiz starts here</h2><p className="muted mt-2 max-w-sm text-sm leading-6">Choose a focus and generate questions from the StudyMate AI backend.</p></div></div> : <><div className="flex items-center justify-between"><div><p className="eyebrow">{submitted ? "Review answers" : `${questions.length} questions`}</p><h2 className="display-font mt-3 text-2xl font-bold">{topic}</h2></div><span className="text-sm text-slate-500">{submitted ? `${questions.filter((question, index) => selected[index] === question.correct_answer).length}/${questions.length}` : difficulty}</span></div><div className="mt-8 space-y-8">{questions.map((question, questionIndex) => <div key={`${question.question}-${questionIndex}`}><p className="text-sm font-semibold">{questionIndex + 1}. {question.question}</p><div className="mt-3 space-y-2">{question.options.map((option, optionIndex) => { const answer = String.fromCharCode(65 + optionIndex); const correct = submitted && answer === question.correct_answer; const wrong = submitted && selected[questionIndex] === answer && !correct; return <button key={option} onClick={() => !submitted && setSelected({ ...selected, [questionIndex]: answer })} className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left text-sm ${correct ? "border-emerald-400/50 bg-emerald-400/10 text-emerald-200" : wrong ? "border-rose-400/50 bg-rose-400/10 text-rose-200" : selected[questionIndex] === answer ? "border-blue-400 bg-blue-400/10 text-white" : "border-slate-700/70 text-slate-300 hover:border-slate-500"}`}><span className="font-bold text-slate-500">{answer}</span>{option}</button>; })}</div>{submitted && <p className="mt-3 text-xs leading-5 text-slate-400">{question.explanation}</p>}</div>)}</div><div className="mt-8 flex justify-end border-t border-slate-700/60 pt-6"><Button onClick={() => setSubmitted(true)}>{submitted ? "Reviewed" : "Submit answers"} <span>→</span></Button></div></>}</section></div></AppShell>;
}
