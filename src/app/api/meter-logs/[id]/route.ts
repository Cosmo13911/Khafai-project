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
import { verifyServerAuth, verifyCsrfOrigin } from "@/lib/auth-server";
import { invalidateServerCache, setServerCache } from "@/lib/server-cache";
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

  const { id: logId } = await params;
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

    // Invalidate server cache
    invalidateServerCache(`user_data_${userId}`);

    // Fast local optimistic update
    let updated = updateMeterLog(userId, logId, body);
    let updatedLogs = getMeterLogs(userId);
    let updatedUser = getUserProfile(userId, userEmail, userName, userPicture);
    let isGasConnected = false;

    // Synchronous call to GAS Web App
    try {
      const gasRes = await callGasApi<GasResponse>("updateMeterLog", userId, {
        log_id: logId,
        Log_ID: logId,
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
        const match = updatedLogs.find((l) => l.Log_ID === logId);
        if (match) updated = match;
      }
    } catch (err) {
      console.warn("GAS update error in PUT:", err);
    }

    const summary = calculateSummaryData(updatedLogs, updatedUser.Current_Rate_Per_Unit);
    const monthlyChart = calculateMonthlyChartData(updatedLogs);

    const responsePayload = {
      success: true,
      user: updatedUser,
      log: updated,
      logs: updatedLogs,
      summary,
      monthlyChart,
      rateLimit,
      isGasConnected,
    };

    setServerCache(`user_data_${userId}`, responsePayload, 60);

    return NextResponse.json(responsePayload);
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

  const { id: logId } = await params;
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
    const existingLogs = getMeterLogs(userId);

    // Business Logic: Prevent deleting if it would invalidate subsequent cycle calculations
    const deleteCheck = checkDeleteProtection(existingLogs, logId);
    if (!deleteCheck.canDelete) {
      return NextResponse.json(
        {
          success: false,
          error: "DELETE_PROTECTED",
          message: deleteCheck.message || "ไม่สามารถลบข้อมูลนี้ได้เนื่องจากจะกระทบกับการคำนวณในรอบถัดไป",
          rateLimit,
        },
        { status: 400 }
      );
    }

    // Invalidate server cache
    invalidateServerCache(`user_data_${userId}`);

    // Fast local optimistic deletion
    deleteMeterLog(userId, logId);
    let updatedLogs = getMeterLogs(userId);
    let updatedUser = getUserProfile(userId, userEmail, userName, userPicture);
    let isGasConnected = false;

    // Synchronous call to GAS Web App
    try {
      const gasRes = await callGasApi<GasResponse>("deleteMeterLog", userId, {
        log_id: logId,
        Log_ID: logId,
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
      }
    } catch (err) {
      console.warn("GAS delete error in DELETE:", err);
    }

    const summary = calculateSummaryData(updatedLogs, updatedUser.Current_Rate_Per_Unit);
    const monthlyChart = calculateMonthlyChartData(updatedLogs);

    const responsePayload = {
      success: true,
      user: updatedUser,
      logs: updatedLogs,
      summary,
      monthlyChart,
      rateLimit,
      isGasConnected,
    };

    setServerCache(`user_data_${userId}`, responsePayload, 60);

    return NextResponse.json(responsePayload);
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : "Failed to delete log";
    return NextResponse.json(
      { success: false, error: errMessage, rateLimit },
      { status: 400 }
    );
  }
}
