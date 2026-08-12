import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, updateUserProfile, syncUserProfileFromGas } from "@/lib/database";
import { checkRateLimit } from "@/lib/rate-limiter";
import { callGasApi } from "@/lib/gas-client";
import { UserProfile } from "@/types";

interface GasResponse {
  success?: boolean;
  user?: UserProfile;
}

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "google-sub-1029384756";
  const rateLimit = checkRateLimit(userId, "read");
  let user = getUserProfile(userId);
  let isGasConnected = false;

  try {
    const gasRes = await callGasApi<GasResponse>("getUser", userId);
    if (gasRes?.success && gasRes.user) {
      isGasConnected = true;
      user = syncUserProfileFromGas(userId, gasRes.user);
    }
  } catch (err) {
    console.warn("GAS fetch error in user GET:", err);
  }

  return NextResponse.json({
    success: true,
    user,
    rateLimit,
    isGasConnected,
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
    let updatedUser = updateUserProfile(userId, body);
    let isGasConnected = false;

    try {
      const gasRes = await callGasApi<GasResponse>("updateUser", userId, {
        Current_Rate_Per_Unit: body.Current_Rate_Per_Unit,
        Email: body.Email,
      });

      if (gasRes?.success && gasRes.user) {
        isGasConnected = true;
        updatedUser = syncUserProfileFromGas(userId, gasRes.user);
      }
    } catch (err) {
      console.warn("GAS update error in user POST:", err);
    }

    return NextResponse.json({
      success: true,
      user: updatedUser,
      rateLimit,
      isGasConnected,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to update profile";
    return NextResponse.json(
      { success: false, error: errMessage, rateLimit },
      { status: 400 }
    );
  }
}
