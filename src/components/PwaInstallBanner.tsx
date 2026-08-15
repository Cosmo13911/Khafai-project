"use client";

import React from "react";
import Image from "next/image";
import { Download, X } from "lucide-react";
import { usePwa } from "@/context/PwaContext";

export const PwaInstallBanner: React.FC = () => {
  const { showInstallBanner, isInstalled, installApp, dismissBanner } = usePwa();

  if (!showInstallBanner || isInstalled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/80 p-4 flex flex-col gap-3 text-slate-800">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center p-1.5 shrink-0 shadow-xs">
              <Image
                src="/icons/icon-192x192.png"
                alt="Khafai Logo"
                width={36}
                height={36}
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h4 className="font-bold text-sm text-slate-900 leading-tight">
                ติดตั้งแอป Khafai
              </h4>
              <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                ใช้งานสะดวก เสมือนแอปมือถือ ไม่ต้องเข้าเบราว์เซอร์
              </p>
            </div>
          </div>
          <button
            onClick={dismissBanner}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            title="ปิด"
            aria-label="ปิดการแจ้งเตือน"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={dismissBanner}
            className="flex-1 px-3 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors text-center"
          >
            ไว้ทีหลัง
          </button>
          <button
            onClick={() => installApp()}
            className="flex-1 px-3 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 active:bg-sky-800 rounded-xl transition-all shadow-xs flex items-center justify-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>ติดตั้งแอป</span>
          </button>
        </div>
      </div>
    </div>
  );
};
