"use client";

import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  Plus,
  BarChart3,
  Zap,
  ArrowRight,
  TrendingDown,
  TrendingUp,
  Clock,
  Sparkles,
  Settings,
  Leaf,
} from "lucide-react";
import { SummaryData, UserProfile } from "@/types";

interface HomeMinimalViewProps {
  summary: SummaryData;
  user: UserProfile;
  onOpenAddModal: () => void;
  onSwitchToDashboard: () => void;
  onOpenTariffModal: () => void;
}

/**
 * 60fps Smooth Eased Counter for Hero Numbers
 */
function AnimatedHeroCounter({
  value,
  decimals = 0,
  duration = 900,
}: {
  value: number;
  decimals?: number;
  duration?: number;
}) {
  const [displayValue, setDisplayValue] = useState<number>(0);
  const prevValueRef = useRef<number>(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = prevValueRef.current;
    const endValue = isNaN(value) ? 0 : value;
    let animationFrameId: number;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease-out expo curve for ultra smooth minimal feel
      const easeOut = 1 - Math.pow(2, -10 * progress);
      const current = startValue + (endValue - startValue) * easeOut;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        prevValueRef.current = endValue;
        setDisplayValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [value, duration]);

  return (
    <span suppressHydrationWarning>
      {displayValue.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      })}
    </span>
  );
}

export const HomeMinimalView: React.FC<HomeMinimalViewProps> = ({
  summary,
  user,
  onOpenAddModal,
  onSwitchToDashboard,
  onOpenTariffModal,
}) => {
  const percentChange = summary.unitsPercentChange;
  const isDecrease = percentChange !== null && percentChange < 0;
  const isIncrease = percentChange !== null && percentChange > 0;

  // Format last updated display
  const lastUpdatedDisplay = React.useMemo(() => {
    if (summary.latestRecordDate) {
      try {
        const d = new Date(summary.latestRecordDate);
        if (!isNaN(d.getTime())) {
          return d.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "short",
            year: "2-digit",
          });
        }
      } catch {
        // Fallback
      }
      return summary.latestRecordDate;
    }
    return "รอบบิล " + (summary.currentMonthName || "ปัจจุบัน");
  }, [summary.latestRecordDate, summary.currentMonthName]);

  return (
    <div className="min-h-[calc(100vh-65px)] flex flex-col justify-between items-center px-4 sm:px-6 py-6 sm:py-10 bg-white relative overflow-hidden select-none">
      {/* SmartPower Eco Wave & Ambient Glow Backgrounds */}
      <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
        {/* Soft eco aura radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[620px] h-[340px] sm:h-[620px] bg-gradient-to-tr from-[#2ECC71]/10 via-[#5DADE2]/12 to-emerald-100/20 rounded-full blur-3xl" />
        <div className="absolute top-1/4 -right-16 w-80 h-80 bg-sky-100/30 rounded-full blur-2xl" />
        <div className="absolute -bottom-20 -left-16 w-80 h-80 bg-emerald-100/25 rounded-full blur-2xl" />

        {/* Decorative Wave Gradient SVG at the bottom */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-32 sm:h-48 text-[#2ECC71]/5 opacity-60 pointer-events-none"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,192L48,197.3C96,203,192,213,288,197.3C384,181,480,139,576,144C672,149,768,203,864,208C960,213,1056,171,1152,149.3C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
          />
        </svg>

        {/* Secondary subtle wave */}
        <svg
          className="absolute bottom-0 left-0 right-0 w-full h-24 sm:h-36 text-[#5DADE2]/5 opacity-40 pointer-events-none"
          viewBox="0 0 1440 320"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="none"
        >
          <path
            fill="currentColor"
            d="M0,96L60,117.3C120,139,240,181,360,186.7C480,192,600,160,720,138.7C840,117,960,107,1080,128C1200,149,1320,203,1380,229.3L1440,256L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>
      </div>

      {/* Top Meta Pill: Eco / Tariff / Cycle indicator */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center space-x-2.5 text-xs text-slate-600 font-medium bg-white/80 backdrop-blur-md border border-slate-200/80 px-4 py-1.5 rounded-full shadow-xs"
      >
        <div className="flex items-center space-x-1.5 text-[#27AE60]">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2ECC71] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#2ECC71]" />
          </span>
          <span className="font-semibold text-slate-700">
            {summary.currentMonthName || "เดือนนี้"}
          </span>
        </div>
        <span className="text-slate-300">|</span>
        <button
          onClick={onOpenTariffModal}
          className="hover:text-[#27AE60] transition-colors cursor-pointer flex items-center gap-1 text-slate-500 hover:underline"
          title="แก้ไขอัตราค่าไฟ"
        >
          <span>฿{user.Current_Rate_Per_Unit.toFixed(2)}/หน่วย</span>
          <Settings className="w-3 h-3 text-slate-400 hover:text-[#27AE60]" />
        </button>
      </motion.div>

      {/* Main Centered Hero Section */}
      <div className="w-full max-w-xl my-auto flex flex-col items-center text-center py-6 sm:py-10 z-10">
        {/* Brand Pill / Title */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 text-[#27AE60] text-xs sm:text-sm font-semibold mb-3 sm:mb-4 shadow-2xs"
        >
          <div className="w-5 h-5 rounded-full bg-[#2ECC71] flex items-center justify-center text-white shadow-xs">
            <Zap className="w-3 h-3 fill-white" />
          </div>
          <span className="tracking-wide">ค่าไฟเดือนนี้ของคุณ</span>
        </motion.div>

        {/* Subtitle: Cumulative consumption */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="text-slate-400 text-xs sm:text-sm font-normal mb-1 flex items-center gap-1.5"
        >
          <Leaf className="w-3.5 h-3.5 text-[#2ECC71]" />
          <span>การใช้งานสะสมรอบบิลปัจจุบัน</span>
          <span className="text-slate-600 font-semibold font-mono">
            ({summary.currentMonthUnits.toLocaleString()} kWh)
          </span>
        </motion.div>

        {/* Hero Cost - Extra Large, Bold, Clear SmartPower Look */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-baseline justify-center tracking-tight text-slate-900 mt-3 mb-2"
        >
          <span className="text-3xl sm:text-5xl md:text-6xl font-light text-slate-400 mr-2 select-none">
            ฿
          </span>
          <span className="text-5xl sm:text-7xl md:text-8xl font-black font-mono tracking-tight text-slate-900 drop-shadow-xs">
            <AnimatedHeroCounter value={summary.currentMonthCost} decimals={2} duration={950} />
          </span>
          <span className="text-lg sm:text-2xl font-medium text-slate-500 ml-2.5 sm:ml-3">
            บาท
          </span>
        </motion.div>

        {/* Comparison Pill Only */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="mt-3 flex items-center justify-center text-sm text-slate-600"
        >
          {percentChange !== null ? (
            <div
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
                isDecrease
                  ? "bg-emerald-50 text-[#10B981] border-emerald-200"
                  : isIncrease
                  ? "bg-rose-50 text-rose-600 border-rose-200"
                  : "bg-slate-50 text-slate-600 border-slate-200"
              }`}
            >
              {isDecrease ? (
                <>
                  <TrendingDown className="w-3.5 h-3.5 text-[#10B981]" />
                  <span>ลดลง {Math.abs(percentChange)}%</span>
                </>
              ) : isIncrease ? (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                  <span>เพิ่มขึ้น {percentChange}%</span>
                </>
              ) : (
                <span>คงที่ 0%</span>
              )}
              <span className="text-[11px] font-normal text-slate-400 ml-0.5">
                เทียบ {summary.prevMonthName || "เดือนก่อน"}
              </span>
            </div>
          ) : (
            <div className="text-xs text-slate-500 bg-emerald-50/70 border border-emerald-200/80 px-3.5 py-1.5 rounded-full flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>เริ่มต้นใช้งาน: กดปุ่มด้านล่างเพื่อบันทึกค่าไฟแรกของคุณ</span>
            </div>
          )}
        </motion.div>

        {/* Center Quick Action Buttons: Prominent and Easy to Use */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3 w-full max-w-sm px-4"
        >
          {/* Primary Action Button: + Record Meter */}
          <button
            onClick={onOpenAddModal}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-[#2ECC71] to-[#27AE60] hover:from-[#27AE60] hover:to-[#219653] text-white font-semibold text-sm shadow-lg shadow-emerald-500/25 active:scale-95 transition-all cursor-pointer group"
          >
            <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
              <Plus className="w-3.5 h-3.5 text-white stroke-[2.5]" />
            </div>
            <span>+ บันทึกค่าไฟมิเตอร์</span>
          </button>

          {/* Secondary Action Button: View Dashboard */}
          <button
            onClick={onSwitchToDashboard}
            className="w-full sm:w-auto flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 font-semibold text-sm shadow-xs active:scale-95 transition-all cursor-pointer group hover:border-slate-300"
          >
            <BarChart3 className="w-4 h-4 text-slate-600 group-hover:text-emerald-600 transition-colors" />
            <span>ดูแดชบอร์ดสถิติ</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </motion.div>
      </div>

      {/* Footer Info above Bottom Bar */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.38 }}
        className="pb-24 sm:pb-28 flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-xs text-slate-400 z-10"
      >
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>อัปเดตล่าสุด: {lastUpdatedDisplay}</span>
        </div>
        <span className="hidden sm:inline text-slate-300">•</span>
        <button
          onClick={onOpenTariffModal}
          className="hover:text-emerald-600 transition-colors cursor-pointer text-slate-500 underline"
        >
          ตั้งค่าหน่วยละ ฿{user.Current_Rate_Per_Unit.toFixed(2)}
        </button>
      </motion.div>
    </div>
  );
};
