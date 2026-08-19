"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleLogout() {
    setLoading(true);
    await createClient().auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  return <button onClick={handleLogout} disabled={loading} className="mt-3 w-full rounded-xl px-3 py-2 text-left text-sm text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50">{loading ? "Signing out..." : "Sign out"}</button>;
}