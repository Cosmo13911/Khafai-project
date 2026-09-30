"use client";

import React, { useState } from "react";
import { Lightbulb, ChevronRight, Zap, CheckCircle2 } from "lucide-react";

interface Tip {
  id: number;
  title: string;
  desc: string;
  savingEstimate: string;
}

const TIPS: Tip[] = [
  {
    id: 1,
    title: "ปรับแอร์ 26°C ควบคู่เปิดพัดลม",
    desc: "ประหยัดไฟได้เพิ่มขึ้นถึง 10-15% โดยความเย็นสบายยังเท่าเดิม",
    savingEstimate: "ลดได้ ~15%",
  },
  {
    id: 2,
    title: "ถอดปลั๊กอุปกรณ์ที่ Standby ไว้",
    desc: "เครื่องใช้ไฟฟ้าเช่น ทีวี ไมโครเวฟ ยังกินกระแสไฟแฝงอยู่ตลอดเวลา",
    savingEstimate: "ลดได้ ~5-8%",
  },
  {
    id: 3,
    title: "ทำความสะอาดฟิลเตอร์แอร์ทุก 2-3 สัปดาห์",
    desc: "แผ่นกรองอากาศที่สะอาดช่วยให้คอมเพรสเซอร์ทำงานเบาลงและกินไฟน้อยลง",
    savingEstimate: "ลดได้ ~5-10%",
  },
  {
    id: 4,
    title: "เปลี่ยนมาใช้หลอดไฟ LED",
    desc: "กินไฟน้อยกว่าหลอดไส้ถึง 85% และมีอายุการใช้งานที่ยาวนานกว่า",
    savingEstimate: "ลดได้ ~80%",
  },
];

export const EnergySavingTipsCard: React.FC = () => {
  const [currentTipIndex, setCurrentTipIndex] = useState(0);

  const nextTip = () => {
    setCurrentTipIndex((prev) => (prev + 1) % TIPS.length);
  };

  const tip = TIPS[currentTipIndex];

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm/60 flex flex-col justify-between transition-all hover:shadow-md hover:border-slate-200">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Lightbulb className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 tracking-tight">
              เคล็ดลับประหยัดไฟ
            </h3>
          </div>
          <span className="text-[11px] font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
            {tip.savingEstimate}
          </span>
        </div>

        <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100/80 my-2">
          <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-1.5 mb-1">
            <Zap className="w-3.5 h-3.5 text-[#2ECC71]" />
            {tip.title}
          </h4>
          <p className="text-xs text-slate-500 leading-relaxed">
            {tip.desc}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-100 text-xs">
        <div className="flex space-x-1">
          {TIPS.map((_, idx) => (
            <span
              key={idx}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                idx === currentTipIndex ? "w-4 bg-[#2ECC71]" : "w-1.5 bg-slate-200"
              }`}
            />
          ))}
        </div>

        <button
          onClick={nextTip}
          className="text-xs text-slate-500 hover:text-slate-900 font-medium flex items-center gap-1 cursor-pointer transition-colors group"
        >
          <span>ข้อถัดไป</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
