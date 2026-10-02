import { NextRequest, NextResponse } from "next/server";
import { resetUserRateLimit } from "@/lib/rate-limiter";
import { resetUserDatabase } from "@/lib/database";
import { verifyServerAuth, verifyCsrfOrigin } from "@/lib/auth-server";
import { invalidateServerCache } from "@/lib/server-cache";

export async function POST(req: NextRequest) {
  if (!verifyCsrfOrigin(req)) {
    return NextResponse.json(
      { success: false, error: "CSRF_FORBIDDEN", message: "Invalid request origin" },
      { status: 403 }
    );
  }

  const authUser = await verifyServerAuth(req);
  if (!authUser) {
    return NextResponse.json(
      { success: false, error: "UNAUTHORIZED", message: "กรุณาเข้าสู่ระบบก่อนดำเนินการ" },
      { status: 401 }
    );
  }

  const { userId } = authUser;
  
  try {
    const body = await req.json().catch(() => ({}));
    resetUserRateLimit(userId);

    if (body.resetData) {
      resetUserDatabase(userId);
      invalidateServerCache(`user_data_${userId}`);
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
