"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { Zap, ShieldCheck, UserCheck, ArrowRight, Mail, X } from "lucide-react";

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({ isOpen, onClose }) => {
  const {
    loginWithCredential,
    loginWithCustomEmail,
    loginWithDemoAccount,
    session,
  } = useGoogleAuth();

  const [activeTab, setActiveTab] = useState<"google" | "email">("google");
  const [email, setEmail] = useState<string>("tonka4814@gmail.com");

  if (!isOpen) return null;

  const handleCustomEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;
    loginWithCustomEmail(email);
    onClose();
  };

  // Framer Motion Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.06,
        delayChildren: 0.05,
      },
    },
    exit: {
      opacity: 0,
      scale: 0.96,
      y: 10,
      transition: { duration: 0.15, ease: [0.7, 0, 0.84, 0] },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: [0, 0, 0.2, 1] } },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop Overlay with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-md cursor-pointer"
          />

          {/* Main Modal Card */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-6 sm:p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-xl z-10"
          >
            {/* Close Button */}
            {session && (
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100/80 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* Top Glowing Glassmorphic Icon */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-50 to-blue-100/60 text-blue-600 shadow-inner ring-1 ring-blue-500/20">
                <Zap className="h-7 w-7 drop-shadow-xs fill-blue-600/20" />
                {/* Subtle Pulse Ring */}
                <span className="absolute -inset-1 rounded-2xl bg-blue-400/20 animate-ping opacity-30 pointer-events-none" />
              </div>
            </motion.div>

            {/* Title & Subtitle */}
            <motion.div variants={itemVariants} className="mt-4 text-center">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                เข้าสู่ระบบ Khafai
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                บันทึกและวิเคราะห์การใช้ไฟฟ้าของคุณ
              </p>
            </motion.div>

            {/* Authentication Mode Switcher */}
            <motion.div variants={itemVariants} className="mt-6">
              <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100/80 p-1 text-xs font-semibold text-slate-500">
                <button
                  type="button"
                  onClick={() => setActiveTab("google")}
                  className={`relative rounded-lg py-2 transition-all cursor-pointer ${
                    activeTab === "google"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  Google Login
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("email")}
                  className={`relative rounded-lg py-2 transition-all cursor-pointer ${
                    activeTab === "email"
                      ? "bg-white text-blue-600 shadow-xs font-bold"
                      : "hover:text-slate-900"
                  }`}
                >
                  ผ่านอีเมล
                </button>
              </div>
            </motion.div>

            {/* Tab 1: Official Google OAuth */}
            {activeTab === "google" && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="mt-4 flex flex-col items-center justify-center space-y-3"
              >
                <div className="shadow-xs rounded-2xl overflow-hidden border border-slate-200/80 p-1 bg-white inline-block">
                  <GoogleLogin
                    onSuccess={(credentialResponse) => {
                      if (credentialResponse.credential) {
                        loginWithCredential(credentialResponse.credential);
                        onClose();
                      }
                    }}
                    onError={() => {
                      console.log("Google Login Failed");
                    }}
                    theme="outline"
                    size="large"
                    shape="pill"
                    text="signin_with"
                  />
                </div>
              </motion.div>
            )}

            {/* Tab 2: Direct Email Login */}
            {activeTab === "email" && (
              <motion.form
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                onSubmit={handleCustomEmailLogin}
                className="mt-4 space-y-3"
              >
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ระบุอีเมล Google ของคุณ"
                    className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 text-xs font-medium text-slate-900 outline-hidden transition-all placeholder:text-slate-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-semibold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700 transition-colors cursor-pointer"
                >
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight className="h-4 w-4" />
                </motion.button>
              </motion.form>
            )}

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative my-5 flex items-center justify-center">
              <div className="w-full border-t border-slate-100" />
              <span className="absolute bg-white px-3 text-[10px] font-semibold tracking-wider text-slate-400 uppercase">
                หรือทดลองใช้งาน
              </span>
            </motion.div>

            {/* Demo Mode Button */}
            <motion.div variants={itemVariants}>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => {
                  loginWithDemoAccount(
                    "google-sub-1029384756",
                    "user@khafai.app",
                    "สมชาย สายไฟฟ้า (User 1)",
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
                  );
                  onClose();
                }}
                className="group flex w-full items-center justify-between rounded-2xl border border-slate-100 bg-slate-50/70 p-3 text-left transition-colors hover:border-slate-200 hover:bg-slate-100/80 cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                    <UserCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">เข้าสู่ระบบด้วย Demo Mode</p>
                    <p className="text-[10px] text-slate-400">ทดลองใช้งานโดยไม่ต้องลงชื่อเข้าใช้</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </motion.div>

            {/* Security Badge */}
            <motion.div variants={itemVariants} className="mt-5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-emerald-600">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>ระบบรักษาความปลอดภัยบัญชี Google Verified</span>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
