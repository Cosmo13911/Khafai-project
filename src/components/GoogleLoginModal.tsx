"use client";

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { Zap, X, UserCheck, ShieldCheck, Mail, ArrowRight } from "lucide-react";

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

  const [inputEmail, setInputEmail] = useState<string>("tonka4814@gmail.com");

  if (!isOpen) return null;

  const handleCustomEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes("@")) return;
    loginWithCustomEmail(inputEmail);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 sm:p-7 shadow-2xl border border-slate-200 text-center relative overflow-hidden">
        {/* Close Button */}
        {session && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Brand Icon Header */}
        <div className="w-12 h-12 mx-auto mb-3.5 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shadow-2xs">
          <Zap className="w-6 h-6 fill-blue-600/20" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          เข้าสู่ระบบ Khafai
        </h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          บันทึกและวิเคราะห์การใช้ไฟฟ้าของคุณ
        </p>

        {/* Primary Action: Official Google Sign-In & Quick Email */}
        <div className="mt-6 space-y-3">
          <div className="flex justify-center">
            <div className="shadow-2xs rounded-xl overflow-hidden border border-slate-200/80 p-0.5 bg-white">
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
          </div>

          {/* Quick Email Access Input */}
          <form onSubmit={handleCustomEmailLogin} className="pt-1">
            <div className="relative">
              <input
                type="email"
                required
                placeholder="ระบุอีเมล Google"
                value={inputEmail}
                onChange={(e) => setInputEmail(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-blue-500 focus:bg-white text-slate-900 font-medium text-xs rounded-xl py-2.5 pl-9 pr-24 focus:outline-hidden transition-all"
              />
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-1 top-1 bottom-1 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg transition-colors cursor-pointer flex items-center space-x-1"
              >
                <span>เข้าสู่ระบบ</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </form>
        </div>

        {/* Soft Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-100" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-white px-3 text-slate-400 font-medium">หรือทดลองใช้งาน</span>
          </div>
        </div>

        {/* Demoted Secondary Demo Account Option */}
        <button
          onClick={() => {
            loginWithDemoAccount(
              "google-sub-1029384756",
              "user@khafai.app",
              "สมชาย สายไฟฟ้า (User 1)",
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
            );
            onClose();
          }}
          className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200/70 bg-slate-50/80 hover:bg-slate-100 hover:border-slate-300 transition-all cursor-pointer text-xs font-semibold text-slate-700 group"
        >
          <div className="flex items-center space-x-2.5">
            <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 font-bold flex items-center justify-center text-[11px]">
              👤
            </div>
            <span>เข้าสู่ระบบด้วย Demo Mode</span>
          </div>
          <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
        </button>

        {/* Security Badge */}
        <div className="mt-5 flex items-center justify-center space-x-1.5 text-[10px] text-emerald-600 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span>ระบบรักษาความปลอดภัยบัญชี Google Verified</span>
        </div>
      </div>
    </div>
  );
};
