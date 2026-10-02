"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { UserProfile, SummaryData } from "@/types";
import { useGoogleAuth } from "@/context/GoogleAuthContext";

interface SecondaryMenuDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  summary: SummaryData;
  onNavigate: (view: "home" | "dashboard" | "history") => void;
  onOpenTariffModal: () => void;
  onOpenTestApiModal: () => void;
  onResetData: () => void;
  onOpenGoogleLoginModal: () => void;
}

export const SecondaryMenuDrawer: React.FC<SecondaryMenuDrawerProps> = ({
  isOpen,
  onClose,
  user,
  summary,
  onNavigate,
  onOpenTariffModal,
  onOpenTestApiModal,
  onResetData,
  onOpenGoogleLoginModal,
}) => {
  const { session, logout, isAuthenticated } = useGoogleAuth();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex" id="drawer-container">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs cursor-pointer"
            id="drawer-backdrop"
            onClick={onClose}
          />

          {/* Drawer Panel Slide In & Out */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300, mass: 0.8 }}
            className="relative top-0 bottom-0 left-0 w-3/4 max-w-[300px] bg-white shadow-2xl p-6 flex flex-col justify-between h-full z-10 select-none"
            id="drawer-panel"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Drawer Section */}
            <div>
              <div className="flex items-center justify-between pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-slate-900 flex items-center justify-center text-white text-xs font-bold">
                    K
                  </span>
                  <span className="font-medium text-sm tracking-tight text-slate-900">
                    Khafai Monitor
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer text-xs"
                  id="btn-close-drawer"
                  type="button"
                >
                  ✕
                </button>
              </div>

              {/* Drawer Navigation Links */}
              <nav className="mt-6 flex flex-col space-y-4">
                {/* 1. หน้าหลักนาฬิกา */}
                <button
                  onClick={() => {
                    onNavigate("home");
                    onClose();
                  }}
                  className="flex items-center gap-3 text-sm text-slate-900 font-medium py-1 text-left cursor-pointer hover:opacity-80 transition-opacity"
                >
                  <svg
                    className="text-slate-500 shrink-0"
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 14 10" />
                  </svg>
                  <span>หน้าหลักนาฬิกา</span>
                </button>

                {/* 2. สถิติการใช้พลังงาน */}
                <button
                  onClick={() => {
                    onNavigate("dashboard");
                    onClose();
                  }}
                  className="flex items-center gap-3 text-sm text-slate-500 hover:text-slate-900 py-1 transition-colors text-left cursor-pointer"
                >
                  <svg
                    className="text-slate-400 shrink-0"
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect height="18" rx="2" width="18" x="3" y="3" />
                    <line x1="3" x2="21" y1="9" y2="9" />
                    <line x1="9" x2="9" y1="21" y2="9" />
                  </svg>
                  <span>สถิติการใช้พลังงาน (Dashboard)</span>
                </button>

                {/* 3. ประวัติการจดเลขมิเตอร์ */}
                <button
                  onClick={() => {
                    onNavigate("dashboard");
                    onClose();
                  }}
                  className="flex items-center gap-3 text-sm text-slate-500 hover:text-slate-900 py-1 transition-colors text-left cursor-pointer"
                >
                  <svg
                    className="text-slate-400 shrink-0"
                    fill="none"
                    height="18"
                    stroke="currentColor"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.8"
                    viewBox="0 0 24 24"
                    width="18"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path d="M12 8v4l3 3" />
                    <circle cx="12" cy="12" r="9" />
                  </svg>
                  <span>ประวัติบันทึกทั้งหมด</span>
                </button>

                {/* 4. อัตราค่าไฟฟ้า */}
                <button
                  onClick={() => {
                    onOpenTariffModal();
                    onClose();
                  }}
                  className="flex items-center justify-between text-sm text-slate-500 hover:text-slate-900 py-1 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="text-slate-400 shrink-0"
                      fill="none"
                      height="18"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.8"
                      viewBox="0 0 24 24"
                      width="18"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="12" cy="12" r="3" />
                      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                    <span>ตั้งค่าอัตราค่าไฟ</span>
                  </div>
                  <span className="text-xs text-slate-400 font-mono">
                    ฿{user.Current_Rate_Per_Unit.toFixed(2)}/u
                  </span>
                </button>

                {/* 5. บัญชี Google */}
                <div className="pt-2 border-t border-slate-100">
                  {isAuthenticated && !session?.isDemo ? (
                    <button
                      onClick={() => {
                        logout();
                        onClose();
                      }}
                      className="flex items-center gap-2 text-xs text-rose-500 hover:text-rose-600 font-medium py-1 cursor-pointer"
                    >
                      <span>
                        ออกจากระบบ
                        {(() => {
                          const raw = (session?.Name || user?.Email || "").replace(/\s*\([^)]*\)\s*$/g, "").trim();
                          return raw && !/^\d{8,}$/.test(raw) && !raw.endsWith("@khafai.app") ? ` (${raw})` : "";
                        })()}
                      </span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        onOpenGoogleLoginModal();
                        onClose();
                      }}
                      className="flex items-center gap-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium py-1 cursor-pointer"
                    >
                      <span>เข้าสู่ระบบ Google</span>
                    </button>
                  )}
                </div>

                {/* 6. Test API & Reset */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <button
                    onClick={() => {
                      onOpenTestApiModal();
                      onClose();
                    }}
                    className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>ทดสอบ API Google Apps Script</span>
                  </button>
                  <button
                    onClick={() => {
                      onResetData();
                      onClose();
                    }}
                    className="text-[11px] text-rose-400 hover:text-rose-600 flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>รีเซ็ตข้อมูลทดสอบ</span>
                  </button>
                </div>
              </nav>
            </div>

            {/* Footer in Drawer */}
            <div className="text-[11px] text-slate-400 space-y-1 pt-4 border-t border-slate-100">
              <p>Khafai Ambient Edition</p>
              <p className="opacity-60">อัตราเฉลี่ย ~฿{user.Current_Rate_Per_Unit.toFixed(2)} บาท/หน่วย</p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
