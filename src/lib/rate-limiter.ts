import { RateLimitStatus } from "@/types";

interface UserRateLimitState {
  timestamps: number[];
  lockedUntil: number | null;
  offenseCount: number;
}

// Global in-memory storage for user rate limits
const globalRateLimitMap: Map<string, UserRateLimitState> = new Map();

/**
 * Checks and updates rate limit state for a given User_ID.
 * - Rules:
 *   1. Threshold: Exceeding 30 requests per minute (> 30 requests within 60s window).
 *   2. 1st Offense: 30 seconds lockout.
 *   3. Repeated Offenses (2nd+): 1 hour (3,600 seconds) lockout.
 */
export function checkRateLimit(
  userId: string,
  actionType: "write" | "read" = "write"
): RateLimitStatus {
  const now = Date.now();
  let state = globalRateLimitMap.get(userId);

  if (!state) {
    state = { timestamps: [], lockedUntil: null, offenseCount: 0 };
    globalRateLimitMap.set(userId, state);
  }

  // 1. Check if currently locked
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
      // Lock duration expired, clear lock and timestamps (retain offenseCount)
      state.lockedUntil = null;
      state.timestamps = [];
    }
  }

  // 2. Filter timestamps within last 60 seconds (1 minute window)
  const windowMs = 60 * 1000;
  state.timestamps = state.timestamps.filter((ts) => now - ts < windowMs);

  // Record current request
  state.timestamps.push(now);

  // 3. Threshold check: Limit to max 30 requests per minute
  const MAX_REQUESTS_PER_MIN = 30;

  if (state.timestamps.length > MAX_REQUESTS_PER_MIN) {
    state.offenseCount += 1;

    // First offense -> 30 seconds (30,000 ms)
    // Repeated offenses -> 1 hour (3,600,000 ms)
    const LOCK_DURATION_MS =
      state.offenseCount === 1 ? 30 * 1000 : 60 * 60 * 1000;

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
  };
}

/**
 * Manually reset rate limit for testing/demo purposes.
 */
export function resetUserRateLimit(userId: string): void {
  globalRateLimitMap.delete(userId);
}
