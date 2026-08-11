import { NextRequest, NextResponse } from "next/server";
import {
  getMeterLogs,
  createMeterLog,
  getUserProfile,
} from "@/lib/database";
import { checkRateLimit } from "@/lib/rate-limiter";
import {
  calculateSummaryData,
  calculateMonthlyChartData,
  validateMeterReadingRange,
} from "@/lib/khafai-engine";
import { callGasApi } from "@/lib/gas-client";
import { MeterLog, UserProfile } from "@/types";

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "google-sub-1029384756";
  const rateLimit = checkRateLimit(userId, "read");

  // Attempt live sync with Google Apps Script Web App API
  const gasResponse = await callGasApi<{
    success: boolean;
    user?: UserProfile;
    logs?: MeterLog[];
  }>("getMeterLogs", userId);

  let user = getUserProfile(userId);
  let logs = getMeterLogs(userId);

  if (gasResponse && gasResponse.success && gasResponse.logs) {
    logs = gasResponse.logs;
    if (gasResponse.user) {
      user = gasResponse.user;
    }
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
    isGasConnected: !!gasResponse?.success,
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

    // Call live GAS API
    const gasResponse = await callGasApi<{
      success: boolean;
      logs?: MeterLog[];
      message?: string;
    }>("createMeterLog", userId, {
      Record_Date: body.Record_Date,
      Meter_Reading: body.Meter_Reading,
      Is_New_Meter: body.Is_New_Meter,
    });

    const created = createMeterLog(userId, {
      Record_Date: body.Record_Date,
      Meter_Reading: Number(body.Meter_Reading),
      Is_New_Meter: Boolean(body.Is_New_Meter),
    });

    let updatedLogs = getMeterLogs(userId);
    if (gasResponse && gasResponse.success && gasResponse.logs) {
      updatedLogs = gasResponse.logs;
    }

    const user = getUserProfile(userId);
    const summary = calculateSummaryData(updatedLogs, user.Current_Rate_Per_Unit);
    const monthlyChart = calculateMonthlyChartData(updatedLogs);

    return NextResponse.json({
      success: true,
      log: created,
      logs: updatedLogs,
      summary,
      monthlyChart,
      rateLimit,
      isGasConnected: !!gasResponse?.success,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to create log";
    return NextResponse.json(
      { success: false, error: errMessage, rateLimit },
      { status: 400 }
    );
  }
}
