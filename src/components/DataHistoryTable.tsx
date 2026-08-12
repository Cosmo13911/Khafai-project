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
} from "lucide-react";
import { MeterLog } from "@/types";
import { CustomDatePickerPopover } from "./CustomDatePickerPopover";

export type TimeFilterMode = "this_week" | "this_month" | "this_year" | "all" | "custom";

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
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col transition-all duration-300 ease-out">
      {/* Header section with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">ประวัติการบันทึกมิเตอร์ไฟ</h2>
            <p suppressHydrationWarning className="text-xs text-slate-500">
              {subtitleText}
            </p>
          </div>
        </div>

        {/* Action Controls: Export Dropdown (Secondary) & Primary CTA */}
        <div className="flex items-center space-x-2">
          {/* Single Split Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors cursor-pointer min-h-[44px]"
              title="ส่งออกรายงานข้อมูล"
            >
              <Download className="w-3.5 h-3.5 text-slate-600" />
              <span>ส่งออก</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {isExportMenuOpen && (
              <>
                {/* Backdrop overlay */}
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsExportMenuOpen(false)}
                />
                <div className="absolute right-0 top-full mt-1.5 w-60 bg-white rounded-xl border border-slate-200 shadow-xl p-1.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      onExportPDF(filteredLogs);
                    }}
                    className="w-full flex items-start space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <FileText className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-900 whitespace-nowrap">ส่งออกเป็น PDF (.pdf)</span>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">ไฟล์รายงานพร้อมสรุปยอด</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setIsExportMenuOpen(false);
                      onExportCSV(filteredLogs);
                    }}
                    className="w-full flex items-start space-x-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-colors cursor-pointer text-left"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex flex-col min-w-0">
                      <span className="font-semibold text-slate-900 whitespace-nowrap">ส่งออกเป็น CSV (.csv)</span>
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
            className="flex items-center space-x-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg shadow-sm transition-colors cursor-pointer min-h-[44px]"
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
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              timeFilter === "this_week"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            สัปดาห์นี้
          </button>

          <button
            onClick={() => onTimeFilterChange("this_month")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              timeFilter === "this_month"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            เดือนนี้
          </button>

          <button
            onClick={() => onTimeFilterChange("this_year")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              timeFilter === "this_year"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            ปีนี้
          </button>

          <button
            onClick={() => onTimeFilterChange("all")}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              timeFilter === "all"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
            }`}
          >
            ทั้งหมด
          </button>

          <button
            onClick={() => {
              onTimeFilterChange("custom");
              setShowCustomInputs(!showCustomInputs);
            }}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              timeFilter === "custom"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600"
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
            <div className="absolute right-0 top-full mt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
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
            <div className="hidden md:block overflow-hidden rounded-xl border border-slate-200">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                    <th className="py-3.5 px-3 text-left w-[18%] whitespace-nowrap">วันที่บันทึก</th>
                    <th className="py-3.5 px-3 text-right w-[18%] whitespace-nowrap">เลขมิเตอร์</th>
                    <th className="py-3.5 px-3 text-right w-[16%] whitespace-nowrap">หน่วยที่ใช้</th>
                    <th className="py-3.5 px-3 text-right w-[20%] whitespace-nowrap">ยอดค่าไฟ (บาท)</th>
                    <th className="py-3.5 px-3 text-left pl-6 w-[18%] whitespace-nowrap">หมายเหตุ</th>
                    <th className="py-3.5 px-3 text-center w-[10%] whitespace-nowrap">จัดการ</th>
                  </tr>
                </thead>
              </table>
              <div className="max-h-[380px] overflow-y-auto no-scrollbar">
                <table className="w-full text-left text-xs border-collapse">
                  <tbody
                    key={timeFilter}
                    suppressHydrationWarning
                    className="divide-y divide-slate-100 animate-in fade-in slide-in-from-bottom-1 duration-200 ease-out"
                  >
                    {filteredLogs.map((log, index) => (
                      <tr
                        key={log.Log_ID}
                        style={{ animationDelay: `${index * 35}ms` }}
                        className="hover:bg-slate-50/80 transition-colors group animate-stagger"
                      >
                        <td className="py-3 px-3 text-left font-semibold text-slate-900 w-[18%] whitespace-nowrap">
                          {log.Record_Date}
                        </td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-slate-800 w-[18%] whitespace-nowrap">
                          {log.Meter_Reading.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 text-right w-[16%] whitespace-nowrap">
                          {log.Is_New_Meter ? (
                            <span className="text-slate-400 font-medium font-mono">0 kWh</span>
                          ) : (
                            <span className="font-bold text-blue-600 font-mono">
                              {log.Units_Used} kWh
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right w-[20%] whitespace-nowrap">
                          {log.Is_New_Meter || log.Total_Cost === 0 ? (
                            <span className="text-slate-400 font-medium font-mono">฿0.00</span>
                          ) : (
                            <span className="font-bold text-slate-900 font-mono">
                              ฿{log.Total_Cost.toFixed(2)}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-left pl-6 w-[18%] whitespace-nowrap">
                          {log.Is_New_Meter ? (
                            <span className="inline-flex items-center text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200/80 px-2.5 py-0.5 rounded-full whitespace-nowrap">
                              <Info className="w-3 h-3 mr-1 text-blue-500 shrink-0" />
                              รอบมิเตอร์ใหม่
                            </span>
                          ) : (
                            <span className="text-slate-400">-</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-center w-[10%] whitespace-nowrap">
                          <div className="flex items-center justify-center space-x-3">
                            <button
                              onClick={() => onOpenEditModal(log)}
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                              title="แก้ไขรายการ"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => onConfirmDelete(log)}
                              className="w-9 h-9 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer min-h-[36px] min-w-[36px]"
                              title="ลบรายการ"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Mobile View: Card List Format */}
            <div
              key={timeFilter}
              suppressHydrationWarning
              className="block md:hidden space-y-3"
            >
              {filteredLogs.map((log, index) => (
                <div
                  key={log.Log_ID}
                  style={{ animationDelay: `${index * 35}ms` }}
                  className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 relative animate-stagger"
                >
                  <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                    <span className="text-xs font-bold text-slate-900">
                      วันที่: {log.Record_Date}
                    </span>
                    {log.Is_New_Meter && (
                      <span className="inline-flex items-center text-[10px] font-bold text-blue-700 bg-blue-100 border border-blue-200 px-2 py-0.5 rounded-full">
                        รอบมิเตอร์ใหม่
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs pt-1">
                    <div>
                      <span className="text-slate-500 block text-[11px]">เลขมิเตอร์</span>
                      <span className="font-mono font-bold text-slate-800 text-sm">
                        {log.Meter_Reading.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">หน่วยที่ใช้</span>
                      <span className="font-bold text-blue-600 text-sm">
                        {log.Is_New_Meter ? "0 kWh" : `${log.Units_Used} kWh`}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[11px]">ยอดเงินรวม</span>
                      {log.Is_New_Meter || log.Total_Cost === 0 ? (
                        <span className="font-medium text-slate-400 text-sm block">฿0.00</span>
                      ) : (
                        <span className="font-bold text-slate-900 text-sm block">
                          ฿{log.Total_Cost.toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-2.5 pt-2 border-t border-slate-200/60">
                    <button
                      onClick={() => onOpenEditModal(log)}
                      className="flex items-center space-x-1.5 text-xs font-semibold text-blue-600 bg-white border border-blue-200 hover:bg-blue-50 px-3.5 py-2 rounded-lg transition-colors min-h-[40px]"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                      <span>แก้ไข</span>
                    </button>
                    <button
                      onClick={() => onConfirmDelete(log)}
                      className="flex items-center space-x-1.5 text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 px-3.5 py-2 rounded-lg transition-colors min-h-[40px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>ลบ</span>
                    </button>
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
