"use client";
import { useEffect, useState } from "react";
import { readGuestProfile } from "@/lib/guest-profile";

export function ProfileIdentity() {
  const [name, setName] = useState("Student");
  useEffect(() => { Promise.resolve().then(() => setName(readGuestProfile().name || "Student")); }, []);
  const initials = name.split(" ").map((part) => part[0]).join("").slice(0, 2).toUpperCase();
  return <><span className="hidden text-right sm:block"><p className="text-sm font-semibold">{name}</p><p className="text-xs text-slate-500">Local profile</p></span><span className="grid h-10 w-10 place-items-center rounded-full bg-blue-500/20 font-bold text-blue-200">{initials}</span></>;
}