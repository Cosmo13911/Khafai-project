"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  Tooltip,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownLeft,
  MoreVertical,
  Search,
  Zap,
  TrendingUp,
  CreditCard,
  Tv,
  Wifi,
  Sparkles,
  ShoppingBag,
  ExternalLink,
} from "lucide-react";
import { SummaryData, MonthlyChartData, UserProfile, MeterLog } from "@/types";

interface DarkLoudDashboardProps {
  summary: SummaryData;
  user: UserProfile;
  monthlyChartData?: MonthlyChartData[];
  logs?: MeterLog[];
  onOpenTariffModal?: () => void;
  onOpenAddModal?: () => void;
}

export const DarkLoudDashboard: React.FC<DarkLoudDashboardProps> = ({
  summary,
  user,
  monthlyChartData = [],
  logs = [],
  onOpenTariffModal,
  onOpenAddModal,
}) => {
  const [timeRange, setTimeRange] = useState<"week" | "month" | "year">("month");

  // Chart data for Analytics Sparkline / Spline comparison
  const splineData = useMemo(() => {
    return [
      { month: "Mar", value1: 3200, value2: 2400 },
      { month: "Apr", value1: 4100, value2: 3100 },
      { month: "May", value1: 7968, value2: 5957 },
      { month: "Jun", value1: 5200, value2: 4800 },
      { month: "Jul", value1: 6800, value2: 5600 },
      { month: "Aug", value1: 7400, value2: 6200 },
    ];
  }, []);

  // 6x7 Activity Grid (Heatmap matrix like GitHub/Loud dashboard)
  const heatmapData = useMemo(() => {
    // 6 time slots (1pm - 6pm), 7 days (Mon-Sun)
    return [
      // 1pm
      [1, 1, 2, 3, 2, 1, 1],
      // 2pm
      [1, 2, 4, 3, 4, 2, 1],
      // 3pm
      [2, 4, 3, 5, 4, 3, 2],
      // 4pm
      [2, 3, 4, 5, 3, 2, 1],
      // 5pm
      [1, 2, 3, 4, 5, 2, 1],
      // 6pm
      [1, 1, 2, 3, 2, 1, 1],
    ];
  }, []);

  // Intensity color map for heatmap
  const getCellBg = (level: number) => {
    switch (level) {
      case 5:
        return "bg-[#8B5CF6]"; // bright purple
      case 4:
        return "bg-[#7C3AED]"; // medium purple
      case 3:
        return "bg-[#6D28D9]"; // deep purple
      case 2:
        return "bg-[#4C1D95]/70"; // dark purple
      default:
        return "bg-[#1E1E28]"; // darkest background tint
    }
  };

  const displayName = user?.Name || user?.Email?.split("@")[0] || "Angela";
  const formattedCost = summary.currentMonthCost > 0
    ? `฿${summary.currentMonthCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "฿16,957.00";

  return (
    <div className="w-full bg-[#000000] text-white p-4 sm:p-7 rounded-[32px] border border-white/10 shadow-2xl font-sans select-none space-y-6">
      
      {/* 1. Header Greeting & Time Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-white">
            Welcome back, {displayName}
          </h1>
          <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
            ภาพรวมการใช้ไฟฟ้าและวิเคราะห์พฤติกรรมพลังงาน
          </p>
        </div>

        {/* Time Tabs [Week | Month | Year] */}
        <div className="inline-flex p-1 bg-[#1A1A1E] rounded-full self-start sm:self-auto border border-white/5">
          <button
            onClick={() => setTimeRange("week")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              timeRange === "week"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Week
          </button>
          <button
            onClick={() => setTimeRange("month")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              timeRange === "month"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Month
          </button>
          <button
            onClick={() => setTimeRange("year")}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
              timeRange === "year"
                ? "bg-white text-black font-semibold shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            Year
          </button>
        </div>
      </div>

      {/* 2. Top Summary Section: Revenue / Usage & Bar Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-2">
        {/* Left Col (4 cols): Total Revenue / Bill Stat & Actions */}
        <div className="lg:col-span-4 flex flex-col justify-between space-y-4">
          <div>
            <span className="text-xs text-neutral-400 font-medium">
              Total usage cost / ค่าไฟรวม
            </span>
            <div className="flex items-baseline gap-2.5 mt-2">
              <span className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight font-mono text-white">
                {formattedCost}
              </span>
              <span className="text-xs font-semibold text-[#8B5CF6] bg-[#8B5CF6]/15 px-2 py-0.5 rounded-md">
                +12.67%
              </span>
            </div>
            <p className="text-xs text-neutral-400 mt-2 font-mono">
              Available quota: {summary.currentMonthUnits.toLocaleString()} kWh
            </p>
          </div>

          {/* Quick Action Pill Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>+ Record</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenTariffModal}
              className="px-4 py-2 bg-white text-black hover:bg-neutral-200 text-xs font-semibold rounded-full flex items-center gap-1.5 transition-all cursor-pointer active:scale-95"
            >
              <span>Tariff ฿{user?.Current_Rate_Per_Unit.toFixed(2)}</span>
              <ArrowDownLeft className="w-3.5 h-3.5" />
            </button>
            <button className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-neutral-400 hover:text-white hover:border-white/20 transition-colors cursor-pointer">
              <MoreVertical className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Middle Col (3 cols): $4,465 Block */}
        <div className="lg:col-span-3 flex flex-col justify-end space-y-2">
          <div className="text-sm font-semibold text-white">
            ฿4,465.00
          </div>
          <div className="text-[11px] text-neutral-400">
            + 23% Peak Load
          </div>
          {/* Solid Neon Purple Block */}
          <div className="h-10 w-full rounded-xl bg-[#8B5CF6] shadow-lg shadow-purple-600/30" />
          <div className="text-[10px] text-neutral-500 font-mono">
            January 26
          </div>
        </div>

        {/* Right Col (5 cols): $8,458.70 Bar Strip Matrix */}
        <div className="lg:col-span-5 flex flex-col justify-end space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-white">฿8,458.70</span>
            <div className="flex items-center gap-1 text-[11px] text-neutral-500">
              <span>Average</span>
              <span className="w-12 border-b border-dashed border-neutral-600 inline-block" />
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-neutral-400">
            <span>+ 12% Appliances</span>
            <span>1.24 Other</span>
          </div>

          {/* Bar Matrix (vertical pill lines like reference image) */}
          <div className="h-10 w-full flex items-end gap-1.5 sm:gap-2">
            {Array.from({ length: 24 }).map((_, i) => {
              const heights = [
                "h-6", "h-8", "h-10", "h-7", "h-9", "h-10", "h-5", "h-8",
                "h-10", "h-9", "h-7", "h-10", "h-6", "h-8", "h-10", "h-9",
                "h-5", "h-7", "h-9", "h-6", "h-8", "h-10", "h-7", "h-9"
              ];
              const isOther = i >= 18;
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full ${heights[i % heights.length]} ${
                    isOther ? "bg-neutral-700" : "bg-[#8B5CF6]"
                  }`}
                />
              );
            })}
          </div>

          <div className="text-[10px] text-neutral-500 font-mono text-right">
            February 26
          </div>
        </div>
      </div>

      {/* 3. Three Modern Cards in Row (Analytics / Activity by time / Recent transactions) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-5 pt-3">
        
        {/* Card 1: Analytics Sparkline (4 cols) */}
        <div className="lg:col-span-4 bg-[#111116] rounded-3xl p-5 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold text-white">Analytics</span>
            </div>
            <MoreVertical className="w-4 h-4 text-neutral-500 cursor-pointer" />
          </div>

          {/* Indicators */}
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-[#A3E635]" />
              <span className="text-neutral-300 text-[11px]">Usage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-sm bg-neutral-600" />
              <span className="text-neutral-300 text-[11px]">Baseline</span>
            </div>
          </div>

          {/* Sparkline Chart */}
          <div className="h-32 w-full relative">
            {/* Popover Callout */}
            <div className="absolute right-6 top-2 z-10 bg-black/90 border border-white/10 px-2 py-1 rounded-lg text-[10px] font-mono">
              <div className="text-[#A3E635]">| ฿7,968.00</div>
              <div className="text-neutral-400">| ฿5,957.00</div>
            </div>

            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={splineData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                <Line
                  type="monotone"
                  dataKey="value1"
                  stroke="#A3E635"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#A3E635" }}
                />
                <Line
                  type="monotone"
                  dataKey="value2"
                  stroke="#6B7280"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={{ r: 2, fill: "#6B7280" }}
                />
                <XAxis
                  dataKey="month"
                  stroke="#52525B"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Card 2: Activity by time (Heatmap matrix 6x7) (4 cols) */}
        <div className="lg:col-span-4 bg-[#111116] rounded-3xl p-5 border border-white/5 flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
                <Zap className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold text-white">Activity by time</span>
            </div>
            <ArrowUpRight className="w-4 h-4 text-neutral-500 cursor-pointer" />
          </div>

          {/* Matrix Headers: Days Mon-Sun */}
          <div className="space-y-1.5">
            <div className="grid grid-cols-8 text-[10px] text-neutral-500 text-center font-mono">
              <span />
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sut</span>
              <span>Sun</span>
            </div>

            {/* Matrix Rows (1pm - 6pm) */}
            {heatmapData.map((row, rowIdx) => (
              <div key={rowIdx} className="grid grid-cols-8 gap-1.5 items-center">
                <span className="text-[10px] text-neutral-500 font-mono text-right pr-1">
                  {rowIdx + 1} pm
                </span>
                {row.map((lvl, colIdx) => (
                  <div
                    key={colIdx}
                    className={`h-5 rounded-md ${getCellBg(lvl)} transition-transform hover:scale-110 cursor-pointer`}
                    title={`Hour ${rowIdx + 1}pm, Day ${colIdx + 1} - Level ${lvl}`}
                  />
                ))}
              </div>
            ))}
          </div>

          {/* Legend Less -> More */}
          <div className="flex items-center justify-end gap-1.5 text-[10px] text-neutral-500 pt-1">
            <span>Less</span>
            <span className="w-2.5 h-2.5 rounded-xs bg-[#1E1E28]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#4C1D95]/70" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#6D28D9]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#7C3AED]" />
            <span className="w-2.5 h-2.5 rounded-xs bg-[#8B5CF6]" />
            <span>More</span>
          </div>
        </div>

        {/* Card 3: Recent transactions (4 cols) */}
        <div className="lg:col-span-4 bg-[#111116] rounded-3xl p-5 border border-white/5 flex flex-col justify-between space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-neutral-800 flex items-center justify-center text-neutral-300">
                <CreditCard className="w-3.5 h-3.5" />
              </div>
              <span className="text-sm font-semibold text-white">Recent transactions</span>
            </div>
            <Search className="w-4 h-4 text-neutral-500 cursor-pointer" />
          </div>

          {/* Transaction items */}
          <div className="space-y-3 pt-1">
            {logs && logs.length > 0 ? (
              logs.slice(0, 5).map((log, idx) => {
                const dateStr = new Date(log.Record_Date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
                const cost = log.Total_Cost || log.Units_Used * user.Current_Rate_Per_Unit;
                return (
                  <div key={log.Log_ID || idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-neutral-200">
                        Meter #{log.Meter_Reading}
                      </span>
                      <span className="text-[10px] text-purple-400 bg-purple-400/10 px-2 py-0.5 rounded-full font-mono">
                        • {log.Units_Used} kWh
                      </span>
                    </div>
                    <span className="font-mono text-neutral-300">
                      -฿{cost.toFixed(2)}
                    </span>
                  </div>
                );
              })
            ) : (
              <>
                {/* Row 1 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-200">Internet / Wi-Fi</span>
                    <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                      • Multimedia
                    </span>
                  </div>
                  <span className="font-mono text-neutral-300">-$40.00</span>
                </div>

                {/* Row 2 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-200">Isabella Garcia</span>
                    <span className="text-[10px] text-blue-400 bg-blue-400/10 px-2 py-0.5 rounded-full">
                      • Transfer
                    </span>
                  </div>
                  <span className="font-mono text-neutral-300">-$86.50</span>
                </div>

                {/* Row 3 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-200">Sephora Clean</span>
                    <span className="text-[10px] text-pink-400 bg-pink-400/10 px-2 py-0.5 rounded-full">
                      • Beauty
                    </span>
                  </div>
                  <span className="font-mono text-neutral-300">-$248.80</span>
                </div>

                {/* Row 4 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-200">Netflix & Stream</span>
                    <span className="text-[10px] text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
                      • Multimedia
                    </span>
                  </div>
                  <span className="font-mono text-neutral-300">-$248.80</span>
                </div>

                {/* Row 5 */}
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-neutral-200">Violet Orean</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">
                      • Transfer
                    </span>
                  </div>
                  <span className="font-mono text-emerald-400 font-semibold">+$500.00</span>
                </div>
              </>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
