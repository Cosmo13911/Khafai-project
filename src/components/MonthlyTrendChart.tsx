"use client";

import React, { memo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import { MonthlyChartData } from "@/types";
import { BarChart3 } from "lucide-react";

interface MonthlyTrendChartProps {
  data: MonthlyChartData[];
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: MonthlyChartData }>;
}

const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const item = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white text-xs rounded-xl p-3 shadow-xl border border-slate-800 space-y-1">
        <p className="font-bold text-slate-200 border-b border-slate-700 pb-1 mb-1">
          เดือน {item.monthName}
        </p>
        <div className="flex justify-between space-x-4">
          <span className="text-slate-400">หน่วยไฟฟ้าที่ใช้:</span>
          <span className="font-semibold text-blue-400">{item.totalUnits} kWh</span>
        </div>
        <div className="flex justify-between space-x-4">
          <span className="text-slate-400">ค่าไฟฟ้ารวม:</span>
          <span className="font-bold text-emerald-400">฿{item.totalCost.toFixed(2)}</span>
        </div>
        <div className="flex justify-between space-x-4">
          <span className="text-slate-400">จำนวนบันทึก:</span>
          <span className="font-medium text-slate-300">{item.logCount} ครั้ง</span>
        </div>
      </div>
    );
  }
  return null;
};

export const MonthlyTrendChart: React.FC<MonthlyTrendChartProps> = memo(({ data }) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900">แนวโน้มค่าใช้จ่ายรายเดือน</h2>
            <p className="text-xs text-slate-500">กราฟแสดงยอดค่าไฟฟ้า (บาท) ในแต่ละเดือน</p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-slate-400 text-sm">
          <span>ยังไม่มีข้อมูลสถิติรายเดือน</span>
        </div>
      ) : (
        <div key={data.map((d) => d.monthKey).join("-")} className="w-full h-64 sm:h-72 animate-in fade-in duration-300 ease-out">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 10, right: 15, left: 15, bottom: 0 }}>
              <XAxis
                dataKey="monthName"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                width={65}
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 11 }}
                tickFormatter={(val) => `฿${Number(val).toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f1f5f9" }} />
              <Bar
                dataKey="totalCost"
                fill="#3B82F6"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
                barSize={28}
                isAnimationActive={true}
                animationDuration={350}
                animationEasing="ease-out"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
});

MonthlyTrendChart.displayName = "MonthlyTrendChart";
