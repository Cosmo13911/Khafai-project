"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { GoogleLogin, useGoogleLogin } from "@react-oauth/google";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { ShieldCheck, Zap, BarChart3, FileText, Unplug } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredential, loginWithDemoAccount, isAuthenticated, isLoading } = useGoogleAuth();
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [typedCode, setTypedCode] = useState<string>("");

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isMounted && !isLoading && isAuthenticated) {
      router.push("/");
    }
  }, [isMounted, isAuthenticated, isLoading, router]);

  // Programmatic Google OAuth trigger for custom interactive button
  const triggerCustomGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
        });
        const data = await res.json();
        if (data.email) {
          loginWithDemoAccount(
            data.sub || data.email,
            data.email,
            data.name || data.email.split("@")[0],
            data.picture
          );
          router.push("/");
        }
      } catch (err) {
        console.error("Google userinfo fetch failed:", err);
      }
    },
    onError: (errorResponse) => {
      console.log("Google Login Failed:", errorResponse);
    },
  });

  // Code editor typewriter effect inside main monitor screen
  useEffect(() => {
    const fullText = `/* KHAFAI ENERGY TRACKER v1.0 */

console.log("Welcome to Khafai!");
console.log("Track & optimize your electricity bills.");

// Status: 200 OK (System Operational)
const currentBill = 0; // Ideal State`;
    let index = 0;
    const typingInterval = setInterval(() => {
      if (index <= fullText.length) {
        setTypedCode(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(typingInterval);
      }
    }, 25);

    return () => clearInterval(typingInterval);
  }, []);

  if (!isMounted) return null;

  return (
    <div className="min-h-screen w-full bg-[#F5F3FF] bg-[radial-gradient(#ddd6fe_1px,transparent_1px)] [background-size:16px_16px] flex items-center justify-center p-4 sm:p-6 lg:p-8 font-sans antialiased text-[#111827] select-none relative overflow-hidden">
      
      {/* Scope 3D Room Scene CSS Styles */}
      <style jsx global>{`
        :root {
          --night-1: #06070f;
          --night-2: #0d1022;
          --night-3: #161a33;
          --lamp-warm: #ffd9a0;
          --lamp-hot: #ffbe6a;
          --screen-blue: #7db4ff;
          --screen-cyan: #59e0ff;
          --accent: #ffb35c;
          --accent-2: #ff8f5c;
          --wood-hi: #9a6a44;
          --wood-mid: #7a4f30;
          --wood-low: #573619;
        }

        /* 3D Room Components */
        .room-wrap {
          perspective: 1000px;
        }
        .room {
          position: relative;
          width: 580px;
          height: 480px;
          transform-style: preserve-3d;
          filter: drop-shadow(0 20px 40px rgba(0, 0, 0, 0.45));
        }

        .wall {
          position: absolute;
          inset: 0;
          border-radius: 18px 18px 0 0;
          background:
            linear-gradient(180deg, rgba(255, 200, 130, 0.06), transparent 40%),
            repeating-linear-gradient(90deg, rgba(255, 255, 255, 0.015) 0 50px, transparent 50px 52px),
            linear-gradient(160deg, #232648 0%, #181a36 55%, #10122a 100%);
          box-shadow: inset 0 -100px 100px rgba(0, 0, 0, 0.5);
        }
        .wall::after {
          content: ''; position: absolute; left: 0; right: 0; bottom: 80px; height: 12px;
          background: linear-gradient(180deg, #2c2f58, #191b38);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
        }
        .floor {
          position: absolute; left: -20px; right: -20px; bottom: -30px; height: 120px;
          background:
            repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.25) 0 4px, transparent 4px 60px),
            repeating-linear-gradient(90deg, #6b4526 0 56px, #5e3b1f 56px 60px);
          transform: rotateX(72deg); transform-origin: top;
          box-shadow: 0 -15px 30px rgba(0, 0, 0, 0.6) inset;
        }
        .rug {
          position: absolute; left: 120px; bottom: -10px; width: 340px; height: 90px; border-radius: 50%;
          background: radial-gradient(ellipse, #3d3f7a 0%, #2c2e5e 60%, transparent 72%);
          transform: rotateX(72deg); transform-origin: center; opacity: 0.9;
        }

        /* Window & Rain */
        .window {
          position: absolute; top: 30px; left: 30px; width: 160px; height: 190px;
          border-radius: 8px; overflow: hidden;
          background: linear-gradient(180deg, #0b1030 0%, #1b2350 60%, #25306b 100%);
          border: 8px solid #2b2e52;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6), inset 0 0 24px rgba(0, 0, 20, 0.6);
        }
        .moon {
          position: absolute; top: 20px; right: 24px; width: 36px; height: 36px; border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #fffbe8, #e8e0c0 70%, #cfc49a);
          box-shadow: 0 0 24px 6px rgba(255, 250, 220, 0.35);
        }
        .win-cross-h { position: absolute; left: 0; right: 0; top: 50%; height: 6px; transform: translateY(-50%); background: #2b2e52; }
        .win-cross-v { position: absolute; top: 0; bottom: 0; left: 50%; width: 6px; transform: translateX(-50%); background: #2b2e52; }
        .rain-layer { position: absolute; inset: -50px 0 0 0; overflow: hidden; }
        .drop {
          position: absolute; top: -30px; width: 2px; height: 26px; border-radius: 2px;
          background: linear-gradient(180deg, transparent, rgba(170, 200, 255, 0.75));
          animation: fall var(--t, 0.9s) linear infinite;
        }
        @keyframes fall { to { transform: translateY(280px); } }

        /* Wall Decor & Bookshelf */
        .poster { position: absolute; border-radius: 4px; box-shadow: 0 6px 14px rgba(0,0,0,.5); }
        .poster-1 { top: 40px; right: 40px; width: 80px; height: 110px; background: linear-gradient(160deg,#ff7e5f,#feb47b); transform: rotate(2deg); }
        .poster-1::after { content: 'KHAFAI'; position: absolute; inset: 0; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 12px; color: rgba(255,255,255,.9); letter-spacing: 3px; font-family: monospace; transform: rotate(-90deg); }

        .shelf {
          position: absolute; top: 170px; right: 40px; width: 140px; height: 10px; border-radius: 3px;
          background: linear-gradient(180deg, var(--wood-hi), var(--wood-low));
          box-shadow: 0 6px 12px rgba(0,0,0,.5);
        }
        .book-1 { position: absolute; bottom: 10px; left: 10px; width: 12px; height: 36px; background: #c0392b; transform: rotate(-4deg); }
        .book-2 { position: absolute; bottom: 10px; left: 24px; width: 10px; height: 40px; background: #2980b9; }
        .plant-pot { position: absolute; right: 14px; bottom: 10px; width: 24px; height: 18px; background: #b06a3a; border-radius: 3px 3px 8px 8px; }
        .plant-leaf { position: absolute; right: 18px; bottom: 26px; width: 14px; height: 26px; border-radius: 50% 50% 0 50%; background: #4caf6d; transform: rotate(-14deg); }

        /* Desk Setup */
        .chair-back {
          position: absolute; bottom: 50px; right: 110px; width: 110px; height: 160px; border-radius: 18px 18px 10px 10px;
          background: linear-gradient(160deg, #26294a, #171930); box-shadow: 0 12px 24px rgba(0,0,0,.5);
        }
        .desk {
          position: absolute; left: 40px; right: 40px; bottom: 110px; height: 22px; border-radius: 6px;
          background: linear-gradient(180deg, rgba(255,255,255,.18), transparent 30%), linear-gradient(90deg, var(--wood-mid), var(--wood-hi) 40%, var(--wood-mid));
          box-shadow: 0 10px 24px rgba(0,0,0,.6);
        }
        .desk-leg { position: absolute; top: 22px; width: 14px; height: 90px; background: linear-gradient(90deg,#3c2410,#5d3a1c 50%,#3c2410); }
        .desk-leg.left { left: 30px; } .desk-leg.right { right: 30px; }

        /* Desk Lamp */
        .lamp { position: absolute; left: 20px; bottom: 20px; width: 90px; height: 210px; }
        .lamp-base { position: absolute; bottom: 0; left: 10px; width: 60px; height: 14px; border-radius: 50%; background: #33364e; }
        .lamp-neck { position: absolute; bottom: 10px; left: 36px; width: 8px; height: 110px; border-radius: 4px; background: #666c94; transform: rotate(-16deg); transform-origin: bottom; }
        .lamp-shade { position: absolute; bottom: 155px; left: 56px; width: 60px; height: 42px; border-radius: 30px 30px 10px 10px; background: linear-gradient(180deg,#ffcf87,#e8963c); transform: rotate(18deg); box-shadow: 0 0 40px 10px rgba(255,190,100,.5); }
        .lamp-cone { position: absolute; bottom: -120px; left: 10px; width: 190px; height: 280px; background: linear-gradient(200deg, rgba(255,205,120,.35), transparent 75%); clip-path: polygon(38% 0, 62% 0, 100% 100%, 0 100%); transform: rotate(12deg); transform-origin: top; filter: blur(5px); pointer-events: none; }

        /* Main Monitor & Code Editor */
        .monitor-main { position: absolute; left: 150px; bottom: 20px; width: 240px; height: 160px; }
        .mon-frame { position: absolute; inset: 0; border-radius: 10px; background: linear-gradient(145deg, #2a2d47, #15172c); box-shadow: 0 12px 28px rgba(0,0,0,.6); }
        .mon-screen { position: absolute; inset: 8px; border-radius: 6px; overflow: hidden; background: linear-gradient(160deg, #0a1224, #101c38); box-shadow: inset 0 0 30px rgba(80,140,255,.25); }
        .mon-stand { position: absolute; left: 50%; bottom: -36px; width: 20px; height: 38px; transform: translateX(-50%); background: #1b1d33; }
        .mon-foot { position: absolute; left: 50%; bottom: -44px; width: 100px; height: 10px; transform: translateX(-50%); border-radius: 6px; background: #33375c; }
        .editor { position: absolute; inset: 0; padding: 8px 10px; font-family: 'Prompt', sans-serif, monospace; font-size: 7.5px; line-height: 1.45; }
        .editor-bar { display: flex; gap: 4px; margin-bottom: 6px; }
        .dot { width: 6px; height: 6px; border-radius: 50%; }
        .dot.r { background: #ff5f57; } .dot.y { background: #febc2e; } .dot.g { background: #28c840; }
        .editor-tabs { margin: 4px 0 6px; font-size: 7.5px; color: #8fa3d0; display: flex; gap: 8px; border-bottom: 1px solid rgba(255,255,255,.08); padding-bottom: 4px; }
        .editor-tabs span.on { color: #fff; border-bottom: 2px solid #ffb35c; }
        #codeBox { white-space: pre-wrap; word-break: break-all; color: #c8d6ff; min-height: 90px; }
        .cursor { display: inline-block; width: 5px; height: 10px; background: #ffd9a0; vertical-align: -1px; animation: blink 1s steps(1) infinite; }
        @keyframes blink { 50% { opacity: 0; } }

        /* Vertical Side Monitor */
        .monitor-side { position: absolute; left: 400px; bottom: 20px; width: 85px; height: 135px; border-radius: 8px; background: linear-gradient(145deg, #2a2d47, #15172c); box-shadow: 0 10px 24px rgba(0,0,0,.6); }
        .monitor-side .scr { position: absolute; inset: 7px; border-radius: 5px; overflow: hidden; background: #0d1430; }
        .eq { position: absolute; bottom: 0; left: 0; right: 0; height: 60%; display: flex; align-items: flex-end; gap: 3px; padding: 4px; }
        .eq i { flex: 1; border-radius: 2px 2px 0 0; background: linear-gradient(180deg, #59e0ff, #3a7bd5); animation: eqB var(--et, 0.8s) ease-in-out infinite alternate; }
        @keyframes eqB { from { height: 15%; } to { height: 95%; } }

        /* Keyboard & Mouse */
        .keyboard { position: absolute; left: 170px; bottom: -6px; width: 170px; height: 32px; border-radius: 8px; background: #2e3252; transform: rotateX(58deg); transform-origin: bottom; }
        .key-grid { position: absolute; inset: 5px 8px; display: grid; grid-template-columns: repeat(14, 1fr); gap: 2px; }
        .key-grid i { border-radius: 1px; background: #454a72; }
        .mousepad { position: absolute; left: 155px; bottom: -12px; width: 250px; height: 50px; border-radius: 10px; background: #191b32; transform: rotateX(58deg); transform-origin: bottom; }
        .mouse { position: absolute; left: 360px; bottom: -2px; width: 34px; height: 50px; border-radius: 50%; background: #3a3e60; transform: rotateX(58deg); transform-origin: bottom; }

        @media (max-width: 640px) {
          .room { transform: scale(0.44); transform-origin: center; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .room { transform: scale(0.72); transform-origin: center; }
        }
      `}</style>

      {/* Main Card Container */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-5xl bg-white rounded-[28px] shadow-xl shadow-slate-200/70 border border-gray-100 flex flex-col md:flex-row overflow-hidden min-h-[580px]"
      >
        {/* ================= 2. LEFT COLUMN: 3D Room Scene (Top on Mobile, Left 50% on Desktop) ================= */}
        <div className="w-full md:w-1/2 bg-[#06070f] p-2 sm:p-4 lg:p-6 flex items-center justify-center relative overflow-hidden h-[190px] sm:h-[260px] md:h-auto shrink-0">
          
          <div className="room-wrap overflow-hidden flex items-center justify-center">
            <div className="room" id="room">
              <div className="wall" />
              <div className="floor" />
              <div className="rug" />

              {/* Window */}
              <div className="window">
                <div className="moon" />
                <div className="rain-layer">
                  {Array.from({ length: 12 }).map((_, i) => (
                    <div
                      key={i}
                      className="drop"
                      style={{
                        left: `${(i * 14) % 150}px`,
                        ["--t" as any]: `${0.6 + (i % 4) * 0.2}s`,
                      }}
                    />
                  ))}
                </div>
                <div className="win-cross-h" />
                <div className="win-cross-v" />
              </div>

              {/* Decor */}
              <div className="poster poster-1" />
              <div className="shelf">
                <div className="book-1" />
                <div className="book-2" />
                <div className="plant-pot" />
                <div className="plant-leaf" />
              </div>

              {/* Chair */}
              <div className="chair-back" />

              {/* Desk */}
              <div className="desk">
                <div className="desk-leg left" />
                <div className="desk-leg right" />

                {/* Lamp */}
                <div className="lamp">
                  <div className="lamp-cone" />
                  <div className="lamp-base" />
                  <div className="lamp-neck" />
                  <div className="lamp-shade" />
                </div>

                {/* Main Monitor with Features & Benefits Typewriter */}
                <div className="monitor-main">
                  <div className="mon-frame" />
                  <div className="mon-screen">
                    <div className="editor">
                      <div className="editor-bar">
                        <div className="dot r" />
                        <div className="dot y" />
                        <div className="dot g" />
                      </div>
                      <div className="editor-tabs">
                        <span className="on">Features.th</span>
                        <span>Benefits.th</span>
                        <span>Khafai.ts</span>
                      </div>
                      <div id="codeBox">
                        {typedCode}
                        <span className="cursor" />
                      </div>
                    </div>
                  </div>
                  <div className="mon-stand" />
                  <div className="mon-foot" />
                </div>

                {/* Vertical Side Monitor */}
                <div className="monitor-side">
                  <div className="scr">
                    <div className="eq">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <i
                          key={i}
                          style={{ ["--et" as any]: `${0.5 + (i % 3) * 0.3}s` }}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                {/* Keyboard & Mousepad */}
                <div className="mousepad" />
                <div className="keyboard">
                  <div className="key-grid">
                    {Array.from({ length: 28 }).map((_, i) => (
                      <i key={i} />
                    ))}
                  </div>
                </div>
                <div className="mouse" />
              </div>
            </div>
          </div>
        </div>

        {/* ================= 3. RIGHT COLUMN: Single-Column Center Aligned Content & OAuth ================= */}
        <div className="w-full md:w-1/2 p-8 lg:p-12 flex flex-col items-center justify-center bg-white text-center">
          
          <div className="w-full flex flex-col items-center text-center my-auto">
            {/* 1. App Tag (ด้านบนสุด): inline-flex items-center justify-center gap-2 mb-6 */}
            <div className="inline-flex items-center justify-center gap-2 mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
              <span className="text-[#8B5CF6] font-semibold text-xs tracking-wider uppercase">
                ELECTRICITY BILL APP
              </span>
            </div>

            {/* 2. Header Title & Subtitles */}
            {/* Main Title: Welcome to Khafai */}
            <h1 className="text-3xl font-bold text-[#111827] mb-2.5 tracking-tight text-center">
              Welcome to{" "}
              <span className="inline-flex items-center gap-1.5">
                Khafai
                <Unplug className="w-6 h-6 text-[#8B5CF6] shrink-0 inline-block align-middle ml-1" />
              </span>
            </h1>

            {/* Subtitle TH: จัดการค่าไฟอย่างชาญฉลาด */}
            <p className="text-base font-medium text-[#6B7280]">
              จัดการค่าไฟอย่างชาญฉลาด
            </p>

            {/* Subtitle TH Sub: ติดตามและวิเคราะห์สถิติค่าไฟ */}
            <p className="text-xs font-normal text-[#9CA3AF] mt-1 mb-8">
              ติดตามและวิเคราะห์สถิติค่าไฟ
            </p>

            {/* 3. Google Sign-In Button (w-full max-w-xs) */}
            <div className="w-full max-w-xs relative rounded-2xl">
              {/* Interactive Visual Google Sign-In Button */}
              <motion.button
                onClick={() => triggerCustomGoogleLogin()}
                whileHover={{ scale: 1.025, y: -2 }}
                whileTap={{ scale: 0.975 }}
                type="button"
                className="relative w-full py-3.5 px-4 rounded-2xl bg-white border border-gray-200 hover:border-[#8B5CF6] shadow-sm hover:shadow-xl hover:shadow-purple-500/15 transition-all duration-300 flex items-center justify-center gap-3 cursor-pointer group overflow-hidden bg-gradient-to-r hover:from-purple-50/60 hover:via-white hover:to-purple-50/60"
              >
                {/* Google 4-Color SVG Icon */}
                <svg className="w-5 h-5 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[8deg]" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>

                {/* Button Label: Sign in with Google */}
                <span className="text-[#374151] group-hover:text-[#8B5CF6] font-semibold text-sm transition-colors duration-300 tracking-wide">
                  Sign in with Google
                </span>

                {/* Subtle Shimmer Light Sweep on Hover */}
                <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-purple-200/40 to-transparent pointer-events-none" />
              </motion.button>
            </div>

            {/* Quick Features / Value Proposition */}
            <div className="w-full max-w-xs mt-5 sm:mt-6 grid grid-cols-3 gap-1.5 sm:gap-2 text-center">
              <div className="flex flex-col items-center py-2 px-1.5 sm:p-2.5 rounded-xl bg-purple-50/60 border border-purple-100/80 transition-all hover:bg-purple-50 hover:shadow-sm">
                <Zap className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8B5CF6] mb-0.5 sm:mb-1 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-800 leading-tight">คำนวณอัตโนมัติ</span>
              </div>
              <div className="flex flex-col items-center py-2 px-1.5 sm:p-2.5 rounded-xl bg-purple-50/60 border border-purple-100/80 transition-all hover:bg-purple-50 hover:shadow-sm">
                <BarChart3 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8B5CF6] mb-0.5 sm:mb-1 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-800 leading-tight">กราฟวิเคราะห์</span>
              </div>
              <div className="flex flex-col items-center py-2 px-1.5 sm:p-2.5 rounded-xl bg-purple-50/60 border border-purple-100/80 transition-all hover:bg-purple-50 hover:shadow-sm">
                <FileText className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8B5CF6] mb-0.5 sm:mb-1 shrink-0" />
                <span className="text-[10px] sm:text-[11px] font-semibold text-slate-800 leading-tight">
                  ส่งออก<br />PDF, CSV
                </span>
              </div>
            </div>

            {/* 4. Horizontal Divider Line & 5. Footer Note */}
            <div className="w-full max-w-xs mt-6">
              <div className="mb-4 w-full border-t border-gray-100/80" />
              <p className="text-xs font-normal text-[#9CA3AF] text-center">
                Khafai App · Google OAuth 2.0
              </p>
            </div>
          </div>

        </div>

      </motion.div>

    </div>
  );
}




