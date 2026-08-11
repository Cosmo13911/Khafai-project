"use client";

import React, { useState } from "react";
import { Zap, Loader2, Calendar } from "lucide-react";

interface OnboardingModalProps {
  isOpen: boolean;
  onCompleteOnboarding: (baselineReading: number, startDate: string) => Promise<void>;
  isLoading: boolean;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
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
        {/* Background glow gradient */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-blue-100/60 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-40 h-40 bg-emerald-100/60 rounded-full blur-2xl pointer-events-none" />

        {/* Icon & Title Header */}
        <div className="relative z-10">
          <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200">
            <Zap className="w-9 h-9 fill-current" />
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
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              วันที่ตั้งต้น (Initial Date)
            </label>
            <div className="relative">
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 focus:border-blue-600 focus:bg-white text-slate-900 font-semibold text-sm rounded-xl py-3 px-4 pl-11 focus:outline-hidden transition-colors"
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

          <button
            type="submit"
            disabled={isLoading || !reading}
            className="w-full mt-2 flex items-center justify-center space-x-2 py-3.5 px-6 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-200 transition-all cursor-pointer min-h-[48px]"
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
        </form>
      </div>
    </div>
  );
};
