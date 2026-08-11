"use client";

import React, { memo } from "react";
import { TrendingUp, TrendingDown, Zap, Banknote, Layers } from "lucide-react";
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
            ยอดใช้ไฟเดือนนี้ ({summary.currentMonthName})
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-2">
            <span suppressHydrationWarning className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.currentMonthUnits.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-slate-500">หน่วย (kWh)</span>
          </div>

          <div className="mt-3 flex items-center text-xs">
            {summary.unitsPercentChange !== null ? (
              <span
                suppressHydrationWarning
                className={`flex items-center font-bold px-2 py-0.5 rounded-full ${
                  isUnitsUp
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
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
              <span className="text-slate-400 font-medium">ไม่มีข้อมูลเดือนก่อนหน้า</span>
            )}
            <span className="ml-2 text-slate-500">เทียบกับเดือนที่แล้ว</span>
          </div>
        </div>
      </div>

      {/* Card 2: Monthly Total Cost */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between transition-all hover:shadow-md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            ค่าใช้จ่ายประจำเดือน
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <Banknote className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-1">
            <span className="text-sm font-bold text-slate-600">฿</span>
            <span suppressHydrationWarning className="text-3xl font-extrabold text-slate-900 tracking-tight">
              {summary.currentMonthCost.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </span>
            <span className="text-sm font-semibold text-slate-500 ml-1">บาท</span>
          </div>

          <div className="mt-3 flex items-center text-xs">
            {summary.costPercentChange !== null ? (
              <span
                suppressHydrationWarning
                className={`flex items-center font-bold px-2 py-0.5 rounded-full ${
                  isCostUp
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-emerald-50 text-emerald-600 border border-emerald-100"
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
              <span className="text-slate-400 font-medium">ไม่มีข้อมูลเดือนก่อนหน้า</span>
            )}
            <span className="ml-2 text-slate-500">เทียบกับเดือนที่แล้ว</span>
          </div>
        </div>
      </div>

      {/* Card 3: Tariff Rate & Cycles */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
            อัตราค่าไฟ & รอบมิเตอร์
          </span>
          <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <Layers className="w-5 h-5" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline space-x-2">
            <span suppressHydrationWarning className="text-3xl font-extrabold text-blue-600 tracking-tight">
              ฿{summary.currentRate.toFixed(2)}
            </span>
            <span className="text-sm font-semibold text-slate-500">บาท / หน่วย</span>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-500 pt-2 border-t border-slate-100">
            <span>จำนวนรอบมิเตอร์ทั้งหมด:</span>
            <span suppressHydrationWarning className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
              {summary.totalCyclesCount} รอบ
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

SummaryCards.displayName = "SummaryCards";
