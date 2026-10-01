"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, AlertCircle, Calendar, RefreshCw } from "lucide-react";
import { MeterLog, UserProfile } from "@/types";
import { validateMeterReadingRange } from "@/lib/khafai-engine";

interface QuickMeterBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    Record_Date: string;
    Meter_Reading: number;
    Is_New_Meter: boolean;
  }) => Promise<void>;
  existingLogs: MeterLog[];
  user: UserProfile;
  isLoading: boolean;
}

export const QuickMeterBottomSheet: React.FC<QuickMeterBottomSheetProps> = ({
  isOpen,
  onClose,
  onSave,
  existingLogs,
  user,
  isLoading,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const getTodayString = () => new Date().toISOString().substring(0, 10);

  const [meterReading, setMeterReading] = useState<string>("");
  const [recordDate, setRecordDate] = useState<string>(getTodayString());
  const [isNewMeter, setIsNewMeter] = useState<boolean>(false);
  const [showAdvanced, setShowAdvanced] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Find chronologically preceding log based on current recordDate
  const prevLog = React.useMemo(() => {
    if (!existingLogs || existingLogs.length === 0) return null;
    const sorted = [...existingLogs].sort((a, b) => {
      const d = a.Record_Date.localeCompare(b.Record_Date);
      if (d !== 0) return d;
      return a.Created_At.localeCompare(b.Created_At);
    });
    let found: MeterLog | null = null;
    for (let i = 0; i < sorted.length; i++) {
      if (sorted[i].Record_Date <= recordDate) {
        found = sorted[i];
      } else {
        break;
      }
    }
    // If no preceding log before recordDate, fallback to latest log overall
    return found || sorted[sorted.length - 1];
  }, [existingLogs, recordDate]);

  const previousReading = prevLog ? prevLog.Meter_Reading : 0;
  const ratePerUnit = user?.Current_Rate_Per_Unit || 8.0;

  useEffect(() => {
    if (isOpen) {
      setMeterReading("");
      setRecordDate(getTodayString());
      setIsNewMeter(false);
      setShowAdvanced(false);
      setErrorMessage(null);

      // Auto-focus input on open
      setTimeout(() => {
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen]);

  // Adjust input via Quick Numerical Steppers (+1.0, +5.0, +10.0)
  const adjustInput = (amount: number) => {
    const current = parseFloat(meterReading) || (previousReading > 0 ? previousReading + amount : amount);
    const nextVal = (current + (meterReading ? amount : 0)).toFixed(1);
    setMeterReading(nextVal);
  };

  // Real-time calculation
  const numericInput = parseFloat(meterReading);
  const isValidNumber = !isNaN(numericInput) && numericInput >= 0;

  let calculatedUnits = 0;
  let calculatedCost = 0;
  let isUnderPrevious = false;

  if (isValidNumber) {
    if (isNewMeter || !prevLog) {
      calculatedUnits = numericInput;
    } else {
      calculatedUnits = numericInput - previousReading;
      if (calculatedUnits < 0) {
        isUnderPrevious = true;
      }
    }
    calculatedCost = Math.max(0, calculatedUnits * ratePerUnit);
  }

  // Range validation
  useEffect(() => {
    if (!meterReading.trim()) {
      setErrorMessage(null);
      return;
    }

    if (!isValidNumber) {
      setErrorMessage("กรุณากรอกตัวเลขจำนวนจริง (ห้ามติดลบ)");
      return;
    }

    const validation = validateMeterReadingRange(
      existingLogs,
      numericInput,
      recordDate,
      isNewMeter
    );

    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || "ตัวเลขมิเตอร์ไม่ถูกต้องตามช่วงเวลา");
    } else {
      setErrorMessage(null);
    }
  }, [meterReading, numericInput, isValidNumber, isNewMeter, recordDate, existingLogs]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!meterReading.trim() || !isValidNumber) {
      setErrorMessage("กรุณาระบุเลขมิเตอร์ที่ถูกต้อง");
      return;
    }

    const validation = validateMeterReadingRange(
      existingLogs,
      numericInput,
      recordDate,
      isNewMeter
    );

    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || "ตัวเลขมิเตอร์ไม่ถูกต้อง");
      return;
    }

    try {
      await onSave({
        Record_Date: recordDate,
        Meter_Reading: numericInput,
        Is_New_Meter: isNewMeter,
      });
      onClose();
    } catch {
      // Error handled by parent toast
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop with Fade In & Out */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed inset-0 bg-slate-900/35 backdrop-blur-xs cursor-pointer"
            onClick={onClose}
          />

          {/* Bottom Sheet with Spring Slide In & Out */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320, mass: 0.8 }}
            className="relative w-full max-w-[420px] bg-white rounded-t-3xl p-6 shadow-2xl max-h-[90vh] overflow-y-auto pb-safe z-10 select-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sheet Handle */}
            <div className="w-12 h-1 bg-slate-200 rounded-full mx-auto mb-5" />

        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-medium text-slate-900">บันทึกเลขมิเตอร์</h3>
            <p className="text-xs text-slate-400">
              {prevLog ? `จดเลขครั้งก่อน: ${previousReading.toLocaleString()} kWh (${prevLog.Record_Date})` : "ยังไม่มีข้อมูลจดเลขครั้งก่อน"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors cursor-pointer text-xs"
            id="btn-close-sheet"
            type="button"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Meter Input Field */}
          <div className="my-5">
            <label
              className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider"
              htmlFor="meter-input"
            >
              เลขมิเตอร์ปัจจุบัน (kWh)
            </label>
            <div className="relative">
              <input
                ref={inputRef}
                className="w-full text-3xl font-light tabular-nums py-3 px-4 rounded-xl border border-slate-200 focus:border-slate-800 focus:ring-0 outline-none text-slate-900 tracking-tight bg-slate-50/50 transition-colors"
                id="meter-input"
                placeholder={prevLog ? (previousReading + 10.0).toFixed(1) : "เช่น 1000.0"}
                step="any"
                inputMode="decimal"
                type="number"
                value={meterReading}
                onChange={(e) => setMeterReading(e.target.value)}
                autoComplete="off"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400 font-normal pointer-events-none">
                kWh
              </span>
            </div>
          </div>

          {/* Quick Numerical Steppers (+1.0, +5.0, +10.0) */}
          <div className="flex items-center justify-between gap-2 mb-4">
            <button
              type="button"
              onClick={() => adjustInput(1.0)}
              className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              +1.0
            </button>
            <button
              type="button"
              onClick={() => adjustInput(5.0)}
              className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              +5.0
            </button>
            <button
              type="button"
              onClick={() => adjustInput(10.0)}
              className="flex-1 py-2 text-xs font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 active:scale-95 transition-all cursor-pointer"
            >
              +10.0
            </button>
          </div>

          {/* Live Calculation Preview */}
          {isValidNumber && !errorMessage && calculatedUnits >= 0 && (
            <div className="bg-emerald-50/80 border border-emerald-100 rounded-xl p-3 flex items-center justify-between text-xs text-emerald-900 animate-in fade-in">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>
                  ใช้เพิ่ม: <strong>+{calculatedUnits.toFixed(1)}</strong> kWh
                </span>
              </div>
              <span className="font-semibold text-emerald-700">
                +฿{calculatedCost.toFixed(2)}
              </span>
            </div>
          )}

          {/* Error Notice */}
          {errorMessage && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 rounded-xl p-3 text-xs flex flex-col gap-2 animate-in fade-in">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
              {/* Quick helper when number is lower than previous reading */}
              {isUnderPrevious && !isNewMeter && (
                <div className="pt-2 border-t border-rose-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-rose-600 font-light">
                    เปลี่ยนมิเตอร์ / ย้ายห้องใหม่ หรือมิเตอร์รีเซ็ต?
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setIsNewMeter(true);
                      setShowAdvanced(true);
                      setErrorMessage(null);
                    }}
                    className="text-[11px] font-semibold text-rose-800 bg-white hover:bg-rose-100/80 px-2.5 py-1 rounded-lg border border-rose-300 shadow-2xs transition-all cursor-pointer shrink-0"
                  >
                    เริ่มรอบมิเตอร์ใหม่ ↺
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Advanced options (Date & New cycle) */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-[11px] text-slate-400 hover:text-slate-700 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <span>{showAdvanced ? "▲ ซ่อนตัวเลือกเพิ่มเติม" : "▼ ตัวเลือกเพิ่มเติม (วันที่ / รอบมิเตอร์)"}</span>
            </button>

            {showAdvanced && (
              <div className="mt-2.5 p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2.5 text-xs animate-in fade-in">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-slate-400" /> วันที่บันทึก
                  </span>
                  <input
                    type="date"
                    value={recordDate}
                    onChange={(e) => setRecordDate(e.target.value)}
                    className="text-xs text-slate-800 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none"
                  />
                </div>
                <label className="flex items-center justify-between cursor-pointer pt-1 border-t border-slate-200/50">
                  <span className="text-slate-500 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3 text-slate-400" /> เริ่มนับรอบใหม่ (New Cycle)
                  </span>
                  <input
                    type="checkbox"
                    checked={isNewMeter}
                    onChange={(e) => setIsNewMeter(e.target.checked)}
                    className="w-3.5 h-3.5 rounded text-slate-900 border-slate-300"
                  />
                </label>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || !meterReading.trim() || !!errorMessage}
            className="w-full py-3.5 bg-slate-900 text-white rounded-xl font-normal text-sm tracking-wide hover:bg-slate-800 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed shadow-xs"
            id="btn-save-meter"
          >
            {isLoading ? <span>กำลังบันทึก...</span> : <span>บันทึกข้อมูล</span>}
          </button>
        </form>
      </motion.div>
    </div>
  )}
</AnimatePresence>
  );
};
