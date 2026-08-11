"use client";

import React, { useState } from "react";
import { FlaskConical, X, Play, Loader2, CheckCircle2, AlertCircle, RefreshCw, Send } from "lucide-react";
import { UserProfile } from "@/types";

interface TestApiModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onRefreshDashboard: () => Promise<void>;
}

export const TestApiModal: React.FC<TestApiModalProps> = ({
  isOpen,
  onClose,
  user,
  onRefreshDashboard,
}) => {
  const [activeTab, setActiveTab] = useState<"preset" | "custom">("preset");
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [lastResponse, setLastResponse] = useState<{
    status: number;
    url: string;
    method: string;
    data: unknown;
  } | null>(null);

  // Custom runner state
  const [customAction, setCustomAction] = useState<string>("createMeterLog");
  const [customDate, setCustomDate] = useState<string>("2026-08-15");
  const [customReading, setCustomReading] = useState<string>("2250");
  const [customIsNewMeter, setCustomIsNewMeter] = useState<boolean>(false);

  if (!isOpen) return null;

  const executeApiCall = async (
    url: string,
    method: string,
    body?: Record<string, unknown>
  ) => {
    setIsRunning(true);
    setLastResponse(null);

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.User_ID,
        },
        body: body ? JSON.stringify(body) : undefined,
      });

      const json = await res.json();
      setLastResponse({
        status: res.status,
        url,
        method,
        data: json,
      });

      // Refresh dashboard state
      await onRefreshDashboard();
    } catch (err: unknown) {
      const errMessage = err instanceof Error ? err.message : String(err);
      setLastResponse({
        status: 500,
        url,
        method,
        data: { error: "FETCH_FAILED", message: errMessage },
      });
    } finally {
      setIsRunning(false);
    }
  };

  // Preset 1: Seed 3 mockup logs
  const handleSeedMockupData = async () => {
    setIsRunning(true);
    const mockEntries = [
      { Record_Date: "2026-06-15", Meter_Reading: 1750, Is_New_Meter: false },
      { Record_Date: "2026-07-15", Meter_Reading: 1920, Is_New_Meter: false },
      { Record_Date: "2026-08-10", Meter_Reading: 2100, Is_New_Meter: false },
    ];

    let lastResStatus = 200;
    let lastData = null;

    for (const entry of mockEntries) {
      const res = await fetch("/api/meter-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.User_ID,
        },
        body: JSON.stringify(entry),
      });
      lastResStatus = res.status;
      lastData = await res.json();
    }

    setLastResponse({
      status: lastResStatus,
      url: "/api/meter-logs (POST Batch x3)",
      method: "POST",
      data: lastData,
    });

    await onRefreshDashboard();
    setIsRunning(false);
  };

  // Preset 2: Spam test (Trigger 4 rapid requests to trigger 1-hour rate limit lock)
  const handleTestSpamRateLimit = async () => {
    setIsRunning(true);
    let lastResStatus = 200;
    let lastData = null;

    for (let i = 0; i < 4; i++) {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": user.User_ID,
        },
        body: JSON.stringify({ Email: user.Email }),
      });
      lastResStatus = res.status;
      lastData = await res.json();
    }

    setLastResponse({
      status: lastResStatus,
      url: "/api/user (Spam x4)",
      method: "POST",
      data: lastData,
    });

    await onRefreshDashboard();
    setIsRunning(false);
  };

  // Preset 3: Update tariff rate to 9.50 THB
  const handleTestTariffUpdate = async () => {
    await executeApiCall("/api/user", "POST", { Current_Rate_Per_Unit: 9.5 });
  };

  // Custom runner
  const handleRunCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (customAction === "createMeterLog") {
      await executeApiCall("/api/meter-logs", "POST", {
        Record_Date: customDate,
        Meter_Reading: parseFloat(customReading),
        Is_New_Meter: customIsNewMeter,
      });
    } else if (customAction === "getUser") {
      await executeApiCall("/api/user", "GET");
    } else if (customAction === "getMeterLogs") {
      await executeApiCall("/api/meter-logs", "GET");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 relative max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shadow-xs">
              <FlaskConical className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">
                เครื่องมือทดสอบยิง API (Test API Mockup Console)
              </h3>
              <p className="text-xs text-slate-500">
                ทดสอบยิง Request ไปยัง Next.js Proxy & Google Apps Script API
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isRunning}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Tabs */}
        <div className="flex space-x-2 mt-4 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab("preset")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "preset"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            ชุดทดสอบสำเร็จรูป (Preset Actions)
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "custom"
                ? "bg-purple-600 text-white shadow-xs"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            กำหนดค่าเอง (Custom Request)
          </button>
        </div>

        {/* Tab 1: Preset Actions */}
        {activeTab === "preset" && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Button 1: Seed 3 mockup entries */}
            <button
              onClick={handleSeedMockupData}
              disabled={isRunning}
              className="bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 p-4 rounded-2xl text-left space-y-1.5 transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 group-hover:text-purple-700">
                  1. ยิงข้อมูลจำลอง 3 รายการ
                </span>
                <Play className="w-4 h-4 text-purple-600" />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                สร้างบันทึกมิเตอร์ย้อนหลังเดือน 6, 7, 8 เพื่อทดสอบคำนวณหน่วยและกราฟ
              </p>
            </button>

            {/* Button 2: Test Tariff Recalculation */}
            <button
              onClick={handleTestTariffUpdate}
              disabled={isRunning}
              className="bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 p-4 rounded-2xl text-left space-y-1.5 transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">
                  2. ทดสอบปรับค่าไฟเป็น ฿9.50
                </span>
                <RefreshCw className="w-4 h-4 text-blue-600" />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ทดสอบ Tariff Update Strategy recalculate ย้อนหลังทั้งหมด
              </p>
            </button>

            {/* Button 3: Test Spam Rate Limit */}
            <button
              onClick={handleTestSpamRateLimit}
              disabled={isRunning}
              className="bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 p-4 rounded-2xl text-left space-y-1.5 transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 group-hover:text-rose-700">
                  3. ทดสอบยิงสแปม (Rate Limit)
                </span>
                <AlertCircle className="w-4 h-4 text-rose-600" />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ยิง Request 4 ครั้งติดกัน เพื่อทดสอบการล็อกระบบ Anti-Abuse 1 ชั่วโมง
              </p>
            </button>

            {/* Button 4: Fetch Latest Logs */}
            <button
              onClick={() => executeApiCall("/api/meter-logs", "GET")}
              disabled={isRunning}
              className="bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 p-4 rounded-2xl text-left space-y-1.5 transition-all cursor-pointer group disabled:opacity-50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700">
                  4. ดึงข้อมูลล่าสุด (GET API)
                </span>
                <Send className="w-4 h-4 text-emerald-600" />
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                ทดสอบดึงข้อมูลล่าสุดจาก Next.js API Proxy & Google Sheets
              </p>
            </button>
          </div>
        )}

        {/* Tab 2: Custom Request */}
        {activeTab === "custom" && (
          <form onSubmit={handleRunCustom} className="mt-4 space-y-3 text-left">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">เลือก Action</label>
              <select
                value={customAction}
                onChange={(e) => setCustomAction(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 text-xs font-semibold focus:outline-hidden"
              >
                <option value="createMeterLog">POST /api/meter-logs (เพิ่มมิเตอร์)</option>
                <option value="getMeterLogs">GET /api/meter-logs (ดึงรายการ)</option>
                <option value="getUser">GET /api/user (ดึงผู้ใช้)</option>
              </select>
            </div>

            {customAction === "createMeterLog" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Record_Date</label>
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => setCustomDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Meter_Reading</label>
                  <input
                    type="number"
                    value={customReading}
                    onChange={(e) => setCustomReading(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold"
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <input
                    id="custom-is-new"
                    type="checkbox"
                    checked={customIsNewMeter}
                    onChange={(e) => setCustomIsNewMeter(e.target.checked)}
                    className="w-4 h-4 text-purple-600 rounded-sm"
                  />
                  <label htmlFor="custom-is-new" className="text-xs font-semibold text-slate-800 cursor-pointer">
                    Is_New_Meter = true (เริ่มรอบมิเตอร์ใหม่)
                  </label>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isRunning}
              className="w-full flex items-center justify-center space-x-2 py-3 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer min-h-[44px]"
            >
              {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
              <span>ยิงคำขอ API (Send Request)</span>
            </button>
          </form>
        )}

        {/* API Response JSON Console Box */}
        <div className="mt-5 text-left">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              API Response Output
            </span>
            {lastResponse && (
              <span
                className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded-full ${
                  lastResponse.status >= 200 && lastResponse.status < 300
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                HTTP {lastResponse.status} ({lastResponse.method})
              </span>
            )}
          </div>

          <div className="bg-slate-900 text-slate-100 rounded-2xl p-4 font-mono text-xs overflow-x-auto max-h-56 border border-slate-800">
            {isRunning ? (
              <div className="flex items-center space-x-2 text-purple-400">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>กำลังยิงคำขอไปยังเซิร์ฟเวอร์...</span>
              </div>
            ) : lastResponse ? (
              <pre>{JSON.stringify(lastResponse.data, null, 2)}</pre>
            ) : (
              <span className="text-slate-500">กดปุ่มทดสอบด้านบนเพื่อดูผลลัพธ์ JSON Response</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
