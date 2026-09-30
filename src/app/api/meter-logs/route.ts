import { NextRequest, NextResponse } from "next/server";
import {
  getMeterLogs,
  createMeterLog,
  getUserProfile,
  syncUserProfileFromGas,
  syncMeterLogsFromGas,
} from "@/lib/database";
import { checkRateLimit } from "@/lib/rate-limiter";
import {
  calculateSummaryData,
  calculateMonthlyChartData,
  validateMeterReadingRange,
} from "@/lib/khafai-engine";
import { callGasApi } from "@/lib/gas-client";
import { verifyServerAuth, verifyCsrfOrigin } from "@/lib/auth-server";
import { getServerCache, setServerCache, invalidateServerCache } from "@/lib/server-cache";
import { MeterLog, UserProfile } from "@/types";

interface GasResponse {
  success?: boolean;
  user?: UserProfile;
  logs?: MeterLog[];
  error?: string;
  message?: string;
}

export async function GET(req: NextRequest) {
  // 1. Server-Side Authentication & Token Verification
  const authUser = await verifyServerAuth(req);
  if (!authUser) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
      { status: 401 }
    );
  }

  const { userId, email: userEmail, name: userName, picture: userPicture } = authUser;
  const rateLimit = checkRateLimit(userId, "read");

  // 2. High-Speed Server Cache Layer (< 15ms response)
  const cacheKey = `user_data_${userId}`;
  const cachedData = getServerCache<Record<string, unknown>>(cacheKey);
  if (cachedData) {
    return NextResponse.json({
      ...cachedData,
      rateLimit,
      fromCache: true,
    });
  }

  let user = getUserProfile(userId, userEmail, userName, userPicture);
  let logs = getMeterLogs(userId);
  let isGasConnected = false;

  // Await real database fetch from Google Apps Script Web App
  try {
    const gasRes = await callGasApi<GasResponse>("getMeterLogs", userId, {
      Email: userEmail,
      email: userEmail,
      Name: userName,
      name: userName,
      Picture: userPicture,
      picture: userPicture,
    });
    if (gasRes?.success) {
      isGasConnected = true;
      if (gasRes.user) {
        user = syncUserProfileFromGas(userId, gasRes.user, userEmail, userName, userPicture);
      }
      if (Array.isArray(gasRes.logs)) {
        logs = syncMeterLogsFromGas(userId, gasRes.logs);
      }
    }
  } catch (err) {
    console.warn("GAS fetch error in GET:", err);
  }

  const summary = calculateSummaryData(logs, user.Current_Rate_Per_Unit);
  const monthlyChart = calculateMonthlyChartData(logs);

  const responsePayload = {
    success: true,
    user,
    logs,
    summary,
    monthlyChart,
    rateLimit,
    isGasConnected,
  };

  // Only cache in server memory if GAS connected successfully
  if (isGasConnected) {
    setServerCache(cacheKey, responsePayload, 60);
  }

  return NextResponse.json(responsePayload);
}

export async function POST(req: NextRequest) {
  // 1. CSRF Protection for mutating requests
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "CSRF_FORBIDDEN", message: "Invalid request origin" },
      { status: 403 }
    );
  }

  // 2. Server-Side Authentication & Token Verification
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
        message: "ระบบถูกระงับชั่วคราว กรุณาลองใหม่ภายหลัง",
        rateLimit,
      },
      { status: 429 }
    );
  }

  try {
    const body = await req.json();
    const existingLogs = getMeterLogs(userId);

    // Range Validation check
    const validation = validateMeterReadingRange(
      existingLogs,
      Number(body.Meter_Reading),
      body.Record_Date,
      Boolean(body.Is_New_Meter)
    );

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: "RANGE_VALIDATION_FAILED",
          message: validation.errorMessage,
          validation,
          rateLimit,
        },
        { status: 400 }
      );
    }

    // Invalidate server cache on mutation
    invalidateServerCache(`user_data_${userId}`);

    // Fast optimistic local creation
    let created = createMeterLog(userId, {
      Record_Date: body.Record_Date,
      Meter_Reading: Number(body.Meter_Reading),
      Is_New_Meter: Boolean(body.Is_New_Meter),
    });

    let updatedLogs = getMeterLogs(userId);
    let updatedUser = getUserProfile(userId, userEmail, userName, userPicture);
    let isGasConnected = false;

    // Direct synchronous call to Google Apps Script Web App database
    try {
      const gasRes = await callGasApi<GasResponse>("createMeterLog", userId, {
        Record_Date: body.Record_Date,
        Meter_Reading: body.Meter_Reading,
        Is_New_Meter: body.Is_New_Meter,
        Email: userEmail,
        email: userEmail,
        Name: userName,
        name: userName,
        Picture: userPicture,
        picture: userPicture,
      });

      if (gasRes?.success && Array.isArray(gasRes.logs)) {
        isGasConnected = true;
        updatedLogs = syncMeterLogsFromGas(userId, gasRes.logs);
        const match = updatedLogs.find((l) => l.Record_Date === body.Record_Date);
        if (match) created = match;
      }
    } catch (err) {
      console.warn("GAS create error in POST:", err);
    }

    const summary = calculateSummaryData(updatedLogs, updatedUser.Current_Rate_Per_Unit);
    const monthlyChart = calculateMonthlyChartData(updatedLogs);

    const responsePayload = {
      success: true,
      user: updatedUser,
      log: created,
      logs: updatedLogs,
      summary,
      monthlyChart,
      rateLimit,
      isGasConnected,
    };

    // Re-prime fresh server cache
    setServerCache(`user_data_${userId}`, responsePayload, 60);

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to create log";
    return NextResponse.json(
      { success: false, error: errMessage, rateLimit },
      { status: 400 }
    );
  }
}
