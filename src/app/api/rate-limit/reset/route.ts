import { NextRequest, NextResponse } from "next/server";
import { resetUserRateLimit } from "@/lib/rate-limiter";
import { resetUserDatabase } from "@/lib/database";

export async function POST(req: NextRequest) {
  const userEmail = req.headers.get("x-user-email") || "";
  const userId = req.headers.get("x-user-id") || userEmail || "";
  
  try {
    const body = await req.json().catch(() => ({}));
    resetUserRateLimit(userId);

    if (body.resetData) {
      resetUserDatabase(userId);
    }

    return NextResponse.json({
      success: true,
      message: "Rate limit and user state reset successfully.",
    });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to reset" },
      { status: 500 }
    );
  }
}
