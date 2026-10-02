"use client";

import React, { useState, useMemo, useEffect } from "react";
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
import { TimeFilterMode } from "./DataHistoryTable";

interface VoltPulseDashboardProps {
  summary: SummaryData;
  user: UserProfile;
  monthlyChartData?: MonthlyChartData[];
  logs?: MeterLog[];
  filteredLogs?: MeterLog[];
  timeFilter?: TimeFilterMode;
  customStartDate?: string;
  customEndDate?: string;
  onOpenTariffModal?: () => void;
  onOpenAddModal?: () => void;
  onOpenEditModal?: (log: MeterLog) => void;
  onOpenHistory?: () => void;
  historyTableSlot?: React.ReactNode;
}

export const VoltPulseDashboard: React.FC<VoltPulseDashboardProps> = ({
  summary,
  user,
  monthlyChartData = [],
  logs = [],
  filteredLogs = [],
  timeFilter = "this_month",
  customStartDate = "",
  customEndDate = "",
  onOpenTariffModal,
  onOpenAddModal,
  onOpenEditModal,
  onOpenHistory,
  historyTableSlot,
}) => {
  const activeFilter = timeFilter || "this_month";
  const now = new Date();
  const curYear = now.getFullYear();
  const curMonth = now.getMonth(); // 0-indexed

  const thaiFullMonths = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];
  const thaiShortMonths = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
  ];

  // Previous month details
  const prevMonthDate = new Date(curYear, curMonth - 1, 1);
  const prevMonthIndex = prevMonthDate.getMonth();
  const prevYear = prevMonthDate.getFullYear();
  const prevLastDay = new Date(prevYear, prevMonthIndex + 1, 0).getDate();
  const prevMonthName = thaiFullMonths[prevMonthIndex];
  const prevThaiYearShort = ((prevYear + 543) % 100).toString().padStart(2, "0");

  // Current month details
  const currentMonthName = thaiFullMonths[curMonth];
  const currentThaiYearShort = ((curYear + 543) % 100).toString().padStart(2, "0");
  const daysInCurrentMonth = new Date(curYear, curMonth + 1, 0).getDate();
  const currentMonthDaysPassed = Math.max(1, now.getDate());

  // Helper for custom date format in Thai (e.g. 1 ก.ย. 69)
  const formatThaiDateShort = (dateStr: string) => {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length !== 3) return dateStr;
    const y = parseInt(parts[0], 10);
    const m = parseInt(parts[1], 10) - 1;
    const d = parseInt(parts[2], 10);
    const yShort = ((y + 543) % 100).toString().padStart(2, "0");
    return `${d} ${thaiShortMonths[m] || ""} ${yShort}`;
  };

  // Contextual Dashboard Titles, Labels, and Scope
  const filterContext = useMemo(() => {
    switch (activeFilter) {
      case "last_month": {
        const daysCount = prevLastDay;
        return {
          title: `ภาพรวมการใช้ไฟฟ้า ${prevMonthName} ${prevThaiYearShort}`,
          subtitle: `สรุปข้อมูลการใช้ไฟฟ้าย้อนหลังประจำเดือน${prevMonthName} ${prevYear + 543} (ครบ ${daysCount} วัน)`,
          badgeText: `รอบ 1-${prevLastDay} ${thaiShortMonths[prevMonthIndex]}`,
          card1Label: `ยอดค่าไฟเดือน${prevMonthName}`,
          card1SubLabel: "ยอดรวมสิ้นสุดรอบ",
          card2Label: `หน่วยไฟฟ้ารวม (${thaiShortMonths[prevMonthIndex]})`,
          card3Label: "เฉลี่ยต่อวัน (ทั้งเดือน)",
          card3SubLabel: `เฉลี่ยครบทั้ง ${daysCount} วัน`,
          daysForAverage: daysCount,
          isProjectionApplicable: false,
          summaryCardTitle: "สรุปยอดจริงสิ้นเดือน",
          summaryCardTag: "รอบสมบูรณ์ 100%",
          summaryHighlightLabel: `ยอดค่าไฟสุทธิเดือน${prevMonthName}`,
          summaryStatusText: `สิ้นสุดรอบบิลแล้ว (${daysCount} วันเต็ม)`,
          summaryTip: `ยอดการใช้ไฟฟ้าจริงประจำเดือน${prevMonthName} รวมบันทึก ${filteredLogs.length} รายการ`,
        };
      }
      case "this_week": {
        const day = now.getDay();
        const daysPassedInWeek = Math.max(1, day === 0 ? 7 : day);
        return {
          title: "ภาพรวมการใช้ไฟฟ้า สัปดาห์นี้",
          subtitle: `สรุปข้อมูลการใช้ไฟฟ้าระหว่างสัปดาห์ปัจจุบัน (${daysPassedInWeek} วันที่ผ่านมา)`,
          badgeText: "สัปดาห์นี้",
          card1Label: "ยอดค่าไฟสัปดาห์นี้",
          card1SubLabel: "ช่วง 7 วันล่าสุด",
          card2Label: "หน่วยไฟฟ้าสัปดาห์นี้",
          card3Label: "เฉลี่ยต่อวัน (สัปดาห์นี้)",
          card3SubLabel: `เฉลี่ย ${daysPassedInWeek} วันของสัปดาห์`,
          daysForAverage: daysPassedInWeek,
          isProjectionApplicable: false,
          summaryCardTitle: "สรุปยอดรวมสัปดาห์นี้",
          summaryCardTag: "สัปดาห์ปัจจุบัน",
          summaryHighlightLabel: "ยอดค่าไฟรวมสัปดาห์นี้",
          summaryStatusText: `บันทึกระหว่างสัปดาห์ (${daysPassedInWeek} วัน)`,
          summaryTip: `สรุปข้อมูลการใช้ไฟฟ้าระหว่างสัปดาห์ รวมบันทึก ${filteredLogs.length} รายการ`,
        };
      }
      case "this_year": {
        const startOfYear = new Date(curYear, 0, 1);
        const dayOfYear = Math.max(1, Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24)) + 1);
        return {
          title: `ภาพรวมการใช้ไฟฟ้า ปี ${curYear + 543}`,
          subtitle: `สรุปข้อมูลการใช้ไฟฟ้าสะสมตั้งแต่ต้นปี ${curYear + 543}`,
          badgeText: `ประจำปี ${curYear + 543}`,
          card1Label: "ยอดค่าไฟสะสมปีนี้",
          card1SubLabel: "สะสมตั้งแต่ 1 ม.ค.",
          card2Label: "หน่วยไฟฟ้ารวมทั้งปี",
          card3Label: "เฉลี่ยต่อวัน (ปีนี้)",
          card3SubLabel: `เฉลี่ย ${dayOfYear} วันของปี`,
          daysForAverage: dayOfYear,
          isProjectionApplicable: false,
          summaryCardTitle: "สรุปยอดรวมประจำปี",
          summaryCardTag: `ปี ${curYear + 543}`,
          summaryHighlightLabel: `ยอดค่าไฟสะสมปี ${curYear + 543}`,
          summaryStatusText: `ข้อมูลสะสมประจำปี (${curMonth + 1} เดือน)`,
          summaryTip: `สถิติภาพรวมประจำปี ${curYear + 543} รวมบันทึก ${filteredLogs.length} รายการ`,
        };
      }
      case "custom": {
        const formattedStart = formatThaiDateShort(customStartDate || "");
        const formattedEnd = formatThaiDateShort(customEndDate || "");
        const rangeText = formattedStart && formattedEnd ? `${formattedStart} - ${formattedEnd}` : "ช่วงเวลาที่เลือก";

        let daysCustom = 1;
        if (customStartDate && customEndDate) {
          const s = new Date(customStartDate).getTime();
          const e = new Date(customEndDate).getTime();
          daysCustom = Math.max(1, Math.round(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1);
        }

        return {
          title: `ภาพรวมการใช้ไฟฟ้า (${rangeText})`,
          subtitle: `สรุปข้อมูลตามช่วงวันที่กำหนด ${rangeText} (${daysCustom} วัน)`,
          badgeText: "ช่วงเวลาที่เลือก",
          card1Label: "ยอดค่าไฟช่วงที่เลือก",
          card1SubLabel: `${daysCustom} วันที่ระบุ`,
          card2Label: "หน่วยไฟฟ้ารวมช่วงนี้",
          card3Label: "เฉลี่ยต่อวัน (ช่วงที่เลือก)",
          card3SubLabel: `เฉลี่ยตามช่วง ${daysCustom} วัน`,
          daysForAverage: daysCustom,
          isProjectionApplicable: false,
          summaryCardTitle: "สรุปยอดรวมช่วงที่เลือก",
          summaryCardTag: "ช่วงวันที่ระบุ",
          summaryHighlightLabel: "ยอดค่าไฟรวมทั้งสิ้น",
          summaryStatusText: `${rangeText} (${daysCustom} วัน)`,
          summaryTip: `สรุปข้อมูลการใช้ไฟฟ้าระหว่าง ${rangeText} รวมบันทึก ${filteredLogs.length} รายการ`,
        };
      }
      case "all": {
        return {
          title: "ภาพรวมการใช้ไฟฟ้า ทั้งหมดที่บันทึก",
          subtitle: "สรุปข้อมูลประวัติการใช้ไฟฟ้าทั้งหมดตั้งแต่เริ่มต้นบันทึก",
          badgeText: "ประวัติทั้งหมด",
          card1Label: "ยอดค่าไฟสะสมทั้งหมด",
          card1SubLabel: "รวมทุกช่วงเวลา",
          card2Label: "หน่วยไฟฟ้ารวมทั้งหมด",
          card3Label: "เฉลี่ยต่อวัน (ภาพรวม)",
          card3SubLabel: "เฉลี่ยตลอดช่วงบันทึก",
          daysForAverage: Math.max(1, currentMonthDaysPassed),
          isProjectionApplicable: false,
          summaryCardTitle: "สรุปยอดรวมทั้งหมด",
          summaryCardTag: "ประวัติทั้งหมด",
          summaryHighlightLabel: "ยอดค่าไฟรวมสะสมทั้งสิ้น",
          summaryStatusText: `รวมบันทึกทั้งหมด ${filteredLogs.length} รายการ`,
          summaryTip: `สถิติภาพรวมจากการบันทึกทั้งหมด ${filteredLogs.length} รายการ`,
        };
      }
      case "this_month":
      default: {
        return {
          title: `ภาพรวมการใช้ไฟฟ้า ${currentMonthName} ${currentThaiYearShort}`,
          subtitle: "สรุปข้อมูล วิเคราะห์แนวโน้ม และการควบคุมงบประมาณค่าไฟ",
          badgeText: `รอบ 1-${daysInCurrentMonth} ${thaiShortMonths[curMonth]}`,
          card1Label: "ค่าไฟสะสมเดือนนี้",
          card1SubLabel: "สิ้นเดือน: ~฿",
          card2Label: "หน่วยไฟฟ้าเดือนนี้",
          card3Label: "เฉลี่ยค่าไฟต่อวัน",
          card3SubLabel: `เฉลี่ย ${currentMonthDaysPassed} วันที่ผ่านมา`,
          daysForAverage: currentMonthDaysPassed,
          isProjectionApplicable: true,
          summaryCardTitle: "คาดการณ์สิ้นเดือน",
          summaryCardTag: "รอบปัจจุบัน",
          summaryHighlightLabel: "ประมาณการค่าไฟทั้งเดือน",
          summaryStatusText: `ผ่านมา ${currentMonthDaysPassed} วัน • เหลืออีก ${Math.max(0, daysInCurrentMonth - currentMonthDaysPassed)} วัน`,
          summaryTip: `คำนวณจากพฤติกรรมการใช้ไฟเฉลี่ยหน่วย/วัน คูณจำนวนวันของเดือนนี้ (${daysInCurrentMonth} วัน)`,
        };
      }
    }
  }, [
    activeFilter,
    prevMonthName,
    prevThaiYearShort,
    prevLastDay,
    prevMonthIndex,
    prevYear,
    currentMonthName,
    currentThaiYearShort,
    daysInCurrentMonth,
    currentMonthDaysPassed,
    curMonth,
    curYear,
    customStartDate,
    customEndDate,
    filteredLogs.length,
    now,
  ]);

  const hasLogs = logs && logs.length > 0;
  const isFreshCycle = !hasLogs || (summary?.currentMonthUnits === 0 && summary?.currentMonthCost === 0);

  const currentCost = isFreshCycle ? 0 : (summary?.currentMonthCost ?? 0);
  const currentUnits = isFreshCycle ? 0 : (summary?.currentMonthUnits ?? 0);
  const ratePerUnit = user?.Current_Rate_Per_Unit || 8.0;

  // Contextual Daily Average
  const daysForAvg = filterContext.daysForAverage || 1;
  const dailyAverageUnits = isFreshCycle ? 0 : Number((currentUnits / daysForAvg).toFixed(1));
  const dailyAverageCost = isFreshCycle ? 0 : Number((currentCost / daysForAvg).toFixed(1));

  // End of month projected cost (only applicable for this_month)
  const projectedMonthCost = filterContext.isProjectionApplicable
    ? (isFreshCycle ? 0 : Math.round(dailyAverageCost * daysInCurrentMonth))
    : currentCost;

  // Smooth Animated Counter Effect (0 -> target value) matching Home page animation
  const [displayCost, setDisplayCost] = useState<number>(0);
  const [displayUnits, setDisplayUnits] = useState<number>(0);
  const [displayDailyCost, setDisplayDailyCost] = useState<number>(0);
  const [displayProjectedCost, setDisplayProjectedCost] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1500; // 1.5s smooth easing
    let animationFrameId: number;

    const easeOutQuart = (x: number): number => {
      return 1 - Math.pow(1 - x, 4);
    };

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const eased = easeOutQuart(progress);

      setDisplayCost(currentCost * eased);
      setDisplayUnits(currentUnits * eased);
      setDisplayDailyCost(dailyAverageCost * eased);
      setDisplayProjectedCost(projectedMonthCost * eased);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayCost(currentCost);
        setDisplayUnits(currentUnits);
        setDisplayDailyCost(dailyAverageCost);
        setDisplayProjectedCost(projectedMonthCost);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [currentCost, currentUnits, dailyAverageCost, projectedMonthCost]);

  // Month-over-Month comparison
  const percentChange = summary?.unitsPercentChange;
  const isSaving = percentChange !== null && percentChange !== undefined && percentChange <= 0;

  // Chart view tab: "cost" vs "units"
  const [metricTab, setMetricTab] = useState<"cost" | "units">("cost");

  // Chart data from monthly logs (highlight target month)
  const chartDisplayData = useMemo(() => {
    let targetMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    if (activeFilter === "last_month") {
      targetMonthKey = `${prevYear}-${String(prevMonthIndex + 1).padStart(2, "0")}`;
    }

    if (monthlyChartData && monthlyChartData.length > 0) {
      return monthlyChartData.map((d) => ({
        month: d.monthName,
        cost: Math.round(d.totalCost),
        units: Number(d.totalUnits.toFixed(1)),
        isCurrent: d.monthKey === targetMonthKey,
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
  }, [monthlyChartData, currentCost, currentUnits, activeFilter, prevYear, prevMonthIndex, now]);

  // Projection details
  const daysRemaining = Math.max(0, daysInCurrentMonth - currentMonthDaysPassed);
  const projectedUnits = isFreshCycle ? 0 : Number((dailyAverageUnits * daysInCurrentMonth).toFixed(1));
  const remainingEstimatedCost = Math.max(0, projectedMonthCost - currentCost);
  const cycleProgressPct = Math.min(100, Math.round((currentMonthDaysPassed / daysInCurrentMonth) * 100));

  return (
    <div className="w-full space-y-4 sm:space-y-6 md:space-y-8 select-none font-sans text-slate-800">
      {/* ================= 1. Top Bar & Title ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-light tracking-tight text-slate-900 truncate">
              {filterContext.title}
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/60 shrink-0">
              {filterContext.badgeText}
            </span>
          </div>
          <p className="text-[11px] sm:text-xs md:text-sm text-slate-400 font-light mt-0.5 leading-relaxed">
            {filterContext.subtitle}
          </p>
        </div>
      </div>

      {/* ================= 2. Primary KPI Cards Grid (4 Cards - 2 cols on mobile) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {/* Card 1: ค่าไฟ */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-200 transition-all min-w-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-light tracking-wide text-slate-400 uppercase truncate">
              {filterContext.card1Label}
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
              <span className="text-xs sm:text-sm font-semibold">฿</span>
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-0.5 sm:space-x-1 overflow-hidden">
              <span className="text-xl sm:text-2xl md:text-3xl font-[300] tracking-tight text-slate-900 tabular-nums truncate">
                ฿{displayCost.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-slate-400 font-light flex flex-wrap items-center gap-1 leading-tight">
              {filterContext.isProjectionApplicable ? (
                <>
                  <span className="shrink-0">สิ้นเดือน:</span>
                  <span className="font-medium text-slate-700 tabular-nums">~฿{Math.round(displayProjectedCost).toLocaleString()}</span>
                </>
              ) : (
                <span className="font-medium text-slate-600 truncate">{filterContext.card1SubLabel}</span>
              )}
            </div>
          </div>
        </div>

        {/* Card 2: หน่วยไฟฟ้า */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-200 transition-all min-w-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-light tracking-wide text-slate-400 uppercase truncate">
              {filterContext.card2Label}
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
              <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-emerald-500/20" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-1 overflow-hidden">
              <span className="text-xl sm:text-2xl md:text-3xl font-[300] tracking-tight text-slate-900 tabular-nums truncate">
                {displayUnits.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-[10px] sm:text-xs font-light text-slate-400 shrink-0">kWh</span>
            </div>
            <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-slate-400 font-light flex items-center space-x-1 leading-tight truncate">
              <span>อัตรา:</span>
              <span className="font-medium text-slate-700 tabular-nums">฿{ratePerUnit.toFixed(2)}/หน่วย</span>
            </div>
          </div>
        </div>

        {/* Card 3: ค่าเฉลี่ยต่อวัน */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-200 transition-all min-w-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-light tracking-wide text-slate-400 uppercase truncate">
              {filterContext.card3Label}
            </span>
            <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-sky-50 flex items-center justify-center text-sky-600 shrink-0">
              <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline space-x-0.5 sm:space-x-1 overflow-hidden">
              <span className="text-xl sm:text-2xl md:text-3xl font-[300] tracking-tight text-slate-900 tabular-nums truncate">
                ฿{displayDailyCost.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <span className="text-[10px] sm:text-xs font-light text-slate-400 shrink-0">/วัน</span>
            </div>
            <div className="mt-1.5 sm:mt-2 text-[10px] sm:text-[11px] text-slate-400 font-light truncate leading-tight">
              {filterContext.card3SubLabel}
            </div>
          </div>
        </div>

        {/* Card 4: เทียบช่วงก่อนหน้า */}
        <div className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between hover:border-slate-200 transition-all min-w-0">
          <div className="flex items-center justify-between mb-1.5 sm:mb-2">
            <span className="text-[10px] sm:text-xs font-light tracking-wide text-slate-400 uppercase truncate">
              {summary?.prevPeriodLabel ? summary.prevPeriodLabel : "เทียบรอบก่อน"}
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
      {/* On mobile: Forecast/Summary Card is FIRST (order-1), Chart is SECOND (order-2) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Right on desktop, Top on mobile: คาดการณ์ หรือ สรุปยอดรวมตามช่วงเวลา */}
        <div className="order-1 lg:order-2 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h2 className="text-sm sm:text-base font-medium text-slate-800">
                {filterContext.summaryCardTitle}
              </h2>
              <span className="text-[10px] sm:text-[11px] text-slate-400 font-light">
                {filterContext.summaryCardTag}
              </span>
            </div>

            {/* Dominant Highlight Number */}
            <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/60 border border-slate-100/80 mb-4 sm:mb-5">
              <span className="text-[10px] sm:text-[11px] uppercase tracking-wider text-slate-400 font-light block mb-1">
                {filterContext.summaryHighlightLabel}
              </span>
              <div className="flex items-baseline space-x-1">
                <span className="text-lg sm:text-xl font-light text-slate-400">฿</span>
                <span className="text-3xl sm:text-4xl md:text-5xl font-[300] tracking-tight text-slate-900 tabular-nums">
                  {Math.round(filterContext.isProjectionApplicable ? displayProjectedCost : displayCost).toLocaleString()}
                </span>
                <span className="text-xs text-slate-400 font-light ml-1">บาท</span>
              </div>
              <div className="mt-1.5 sm:mt-2 text-[11px] text-slate-500 font-light flex items-center justify-between">
                <span>{filterContext.isProjectionApplicable ? "ประมาณการหน่วย:" : "จำนวนหน่วยรวม:"}</span>
                <span className="font-medium text-slate-700 tabular-nums">
                  ~{(filterContext.isProjectionApplicable ? projectedUnits : displayUnits).toLocaleString(undefined, {
                    minimumFractionDigits: 1,
                    maximumFractionDigits: 1,
                  })} kWh
                </span>
              </div>
            </div>

            {/* Timeline & Progress Bar */}
            <div className="space-y-1.5 mb-4 sm:mb-5">
              <div className="flex justify-between text-[11px] sm:text-xs text-slate-500 font-light">
                {filterContext.isProjectionApplicable ? (
                  <>
                    <span>ผ่านมา {currentMonthDaysPassed} วัน</span>
                    <span>เหลืออีก {daysRemaining} วัน</span>
                  </>
                ) : (
                  <>
                    <span>{filterContext.summaryStatusText}</span>
                    <span className="text-emerald-600 font-medium">สมบูรณ์</span>
                  </>
                )}
              </div>
              <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden flex">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${filterContext.isProjectionApplicable ? cycleProgressPct : 100}%` }}
                />
              </div>
            </div>

            {/* Comparison Metrics Breakdown */}
            <div className="space-y-2 pt-1 border-t border-slate-100/80 text-[11px] sm:text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-light">
                  {filterContext.isProjectionApplicable ? "ใช้ไปแล้วปัจจุบัน:" : "ยอดค่าไฟสุทธิ:"}
                </span>
                <span className="font-medium text-slate-800 tabular-nums">
                  ฿{displayCost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
              {filterContext.isProjectionApplicable && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-light">คาดว่าจะเพิ่มอีกประมาณ:</span>
                  <span className="font-medium text-slate-800 tabular-nums">
                    +฿{remainingEstimatedCost.toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-light">
                  {filterContext.isProjectionApplicable ? "อัตราเฉลี่ยที่ใช้ประเมิน:" : "อัตราเฉลี่ยต่อวัน:"}
                </span>
                <span className="font-medium text-slate-700 tabular-nums">
                  ฿{dailyAverageCost.toFixed(1)} /วัน
                </span>
              </div>
              {!filterContext.isProjectionApplicable && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-light">อัตราค่าไฟที่ใช้คำนวณ:</span>
                  <span className="font-medium text-slate-700 tabular-nums">
                    ฿{ratePerUnit.toFixed(2)} /หน่วย
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Smart Tip */}
          <div className="mt-4 sm:mt-5 p-3 rounded-xl bg-slate-50/80 border border-slate-100 flex items-start gap-2.5">
            <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-[10px] sm:text-[11px] text-slate-600 font-light leading-relaxed">
              {filterContext.summaryTip}
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

      {/* ================= 5. ประวัติบันทึกการใช้ไฟฟ้า (History & Logs) ================= */}
      {historyTableSlot && (
        <div className="w-full animate-in fade-in duration-300">
          {historyTableSlot}
        </div>
      )}
    </div>
  );
};
