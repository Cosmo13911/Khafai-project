"use client";

import React, { useState, useEffect } from "react";
import { X, Loader2, ToggleRight, Calendar, Hash, AlertTriangle } from "lucide-react";
import { MeterLog } from "@/types";
import { validateMeterReadingRange } from "@/lib/khafai-engine";

interface LogFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    Record_Date: string;
    Meter_Reading: number;
    Is_New_Meter: boolean;
  }) => Promise<void>;
  editingLog: MeterLog | null;
  existingLogs: MeterLog[];
  isLoading: boolean;
}

export const LogFormModal: React.FC<LogFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingLog,
  existingLogs,
  isLoading,
}) => {
  const getTodayString = () => new Date().toISOString().substring(0, 10);

  const [recordDate, setRecordDate] = useState<string>(getTodayString());
  const [meterReading, setMeterReading] = useState<string>("");
  const [isNewMeter, setIsNewMeter] = useState<boolean>(false);

  const [rangeError, setRangeError] = useState<string | null>(null);

  useEffect(() => {
    if (editingLog) {
      setRecordDate(editingLog.Record_Date);
      setMeterReading(editingLog.Meter_Reading.toString());
      setIsNewMeter(editingLog.Is_New_Meter);
    } else {
      setRecordDate(getTodayString());
      setMeterReading("");
      setIsNewMeter(false);
    }
    setRangeError(null);
  }, [editingLog, isOpen]);

  // Real-time Range Validation check as user types
  useEffect(() => {
    if (!meterReading || isNaN(Number(meterReading))) {
      setRangeError(null);
      return;
    }

    const numVal = Number(meterReading);
    const validation = validateMeterReadingRange(
      existingLogs,
      numVal,
      recordDate,
      isNewMeter,
      editingLog?.Log_ID
    );

    if (!validation.isValid) {
      setRangeError(validation.errorMessage || "ตัวเลขมิเตอร์ไม่ถูกต้องตามช่วงเวลา");
    } else {
      setRangeError(null);
    }
  }, [meterReading, recordDate, isNewMeter, existingLogs, editingLog]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!meterReading || isNaN(Number(meterReading))) {
      setRangeError("กรุณากรอกตัวเลขมิเตอร์ไฟฟ้าให้ถูกต้อง");
      return;
    }

    const numVal = Number(meterReading);
    const validation = validateMeterReadingRange(
      existingLogs,
      numVal,
      recordDate,
      isNewMeter,
      editingLog?.Log_ID
    );

    if (!validation.isValid) {
      setRangeError(validation.errorMessage || "ตัวเลขมิเตอร์ไม่ถูกต้อง");
      return;
    }

    await onSave({
      Record_Date: recordDate,
      Meter_Reading: numVal,
      Is_New_Meter: isNewMeter,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            {editingLog ? "แก้ไขรายการบันทึกมิเตอร์ไฟ" : "เพิ่มรายการบันทึกมิเตอร์ไฟ"}
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          {/* Record Date */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              วันที่บันทึก (ย้อนหลังได้)
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={recordDate}
                onChange={(e) => setRecordDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900 font-semibold text-sm rounded-xl py-2.5 px-3 pl-10 focus:outline-hidden transition-colors"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Meter Reading Input */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              เลขมิเตอร์ (Meter Reading)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                placeholder="เช่น 2045"
                value={meterReading}
                onChange={(e) => setMeterReading(e.target.value)}
                className={`w-full bg-slate-50 border ${
                  rangeError
                    ? "border-rose-500 bg-rose-50/30 text-rose-900 focus:border-rose-600"
                    : "border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900"
                } font-mono font-bold text-base rounded-xl py-2.5 px-3 pl-10 focus:outline-hidden transition-colors`}
              />
              <Hash className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>

            {/* Range Validation Error Display */}
            {rangeError && (
              <div className="mt-2 flex items-start space-x-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
                <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                <span>{rangeError}</span>
              </div>
            )}
          </div>

          {/* New Meter Cycle Toggle */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
            <div className="flex items-center justify-between">
              <label htmlFor="new-meter-toggle" className="flex items-center space-x-2 text-xs font-bold text-slate-800 cursor-pointer">
                <ToggleRight className={`w-5 h-5 ${isNewMeter ? "text-blue-600" : "text-slate-400"}`} />
                <span>เริ่มรอบมิเตอร์ใหม่ (ย้ายห้อง/เปลี่ยนมิเตอร์)</span>
              </label>
              <input
                id="new-meter-toggle"
                type="checkbox"
                checked={isNewMeter}
                onChange={(e) => setIsNewMeter(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded-sm border-slate-300 focus:ring-blue-500 cursor-pointer"
              />
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed pl-7">
              ระบบจะเริ่มคำนวณหน่วยที่ใช้ใหม่ โดยไม่นำไปลบกับมิเตอร์ก่อนหน้า
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer min-h-[44px]"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isLoading || !!rangeError}
              className="flex items-center justify-center space-x-2 px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl shadow-md shadow-blue-200 transition-colors cursor-pointer min-h-[44px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : (
                <span>บันทึกข้อมูล</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
