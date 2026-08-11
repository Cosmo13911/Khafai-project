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

export async function GET(req: NextRequest) {
  const userId = req.headers.get("x-user-id") || "google-sub-1029384756";
  const rateLimit = checkRateLimit(userId, "read");
  const user = getUserProfile(userId);
  const logs = getMeterLogs(userId);

  const summary = calculateSummaryData(logs, user.Current_Rate_Per_Unit);
  const monthlyChart = calculateMonthlyChartData(logs);

  return NextResponse.json({
    success: true,
    user,
    logs,
    summary,
    monthlyChart,
    rateLimit,
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

    const created = createMeterLog(userId, {
      Record_Date: body.Record_Date,
      Meter_Reading: Number(body.Meter_Reading),
      Is_New_Meter: Boolean(body.Is_New_Meter),
    });

    const updatedLogs = getMeterLogs(userId);
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
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to create log";
    return NextResponse.json(
      { success: false, error: errMessage, rateLimit },
      { status: 400 }
    );
  }
}
