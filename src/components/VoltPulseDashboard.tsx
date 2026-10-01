"use client";

import React, { useState, useMemo } from "react";
import {
  Zap,
  TrendingDown,
  TrendingUp,
  Plus,
  Settings,
  Calendar,
  ChevronDown,
  ArrowUpRight,
  Sparkles,
  BarChart3,
  Clock,
  Flame,
  CheckCircle2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  CartesianGrid,
} from "recharts";
import { SummaryData, MonthlyChartData, UserProfile, MeterLog } from "@/types";

interface VoltPulseDashboardProps {
  summary: SummaryData;
  user: UserProfile;
  monthlyChartData?: MonthlyChartData[];
  logs?: MeterLog[];
  onOpenTariffModal?: () => void;
  onOpenAddModal?: () => void;
  onOpenEditModal?: (log: MeterLog) => void;
  onOpenHistory?: () => void;
}

export const VoltPulseDashboard: React.FC<VoltPulseDashboardProps> = ({
  summary,
  user,
  monthlyChartData = [],
  logs = [],
  onOpenTariffModal,
  onOpenAddModal,
  onOpenEditModal,
  onOpenHistory,
}) => {
  // Billing cycle text
  const billCycleText = useMemo(() => {
    const thaiMonths = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `รอบ 1-${lastDay} ${thaiMonths[now.getMonth()]}`;
  }, []);

  // Month and Year in Thai format (e.g. กันยายน 69)
  const currentMonthYearText = useMemo(() => {
    const thaiFullMonths = [
      "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
      "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
    ];
    const now = new Date();
    const month = thaiFullMonths[now.getMonth()];
    const thaiYearShort = ((now.getFullYear() + 543) % 100).toString().padStart(2, "0");
    return `${month} ${thaiYearShort}`;
  }, []);

  const hasLogs = logs && logs.length > 0;
  const isFreshCycle = !hasLogs || (summary?.currentMonthUnits === 0 && summary?.currentMonthCost === 0);

  const currentCost = isFreshCycle ? 0 : (summary?.currentMonthCost ?? 0);
  const currentUnits = isFreshCycle ? 0 : (summary?.currentMonthUnits ?? 0);
  const ratePerUnit = user?.Current_Rate_Per_Unit || 8.0;

  // Daily average
  const now = new Date();
  const daysPassed = Math.max(1, now.getDate());
  const dailyAverageUnits = isFreshCycle ? 0 : Number((currentUnits / daysPassed).toFixed(1));
  const dailyAverageCost = isFreshCycle ? 0 : Number((currentCost / daysPassed).toFixed(1));

  // End of month projected cost
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const projectedMonthCost = isFreshCycle ? 0 : Math.round(dailyAverageCost * daysInMonth);

  // Month-over-Month comparison
  const percentChange = summary?.unitsPercentChange;
  const isSaving = percentChange !== null && percentChange !== undefined && percentChange <= 0;

  // Chart view tab: "cost" vs "units"
  const [metricTab, setMetricTab] = useState<"cost" | "units">("cost");

  // Chart data from monthly logs (or fallback 6 months preview)
  const chartDisplayData = useMemo(() => {
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyChartData && monthlyChartData.length > 0) {
      return monthlyChartData.map((d) => ({
        month: d.monthName,
        cost: Math.round(d.totalCost),
        units: Number(d.totalUnits.toFixed(1)),
        isCurrent: d.monthKey === currentMonthKey,
      }));
    }
    // Fallback if empty
    return [
      { month: "พ.ค.", cost: 890, units: 111.2, isCurrent: false },
      { month: "มิ.ย.", cost: 1120, units: 140.0, isCurrent: false },
      { month: "ก.ค.", cost: 950, units: 118.7, isCurrent: false },
      { month: "ส.ค.", cost: 1350, units: 168.7, isCurrent: false },
      { month: "ก.ย.", cost: currentCost || 1248, units: currentUnits || 156, isCurrent: true },
    ];
  }, [monthlyChartData, currentCost, currentUnits]);

  // Projection details
  const daysRemaining = Math.max(0, daysInMonth - daysPassed);
  const projectedUnits = isFreshCycle ? 0 : Number((dailyAverageUnits * daysInMonth).toFixed(1));
  const remainingEstimatedCost = Math.max(0, projectedMonthCost - currentCost);
  const cycleProgressPct = Math.min(100, Math.round((daysPassed / daysInMonth) * 100));

  return (
    <div className="w-full space-y-4 sm:space-y-6 md:space-y-8 select-none font-sans text-slate-800">
      {/* ================= 1. Top Bar & Title ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight text-slate-900 truncate">
              ภาพรวมการใช้ไฟฟ้า {currentMonthYearText}
            </h1>
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 font-light mt-0.5 leading-relaxed">
            สรุปข้อมูล วิเคราะห์แนวโน้ม และการควบคุมงบประมาณค่าไฟ
          </p>
        </div>

      </div>

      {/* ================= 2. Primary KPI Cards Grid (4 Cards - 2 cols on mobile) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: ค่าไฟเดือนนี้ */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-200 transition-all min-w-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-light tracking-wide text-slate-400 uppercase truncate">
              ค่าไฟสะสมเดือนนี้
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
              <span className="text-xs sm:text-sm font-semibold">฿</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-0.5 sm:space-x-1 overflow-hidden">
              <span className="text-xl sm:text-2xl md:text-3xl font-[300] tracking-tight text-slate-900 tabular-nums truncate">
                ฿{currentCost.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-slate-400 font-light flex flex-wrap items-center gap-1 leading-tight">
              <span className="shrink-0">สิ้นเดือน:</span>
              <span className="font-medium text-slate-700 tabular-nums">~฿{projectedMonthCost.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Card 2: หน่วยไฟฟ้าสะสม */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-200 transition-all min-w-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-light tracking-wide text-slate-400 uppercase truncate">
              หน่วยไฟฟ้าที่ใช้
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-emerald-500/20" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-1 overflow-hidden">
              <span className="text-xl sm:text-2xl md:text-3xl font-[300] tracking-tight text-slate-900 tabular-nums truncate">
                {currentUnits.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-[10px] sm:text-xs font-light text-slate-400 shrink-0">kWh</span>
            </div>
            <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-slate-400 font-light flex flex-wrap items-center gap-1 leading-tight">
              <span className="shrink-0">เฉลี่ย:</span>
              <span className="font-medium text-slate-700 tabular-nums">{dailyAverageUnits} หน่วย/วัน</span>
            </div>
          </div>
        </div>

        {/* Card 3: ค่าเฉลี่ยต่อวัน */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-200 transition-all min-w-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-light tracking-wide text-slate-400 uppercase truncate">
              เฉลี่ยค่าไฟต่อวัน
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-0.5 sm:space-x-1 overflow-hidden">
              <span className="text-xl sm:text-2xl md:text-3xl font-[300] tracking-tight text-slate-900 tabular-nums truncate">
                ฿{dailyAverageCost.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-[10px] sm:text-xs font-light text-slate-400 shrink-0">/วัน</span>
            </div>
            <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-slate-400 font-light flex flex-wrap items-center gap-1 leading-tight">
              <span className="shrink-0">คิดเป็น:</span>
              <span className="font-medium text-slate-700 tabular-nums truncate">~{dailyAverageUnits} kWh/วัน</span>
            </div>
          </div>
        </div>

        {/* Card 4: เทียบเดือนก่อนหน้า */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-200 transition-all min-w-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-light tracking-wide text-slate-400 uppercase truncate">
              เทียบเดือนก่อน
            </span>
            <div
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl flex items-center justify-center shrink-0 ${
                isSaving ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
              }`}
            >
              {isSaving ? (
                <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              ) : (
                <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              )}
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-1 overflow-hidden">
              {percentChange !== null && percentChange !== undefined ? (
                <span
                  className={`text-xl sm:text-2xl md:text-3xl font-[300] tracking-tight tabular-nums truncate ${
                    isSaving ? "text-emerald-600" : "text-amber-600"
                  }`}
                >
                  {percentChange > 0 ? `+${percentChange.toFixed(1)}` : `${percentChange.toFixed(1)}`}%
                </span>
              ) : (
                <span className="text-base sm:text-xl font-light text-slate-400">รอบแรก</span>
              )}
            </div>
            <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] font-light leading-tight truncate">
              {percentChange !== null && percentChange !== undefined ? (
                isSaving ? (
                  <span className="text-emerald-600 font-normal">ประหยัดขึ้น</span>
                ) : (
                  <span className="text-amber-600 font-normal">ใช้เพิ่มขึ้น</span>
                )
              ) : (
                <span className="text-slate-400">เริ่มจดบันทึก</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 3. Main Chart & Split Breakdown ================= */}
      {/* On mobile: Forecast Card is FIRST (order-1), Chart is SECOND (order-2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Right on desktop, Top on mobile: คาดการณ์ค่าไฟสิ้นเดือน (Monthly Cost Projection) */}
        <div className="order-1 lg:order-2 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-sm sm:text-base font-medium text-slate-800">คาดการณ์สิ้นเดือน</h2>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-light">รอบปัจจุบัน</span>
            </div>

            {/* Dominant Highlight Forecast Number */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-100/80 mb-4 sm:mb-5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-light block mb-1">
                ประมาณการค่าไฟทั้งเดือน
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg sm:text-xl font-light text-slate-400">฿</span>
                <span className="text-3xl sm:text-4xl md:text-5xl font-[300] tracking-tight text-slate-900 tabular-nums">
                  {projectedMonthCost.toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-light ml-1">บาท</span>
              </div>
              <div className="mt-1.5 sm:mt-2 text-[11px] text-slate-500 font-light flex items-center justify-between">
                <span>ประมาณการหน่วย:</span>
                <span className="font-medium text-slate-700 tabular-nums">~{projectedUnits.toLocaleString()} kWh</span>
              </div>
            </div>

            {/* Billing Cycle Timeline & Progress Bar */}
            <div className="space-y-1.5 mb-4 sm:mb-5">
              <div className="flex justify-between text-[11px] sm:text-xs text-slate-500 font-light">
                <span>ผ่านมา {daysPassed} วัน</span>
                <span>เหลืออีก {daysRemaining} วัน</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${cycleProgressPct}%` }}
                />
              </div>
            </div>

            {/* Comparison Metrics Breakdown */}
            <div className="space-y-2 pt-1 border-t border-slate-100/80 text-[11px] sm:text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-light">ใช้ไปแล้วปัจจุบัน:</span>
                <span className="font-medium text-slate-800 tabular-nums">
                  ฿{currentCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-light">คาดว่าจะเพิ่มอีกประมาณ:</span>
                <span className="font-medium text-slate-800 tabular-nums">
                  +฿{remainingEstimatedCost.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-light">อัตราเฉลี่ยที่ใช้ประเมิน:</span>
                <span className="font-medium text-slate-700 tabular-nums">
                  ฿{dailyAverageCost.toFixed(1)} /วัน
                </span>
              </div>
            </div>
          </div>

          {/* Smart Tip */}
          <div className="mt-4 sm:mt-5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-2.5">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[10px] sm:text-[11px] text-slate-600 font-light leading-relaxed">
              คำนวณจากพฤติกรรมการใช้ไฟเฉลี่ย {dailyAverageUnits} หน่วย/วัน คูณจำนวนวันของเดือนนี้ ({daysInMonth} วัน)
            </div>
          </div>
        </div>

        {/* Left on desktop, Bottom on mobile: Monthly Trend Chart */}
        <div className="order-2 lg:order-1 lg:col-span-2 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 sm:mb-6">
            <div>
              <h2 className="text-sm sm:text-base md:text-lg font-medium text-slate-800">
                แนวโน้มการใช้ไฟย้อนหลัง
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-light mt-0.5">
                ติดตามพฤติกรรมค่าไฟและหน่วยสะสมในแต่ละเดือน
              </p>
            </div>

            {/* Toggle Metric View (บาท vs หน่วย) */}
            <div className="inline-flex p-1 bg-slate-50 border border-slate-100 rounded-xl self-start sm:self-auto shrink-0">
              <button
                onClick={() => setMetricTab("cost")}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                  metricTab === "cost"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                ยอดเงิน (฿)
              </button>
              <button
                onClick={() => setMetricTab("units")}
                className={`px-2.5 sm:px-3 py-1 rounded-lg text-[11px] sm:text-xs font-medium transition-all cursor-pointer ${
                  metricTab === "units"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                หน่วย (kWh)
              </button>
            </div>
          </div>

          {/* Area Chart Container */}
          <div className="h-56 sm:h-64 md:h-72 w-full pt-1 sm:pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartDisplayData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCost" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="month"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 300 }}
                  dy={6}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 300 }}
                  tickFormatter={(val) => (metricTab === "cost" ? `฿${val}` : `${val}`)}
                />
                <RechartsTooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-slate-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl border border-slate-800 space-y-1">
                          <div className="font-medium text-slate-200 border-b border-slate-800 pb-1">
                            เดือน {data.month}
                          </div>
                          <div className="text-sky-400 flex items-center justify-between gap-3">
                            <span>ยอดค่าไฟ:</span>
                            <span className="font-semibold tabular-nums">฿{data.cost.toLocaleString()}</span>
                          </div>
                          <div className="text-emerald-400 flex items-center justify-between gap-3">
                            <span>หน่วยที่ใช้:</span>
                            <span className="font-semibold tabular-nums">{data.units.toLocaleString()} kWh</span>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {metricTab === "cost" ? (
                  <Area
                    type="monotone"
                    dataKey="cost"
                    stroke="#0ea5e9"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorCost)"
                    activeDot={{ r: 4, fill: "#0ea5e9", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                ) : (
                  <Area
                    type="monotone"
                    dataKey="units"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorUnits)"
                    activeDot={{ r: 4, fill: "#10b981", stroke: "#ffffff", strokeWidth: 2 }}
                  />
                )}
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ================= 4. Recent Logs & History Snippet ================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-3 sm:mb-4">
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-medium text-slate-800 truncate">บันทึกล่าสุด</h2>
            <p className="text-[11px] sm:text-xs text-slate-400 font-light mt-0.5 truncate">
              รายการอ่านเลขมิเตอร์ 3 ครั้งล่าสุด
            </p>
          </div>
          <div className="flex items-center gap-1.5 shrink-0 ml-2">
            {onOpenHistory && (
              <button
                onClick={onOpenHistory}
                aria-label="ดูประวัติและสถิติทั้งหมด"
                title="ดูประวัติและสถิติทั้งหมด"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              >
                <Clock className="w-4 h-4 stroke-[1.8]" />
              </button>
            )}
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                aria-label="เพิ่มรายการจดมิเตอร์"
                title="เพิ่มรายการจดมิเตอร์"
                className="p-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center"
              >
                <Plus className="w-4 h-4 stroke-[2]" />
              </button>
            )}
          </div>
        </div>

        {logs && logs.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
            {[...logs].reverse().slice(0, 3).map((log) => (
              <div
                key={log.Log_ID}
                onClick={() => onOpenEditModal && onOpenEditModal(log)}
                className="p-3 sm:p-4 rounded-xl bg-slate-50/70 hover:bg-slate-100/70 border border-slate-100 transition-all cursor-pointer flex items-center justify-between group min-w-0"
              >
                <div className="min-w-0 mr-2">
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-light">{log.Record_Date}</div>
                  <div className="text-xs sm:text-sm font-normal text-slate-800 mt-0.5 truncate">
                    เลขมิเตอร์ <strong className="font-medium text-slate-900">{log.Meter_Reading.toLocaleString()}</strong>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-xs sm:text-sm font-medium text-slate-900">
                    ฿{(log.Total_Cost || 0).toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
                  </div>
                  <div className="text-[10px] sm:text-[11px] text-slate-400 font-light">
                    +{(log.Units_Used || 0).toFixed(1)} หน่วย
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-6 sm:py-8 text-center text-xs text-slate-400 font-light">
            ยังไม่มีบันทึกข้อมูลย้อนหลัง แตะ &quot;จดเลขมิเตอร์&quot; เพื่อเริ่มต้นการบันทึก
          </div>
        )}
      </div>
    </div>
  );
};
