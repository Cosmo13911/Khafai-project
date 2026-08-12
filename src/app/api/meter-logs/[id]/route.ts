import { NextRequest, NextResponse } from "next/server";
import {
  getMeterLogs,
  updateMeterLog,
  deleteMeterLog,
  getUserProfile,
  syncMeterLogsFromGas,
} from "@/lib/database";
import { checkRateLimit } from "@/lib/rate-limiter";
import {
  calculateSummaryData,
  calculateMonthlyChartData,
  validateMeterReadingRange,
  checkDeleteProtection,
} from "@/lib/khafai-engine";
import { callGasApi } from "@/lib/gas-client";
import { MeterLog } from "@/types";

interface GasResponse {
  success?: boolean;
  logs?: MeterLog[];
  error?: string;
  message?: string;
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: logId } = await params;
  const userEmail = req.headers.get("x-user-email") || "";
  const userId = req.headers.get("x-user-id") || userEmail || "";
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

    // Fast local optimistic update
    let updated = updateMeterLog(userId, logId, body);
    let updatedLogs = getMeterLogs(userId);
    let updatedUser = getUserProfile(userId);
    let isGasConnected = false;

    // Synchronous call to GAS Web App
    try {
      const gasRes = await callGasApi<GasResponse>("updateMeterLog", userId, {
        log_id: logId,
        Log_ID: logId,
        Record_Date: body.Record_Date,
        Meter_Reading: body.Meter_Reading,
        Is_New_Meter: body.Is_New_Meter,
      });

      if (gasRes?.success && Array.isArray(gasRes.logs)) {
        isGasConnected = true;
        updatedLogs = syncMeterLogsFromGas(userId, gasRes.logs);
        const match = updatedLogs.find((l) => l.Log_ID === logId);
        if (match) updated = match;
      }
    } catch (err) {
      console.warn("GAS update error in PUT:", err);
    }

    const summary = calculateSummaryData(updatedLogs, updatedUser.Current_Rate_Per_Unit);
    const monthlyChart = calculateMonthlyChartData(updatedLogs);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      log: updated,
      logs: updatedLogs,
      summary,
      monthlyChart,
      rateLimit,
      isGasConnected,
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
  const userEmail = req.headers.get("x-user-email") || "";
  const userId = req.headers.get("x-user-id") || userEmail || "";
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

    // Fast local optimistic delete
    deleteMeterLog(userId, logId);
    let updatedLogs = getMeterLogs(userId);
    let updatedUser = getUserProfile(userId);
    let isGasConnected = false;

    // Synchronous call to GAS Web App
    try {
      const gasRes = await callGasApi<GasResponse>("deleteMeterLog", userId, {
        log_id: logId,
        Log_ID: logId,
      });

      if (gasRes?.success && Array.isArray(gasRes.logs)) {
        isGasConnected = true;
        updatedLogs = syncMeterLogsFromGas(userId, gasRes.logs);
      }
    } catch (err) {
      console.warn("GAS delete error in DELETE:", err);
    }

    const summary = calculateSummaryData(updatedLogs, updatedUser.Current_Rate_Per_Unit);
    const monthlyChart = calculateMonthlyChartData(updatedLogs);

    return NextResponse.json({
      success: true,
      user: updatedUser,
      logs: updatedLogs,
      summary,
      monthlyChart,
      rateLimit,
      isGasConnected,
    });
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to delete log";
    return NextResponse.json(
      { success: false, error: errMessage, rateLimit },
      { status: 400 }
    );
  }
}
