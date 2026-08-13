"use client";

import React, { useState } from "react";
import { Zap, Loader2, Calendar, X } from "lucide-react";
import { KhafaiLogo } from "./KhafaiLogo";

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCompleteOnboarding: (baselineReading: number, startDate: string) => Promise<void>;
  isLoading: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onClose,
  onCompleteOnboarding,
  isLoading,
}) => {
  const getTodayString = () => new Date().toISOString().substring(0, 10);

  const [reading, setReading] = useState<string>("");
  const [startDate, setStartDate] = useState<string>(getTodayString());
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(reading);
    if (isNaN(num) || num < 0) {
      setError("กรุณากรอกเลขมิเตอร์เริ่มต้นให้ถูกต้อง");
      return;
    }

    setError(null);
    await onCompleteOnboarding(num, startDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
        {/* Close / Skip Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer min-h-[44px] min-w-[44px] transition-colors"
          title="ข้าม / ทำรายการภายหลัง"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Background glow gradient */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-100/60 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />

        {/* Icon & Title Header */}
        <div className="relative z-10">
          <div className="w-16 h-16 mx-auto mb-5 flex items-center justify-center">
            <KhafaiLogo className="w-16 h-16 drop-shadow-md" />
          </div>

          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            ยินดีต้อนรับสู่ Khafai
          </h2>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed max-w-xs mx-auto">
            เพื่อเริ่มใช้งานระบบบันทึกและคำนวณค่าไฟฟ้า กรุณากรอกเลขมิเตอร์ไฟฟ้าตั้งต้นของคุณ
          </p>
        </div>

        {/* Onboarding Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4 text-left relative z-10">
          <div className="w-full max-w-full min-w-0">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              วันที่ตั้งต้น (Initial Date)
            </label>
            <div className="relative w-full max-w-full min-w-0">
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full max-w-full min-w-0 box-border appearance-none bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900 font-semibold text-sm rounded-xl py-3 px-4 pl-11 focus:outline-hidden transition-colors min-h-[44px]"
              />
              <Calendar className="w-5 h-5 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              เลขมิเตอร์เริ่มต้น (Initial Baseline Reading)
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                required
                placeholder="เช่น 1200"
                value={reading}
                onChange={(e) => {
                  setReading(e.target.value);
                  setError(null);
                }}
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900 font-mono font-bold text-lg rounded-xl py-3 px-4 focus:outline-hidden transition-colors"
              />
            </div>
            {error && (
              <p className="text-xs text-rose-600 font-semibold mt-1">{error}</p>
            )}
          </div>

          <div className="flex flex-col space-y-2 pt-2">
            <button
              type="submit"
              disabled={isLoading || !reading}
              className="w-full flex items-center justify-center space-x-2 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-200 transition-all cursor-pointer min-h-[48px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>กำลังตั้งค่า...</span>
                </>
              ) : (
                <>
                  <Zap className="w-5 h-5 fill-current" />
                  <span>เริ่มต้นใช้งาน</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2.5 px-4 text-xs font-semibold text-slate-500 hover:text-slate-700 transition-colors cursor-pointer min-h-[44px]"
            >
              ทำรายการภายหลัง / ข้าม
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
