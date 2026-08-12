"use client";

import React, { useState, useEffect } from "react";
import { Settings, LogOut, ChevronDown } from "lucide-react";
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
                  {/* Profile Header: Avatar + Name + Email */}
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center space-x-3">
                    {isMounted && session?.Picture ? (
                      // eslint-disable-next-next-line @next/next/no-img-element
                      <img
                        src={session.Picture}
                        alt={displayName}
                        className="w-9 h-9 rounded-full object-cover border border-slate-200"
                      />
                    ) : (
                      <div
                        suppressHydrationWarning
                        className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-sm shadow-xs flex-shrink-0"
                      >
                        {avatarChar}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p suppressHydrationWarning className="text-xs font-bold text-slate-900 truncate">
                        {displayName}
                      </p>
                      <p suppressHydrationWarning className="text-[11px] text-slate-500 truncate">
                        {displayEmail}
                      </p>
                    </div>
                  </div>

                  {/* Section 1: User Settings */}
                  <div className="py-1 border-b border-slate-100">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        onOpenTariffModal();
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer text-left"
                    >
                      <Settings className="w-4 h-4 text-slate-500 flex-shrink-0" />
                      <span>ตั้งค่าอัตราค่าไฟ</span>
                    </button>
                  </div>

                  {/* Section 3: Account Actions (Destructive) */}
                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setIsDropdownOpen(false);
                        logout();
                        onOpenGoogleLoginModal();
                      }}
                      className="w-full flex items-center space-x-2.5 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 font-semibold transition-colors cursor-pointer text-left"
                    >
                      <LogOut className="w-4 h-4 text-rose-600 flex-shrink-0" />
                      <span>ออกจากระบบ</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
