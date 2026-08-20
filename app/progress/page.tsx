"use client";
import { useEffect, useState } from "react";
import { fetchUserProgress, type UserProgressStats, emptyStats } from "@/lib/progress";
import { AppShell, ProgressBar, StatCard } from "@/components/ui";

export default function ProgressPage() {
  const [stats, setStats] = useState<UserProgressStats>(emptyStats);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProgress()
      .then(setStats)
      .catch(() => setStats(emptyStats))
      .finally(() => setLoading(false));
  }, []);

  const quizAvg = stats.quizzes_completed > 0 ? `${stats.average_score}%` : "—";
  const masteryDetail =
    stats.quizzes_completed === 0
      ? "Take a quiz to see progress"
      : `Across ${stats.quizzes_completed} quiz${stats.quizzes_completed === 1 ? "" : "zes"}`;

  return (
    <AppShell title="Progress report" description="Patterns from your recent study sessions.">
      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard
          label="Quizzes completed"
          value={loading ? "..." : stats.quizzes_completed.toString()}
          detail={loading ? "Loading..." : masteryDetail}
        />
        <StatCard
          label="Quiz average"
          value={loading ? "..." : quizAvg}
          detail={
            loading
              ? "Loading..."
              : stats.quizzes_completed === 0
              ? "No quizzes yet"
              : stats.average_score >= 80
              ? "Excellent performance"
              : stats.average_score >= 60
              ? "Good progress"
              : "Review weak areas"
          }
          accent="green"
        />
        <StatCard
          label="Questions answered"
          value={loading ? "..." : stats.total_questions_answered.toString()}
          detail={
            loading
              ? "Loading..."
              : stats.total_questions_answered === 0
              ? "Start your first quiz"
              : "Total across all quizzes"
          }
          accent="amber"
        />
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <section className="panel p-6">
          <p className="eyebrow">Quiz performance</p>
          <h2 className="display-font mt-2 text-xl font-bold">Scores by topic</h2>
          <div className="mt-7 space-y-6">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="mb-2 flex justify-between">
                    <div className="h-3 w-32 rounded bg-slate-700" />
                    <div className="h-3 w-8 rounded bg-slate-700" />
                  </div>
                  <div className="h-2 rounded-full bg-slate-800">
                    <div className="h-full w-1/2 rounded-full bg-slate-700" />
                  </div>
                </div>
              ))
            ) : stats.recent_results.length === 0 ? (
              <div className="grid min-h-[180px] place-items-center text-center">
                <div>
                  <p className="text-3xl">↗</p>
                  <p className="display-font mt-4 text-lg font-bold">No quiz history yet</p>
                  <p className="muted mt-2 text-sm">Complete a quiz to see your performance here.</p>
                </div>
              </div>
            ) : (
              stats.recent_results.slice(0, 6).map((result) => (
                <ProgressBar key={result.id} label={result.topic} value={result.percentage} />
              ))
            )}
          </div>
        </section>

        <section className="panel p-6">
          <p className="eyebrow">Recent activity</p>
          <h2 className="display-font mt-2 text-xl font-bold">Wins worth noticing</h2>
          <div className="mt-6 space-y-5">
            {loading ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3 animate-pulse">
                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-slate-700" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-28 rounded bg-slate-700" />
                    <div className="h-3 w-36 rounded bg-slate-700" />
                    <div className="h-3 w-16 rounded bg-slate-700" />
                  </div>
                </div>
              ))
            ) : stats.recent_results.length === 0 ? (
              <div className="grid min-h-[180px] place-items-center text-center">
                <div>
                  <p className="muted text-sm">Your quiz results will appear here after you complete your first quiz.</p>
                </div>
              </div>
            ) : (
              stats.recent_results.slice(0, 5).map((result) => {
                const date = new Date(result.created_at);
                const today = new Date();
                const yesterday = new Date(today);
                yesterday.setDate(today.getDate() - 1);

                const timeLabel =
                  date.toDateString() === today.toDateString()
                    ? "Today"
                    : date.toDateString() === yesterday.toDateString()
                    ? "Yesterday"
                    : date.toLocaleDateString("en-US", { day: "numeric", month: "short" });

                return (
                  <div key={result.id} className="flex gap-3">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-blue-400" />
                    <div>
                      <p className="text-sm font-semibold">Quiz completed</p>
                      <p className="muted mt-1 text-xs">
                        {result.topic} · {result.score}/{result.total_questions} correct ({result.percentage}%)
                      </p>
                      <p className="mt-1 text-xs text-slate-600">{timeLabel}</p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </AppShell>
  );
}