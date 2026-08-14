"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Hourglass } from "lucide-react";

interface RateLimitLockedStateProps {
  remainingSeconds: number;
  onTimerComplete?: () => void;
}

export const RateLimitLockedState: React.FC<RateLimitLockedStateProps> = ({
  remainingSeconds: initialSeconds,
  onTimerComplete,
}) => {
  const [secondsLeft, setSecondsLeft] = useState<number>(initialSeconds);

  useEffect(() => {
    setSecondsLeft(initialSeconds);
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      if (onTimerComplete) {
        onTimerComplete();
      }
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          if (onTimerComplete) onTimerComplete();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimerComplete]);

  const formatCountdown = (totalSecs: number) => {
    if (totalSecs <= 0) return "0 วินาที";

    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;

    if (hours > 0) {
      return `${hours} ชั่วโมง ${minutes} นาที ${seconds < 10 ? `0${seconds}` : seconds} วินาที`;
    }
    if (minutes > 0) {
      return `${minutes} นาที ${seconds < 10 ? `0${seconds}` : seconds} วินาที`;
    }
    return `${seconds} วินาที`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-200 text-center space-y-6 relative overflow-hidden">
        {/* Top Accent Warning Stripe */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-rose-500 via-amber-500 to-rose-500" />

        {/* Shield Icon */}
        <div className="w-20 h-20 bg-rose-50 text-rose-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-rose-100">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {/* Header Message */}
        <div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            ระบบถูกระงับชั่วคราว
          </h2>
          <p className="text-xs text-slate-500 mt-2 font-medium">
            ตรวจพบการทำรายการถี่เกินกำหนด (มากกว่า 30 ครั้ง/นาที)
          </p>
        </div>

        {/* Countdown Box */}
        <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-lg space-y-2 border border-slate-800">
          <div className="flex items-center justify-center space-x-1.5 text-rose-400 text-xs font-semibold uppercase tracking-wider">
            <Hourglass className="w-4 h-4 animate-spin [animation-duration:3s]" />
            <span>เวลานับถอยหลังปลดระงับ</span>
          </div>
          <span className="block text-3xl font-black text-white font-mono tracking-tight text-rose-400">
            {formatCountdown(secondsLeft)}
          </span>
        </div>

        {/* Penalty Policy Notice */}
        <div className="p-3 bg-amber-50/80 border border-amber-200/70 rounded-xl text-left space-y-1">
          <p className="text-[11px] font-bold text-amber-900">
            🛡️ นโยบายการระงับการใช้งานอัตโนมัติ:
          </p>
          <ul className="text-[11px] text-amber-800 list-disc list-inside space-y-0.5 leading-relaxed">
            <li>หากโดนระงับครั้งแรก: ระงับ <strong>30 วินาที</strong></li>
            <li>หากทำรายการถี่ซ้ำอีก: ระงับ <strong>1 ชั่วโมง</strong></li>
          </ul>
        </div>

        <p className="text-xs text-slate-400 leading-relaxed">
          ระบบจะทำการปลดล็อกให้ใช้งานได้ตามปกติโดยอัตโนมัติเมื่อเวลานับถอยหลังสิ้นสุด
        </p>
      </div>
    </div>
  );
};
