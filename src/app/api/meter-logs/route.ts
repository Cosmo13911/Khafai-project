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
import { MeterLog, UserProfile } from "@/types";

interface GasResponse {
  success?: boolean;
  user?: UserProfile;
  logs?: MeterLog[];
  error?: string;
  message?: string;
}

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "google-sub-1029384756";
  const rateLimit = checkRateLimit(userId, "read");

  let user = getUserProfile(userId);
  let logs = getMeterLogs(userId);
  let isGasConnected = false;

  // Await real database fetch from Google Apps Script Web App
  try {
    const gasRes = await callGasApi<GasResponse>("getMeterLogs", userId);
    if (gasRes?.success) {
      isGasConnected = true;
      if (gasRes.user) {
        user = syncUserProfileFromGas(userId, gasRes.user);
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

  return NextResponse.json({
    success: true,
    user,
    logs,
    summary,
    monthlyChart,
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

    // Fast optimistic local creation
    let created = createMeterLog(userId, {
      Record_Date: body.Record_Date,
      Meter_Reading: Number(body.Meter_Reading),
      Is_New_Meter: Boolean(body.Is_New_Meter),
    });

    let updatedLogs = getMeterLogs(userId);
    let updatedUser = getUserProfile(userId);
    let isGasConnected = false;

    // Direct synchronous call to Google Apps Script Web App database
    try {
      const gasRes = await callGasApi<GasResponse>("createMeterLog", userId, {
        Record_Date: body.Record_Date,
        Meter_Reading: body.Meter_Reading,
        Is_New_Meter: body.Is_New_Meter,
      });

      if (gasRes?.success && Array.isArray(gasRes.logs)) {
        isGasConnected = true;
        updatedLogs = syncMeterLogsFromGas(userId, gasRes.logs);
        const match = updatedLogs.find(
          (l) => l.Record_Date === body.Record_Date && l.Meter_Reading === Number(body.Meter_Reading)
        );
        if (match) created = match;
      }
    } catch (err) {
      console.warn("GAS save error in POST:", err);
    }

    const summary = calculateSummaryData(updatedLogs, updatedUser.Current_Rate_Per_Unit);
    const monthlyChart = calculateMonthlyChartData(updatedLogs);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      log: created,
      logs: updatedLogs,
      summary,
      monthlyChart,
      rateLimit,
      isGasConnected,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to create log";
    return NextResponse.json(
      { success: false, error: errMessage, rateLimit },
      { status: 400 }
    );
  }
}
