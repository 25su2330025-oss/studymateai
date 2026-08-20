"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { readGuestProfile } from "@/lib/guest-profile";

export function ProfileIdentity() {
  const [name, setName] = useState("Student");
  const [signedIn, setSignedIn] = useState(false);

  useEffect(() => {
    Promise.resolve()
      .then(async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          // Try to get name from Supabase profile first
          const { data } = await supabase
            .from("profiles")
            .select("name")
            .eq("id", user.id)
            .maybeSingle();
          const resolvedName =
            data?.name ??
            (user.user_metadata?.name as string | undefined) ??
            user.email?.split("@")[0] ??
            "Student";
          return { name: resolvedName, signedIn: true };
        }
        // Fall back to localStorage for guests
        const localName = readGuestProfile().name || "Student";
        return { name: localName, signedIn: false };
      })
      .then(({ name: resolvedName, signedIn: isSignedIn }) => {
        setName(resolvedName);
        setSignedIn(isSignedIn);
      })
      .catch(() => {
        setName(readGuestProfile().name || "Student");
        setSignedIn(false);
      });
  }, []);

  const initials = name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <span className="hidden text-right sm:block">
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-xs text-slate-500">{signedIn ? "Signed in" : "Local profile"}</p>
      </span>
      <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/20 font-bold text-blue-200">
        {initials}
      </span>
    </>
  );
}