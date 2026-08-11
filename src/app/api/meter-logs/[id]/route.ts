import { NextRequest, NextResponse } from "next/server";
import {
  getMeterLogs,
  updateMeterLog,
  deleteMeterLog,
  getUserProfile,
} from "@/lib/database";
import { checkRateLimit } from "@/lib/rate-limiter";
import {
  calculateSummaryData,
  calculateMonthlyChartData,
  validateMeterReadingRange,
  checkDeleteProtection,
} from "@/lib/khafai-engine";
import { callGasApi } from "@/lib/gas-client";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: logId } = await params;
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

    if (body.Meter_Reading !== undefined && body.Record_Date !== undefined) {
      const validation = validateMeterReadingRange(
        existingLogs,
        Number(body.Meter_Reading),
        body.Record_Date,
        Boolean(body.Is_New_Meter),
        logId
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
    }

    // Fast local update < 5ms
    const updated = updateMeterLog(userId, logId, body);
    const updatedLogs = getMeterLogs(userId);
    const updatedUser = getUserProfile(userId);

    const summary = calculateSummaryData(updatedLogs, updatedUser.Current_Rate_Per_Unit);
    const monthlyChart = calculateMonthlyChartData(updatedLogs);

    // Non-blocking background sync
    callGasApi("updateMeterLog", userId, {
      log_id: logId,
      Log_ID: logId,
      Record_Date: body.Record_Date,
      Meter_Reading: body.Meter_Reading,
      Is_New_Meter: body.Is_New_Meter,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      user: updatedUser,
      log: updated,
      logs: updatedLogs,
      summary,
      monthlyChart,
      rateLimit,
      isGasConnected: true,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to update log";
    return NextResponse.json(
      { success: false, error: errMessage, rateLimit },
      { status: 400 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: logId } = await params;
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
    const existingLogs = getMeterLogs(userId);

    // Delete Protection Rule Check
    const deleteCheck = checkDeleteProtection(existingLogs, logId);
    if (!deleteCheck.canDelete) {
      return NextResponse.json(
        {
          success: false,
          error: "DELETE_PROTECTION_TRIGGERED",
          message: deleteCheck.message,
          rateLimit,
        },
        { status: 400 }
      );
    }

    // Fast local delete < 5ms
    deleteMeterLog(userId, logId);
    const updatedLogs = getMeterLogs(userId);
    const updatedUser = getUserProfile(userId);

    const summary = calculateSummaryData(updatedLogs, updatedUser.Current_Rate_Per_Unit);
    const monthlyChart = calculateMonthlyChartData(updatedLogs);

    // Non-blocking background sync
    callGasApi("deleteMeterLog", userId, {
      log_id: logId,
      Log_ID: logId,
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      user: updatedUser,
      logs: updatedLogs,
      summary,
      monthlyChart,
      rateLimit,
      isGasConnected: true,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to delete log";
    return NextResponse.json(
      { success: false, error: errMessage, rateLimit },
      { status: 400 }
    );
  }
}
