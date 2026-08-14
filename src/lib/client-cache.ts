import { UserProfile, MeterLog } from "@/types";
import { sanitizeEmail } from "./database";

export interface LocalCachePayload {
  user: UserProfile;
  logs: MeterLog[];
  updatedAt: number;
}

export function getLocalCache(userId: string): LocalCachePayload | null {
  if (typeof window === "undefined" || !userId) return null;
  const cleanId = sanitizeEmail(userId);
  try {
    const raw = localStorage.getItem(`khafai_cache_${cleanId}`);
    if (raw) {
      const parsed: LocalCachePayload = JSON.parse(raw);
      if (parsed.user) {
        parsed.user.Email = sanitizeEmail(parsed.user.Email, cleanId);
        parsed.user.User_ID = sanitizeEmail(parsed.user.User_ID, cleanId);
      }
      return parsed;
    }
  } catch {
    // Ignore error
  }
  return null;
}

export function saveLocalCache(userId: string, user: UserProfile, logs: MeterLog[]): void {
  if (typeof window === "undefined" || !userId) return;
  const cleanId = sanitizeEmail(userId);
  try {
    const cleanUser = {
      ...user,
      User_ID: sanitizeEmail(user.User_ID, cleanId),
      Email: sanitizeEmail(user.Email, cleanId),
    };
    const payload: LocalCachePayload = {
      user: cleanUser,
      logs,
      updatedAt: Date.now(),
    };
    localStorage.setItem(`khafai_cache_${cleanId}`, JSON.stringify(payload));
  } catch {
    // Ignore error
  }
}
