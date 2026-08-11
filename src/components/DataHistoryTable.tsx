"use client";

import React, { memo } from "react";
import {
  Pencil,
  Trash2,
  FileText,
  Download,
  Plus,
  History,
  Info,
} from "lucide-react";
import { MeterLog } from "@/types";

interface DataHistoryTableProps {
  logs: MeterLog[];
  onOpenAddModal: () => void;
  onOpenEditModal: (log: MeterLog) => void;
  onConfirmDelete: (log: MeterLog) => void;
  onExportCSV: () => void;
  onExportPDF: () => void;
}

export const DataHistoryTable: React.FC<DataHistoryTableProps> = memo(({
  logs,
  onOpenAddModal,
  onOpenEditModal,
  onConfirmDelete,
  onExportCSV,
  onExportPDF,
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col h-full">
      {/* Header section with Actions */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">ประวัติการบันทึกมิเตอร์ไฟ</h2>
            <p suppressHydrationWarning className="text-xs text-slate-500">
              รายการบันทึกมิเตอร์ทั้งหมด ({logs.length} รายการ)
            </p>
          </div>
        </div>

        {/* Action Controls & Ghost Export Buttons */}
        <div className="flex items-center flex-wrap gap-2">
          <button
            onClick={onExportCSV}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors cursor-pointer min-h-[44px]"
            title="ส่งออกไฟล์ CSV"
          >
            <FileText className="w-3.5 h-3.5 text-slate-600" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            onClick={onExportPDF}
            className="flex items-center space-x-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-lg transition-colors cursor-pointer min-h-[44px]"
            title="ส่งออกไฟล์ PDF"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>ส่งออก PDF</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center space-x-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3.5 py-2 rounded-lg shadow-sm transition-colors cursor-pointer min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มบันทึก</span>
          </button>
        </div>
      </div>

      {logs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
          <span>ยังไม่มีประวัติการบันทึก กดปุ่ม &quot;เพิ่มบันทึก&quot; เพื่อเริ่มต้น</span>
        </div>
      ) : (
        <>
          {/* Desktop View: Table Format */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <th className="py-3 px-3 rounded-l-lg">วันที่บันทึก</th>
                  <th className="py-3 px-3 text-right">เลขมิเตอร์</th>
                  <th className="py-3 px-3 text-right">หน่วยที่ใช้</th>
                  <th className="py-3 px-3 text-right">ยอดค่าไฟ (บาท)</th>
                  <th className="py-3 px-3 text-center">หมายเหตุ</th>
                  <th className="py-3 px-3 text-center rounded-r-lg">จัดการ</th>
                </tr>
              </thead>
              <tbody suppressHydrationWarning className="divide-y divide-slate-100">
                {logs.map((log) => (
                  <tr
                    key={log.Log_ID}
                    className="hover:bg-slate-50/80 transition-colors group"
                  >
                    <td className="py-3 px-3 font-semibold text-slate-900">
                      {log.Record_Date}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-800">
                      {log.Meter_Reading.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {log.Is_New_Meter ? (
                        <span className="text-slate-400 font-medium">0 kWh</span>
                      ) : (
                        <span className="font-bold text-blue-600">
                          {log.Units_Used} kWh
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {log.Is_New_Meter ? (
                        <span className="text-slate-400 font-medium">฿0.00</span>
                      ) : (
                        <span className="font-extrabold text-emerald-600">
                          ฿{log.Total_Cost.toFixed(2)}
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      {log.Is_New_Meter ? (
                        <span className="inline-flex items-center text-[11px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-full">
                          <Info className="w-3 h-3 mr-1 text-blue-500" />
                          รอบมิเตอร์ใหม่
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-center">
                      <div className="flex items-center justify-center space-x-1">
                        <button
                          onClick={() => onOpenEditModal(log)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
                          title="แก้ไขรายการ"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onConfirmDelete(log)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer min-h-[44px] min-w-[44px]"
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

          {/* Mobile View: Card List Format */}
          <div suppressHydrationWarning className="block md:hidden space-y-3">
            {logs.map((log) => (
              <div
                key={log.Log_ID}
                className="bg-slate-50 rounded-xl p-4 border border-slate-200 space-y-2 relative"
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
                    <span className="font-extrabold text-emerald-600 text-sm">
                      {log.Is_New_Meter ? "฿0.00" : `฿${log.Total_Cost.toFixed(2)}`}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-200/60">
                  <button
                    onClick={() => onOpenEditModal(log)}
                    className="flex items-center space-x-1 text-xs font-semibold text-blue-600 bg-white border border-blue-200 px-3 py-1.5 rounded-lg min-h-[44px]"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>แก้ไข</span>
                  </button>
                  <button
                    onClick={() => onConfirmDelete(log)}
                    className="flex items-center space-x-1 text-xs font-semibold text-rose-600 bg-white border border-rose-200 px-3 py-1.5 rounded-lg min-h-[44px]"
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
  );
});

DataHistoryTable.displayName = "DataHistoryTable";
