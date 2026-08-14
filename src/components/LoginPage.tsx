"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useGoogleLogin } from "@react-oauth/google";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { Zap, BarChart3, FileText, Unplug } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { loginWithDemoAccount, isAuthenticated, isLoading } = useGoogleAuth();
  const [isMounted, setIsMounted] = useState<boolean>(false);

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

  if (!isMounted) return null;

  return (
    <div className="h-screen h-[100dvh] w-full bg-white flex flex-col md:flex-row font-sans antialiased text-[#111827] select-none relative overflow-hidden fixed inset-0">
      
      {/* Scope 3D Room Scene CSS Styles & Prevent All Page Scrolling */}
      <style jsx global>{`
        html, body {
          overflow: hidden !important;
          overscroll-behavior: none !important;
          height: 100% !important;
          width: 100% !important;
          position: fixed !important;
          inset: 0 !important;
        }

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

        /* Modern Air Conditioner on Top Right Wall */
        .air-con {
          position: absolute;
          top: 32px;
          right: 32px;
          width: 152px;
          height: 46px;
          border-radius: 6px 6px 4px 4px;
          background: linear-gradient(180deg, #ffffff 0%, #e2e8f0 70%, #cbd5e1 100%);
          border: 2px solid #33385e;
          box-shadow: 0 8px 18px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.9);
          z-index: 3;
        }
        .ac-vent-top {
          position: absolute;
          top: 3px;
          left: 10px;
          right: 10px;
          height: 2px;
          background: #94a3b8;
          border-radius: 1px;
        }
        .ac-brand {
          position: absolute;
          left: 12px;
          top: 14px;
          font-family: sans-serif;
          font-size: 6px;
          font-weight: 800;
          color: #94a3b8;
          letter-spacing: 0.5px;
        }
        .ac-display {
          position: absolute;
          right: 12px;
          top: 10px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .ac-temp {
          font-family: monospace;
          font-size: 8px;
          font-weight: bold;
          color: #06b6d4;
          text-shadow: 0 0 6px rgba(6, 182, 212, 0.9);
          letter-spacing: 0.5px;
        }
        .ac-led {
          width: 3.5px;
          height: 3.5px;
          border-radius: 50%;
          background: #10b981;
          box-shadow: 0 0 6px 2px #34d399;
          animation: acPulse 2.5s ease-in-out infinite;
        }
        .ac-louver {
          position: absolute;
          bottom: 2px;
          left: 8px;
          right: 8px;
          height: 6px;
          border-radius: 2px;
          background: linear-gradient(180deg, #cbd5e1, #94a3b8);
          border-bottom: 2px solid #64748b;
          box-shadow: 0 2px 4px rgba(0,0,0,0.25);
        }

        /* Cool Breeze Wind Streams from AC */
        .ac-breeze-stream {
          position: absolute;
          top: 76px;
          right: 38px;
          width: 140px;
          height: 90px;
          pointer-events: none;
          z-index: 2;
          overflow: visible;
        }
        .breeze-line {
          position: absolute;
          height: 2px;
          border-radius: 2px;
          background: linear-gradient(90deg, transparent, rgba(125, 211, 252, 0.65), transparent);
          animation: breezeDrift 2.4s ease-in-out infinite;
        }
        .breeze-1 { top: 8px; left: 10px; width: 65px; transform: rotate(26deg); animation-delay: 0s; }
        .breeze-2 { top: 26px; left: 24px; width: 80px; transform: rotate(28deg); animation-delay: 0.8s; }
        .breeze-3 { top: 44px; left: 16px; width: 70px; transform: rotate(27deg); animation-delay: 1.6s; }

        @keyframes breezeDrift {
          0% { opacity: 0; transform: translate(-10px, -5px) rotate(26deg) scaleX(0.7); }
          50% { opacity: 0.85; transform: translate(12px, 18px) rotate(26deg) scaleX(1.1); }
          100% { opacity: 0; transform: translate(30px, 40px) rotate(26deg) scaleX(0.9); }
        }

        @keyframes acPulse {
          0%, 100% { opacity: 0.95; }
          50% { opacity: 0.45; }
        }

        /* Posters & Shelf */
        .poster { position: absolute; border-radius: 6px; border: 3px solid #323558; box-shadow: 0 4px 10px rgba(0, 0, 0, 0.4); }
        .poster-1 {
          top: 36px; left: 215px; width: 60px; height: 80px;
          background:
            radial-gradient(circle at 50% 30%, #ffbe6a 0%, #ff8f5c 35%, transparent 36%),
            linear-gradient(180deg, #1f2348 0%, #3d2b4e 60%, #68304b 100%);
        }
        .shelf {
          position: absolute; top: 130px; left: 210px; width: 140px; height: 8px; border-radius: 2px;
          background: linear-gradient(180deg, #9a6a44, #573619);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.5);
        }
        .book-1 { position: absolute; left: 10px; bottom: 8px; width: 12px; height: 32px; background: #c84b4b; border-radius: 2px 2px 0 0; }
        .book-2 { position: absolute; left: 24px; bottom: 8px; width: 10px; height: 28px; background: #3d80b8; border-radius: 2px 2px 0 0; }
        .plant-pot {
          position: absolute; right: 14px; bottom: 8px; width: 22px; height: 20px;
          background: linear-gradient(180deg, #d87d4a, #a05328);
          border-radius: 2px 2px 5px 5px;
        }
        .plant-leaf {
          position: absolute; right: 18px; bottom: 26px; width: 14px; height: 16px; border-radius: 50% 0;
          background: #4ea86e; transform: rotate(-25deg);
        }

        /* 3D Isometric Desk & Tabletop Setup */
        .desk {
          position: absolute;
          left: 60px;
          bottom: 35px;
          width: 460px;
          height: 230px;
        }
        .desk-top {
          position: absolute;
          left: 15px;
          right: 15px;
          top: 70px;
          height: 75px;
          border-radius: 6px;
          background: linear-gradient(180deg, #9c6c44 0%, #7d4f2b 100%);
          transform: rotateX(52deg);
          transform-origin: top;
          box-shadow: 0 10px 24px rgba(0,0,0,0.55), inset 0 2px 4px rgba(255,255,255,0.15);
          border: 2px solid #5a3619;
        }
        .desk-front {
          position: absolute;
          left: 15px;
          right: 15px;
          top: 116px;
          height: 14px;
          border-radius: 0 0 4px 4px;
          background: linear-gradient(180deg, #6b4120, #4a280f);
          box-shadow: 0 4px 10px rgba(0, 0, 0, 0.6);
        }
        .desk-leg {
          position: absolute;
          top: 130px;
          width: 12px;
          height: 95px;
          background: linear-gradient(180deg, #38200d, #1a0e05);
          border-radius: 2px;
        }
        .desk-leg.left { left: 32px; }
        .desk-leg.right { right: 32px; }

        /* Desk Lamp with Bulb & Animated Light Beam */
        .lamp {
          position: absolute;
          left: 24px;
          top: 0px;
          width: 60px;
          height: 95px;
          z-index: 3;
        }
        .lamp-base {
          position: absolute;
          left: 14px;
          bottom: 8px;
          width: 32px;
          height: 8px;
          border-radius: 4px;
          background: #22263d;
          box-shadow: 0 3px 8px rgba(0,0,0,0.6);
        }
        .lamp-neck {
          position: absolute;
          left: 28px;
          bottom: 16px;
          width: 4px;
          height: 55px;
          background: #22263d;
          transform: rotate(18deg);
        }
        .lamp-shade {
          position: absolute;
          left: 14px;
          top: 8px;
          width: 36px;
          height: 22px;
          border-radius: 12px 12px 4px 4px;
          background: linear-gradient(180deg, #ff8f5c, #ff6b3d);
          transform: rotate(-30deg);
          box-shadow: 0 0 24px 4px rgba(255, 140, 90, 0.7);
          overflow: hidden;
        }
        .lamp-bulb {
          position: absolute;
          left: 6px;
          bottom: -2px;
          width: 16px;
          height: 10px;
          border-radius: 50%;
          background: #fffbe8;
          box-shadow: 0 0 12px 6px #ffd9a0, 0 0 24px 10px rgba(255, 180, 90, 0.6);
          animation: bulbFlicker 3s ease-in-out infinite;
        }
        .lamp-cone {
          position: absolute;
          left: 12px;
          top: 24px;
          width: 250px;
          height: 180px;
          background: radial-gradient(ellipse at 12% 0%, rgba(255, 225, 150, 0.55) 0%, rgba(255, 180, 80, 0.25) 45%, rgba(255, 140, 50, 0.05) 75%, transparent 100%);
          clip-path: polygon(4% 0%, 16% 0%, 100% 100%, 0% 100%);
          pointer-events: none;
          z-index: 4;
          animation: lampFlicker 3s ease-in-out infinite;
        }
        .desk-light-spot {
          position: absolute;
          left: 50px;
          top: 72px;
          width: 240px;
          height: 70px;
          border-radius: 50%;
          background: radial-gradient(ellipse at center, rgba(255, 220, 140, 0.38) 0%, rgba(255, 180, 80, 0.15) 55%, transparent 80%);
          transform: rotateX(52deg);
          pointer-events: none;
          z-index: 3;
          animation: spotFlicker 3s ease-in-out infinite;
        }

        /* Cozy Lamp Flickering / Breathing Animation */
        @keyframes lampFlicker {
          0%, 100% { opacity: 0.92; filter: brightness(1); }
          12% { opacity: 0.98; filter: brightness(1.06); }
          28% { opacity: 0.82; filter: brightness(0.9); }
          30% { opacity: 0.95; filter: brightness(1.04); }
          52% { opacity: 0.88; filter: brightness(0.95); }
          65% { opacity: 1; filter: brightness(1.1); }
          78% { opacity: 0.86; filter: brightness(0.92); }
          82% { opacity: 0.96; filter: brightness(1.05); }
        }

        @keyframes bulbFlicker {
          0%, 100% { opacity: 0.95; transform: scale(1); }
          28% { opacity: 0.8; transform: scale(0.95); }
          30% { opacity: 1; transform: scale(1.05); }
          65% { opacity: 1; transform: scale(1.08); }
          78% { opacity: 0.82; transform: scale(0.96); }
        }

        @keyframes spotFlicker {
          0%, 100% { opacity: 0.9; }
          28% { opacity: 0.75; }
          30% { opacity: 0.95; }
          65% { opacity: 1; }
          78% { opacity: 0.8; }
        }

        /* Coffee Cup on Desk */
        .coffee-cup {
          position: absolute;
          left: 96px;
          top: 82px;
          width: 16px;
          height: 18px;
          background: #f8fafc;
          border-radius: 2px 2px 4px 4px;
          box-shadow: 0 3px 8px rgba(0,0,0,0.5);
          z-index: 3;
        }
        .coffee-cup::after {
          content: '';
          position: absolute;
          right: -5px;
          top: 3px;
          width: 6px;
          height: 10px;
          border: 2px solid #f8fafc;
          border-radius: 0 4px 4px 0;
        }

        /* Desk Plant */
        .desk-plant {
          position: absolute;
          right: 32px;
          top: 76px;
          width: 18px;
          height: 20px;
          background: #c2673a;
          border-radius: 2px 2px 4px 4px;
          box-shadow: 0 3px 6px rgba(0,0,0,0.5);
          z-index: 3;
        }
        .desk-plant::before {
          content: '';
          position: absolute;
          top: -8px;
          left: 2px;
          width: 14px;
          height: 12px;
          background: #34d399;
          border-radius: 50% 0;
          transform: rotate(-15deg);
        }

        /* Main Monitor (Pitch Black Screen with KHAFAI Centered) */
        .monitor-main {
          position: absolute;
          left: 135px;
          top: -38px;
          width: 195px;
          height: 120px;
          z-index: 2;
        }
        .mon-frame {
          position: absolute;
          inset: 0;
          border-radius: 8px;
          background: #121422;
          border: 3px solid #232742;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.8), 0 10px 20px rgba(0, 0, 0, 0.7);
        }
        .mon-screen {
          position: absolute;
          inset: 5px;
          border-radius: 4px;
          background: #020308;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: inset 0 0 16px rgba(0, 0, 0, 0.95);
        }
        
        /* Centered Glowing KHAFAI text */
        .screen-center-brand {
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
          font-size: 15px;
          font-weight: 900;
          letter-spacing: 3.5px;
          color: #ffffff;
          text-shadow: 0 0 8px rgba(255, 255, 255, 0.95), 0 0 18px rgba(139, 92, 246, 0.8), 0 0 30px rgba(56, 189, 248, 0.6);
          text-align: center;
          padding-left: 3.5px; /* Offset for letter spacing centering */
          animation: brandGlow 3s ease-in-out infinite alternate;
        }

        @keyframes brandGlow {
          0% {
            opacity: 0.9;
            transform: scale(0.98);
            filter: drop-shadow(0 0 6px rgba(139, 92, 246, 0.6));
          }
          100% {
            opacity: 1;
            transform: scale(1.02);
            filter: drop-shadow(0 0 14px rgba(56, 189, 248, 0.95));
          }
        }

        .mon-stand {
          position: absolute;
          left: 50%;
          bottom: -18px;
          width: 16px;
          height: 20px;
          transform: translateX(-50%);
          background: #1c1f36;
          box-shadow: 0 2px 4px rgba(0,0,0,0.5);
        }
        .mon-foot {
          position: absolute;
          left: 50%;
          bottom: -22px;
          width: 68px;
          height: 6px;
          transform: translateX(-50%);
          border-radius: 3px;
          background: #282d4a;
          box-shadow: 0 4px 8px rgba(0,0,0,0.6);
        }

        /* Side Vertical Monitor */
        .monitor-side {
          position: absolute;
          right: 48px;
          top: -45px;
          width: 55px;
          height: 130px;
          border-radius: 6px;
          background: #191b30;
          border: 3px solid #2a2d4c;
          box-shadow: 0 0 20px rgba(89, 224, 255, 0.2);
          z-index: 2;
        }
        .mon-side-stand {
          position: absolute;
          left: 50%;
          bottom: -14px;
          width: 12px;
          height: 16px;
          transform: translateX(-50%);
          background: #1c1f36;
        }
        .mon-side-foot {
          position: absolute;
          left: 50%;
          bottom: -18px;
          width: 44px;
          height: 6px;
          transform: translateX(-50%);
          border-radius: 3px;
          background: #282d4a;
          box-shadow: 0 4px 8px rgba(0,0,0,0.6);
        }
        .monitor-side .scr {
          position: absolute;
          inset: 3px;
          border-radius: 3px;
          background: #090d1c;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          padding: 6px;
          gap: 4px;
        }
        .eq { display: flex; gap: 2px; align-items: flex-end; height: 40px; }
        .eq i { flex: 1; background: linear-gradient(180deg, #59e0ff, #7db4ff); border-radius: 1px; animation: eq var(--et, 0.6s) ease-in-out infinite alternate; }
        @keyframes eq { 0% { height: 15%; } 100% { height: 95%; } }

        /* Input Controls on Desk */
        .mousepad {
          position: absolute;
          left: 125px;
          top: 88px;
          width: 220px;
          height: 34px;
          border-radius: 6px;
          background: #14172b;
          transform: rotateX(52deg);
          transform-origin: top;
          box-shadow: 0 2px 8px rgba(0,0,0,0.4);
          border: 1px solid #252a4a;
          z-index: 3;
        }
        .keyboard {
          position: absolute;
          left: 135px;
          top: 90px;
          width: 140px;
          height: 26px;
          border-radius: 4px;
          background: #262b47;
          transform: rotateX(52deg);
          transform-origin: top;
          box-shadow: 0 3px 8px rgba(0,0,0,0.5);
          border: 1px solid #383f66;
          z-index: 4;
        }
        .key-grid {
          position: absolute;
          inset: 3px 6px;
          display: grid;
          grid-template-columns: repeat(14, 1fr);
          gap: 2px;
        }
        .key-grid i { border-radius: 1px; background: #474f7d; }
        .mouse {
          position: absolute;
          left: 295px;
          top: 93px;
          width: 20px;
          height: 28px;
          border-radius: 10px;
          background: #353b5e;
          transform: rotateX(52deg);
          transform-origin: top;
          box-shadow: 0 3px 6px rgba(0,0,0,0.4);
          border: 1px solid #4a5280;
          z-index: 4;
        }

        /* Animated Single Subtle Fast Electrical Current (วิ่งเส้นเดียว เร็วๆ ไม่เด่นมาก) */
        .electric-stream-layer {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
        }

        .pulse-single {
          position: absolute;
          height: 1.5px;
          border-radius: 9999px;
          background: linear-gradient(90deg, transparent 0%, rgba(139, 92, 246, 0.5) 40%, rgba(56, 189, 248, 0.7) 85%, transparent 100%);
          box-shadow: 0 0 6px rgba(56, 189, 248, 0.45);
          animation: fastSingleFlow 3.2s cubic-bezier(0.2, 0.8, 0.3, 1) infinite;
          opacity: 0;
        }

        @keyframes fastSingleFlow {
          0% { left: -80px; width: 30px; opacity: 0; }
          6% { opacity: 0.7; width: 70px; }
          40% { opacity: 0.7; width: 70px; }
          48% { left: 108%; width: 30px; opacity: 0; }
          100% { left: 108%; width: 30px; opacity: 0; }
        }

        @media (max-width: 640px) {
          .room { transform: scale(0.38); transform-origin: center; }
        }
        @media (min-width: 641px) and (max-width: 1024px) {
          .room { transform: scale(0.78); transform-origin: center; }
        }
        @media (min-width: 1025px) {
          .room { transform: scale(1.05); transform-origin: center; }
        }
        @media (min-width: 1440px) {
          .room { transform: scale(1.2); transform-origin: center; }
        }
      `}</style>

      {/* ================= 1. LEFT / TOP COLUMN: 3D Room Scene (30% on Mobile, 50% on Desktop) ================= */}
      <div className="w-full h-[30vh] md:h-screen md:w-1/2 bg-[#06070f] flex items-center justify-center relative overflow-hidden shrink-0 border-b md:border-b-0 md:border-r border-slate-800/60">
        <div className="room-wrap overflow-hidden flex items-center justify-center w-full h-full p-2 sm:p-8">
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

            {/* Wall Mounted Air Conditioner (เครื่องปรับอากาศ) on Top Right */}
            <div className="air-con">
              <div className="ac-vent-top" />
              <div className="ac-brand">KHAFAI INVERTER</div>
              <div className="ac-display">
                <span className="ac-temp">25°</span>
                <span className="ac-led" />
              </div>
              <div className="ac-louver" />
            </div>

            {/* Gentle Cool Breeze Streams */}
            <div className="ac-breeze-stream">
              <div className="breeze-line breeze-1" />
              <div className="breeze-line breeze-2" />
              <div className="breeze-line breeze-3" />
            </div>

            {/* Decor */}
            <div className="poster poster-1" />
            <div className="shelf">
              <div className="book-1" />
              <div className="book-2" />
              <div className="plant-pot" />
              <div className="plant-leaf" />
            </div>

            {/* Desk with Everything Resting Cleanly on Tabletop */}
            <div className="desk">
              <div className="desk-top" />
              <div className="desk-front" />
              <div className="desk-leg left" />
              <div className="desk-leg right" />

              {/* Lamp on Left of Tabletop with Animated Flickering Light Cone & Desk Spot Glow */}
              <div className="lamp">
                <div className="lamp-cone" />
                <div className="lamp-base" />
                <div className="lamp-neck" />
                <div className="lamp-shade">
                  <div className="lamp-bulb" />
                </div>
              </div>

              {/* Warm Ambient Desk Light Reflection */}
              <div className="desk-light-spot" />

              {/* Coffee Mug */}
              <div className="coffee-cup" />

              {/* Main Monitor: Pitch Black Screen with "KHAFAI" in the Middle */}
              <div className="monitor-main">
                <div className="mon-frame" />
                <div className="mon-screen">
                  <div className="screen-center-brand">
                    KHAFAI
                  </div>
                </div>
                <div className="mon-stand" />
                <div className="mon-foot" />
              </div>

              {/* Vertical Side Monitor on Right of Tabletop */}
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
                <div className="mon-side-stand" />
                <div className="mon-side-foot" />
              </div>

              {/* Small Desk Plant on Right */}
              <div className="desk-plant" />

              {/* Mousepad, Keyboard & Mouse Placed Directly on Tabletop Plane */}
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

      {/* ================= 2. RIGHT / BOTTOM COLUMN: Content & OAuth Sign-In (70% on Mobile, 50% on Desktop - No Scroll) ================= */}
      <div className="w-full h-[70vh] md:h-screen md:w-1/2 flex flex-col items-center justify-center p-4 sm:p-8 lg:p-16 bg-white text-center relative overflow-hidden shrink-0">
        
        {/* Faint Grid Background with Radial Center Fade (ยิ่งใกล้ตรงกลางยิ่งจาง) */}
        <div className="absolute inset-0 bg-[#fafaff] bg-[linear-gradient(to_right,rgba(139,92,246,0.12)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.12)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_80%)] [-webkit-mask-image:radial-gradient(ellipse_at_center,transparent_20%,black_80%)] pointer-events-none">
          {/* Animated Single Subtle Fast Electric Pulse */}
          <div className="electric-stream-layer">
            <div className="pulse-single" style={{ top: "140px" }} />
          </div>
        </div>
        
        <div className="w-full max-w-md flex flex-col items-center text-center my-auto py-2 sm:py-6 relative z-10">
          {/* 1. App Tag */}
          <div className="inline-flex items-center justify-center gap-2 mb-6">
            <span className="w-2.5 h-2.5 rounded-full bg-[#8B5CF6]" />
            <span className="text-[#8B5CF6] font-semibold text-xs tracking-wider uppercase">
              ELECTRICITY BILL APP
            </span>
          </div>

          {/* 2. Header Title & Subtitles */}
          <h1 className="text-3xl sm:text-4xl font-bold text-[#111827] mb-2.5 tracking-tight text-center">
            Welcome to{" "}
            <span className="inline-flex items-center gap-1.5 text-slate-900">
              Khafai
              <Unplug className="w-7 h-7 text-[#8B5CF6] shrink-0 inline-block align-middle ml-1" />
            </span>
          </h1>

          <p className="text-base font-medium text-[#6B7280] mb-8">
            จัดการค่าไฟอย่างชาญฉลาด
          </p>

          {/* 3. Google Sign-In Button */}
          <div className="w-full max-w-xs relative rounded-2xl">
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

          {/* Minimal Feature Highlights (สไตล์ B: ไร้ขอบพื้นหลัง โปร่งตา) */}
          <div className="w-full max-w-sm mt-7 grid grid-cols-3 gap-2 text-center">
            <div className="flex flex-col items-center justify-center p-1 group">
              <Zap className="w-5 h-5 text-[#7c3aed] mb-1.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-[11px] sm:text-xs font-medium text-[#475569] whitespace-nowrap">
                คำนวณอัตโนมัติ
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 group">
              <BarChart3 className="w-5 h-5 text-[#7c3aed] mb-1.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-[11px] sm:text-xs font-medium text-[#475569] whitespace-nowrap">
                กราฟวิเคราะห์
              </span>
            </div>
            <div className="flex flex-col items-center justify-center p-1 group">
              <FileText className="w-5 h-5 text-[#7c3aed] mb-1.5 shrink-0 transition-transform duration-200 group-hover:scale-110" />
              <span className="text-[11px] sm:text-xs font-medium text-[#475569] whitespace-nowrap">
                ส่งออก PDF & CSV
              </span>
            </div>
          </div>

          {/* Horizontal Divider Line & Footer Note */}
          <div className="w-full max-w-xs mt-8">
            <div className="mb-4 w-full border-t border-gray-100/80" />
            <p className="text-xs font-normal text-[#9CA3AF] text-center">
              Khafai App · Google OAuth 2.0
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}
