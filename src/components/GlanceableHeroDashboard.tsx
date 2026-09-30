"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SummaryData, UserProfile, MeterLog } from "@/types";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { LogIn, LogOut, Settings, Sliders, User, Check, ShieldCheck, Home, LayoutDashboard } from "lucide-react";

interface GlanceableHeroDashboardProps {
  summary: SummaryData;
  user: UserProfile;
  logs: MeterLog[];
  onOpenQuickRecord: () => void;
  onOpenMenu?: () => void;
  onNavigate?: (view: "home" | "dashboard" | "history") => void;
  onOpenHistory?: () => void;
  onOpenTariffModal: () => void;
  onOpenGoogleLoginModal?: () => void;
}

export const GlanceableHeroDashboard: React.FC<GlanceableHeroDashboardProps> = ({
  summary,
  user,
  logs,
  onOpenQuickRecord,
  onOpenMenu,
  onNavigate,
  onOpenHistory,
  onOpenTariffModal,
  onOpenGoogleLoginModal,
}) => {
  const { session, isAuthenticated, logout } = useGoogleAuth();
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileDropdownOpen(false);
      }
    }
    if (isProfileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isProfileDropdownOpen]);

  // Format current billing cycle: e.g. "รอบ 1-30 ก.ย."
  const billCycleText = useMemo(() => {
    const thaiMonths = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `รอบ 1-${lastDay} ${thaiMonths[now.getMonth()]}`;
  }, []);

  // Determine if empty state
  const hasLogs = logs && logs.length > 0;
  const isFreshCycle = !hasLogs || (summary?.currentMonthUnits === 0 && summary?.currentMonthCost === 0);

  // Cost and Units with default fallback to template reference values
  const currentCost = isFreshCycle ? 0 : (summary?.currentMonthCost ?? 1248.0);
  const currentUnits = isFreshCycle ? 0 : (summary?.currentMonthUnits ?? 248.5);

  // Smooth Animated Counter Effect (0 -> target value)
  const [displayCost, setDisplayCost] = useState<number>(0);
  const [displayUnits, setDisplayUnits] = useState<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const duration = 1600; // 1.6s for distinct fast surge then slow deceleration
    const startCost = 0;
    const targetCost = currentCost;
    const startUnits = 0;
    const targetUnits = currentUnits;

    let animationFrameId: number;

    // Cubic-Bezier style deceleration: shoots up rapidly at start, then coasts gently to a stop
    const easeOutQuart = (x: number): number => {
      return 1 - Math.pow(1 - x, 4);
    };

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = easeOutQuart(progress);

      setDisplayCost(startCost + (targetCost - startCost) * easedProgress);
      setDisplayUnits(startUnits + (targetUnits - startUnits) * easedProgress);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayCost(targetCost);
        setDisplayUnits(targetUnits);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [currentCost, currentUnits]);

  // Split integer and decimal for dominant typography display
  const costFormatted = displayCost.toFixed(2);
  const [costInteger, costDecimal] = costFormatted.split(".");

  // Daily average calculation
  const now = new Date();
  const daysPassed = Math.max(1, now.getDate());
  const dailyAverageUnits = isFreshCycle ? "0.0" : (displayUnits / daysPassed).toFixed(1);

  // Difference from previous reading
  const diffUnitsText = useMemo(() => {
    if (isFreshCycle) return null;
    if (logs.length >= 2) {
      const latest = logs[0].Units_Used || 0;
      return latest > 0 ? `+${latest.toFixed(1)} หน่วย จากครั้งก่อน` : `+${latest.toFixed(1)} หน่วย`;
    }
    return "+12.4 หน่วย จากเมื่อวาน";
  }, [logs, isFreshCycle]);

  const activePicture = session?.Picture || user?.Picture;
  const activeName = session?.Name || user?.Name || "ผู้ใช้งาน";
  const activeEmail = session?.Email || user?.Email || "demo@khafai.app";
  const isUserLoggedIn = isAuthenticated && !session?.isDemo;

  return (
    <div className="relative w-full h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#fafbfc] select-none text-slate-800 font-sans">
      {/* ================= BEGIN: StealthTopBar ================= */}
      <header
        className="w-full max-w-7xl mx-auto pt-safe px-4 sm:px-6 lg:px-8 pt-5 flex items-center justify-between z-20"
        data-purpose="stealth-navigation"
      >
        {/* Left: Home & Dashboard Switcher */}
        <div className="flex items-center gap-1 -ml-1.5">
          <button
            aria-label="หน้าแรก"
            onClick={() => onNavigate?.("home")}
            className="p-1.5 rounded-xl bg-slate-900 text-white shadow-xs transition-all active:scale-95 cursor-pointer"
            id="btn-nav-home"
            type="button"
            title="หน้าแรก"
          >
            <Home className="w-4 h-4 stroke-[2]" />
          </button>
          <button
            aria-label="แดชบอร์ด"
            onClick={() => onNavigate?.("dashboard")}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-all active:scale-95 cursor-pointer"
            id="btn-nav-dashboard"
            type="button"
            title="แดชบอร์ด"
          >
            <LayoutDashboard className="w-4 h-4 stroke-[1.8]" />
          </button>
        </div>

        {/* Center: Whisper Period Indicator */}
        <div
          className="flex items-center gap-1.5 opacity-40 tracking-wider text-[11px] font-medium text-slate-500 uppercase"
          data-purpose="cycle-indicator"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{billCycleText}</span>
        </div>

        {/* Right: User Profile Avatar with Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            aria-label="โปรไฟล์ผู้ใช้งาน"
            onClick={() => setIsProfileDropdownOpen((prev) => !prev)}
            className="p-1 -mr-1 rounded-full text-slate-500 hover:text-slate-800 active:scale-95 transition-all opacity-85 hover:opacity-100 focus:outline-none cursor-pointer flex items-center justify-center ring-2 ring-transparent hover:ring-slate-200"
            id="btn-user-profile"
            type="button"
            title={activeName}
          >
            {activePicture ? (
              <img
                src={activePicture}
                alt={activeName}
                className="w-7 h-7 rounded-full object-cover border border-slate-200/90 shadow-2xs"
              />
            ) : (
              <div className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200/90 text-slate-700 flex items-center justify-center text-xs font-semibold shadow-2xs transition-colors">
                {activeName.charAt(0).toUpperCase()}
              </div>
            )}
          </button>

          {/* Profile Dropdown Menu - Glanceable Minimal Theme with Spring In & Out */}
          <AnimatePresence>
            {isProfileDropdownOpen && (
              <motion.div
                initial={{ opacity: 0, scale: 0.92, y: -6 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.92, y: -6 }}
                transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.06)] border border-slate-200/70 p-3 z-50 text-slate-800 origin-top-right select-none"
              >
                {/* User Identity Header */}
                <div className="pb-3 border-b border-slate-100/90 flex items-center gap-2.5 px-1">
                  {activePicture ? (
                    <img
                      src={activePicture}
                      alt={activeName}
                      className="w-8 h-8 rounded-full object-cover border border-slate-200/80 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center text-xs font-semibold shrink-0">
                      {activeName.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-medium text-slate-900 truncate flex items-center gap-1.5">
                      <span>{activeName}</span>
                      {isUserLoggedIn && (
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block shrink-0" title="เข้าสู่ระบบแล้ว" />
                      )}
                    </div>
                    <div className="text-[11px] text-slate-400 font-light truncate">
                      {activeEmail}
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="py-2 px-1 border-b border-slate-100/90 flex items-center justify-between text-[11px]">
                  <span className="text-slate-400 font-light">สถานะบัญชี</span>
                  {isUserLoggedIn ? (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50/70 border border-emerald-100/60 px-2 py-0.5 rounded-full font-normal">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>Google Verified</span>
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full font-light border border-slate-100">
                      โหมดสาธิต (Demo)
                    </span>
                  )}
                </div>

                {/* Menu Actions */}
                <div className="pt-2 space-y-1">
                  {/* Rate Settings */}
                  <button
                    onClick={() => {
                      setIsProfileDropdownOpen(false);
                      onOpenTariffModal();
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-light transition-all cursor-pointer text-left group"
                  >
                    <div className="flex items-center gap-2">
                      <Settings className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      <span>อัตราค่าไฟ</span>
                    </div>
                    <span className="text-[11px] font-normal text-slate-400 tabular-nums">
                      ฿{user.Current_Rate_Per_Unit.toFixed(2)}/u
                    </span>
                  </button>

                  {/* Sign In or Log Out */}
                  {isUserLoggedIn ? (
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50/60 rounded-xl font-normal transition-all cursor-pointer text-left"
                    >
                      <LogOut className="w-3.5 h-3.5 text-rose-500" />
                      <span>ออกจากระบบ</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setIsProfileDropdownOpen(false);
                        if (onOpenGoogleLoginModal) onOpenGoogleLoginModal();
                      }}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs text-slate-900 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-normal shadow-xs hover:shadow transition-all cursor-pointer active:scale-98 mt-1"
                    >
                      <LogIn className="w-3.5 h-3.5" />
                      <span>เข้าสู่ระบบ Google</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </header>
      {/* ================= END: StealthTopBar ================= */}

      {/* ================= BEGIN: HeroTypographyClockFace ================= */}
      {/* Cardless, perfectly floating dead-center hero */}
      <main
        onClick={onOpenQuickRecord}
        className="flex-1 flex flex-col items-center justify-center text-center px-6 select-none cursor-pointer group"
        data-purpose="hero-clock-face"
        id="hero-clock-trigger"
        title="แตะเพื่อจดเลขมิเตอร์"
      >
        {/* Ambient Tiny Label */}
        <span className="text-xs uppercase tracking-[0.22em] text-slate-400 font-light mb-2 opacity-70">
          ประมาณการค่าไฟเดือนนี้
        </span>

        {/* Dominant Numerical Hero Price Display */}
        <div className="flex items-baseline justify-center tracking-tight text-slate-900 drop-shadow-xs transition-transform duration-200 group-hover:scale-[1.02]">
          <span className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extralight text-slate-300 mr-1.5 select-none">
            ฿
          </span>
          <span
            className="text-7xl sm:text-8xl md:text-9xl lg:text-[10rem] font-[200] tabular-nums tracking-[-0.04em] text-slate-900 leading-none"
            id="display-price"
          >
            {Number(costInteger).toLocaleString()}
          </span>
          <span className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-slate-400 ml-1 tracking-tight tabular-nums">
            .{costDecimal}
          </span>
        </div>

        {/* Secondary Metric & Daily Average Breathing Line */}
        <div className="mt-5 sm:mt-6 flex items-center justify-center space-x-2.5 text-slate-500 font-light text-sm sm:text-base md:text-lg tracking-wide tabular-nums">
          <span className="font-normal text-slate-700" id="display-kwh">
            {displayUnits.toLocaleString(undefined, { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh
          </span>
          <span className="text-slate-300 text-xs sm:text-sm">•</span>
          <span className="text-slate-500">{dailyAverageUnits} หน่วย/วัน</span>
        </div>

        {/* Micro Status Diff Indicator */}
        {diffUnitsText ? (
          <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-emerald-700 bg-emerald-50/70 border border-emerald-100/60 px-2.5 py-0.5 rounded-full font-normal">
            <svg
              fill="none"
              height="11"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2.2"
              viewBox="0 0 24 24"
              width="11"
              xmlns="http://www.w3.org/2000/svg"
            >
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
            <span>{diffUnitsText}</span>
          </div>
        ) : (
          <div className="mt-2.5 inline-flex items-center gap-1 text-[11px] text-amber-700 bg-amber-50/70 border border-amber-100/60 px-2.5 py-0.5 rounded-full font-normal">
            <span>จดมิเตอร์ครั้งแรกเพื่อเริ่มคำนวณ</span>
          </div>
        )}
      </main>
      {/* ================= END: HeroTypographyClockFace ================= */}

      {/* ================= BEGIN: StealthQuickAction ================= */}
      <footer
        className="w-full pb-safe pb-8 px-6 flex flex-col items-center justify-center gap-3 z-10"
        data-purpose="ambient-bottom-action"
      >
        {/* Minimalist Soft Glass Pill Trigger with Lively Spring & Ambient Pulse */}
        <button
          onClick={onOpenQuickRecord}
          className="group relative inline-flex items-center gap-2.5 bg-white/95 border border-slate-200/90 shadow-[0_4px_20px_rgba(0,0,0,0.04)] px-5 py-2.5 rounded-full text-slate-700 text-xs font-normal tracking-wide hover:text-slate-900 hover:border-slate-300 hover:shadow-[0_8px_25px_rgba(0,0,0,0.08)] active:scale-95 transition-all duration-200 backdrop-blur-md cursor-pointer hover:-translate-y-0.5"
          id="btn-open-modal"
          type="button"
        >
          <span className="relative flex items-center justify-center">
            <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-slate-900 group-hover:text-white transition-all duration-200 text-xs font-semibold leading-none shadow-2xs group-hover:rotate-90">
              +
            </span>
          </span>
          <span className="font-light group-hover:font-normal transition-all">แตะเพื่อจดเลขมิเตอร์</span>
        </button>

        {/* Micro Gesture Cue Line */}
        <div className="w-10 h-1 bg-slate-200 rounded-full opacity-60 mt-1 pointer-events-none" />
      </footer>
      {/* ================= END: StealthQuickAction ================= */}
    </div>
  );
};
