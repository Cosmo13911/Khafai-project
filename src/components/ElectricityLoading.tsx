"use client";

import React from "react";
import { BobbingDots } from "@/components/loading-ui/bobbing-dots";
import { DashboardSkeleton } from "./DashboardSkeleton";

interface ElectricityLoadingProps {
  title?: string;
  subtitle?: string;
  fullScreen?: boolean;
  compact?: boolean;
  dark?: boolean;
  onComplete?: () => void;
}

export const ElectricityLoading: React.FC<ElectricityLoadingProps> = ({
  title = "กำลังดึงข้อมูล",
  subtitle = "รอสักครู่ ระบบกำลังประมวลผลข้อมูล",
  fullScreen = false,
  compact = false,
  dark = false,
}) => {
  if (compact) {
    return (
      <div className="inline-flex items-center space-x-2 font-semibold text-xs text-purple-600">
        <BobbingDots count={3} duration={0.7} dotClassName="w-1.5 h-1.5 rounded-full bg-purple-600" />
        <span>{title}...</span>
      </div>
    );
  }

  if (!fullScreen) {
    return <DashboardSkeleton />;
  }

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center space-y-5 select-none p-4 ${
        dark ? "bg-slate-950 text-white" : "bg-slate-50/95 backdrop-blur-xs text-slate-900"
      }`}
    >
      {/* Playful Bobbing Dots Animation Container */}
      <div className="flex flex-col items-center justify-center space-y-5">
        <BobbingDots
          count={4}
          duration={0.75}
          dotClassName={`w-3.5 h-3.5 rounded-full shadow-xs ${
            dark
              ? "bg-gradient-to-r from-purple-400 via-indigo-400 to-purple-300"
              : "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-500"
          }`}
        />

        <div className="flex flex-col items-center space-y-1.5 text-center">
          <h3 className={`text-base sm:text-lg font-extrabold tracking-tight ${dark ? "text-white" : "text-slate-800"}`}>
            {title}
          </h3>
          {subtitle && (
            <p className={`text-xs font-medium ${dark ? "text-slate-400" : "text-slate-500"}`}>
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
