import { NextRequest, NextResponse } from "next/server";
import { getUserProfile, updateUserProfile, syncUserProfileFromGas } from "@/lib/database";
import { checkRateLimit } from "@/lib/rate-limiter";
import { callGasApi } from "@/lib/gas-client";
import { verifyServerAuth, verifyCsrfOrigin } from "@/lib/auth-server";
import { invalidateServerCache } from "@/lib/server-cache";
import { UserProfile } from "@/types";

interface GasResponse {
  success?: boolean;
  user?: UserProfile;
}

export async function GET(req: NextRequest) {
  // 1. Server-side Authentication & Token Verification
  const authUser = await verifyServerAuth(req);
  if (!authUser) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
      { status: 401 }
    );
  }

  const { userId, email: userEmail, name: userName, picture: userPicture } = authUser;
  const rateLimit = checkRateLimit(userId, "read");
  let user = getUserProfile(userId, userEmail, userName, userPicture);
  let isGasConnected = false;

  try {
    const gasRes = await callGasApi<GasResponse>("getUser", userId, {
      Email: userEmail,
      email: userEmail,
      Name: userName,
      name: userName,
      Picture: userPicture,
      picture: userPicture,
    });
    if (gasRes?.success && gasRes.user) {
      isGasConnected = true;
      user = syncUserProfileFromGas(userId, gasRes.user, userEmail, userName, userPicture);
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
  // 1. CSRF Protection
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "CSRF_FORBIDDEN", message: "Invalid request origin" },
      { status: 403 }
    );
  }

  // 2. Server-side Authentication & Token Verification
  const authUser = await verifyServerAuth(req);
  if (!authUser) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
      { status: 401 }
    );
  }

  const { userId, email: userEmail, name: userName, picture: userPicture } = authUser;
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

    // Invalidate user data cache when tariff / user profile changes
    invalidateServerCache(`user_data_${userId}`);

    let updatedUser = updateUserProfile(userId, {
      ...body,
      Email: body.Email || userEmail,
      Name: body.Name || userName,
      Picture: body.Picture || userPicture,
    });
    let isGasConnected = false;

    try {
      const gasRes = await callGasApi<GasResponse>("updateUser", userId, {
        Current_Rate_Per_Unit: body.Current_Rate_Per_Unit,
        Email: body.Email || userEmail,
        email: body.Email || userEmail,
        Name: body.Name || userName,
        name: body.Name || userName,
        Picture: body.Picture || userPicture,
        picture: body.Picture || userPicture,
      });

      if (gasRes?.success && gasRes.user) {
        isGasConnected = true;
        updatedUser = syncUserProfileFromGas(userId, gasRes.user, userEmail, userName, userPicture);
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
