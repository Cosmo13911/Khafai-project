"use client";

import React from "react";

export const HeaderSkeleton: React.FC = () => {
  return (
    <header className="w-full bg-white border-b border-slate-200/80 shadow-2xs sticky top-0 z-30 animate-pulse select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo & App Name Placeholder */}
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-purple-200 to-indigo-100" />
            <div className="space-y-1.5">
              <div className="h-4 sm:h-5 w-24 sm:w-28 bg-slate-200 rounded-md" />
              <div className="h-2.5 sm:h-3 w-36 sm:w-44 bg-slate-100 rounded-md hidden xs:block" />
            </div>
          </div>

          {/* Right Section: Rate Pill & Profile Avatar Placeholder */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            <div className="h-9 sm:h-10 w-24 sm:w-32 bg-slate-100 rounded-full border border-slate-200/60 hidden sm:block" />
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-200/80 border border-slate-200" />
          </div>
        </div>
      </div>
    </header>
  );
};

export const HomeHeroSkeleton: React.FC = () => {
  return (
    <div className="relative w-full h-[100dvh] flex flex-col justify-between overflow-hidden bg-[#fafbfc] select-none animate-pulse">
      {/* Stealth Top Bar Skeleton */}
      <header className="w-full max-w-7xl mx-auto pt-safe px-4 sm:px-6 lg:px-8 pt-5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <div className="w-8 h-8 rounded-xl bg-slate-200/80" />
          <div className="w-8 h-8 rounded-xl bg-slate-100" />
        </div>
        <div className="h-4 w-28 bg-slate-200/60 rounded-full" />
        <div className="w-8 h-8 rounded-full bg-slate-200/80" />
      </header>

      {/* Dead-center Hero Typography Skeleton */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6">
        <div className="h-3 w-36 bg-slate-200/60 rounded-full mb-4" />
        <div className="h-20 sm:h-28 md:h-36 w-64 sm:w-80 md:w-96 bg-slate-200/80 rounded-2xl mb-5" />
        <div className="flex items-center justify-center space-x-2.5">
          <div className="h-4 w-24 bg-slate-200/70 rounded-md" />
          <div className="h-3 w-3 bg-slate-100 rounded-full" />
          <div className="h-4 w-28 bg-slate-200/50 rounded-md" />
        </div>
        <div className="h-5 w-40 bg-slate-200/50 rounded-full mt-3" />
      </main>

      {/* Ambient Bottom Action Skeleton */}
      <footer className="w-full pb-safe pb-8 px-6 flex flex-col items-center justify-center gap-3">
        <div className="h-10 w-44 bg-white border border-slate-200/70 rounded-full shadow-xs" />
        <div className="w-10 h-1 bg-slate-200 rounded-full opacity-60 mt-1" />
      </footer>
    </div>
  );
};

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-4 sm:space-y-6 md:space-y-8 select-none font-sans animate-pulse">
      {/* ================= 1. Top Bar & Title Skeleton ================= */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div className="space-y-2">
          <div className="h-7 sm:h-8 w-60 sm:w-80 bg-slate-200/80 rounded-xl" />
          <div className="h-3.5 w-48 sm:w-64 bg-slate-100 rounded-md" />
        </div>
      </div>

      {/* ================= 2. Primary KPI Cards Grid (4 Cards - 2 cols on mobile) ================= */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-2xl p-3.5 sm:p-5 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-3 min-w-0"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 sm:w-24 bg-slate-200/70 rounded-md" />
              <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg sm:rounded-xl bg-slate-100" />
            </div>
            <div className="space-y-1.5">
              <div className="h-6 sm:h-8 w-24 sm:w-32 bg-slate-200/80 rounded-lg" />
              <div className="h-2.5 w-16 sm:w-20 bg-slate-100 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* ================= 3. Main Analytics Grid (Forecast & Monthly Trend) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 lg:gap-6 items-stretch">
        {/* Forecast Card Skeleton */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 bg-slate-200/80 rounded-md" />
            <div className="w-6 h-6 rounded-lg bg-slate-100" />
          </div>
          <div className="space-y-2 py-4">
            <div className="h-8 w-32 bg-slate-200/80 rounded-lg" />
            <div className="h-3 w-48 bg-slate-100 rounded-md" />
            <div className="h-2 w-full bg-slate-100 rounded-full mt-4" />
          </div>
          <div className="h-10 w-full bg-slate-50 rounded-xl" />
        </div>

        {/* Monthly Trend Area Chart Skeleton */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] flex flex-col justify-between min-h-[300px] space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="h-4 w-32 bg-slate-200/80 rounded-md" />
              <div className="h-3 w-24 bg-slate-100 rounded-md" />
            </div>
            <div className="h-7 w-24 bg-slate-100 rounded-xl" />
          </div>
          {/* Chart waveform simulation */}
          <div className="h-44 w-full bg-gradient-to-t from-slate-50 via-slate-100/50 to-transparent rounded-xl flex items-end justify-between px-4 pb-2">
            {[35, 55, 45, 75, 60, 85].map((h, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <div className="w-8 bg-slate-200/60 rounded-t-md" style={{ height: `${h}%` }} />
                <div className="h-2 w-6 bg-slate-100 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ================= 4. Recent Logs Snippet Skeleton ================= */}
      <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.02)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="h-4 w-28 bg-slate-200/80 rounded-md" />
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-slate-100" />
            <div className="w-6 h-6 rounded-lg bg-slate-200/80" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3 pt-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="p-3 sm:p-4 rounded-xl bg-slate-50/70 border border-slate-100 flex items-center justify-between">
              <div className="space-y-1.5">
                <div className="h-2.5 w-16 bg-slate-200/60 rounded-md" />
                <div className="h-3.5 w-24 bg-slate-200/80 rounded-md" />
              </div>
              <div className="space-y-1.5 text-right">
                <div className="h-3.5 w-16 bg-slate-200/80 rounded-md ml-auto" />
                <div className="h-2.5 w-12 bg-slate-200/50 rounded-md ml-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const FullPageSkeleton: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      <HeaderSkeleton />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <DashboardSkeleton />
      </main>
    </div>
  );
};
