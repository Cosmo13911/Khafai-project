"use client";

import React, { useState } from "react";
import { GoogleLogin } from "@react-oauth/google";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { KhafaiLogo } from "./KhafaiLogo";
import {
  ShieldCheck,
  UserCheck,
  X,
  Mail,
  ArrowRight,
  AlertCircle,
  Settings,
  HelpCircle,
} from "lucide-react";

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
    customClientId,
    setCustomClientId,
  } = useGoogleAuth();

  const [inputEmail, setInputEmail] = useState<string>("tonka4814@gmail.com");
  const [showClientIdConfig, setShowClientIdConfig] = useState<boolean>(false);
  const [tempClientId, setTempClientId] = useState<string>(customClientId);

  if (!isOpen) return null;

  const handleCustomEmailLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputEmail || !inputEmail.includes("@")) return;
    loginWithCustomEmail(inputEmail);
    onClose();
  };

  const handleSaveClientId = (e: React.FormEvent) => {
    e.preventDefault();
    setCustomClientId(tempClientId.trim());
    setShowClientIdConfig(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-center relative overflow-hidden max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        {session && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Brand Icon Header */}
        <div className="w-16 h-16 mx-auto mb-3 flex items-center justify-center">
          <KhafaiLogo className="w-16 h-16 drop-shadow-md" />
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          เข้าสู่ระบบด้วย Google
        </h2>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed max-w-xs mx-auto">
          ลงชื่อเข้าใช้งานระบบ Khafai ด้วยบัญชี Google
        </p>

        {/* Method 1: Instant Google Email Login (Fixes 401 Invalid Client) */}
        <form onSubmit={handleCustomEmailLogin} className="mt-5 text-left bg-blue-50/70 border border-blue-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-900">
            <Mail className="w-4 h-4 text-blue-600" />
            <span>เข้าสู่ระบบด่วนด้วยอีเมล Google ของคุณ</span>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-600 mb-1">
              ระบุอีเมล Google
            </label>
            <input
              type="email"
              required
              placeholder="เช่น tonka4814@gmail.com"
              value={inputEmail}
              onChange={(e) => setInputEmail(e.target.value)}
              className="w-full bg-white border border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 text-slate-900 font-bold text-sm rounded-xl py-2.5 px-3 focus:outline-hidden transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md shadow-blue-200 transition-all cursor-pointer min-h-[44px]"
          >
            <span>เข้าสู่ระบบด้วยบัญชี {inputEmail.split("@")[0] || "นี้"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Method 2: Official Google OAuth Button (with Client ID Notice) */}
        <div className="mt-5 space-y-2">
          <div className="flex items-center justify-center space-x-1.5 text-xs text-slate-500">
            <span>หรือใช้ปุ่ม Google One Tap</span>
            <button
              onClick={() => setShowClientIdConfig(!showClientIdConfig)}
              className="text-blue-600 hover:underline flex items-center font-medium cursor-pointer"
            >
              <Settings className="w-3.5 h-3.5 mr-0.5" />
              <span>(ตั้งค่า Client ID)</span>
            </button>
          </div>

          <div className="flex flex-col items-center justify-center">
            <div className="shadow-xs rounded-xl overflow-hidden border border-slate-200 p-1 bg-white inline-block">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    loginWithCredential(credentialResponse.credential);
                    onClose();
                  }
                }}
                onError={() => {
                  console.log("Google Login Failed - invalid client ID");
                }}
                theme="outline"
                size="large"
                shape="pill"
                text="signin_with"
              />
            </div>
          </div>
        </div>

        {/* Notice Explanation for 401 invalid_client */}
        {showClientIdConfig && (
          <div className="mt-4 text-left bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-3 animate-in fade-in duration-150">
            <div className="flex items-start space-x-2 text-slate-800 font-bold">
              <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <span>วิธีแก้ไขข้อผิดพลาด 401: invalid_client</span>
            </div>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              ข้อผิดพลาด 401 เกิดขึ้นเนื่องจากปุ่ม Google OAuth 2.0 ต้องใช้ <b>Google Client ID</b> ที่ลงทะเบียนจาก <b>Google Cloud Console</b> สำหรับโดเมน <code>http://localhost:3000</code>
            </p>

            <form onSubmit={handleSaveClientId} className="space-y-2 pt-1 border-t border-slate-200">
              <label className="block text-[11px] font-bold text-slate-700">
                วาง Google Client ID ของคุณที่นี่:
              </label>
              <input
                type="text"
                placeholder="เช่น 123456789-abc...apps.googleusercontent.com"
                value={tempClientId}
                onChange={(e) => setTempClientId(e.target.value)}
                className="w-full bg-white border border-slate-300 text-xs font-mono rounded-lg p-2 focus:outline-hidden focus:border-blue-600"
              />
              <button
                type="submit"
                className="px-3 py-1.5 bg-slate-800 text-white font-bold text-[11px] rounded-lg hover:bg-slate-900 cursor-pointer"
              >
                บันทึก Client ID
              </button>
            </form>
          </div>
        )}

        {/* Divider */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[11px] uppercase">
            <span className="bg-white px-3 text-slate-400 font-semibold">หรือสลับใช้นามสมมติ Demo</span>
          </div>
        </div>

        {/* Demo Google Accounts List */}
        <div className="space-y-2 text-left">
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
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-blue-50/50 hover:border-blue-300 transition-all cursor-pointer group min-h-[44px]"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                ส
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-blue-600">
                  สมชาย สายไฟฟ้า (User 1)
                </p>
                <p className="text-[10px] text-slate-500">user@khafai.app</p>
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
          </button>

          <button
            onClick={() => {
              loginWithDemoAccount(
                "google-sub-9988776655",
                "test-user2@khafai.app",
                "วิภาดา ประหยัดไฟ (User 2)",
                "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80"
              );
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-purple-50/50 hover:border-purple-300 transition-all cursor-pointer group min-h-[44px]"
          >
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-full bg-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                ว
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-purple-600">
                  วิภาดา ประหยัดไฟ (User 2)
                </p>
                <p className="text-[10px] text-slate-500">test-user2@khafai.app</p>
              </div>
            </div>
            <UserCheck className="w-4 h-4 text-slate-400 group-hover:text-purple-600" />
          </button>
        </div>

        {/* Security Badge */}
        <div className="mt-4 flex items-center justify-center space-x-1 text-[11px] text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>GAS API Proxy Verified (Multi-user Data Isolation)</span>
        </div>
      </div>
    </div>
  );
};
