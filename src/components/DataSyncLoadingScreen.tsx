"use client";

import React, { useState, useEffect } from "react";
import { Zap, RefreshCw, Sparkles } from "lucide-react";

interface DataSyncLoadingScreenProps {
  onRetry?: () => void;
  userEmail?: string;
}

export const DataSyncLoadingScreen: React.FC<DataSyncLoadingScreenProps> = ({
  onRetry,
  userEmail,
}) => {
  const [syncStep, setSyncStep] = useState<number>(0);
  const [showSlowNotice, setShowSlowNotice] = useState<boolean>(false);
  const [showTimeoutRetry, setShowTimeoutRetry] = useState<boolean>(false);

  useEffect(() => {
    // Dynamic progressive status messages
    const step1 = setTimeout(() => setSyncStep(1), 1800);
    const step2 = setTimeout(() => setSyncStep(2), 4200);

    // If it takes more than 7 seconds, display gentle guidance
    const slowTimer = setTimeout(() => {
      setShowSlowNotice(true);
    }, 7000);

    // If it takes more than 16 seconds (GAS timeout), show Retry button
    const retryTimer = setTimeout(() => {
      setShowTimeoutRetry(true);
    }, 16000);

    return () => {
      clearTimeout(step1);
      clearTimeout(step2);
      clearTimeout(slowTimer);
      clearTimeout(retryTimer);
    };
  }, []);

  const stepMessages = [
    "กำลังเชื่อมต่อและยืนยันตัวตนบัญชี...",
    "กำลังซิงค์ประวัติเลขมิเตอร์จาก Google Sheets...",
    "กำลังคำนวณหน่วยไฟฟ้าและยอดค่าไฟล่าสุด...",
  ];

  return (
    <div className="fixed inset-0 z-50 min-h-screen w-full bg-[#fafbfc] text-slate-800 flex flex-col items-center justify-center p-4 sm:p-6 select-none overflow-hidden animate-in fade-in duration-300">
      {/* Ambient Electric Atmosphere Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[460px] h-[340px] sm:h-[460px] bg-gradient-to-tr from-sky-400/10 via-blue-500/10 to-amber-300/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glassmorphic Energy Card */}
      <div className="relative w-full max-w-sm rounded-3xl border border-white/80 bg-white/95 p-7 sm:p-8 shadow-[0_12px_36px_rgba(15,23,42,0.06)] backdrop-blur-xl text-center z-10 flex flex-col items-center">
        {/* ================= VoltPulse Energy Core Indicator ================= */}
        <div className="relative mb-5 flex items-center justify-center">
          {/* Outer Ripple Wave */}
          <span className="absolute -inset-3 rounded-2xl bg-sky-400/20 animate-ping opacity-35 pointer-events-none" />
          
          {/* Subtle Ambient Ring */}
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-tr from-sky-400/35 via-blue-500/25 to-amber-400/35 blur-xs animate-pulse" />

          {/* Central Energy Orb */}
          <div className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-50 via-white to-blue-50 border border-sky-100 shadow-[0_4px_20px_rgba(2,132,199,0.12)] flex items-center justify-center text-sky-500">
            <Zap className="w-8 h-8 text-sky-500 fill-sky-400/25 stroke-[1.75] animate-pulse" />
          </div>
        </div>

        {/* ================= Header Typography ================= */}
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 text-[11px] font-medium text-sky-700 bg-sky-50 border border-sky-100/80 px-2.5 py-0.5 rounded-full mb-1.5 tracking-wide">
            <Sparkles className="w-3 h-3 text-sky-500" />
            <span>ซิงค์ข้อมูลการใช้ไฟฟ้า</span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
            กำลังโหลดข้อมูลการใช้ไฟฟ้า
          </h2>
          <p className="text-xs text-slate-400 font-light max-w-xs transition-opacity duration-300">
            {showTimeoutRetry
              ? "การเชื่อมต่อฐานข้อมูลใช้เวลานานกว่าปกติ"
              : showSlowNotice
              ? "กำลังดึงรายการจาก Google Sheets กรุณารอสักครู่..."
              : stepMessages[syncStep]}
          </p>
        </div>

        {/* ================= VoltPulse Equalizer Frequency Bars ================= */}
        {!showTimeoutRetry && (
          <div className="flex items-center justify-center gap-1.5 my-6 h-9">
            {[
              { delay: "0ms", color: "from-sky-400 to-sky-600" },
              { delay: "160ms", color: "from-blue-500 to-indigo-600" },
              { delay: "320ms", color: "from-amber-400 to-amber-600" },
              { delay: "480ms", color: "from-blue-600 to-sky-500" },
              { delay: "640ms", color: "from-sky-500 to-cyan-500" },
            ].map((bar, idx) => (
              <div
                key={idx}
                style={{ animationDelay: bar.delay }}
                className={`w-1.5 rounded-full bg-gradient-to-t ${bar.color} animate-volt-wave shadow-2xs`}
              />
            ))}
          </div>
        )}

        {/* ================= Active Account Whisper Pill ================= */}
        {userEmail && (
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/70 text-xs text-slate-600 shadow-2xs max-w-full">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="truncate max-w-[190px] font-medium text-slate-700">{userEmail}</span>
            <span className="text-slate-300">•</span>
            <span className="text-[11px] text-slate-400 font-light shrink-0">ซิงค์ออนไลน์</span>
          </div>
        )}

        {/* ================= Retry Action Button (Timeout Fallback) ================= */}
        {showTimeoutRetry && onRetry && (
          <div className="mt-5 w-full pt-2 animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={onRetry}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition-all cursor-pointer active:scale-95"
            >
              <RefreshCw className="w-3.5 h-3.5 stroke-[2]" />
              <span>ลองโหลดใหม่อีกครั้ง</span>
            </button>
          </div>
        )}
      </div>

      {/* Pure CSS VoltPulse Equalizer Animation Keyframes */}
      <style jsx>{`
        @keyframes voltWave {
          0%, 100% {
            height: 8px;
            opacity: 0.35;
          }
          50% {
            height: 32px;
            opacity: 1;
            filter: drop-shadow(0 0 6px rgba(14, 165, 233, 0.45));
          }
        }
        .animate-volt-wave {
          animation: voltWave 1.1s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
      `}</style>
    </div>
  );
};
