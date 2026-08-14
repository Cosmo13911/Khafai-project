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

export const DashboardSkeleton: React.FC = () => {
  return (
    <div className="w-full space-y-6 animate-pulse select-none">
      {/* ================= 1. SUMMARY CARDS SKELETON (3 Cards) ================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Card 1: Units Consumed Skeleton */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-28 bg-slate-200 rounded-md" />
            <div className="w-9 h-9 rounded-xl bg-blue-100/70" />
          </div>
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <div className="h-9 w-24 bg-slate-200 rounded-lg" />
              <div className="h-4 w-16 bg-slate-100 rounded-md" />
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <div className="h-5 w-20 bg-slate-200 rounded-full" />
              <div className="h-3.5 w-24 bg-slate-100 rounded-md" />
            </div>
          </div>
        </div>

        {/* Card 2: Total Cost Skeleton */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-28 bg-slate-200 rounded-md" />
            <div className="w-9 h-9 rounded-xl bg-emerald-100/70" />
          </div>
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <div className="h-9 w-32 bg-slate-200 rounded-lg" />
              <div className="h-4 w-10 bg-slate-100 rounded-md" />
            </div>
            <div className="flex items-center space-x-2 pt-1">
              <div className="h-5 w-20 bg-slate-200 rounded-full" />
              <div className="h-3.5 w-24 bg-slate-100 rounded-md" />
            </div>
          </div>
        </div>

        {/* Card 3: Latest Meter Reading Skeleton */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div className="h-3.5 w-28 bg-slate-200 rounded-md" />
            <div className="w-9 h-9 rounded-xl bg-purple-100/70" />
          </div>
          <div className="space-y-3">
            <div className="flex items-baseline space-x-2">
              <div className="h-9 w-28 bg-slate-200 rounded-lg" />
              <div className="h-4 w-12 bg-slate-100 rounded-md" />
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <div className="h-3.5 w-28 bg-slate-100 rounded-md" />
              <div className="h-5 w-16 bg-purple-100/80 rounded-full" />
            </div>
          </div>
        </div>
      </div>

      {/* ================= 2. CHART & TABLE SKELETON (2-Column Grid) ================= */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Column: Chart Skeleton (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between min-h-[380px] space-y-6">
          {/* Header & Tabs */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="space-y-1.5">
              <div className="h-4 w-36 bg-slate-200 rounded-md" />
              <div className="h-3 w-24 bg-slate-100 rounded-md" />
            </div>
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl">
              <div className="h-7 w-14 bg-white rounded-lg shadow-xs" />
              <div className="h-7 w-14 bg-slate-200/60 rounded-lg" />
            </div>
          </div>

          {/* Bar Chart Simulation */}
          <div className="flex-1 flex items-end justify-between space-x-3 px-2 pt-6 pb-2 min-h-[200px]">
            {[45, 70, 35, 85, 60, 95].map((heightPct, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center space-y-2 h-full justify-end">
                <div
                  className="w-full max-w-[36px] bg-gradient-to-t from-purple-200 to-indigo-100 rounded-t-lg transition-all"
                  style={{ height: `${heightPct}%` }}
                />
                <div className="h-3 w-8 bg-slate-100 rounded-md" />
              </div>
            ))}
          </div>

          {/* Bottom Summary Pill Skeleton */}
          <div className="h-10 w-full bg-slate-50 rounded-xl border border-slate-100 flex items-center justify-between px-4">
            <div className="h-3 w-24 bg-slate-200 rounded-md" />
            <div className="h-3.5 w-20 bg-slate-200 rounded-md" />
          </div>
        </div>

        {/* Right Column: Data History Table Skeleton (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs flex flex-col justify-between min-h-[380px] space-y-5">
          {/* Table Header Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="space-y-1.5">
              <div className="h-4 w-40 bg-slate-200 rounded-md" />
              <div className="h-3 w-28 bg-slate-100 rounded-md" />
            </div>
            <div className="flex items-center space-x-2">
              <div className="h-9 w-24 bg-slate-100 rounded-xl" />
              <div className="h-9 w-28 bg-purple-200/80 rounded-xl" />
            </div>
          </div>

          {/* Filter Pills Bar */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1">
            <div className="h-8 w-20 bg-purple-600/20 rounded-full" />
            <div className="h-8 w-20 bg-slate-100 rounded-full" />
            <div className="h-8 w-20 bg-slate-100 rounded-full" />
            <div className="h-8 w-20 bg-slate-100 rounded-full" />
            <div className="h-8 w-24 bg-slate-100 rounded-full" />
          </div>

          {/* Table Rows Skeleton */}
          <div className="space-y-2.5">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 space-x-4"
              >
                <div className="flex items-center space-x-3 flex-1">
                  <div className="w-8 h-8 rounded-lg bg-slate-200/70 shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-3.5 w-24 bg-slate-200 rounded-md" />
                    <div className="h-2.5 w-16 bg-slate-100 rounded-md" />
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="h-4 w-16 bg-slate-200 rounded-md hidden sm:block" />
                  <div className="h-4 w-20 bg-slate-200 rounded-md" />
                  <div className="flex space-x-1">
                    <div className="w-7 h-7 rounded-lg bg-slate-200/60" />
                    <div className="w-7 h-7 rounded-lg bg-slate-200/60" />
                  </div>
                </div>
              </div>
            ))}
          </div>
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
