"use client";

import React, { useEffect, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { usePwa } from "@/context/PwaContext";

export const OfflineStatusToast: React.FC = () => {
  const { isOnline } = usePwa();
  const [showToast, setShowToast] = useState<boolean>(false);
  const [hasChanged, setHasChanged] = useState<boolean>(false);

  useEffect(() => {
    // Only show toast after initial mount when status changes
    if (!hasChanged) {
      if (!isOnline) {
        setHasChanged(true);
        setShowToast(true);
      }
      return;
    }

    setShowToast(true);
    const timer = setTimeout(() => {
      setShowToast(false);
    }, 4000);

    return () => clearTimeout(timer);
  }, [isOnline, hasChanged]);

  if (!showToast) {
    return null;
  }

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-none">
      <div
        className={`px-4 py-2 rounded-full shadow-lg border text-xs font-semibold flex items-center gap-2 backdrop-blur-md transition-all ${
          isOnline
            ? "bg-emerald-500/90 text-white border-emerald-400/30 shadow-emerald-500/10"
            : "bg-amber-500/90 text-white border-amber-400/30 shadow-amber-500/10"
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span>เชื่อมต่ออินเทอร์เน็ตแล้ว</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            <span>ไม่มีการเชื่อมต่อ (โหมดออฟไลน์)</span>
          </>
        )}
      </div>
    </div>
  );
};
