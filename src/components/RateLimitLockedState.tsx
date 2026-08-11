"use client";

import React, { useState, useEffect } from "react";
import { Lock, RefreshCw } from "lucide-react";

interface RateLimitLockedStateProps {
  remainingSeconds: number;
  onResetLock: () => Promise<void>;
}

export const RateLimitLockedState: React.FC<RateLimitLockedStateProps> = ({
  remainingSeconds: initialSeconds,
  onResetLock,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
    const interval = setInterval(() => {
      setSecondsLeft((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [initialSeconds]);

  const formatCountdown = (totalSecs: number) => {
    const minutes = Math.floor(totalSecs / 60);
    const seconds = totalSecs % 60;
    if (minutes > 0) {
      return `${minutes} นาที ${seconds < 10 ? `0${seconds}` : seconds} วินาที`;
    }
    return `${seconds} วินาที`;
  };

  const handleReset = async () => {
    setIsResetting(true);
    await onResetLock();
    setIsResetting(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 text-center space-y-5 relative">
        {/* Large Lock Icon */}
        <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
          <Lock className="w-10 h-10" />
        </div>

        {/* Locked Message as explicitly styled in SRS Page 10 */}
        <div>
          <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
            ระบบถูกระงับชั่วคราว
          </h2>
          <p className="text-xs text-slate-500 mt-2">
            Server-side Anti-Abuse Rate Limiter (เกิน 3 ครั้ง/นาที)
          </p>
        </div>

        <div className="bg-rose-50 border border-rose-200 rounded-2xl p-4 text-rose-900">
          <span className="block text-xs font-semibold uppercase tracking-wider text-rose-700">
            เวลานับถอยหลังปลดล็อก
          </span>
          <span className="block text-2xl font-black text-rose-600 mt-1 font-mono">
            {formatCountdown(secondsLeft)}
          </span>
        </div>

        <p className="text-xs text-slate-500 leading-relaxed">
          กรุณาลองใหม่เมื่อครบเวลานับถอยหลัง เพื่อป้องกันการสแปมข้อมูลในระบบ Google Sheets
        </p>

        {/* Demo Unlock Button */}
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="w-full flex items-center justify-center space-x-2 py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer min-h-[44px]"
        >
          <RefreshCw className={`w-4 h-4 text-slate-600 ${isResetting ? "animate-spin" : ""}`} />
          <span>ปลดล็อกระบบทันที (สำหรับทดสอบ Demo)</span>
        </button>
      </div>
    </div>
  );
};
