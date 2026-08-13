"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, X, Loader2, CheckCircle2, Zap } from "lucide-react";

interface TariffUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentRate: number;
  onSaveRate: (newRate: number) => Promise<void>;
  isLoading: boolean;
}

export const TariffUpdateModal: React.FC<TariffUpdateModalProps> = ({
  isOpen,
  onClose,
  currentRate,
  onSaveRate,
  isLoading,
}) => {
  const [newRateStr, setNewRateStr] = useState<string>("");
  const [showWarningStep, setShowWarningStep] = useState<boolean>(false);

  useEffect(() => {
    setNewRateStr(currentRate.toString());
    setShowWarningStep(false);
  }, [currentRate, isOpen]);

  if (!isOpen) return null;

  const handleNextOrSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(newRateStr);
    if (isNaN(val) || val <= 0) return;

    if (!showWarningStep) {
      setShowWarningStep(true);
    } else {
      await onSaveRate(val);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900">
            ปรับเปลี่ยนอัตราค่าไฟฟ้าต่อหน่วย
          </h3>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleNextOrSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              อัตราค่าไฟปัจจุบัน (บาทต่อหน่วย)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                value={newRateStr}
                onChange={(e) => {
                  setNewRateStr(e.target.value);
                  setShowWarningStep(false);
                }}
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900 font-bold text-lg rounded-xl py-2.5 px-3 pl-8 focus:outline-hidden transition-colors"
              />
              <span className="absolute left-3 top-3 text-slate-400 font-bold">฿</span>
            </div>
          </div>

          {/* SRS Confirmation Modal Warning Notice with AlertCircle Icon */}
          {showWarningStep && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2 animate-in fade-in duration-150">
              <div className="flex items-start space-x-2.5">
                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-900">
                    ยืนยันการคำนวณย้อนหลังใหม่ทั้งหมด
                  </h4>
                  <p className="text-xs text-amber-800 leading-relaxed mt-1">
                    การเปลี่ยนอัตราค่าไฟ จะส่งผลให้ประวัติการใช้ไฟฟ้าย้อนหลังทั้งหมดถูกคำนวณยอดเงินใหม่ด้วยอัตรานี้
                  </p>
                </div>
              </div>
            </div>
          )}

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
              disabled={isLoading || !newRateStr}
              className={`flex items-center justify-center space-x-2 px-5 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition-colors cursor-pointer min-h-[44px] ${
                showWarningStep
                  ? "bg-amber-600 hover:bg-amber-700 shadow-amber-200"
                  : "bg-blue-600 hover:bg-blue-700 shadow-blue-200"
              }`}
            >
              {isLoading ? (
                <>
                  <Zap className="w-4 h-4 text-yellow-300 animate-bounce" />
                  <span>กำลังบันทึก...</span>
                </>
              ) : showWarningStep ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ยืนยันเปลี่ยนอัตราค่าไฟ</span>
                </>
              ) : (
                <span>ถัดไป</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
