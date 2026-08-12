"use client";

import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { GoogleLogin } from "@react-oauth/google";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { Zap, ShieldCheck, X } from "lucide-react";

interface GoogleLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GoogleLoginModal: React.FC<GoogleLoginModalProps> = ({ isOpen, onClose }) => {
  const { loginWithCredential, session } = useGoogleAuth();

  if (!isOpen) return null;

  // Motion Animation Variants
  const containerVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 15 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.25,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.08,
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
            className="relative w-full max-w-sm overflow-hidden rounded-3xl border border-white/80 bg-white/95 p-8 shadow-2xl shadow-blue-500/10 backdrop-blur-xl text-center z-10"
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
              <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-b from-blue-50 to-blue-100/60 text-blue-600 shadow-inner ring-1 ring-blue-500/20">
                <Zap className="h-8 w-8 drop-shadow-xs fill-blue-600/20" />
                {/* Subtle Pulse Ring */}
                <span className="absolute -inset-1 rounded-2xl bg-blue-400/20 animate-ping opacity-30 pointer-events-none" />
              </div>
            </motion.div>

            {/* Title & Subtitle */}
            <motion.div variants={itemVariants} className="mt-5 space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                เข้าสู่ระบบ Khafai
              </h2>
              <p className="text-xs text-slate-500">
                บันทึกและวิเคราะห์การใช้ไฟฟ้าของคุณ
              </p>
            </motion.div>

            {/* Single Action: Google Sign-In */}
            <motion.div variants={itemVariants} className="mt-8 flex flex-col items-center justify-center">
              <div className="shadow-xs rounded-2xl overflow-hidden border border-slate-200/80 p-1 bg-white inline-block hover:shadow-md transition-all hover:scale-[1.02]">
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

            {/* Security Badge */}
            <motion.div variants={itemVariants} className="mt-8 flex items-center justify-center gap-1.5 text-[11px] font-medium text-emerald-600">
              <ShieldCheck className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>ระบบรักษาความปลอดภัยบัญชี Google Verified</span>
            </motion.div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
