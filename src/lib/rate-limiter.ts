import { RateLimitStatus } from "@/types";

interface UserRateLimitState {
  timestamps: number[];
  lockedUntil: number | null;
}

// Global in-memory storage for user rate limits (emulating Server/Redis binding)
const globalRateLimitMap: Map<string, UserRateLimitState> = new Map();

/**
 * Checks and updates rate limit state for a given User_ID.
 * @param userId Unique identifier for user
 * @param actionType 'write' | 'read'
 */
export function checkRateLimit(
  userId: string,
  actionType: "write" | "read" = "write"
): RateLimitStatus {
  const now = Date.now();
  let state = globalRateLimitMap.get(userId);

  if (!state) {
    state = { timestamps: [], lockedUntil: null };
    globalRateLimitMap.set(userId, state);
  }

  // Check if currently locked
  if (state.lockedUntil !== null) {
    if (now < state.lockedUntil) {
      const remainingMs = state.lockedUntil - now;
      const remainingSeconds = Math.ceil(remainingMs / 1000);
      return {
        isLocked: true,
        lockedUntil: state.lockedUntil,
        remainingSeconds,
      };
    } else {
      // Lock expired, reset lock state
      state.lockedUntil = null;
      state.timestamps = [];
    }
  }

  // Only apply rate limit tracking to write actions (Create, Update, Delete)
  if (actionType === "read") {
    return { isLocked: false, lockedUntil: null, remainingSeconds: 0 };
  }

  // Filter timestamps within last 60 seconds (1 minute window)
  const windowMs = 60 * 1000;
  state.timestamps = state.timestamps.filter((ts) => now - ts < windowMs);

  let warningToast: string | undefined = undefined;

  // Check rapid request interval (less than 1.5 seconds since last request)
  if (state.timestamps.length > 0) {
    const lastTimestamp = state.timestamps[state.timestamps.length - 1];
    if (now - lastTimestamp < 1500) {
      warningToast = "คุณทำรายการเร็วเกินไป กรุณารอสักครู่";
    }
  }

  // Record current request
  state.timestamps.push(now);

  // Progressive Rate Limit: If more than 3 write requests in 1 minute -> LOCK for 1 HOUR (3600 seconds)
  const MAX_REQUESTS_PER_MIN = 3;
  if (state.timestamps.length > MAX_REQUESTS_PER_MIN) {
    // Apply 1-hour lock penalty (3,600,000 ms)
    const LOCK_DURATION_MS = 60 * 60 * 1000; // 1 hour
    state.lockedUntil = now + LOCK_DURATION_MS;

    const remainingSeconds = Math.ceil(LOCK_DURATION_MS / 1000);
    return {
      isLocked: true,
      lockedUntil: state.lockedUntil,
      remainingSeconds,
    };
  }

  return {
    isLocked: false,
    lockedUntil: null,
    remainingSeconds: 0,
    warningToast,
  };
}

/**
 * Manually reset rate limit for testing/demo purposes.
 */
export function resetUserRateLimit(userId: string): void {
  globalRateLimitMap.delete(userId);
}
