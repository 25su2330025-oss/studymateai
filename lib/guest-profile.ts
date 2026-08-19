export type GuestProfile = {
  name: string;
  email: string;
  course: string;
  educationLevel: string;
  dailyStudyHours: string;
  preferredStudyTime: string;
  lastVisitedPage: string;
  lastVisitedAt: string;
  recentActivity: Array<{ page: string; visitedAt: string }>;
};

export const defaultGuestProfile: GuestProfile = {
  name: "",
  email: "",
  course: "",
  educationLevel: "",
  dailyStudyHours: "",
  preferredStudyTime: "",
  lastVisitedPage: "/dashboard",
  lastVisitedAt: "",
  recentActivity: [],
};

export const guestProfileKey = "studymate-profile";

export function readGuestProfile(): GuestProfile {
  if (typeof window === "undefined") return defaultGuestProfile;
  const stored = localStorage.getItem(guestProfileKey);
  if (!stored) return defaultGuestProfile;
  try {
    return { ...defaultGuestProfile, ...JSON.parse(stored) };
  } catch {
    return defaultGuestProfile;
  }
}

export function writeGuestProfile(profile: GuestProfile) {
  localStorage.setItem(guestProfileKey, JSON.stringify(profile));
}