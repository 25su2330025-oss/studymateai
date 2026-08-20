"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { fetchUserProgress, type UserProgressStats, emptyStats } from "@/lib/progress";
import { AppShell, Button, ProgressBar, StatCard } from "@/components/ui";

const staticTasks = [
  ["Machine Learning", "SVM kernel methods", "40 min", "next"],
  ["Data Mining", "Apriori algorithm", "30 min", "later"],
];

export default function DashboardPage() {
  const [userName, setUserName] = useState("Student");
  const [stats, setStats] = useState<UserProgressStats>(emptyStats);
  const [loadingUser, setLoadingUser] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    // Fetch user name from Supabase profile
    Promise.resolve()
      .then(async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return "Student";
        const { data } = await supabase
          .from("profiles")
          .select("name")
          .eq("id", user.id)
          .maybeSingle();
        return data?.name ?? user.user_metadata?.name ?? "Student";
      })
      .then((name) => setUserName(name))
      .catch(() => setUserName("Student"))
      .finally(() => setLoadingUser(false));

    // Fetch quiz stats
    fetchUserProgress()
      .then(setStats)
      .catch(() => setStats(emptyStats))
      .finally(() => setLoadingStats(false));
  }, []);

  const now = new Date();
  const dayName = now.toLocaleDateString("en-US", { weekday: "long" });
  const dateStr = now.toLocaleDateString("en-US", { day: "numeric", month: "long" });

  const greeting =
    now.getHours() < 12 ? "Good morning" : now.getHours() < 17 ? "Good afternoon" : "Good evening";

  const firstName = loadingUser ? "..." : userName.split(" ")[0];

  const quizAvgDisplay =
    loadingStats || stats.quizzes_completed === 0 ? "—" : `${stats.average_score}%`;

  const quizAvgDetail =
    loadingStats
      ? "Loading..."
      : stats.quizzes_completed === 0
      ? "No quizzes yet"
      : `↑ across ${stats.quizzes_completed} quiz${stats.quizzes_completed === 1 ? "" : "zes"}`;

  const mostRecentResult = stats.recent_results[0];

  return (
    <AppShell
      title={`${greeting}, ${firstName}`}
      description={`${dayName}, ${dateStr} · Here is your learning pulse.`}
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-300">Small steps compound into big results.</p>
        </div>
        <div className="flex gap-2">
          <Button href="/quiz" variant="secondary">Create a quiz</Button>
          <Button href="/tutor">Ask tutor <span>✦</span></Button>
        </div>
      </div>

      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Quizzes completed"
          value={loadingStats ? "..." : stats.quizzes_completed.toString()}
          detail={
            loadingStats
              ? "Loading..."
              : stats.quizzes_completed === 0
              ? "Take your first quiz"
              : `${stats.total_questions_answered} questions answered`
          }
        />
        <StatCard
          label="Questions answered"
          value={loadingStats ? "..." : stats.total_questions_answered.toString()}
          detail={
            loadingStats
              ? "Loading..."
              : stats.quizzes_completed === 0
              ? "Start a quiz to track progress"
              : `Across ${stats.quizzes_completed} quiz${stats.quizzes_completed === 1 ? "" : "zes"}`
          }
          accent="green"
        />
        <StatCard
          label="Quiz average"
          value={quizAvgDisplay}
          detail={quizAvgDetail}
          accent="amber"
        />
        <StatCard
          label="Last quiz score"
          value={
            loadingStats || !mostRecentResult
              ? "—"
              : `${mostRecentResult.score}/${mostRecentResult.total_questions}`
          }
          detail={
            loadingStats
              ? "Loading..."
              : mostRecentResult
              ? mostRecentResult.topic
              : "No quiz taken yet"
          }
        />
      </div>

      <div className="mt-7 grid gap-6 xl:grid-cols-[1.35fr_.65fr]">
        <section className="panel p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="eyebrow">Your rhythm</p>
              <h2 className="display-font mt-2 text-xl font-bold">Today&apos;s study plan</h2>
            </div>
            <Button href="/study-plan" variant="ghost">View full plan <span>→</span></Button>
          </div>

          <div className="mt-6 space-y-3">
            {/* Show recent quiz results if available, fall back to static placeholder tasks */}
            {!loadingStats && stats.recent_results.length > 0 ? (
              <>
                {stats.recent_results.slice(0, 1).map((result) => (
                  <div key={result.id} className="flex items-center gap-4 rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-emerald-400/15 text-sm font-bold text-emerald-300">✓</span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">AI Quiz</p>
                      <p className="muted mt-1 truncate text-xs">{result.topic} · {result.score}/{result.total_questions} correct</p>
                    </div>
                    <span className="text-xs text-emerald-300">Complete</span>
                  </div>
                ))}
                {staticTasks.map(([subject, topic, duration, state], index) => (
                  <div key={topic} className="flex items-center gap-4 rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-blue-400/15 text-sm font-bold text-blue-300">
                      {`0${index + 1}`}
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{subject}</p>
                      <p className="muted mt-1 truncate text-xs">{topic} · {duration}</p>
                    </div>
                    <Button href="/study-plan" variant={state === "next" ? "primary" : "secondary"}>
                      {state === "next" ? "Start" : "Open"}
                    </Button>
                  </div>
                ))}
              </>
            ) : (
              staticTasks.map(([subject, topic, duration, state], index) => (
                <div key={topic} className="flex items-center gap-4 rounded-2xl border border-slate-700/60 bg-slate-950/35 p-4">
                  <span className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-sm font-bold ${state === "done" ? "bg-emerald-400/15 text-emerald-300" : "bg-blue-400/15 text-blue-300"}`}>
                    {state === "done" ? "✓" : `0${index + 1}`}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold">{subject}</p>
                    <p className="muted mt-1 truncate text-xs">{topic} · {duration}</p>
                  </div>
                  {state === "done" ? (
                    <span className="text-xs text-emerald-300">Complete</span>
                  ) : (
                    <Button href="/study-plan" variant={state === "next" ? "primary" : "secondary"}>
                      {state === "next" ? "Start" : "Open"}
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        <section className="panel p-6">
          <p className="eyebrow">Focus areas</p>
          <h2 className="display-font mt-2 text-xl font-bold">Topics to revisit</h2>
          <div className="mt-6 space-y-6">
            {!loadingStats && stats.recent_results.length > 0 ? (
              stats.recent_results.slice(0, 3).map((result) => (
                <ProgressBar key={result.id} label={result.topic} value={result.percentage} />
              ))
            ) : (
              <>
                <ProgressBar label="Kernel methods" value={45} />
                <ProgressBar label="Probability basics" value={58} />
                <ProgressBar label="SQL joins" value={64} />
              </>
            )}
          </div>
          <Button href="/progress" variant="secondary" className="mt-7 w-full">See progress report</Button>
        </section>
      </div>
    </AppShell>
  );
}