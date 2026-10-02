"use client";

import React, { useState, useMemo, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  LogOut,
  ChevronDown,
  Download,
  Smartphone,
  CheckCircle2,
  Zap,
  Home,
  LayoutDashboard,
  History,
  Sliders,
  ShieldCheck,
  LogIn,
} from "lucide-react";
import { UserProfile } from "@/types";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { usePwa } from "@/context/PwaContext";

export type NavTabType = "home" | "dashboard" | "history" | "settings";

interface HeaderProps {
  user: UserProfile;
  onOpenTariffModal: () => void;
  onOpenTestApiModal: () => void;
  onResetData: () => void;
  onOpenGoogleLoginModal: () => void;
  onOpenMenu?: () => void;
  isLoading: boolean;
  activeNavTab?: NavTabType;
  onSelectNavTab?: (tab: NavTabType) => void;
  cycleText?: string;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenTariffModal,
  onOpenTestApiModal,
  onResetData,
  onOpenGoogleLoginModal,
  onOpenMenu,
  isLoading,
  activeNavTab = "dashboard",
  onSelectNavTab,
  cycleText,
}) => {
  const { session, logout, isAuthenticated } = useGoogleAuth();
  const { isInstalled, installApp } = usePwa();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  // Billing cycle text (same as Home page)
  const billCycleText = useMemo(() => {
    const thaiMonths = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
    ];
    const now = new Date();
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    return `รอบ 1-${lastDay} ${thaiMonths[now.getMonth()]}`;
  }, []);

  const activePicture = session?.Picture || user?.Picture;
  const activeName = session?.Name || user?.Name || "ผู้ใช้งาน";
  const activeEmail = session?.Email || user?.Email || "";
  const isUserLoggedIn = isAuthenticated && !session?.isDemo;

  return (
    <header className="sticky top-0 z-30 w-full bg-[#fafbfc]/90 backdrop-blur-md border-b border-slate-200/60 select-none transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* ================= Left: Home & Dashboard Switcher ================= */}
        <div className="flex items-center gap-1 -ml-1.5">
          <button
            aria-label="หน้าแรก"
            onClick={() => onSelectNavTab?.("home")}
            className={`p-1.5 rounded-xl transition-all active:scale-95 cursor-pointer ${
              activeNavTab === "home"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            }`}
            id="btn-header-nav-home"
            type="button"
            title="หน้าแรก"
          >
            <Home className="w-4 h-4 stroke-[2]" />
          </button>
          <button
            aria-label="แดชบอร์ด"
            onClick={() => onSelectNavTab?.("dashboard")}
            className={`p-1.5 rounded-xl transition-all active:scale-95 cursor-pointer ${
              activeNavTab === "dashboard"
                ? "bg-slate-900 text-white shadow-xs"
                : "text-slate-400 hover:text-slate-800 hover:bg-slate-100"
            }`}
            id="btn-header-nav-dashboard"
            type="button"
            title="แดชบอร์ด"
          >
            <LayoutDashboard className="w-4 h-4 stroke-[1.8]" />
          </button>
        </div>

        {/* ================= Center: Whisper Period Indicator (Exact Home Match) ================= */}
        <div
          className="flex items-center gap-1.5 opacity-50 tracking-wider text-[11px] font-medium text-slate-500 uppercase"
          data-purpose="cycle-indicator"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>{cycleText || billCycleText}</span>
        </div>

        {/* ================= Right: User Profile Avatar with Exact Match Dropdown ================= */}
        <div className="relative" ref={dropdownRef}>
          <button
            aria-label="โปรไฟล์ผู้ใช้งาน"
            onClick={() => setIsDropdownOpen((prev) => !prev)}
            className="p-1 -mr-1 rounded-full text-slate-500 hover:text-slate-800 active:scale-95 transition-all opacity-85 hover:opacity-100 focus:outline-none cursor-pointer flex items-center justify-center ring-2 ring-transparent hover:ring-slate-200"
            id="btn-header-user-profile"
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

          {/* Profile Dropdown Menu - Exact Same Glanceable Minimal Theme as Home Page */}
          <AnimatePresence>
            {isDropdownOpen && (
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
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 bg-emerald-50/70 border border-emerald-100/60 px-2 py-0.5 rounded-full font-normal">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>Google Verified</span>
                  </span>
                </div>

                {/* Menu Actions */}
                <div className="pt-2 space-y-1">
                  {/* Switch to Home View */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSelectNavTab?.("home");
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-light transition-all cursor-pointer text-left"
                  >
                    <Home className="w-3.5 h-3.5 text-slate-400" />
                    <span>กลับหน้าหลักนาฬิกา</span>
                  </button>

                  {/* Switch to History View */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onSelectNavTab?.("history");
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-light transition-all cursor-pointer text-left"
                  >
                    <History className="w-3.5 h-3.5 text-slate-400" />
                    <span>ประวัติบันทึกทั้งหมด</span>
                  </button>

                  {/* Rate Settings */}
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
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

                  {/* PWA Installation (if installable) */}
                  {!isInstalled && (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        installApp();
                      }}
                      className="w-full flex items-center justify-between px-2.5 py-2 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-xl font-light transition-all cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        <span>ติดตั้งแอปบนอุปกรณ์</span>
                      </div>
                      <Download className="w-3 h-3 text-slate-400" />
                    </button>
                  )}

                  {/* Sign In or Log Out */}
                  {isUserLoggedIn ? (
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
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
                        setIsDropdownOpen(false);
                        onOpenGoogleLoginModal();
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
      </div>
    </header>
  );
};
