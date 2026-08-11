"use client";

import React, { useState } from "react";
import { Zap, ShieldCheck, Settings, RefreshCw, LogIn, LogOut, ChevronDown } from "lucide-react";
import { UserProfile } from "@/types";
import { useGoogleAuth } from "@/context/GoogleAuthContext";

interface HeaderProps {
  user: UserProfile;
  onOpenTariffModal: () => void;
  onResetData: () => void;
  onOpenGoogleLoginModal: () => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onOpenTariffModal,
  onResetData,
  onOpenGoogleLoginModal,
  isLoading,
}) => {
  const { session, logout } = useGoogleAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  const displayName = session?.Name || user.Email.split("@")[0];
  const displayEmail = session?.Email || user.Email;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-200">
            <Zap className="w-6 h-6 fill-current text-white" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Khafai
              </h1>
              <span className="bg-blue-50 text-blue-700 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-200">
                v1.0
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden sm:block">
              ระบบบันทึกและวิเคราะห์การใช้ไฟฟ้า (Google Multi-user Authentication)
            </p>
          </div>
        </div>

        {/* User Status & Action Controls */}
        <div className="flex items-center flex-wrap gap-2.5">
          {/* Current Tariff Rate Button */}
          <button
            onClick={onOpenTariffModal}
            className="flex items-center space-x-1.5 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold px-3 py-2 rounded-lg transition-colors cursor-pointer min-h-[44px]"
            title="แก้ไขอัตราค่าไฟฟ้าต่อหน่วย"
          >
            <Settings className="w-4 h-4 text-blue-600" />
            <span>ค่าไฟ: <span className="text-blue-600 font-bold">฿{user.Current_Rate_Per_Unit.toFixed(2)}</span> /หน่วย</span>
          </button>

          {/* API Proxy Connected Badge */}
          <div className="hidden lg:flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>GAS API Proxy Connected</span>
          </div>

          {/* Google User Profile Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="flex items-center space-x-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-1.5 pr-2.5 transition-colors cursor-pointer min-h-[44px]"
            >
              {session?.Picture ? (
                // eslint-disable-next-next-line @next/next/no-img-element
                <img
                  src={session.Picture}
                  alt={displayName}
                  className="w-7 h-7 rounded-full object-cover border border-slate-300"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <p className="text-xs font-bold text-slate-900 leading-none">{displayName}</p>
                <p className="text-[10px] text-slate-500 max-w-[130px] truncate">{displayEmail}</p>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                onClick={() => setIsDropdownOpen(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900">{displayName}</p>
                  <p className="text-xs text-slate-500 truncate">{displayEmail}</p>
                  <p className="text-[10px] text-blue-600 font-medium mt-1">
                    Google Sub ID: {user.User_ID}
                  </p>
                </div>

                <button
                  onClick={onOpenGoogleLoginModal}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs text-slate-700 hover:bg-slate-50 font-medium transition-colors cursor-pointer text-left"
                >
                  <LogIn className="w-4 h-4 text-blue-600" />
                  <span>สลับบัญชี Google / เข้าสู่ระบบด้วย Google</span>
                </button>

                <button
                  onClick={() => {
                    logout();
                    onOpenGoogleLoginModal();
                  }}
                  className="w-full flex items-center space-x-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 font-medium transition-colors cursor-pointer text-left border-t border-slate-100"
                >
                  <LogOut className="w-4 h-4 text-rose-600" />
                  <span>ออกจากระบบ (Logout)</span>
                </button>
              </div>
            )}
          </div>

          {/* Reset Demo Button */}
          <button
            onClick={onResetData}
            disabled={isLoading}
            className="flex items-center justify-center p-2.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors min-w-[44px] min-h-[44px] cursor-pointer"
            title="รีเซ็ตข้อมูลทดสอบ"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin text-blue-600" : ""}`} />
          </button>
        </div>
      </div>
    </header>
  );
};
