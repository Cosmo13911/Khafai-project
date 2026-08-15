"use client";

import React from "react";
import Image from "next/image";
import { Share, PlusSquare, X } from "lucide-react";
import { usePwa } from "@/context/PwaContext";

export const IosInstallModal: React.FC = () => {
  const { showIosGuide, closeIosGuide } = usePwa();

  if (!showIosGuide) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={closeIosGuide}
        aria-hidden="true"
      />
      <div className="relative bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-sm w-full p-6 text-slate-800 z-10 animate-in zoom-in-95 duration-200">
        <button
          onClick={closeIosGuide}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
          title="ปิด"
          aria-label="ปิดหน้าต่าง"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-5">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center p-2 shrink-0 shadow-xs">
            <Image
              src="/icons/icon-192x192.png"
              alt="Khafai"
              width={40}
              height={40}
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 leading-tight">
              ติดตั้ง Khafai บน iPhone / iPad
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              เพิ่มไปยังหน้าจอโฮมเพื่อใช้งานเต็มจอ
            </p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-slate-700 bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-5">
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0">
              1
            </div>
            <div className="flex-1 pt-0.5">
              <p className="font-semibold text-slate-900">
                แตะปุ่มแชร์ที่แถบล่าง Safari
              </p>
              <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                มองหาไอคอนแชร์ <Share className="w-3.5 h-3.5 text-sky-600 inline" /> บนหน้าจอเบราว์เซอร์
              </p>
            </div>
          </div>

          <div className="h-px bg-slate-200/80" />

          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg bg-sky-100 text-sky-700 font-bold flex items-center justify-center shrink-0">
              2
            </div>
            <div className="flex-1 pt-0.5">
              <p className="font-semibold text-slate-900">
                เลือก &ldquo;เพิ่มไปยังหน้าจอโฮม&rdquo;
              </p>
              <p className="text-slate-500 mt-0.5 flex items-center gap-1">
                (Add to Home Screen) <PlusSquare className="w-3.5 h-3.5 text-sky-600 inline" />
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={closeIosGuide}
          className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl transition-colors shadow-xs"
        >
          เข้าใจแล้ว
        </button>
      </div>
    </div>
  );
};
