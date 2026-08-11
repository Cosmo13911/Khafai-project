import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, updateUserProfile } from "@/lib/database";
import { checkRateLimit } from "@/lib/rate-limiter";
import { callGasApi } from "@/lib/gas-client";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "google-sub-1029384756";
  const rateLimit = checkRateLimit(userId, "read");
  const user = getUserProfile(userId);

  // Background non-blocking sync
  callGasApi("getUser", userId).catch(() => {});

  return NextResponse.json({
    success: true,
    user,
    rateLimit,
    isGasConnected: true,
  });
}

export async function POST(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "google-sub-1029384756";
  const rateLimit = checkRateLimit(userId, "write");

  if (rateLimit.isLocked) {
    return NextResponse.json(
      {
        success: false,
        error: "ACCOUNT_LOCKED",
        message: "ระบบถูกระงับชั่วคราว กรุณาลองใหม่ในอีกกี่นาที",
        rateLimit,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const updatedUser = updateUserProfile(userId, body);

    // Non-blocking background sync
    callGasApi("updateUser", userId, {
      Current_Rate_Per_Unit: body.Current_Rate_Per_Unit,
      Email: body.Email,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      user: updatedUser,
      rateLimit,
      isGasConnected: true,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json(
      { success: false, error: errMessage, rateLimit },
      { status: 400 }
    );
  }
}
