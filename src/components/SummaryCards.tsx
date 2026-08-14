"use client";

import React, { memo, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, Zap, Banknote, Gauge } from "lucide-react";
import { SummaryData } from "@/types";

interface SummaryCardsProps {
  summary: SummaryData;
}

/**
 * 60fps Smooth Eased Number Counter Component
 */
function AnimatedCounter({
  value,
  decimals = 0,
  duration = 900,
}: {
  value: number;
  decimals?: number;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const prevValueRef = useRef<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = prevValueRef.current;
    const endValue = isNaN(value) ? 0 : value;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out cubic curve for natural smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        prevValueRef.current = endValue;
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return (
    <span suppressHydrationWarning>
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}

export const SummaryCards: React.FC<SummaryCardsProps> = memo(({ summary }) => {
  const isUnitsUp = summary.unitsPercentChange !== null && summary.unitsPercentChange > 0;
  const isCostUp = summary.costPercentChange !== null && summary.costPercentChange > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Card 1: Monthly Units Consumed */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-blue-200"
      >
        <div className="flex items-center justify-between mb-3">
          <span suppressHydrationWarning className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            ยอดใช้ไฟ ({summary.currentMonthName})
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-xs">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-1.5">
            <span suppressHydrationWarning className="text-3xl font-extrabold text-slate-900 tracking-tight">
              <AnimatedCounter value={summary.currentMonthUnits} decimals={0} duration={850} />
            </span>
            <span className="text-sm font-normal text-slate-500 align-baseline">หน่วย (kWh)</span>
          </div>

          <div className="mt-3 flex items-center text-xs">
            {summary.unitsPercentChange !== null ? (
              <span
                suppressHydrationWarning
                className={`flex items-center font-bold px-2.5 py-0.5 rounded-full transition-transform hover:scale-105 ${
                  isUnitsUp
                    ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                }`}
              >
                {isUnitsUp ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 mr-1" />
                )}
                {isUnitsUp ? `+${summary.unitsPercentChange}%` : `${summary.unitsPercentChange}%`}
              </span>
            ) : (
              <span className="text-slate-400 font-medium">ไม่มีข้อมูลเปรียบเทียบ</span>
            )}
            <span className="ml-2 text-slate-500">{summary.prevMonthName}</span>
          </div>
        </div>
      </motion.div>

      {/* Card 2: Monthly Total Cost */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-emerald-200"
      >
        <div className="flex items-center justify-between mb-3">
          <span suppressHydrationWarning className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            ค่าใช้จ่าย ({summary.currentMonthName})
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-xs">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-medium text-slate-500 mr-0.5">฿</span>
            <span suppressHydrationWarning className="text-3xl font-bold text-slate-800 tracking-tight font-mono">
              <AnimatedCounter value={summary.currentMonthCost} decimals={2} duration={950} />
            </span>
            <span className="text-sm font-normal text-slate-400 ml-1.5 align-baseline">บาท</span>
          </div>

          <div className="mt-3 flex items-center text-xs">
            {summary.costPercentChange !== null ? (
              <span
                suppressHydrationWarning
                className={`flex items-center font-bold px-2.5 py-0.5 rounded-full transition-transform hover:scale-105 ${
                  isCostUp
                    ? "bg-rose-50 text-rose-600 border border-rose-200/60"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-200/60"
                }`}
              >
                {isCostUp ? (
                  <TrendingUp className="w-3.5 h-3.5 mr-1" />
                ) : (
                  <TrendingDown className="w-3.5 h-3.5 mr-1" />
                )}
                {isCostUp ? `+${summary.costPercentChange}%` : `${summary.costPercentChange}%`}
              </span>
            ) : (
              <span className="text-slate-400 font-medium">ไม่มีข้อมูลเปรียบเทียบ</span>
            )}
            <span className="ml-2 text-slate-500">{summary.prevMonthName}</span>
          </div>
        </div>
      </motion.div>

      {/* Card 3: Latest Meter Reading & Cycle */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.19, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-purple-200 sm:col-span-2 lg:col-span-1"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            เลขมิเตอร์ล่าสุด
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-xs">
            <Gauge className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-2">
            <span suppressHydrationWarning className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              <AnimatedCounter value={summary.latestMeterReading} decimals={0} duration={800} />
            </span>
            <span className="text-sm font-semibold text-slate-500">หน่วย</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span suppressHydrationWarning className="text-slate-400">
              {summary.latestRecordDate !== "-" ? `บันทึกเมื่อ ${summary.latestRecordDate}` : "ยังไม่มีข้อมูล"}
            </span>
            <span suppressHydrationWarning className="font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-200/80">
              รอบที่ {summary.totalCyclesCount}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

SummaryCards.displayName = "SummaryCards";
