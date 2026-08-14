"use client";

import React, { memo, useState, useMemo } from "react";
import {
  ResponsiveContainer,
  ComposedChart,
  AreaChart,
  Bar,
  Area,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { MonthlyChartData } from "@/types";
import {
  BarChart3,
  TrendingUp,
  Zap,
  Banknote,
  Layers,
} from "lucide-react";

export type ChartMetricView = "dual" | "cost" | "units";

interface MonthlyTrendChartProps {
  data: MonthlyChartData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    payload: MonthlyChartData & {
      prevCost?: number;
      prevUnits?: number;
      costChangePct?: number | null;
      unitsChangePct?: number | null;
    };
  }>;
  label?: string;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    const effectiveRate = item.totalUnits > 0 ? (item.totalCost / item.totalUnits).toFixed(2) : "-";

    return (
      <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-2xl p-3.5 sm:p-4 shadow-2xl border border-slate-700/80 space-y-2 min-w-[200px] animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-700/70 pb-1.5">
          <span className="font-bold text-slate-100 text-xs sm:text-sm">
            เดือน {item.monthName}
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium border border-slate-700">
            {item.logCount} บันทึก
          </span>
        </div>

        <div className="space-y-1.5">
          {/* Total Cost */}
          <div className="flex items-center justify-between">
            <span className="flex items-center text-slate-300 text-[11px] sm:text-xs">
              <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5 inline-block shrink-0 shadow-xs" />
              ยอดค่าไฟ:
            </span>
            <span className="font-bold text-blue-400 font-mono text-xs">
              ฿{item.totalCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          {/* Total Units */}
          <div className="flex items-center justify-between">
            <span className="flex items-center text-slate-300 text-[11px] sm:text-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 inline-block shrink-0 shadow-xs" />
              หน่วยที่ใช้:
            </span>
            <span className="font-bold text-emerald-400 font-mono text-xs">
              {item.totalUnits.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh
            </span>
          </div>

          {/* Effective Rate */}
          {effectiveRate !== "-" && (
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] text-slate-400 pt-1 border-t border-slate-800">
              <span>อัตราเฉลี่ย:</span>
              <span className="font-medium text-slate-300 font-mono">฿{effectiveRate} /หน่วย</span>
            </div>
          )}

          {/* MoM Comparison */}
          {item.costChangePct !== undefined && item.costChangePct !== null && (
            <div className="flex items-center justify-between text-[10px] sm:text-[11px] pt-0.5 text-slate-400">
              <span>เทียบเดือนก่อน:</span>
              <span
                className={`font-bold font-mono ${
                  item.costChangePct > 0
                    ? "text-rose-400"
                    : item.costChangePct < 0
                    ? "text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {item.costChangePct > 0 ? `+${item.costChangePct}%` : `${item.costChangePct}%`}
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }
  return null;
};

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = memo(({ data }) => {
  const [metricView, setMetricView] = useState<ChartMetricView>("dual");

  // Enrich data with MoM comparison
  const enrichedData = useMemo(() => {
    return data.map((item, index) => {
      let prevCost: number | undefined = undefined;
      let prevUnits: number | undefined = undefined;
      let costChangePct: number | null = null;
      let unitsChangePct: number | null = null;

      if (index > 0) {
        const prev = data[index - 1];
        prevCost = prev.totalCost;
        prevUnits = prev.totalUnits;

        if (prevCost > 0) {
          costChangePct = Number((((item.totalCost - prevCost) / prevCost) * 100).toFixed(1));
        } else if (item.totalCost > 0 && prevCost === 0) {
          costChangePct = 100;
        }

        if (prevUnits > 0) {
          unitsChangePct = Number((((item.totalUnits - prevUnits) / prevUnits) * 100).toFixed(1));
        } else if (item.totalUnits > 0 && prevUnits === 0) {
          unitsChangePct = 100;
        }
      }

      return {
        ...item,
        prevCost,
        prevUnits,
        costChangePct,
        unitsChangePct,
      };
    });
  }, [data]);

  // Mini Summary Metrics
  const stats = useMemo(() => {
    const active = data.filter((d) => d.totalUnits > 0 || d.totalCost > 0);
    if (active.length === 0) {
      return { avgUnits: 0, avgCost: 0, maxCost: 0, maxMonth: "-" };
    }

    const totalUnits = active.reduce((acc, cur) => acc + cur.totalUnits, 0);
    const totalCost = active.reduce((acc, cur) => acc + cur.totalCost, 0);
    const avgUnits = totalUnits / active.length;
    const avgCost = totalCost / active.length;

    let maxCost = 0;
    let maxMonth = "-";
    active.forEach((d) => {
      if (d.totalCost > maxCost) {
        maxCost = d.totalCost;
        maxMonth = d.monthName;
      }
    });

    return {
      avgUnits: Number(avgUnits.toFixed(1)),
      avgCost: Number(avgCost.toFixed(2)),
      maxCost: Number(maxCost.toFixed(2)),
      maxMonth,
    };
  }, [data]);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col h-full justify-between transition-all duration-300">
      {/* Top Header & Interactive Segmented Controls */}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 sm:pb-3 border-b border-slate-100">
          {/* Title & Icon */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
              <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate">วิเคราะห์แนวโน้มค่าไฟฟ้า</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 truncate">
                {metricView === "dual"
                  ? "เปรียบเทียบสัดส่วนยอดเงิน (บาท) และหน่วยที่ใช้ (kWh)"
                  : metricView === "cost"
                  ? "สถิติยอดชำระค่าไฟฟ้า (บาท)"
                  : "สถิติปริมาณการใช้ไฟฟ้า (kWh)"}
              </p>
            </div>
          </div>

          {/* Interactive Metric Switcher Tabs (Compact Mobile Padding) */}
          <div className="flex items-center gap-1 p-0.5 sm:p-1 bg-slate-100/90 rounded-xl border border-slate-200/70 shrink-0 ml-auto">
            <button
              onClick={() => setMetricView("dual")}
              className={`flex items-center space-x-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                metricView === "dual"
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="เปรียบเทียบ 2 แกน (ยอดเงิน และ หน่วยไฟ)"
            >
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="hidden sm:inline">เปรียบเทียบ</span>
              <span className="sm:hidden">คู่</span>
            </button>

            <button
              onClick={() => setMetricView("cost")}
              className={`flex items-center space-x-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                metricView === "cost"
                  ? "bg-white text-blue-600 shadow-xs border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="ดูเฉพาะยอดเงิน (บาท)"
            >
              <Banknote className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>ยอดเงิน</span>
            </button>

            <button
              onClick={() => setMetricView("units")}
              className={`flex items-center space-x-1 px-2 py-1 sm:px-2.5 sm:py-1.5 rounded-lg text-[11px] sm:text-xs font-bold transition-all cursor-pointer ${
                metricView === "units"
                  ? "bg-white text-emerald-600 shadow-xs border border-slate-200/50"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="ดูเฉพาะหน่วยไฟ (kWh)"
            >
              <Zap className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span>หน่วยไฟ</span>
            </button>
          </div>
        </div>

        {/* Mini Summary Stats Bar (Refined for Mobile: Short Labels & No Word Breaking) */}
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 my-2.5 sm:my-3 p-2 sm:p-2.5 bg-slate-50/90 rounded-xl border border-slate-200/60 text-xs">
          {/* Stat 1: Avg Units */}
          <div className="flex flex-col min-w-0">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 flex items-center whitespace-nowrap">
              <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 text-emerald-500 shrink-0" />
              ใช้เฉลี่ย
            </span>
            <span className="font-extrabold text-slate-800 font-mono text-xs sm:text-sm mt-0.5 truncate">
              {stats.avgUnits.toLocaleString()} <span className="text-[10px] font-normal text-slate-500">kWh</span>
            </span>
          </div>

          {/* Stat 2: Avg Cost */}
          <div className="flex flex-col min-w-0 border-x border-slate-200/70 px-1.5 sm:px-2.5">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 flex items-center whitespace-nowrap">
              <Banknote className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 text-blue-500 shrink-0" />
              จ่ายเฉลี่ย
            </span>
            <span className="font-extrabold text-slate-800 font-mono text-xs sm:text-sm mt-0.5 truncate">
              ฿{stats.avgCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
            </span>
          </div>

          {/* Stat 3: Peak Month */}
          <div className="flex flex-col min-w-0 pl-1">
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-400 flex items-center whitespace-nowrap">
              <TrendingUp className="w-2.5 h-2.5 sm:w-3 sm:h-3 mr-0.5 text-purple-500 shrink-0" />
              ยอดสูงสุด
            </span>
            <div className="mt-0.5 flex flex-col min-w-0">
              <span className="font-extrabold text-purple-700 font-mono text-xs sm:text-sm truncate leading-tight">
                ฿{stats.maxCost.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
              {stats.maxMonth !== "-" && (
                <span className="text-[9px] sm:text-[10px] font-medium text-slate-400 truncate leading-none mt-0.5">
                  {stats.maxMonth}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Chart Canvas Area (Compact Height on Mobile: h-48 sm:h-64 lg:h-72) */}
      {data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
          <span>ยังไม่มีข้อมูลสถิติรายเดือน</span>
        </div>
      ) : (
        <div className="w-full h-48 sm:h-64 lg:h-72 mt-1 sm:mt-2 animate-in fade-in duration-300 ease-out">
          <ResponsiveContainer width="100%" height="100%">
            {metricView === "dual" ? (
              /* ================= 1. DUAL-AXIS COMPOSED CHART (Cost Bar + Units Area/Line) ================= */
              <ComposedChart data={enrichedData} margin={{ top: 8, right: 4, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientUnits" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="gradientCostBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2563EB" stopOpacity={0.85} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                <XAxis
                  dataKey="monthName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
                />

                {/* Left Axis: Cost (THB) */}
                <YAxis
                  yAxisId="left"
                  width={46}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 9.5, fontWeight: 600 }}
                  tickFormatter={(val) => `฿${Number(val).toLocaleString()}`}
                />

                {/* Right Axis: Units (kWh) */}
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  width={40}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#10b981", fontSize: 9.5, fontWeight: 600 }}
                  tickFormatter={(val) => `${Number(val).toLocaleString()} U`}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />

                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={7}
                  wrapperStyle={{ fontSize: "10px", paddingBottom: "4px" }}
                  formatter={(value) => (
                    <span className="text-slate-600 font-semibold mr-1.5 text-[10px] sm:text-xs">
                      {value === "totalCost" ? "ยอดเงิน (บาท)" : "หน่วยไฟ (kWh)"}
                    </span>
                  )}
                />

                {/* Left Metric: Cost Bars */}
                <Bar
                  yAxisId="left"
                  dataKey="totalCost"
                  name="totalCost"
                  fill="url(#gradientCostBar)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={26}
                  isAnimationActive={true}
                  animationDuration={350}
                />

                {/* Right Metric: Units Smooth Area/Line */}
                <Area
                  yAxisId="right"
                  type="monotone"
                  dataKey="totalUnits"
                  name="totalUnits"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#gradientUnits)"
                  dot={{ r: 2.5, fill: "#10B981", strokeWidth: 1.5, stroke: "#ffffff" }}
                  activeDot={{ r: 4.5, fill: "#059669", stroke: "#ffffff", strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={450}
                />
              </ComposedChart>
            ) : metricView === "cost" ? (
              /* ================= 2. SINGLE COST FOCUS CHART (Bar & Trend Line) ================= */
              <ComposedChart data={enrichedData} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientCostSingle" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.9} />
                    <stop offset="100%" stopColor="#1D4ED8" stopOpacity={0.7} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                <XAxis
                  dataKey="monthName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
                />

                <YAxis
                  width={48}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 9.5 }}
                  tickFormatter={(val) => `฿${Number(val).toLocaleString()}`}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f8fafc" }} />

                <Bar
                  dataKey="totalCost"
                  name="totalCost"
                  fill="url(#gradientCostSingle)"
                  radius={[5, 5, 0, 0]}
                  maxBarSize={28}
                  isAnimationActive={true}
                  animationDuration={350}
                />
                <Line
                  type="monotone"
                  dataKey="totalCost"
                  stroke="#60A5FA"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={false}
                />
              </ComposedChart>
            ) : (
              /* ================= 3. SINGLE UNITS FOCUS CHART (Emerald Area Gradient) ================= */
              <AreaChart data={enrichedData} margin={{ top: 8, right: 6, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradientUnitsOnly" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.02} />
                  </linearGradient>
                </defs>

                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />

                <XAxis
                  dataKey="monthName"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 500 }}
                />

                <YAxis
                  width={44}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 9.5 }}
                  tickFormatter={(val) => `${Number(val).toLocaleString()} U`}
                />

                <Tooltip content={<CustomTooltip />} cursor={{ stroke: "#cbd5e1", strokeDasharray: "3 3" }} />

                <Area
                  type="monotone"
                  dataKey="totalUnits"
                  name="totalUnits"
                  stroke="#059669"
                  strokeWidth={2.5}
                  fill="url(#gradientUnitsOnly)"
                  dot={{ r: 3, fill: "#10B981", stroke: "#ffffff", strokeWidth: 1.5 }}
                  activeDot={{ r: 5, fill: "#047857", stroke: "#ffffff", strokeWidth: 2 }}
                  isAnimationActive={true}
                  animationDuration={400}
                />
              </AreaChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
});

MonthlyTrendChart.displayName = "MonthlyTrendChart";
