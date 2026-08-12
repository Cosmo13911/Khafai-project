"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { motion, Variants } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';
import { GoogleLogin } from '@react-oauth/google';
import { useGoogleAuth } from '@/context/GoogleAuthContext';
import { KhafaiLogo } from './KhafaiLogo';

const Prism = dynamic(() => import('./Prism'), { ssr: false });

export default function LoginPage() {
  const router = useRouter();
  const { loginWithCredential, isAuthenticated, isLoading } = useGoogleAuth();
  const [isMounted, setIsMounted] = React.useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isMounted, isAuthenticated, isLoading, router]);

  // Motion Variants
  const cardVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        duration: 0.4,
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, ease: 'easeOut' } },
  };

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-950 font-sans">
      
      {/* 1. Background WebGL Canvas using <Prism /> */}
      <div className="absolute inset-0 z-0 h-full w-full pointer-events-none opacity-80">
        {isMounted && (
          <Prism
            animationType="rotate"
            timeScale={0.4}
            height={3.2}
            baseWidth={5.5}
            scale={3.0}
            hueShift={0}
            colorFrequency={1.2}
            noise={0.3}
            glow={0.8}
            bloom={1.2}
            transparent={true}
          />
        )}
      </div>

      {/* 2. Ambient Gradient Mask Over Prism Background */}
      <div className="absolute inset-0 z-0 bg-radial from-transparent via-slate-950/50 to-slate-950 pointer-events-none" />

      {/* 3. Glassmorphism Login Card */}
      <motion.div
        variants={cardVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 mx-4 w-full max-w-sm overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 text-center shadow-2xl backdrop-blur-2xl ring-1 ring-white/10"
      >
        {/* Pure Standalone Khafai Logo */}
        <motion.div variants={itemVariants} className="flex justify-center">
          <KhafaiLogo className="w-24 h-24 drop-shadow-[0_12px_24px_rgba(0,0,0,0.4)]" />
        </motion.div>

        {/* Title & Subtitle */}
        <motion.div variants={itemVariants} className="mt-5 space-y-1.5">
          <h1 className="text-2xl font-bold tracking-tight text-white drop-shadow-sm">
            เข้าสู่ระบบ Khafai
          </h1>
          <p className="text-xs text-slate-300">
            บันทึกและวิเคราะห์การใช้ไฟฟ้าของคุณ
          </p>
        </motion.div>

        {/* Google Sign-In Action (Single Focus) */}
        <motion.div variants={itemVariants} className="mt-8 relative">
          <div className="relative overflow-hidden rounded-2xl">
            <motion.button
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              className="group relative flex h-13 w-full items-center justify-center gap-3 overflow-hidden rounded-2xl border border-white/20 bg-white/90 px-5 text-sm font-semibold text-slate-900 shadow-lg shadow-black/20 transition-all hover:bg-white hover:shadow-blue-500/20 active:bg-slate-100 cursor-pointer"
            >
              {/* Google SVG Icon */}
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>ลงชื่อเข้าใช้ด้วย Google</span>

              {/* Shimmer Light Effect */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/60 to-transparent group-hover:animate-[shimmer_1.5s_infinite]" />
            </motion.button>

            {/* Invisible Google Login Overlay for Google Auth Trigger */}
            <div className="absolute inset-0 opacity-0 cursor-pointer overflow-hidden z-20 flex items-center justify-center scale-150">
              <GoogleLogin
                onSuccess={(credentialResponse) => {
                  if (credentialResponse.credential) {
                    loginWithCredential(credentialResponse.credential);
                    router.push('/');
                  }
                }}
                onError={() => {
                  console.log('Google Login Failed');
                }}
              />
            </div>
          </div>
        </motion.div>

        {/* Security Badge */}
        <motion.div variants={itemVariants} className="mt-8 flex items-center justify-center gap-1.5 text-[11px] font-medium text-emerald-400">
          <ShieldCheck className="h-4 w-4" />
          <span>ระบบรักษาความปลอดภัยบัญชี Google Verified</span>
        </motion.div>
      </motion.div>

    </div>
  );
}
