"use client";
import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { readGuestProfile, writeGuestProfile } from "@/lib/guest-profile";

export function ActivityTracker() {
  const page = usePathname();
  useEffect(() => {
    const profile = readGuestProfile();
    const activity = profile.recentActivity ?? [];
    const visitedAt = new Date().toISOString();
    writeGuestProfile({ ...profile, lastVisitedPage: page, lastVisitedAt: visitedAt, recentActivity: [{ page, visitedAt }, ...activity.filter((item) => item.page !== page)].slice(0, 30) });
  }, [page]);

  return null;
}