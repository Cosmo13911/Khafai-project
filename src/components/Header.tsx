"use client";

import React, { useState, useEffect } from "react";
import { Settings, RefreshCw, LogIn, LogOut, ChevronDown, FlaskConical } from "lucide-react";
import { UserProfile } from "@/types";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { KhafaiLogo } from "./KhafaiLogo";

interface HeaderProps {
  user: UserProfile;
  onOpenTariffModal: () => void;
  onOpenTestApiModal: () => void;
  onResetData: () => void;
  onOpenGoogleLoginModal: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenTariffModal,
  onOpenTestApiModal,
  onResetData,
  onOpenGoogleLoginModal,
  isLoading,
}) => {
  const { session, logout } = useGoogleAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const rawName = (isMounted && session?.Name) || user.Email.split("@")[0] || "User";
  const displayName = rawName;
  const displayEmail = (isMounted && session?.Email) || user.Email;
  const avatarChar = displayName.charAt(0).toUpperCase();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between">
        {/* Left Side: Khafai Brand Logo + App Name */}
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 flex items-center justify-center">
            <KhafaiLogo className="w-8 h-8 drop-shadow-xs" />
          </div>
          <h1 className="text-lg font-semibold text-slate-900 tracking-tight">
            Khafai
          </h1>
        </div>

        {/* Right Side: Minimal Status + Tariff Chip + Profile Dropdown */}
        <div className="flex items-center space-x-3">
          {/* Status Dot */}
          <div className="hidden sm:flex items-center space-x-1.5 text-xs text-emerald-700 bg-emerald-50/80 border border-emerald-200/60 px-2.5 py-1 rounded-full font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Connected</span>
          </div>

          {/* Minimal Tariff Rate Chip */}
          <button
            onClick={onOpenTariffModal}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-full px-3 py-1.5 flex items-center space-x-1 cursor-pointer transition-colors min-h-[36px]"
            title="แก้ไขอัตราค่าไฟฟ้าต่อหน่วย"
          >
            <span>฿{user.Current_Rate_Per_Unit.toFixed(2)}/หน่วย</span>
          </button>

          {/* User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 hover:bg-slate-100 rounded-full p-1 transition-colors cursor-pointer min-h-[36px]"
            >
              {isMounted && session?.Picture ? (
                // eslint-disable-next-next-line @next/next/no-img-element
                <img
                  src={session.Picture}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <div
                  suppressHydrationWarning
                  className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs"
                >
                  {avatarChar}
                </div>
              )}
              <span suppressHydrationWarning className="text-xs font-semibold text-slate-800 hidden sm:inline-block max-w-[120px] truncate">
                {displayName}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu Overlay */}
            {isDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  {/* User Email & ID Block inside Dropdown */}
                  <div className="px-4 py-2.5 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{displayName}</p>
                    <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
                    <p className="text-[10px] text-slate-400 font-mono mt-1 truncate">
                      ID: {user.User_ID}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenGoogleLoginModal();
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer text-left"
                  >
                    <LogIn className="w-4 h-4 text-blue-600" />
                    <span>สลับบัญชี / เข้าสู่ระบบด้วย Google</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenTariffModal();
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer text-left"
                  >
                    <Settings className="w-4 h-4 text-slate-500" />
                    <span>ตั้งค่าอัตราค่าไฟ</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onOpenTestApiModal();
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer text-left"
                  >
                    <FlaskConical className="w-4 h-4 text-purple-600" />
                    <span>เครื่องมือทดสอบยิง API (Dev Console)</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      onResetData();
                    }}
                    disabled={isLoading}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer text-left"
                  >
                    <RefreshCw className={`w-4 h-4 text-amber-600 ${isLoading ? "animate-spin" : ""}`} />
                    <span>รีเซ็ต / ล้างข้อมูล</span>
                  </button>

                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      logout();
                      onOpenGoogleLoginModal();
                    }}
                    className="w-full flex items-center space-x-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer text-left border-t border-slate-100 mt-1 pt-2"
                  >
                    <LogOut className="w-4 h-4 text-rose-600" />
                    <span>ออกจากระบบ (Logout)</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
