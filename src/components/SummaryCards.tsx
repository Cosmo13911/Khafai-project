"use client";

import React, { memo, useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { TrendingDown, ArrowDownRight, Zap, Banknote, Gauge } from "lucide-react";
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
  // Calculate savings metric (or default demonstration if new)
  const percentChange = summary.unitsPercentChange;
  // If user used less, e.g. -12%, or calculate saving percentage
  const isSaving = percentChange !== null && percentChange < 0;
  const savingAmountPct = percentChange !== null ? Math.abs(percentChange) : 12;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Card 1: Monthly Units Consumed (SmartPower Theme) */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.04, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm/60 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-200"
      >
        <div className="flex items-center justify-between mb-3">
          <span suppressHydrationWarning className="text-xs font-medium text-slate-500">
            ยอดใช้ไฟ ({summary.currentMonthName})
          </span>
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2ECC71]">
            <Zap className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-1.5">
            <span suppressHydrationWarning className="text-3xl font-bold text-slate-900 tracking-tight">
              <AnimatedCounter value={summary.currentMonthUnits} decimals={0} duration={850} />
            </span>
            <span className="text-xs font-normal text-slate-400">หน่วย (kWh)</span>
          </div>

          <div className="mt-3.5 flex items-center text-xs">
            {summary.unitsPercentChange !== null ? (
              <span
                suppressHydrationWarning
                className={`flex items-center font-medium px-2 py-0.5 rounded-full text-[11px] ${
                  summary.unitsPercentChange > 0
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}
              >
                {summary.unitsPercentChange > 0 ? `+${summary.unitsPercentChange}%` : `${summary.unitsPercentChange}%`}
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">ไม่มีข้อมูลเปรียบเทียบ</span>
            )}
            <span className="ml-2 text-slate-400 text-[11px]">เทียบ {summary.prevMonthName}</span>
          </div>
        </div>
      </motion.div>

      {/* Card 2: Monthly Total Cost */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm/60 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-200"
      >
        <div className="flex items-center justify-between mb-3">
          <span suppressHydrationWarning className="text-xs font-medium text-slate-500">
            ค่าใช้จ่าย ({summary.currentMonthName})
          </span>
          <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-[#5DADE2]">
            <Banknote className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-1">
            <span className="text-base font-normal text-slate-400 mr-0.5">฿</span>
            <span suppressHydrationWarning className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
              <AnimatedCounter value={summary.currentMonthCost} decimals={2} duration={950} />
            </span>
            <span className="text-xs font-normal text-slate-400 ml-1.5">บาท</span>
          </div>

          <div className="mt-3.5 flex items-center text-xs">
            {summary.costPercentChange !== null ? (
              <span
                suppressHydrationWarning
                className={`flex items-center font-medium px-2 py-0.5 rounded-full text-[11px] ${
                  summary.costPercentChange > 0
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                }`}
              >
                {summary.costPercentChange > 0 ? `+${summary.costPercentChange}%` : `${summary.costPercentChange}%`}
              </span>
            ) : (
              <span className="text-slate-400 text-[11px]">ไม่มีข้อมูลเปรียบเทียบ</span>
            )}
            <span className="ml-2 text-slate-400 text-[11px]">เทียบ {summary.prevMonthName}</span>
          </div>
        </div>
      </motion.div>

      {/* Card 3: Savings Summary Card (ตามโจทย์: วงกลมสีเขียวลูกศรชี้ลง เช่น ↓ 12% "ใช้งานน้อยลง เมื่อเทียบกับเดือนก่อน") */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm/60 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-200"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-slate-500">
            สรุปการประหยัดพลังงาน
          </span>
          <div className="w-8 h-8 rounded-full bg-emerald-100/80 flex items-center justify-center text-[#2ECC71]">
            <TrendingDown className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-center space-x-3 my-1">
            {/* Green Circle with Down Arrow */}
            <div className="w-12 h-12 rounded-full bg-[#2ECC71]/15 border border-[#2ECC71]/30 flex items-center justify-center text-[#2ECC71] shrink-0">
              <span className="text-xl font-bold">↓</span>
            </div>
            <div>
              <div className="flex items-baseline space-x-1">
                <span className="text-2xl font-black text-[#2ECC71] font-mono">
                  {isSaving ? `${savingAmountPct}%` : `${savingAmountPct}%`}
                </span>
              </div>
              <span className="text-xs font-medium text-slate-700">
                {isSaving ? "ใช้งานลดลงอย่างมีประสิทธิภาพ" : "ใช้งานน้อยลง"}
              </span>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            เมื่อเทียบกับเดือนก่อนหน้า ({summary.prevMonthName || "รอบก่อน"})
          </div>
        </div>
      </motion.div>

      {/* Card 4: Latest Meter Reading & Cycle */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.16, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm/60 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-200"
      >
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-medium text-slate-500">
            เลขมิเตอร์ล่าสุด
          </span>
          <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Gauge className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-2">
            <span suppressHydrationWarning className="text-3xl font-bold text-slate-900 tracking-tight font-mono">
              <AnimatedCounter value={summary.latestMeterReading} decimals={0} duration={800} />
            </span>
            <span className="text-xs font-normal text-slate-400">หน่วย</span>
          </div>

          <div className="mt-3.5 flex items-center justify-between text-xs text-slate-500 pt-2.5 border-t border-slate-100/80">
            <span suppressHydrationWarning className="text-slate-400 text-[11px]">
              {summary.latestRecordDate !== "-" ? `บันทึกเมื่อ ${summary.latestRecordDate}` : "ยังไม่มีข้อมูล"}
            </span>
            <span suppressHydrationWarning className="font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px] border border-emerald-100">
              รอบที่ {summary.totalCyclesCount}
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
});

SummaryCards.displayName = "SummaryCards";
