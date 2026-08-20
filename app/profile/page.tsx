"use client";
import { useEffect, useState } from "react";
import { fetchUserProgress, type UserProgressStats, emptyStats } from "@/lib/progress";
import { defaultGuestProfile, readGuestProfile, writeGuestProfile, type GuestProfile } from "@/lib/guest-profile";
import { createClient } from "@/lib/supabase/client";
import { Button, Logo } from "@/components/ui";
import { useRouter } from "next/navigation";

function StatCard({
  label,
  value,
  detail,
  accent = "blue",
}: {
  label: string;
  value: string;
  detail: string;
  accent?: "blue" | "green" | "amber";
}) {
  const colors = { blue: "text-blue-300", green: "text-emerald-300", amber: "text-amber-300" };
  return (
    <div className="panel p-5">
      <p className="muted text-sm">{label}</p>
      <p className={`display-font mt-3 text-3xl font-bold ${colors[accent]}`}>{value}</p>
      <p className="mt-2 text-xs text-slate-500">{detail}</p>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<GuestProfile>(defaultGuestProfile);
  const [profileReady, setProfileReady] = useState(false);
  const [saved, setSaved] = useState(false);

  const [stats, setStats] = useState<UserProgressStats>(emptyStats);
  const [statsLoading, setStatsLoading] = useState(true);

  // Load profile data
  useEffect(() => {
    Promise.resolve()
      .then(async () => {
        const localProfile = readGuestProfile();
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return localProfile;
        const { data } = await supabase
          .from("profiles")
          .select("name, email, course, education_level, daily_study_hours, preferred_study_time")
          .eq("id", user.id)
          .maybeSingle();
        return data
          ? {
              ...localProfile,
              name: data.name,
              email: data.email,
              course: data.course ?? "",
              educationLevel: data.education_level ?? "",
              dailyStudyHours: data.daily_study_hours ? `${data.daily_study_hours} hours` : "",
              preferredStudyTime: data.preferred_study_time ?? "",
            }
          : { ...localProfile, name: user.user_metadata?.name ?? localProfile.name, email: user.email ?? localProfile.email };
      })
      .then((nextProfile) => { setProfile(nextProfile); setProfileReady(true); })
      .catch(() => { setProfile(readGuestProfile()); setProfileReady(true); });
  }, []);

  // Load progress stats
  useEffect(() => {
    fetchUserProgress()
      .then(setStats)
      .catch(() => setStats(emptyStats))
      .finally(() => setStatsLoading(false));
  }, []);

  function update(field: keyof GuestProfile, value: string) {
    setSaved(false);
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resumePage =
      profile.name && profile.lastVisitedPage.startsWith("/") && !["/login", "/signup", "/profile"].includes(profile.lastVisitedPage)
        ? profile.lastVisitedPage
        : "/dashboard";
    const nextProfile = { ...profile, lastVisitedPage: resumePage, lastVisitedAt: new Date().toISOString() };
    writeGuestProfile(nextProfile);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      await supabase.from("profiles").upsert({
        id: user.id,
        name: profile.name,
        email: user.email ?? profile.email,
        course: profile.course || null,
        education_level: profile.educationLevel || null,
        daily_study_hours: Number.parseFloat(profile.dailyStudyHours) || null,
        preferred_study_time: profile.preferredStudyTime || null,
      });
    }
    setProfile(nextProfile);
    setSaved(true);
    router.push(resumePage);
  }

  const mostRecentResult = stats.recent_results[0];

  const fields: Array<[keyof GuestProfile, string, string]> = [
    ["name", "Your name", "Alex Johnson"],
    ["email", "Email address", "alex@example.com"],
    ["course", "Course or subject", "Computer Science"],
    ["educationLevel", "Education level", "Undergraduate"],
    ["dailyStudyHours", "Daily study hours", "2 hours"],
    ["preferredStudyTime", "Preferred study time", "Evening"],
  ];

  return (
    <main className="min-h-screen px-5 py-12">
      <div className="mx-auto w-full max-w-2xl">
        <Logo />

        {/* ── Progress stats ── */}
        <div className="mt-8">
          <p className="eyebrow">Your progress</p>
          <h2 className="display-font mt-2 text-2xl font-bold">Learning statistics</h2>
          <p className="muted mt-1 text-sm">Updated every time you complete a quiz.</p>

          {statsLoading ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="panel animate-pulse p-5">
                  <div className="h-3 w-24 rounded bg-slate-700" />
                  <div className="mt-4 h-8 w-16 rounded bg-slate-700" />
                  <div className="mt-3 h-3 w-32 rounded bg-slate-700" />
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5 grid gap-4 sm:grid-cols-3">
              <StatCard
                label="Quizzes completed"
                value={stats.quizzes_completed.toString()}
                detail={
                  stats.quizzes_completed === 0
                    ? "Take your first quiz →"
                    : `${stats.total_questions_answered} questions answered`
                }
              />
              <StatCard
                label="Average score"
                value={stats.quizzes_completed > 0 ? `${stats.average_score}%` : "—"}
                detail={
                  stats.quizzes_completed === 0
                    ? "No quizzes yet"
                    : stats.average_score >= 80
                    ? "Great performance!"
                    : stats.average_score >= 60
                    ? "Keep improving"
                    : "Review weak areas"
                }
                accent="green"
              />
              <StatCard
                label="Last quiz"
                value={mostRecentResult ? `${mostRecentResult.score}/${mostRecentResult.total_questions}` : "—"}
                detail={
                  mostRecentResult
                    ? `${mostRecentResult.topic} · ${mostRecentResult.percentage}%`
                    : "No quiz taken yet"
                }
                accent="amber"
              />
            </div>
          )}

          {/* Recent quiz history */}
          {!statsLoading && stats.recent_results.length > 0 && (
            <div className="panel mt-6 p-6">
              <p className="eyebrow">Recent quiz history</p>
              <h3 className="display-font mt-2 text-lg font-bold">
                Last {stats.recent_results.length} quiz{stats.recent_results.length === 1 ? "" : "zes"}
              </h3>
              <div className="mt-5 space-y-3">
                {stats.recent_results.map((result) => (
                  <div
                    key={result.id}
                    className="flex items-center justify-between rounded-xl border border-slate-700/60 bg-slate-950/35 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold">{result.topic}</p>
                      <p className="muted mt-1 text-xs">
                        {result.difficulty} ·{" "}
                        {new Date(result.created_at).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-sm font-bold ${
                          result.percentage >= 80
                            ? "text-emerald-300"
                            : result.percentage >= 60
                            ? "text-amber-300"
                            : "text-rose-300"
                        }`}
                      >
                        {result.score}/{result.total_questions}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-500">{result.percentage}%</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── Profile form (name, email, course, etc.) ── */}
        <div className="panel mt-8 p-7 sm:p-9">
          <p className="eyebrow">Your learning profile</p>
          <h1 className="display-font mt-3 text-3xl font-bold">
            {profileReady && profile.name
              ? `Continue where you left off, ${profile.name.split(" ")[0]}.`
              : "Make StudyMate yours."}
          </h1>
          <p className="muted mt-3 max-w-xl text-sm leading-6">
            Save your learning preferences and StudyMate will keep your profile, recent activity, and next place to continue.
          </p>
          {profileReady ? (
            <form onSubmit={saveProfile} className="mt-7 grid gap-4 sm:grid-cols-2">
              {fields.map(([field, label, placeholder]) => (
                <label key={field} className="block">
                  <span className="mb-2 block text-sm font-medium text-slate-300">{label}</span>
                  <input
                    required={field === "name"}
                    type={field === "email" ? "email" : "text"}
                    value={profile[field] as string}
                    onChange={(event) => update(field, event.target.value)}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400"
                  />
                </label>
              ))}
              <div className="flex items-center justify-end gap-4 sm:col-span-2">
                {saved && <span className="text-sm text-emerald-300">Profile saved</span>}
                <Button>
                  {profile.name ? "Resume study" : "Create profile"} <span>→</span>
                </Button>
              </div>
            </form>
          ) : (
            <p className="muted mt-6 text-sm">Loading your profile...</p>
          )}
        </div>
      </div>
    </main>
  );
}
