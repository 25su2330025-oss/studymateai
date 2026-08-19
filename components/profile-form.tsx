"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { defaultGuestProfile, readGuestProfile, writeGuestProfile, type GuestProfile } from "@/lib/guest-profile";
import { createClient } from "@/lib/supabase/client";
import { Button, Logo } from "./ui";

export function ProfileForm({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [profile, setProfile] = useState<GuestProfile>(defaultGuestProfile);
  const [ready, setReady] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    Promise.resolve().then(async () => {
      const localProfile = readGuestProfile();
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return localProfile;
      const { data } = await supabase.from("profiles").select("name, email, course, education_level, daily_study_hours, preferred_study_time").eq("id", user.id).maybeSingle();
      return data ? { ...localProfile, name: data.name, email: data.email, course: data.course ?? "", educationLevel: data.education_level ?? "", dailyStudyHours: data.daily_study_hours ? `${data.daily_study_hours} hours` : "", preferredStudyTime: data.preferred_study_time ?? "" } : { ...localProfile, name: user.user_metadata.name ?? localProfile.name, email: user.email ?? localProfile.email };
    }).then((nextProfile) => { setProfile(nextProfile); setReady(true); }).catch(() => { setProfile(readGuestProfile()); setReady(true); });
  }, []);

  function update(field: keyof GuestProfile, value: string) {
    setSaved(false);
    setProfile((current) => ({ ...current, [field]: value }));
  }

  async function saveProfile(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const resumePage = profile.name && profile.lastVisitedPage.startsWith("/") && !["/login", "/signup", "/profile"].includes(profile.lastVisitedPage) ? profile.lastVisitedPage : "/dashboard";
    const nextProfile = { ...profile, lastVisitedPage: resumePage, lastVisitedAt: new Date().toISOString() };
    writeGuestProfile(nextProfile);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) await supabase.from("profiles").upsert({ id: user.id, name: profile.name, email: user.email ?? profile.email, course: profile.course || null, education_level: profile.educationLevel || null, daily_study_hours: Number.parseFloat(profile.dailyStudyHours) || null, preferred_study_time: profile.preferredStudyTime || null });
    setProfile(nextProfile);
    setSaved(true);
    router.push(resumePage);
  }

  if (!ready) return <main className="grid min-h-screen place-items-center px-5"><p className="muted text-sm">Loading your profile...</p></main>;

  const fields: Array<[keyof GuestProfile, string, string]> = [["name", "Your name", "Alex Johnson"], ["email", "Email address", "alex@example.com"], ["course", "Course or subject", "Computer Science"], ["educationLevel", "Education level", "Undergraduate"], ["dailyStudyHours", "Daily study hours", "2 hours"], ["preferredStudyTime", "Preferred study time", "Evening"]];
  return <main className="grid min-h-screen place-items-center px-5 py-12"><div className="w-full max-w-2xl"><Logo /><div className="panel mt-8 p-7 sm:p-9"><p className="eyebrow">{compact ? "Your learning profile" : profile.name ? "Welcome back" : "Create your student profile"}</p><h1 className="display-font mt-3 text-3xl font-bold">{profile.name ? `Continue where you left off, ${profile.name.split(" ")[0]}.` : "Make StudyMate yours."}</h1><p className="muted mt-3 max-w-xl text-sm leading-6">Save your learning preferences and StudyMate will keep your profile, recent activity, and next place to continue in this browser.</p><form onSubmit={saveProfile} className="mt-7 grid gap-4 sm:grid-cols-2">{fields.map(([field, label, placeholder]) => <label key={field} className="block"><span className="mb-2 block text-sm font-medium text-slate-300">{label}</span><input required={field === "name"} type={field === "email" ? "email" : "text"} value={profile[field] as string} onChange={(event) => update(field, event.target.value)} placeholder={placeholder} className="w-full rounded-xl border border-slate-700 bg-slate-900/80 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-blue-400" /></label>)}<div className="flex items-center justify-end gap-4 sm:col-span-2">{saved && <span className="text-sm text-emerald-300">Profile saved</span>}<Button>{profile.name ? "Resume study" : "Create profile"} <span>→</span></Button></div></form></div></div></main>;
}