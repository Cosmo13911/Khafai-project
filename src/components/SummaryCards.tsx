"use client";

import React, { memo } from "react";
import { TrendingUp, TrendingDown, Zap, Banknote, Gauge } from "lucide-react";
import { SummaryData } from "@/types";

interface SummaryCardsProps {
  summary: SummaryData;
}

export const SummaryCards: React.FC<SummaryCardsProps> = memo(({ summary }) => {
  const isUnitsUp = summary.unitsPercentChange !== null && summary.unitsPercentChange > 0;
  const isCostUp = summary.costPercentChange !== null && summary.costPercentChange > 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Card 1: Monthly Units Consumed */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span suppressHydrationWarning className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            ยอดใช้ไฟ ({summary.currentMonthName})
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-1.5">
            <span suppressHydrationWarning className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.currentMonthUnits.toLocaleString()}
            </span>
            <span className="text-sm font-normal text-slate-500 align-baseline">หน่วย (kWh)</span>
          </div>

          <div className="mt-3 flex items-center text-xs">
            {summary.unitsPercentChange !== null ? (
              <span
                suppressHydrationWarning
                className={`flex items-center font-bold px-2.5 py-0.5 rounded-full ${
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
      </div>

      {/* Card 2: Monthly Total Cost */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span suppressHydrationWarning className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            ค่าใช้จ่าย ({summary.currentMonthName})
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-1">
            <span className="text-lg font-medium text-slate-500 mr-0.5">฿</span>
            <span suppressHydrationWarning className="text-3xl font-bold text-slate-800 tracking-tight font-mono">
              {summary.currentMonthCost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-sm font-normal text-slate-400 ml-1.5 align-baseline">บาท</span>
          </div>

          <div className="mt-3 flex items-center text-xs">
            {summary.costPercentChange !== null ? (
              <span
                suppressHydrationWarning
                className={`flex items-center font-bold px-2.5 py-0.5 rounded-full ${
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
      </div>

      {/* Card 3: Latest Meter Reading & Cycle */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            เลขมิเตอร์ล่าสุด
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Gauge className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-2">
            <span suppressHydrationWarning className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
              {summary.latestMeterReading.toLocaleString()}
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
      </div>
    </div>
  );
});

SummaryCards.displayName = "SummaryCards";
