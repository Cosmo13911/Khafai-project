"use client";

import React, { memo, useState, useMemo } from "react";
import {
  Pencil,
  Trash2,
  FileText,
  Download,
  Plus,
  History,
  Info,
  Calendar,
  ChevronDown,
  FileSpreadsheet,
  X,
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
  onExportCSV: (filteredLogs?: MeterLog[]) => void;
  onExportPDF: (filteredLogs?: MeterLog[]) => void;
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
      return `${filteredLogs.length} รายการตามช่วงเวลา (จากทั้งหมด ${logs.length} รายการ)`;
    }
    return `${logs.length} รายการทั้งหมด`;
  }, [filteredLogs.length, logs.length, timeFilter]);

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm/60 flex flex-col transition-all duration-300 ease-out">
      {/* Header section with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-3 border-b border-slate-100 w-full">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2ECC71] shrink-0">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-slate-900 tracking-tight">ประวัติการบันทึกมิเตอร์ไฟ</h2>
            <p suppressHydrationWarning className="text-xs text-slate-400">
              {subtitleText}
            </p>
          </div>
        </div>

        {/* Action Controls: Export Dropdown (Secondary) & Primary CTA */}
        <div className="flex items-center space-x-2 ml-auto shrink-0">
          {/* Single Split Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center space-x-1.5 text-xs font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-2.5 sm:px-3 py-2 rounded-xl transition-colors cursor-pointer min-h-[38px] sm:min-h-[40px]"
              title="ส่งออกรายงานข้อมูล"
            >
              <Download className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="hidden sm:inline">ส่งออก</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {isExportMenuOpen && (
              <>
                {/* Backdrop overlay */}
                <div
                  className="fixed inset-0 z-40 bg-slate-900/20 backdrop-blur-xs transition-opacity sm:bg-transparent sm:backdrop-blur-none"
                  onClick={() => setIsExportMenuOpen(false)}
                />

                {/* Mobile View: Bottom Sheet */}
                <div className="fixed inset-x-0 bottom-0 z-50 rounded-t-2xl bg-white p-4 shadow-2xl border-t border-slate-100 animate-in slide-in-from-bottom duration-200 sm:hidden">
                  <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-100">
                    <span className="text-sm font-semibold text-slate-900">เลือกรูปแบบการส่งออก</span>
                    <button
                      onClick={() => setIsExportMenuOpen(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="space-y-1.5">
                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        onExportPDF(filteredLogs);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-rose-50 text-rose-600 shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-900">ส่งออกเป็น PDF (.pdf)</span>
                        <span className="text-[10px] text-slate-400">ไฟล์รายงานพร้อมสรุปยอด</span>
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setIsExportMenuOpen(false);
                        onExportCSV(filteredLogs);
                      }}
                      className="w-full flex items-center space-x-3 p-3 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer text-left"
                    >
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 shrink-0">
                        <FileSpreadsheet className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="text-xs font-semibold text-slate-900">ส่งออกเป็น CSV (.csv)</span>
                        <span className="text-[10px] text-slate-400">ไฟล์ข้อมูลตารางดิบ</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Desktop View: Floating Dropdown */}
                <div className="hidden sm:block absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl border border-slate-100 shadow-lg p-1.5 z-50 origin-top-right animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      onExportPDF(filteredLogs);
                    }}
                    className="w-full flex items-start space-x-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <FileText className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-slate-900 whitespace-nowrap">ส่งออกเป็น PDF (.pdf)</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">ไฟล์รายงานพร้อมสรุปยอด</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      onExportCSV(filteredLogs);
                    }}
                    className="w-full flex items-start space-x-2.5 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-medium text-slate-900 whitespace-nowrap">ส่งออกเป็น CSV (.csv)</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">ไฟล์ข้อมูลตารางดิบ</span>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Primary CTA: Add Record */}
          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 text-xs font-medium text-white bg-[#2ECC71] hover:bg-[#27ae60] px-3 sm:px-3.5 py-2 rounded-xl shadow-xs transition-colors cursor-pointer min-h-[38px] sm:min-h-[40px]"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มบันทึก</span>
          </button>
        </div>
      </div>

      {/* Filter Controls Bar Container */}
      <div className="relative mb-3 border-b border-slate-100/60 pb-2">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => onTimeFilterChange("this_week")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              timeFilter === "this_week"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/40"
            }`}
          >
            สัปดาห์นี้
          </button>

          <button
            onClick={() => onTimeFilterChange("this_month")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              timeFilter === "this_month"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/40"
            }`}
          >
            เดือนนี้
          </button>

          <button
            onClick={() => onTimeFilterChange("last_month")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              timeFilter === "last_month"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/40"
            }`}
          >
            เดือนก่อนหน้า
          </button>

          <button
            onClick={() => onTimeFilterChange("this_year")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              timeFilter === "this_year"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/40"
            }`}
          >
            ปีนี้
          </button>

          <button
            onClick={() => onTimeFilterChange("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              timeFilter === "all"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/40"
            }`}
          >
            ทั้งหมด
          </button>

          <button
            onClick={() => {
              onTimeFilterChange("custom");
              setShowCustomInputs(!showCustomInputs);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              timeFilter === "custom"
                ? "bg-slate-900 text-white font-semibold shadow-xs"
                : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/40"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>เลือกช่วงเวลา</span>
          </button>
        </div>

        {/* Floating Custom Date Range Popup (Outside overflow-x-auto container!) */}
        {timeFilter === "custom" && showCustomInputs && (
          <>
            {/* Click outside backdrop overlay */}
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

      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-out ${
          isFilterChanging
            ? "opacity-20 scale-[0.99] blur-[0.5px]"
            : "opacity-100 scale-100 blur-none"
        }`}
      >
        {filteredLogs.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
            {logs.length === 0 ? (
              <span>ยังไม่มีประวัติการบันทึก กดปุ่ม &quot;เพิ่มบันทึก&quot; เพื่อเริ่มต้น</span>
            ) : (
              <span>ไม่พบรายการบันทึกมิเตอร์ไฟในช่วงเวลาที่เลือก</span>
            )}
          </div>
        ) : (
          <>
            {/* Desktop View: Fixed Header + Isolated Scrollable Table Body */}
            <div className="hidden md:block overflow-hidden rounded-xl border border-slate-100">
              <table className="w-full text-left text-xs border-collapse table-fixed">
                <thead>
                  <tr className="bg-slate-50/80 text-slate-500 font-medium border-b border-slate-100">
                    <th className="py-3 px-3 text-left w-[110px] whitespace-nowrap">วันที่บันทึก</th>
                    <th className="py-3 px-3 text-right w-[100px] whitespace-nowrap">เลขมิเตอร์</th>
                    <th className="py-3 px-3 text-right w-[100px] whitespace-nowrap">หน่วยที่ใช้</th>
                    <th className="py-3 px-3 text-right w-[125px] whitespace-nowrap">ยอดค่าไฟ (บาท)</th>
                    <th className="py-3 px-3 text-center w-[125px] whitespace-nowrap">หมายเหตุ</th>
                    <th className="py-3 px-3 text-center w-[75px] whitespace-nowrap">จัดการ</th>
                  </tr>
                </thead>
              </table>
              <div className="max-h-[380px] overflow-y-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse table-fixed">
                  <tbody
                    key={timeFilter}
                    suppressHydrationWarning
                    className="divide-y divide-slate-100/80 animate-in fade-in slide-in-from-bottom-1 duration-200 ease-out"
                  >
                    {filteredLogs.map((log, index) => (
                      <tr
                        key={log.Log_ID}
                        style={{ animationDelay: `${index * 35}ms` }}
                        className="hover:bg-slate-50/60 transition-colors group animate-stagger"
                      >
                        <td className="py-3 px-3 text-left font-medium text-slate-800 w-[110px] whitespace-nowrap">
                          {log.Record_Date}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-medium text-slate-800 w-[100px] whitespace-nowrap">
                          {log.Meter_Reading.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right w-[100px] whitespace-nowrap">
                          {log.Is_New_Meter ? (
                            <span className="text-slate-400 font-mono text-[11px]">0 kWh</span>
                          ) : (
                            <span className="font-semibold text-blue-600 font-mono">
                              {log.Units_Used} kWh
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right w-[125px] whitespace-nowrap">
                          {log.Is_New_Meter || log.Total_Cost === 0 ? (
                            <span className="text-slate-400 font-mono text-[11px]">
                              <span className="text-slate-400 mr-0.5 font-normal">฿</span>0.00
                            </span>
                          ) : (
                            <span className="font-semibold text-slate-900 font-mono">
                              <span className="text-slate-400 mr-0.5 font-normal">฿</span>
                              {log.Total_Cost.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center w-[125px] whitespace-nowrap">
                          {log.Is_New_Meter ? (
                            <span className="inline-flex items-center justify-center text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-full whitespace-nowrap">
                              <Info className="w-3 h-3 mr-1 text-blue-500 shrink-0" />
                              รอบมิเตอร์ใหม่
                            </span>
                          ) : (
                            <span className="text-slate-300 font-normal text-center inline-block">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center w-[75px] whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-1">
                            <button
                              onClick={() => onOpenEditModal(log)}
                              className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100/80 transition-colors cursor-pointer"
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

            {/* Mobile View: Ultra-Compact Card UI */}
            <div
              key={timeFilter}
              suppressHydrationWarning
              className="block md:hidden space-y-2 max-h-[380px] overflow-y-auto no-scrollbar"
            >
              {filteredLogs.map((log, index) => (
                <div
                  key={log.Log_ID}
                  style={{ animationDelay: `${index * 35}ms` }}
                  className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 space-y-1.5 relative animate-stagger hover:bg-slate-100/50 transition-colors"
                >
                  {/* Top Row: Date & Badge on Left | Total Cost on Right */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-semibold text-slate-800">
                        {log.Record_Date}
                      </span>
                      {log.Is_New_Meter && (
                        <span className="inline-flex items-center text-[10px] font-medium text-blue-700 bg-blue-50 border border-blue-100 px-1.5 py-0.2 rounded-full">
                          รอบมิเตอร์ใหม่
                        </span>
                      )}
                    </div>

                    <div>
                      {log.Is_New_Meter || log.Total_Cost === 0 ? (
                        <span className="font-normal text-slate-400 text-xs font-mono">
                          <span className="text-slate-400 mr-0.5">฿</span>0.00
                        </span>
                      ) : (
                        <span className="font-bold text-slate-900 text-sm font-mono">
                          <span className="text-slate-400 font-normal mr-0.5">฿</span>
                          {log.Total_Cost.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2,
                          })}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Second Row: Value-First Specs + Icon-Only Action Buttons */}
                  <div className="flex items-center justify-between pt-1.5 border-t border-slate-200/50">
                    {/* Left: Value-First Specs (19 kWh • มิเตอร์ 1,982) */}
                    <div className="flex items-center space-x-1.5 text-xs text-slate-500">
                      {log.Is_New_Meter ? (
                        <span className="font-normal text-slate-400 font-mono text-[11px]">0 kWh</span>
                      ) : (
                        <span className="font-semibold text-blue-600 font-mono text-xs">
                          {log.Units_Used} kWh
                        </span>
                      )}
                      <span className="text-slate-300">•</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        มิเตอร์ {log.Meter_Reading.toLocaleString()}
                      </span>
                    </div>

                    {/* Right: Icon-Only Action Buttons */}
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => onOpenEditModal(log)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
                        title="แก้ไข"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onConfirmDelete(log)}
                        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
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
