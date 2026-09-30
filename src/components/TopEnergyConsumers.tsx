"use client";

import React from "react";
import { Wind, Refrigerator, Tv, Flame, Laptop, MoreHorizontal } from "lucide-react";

interface ConsumerItem {
  name: string;
  percentage: number;
  color: string;
  icon: React.ReactNode;
  estimatedCost?: number;
}

interface TopEnergyConsumersProps {
  totalCost?: number;
}

export const TopEnergyConsumers: React.FC<TopEnergyConsumersProps> = ({ totalCost = 0 }) => {
  const consumers: ConsumerItem[] = [
    {
      name: "เครื่องปรับอากาศ",
      percentage: 45,
      color: "#2ECC71", // SmartPower Emerald
      icon: <Wind className="w-3.5 h-3.5 text-emerald-600" />,
    },
    {
      name: "ตู้เย็น & ตู้แช่",
      percentage: 15,
      color: "#5DADE2", // SmartPower Sky Blue
      icon: <Refrigerator className="w-3.5 h-3.5 text-sky-600" />,
    },
    {
      name: "อุปกรณ์อื่นๆ (แสงสว่าง, ปลั๊ก)",
      percentage: 40,
      color: "#94A3B8", // Slate
      icon: <MoreHorizontal className="w-3.5 h-3.5 text-slate-500" />,
    },
  ];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm/60 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-200">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-[#2ECC71]">
              <Wind className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
                อุปกรณ์ที่ใช้ไฟสูงสุด
              </h3>
              <p className="text-[11px] text-slate-400">ประมาณการสัดส่วนตามประเภทการใช้งาน</p>
            </div>
          </div>
        </div>

        {/* Stacked Progress Bar */}
        <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden flex my-3 p-0.5">
          {consumers.map((item, idx) => (
            <div
              key={idx}
              style={{
                width: `${item.percentage}%`,
                backgroundColor: item.color,
              }}
              className="h-full first:rounded-l-full last:rounded-r-full transition-all duration-500 hover:opacity-90"
              title={`${item.name}: ${item.percentage}%`}
            />
          ))}
        </div>

        {/* Breakdown List */}
        <div className="space-y-2 mt-4">
          {consumers.map((item, idx) => {
            const approxCost = totalCost > 0 ? (totalCost * item.percentage) / 100 : 0;
            return (
              <div key={idx} className="flex items-center justify-between text-xs py-1">
                <div className="flex items-center space-x-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-slate-700 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  {totalCost > 0 && (
                    <span className="text-slate-400 font-mono text-[11px]">
                      ~฿{approxCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                    </span>
                  )}
                  <span className="font-semibold text-slate-800 font-mono bg-slate-50 px-2 py-0.5 rounded-md border border-slate-100 text-[11px]">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
        <span>คำนวณจากค่าเฉลี่ยครัวเรือนทั่วไป</span>
        <span className="text-[#2ECC71] font-medium">Smart Analytics</span>
      </div>
    </div>
  );
};
