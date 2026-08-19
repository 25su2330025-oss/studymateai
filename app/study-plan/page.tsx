"use client";
import { useState } from "react";
import { aiApi, type StudyPlanItem } from "@/lib/api";
import { AppShell, Button } from "@/components/ui";

export default function StudyPlanPage() {
  const [plan, setPlan] = useState<StudyPlanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function generatePlan() {
    setLoading(true);
    setError("");
    try {
      const response = await aiApi.studyPlan({ subjects: ["Machine Learning", "Python", "Data Mining", "Database Systems"], available_minutes: 120, weak_topics: ["Kernel methods", "SQL joins"] });
      setPlan(response.plan);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "The study-plan service is unavailable right now.");
    } finally {
      setLoading(false);
    }
  }

  return <AppShell title="Study plan" description="A focused path built around your goals and available time."><div className="flex flex-wrap items-center justify-between gap-4"><div className="flex gap-2"><Button>Week view</Button><Button variant="secondary">Day view</Button></div><Button onClick={() => void generatePlan()} variant="secondary">{loading ? "Building..." : "Generate with AI"} {!loading && <span>✦</span>}</Button></div>{error && <p role="alert" className="mt-6 max-w-4xl rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-300">{error}</p>}{plan.length === 0 ? <div className="panel mt-8 max-w-4xl p-8 text-center"><p className="text-3xl">▣</p><h2 className="display-font mt-4 text-xl font-bold">Build your next study session</h2><p className="muted mx-auto mt-2 max-w-md text-sm leading-6">Generate a plan from your subjects, available time, and weak topics using the StudyMate AI backend.</p><Button onClick={() => void generatePlan()} className="mt-6">Generate study plan <span>→</span></Button></div> : <div className="mt-8 max-w-4xl space-y-8"><section><div className="flex items-baseline gap-3"><h2 className="display-font text-xl font-bold">Your generated plan</h2><span className="muted text-sm">{plan.length} sessions</span></div><div className="mt-4 space-y-3">{plan.map((item, index) => <div key={`${item.date}-${item.topic}-${index}`} className="panel flex flex-wrap items-center gap-4 p-5"><span className="grid h-10 w-10 place-items-center rounded-xl bg-blue-400/15 text-blue-300">▣</span><div className="min-w-[180px] flex-1"><p className="text-sm font-semibold">{item.subject}</p><p className="muted mt-1 text-sm">{item.topic}</p><p className="mt-1 text-xs text-slate-500">{item.date} · {item.reason}</p></div><span className="muted text-sm">{item.duration} min</span><span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.priority === "high" ? "bg-rose-400/10 text-rose-300" : item.priority === "medium" ? "bg-amber-400/10 text-amber-300" : "bg-slate-700 text-slate-300"}`}>{item.priority}</span><Button variant="secondary">Start</Button></div>)}</div></section></div>}</AppShell>;
}
