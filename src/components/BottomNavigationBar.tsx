"use client";

import React from "react";
import { Home, BarChart2, History, Settings, Plus } from "lucide-react";
import { NavTabType } from "@/components/Header";

interface BottomNavigationBarProps {
  activeTab: NavTabType;
  onSelectTab: (tab: NavTabType) => void;
  onOpenAddModal: () => void;
  onOpenSettingsModal: () => void;
}

export const BottomNavigationBar: React.FC<BottomNavigationBarProps> = ({
  activeTab,
  onSelectTab,
  onOpenAddModal,
  onOpenSettingsModal,
}) => {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 pointer-events-none flex justify-center">
      {/* Container limited to max-w-lg on mobile / tablet or centered */}
      <div className="w-full max-w-lg mx-auto relative pointer-events-auto">
        {/* Cradle FAB (Floating Action Button) Docked & Elevated */}
        <div className="absolute left-1/2 -top-7 -translate-x-1/2 z-20 flex flex-col items-center">
          <button
            onClick={onOpenAddModal}
            aria-label="บันทึกค่าไฟ"
            className="w-[58px] h-[58px] rounded-full bg-gradient-to-tr from-[#00C853] to-[#10B981] text-white flex items-center justify-center shadow-[0_8px_25px_rgba(16,185,129,0.45)] hover:shadow-[0_10px_30px_rgba(16,185,129,0.6)] active:scale-95 hover:scale-105 transition-all duration-200 cursor-pointer group border-4 border-white"
          >
            <Plus className="w-7 h-7 text-white stroke-[3] group-hover:rotate-90 transition-transform duration-300" />
          </button>
        </div>

        {/* SVG Background Bar with Cradle Cutout / Notch */}
        <div className="relative filter drop-shadow-[0_-4px_16px_rgba(0,0,0,0.06)]">
          <svg
            viewBox="0 0 400 68"
            className="w-full h-[68px] block fill-white"
            preserveAspectRatio="none"
          >
            {/* 
              Smooth Cradle Notch:
              Width: 400, Height: 68
              Center at X=200.
              Top line from 0 to 155.
              Smooth curve dipping into cradle from (155, 0) to (170, 10) to (182, 28) to (200, 32)
              and mirrored to 245, 0.
            */}
            <path
              d="M 0,0 
                 L 156,0 
                 C 168,0 174,10 180,24 
                 C 186,36 193,40 200,40 
                 C 207,40 214,36 220,24 
                 C 226,10 232,0 244,0 
                 L 400,0 
                 L 400,68 
                 L 0,68 
                 Z"
            />
          </svg>

          {/* Border highlight for top edge */}
          <svg
            viewBox="0 0 400 68"
            className="w-full h-[68px] absolute inset-0 pointer-events-none fill-none stroke-slate-100/90"
            strokeWidth="1.5"
            preserveAspectRatio="none"
          >
            <path
              d="M 0,0 
                 L 156,0 
                 C 168,0 174,10 180,24 
                 C 186,36 193,40 200,40 
                 C 207,40 214,36 220,24 
                 C 226,10 232,0 244,0 
                 L 400,0"
            />
          </svg>
        </div>

        {/* Nav Items Overlay */}
        <div className="absolute inset-0 flex items-center justify-between px-4 sm:px-6 pt-1">
          {/* Left Side: Home & Dashboard */}
          <div className="flex items-center space-x-6 sm:space-x-8 w-[40%] justify-around">
            {/* Tab 1: หน้าแรก */}
            <button
              onClick={() => onSelectTab("home")}
              className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer group ${
                activeTab === "home" ? "text-[#10B981]" : "text-[#64748B] hover:text-slate-900"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  activeTab === "home" ? "bg-emerald-50 scale-105" : "group-hover:bg-slate-50"
                }`}
              >
                <Home
                  className={`w-5 h-5 ${
                    activeTab === "home" ? "stroke-[2.4] text-[#10B981]" : "stroke-[1.8]"
                  }`}
                />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 ${
                  activeTab === "home" ? "font-bold text-[#10B981]" : "text-[#64748B]"
                }`}
              >
                หน้าแรก
              </span>
            </button>

            {/* Tab 2: แดชบอร์ด */}
            <button
              onClick={() => onSelectTab("dashboard")}
              className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer group ${
                activeTab === "dashboard" ? "text-[#10B981]" : "text-[#64748B] hover:text-slate-900"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  activeTab === "dashboard" ? "bg-emerald-50 scale-105" : "group-hover:bg-slate-50"
                }`}
              >
                <BarChart2
                  className={`w-5 h-5 ${
                    activeTab === "dashboard" ? "stroke-[2.4] text-[#10B981]" : "stroke-[1.8]"
                  }`}
                />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 ${
                  activeTab === "dashboard" ? "font-bold text-[#10B981]" : "text-[#64748B]"
                }`}
              >
                แดชบอร์ด
              </span>
            </button>
          </div>

          {/* Center gap for FAB placeholder */}
          <div className="w-[20%]" aria-hidden="true" />

          {/* Right Side: History & Settings */}
          <div className="flex items-center space-x-6 sm:space-x-8 w-[40%] justify-around">
            {/* Tab 3: ประวัติ */}
            <button
              onClick={() => onSelectTab("history")}
              className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer group ${
                activeTab === "history" ? "text-[#10B981]" : "text-[#64748B] hover:text-slate-900"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  activeTab === "history" ? "bg-emerald-50 scale-105" : "group-hover:bg-slate-50"
                }`}
              >
                <History
                  className={`w-5 h-5 ${
                    activeTab === "history" ? "stroke-[2.4] text-[#10B981]" : "stroke-[1.8]"
                  }`}
                />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 ${
                  activeTab === "history" ? "font-bold text-[#10B981]" : "text-[#64748B]"
                }`}
              >
                ประวัติ
              </span>
            </button>

            {/* Tab 4: ตั้งค่า */}
            <button
              onClick={onOpenSettingsModal}
              className={`flex flex-col items-center justify-center py-1 transition-colors cursor-pointer group ${
                activeTab === "settings" ? "text-[#10B981]" : "text-[#64748B] hover:text-slate-900"
              }`}
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  activeTab === "settings" ? "bg-emerald-50 scale-105" : "group-hover:bg-slate-50"
                }`}
              >
                <Settings
                  className={`w-5 h-5 ${
                    activeTab === "settings" ? "stroke-[2.4] text-[#10B981]" : "stroke-[1.8]"
                  }`}
                />
              </div>
              <span
                className={`text-[11px] font-medium tracking-tight mt-0.5 ${
                  activeTab === "settings" ? "font-bold text-[#10B981]" : "text-[#64748B]"
                }`}
              >
                ตั้งค่า
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
