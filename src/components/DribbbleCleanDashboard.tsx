"use client";

import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Wallet,
  Clock,
  Zap,
  CreditCard,
  MoreVertical,
  ArrowUpRight,
  ChevronDown,
  Calendar,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Plus,
  Settings,
  CheckCircle2,
  FileText,
} from "lucide-react";
import { SummaryData, MonthlyChartData, UserProfile, MeterLog } from "@/types";

interface DribbbleCleanDashboardProps {
  summary: SummaryData;
  user: UserProfile;
  monthlyChartData?: MonthlyChartData[];
  logs?: MeterLog[];
  onOpenTariffModal?: () => void;
  onOpenAddModal?: () => void;
  onOpenEditModal?: (log: MeterLog) => void;
}

export const DribbbleCleanDashboard: React.FC<DribbbleCleanDashboardProps> = ({
  summary,
  user,
  monthlyChartData = [],
  logs = [],
  onOpenTariffModal,
  onOpenAddModal,
  onOpenEditModal,
}) => {
  const [selectedMonthIndex, setSelectedMonthIndex] = useState<number>(4); // default May/Current

  // Calculate daily average
  const dailyAverage = useMemo(() => {
    const cost = summary.currentMonthCost || 732;
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return (cost / (now.getDate() || 1)).toFixed(2);
  }, [summary.currentMonthCost]);

  // Greeting
  const displayName = user?.Name ? user.Name.split(" ")[0] : "James";

  // Monthly bar chart data (exact 9 months Jan-Sep style as Dribbble mockup)
  const barChartData = useMemo(() => {
    const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"];
    const baseHeights = [55, 78, 62, 35, 95, 88, 48, 42, 60]; // percentages

    return monthLabels.map((m, idx) => {
      // If we have real monthly data from props, align if possible
      const realItem = monthlyChartData[idx];
      const cost = realItem ? realItem.totalCost : Math.round(baseHeights[idx] * 8.5);
      const units = realItem ? realItem.totalUnits : Math.round(baseHeights[idx] * 1.4);
      return {
        month: m,
        heightPct: baseHeights[idx],
        cost: cost || 245,
        units: units || 35,
        isCurrent: idx === selectedMonthIndex,
      };
    });
  }, [monthlyChartData, selectedMonthIndex]);

  // Efficiency gauge percentage (based on units or target)
  const efficiencyPercent = 51.2;

  return (
    <div className="w-full relative overflow-hidden rounded-[32px] sm:rounded-[36px] p-4 sm:p-7 sm:pb-9 bg-gradient-to-br from-[#F5F6FC] via-[#F8F9FE] to-[#F1F3FB] border border-white/80 shadow-[0_20px_60px_-15px_rgba(140,150,190,0.12)] text-[#1E1B2E] font-sans select-none">
      
      {/* Ambient background soft pastel color blobs like the Dribbble art */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FFEAE3]/50 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute top-1/3 -right-24 w-96 h-96 bg-[#EBE7FF]/60 rounded-full blur-3xl pointer-events-none -z-0" />
      <div className="absolute -bottom-24 left-1/4 w-96 h-96 bg-[#E1F0FF]/40 rounded-full blur-3xl pointer-events-none -z-0" />

      {/* Greeting Header */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#1E1B2E]">
            Good morning, {displayName}!
          </h1>
          <p className="text-xs sm:text-sm text-[#8A879E] mt-0.5">
            ภาพรวมการใช้ไฟฟ้าและวิเคราะห์ประสิทธิภาพพลังงาน
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={onOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#8B70F8] hover:bg-[#7B5EF5] text-white text-xs font-semibold shadow-md shadow-purple-500/25 active:scale-95 transition-all cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>บันทึกค่าไฟ</span>
          </button>
          <button
            onClick={onOpenTariffModal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-white/80 hover:bg-white text-[#64748B] hover:text-[#1E1B2E] text-xs font-semibold border border-white/90 shadow-xs active:scale-95 transition-all cursor-pointer"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>฿{user.Current_Rate_Per_Unit.toFixed(2)}/u</span>
          </button>
        </div>
      </div>

      {/* Row 1: The 4 Top Metric Cards (Exact Dribbble Structure) */}
      <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5 mb-5 sm:mb-6">
        
        {/* Card 1: Balance / Total Bill */}
        <div className="bg-white/85 backdrop-blur-md rounded-[24px] sm:rounded-[26px] p-4 sm:p-5 border border-white/70 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-2xl bg-[#F4F1FD] flex items-center justify-center text-[#8B70F8]">
              <Wallet className="w-4 h-4" />
            </div>
            <MoreVertical className="w-4 h-4 text-[#A09EB3] cursor-pointer hover:text-slate-700" />
          </div>
          <div className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-tight text-[#1E1B2E] font-mono">
            ฿{(summary.currentMonthCost || 732).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </div>
          <p className="text-[11px] sm:text-xs text-[#8A879E] mt-1 font-medium">
            ยอดค่าไฟเดือนนี้
          </p>
        </div>

        {/* Card 2: Uncategorized / Total Units */}
        <div className="bg-white/85 backdrop-blur-md rounded-[24px] sm:rounded-[26px] p-4 sm:p-5 border border-white/70 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-2xl bg-[#F4F1FD] flex items-center justify-center text-[#8B70F8]">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-tight text-[#1E1B2E] font-mono">
            {(summary.currentMonthUnits || 122).toLocaleString()}
          </div>
          <p className="text-[11px] sm:text-xs text-[#8A879E] mt-1 font-medium">
            หน่วยที่ใช้สะสม (kWh)
          </p>
        </div>

        {/* Card 3: Employees working / Rate per Unit */}
        <div className="bg-white/85 backdrop-blur-md rounded-[24px] sm:rounded-[26px] p-4 sm:p-5 border border-white/70 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-2xl bg-[#F4F1FD] flex items-center justify-center text-[#8B70F8]">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-tight text-[#1E1B2E] font-mono">
            ฿{user.Current_Rate_Per_Unit.toFixed(2)}
          </div>
          <p className="text-[11px] sm:text-xs text-[#8A879E] mt-1 font-medium">
            อัตราค่าไฟปัจจุบัน
          </p>
        </div>

        {/* Card 4: This week's spending / Daily Average */}
        <div className="bg-white/85 backdrop-blur-md rounded-[24px] sm:rounded-[26px] p-4 sm:p-5 border border-white/70 shadow-[0_4px_20px_rgb(0,0,0,0.03)] hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-2xl bg-[#F4F1FD] flex items-center justify-center text-[#8B70F8]">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-tight text-[#1E1B2E] font-mono">
            ฿{dailyAverage}
          </div>
          <p className="text-[11px] sm:text-xs text-[#8A879E] mt-1 font-medium">
            ค่าไฟเฉลี่ยรายวัน (Est.)
          </p>
        </div>

      </div>

      {/* Main Grid: Left Column (Chart + Recent Logs) & Right Column (Formation + Success Rate) */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
        
        {/* ================= LEFT COLUMN (8 cols) ================= */}
        <div className="lg:col-span-8 flex flex-col gap-5 sm:gap-6">
          
          {/* Card: Average Sales / Average Electricity Bar Chart */}
          <div className="bg-white/85 backdrop-blur-md rounded-[26px] sm:rounded-[28px] p-5 sm:p-6 border border-white/70 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            
            {/* Header with Title, Period Switcher, and Arrow */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-[#1E1B2E]">
                  Average Consumption
                </h3>
                <p className="text-xs text-[#8A879E]">
                  ภาพรวมการใช้ไฟฟ้าและแนวโน้มย้อนหลัง
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F4FA] border border-slate-200/60 text-xs font-medium text-[#64748B]">
                  <Calendar className="w-3 h-3 text-[#8A879E]" />
                  <span>Current Year</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[#8A879E]" />
                </div>
                <button
                  onClick={onOpenAddModal}
                  className="w-8 h-8 rounded-full bg-white hover:bg-slate-50 border border-slate-200/80 flex items-center justify-center text-[#64748B] hover:text-[#1E1B2E] transition-colors cursor-pointer shadow-2xs"
                  title="ดูรายละเอียด"
                >
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Offline / Online Style Comparison Metric Rows */}
            <div className="flex items-baseline gap-6 sm:gap-8 pb-3 border-b border-slate-100">
              <div>
                <span className="text-[11px] text-[#8A879E] font-medium block">
                  เดือนก่อนหน้า
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg sm:text-2xl font-bold font-mono text-[#1E1B2E]">
                    ฿{(summary.prevMonthCost || 474).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-rose-500 bg-rose-50 border border-rose-200/70 px-1.5 py-0.5 rounded-full">
                    -11%
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[11px] text-[#8A879E] font-medium block">
                  เดือนปัจจุบัน
                </span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-lg sm:text-2xl font-bold font-mono text-[#1E1B2E]">
                    ฿{(summary.currentMonthCost || 732).toLocaleString()}
                  </span>
                  <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200/70 px-1.5 py-0.5 rounded-full">
                    +9%
                  </span>
                </div>
              </div>
            </div>

            {/* Custom SVG/Bar Grid Chart (Exact Soft Dribbble Aesthetic) */}
            <div className="mt-5 pt-3">
              <div className="h-52 sm:h-56 w-full flex items-end justify-between gap-2 sm:gap-3.5 relative px-2">
                
                {/* Horizontal Baseline Guides */}
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-20">
                  <div className="border-b border-slate-300 w-full" />
                  <div className="border-b border-slate-300 w-full" />
                  <div className="border-b border-slate-300 w-full" />
                  <div className="border-b border-slate-300 w-full" />
                </div>

                {/* Vertical Bars */}
                {barChartData.map((item, idx) => {
                  const isSelected = item.isCurrent;
                  return (
                    <div
                      key={item.month}
                      onClick={() => setSelectedMonthIndex(idx)}
                      className="flex-1 flex flex-col items-center justify-end h-full group cursor-pointer relative z-10"
                    >
                      {/* Floating Tooltip above the selected bar */}
                      {isSelected && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="absolute -top-12 z-20 bg-white border border-[#EDE8FD] shadow-lg shadow-purple-500/10 px-2.5 py-1 rounded-xl text-[10px] font-mono text-center pointer-events-none"
                        >
                          <div className="text-[#8B70F8] font-bold">฿{item.cost}</div>
                          <div className="text-slate-400 text-[9px]">{item.units} kWh</div>
                          {/* Caret */}
                          <div className="w-2 h-2 bg-white border-r border-b border-[#EDE8FD] rotate-45 absolute -bottom-1 left-1/2 -translate-x-1/2" />
                        </motion.div>
                      )}

                      {/* Bar Column */}
                      <div
                        style={{ height: `${item.heightPct}%` }}
                        className={`w-full max-w-[42px] rounded-2xl transition-all duration-300 ${
                          isSelected
                            ? "bg-[#8B70F8] shadow-md shadow-purple-500/30 scale-102"
                            : "bg-[#EAE6F8]/80 hover:bg-[#DDD7F5]"
                        }`}
                      />

                      {/* Month Label */}
                      <span
                        className={`text-[10px] sm:text-xs mt-2.5 font-medium transition-colors ${
                          isSelected ? "text-[#8B70F8] font-bold" : "text-[#A09EB3] group-hover:text-slate-700"
                        }`}
                      >
                        {item.month}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Card: Recent Emails / Recent Meter Logs (Compact & Sleek) */}
          <div className="bg-white/85 backdrop-blur-md rounded-[26px] sm:rounded-[28px] p-5 sm:p-6 border border-white/70 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-bold text-[#1E1B2E]">
                Recent logs / ประวัติบันทึกล่าสุด
              </h3>
              <button
                onClick={onOpenAddModal}
                className="text-xs font-semibold text-[#8B70F8] hover:underline cursor-pointer"
              >
                + เพิ่มรายการ
              </button>
            </div>

            {/* Logs List Table */}
            <div className="space-y-2.5">
              {logs && logs.length > 0 ? (
                logs.slice(0, 3).map((log, idx) => {
                  const dateObj = new Date(log.Record_Date);
                  const dateStr = !isNaN(dateObj.getTime())
                    ? dateObj.toLocaleDateString("th-TH", { day: "numeric", month: "short", year: "2-digit" })
                    : log.Record_Date;
                  const cost = log.Total_Cost || log.Units_Used * user.Current_Rate_Per_Unit;

                  return (
                    <div
                      key={log.Log_ID || idx}
                      onClick={() => onOpenEditModal && onOpenEditModal(log)}
                      className="flex items-center justify-between p-3 rounded-2xl bg-[#F9F9FC] hover:bg-[#F3F2FA] transition-colors cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#8B70F8]/10 text-[#8B70F8] flex items-center justify-center font-bold text-xs">
                          ⚡
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#1E1B2E] group-hover:text-[#8B70F8] transition-colors">
                            มิเตอร์: {log.Meter_Reading}
                          </div>
                          <div className="text-[11px] text-[#8A879E]">
                            {dateStr}
                          </div>
                        </div>
                      </div>

                      <div className="hidden sm:block text-xs font-mono text-slate-600">
                        {log.Units_Used} kWh
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-bold font-mono text-[#1E1B2E]">
                          ฿{cost.toFixed(2)}
                        </div>
                        <span className="text-[10px] text-emerald-600 font-medium">
                          บันทึกสำเร็จ
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <>
                  {/* Mockup Fallback Row 1 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F9F9FC]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                        ⚡
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E1B2E]">บันทึกมิเตอร์รอบบิลล่าสุด</div>
                        <div className="text-[11px] text-[#8A879E]">26 ก.ย. 2569</div>
                      </div>
                    </div>
                    <div className="hidden sm:block text-xs font-mono text-slate-600">122.0 kWh</div>
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-[#1E1B2E]">฿732.00</div>
                      <span className="text-[10px] text-emerald-600 font-medium">ปกติ</span>
                    </div>
                  </div>

                  {/* Mockup Fallback Row 2 */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-[#F9F9FC]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs">
                        ⚡
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#1E1B2E]">บันทึกมิเตอร์ต้นเดือน</div>
                        <div className="text-[11px] text-[#8A879E]">15 ก.ย. 2569</div>
                      </div>
                    </div>
                    <div className="hidden sm:block text-xs font-mono text-slate-600">45.0 kWh</div>
                    <div className="text-right">
                      <div className="text-xs font-bold font-mono text-[#1E1B2E]">฿270.00</div>
                      <span className="text-[10px] text-emerald-600 font-medium">ปกติ</span>
                    </div>
                  </div>
                </>
              )}
            </div>

          </div>

        </div>

        {/* ================= RIGHT COLUMN (4 cols) ================= */}
        <div className="lg:col-span-4 flex flex-col gap-5 sm:gap-6">
          
          {/* Card 1: Formation status / Quota & Process */}
          <div className="bg-white/85 backdrop-blur-md rounded-[26px] sm:rounded-[28px] p-5 sm:p-6 border border-white/70 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm sm:text-base font-bold text-[#1E1B2E]">
                  Formation status
                </h3>
                <ArrowUpRight className="w-4 h-4 text-[#8A879E] cursor-pointer" />
              </div>
              <p className="text-xs text-[#8A879E]">
                In progress • อยู่ในเกณฑ์ประหยัด
              </p>

              {/* Lavender Progress Bar */}
              <div className="mt-4 mb-4">
                <div className="h-3 w-full bg-[#EDE8FD] rounded-full overflow-hidden p-0.5">
                  <div className="h-full bg-[#8B70F8] rounded-full w-[65%]" />
                </div>
              </div>

              {/* Estimated Processing */}
              <div className="pt-2">
                <span className="text-xs font-bold text-[#1E1B2E] block">
                  Estimated Bill / คาดการณ์สิ้นเดือน
                </span>
                <span className="text-xs text-[#8A879E] mt-0.5 block">
                  ฿850.00 - ฿920.00 บาท
                </span>
              </div>
            </div>

            {/* View status Action Button */}
            <div className="mt-6">
              <button
                onClick={onOpenAddModal}
                className="w-full py-2.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-[#1E1B2E] shadow-2xs active:scale-98 transition-all cursor-pointer text-center"
              >
                + บันทึกค่าไฟรอบใหม่
              </button>
            </div>
          </div>

          {/* Card 2: Success Rate / Energy Efficiency Semi-Circle Gauge */}
          <div className="bg-white/85 backdrop-blur-md rounded-[26px] sm:rounded-[28px] p-5 sm:p-6 border border-white/70 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm sm:text-base font-bold text-[#1E1B2E]">
                  Success Rate
                </h3>
                <ArrowUpRight className="w-4 h-4 text-[#8A879E] cursor-pointer" />
              </div>
              <p className="text-xs text-[#8A879E]">
                เป้าหมายประสิทธิภาพพลังงาน
              </p>

              {/* Gauge Graphic matching Dribbble Mockup */}
              <div className="my-4 flex flex-col items-center justify-center relative">
                {/* Semi-circular dotted/segmented arc */}
                <div className="relative w-44 h-24 flex items-center justify-center overflow-hidden">
                  <svg className="w-44 h-24" viewBox="0 0 160 85">
                    {/* Background inactive track */}
                    <path
                      d="M 15 80 A 65 65 0 0 1 145 80"
                      fill="none"
                      stroke="#EDE8FD"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray="6 6"
                    />
                    {/* Active purple track */}
                    <path
                      d="M 15 80 A 65 65 0 0 1 145 80"
                      fill="none"
                      stroke="#8B70F8"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray="6 6"
                      strokeDashoffset="75"
                    />
                  </svg>

                  {/* Centered Pill + Metric */}
                  <div className="absolute bottom-1 flex flex-col items-center">
                    <span className="text-[10px] font-bold text-[#8B70F8] bg-[#F4F1FD] px-2 py-0.5 rounded-full mb-0.5">
                      • {efficiencyPercent}%
                    </span>
                    <span className="text-xl sm:text-2xl font-black font-mono text-[#1E1B2E]">
                      {efficiencyPercent}%
                    </span>
                    <span className="text-[10px] text-emerald-600 font-semibold">
                      +5%
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-[#8A879E] text-center mt-3 max-w-[200px]">
                  Hooray! คุณประหยัดไฟได้ตามเป้าหมาย ยอดเยี่ยมมาก
                </p>
              </div>
            </div>

            {/* Sub-metrics at bottom: Peoples / New Users -> Units / Tariff */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-center">
              <div>
                <span className="text-[10px] text-[#8A879E] block">หน่วยสะสม</span>
                <span className="text-sm font-bold font-mono text-[#1E1B2E]">
                  {(summary.currentMonthUnits || 122).toLocaleString()} kWh
                </span>
              </div>
              <div>
                <span className="text-[10px] text-[#8A879E] block">อัตราค่าไฟ</span>
                <span className="text-sm font-bold font-mono text-[#1E1B2E]">
                  ฿{user.Current_Rate_Per_Unit.toFixed(2)}/u
                </span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
