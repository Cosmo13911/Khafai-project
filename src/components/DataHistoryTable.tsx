"use client";

import React, { memo, useState, useMemo } from "react";
import {
  Pencil,
  Trash2,
  FileText,
  Download,
  Plus,
  History,
  Calendar,
  ChevronDown,
  FileSpreadsheet,
  X,
  Sparkles,
  Inbox,
} from "lucide-react";
import { MeterLog } from "@/types";
import { CustomDatePickerPopover } from "./CustomDatePickerPopover";

export type TimeFilterMode = "this_week" | "this_month" | "last_month" | "this_year" | "all" | "custom";

interface DataHistoryTableProps {
  logs: MeterLog[];
  filteredLogs: MeterLog[];
  timeFilter: TimeFilterMode;
  isFilterChanging?: boolean;
  onTimeFilterChange: (mode: TimeFilterMode) => void;
  customStartDate: string;
  onCustomStartDateChange: (date: string) => void;
  customEndDate: string;
  onCustomEndDateChange: (date: string) => void;
  onOpenAddModal: () => void;
  onOpenEditModal: (log: MeterLog) => void;
  onConfirmDelete: (log: MeterLog) => void;
  onExportCSV: (filteredLogs?: MeterLog[], customRange?: { start?: string; end?: string }) => void;
  onExportPDF: (filteredLogs?: MeterLog[], customRange?: { start?: string; end?: string }) => void;
}

export const DataHistoryTable: React.FC<DataHistoryTableProps> = memo(({
  logs,
  filteredLogs,
  timeFilter,
  isFilterChanging = false,
  onTimeFilterChange,
  customStartDate,
  onCustomStartDateChange,
  customEndDate,
  onCustomEndDateChange,
  onOpenAddModal,
  onOpenEditModal,
  onConfirmDelete,
  onExportCSV,
  onExportPDF,
}) => {
  const [showCustomInputs, setShowCustomInputs] = useState<boolean>(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState<boolean>(false);

  // Active custom date range object if custom filter is active
  const currentCustomRange = useMemo(() => {
    return timeFilter === "custom" && (customStartDate || customEndDate)
      ? { start: customStartDate, end: customEndDate }
      : undefined;
  }, [timeFilter, customStartDate, customEndDate]);

  // Dynamic counter subtitle
  const subtitleText = useMemo(() => {
    if (timeFilter === "this_month") {
      return `${filteredLogs.length} รายการในเดือนนี้ (จากทั้งหมด ${logs.length} รายการ)`;
    }
    if (timeFilter === "last_month") {
      return `${filteredLogs.length} รายการในเดือนก่อนหน้า (จากทั้งหมด ${logs.length} รายการ)`;
    }
    if (timeFilter === "this_week") {
      return `${filteredLogs.length} รายการในสัปดาห์นี้ (จากทั้งหมด ${logs.length} รายการ)`;
    }
    if (timeFilter === "this_year") {
      return `${filteredLogs.length} รายการในปีนี้ (จากทั้งหมด ${logs.length} รายการ)`;
    }
    if (timeFilter === "custom") {
      if (customStartDate && customEndDate) {
        return `${filteredLogs.length} รายการ (${customStartDate} ถึง ${customEndDate})`;
      }
      return `${filteredLogs.length} รายการตามช่วงเวลา`;
    }
    return `${logs.length} รายการทั้งหมด`;
  }, [filteredLogs.length, logs.length, timeFilter, customStartDate, customEndDate]);

  // Display logs in reverse-chronological order (newest date first on top)
  const displayLogs = useMemo(() => {
    return [...filteredLogs].reverse();
  }, [filteredLogs]);

  // Summary statistics for the currently filtered view
  const periodStats = useMemo(() => {
    const units = filteredLogs.reduce((sum, log) => sum + (log.Units_Used || 0), 0);
    const cost = filteredLogs.reduce((sum, log) => sum + (log.Total_Cost || 0), 0);
    return { units, cost, count: filteredLogs.length };
  }, [filteredLogs]);

  // Filter mode human-readable label
  const filterLabel = useMemo(() => {
    switch (timeFilter) {
      case "this_week": return "สัปดาห์นี้";
      case "this_month": return "เดือนนี้";
      case "last_month": return "เดือนก่อนหน้า";
      case "this_year": return "ปีนี้";
      case "custom": return customStartDate && customEndDate ? `${customStartDate} ถึง ${customEndDate}` : "ช่วงเวลากำหนดเอง";
      default: return "ทั้งหมด";
    }
  }, [timeFilter, customStartDate, customEndDate]);

  return (
    <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200/80 shadow-[0_2px_16px_rgba(0,0,0,0.03)] flex flex-col transition-all duration-300 ease-out">
      {/* ================= Header section with Actions ================= */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-100 w-full">
        <div className="flex items-center space-x-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-xs">
            <History className="w-4 h-4 stroke-[2]" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight truncate">
                ประวัติบันทึกการใช้ไฟฟ้า
              </h2>
              <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 tabular-nums">
                {filteredLogs.length} รายการ
              </span>
            </div>
            <p suppressHydrationWarning className="text-xs text-slate-400 font-light mt-0.5 truncate">
              {subtitleText}
            </p>
          </div>
        </div>

        {/* Action Controls: Export Dropdown & Primary CTA */}
        <div className="flex items-center space-x-2 ml-auto shrink-0">
          {/* Split Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className={`flex items-center space-x-1.5 text-xs font-medium px-3 py-2 rounded-xl transition-all cursor-pointer min-h-[38px] active:scale-95 ${
                isExportMenuOpen
                  ? "bg-slate-900 text-white shadow-xs border border-transparent"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/70"
              }`}
              title="ส่งออกรายงานข้อมูล"
            >
              <Download className={`w-3.5 h-3.5 shrink-0 ${isExportMenuOpen ? "text-white" : "text-slate-500"}`} />
              <span>ส่งออก</span>
              <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${isExportMenuOpen ? "rotate-180 text-slate-300" : "text-slate-400"}`} />
            </button>

            {isExportMenuOpen && (
              <>
                {/* Backdrop overlay */}
                <div
                  className="fixed inset-0 z-40 bg-slate-900/30 backdrop-blur-xs transition-opacity sm:bg-transparent sm:backdrop-blur-none"
                  onClick={() => setIsExportMenuOpen(false)}
                />

                {/* Mobile View: Bottom Sheet */}
                <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-3xl bg-white p-5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-slate-100 animate-in slide-in-from-bottom duration-200 sm:hidden select-none">
                  <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />

                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <div>
                      <span className="text-sm font-semibold text-slate-900 block">ส่งออกรายงานข้อมูล</span>
                      <span className="text-xs text-slate-400 font-light">
                        {timeFilter === "custom" && customStartDate && customEndDate
                          ? `ช่วงเวลา: ${customStartDate} ถึง ${customEndDate}`
                          : "เลือกรูปแบบไฟล์รายงาน"}
                      </span>
                    </div>
                    <button
                      onClick={() => setIsExportMenuOpen(false)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer text-xs"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        onExportPDF(filteredLogs, currentCustomRange);
                      }}
                      className="w-full flex items-center space-x-3.5 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all cursor-pointer text-left active:scale-[0.99]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-white shrink-0 shadow-xs">
                        <FileText className="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-900">ส่งออกเป็น PDF (.pdf)</span>
                        <span className="text-[11px] text-slate-400 font-light">
                          {timeFilter === "custom" && customStartDate && customEndDate
                            ? `รายงานสรุปช่วง ${customStartDate} ถึง ${customEndDate}`
                            : "รายงานสรุปค่าไฟและสถิติภาพรวม"}
                        </span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        onExportCSV(filteredLogs, currentCustomRange);
                      }}
                      className="w-full flex items-center space-x-3.5 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all cursor-pointer text-left active:scale-[0.99]"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 shrink-0">
                        <FileSpreadsheet className="w-4 h-4 stroke-[1.8]" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-900">ส่งออกเป็น CSV (.csv)</span>
                        <span className="text-[11px] text-slate-400 font-light">
                          {timeFilter === "custom" && customStartDate && customEndDate
                            ? `ข้อมูลตารางช่วง ${customStartDate} ถึง ${customEndDate}`
                            : "ข้อมูลตารางดิบสำหรับเปิดใน Excel / Sheets"}
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Desktop View: Floating Glass Dropdown */}
                <div className="hidden sm:block absolute right-0 top-full mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-100 shadow-[0_12px_36px_rgba(0,0,0,0.08)] p-1.5 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150 select-none">
                  <div className="px-2.5 py-1.5 mb-1 border-b border-slate-100">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                      {timeFilter === "custom" && customStartDate && customEndDate
                        ? `ช่วง: ${customStartDate} ถึง ${customEndDate}`
                        : "เลือกรูปแบบไฟล์"}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      onExportPDF(filteredLogs, currentCustomRange);
                    }}
                    className="w-full flex items-center space-x-3 p-2.5 text-xs font-medium rounded-xl hover:bg-slate-50 transition-all cursor-pointer text-left group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-900 text-white shrink-0 group-hover:scale-105 transition-transform shadow-2xs">
                      <FileText className="w-4 h-4 stroke-[1.8]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-900">เอกสาร PDF (.pdf)</span>
                      <span className="text-[10px] text-slate-400 font-light">
                        {timeFilter === "custom" && customStartDate && customEndDate
                          ? `${customStartDate} ถึง ${customEndDate}`
                          : "รายงานสรุปยอดและสถิติ"}
                      </span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      onExportCSV(filteredLogs, currentCustomRange);
                    }}
                    className="w-full flex items-center space-x-3 p-2.5 text-xs font-medium rounded-xl hover:bg-slate-50 transition-all cursor-pointer text-left group"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-700 shrink-0 group-hover:scale-105 transition-transform">
                      <FileSpreadsheet className="w-4 h-4 stroke-[1.8]" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-900">ไฟล์ข้อมูล CSV (.csv)</span>
                      <span className="text-[10px] text-slate-400 font-light">
                        {timeFilter === "custom" && customStartDate && customEndDate
                          ? `${customStartDate} ถึง ${customEndDate}`
                          : "ตารางสำหรับ Excel / Sheets"}
                      </span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Primary CTA: Add Record */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 active:scale-95 px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer min-h-[38px]"
          >
            <Plus className="w-4 h-4 stroke-[2]" />
            <span>เพิ่มบันทึก</span>
          </button>
        </div>
      </div>

      {/* ================= Time Filter Navigation Tabs ================= */}
      <div className="relative mb-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
          <button
            onClick={() => onTimeFilterChange("this_week")}
            className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
              timeFilter === "this_week"
                ? "bg-slate-900 text-white font-medium shadow-xs"
                : "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 font-normal border border-transparent"
            }`}
          >
            สัปดาห์นี้
          </button>

          <button
            onClick={() => onTimeFilterChange("this_month")}
            className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
              timeFilter === "this_month"
                ? "bg-slate-900 text-white font-medium shadow-xs"
                : "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 font-normal border border-transparent"
            }`}
          >
            เดือนนี้
          </button>

          <button
            onClick={() => onTimeFilterChange("last_month")}
            className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
              timeFilter === "last_month"
                ? "bg-slate-900 text-white font-medium shadow-xs"
                : "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 font-normal border border-transparent"
            }`}
          >
            เดือนก่อนหน้า
          </button>

          <button
            onClick={() => onTimeFilterChange("this_year")}
            className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
              timeFilter === "this_year"
                ? "bg-slate-900 text-white font-medium shadow-xs"
                : "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 font-normal border border-transparent"
            }`}
          >
            ปีนี้
          </button>

          <button
            onClick={() => onTimeFilterChange("all")}
            className={`px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
              timeFilter === "all"
                ? "bg-slate-900 text-white font-medium shadow-xs"
                : "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 font-normal border border-transparent"
            }`}
          >
            ทั้งหมด
          </button>

          <button
            onClick={() => {
              onTimeFilterChange("custom");
              setShowCustomInputs(!showCustomInputs);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs transition-all cursor-pointer whitespace-nowrap ${
              timeFilter === "custom"
                ? "bg-slate-900 text-white font-medium shadow-xs"
                : "bg-slate-100/80 hover:bg-slate-200/70 text-slate-600 font-normal border border-transparent"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>
              {timeFilter === "custom" && customStartDate && customEndDate
                ? `${customStartDate} ถึง ${customEndDate}`
                : "เลือกช่วงเวลา"}
            </span>
          </button>
        </div>

        {/* Floating Custom Date Range Popup */}
        {timeFilter === "custom" && showCustomInputs && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setShowCustomInputs(false)}
            />
            <div className="absolute right-0 top-full mt-2 z-50 origin-top-right max-w-[calc(100vw-2rem)] animate-in fade-in zoom-in-95 duration-150">
              <CustomDatePickerPopover
                startDate={customStartDate}
                endDate={customEndDate}
                onChange={(start, end) => {
                  onCustomStartDateChange(start);
                  onCustomEndDateChange(end);
                }}
              />
            </div>
          </>
        )}
      </div>

      {/* ================= Summary Stats Strip (UX Enhancement) ================= */}
      {filteredLogs.length > 0 && (
        <div className="mb-3.5 bg-slate-50/80 rounded-xl px-3.5 py-2.5 border border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500 font-light">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
            <span>ช่วงเวลา:</span>
            <strong className="font-medium text-slate-700">{filterLabel}</strong>
            <span className="text-slate-300">•</span>
            <span>{periodStats.count} ครั้งที่จด</span>
          </div>

          <div className="flex items-center gap-3 tabular-nums ml-auto">
            <div className="flex items-center gap-1 text-slate-600">
              <span className="text-slate-400 font-light">รวมหน่วย:</span>
              <span className="font-semibold text-sky-600">
                +{periodStats.units.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh
              </span>
            </div>
            <span className="text-slate-200">|</span>
            <div className="flex items-center gap-1 text-slate-600">
              <span className="text-slate-400 font-light">รวมค่าไฟ:</span>
              <span className="font-bold text-slate-900">
                {periodStats.cost.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* ================= Content Area: Table / Cards / Empty State ================= */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-out ${
          isFilterChanging
            ? "opacity-25 scale-[0.99] blur-[0.5px]"
            : "opacity-100 scale-100 blur-none"
        }`}
      >
        {filteredLogs.length === 0 ? (
          /* Modern Empty State */
          <div className="flex-1 flex flex-col items-center justify-center py-12 px-4 text-center">
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 mb-3 shadow-2xs">
              <Inbox className="w-6 h-6 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-semibold text-slate-800 mb-1">
              {logs.length === 0 ? "ยังไม่มีประวัติการบันทึกมิเตอร์" : "ไม่พบรายการบันทึกในช่วงเวลานี้"}
            </h3>
            <p className="text-xs text-slate-400 font-light max-w-sm mb-4">
              {logs.length === 0
                ? "เริ่มต้นด้วยการแตะปุ่ม 'เพิ่มบันทึก' เพื่อจดเลขมิเตอร์ไฟฟ้ารายการแรก"
                : "ลองปรับเปลี่ยนตัวกรองช่วงเวลา หรือกดปุ่ม 'เพิ่มบันทึก' เพื่อจดเลขมิเตอร์ใหม่"}
            </p>
            {logs.length > 0 && timeFilter !== "all" && (
              <button
                onClick={() => onTimeFilterChange("all")}
                className="text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-1.5 rounded-xl transition-colors cursor-pointer"
              >
                ดูรายการทั้งหมด ({logs.length} รายการ)
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ================= Desktop View: Modern Unified Table ================= */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200/70 bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50/90 text-slate-500 font-semibold text-[11px] uppercase tracking-wider border-b border-slate-200/70 select-none">
                    <th className="py-3 px-3.5 text-left w-[120px] whitespace-nowrap">วันที่บันทึก</th>
                    <th className="py-3 px-3.5 text-right w-[110px] whitespace-nowrap">เลขมิเตอร์</th>
                    <th className="py-3 px-3.5 text-right w-[120px] whitespace-nowrap">หน่วยที่ใช้</th>
                    <th className="py-3 px-3.5 text-right w-[130px] whitespace-nowrap">ยอดค่าไฟ (บาท)</th>
                    <th className="py-3 px-3.5 text-center w-[120px] whitespace-nowrap">สถานะ</th>
                    <th className="py-3 px-3.5 text-center w-[85px] whitespace-nowrap">จัดการ</th>
                  </tr>
                </thead>
              </table>
              <div className="max-h-[400px] overflow-y-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse table-fixed">
                  <tbody
                    key={timeFilter}
                    suppressHydrationWarning
                    className="divide-y divide-slate-100"
                  >
                    {displayLogs.map((log, index) => (
                      <tr
                        key={log.Log_ID}
                        style={{ animationDelay: `${index * 30}ms` }}
                        className="hover:bg-slate-50/70 transition-colors group animate-stagger"
                      >
                        {/* 1. Date */}
                        <td className="py-3 px-3.5 text-left font-medium text-slate-800 w-[120px] whitespace-nowrap tabular-nums">
                          {log.Record_Date}
                        </td>

                        {/* 2. Meter Reading */}
                        <td className="py-3 px-3.5 text-right font-medium text-slate-700 w-[110px] whitespace-nowrap tabular-nums">
                          {log.Meter_Reading.toLocaleString()}
                        </td>

                        {/* 3. Units Used */}
                        <td className="py-3 px-3.5 text-right w-[120px] whitespace-nowrap tabular-nums">
                          {log.Is_New_Meter ? (
                            <span className="text-slate-400 text-xs">0.0 kWh</span>
                          ) : (
                            <span className="font-semibold text-sky-600 bg-sky-50/70 px-2 py-0.5 rounded-lg text-xs">
                              +{log.Units_Used.toFixed(1)} kWh
                            </span>
                          )}
                        </td>

                        {/* 4. Total Cost */}
                        <td className="py-3 px-3.5 text-right w-[130px] whitespace-nowrap tabular-nums">
                          {log.Is_New_Meter || log.Total_Cost === 0 ? (
                            <span className="text-slate-400 text-xs">0.00</span>
                          ) : (
                            <span className="font-semibold text-slate-900 text-xs sm:text-sm">
                              {log.Total_Cost.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}
                            </span>
                          )}
                        </td>

                        {/* 5. Status / Note */}
                        <td className="py-3 px-3.5 text-center w-[120px] whitespace-nowrap">
                          {log.Is_New_Meter ? (
                            <span className="inline-flex items-center justify-center gap-1 text-[11px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                              <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                              รอบมิเตอร์ใหม่
                            </span>
                          ) : (
                            <span className="text-slate-300 font-normal text-center inline-block">-</span>
                          )}
                        </td>

                        {/* 6. Actions */}
                        <td className="py-3 px-3.5 text-center w-[85px] whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => onOpenEditModal(log)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="แก้ไขรายการ"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onConfirmDelete(log)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              title="ลบรายการ"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ================= Mobile View: Refined Card List ================= */}
            <div
              key={timeFilter}
              suppressHydrationWarning
              className="block md:hidden space-y-2.5 max-h-[400px] overflow-y-auto no-scrollbar"
            >
              {displayLogs.map((log, index) => (
                <div
                  key={log.Log_ID}
                  style={{ animationDelay: `${index * 30}ms` }}
                  className="bg-slate-50/70 hover:bg-slate-100/70 rounded-xl p-3.5 border border-slate-100 space-y-2 relative animate-stagger transition-all"
                >
                  {/* Top Row: Date & Status Badge on Left | Total Cost on Right */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-800 tabular-nums">
                        {log.Record_Date}
                      </span>
                      {log.Is_New_Meter && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-full">
                          <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                          รอบใหม่
                        </span>
                      )}
                    </div>

                    <div className="tabular-nums">
                      {log.Is_New_Meter || log.Total_Cost === 0 ? (
                        <span className="font-normal text-slate-400 text-xs">
                          0.00
                        </span>
                      ) : (
                        <span className="font-bold text-slate-900 text-sm">
                          {log.Total_Cost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Second Row: Units & Meter Specs + Action Buttons */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                    {/* Left: Value-First Units & Meter */}
                    <div className="flex items-center space-x-2 text-xs text-slate-500 tabular-nums">
                      {log.Is_New_Meter ? (
                        <span className="font-normal text-slate-400 text-xs">0.0 kWh</span>
                      ) : (
                        <span className="font-semibold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded-md text-xs">
                          +{log.Units_Used.toFixed(1)} kWh
                        </span>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-500 text-xs font-light">
                        มิเตอร์ <strong className="font-medium text-slate-700">{log.Meter_Reading.toLocaleString()}</strong>
                      </span>
                    </div>

                    {/* Right: Action Buttons with comfortable touch target */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onOpenEditModal(log)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer"
                        title="แก้ไข"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onConfirmDelete(log)}
                        className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="ลบ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
});

DataHistoryTable.displayName = "DataHistoryTable";
