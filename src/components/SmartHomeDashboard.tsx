"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import {
  Zap,
  TrendingDown,
  TrendingUp,
  Lightbulb,
  Sparkles,
  Power,
  Tv,
  Refrigerator,
  Wind,
  Laptop,
  Flame,
  Clock,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  Info,
  Layers,
  Activity,
  SlidersHorizontal,
} from "lucide-react";
import { SummaryData, MonthlyChartData, UserProfile } from "@/types";

export type TimeFilterPeriod = "today" | "week" | "month";

interface SmartHomeDashboardProps {
  summary: SummaryData;
  user: UserProfile;
  monthlyChartData?: MonthlyChartData[];
  onOpenTariffModal?: () => void;
  onOpenAddModal?: () => void;
}

interface SmartDevice {
  id: string;
  name: string;
  room: string;
  category: "climate" | "kitchen" | "lighting" | "workstation" | "entertainment";
  icon: React.ReactNode;
  powerWatts: number;
  dailyKwh: number;
  isOn: boolean;
  statusText?: string;
  schedule?: string;
  softBg: string;
  activeColor: string;
  badgeText?: string;
}

interface EnergyTip {
  id: string;
  title: string;
  description: string;
  potentialSaving: string;
  type: "recommendation" | "alert" | "insight";
  icon: React.ReactNode;
}

// 24-Hour Spline Curve Data for Today
const TODAY_ENERGY_CURVE = [
  { time: "00:00", watts: 420, baseline: 380 },
  { time: "02:00", watts: 390, baseline: 370 },
  { time: "04:00", watts: 380, baseline: 360 },
  { time: "06:00", watts: 540, baseline: 420 },
  { time: "08:00", watts: 980, baseline: 750 },
  { time: "10:00", watts: 1120, baseline: 900 },
  { time: "12:00", watts: 1420, baseline: 1100 },
  { time: "14:00", watts: 1380, baseline: 1050 },
  { time: "16:00", watts: 1240, baseline: 950 },
  { time: "18:00", watts: 1580, baseline: 1250 },
  { time: "20:00", watts: 1650, baseline: 1300 },
  { time: "22:00", watts: 1180, baseline: 920 },
];

// 7-Day Spline Curve Data for This Week
const WEEK_ENERGY_CURVE = [
  { time: "จันทร์", watts: 1250, kwh: 14.2, cost: 113.6 },
  { time: "อังคาร", watts: 1380, kwh: 15.8, cost: 126.4 },
  { time: "พุธ", watts: 1190, kwh: 13.5, cost: 108.0 },
  { time: "พฤหัส", watts: 1420, kwh: 16.1, cost: 128.8 },
  { time: "ศุกร์", watts: 1650, kwh: 18.7, cost: 149.6 },
  { time: "เสาร์", watts: 1820, kwh: 21.0, cost: 168.0 },
  { time: "อาทิตย์", watts: 1740, kwh: 19.8, cost: 158.4 },
];

// Initial Smart Device Registry
const INITIAL_DEVICES: SmartDevice[] = [
  {
    id: "dev-ac-living",
    name: "แอร์ห้องนั่งเล่น (Inverter)",
    room: "ห้องนั่งเล่น",
    category: "climate",
    icon: <Wind className="w-5 h-5 text-emerald-600" />,
    powerWatts: 680,
    dailyKwh: 4.8,
    isOn: true,
    statusText: "ตั้งไว้ 25°C • โหมด Cool",
    schedule: "เปิด 6 ชม. ต่อเนื่อง",
    softBg: "bg-emerald-50",
    activeColor: "#10B981",
    badgeText: "High Draw",
  },
  {
    id: "dev-fridge-kitchen",
    name: "ตู้เย็น Inverter Multi-Door",
    room: "ห้องครัว",
    category: "kitchen",
    icon: <Refrigerator className="w-5 h-5 text-sky-600" />,
    powerWatts: 120,
    dailyKwh: 2.1,
    isOn: true,
    statusText: "ช่องแช่ 4°C • ช่องฟรีซ -18°C",
    schedule: "เปิด 24 ชม.",
    softBg: "bg-sky-50",
    activeColor: "#06B6D4",
    badgeText: "Eco Normal",
  },
  {
    id: "dev-lights-bed",
    name: "ไฟห้องนอนรวม (Smart LED)",
    room: "ห้องนอน",
    category: "lighting",
    icon: <Lightbulb className="w-5 h-5 text-amber-500" />,
    powerWatts: 0,
    dailyKwh: 0.4,
    isOn: false,
    statusText: "ปิดอยู่ • Standby 0W",
    schedule: "ตั้งเวลาเปิด 19:00",
    softBg: "bg-amber-50",
    activeColor: "#F59E0B",
    badgeText: "Off",
  },
  {
    id: "dev-workstation",
    name: "Workstation & Dual Screens",
    room: "ห้องทำงาน",
    category: "workstation",
    icon: <Laptop className="w-5 h-5 text-indigo-600" />,
    powerWatts: 210,
    dailyKwh: 2.3,
    isOn: true,
    statusText: "ใช้งานอยู่ • Active Load",
    schedule: "เปิดแล้ว 4.2 ชม.",
    softBg: "bg-indigo-50",
    activeColor: "#6366F1",
    badgeText: "Moderate",
  },
  {
    id: "dev-tv-living",
    name: "Smart OLED TV 65″",
    room: "ห้องนั่งเล่น",
    category: "entertainment",
    icon: <Tv className="w-5 h-5 text-purple-600" />,
    powerWatts: 140,
    dailyKwh: 1.1,
    isOn: true,
    statusText: "โหมด Home Theater",
    schedule: "กำลังใช้งาน",
    softBg: "bg-purple-50",
    activeColor: "#8B5CF6",
  },
  {
    id: "dev-water-heater",
    name: "เครื่องทำน้ำอุ่น Digital 4500W",
    room: "ห้องน้ำ",
    category: "climate",
    icon: <Flame className="w-5 h-5 text-rose-500" />,
    powerWatts: 0,
    dailyKwh: 1.5,
    isOn: false,
    statusText: "Standby ปลอดภัย",
    schedule: "พร้อมใช้งาน",
    softBg: "bg-rose-50",
    activeColor: "#F43F5E",
    badgeText: "Standby",
  },
];

const AI_TIPS: EnergyTip[] = [
  {
    id: "tip-1",
    title: "ปรับอุณหภูมิแอร์ห้องนั่งเล่น 26°C",
    description: "แอร์ห้องนั่งเล่นเปิดต่อเนื่องนานกว่า 6 ชม. แนะนำปรับเพิ่มเป็น 26°C ร่วมกับพัดลมหมุนเวียนเพื่อลดภาระคอมเพรสเซอร์",
    potentialSaving: "ประหยัด ~15% (ประมาณ ฿240/เดือน)",
    type: "recommendation",
    icon: <Sparkles className="w-4 h-4 text-emerald-600" />,
  },
  {
    id: "tip-2",
    title: "ตรวจพบไฟห้องน้ำและทางเดินเปิดทิ้งไว้",
    description: "เปิดไฟ Standby ติดต่อกันเกิน 3 ชั่วโมงในช่วงที่ไม่มีการเคลื่อนไหว สามารถตั้งระบบปิดอัตโนมัติได้",
    potentialSaving: "ประหยัด ~฿65/เดือน",
    type: "alert",
    icon: <AlertTriangle className="w-4 h-4 text-amber-500" />,
  },
  {
    id: "tip-3",
    title: "Peak Hour Optimization",
    description: "ช่วงเวลา 18:00 - 21:00 เป็นช่วงที่มีการดึงโหลดสูงสุด (Peak 1,650W) แนะนำหลีกเลี่ยงการเปิดเครื่องซักผ้า/รีดผ้าช่วงนี้",
    potentialSaving: "ลดความร้อนสะสม & ยืดอายุอุปกรณ์",
    type: "insight",
    icon: <Activity className="w-4 h-4 text-sky-500" />,
  },
];

export const SmartHomeDashboard: React.FC<SmartHomeDashboardProps> = ({
  summary,
  user,
  monthlyChartData = [],
  onOpenTariffModal,
  onOpenAddModal,
}) => {
  const [period, setPeriod] = useState<TimeFilterPeriod>("today");
  const [devices, setDevices] = useState<SmartDevice[]>(INITIAL_DEVICES);
  const [roomFilter, setRoomFilter] = useState<string>("all");
  const [activeTipIndex, setActiveTipIndex] = useState<number>(0);

  // Toggle device power state
  const handleToggleDevice = (id: string) => {
    setDevices((prev) =>
      prev.map((dev) => {
        if (dev.id === id) {
          const nextState = !dev.isOn;
          return {
            ...dev,
            isOn: nextState,
            powerWatts: nextState
              ? dev.category === "climate"
                ? 680
                : dev.category === "workstation"
                ? 210
                : dev.category === "entertainment"
                ? 140
                : dev.category === "kitchen"
                ? 120
                : 45
              : 0,
            statusText: nextState ? "เปิดทำงานปกติ" : "ปิดการทำงานแล้ว (0W)",
          };
        }
        return dev;
      })
    );
  };

  // Calculate live total watts from on devices
  const liveTotalWatts = useMemo(() => {
    return devices.reduce((sum, d) => sum + (d.isOn ? d.powerWatts : 0), 0);
  }, [devices]);

  // Active devices count
  const activeDevicesCount = useMemo(() => {
    return devices.filter((d) => d.isOn).length;
  }, [devices]);

  // Filtered devices by room
  const filteredDevices = useMemo(() => {
    if (roomFilter === "all") return devices;
    return devices.filter((d) => d.room === roomFilter);
  }, [devices, roomFilter]);

  // Extract unique rooms
  const rooms = useMemo(() => {
    const rSet = new Set(devices.map((d) => d.room));
    return ["all", ...Array.from(rSet)];
  }, [devices]);

  // Monthly or Period Chart Data
  const chartData = useMemo(() => {
    if (period === "today") {
      return TODAY_ENERGY_CURVE.map((c) => ({
        time: c.time,
        watts: c.watts,
        kwh: c.watts / 1000,
        baseline: c.baseline,
        cost: (c.watts / 1000) * 8.0,
      }));
    }
    if (period === "week") {
      return WEEK_ENERGY_CURVE.map((c) => ({
        time: c.time,
        watts: c.watts,
        kwh: c.kwh,
        baseline: c.watts * 0.8,
        cost: c.cost,
      }));
    }
    // Month View: use actual monthlyChartData or mapped month data
    if (monthlyChartData && monthlyChartData.length > 0) {
      return monthlyChartData.map((item) => ({
        time: item.monthName,
        watts: Math.round((item.totalUnits * 1000) / (30 * 24)), // average equivalent watts
        kwh: item.totalUnits,
        baseline: Math.round(((item.totalUnits * 1000) / (30 * 24)) * 0.85),
        cost: item.totalCost,
      }));
    }
    // Fallback data if monthly data is empty
    return [
      { time: "สัปดาห์ 1", watts: 1100, kwh: 75, baseline: 900, cost: 600 },
      { time: "สัปดาห์ 2", watts: 1250, kwh: 88, baseline: 1000, cost: 704 },
      { time: "สัปดาห์ 3", watts: 1420, kwh: 96, baseline: 1150, cost: 768 },
      { time: "สัปดาห์ 4", watts: 1310, kwh: 82, baseline: 1050, cost: 656 },
    ];
  }, [period, monthlyChartData]);

  // Rate per unit
  const ratePerUnit = user?.Current_Rate_Per_Unit || 8.0;

  // Monthly forecasted cost
  const forecastCost = useMemo(() => {
    // Estimate based on currentMonthCost
    return summary.currentMonthCost > 0 ? summary.currentMonthCost * 1.15 : 2480;
  }, [summary]);

  // Comparison Badge calculation
  const percentChange = summary.costPercentChange ?? -8.4;
  const isDown = percentChange <= 0;

  return (
    <div className="space-y-6">
      {/* 1. MAIN ENERGY OVERVIEW CARD */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-100/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] relative overflow-hidden"
      >
        {/* Subtle Ambient Background Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-100/40 via-teal-50/20 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-gradient-to-tr from-sky-100/30 via-emerald-50/10 to-transparent rounded-full blur-3xl pointer-events-none -mb-20" />

        {/* Card Header & Time Filter */}
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Zap className="w-6 h-6 fill-white/20" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Energy & Smart Home Dashboard
                </h1>
                {/* Live Pulse Indicator */}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 shadow-xs">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  LIVE
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                มอนิเตอร์กำลังไฟฟ้าแบบเรียลไทม์ และควบคุมอุปกรณ์อัจฉริยะในบ้าน
              </p>
            </div>
          </div>

          {/* Time Filter Tabs: [วันนี้ / สัปดาห์นี้ / เดือนนี้] */}
          <div className="inline-flex p-1 bg-slate-100/80 rounded-2xl self-start md:self-center border border-slate-200/60">
            <button
              onClick={() => setPeriod("today")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                period === "today"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              วันนี้
            </button>
            <button
              onClick={() => setPeriod("week")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                period === "week"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              สัปดาห์นี้
            </button>
            <button
              onClick={() => setPeriod("month")}
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                period === "month"
                  ? "bg-white text-slate-900 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              เดือนนี้
            </button>
          </div>
        </div>

        {/* KPI Metrics Grid */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 py-6 border-b border-slate-100">
          {/* KPI 1: Real-time Watts */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100/80 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
              <span>กำลังไฟปัจจุบัน</span>
              <span className="flex items-center text-emerald-600 font-semibold gap-1 text-[11px]">
                <Activity className="w-3.5 h-3.5" />
                Live Draw
              </span>
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {liveTotalWatts.toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-400">W</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              <span>เปิดอยู่ {activeDevicesCount} จาก {devices.length} อุปกรณ์</span>
            </div>
          </div>

          {/* KPI 2: Energy Consumed (kWh) */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100/80 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
              <span>พลังงานสะสม ({period === "today" ? "วันนี้" : period === "week" ? "สัปดาห์นี้" : "เดือนนี้"})</span>
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {period === "today"
                  ? (liveTotalWatts > 0 ? (liveTotalWatts * 0.009).toFixed(1) : "12.4")
                  : period === "week"
                  ? "118.6"
                  : summary.currentMonthUnits.toLocaleString(undefined, { maximumFractionDigits: 1 })}
              </span>
              <span className="text-xs font-semibold text-slate-400">kWh</span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              อัตราค่าไฟเฉลี่ย ฿{ratePerUnit.toFixed(2)} /หน่วย
            </div>
          </div>

          {/* KPI 3: Forecast End of Month */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100/80 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
              <span>คาดการณ์ค่าไฟสิ้นเดือน</span>
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
            </div>
            <div className="flex items-baseline space-x-1.5">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight font-mono text-emerald-950">
                ฿{Math.round(forecastCost).toLocaleString()}
              </span>
              <span className="text-xs font-semibold text-slate-400">THB</span>
            </div>
            <div className="mt-2 text-[11px] text-emerald-700 flex items-center gap-1 font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>ประเมินโดย AI Engine</span>
            </div>
          </div>

          {/* KPI 4: Comparison vs Previous Period */}
          <div className="p-4 sm:p-5 rounded-2xl bg-slate-50/70 border border-slate-100/80 hover:bg-slate-50 transition-colors">
            <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1.5">
              <span>เทียบกับรอบก่อนหน้า</span>
              <Clock className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="flex items-center space-x-2">
              <span
                className={`inline-flex items-center gap-1 px-3 py-1 rounded-xl text-sm font-bold shadow-xs ${
                  isDown
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                    : "bg-rose-100 text-rose-800 border border-rose-200"
                }`}
              >
                {isDown ? (
                  <TrendingDown className="w-4 h-4" />
                ) : (
                  <TrendingUp className="w-4 h-4" />
                )}
                {Math.abs(percentChange).toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 font-medium">
                {isDown ? "ประหยัดขึ้น" : "ใช้ไฟเพิ่มขึ้น"}
              </span>
            </div>
            <div className="mt-2 text-[11px] text-slate-500">
              {isDown ? "ประหยัดกว่าค่าเฉลี่ยปกติ" : "สูงกว่าค่าเฉลี่ยเป้าหมาย"}
            </div>
          </div>
        </div>

        {/* Interactive Spline Area Chart with Emerald Gradient */}
        <div className="relative z-10 pt-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>กราฟแสดงแนวโน้มพลังงาน</span>
                <span className="text-xs font-normal text-slate-500">
                  ({period === "today" ? "กำลังไฟฟ้าตามช่วงเวลา 24 ชม." : period === "week" ? "การใช้ไฟรายวัน 7 วัน" : "สถิติรายเดือน"})
                </span>
              </h3>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block shadow-xs" />
                <span className="font-medium text-slate-700">
                  {period === "today" ? "กำลังไฟ (Watts)" : "พลังงาน (kWh)"}
                </span>
              </div>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={chartData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  {/* Emerald Gradient fade to transparent */}
                  <linearGradient id="emeraldSplineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.45} />
                    <stop offset="60%" stopColor="#10B981" stopOpacity={0.12} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  {/* Secondary Cyan/Teal Gradient */}
                  <linearGradient id="cyanSplineGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                    <stop offset="100%" stopColor="#06B6D4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  strokeDasharray="4 4"
                  stroke="#E2E8F0"
                  vertical={false}
                  opacity={0.7}
                />

                <XAxis
                  dataKey="time"
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={{ stroke: "#E2E8F0" }}
                  tick={{ fill: "#64748B" }}
                />

                <YAxis
                  stroke="#94A3B8"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tick={{ fill: "#64748B" }}
                  tickFormatter={(val) => `${val}`}
                />

                <Tooltip
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const dataPoint = payload[0].payload;
                      return (
                        <div className="bg-slate-900/95 backdrop-blur-md text-white text-xs rounded-2xl p-3.5 shadow-2xl border border-slate-700/80 space-y-1.5 min-w-[170px]">
                          <div className="font-semibold text-slate-200 border-b border-slate-700 pb-1 flex justify-between">
                            <span>{label}</span>
                            <span className="text-[10px] text-emerald-400 font-mono">
                              {period === "today" ? "24H Curve" : "Summary"}
                            </span>
                          </div>
                          {period === "today" ? (
                            <div className="flex justify-between items-center text-emerald-400 font-mono font-bold">
                              <span>กำลังไฟ:</span>
                              <span className="text-sm">{dataPoint.watts?.toLocaleString()} W</span>
                            </div>
                          ) : (
                            <>
                              <div className="flex justify-between items-center text-emerald-400 font-mono">
                                <span>พลังงาน:</span>
                                <span>{dataPoint.kwh || dataPoint.watts} kWh</span>
                              </div>
                              {dataPoint.cost && (
                                <div className="flex justify-between items-center text-sky-300 font-mono">
                                  <span>คิดเป็นค่าไฟ:</span>
                                  <span>฿{Number(dataPoint.cost).toFixed(2)}</span>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                {/* Spline Area with type="monotone" */}
                <Area
                  type="monotone"
                  dataKey={period === "today" ? "watts" : "kwh"}
                  stroke="#10B981"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#emeraldSplineGradient)"
                  activeDot={{
                    r: 6,
                    fill: "#10B981",
                    stroke: "#FFFFFF",
                    strokeWidth: 3,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </motion.div>

      {/* 2. ROOM & DEVICE GRID & AI TIPS ROW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols): Room & Device Status Grid */}
        <div className="lg:col-span-8 space-y-5">
          {/* Section Header & Room Filters */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-slate-700" />
                  <span>สถานะอุปกรณ์ตามห้อง (Room & Device Grid)</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  ควบคุมเปิด-ปิดด่วน และตรวจสอบปริมาณการกินไฟแยกตามเครื่องใช้ไฟฟ้า
                </p>
              </div>

              {/* Room Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 no-scrollbar">
                {rooms.map((room) => (
                  <button
                    key={room}
                    onClick={() => setRoomFilter(room)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                      roomFilter === room
                        ? "bg-slate-900 text-white shadow-xs"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {room === "all" ? "ทั้งหมด" : room}
                  </button>
                ))}
              </div>
            </div>

            {/* 2-Column Responsive Device Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {filteredDevices.map((device) => {
                  return (
                    <motion.div
                      key={device.id}
                      layout
                      initial={{ opacity: 0, scale: 0.98 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      className={`relative rounded-2xl p-4 sm:p-5 border transition-all duration-300 flex flex-col justify-between ${
                        device.isOn
                          ? "bg-white border-slate-200 shadow-sm hover:shadow-md"
                          : "bg-slate-50/60 border-slate-200/50 opacity-80"
                      }`}
                    >
                      {/* Top Row: Icon + Room + Quick Toggle */}
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          {/* Soft Pastel Circle Icon */}
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center transition-all ${
                              device.isOn
                                ? `${device.softBg} shadow-xs`
                                : "bg-slate-200 text-slate-400"
                            }`}
                          >
                            {device.icon}
                          </div>
                          <div>
                            <span className="text-[10px] font-medium tracking-wide uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                              {device.room}
                            </span>
                            {device.badgeText && (
                              <span
                                className={`ml-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md ${
                                  device.isOn
                                    ? "bg-emerald-50 text-emerald-700"
                                    : "bg-slate-100 text-slate-400"
                                }`}
                              >
                                {device.badgeText}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Interactive Toggle Switch */}
                        <button
                          type="button"
                          onClick={() => handleToggleDevice(device.id)}
                          aria-label={`Toggle ${device.name}`}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden focus:ring-2 focus:ring-emerald-400 focus:ring-offset-2 ${
                            device.isOn ? "bg-emerald-500" : "bg-slate-300"
                          }`}
                        >
                          <span
                            aria-hidden="true"
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                              device.isOn ? "translate-x-5" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </div>

                      {/* Middle: Device Name & Status */}
                      <div className="my-1">
                        <h4 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight line-clamp-1">
                          {device.name}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                          {device.statusText}
                        </p>
                      </div>

                      {/* Bottom Row: Live Power Draw & kWh */}
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-slate-400">กินไฟ:</span>
                          <span
                            className={`font-mono font-bold text-sm ${
                              device.isOn ? "text-slate-900" : "text-slate-400"
                            }`}
                          >
                            {device.powerWatts} W
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                          <span>~{device.dailyKwh} kWh/วัน</span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): AI Energy Tips & Smart Recommendations */}
        <div className="lg:col-span-4 space-y-5">
          {/* 3. AI Energy Tips Card */}
          <div className="bg-gradient-to-b from-white to-slate-50 rounded-3xl p-6 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
                      คำแนะนำประหยัดไฟ AI
                    </h3>
                    <p className="text-[11px] text-slate-400">วิเคราะห์ตามพฤติกรรมการใช้งานจริง</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                  Smart AI
                </span>
              </div>

              {/* Active AI Tip Carousel/Selector */}
              <div className="space-y-3">
                {AI_TIPS.map((tip, idx) => {
                  const isCurrent = idx === activeTipIndex;
                  return (
                    <motion.div
                      key={tip.id}
                      onClick={() => setActiveTipIndex(idx)}
                      whileHover={{ scale: 1.01 }}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                        isCurrent
                          ? "bg-white border-emerald-500/40 shadow-sm ring-1 ring-emerald-500/20"
                          : "bg-white/60 border-slate-200/70 hover:bg-white"
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="w-7 h-7 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
                          {tip.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
                              {tip.title}
                            </h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                            {tip.description}
                          </p>
                          <div className="mt-2.5 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>{tip.potentialSaving}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Quick Automation Notice Banner */}
            <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-transparent border border-emerald-500/20 text-xs text-slate-700 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>เปิดโหมด Eco Optimization ประหยัดอัตโนมัติ</span>
              </div>
              <button
                type="button"
                className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 underline cursor-pointer"
              >
                เปิดใช้
              </button>
            </div>
          </div>

          {/* Quick Tariff & Meter Entry Shortcut */}
          <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_20px_rgb(0,0,0,0.03)] flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                <Zap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  อัตราค่าไฟปัจจุบัน
                </h4>
                <p className="text-[11px] text-slate-500">
                  ฿{ratePerUnit.toFixed(2)} บาท/หน่วย
                </p>
              </div>
            </div>
            {onOpenTariffModal && (
              <button
                onClick={onOpenTariffModal}
                className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              >
                แก้ไข
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
