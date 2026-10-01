"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGoogleAuth } from "@/context/GoogleAuthContext";
import { UserProfile, MeterLog, SummaryData, MonthlyChartData, RateLimitStatus } from "@/types";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Header, NavTabType } from "@/components/Header";
import { SummaryCards } from "@/components/SummaryCards";
import { MonthlyTrendChart } from "@/components/MonthlyTrendChart";
import { SmartHomeDashboard } from "@/components/SmartHomeDashboard";
import { DarkLoudDashboard } from "@/components/DarkLoudDashboard";
import { DribbbleCleanDashboard } from "@/components/DribbbleCleanDashboard";
import { VoltPulseDashboard } from "@/components/VoltPulseDashboard";
import { DataHistoryTable, TimeFilterMode } from "@/components/DataHistoryTable";
import { TopEnergyConsumers } from "@/components/TopEnergyConsumers";
import { EnergySavingTipsCard } from "@/components/EnergySavingTipsCard";
import { HomeMinimalView } from "@/components/HomeMinimalView";
import { GlanceableHeroDashboard } from "@/components/GlanceableHeroDashboard";
import { QuickMeterBottomSheet } from "@/components/QuickMeterBottomSheet";
import { SecondaryMenuDrawer } from "@/components/SecondaryMenuDrawer";
import { BottomNavigationBar } from "@/components/BottomNavigationBar";
import { LogFormModal } from "@/components/LogFormModal";
import { OnboardingModal } from "@/components/OnboardingModal";
import { TariffUpdateModal } from "@/components/TariffUpdateModal";
import { DeleteProtectionModal } from "@/components/DeleteProtectionModal";
import { GoogleLoginModal } from "@/components/GoogleLoginModal";
import { TestApiModal } from "@/components/TestApiModal";
import { RateLimitLockedState } from "@/components/RateLimitLockedState";
import { DashboardSkeleton, FullPageSkeleton, HomeHeroSkeleton } from "@/components/DashboardSkeleton";
import { ToastNotification, ToastMessage } from "@/components/ToastNotification";
import {
  recalculateLogs,
  calculateSummaryData,
  calculateMonthlyChartData,
  checkDeleteProtection,
} from "@/lib/khafai-engine";
import { getLocalCache, saveLocalCache } from "@/lib/client-cache";

export default function KhafaiDashboard() {
  const router = useRouter();
  const { session, isAuthenticated, isLoading: isAuthLoading } = useGoogleAuth();
  const currentUserId = session?.User_ID || "";
  const currentEmail = session?.Email || "";
  const currentName = session?.Name || "";
  const currentPicture = session?.Picture || "";

  const [isMounted, setIsMounted] = useState<boolean>(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Redirect to login if user is not authenticated after auth loading finishes
  useEffect(() => {
    if (!isAuthLoading && !session) {
      router.replace("/login");
    }
  }, [isAuthLoading, session, router]);

  const [user, setUser] = useState<UserProfile>({
    User_ID: currentUserId,
    Email: currentEmail,
    Current_Rate_Per_Unit: 8.0,
    Created_At: new Date().toISOString(),
    hasCompletedOnboarding: true,
  });

  const [isFetchingInitialData, setIsFetchingInitialData] = useState<boolean>(false);
  const [logs, setLogs] = useState<MeterLog[]>([]);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeView, setActiveView] = useState<NavTabType>("home");

  // Time-Range Filter State
  const [timeFilter, setTimeFilter] = useState<TimeFilterMode>("this_month");
  const [customStartDate, setCustomStartDate] = useState<string>("");
  const [customEndDate, setCustomEndDate] = useState<string>("");
  const [isFilterChanging, setIsFilterChanging] = useState<boolean>(false);

  const handleTimeFilterChange = useCallback((mode: TimeFilterMode) => {
    setIsFilterChanging(true);
    setTimeout(() => {
      setTimeFilter(mode);
      setIsFilterChanging(false);
    }, 100);
  }, []);

  const handleCustomStartDateChange = useCallback((date: string) => {
    setIsFilterChanging(true);
    setTimeout(() => {
      setCustomStartDate(date);
      setIsFilterChanging(false);
    }, 100);
  }, []);

  const handleCustomEndDateChange = useCallback((date: string) => {
    setIsFilterChanging(true);
    setTimeout(() => {
      setCustomEndDate(date);
      setIsFilterChanging(false);
    }, 100);
  }, []);

  // Modals state
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isQuickRecordOpen, setIsQuickRecordOpen] = useState<boolean>(false);
  const [isLogFormOpen, setIsLogFormOpen] = useState<boolean>(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<MeterLog | null>(null);

  const [isTariffModalOpen, setIsTariffModalOpen] = useState<boolean>(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [targetDeleteLog, setTargetDeleteLog] = useState<MeterLog | null>(null);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState<string | null>(null);

  const [isGoogleLoginOpen, setIsGoogleLoginOpen] = useState<boolean>(false);
  const [isTestApiOpen, setIsTestApiOpen] = useState<boolean>(false);

  // Read LocalStorage cache or reset state when switching user (0ms Instant Load)
  useEffect(() => {
    if (isAuthLoading) return;
    if (!currentUserId) return;
    const cached = getLocalCache(currentUserId);
    if (cached) {
      setUser(cached.user);
      setLogs(cached.logs);
      setIsFetchingInitialData(false);
    } else {
      setUser({
        User_ID: currentUserId,
        Email: currentEmail,
        Current_Rate_Per_Unit: 8.0,
        Created_At: new Date().toISOString(),
        hasCompletedOnboarding: true,
      });
      setLogs([]);
      setIsFetchingInitialData(true);
    }
  }, [isAuthLoading, currentUserId, currentEmail]);

  // Dynamically Filtered Logs based on active timeFilter
  const filteredLogs = useMemo(() => {
    const now = new Date();

    if (timeFilter === "all") return logs;

    if (timeFilter === "this_month") {
      const currentYear = now.getFullYear();
      const currentMonth = now.getMonth();
      return logs.filter((log) => {
        const d = new Date(log.Record_Date);
        return (
          !isNaN(d.getTime()) &&
          d.getFullYear() === currentYear &&
          d.getMonth() === currentMonth
        );
      });
    }

    if (timeFilter === "last_month") {
      const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const targetYear = prevDate.getFullYear();
      const targetMonth = prevDate.getMonth();
      return logs.filter((log) => {
        const d = new Date(log.Record_Date);
        return (
          !isNaN(d.getTime()) &&
          d.getFullYear() === targetYear &&
          d.getMonth() === targetMonth
        );
      });
    }

    if (timeFilter === "this_week") {
      const d = new Date(now);
      const day = d.getDay();
      const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
      const monday = new Date(d.setDate(diffToMonday));
      monday.setHours(0, 0, 0, 0);

      return logs.filter((log) => {
        const logDate = new Date(log.Record_Date);
        logDate.setHours(0, 0, 0, 0);
        return !isNaN(logDate.getTime()) && logDate >= monday && logDate <= now;
      });
    }

    if (timeFilter === "this_year") {
      const currentYear = now.getFullYear();
      return logs.filter((log) => {
        const d = new Date(log.Record_Date);
        return !isNaN(d.getTime()) && d.getFullYear() === currentYear;
      });
    }

    if (timeFilter === "custom" && customStartDate && customEndDate) {
      const start = new Date(customStartDate);
      start.setHours(0, 0, 0, 0);
      const end = new Date(customEndDate);
      end.setHours(23, 59, 59, 999);

      return logs.filter((log) => {
        const d = new Date(log.Record_Date);
        return !isNaN(d.getTime()) && d >= start && d <= end;
      });
    }

    return logs;
  }, [logs, timeFilter, customStartDate, customEndDate]);

  // Derived metrics with 0ms memoization
  const summary: SummaryData = useMemo(() => {
    return calculateSummaryData(filteredLogs, user.Current_Rate_Per_Unit, logs, timeFilter);
  }, [filteredLogs, user.Current_Rate_Per_Unit, logs, timeFilter]);

  const monthlyChart: MonthlyChartData[] = useMemo(() => {
    return calculateMonthlyChartData(filteredLogs);
  }, [filteredLogs]);

  const addToast = (type: "warning" | "success" | "error", message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getAuthHeaders = useCallback(
    (extra: Record<string, string> = {}) => {
      const headers: Record<string, string> = {
        "x-user-id": currentUserId,
        "x-user-email": currentEmail,
        "x-user-name": encodeURIComponent(currentName),
        "x-user-picture": encodeURIComponent(currentPicture),
        ...extra,
      };
      if (session?.idToken) {
        headers["Authorization"] = `Bearer ${session.idToken}`;
      }
      return headers;
    },
    [currentUserId, currentEmail, currentName, currentPicture, session?.idToken]
  );

  // Fetch real data strictly for currentUserId from API (SWR Non-blocking pattern)
  const fetchData = useCallback(
    async (userId: string, forceFetch = false, emailOverride?: string, nameOverride?: string, pictureOverride?: string) => {
      if (!userId) return;
      const activeEmail = emailOverride || currentEmail;
      const activeName = nameOverride || currentName;
      const activePicture = pictureOverride || currentPicture;

      setIsLoading(true);
      const cached = getLocalCache(userId);
      if (cached && !forceFetch) {
        setUser(cached.user);
        setLogs(cached.logs);
        setIsFetchingInitialData(false);
      } else if (forceFetch) {
        setIsFetchingInitialData(true);
      }

      try {
        const headers: Record<string, string> = {
          "x-user-id": userId,
          "x-user-email": activeEmail,
          "x-user-name": encodeURIComponent(activeName),
          "x-user-picture": encodeURIComponent(activePicture),
        };
        if (session?.idToken) {
          headers["Authorization"] = `Bearer ${session.idToken}`;
        }

        const res = await fetch("/api/meter-logs", {
          headers,
        });
        const data = await res.json();

        if (data.rateLimit) {
          setRateLimit(data.rateLimit);
          if (data.rateLimit.warningToast) {
            addToast("warning", data.rateLimit.warningToast);
          }
        }

        if (data.success) {
          const updatedUser = data.user || {
            User_ID: userId,
            Email: activeEmail,
            Name: activeName,
            Picture: activePicture,
            Current_Rate_Per_Unit: 8.0,
            Created_At: new Date().toISOString(),
            hasCompletedOnboarding: true,
          };
          
          // Safety Guard: If GAS was not connected, do NOT overwrite non-empty local logs with empty array!
          const incomingLogs = data.logs || [];
          const currentLocalCache = getLocalCache(userId);
          const hasExistingLocalLogs = currentLocalCache && currentLocalCache.logs && currentLocalCache.logs.length > 0;

          let finalLogs = incomingLogs;
          if (!data.isGasConnected && incomingLogs.length === 0 && hasExistingLocalLogs) {
            finalLogs = currentLocalCache.logs;
          }

          setUser(updatedUser);
          setLogs(finalLogs);
          saveLocalCache(userId, updatedUser, finalLogs);

          // Onboarding modal is disabled as requested by user
          // User records meter directly from Quick Record or Header buttons
        } else if (data.error === "ACCOUNT_LOCKED") {
          addToast("error", "ระบบถูกระงับชั่วคราว", "เข้าสู่สถานะถูกล็อก");
        }
      } catch {
        // Fallback to local cache if network error
        const local = getLocalCache(userId);
        if (local) {
          setUser(local.user);
          setLogs(local.logs);
        }
      } finally {
        setIsLoading(false);
        setIsFetchingInitialData(false);
      }
    },
    [currentEmail, currentName, currentPicture, session?.idToken]
  );

  useEffect(() => {
    // Only fetch data once Auth state has finished loading from localStorage/session
    if (!isAuthLoading && currentUserId) {
      fetchData(currentUserId, false, currentEmail, currentName, currentPicture);
    }
  }, [isAuthLoading, currentUserId, currentEmail, currentName, currentPicture, fetchData]);

  const handleCompleteOnboarding = async (baselineReading: number, startDate: string) => {
    setIsOnboardingOpen(false);
    if (currentUserId) {
      sessionStorage.setItem(`onboarding_dismissed_${currentUserId}`, "true");
    }
    await handleSaveLog({
      Record_Date: startDate,
      Meter_Reading: baselineReading,
      Is_New_Meter: true,
    });
    addToast("success", "ตั้งค่าเลขมิเตอร์เริ่มต้นเรียบร้อยแล้ว", "เริ่มต้นการใช้งานสำเร็จ");
  };

  // 0ms Optimistic UI Save Log Handler + Server & GAS Database Persistence
  const handleSaveLog = async (formData: {
    Record_Date: string;
    Meter_Reading: number;
    Is_New_Meter: boolean;
  }) => {
    const isEditing = !!editingLog;
    const targetLogId = editingLog?.Log_ID;
    const currentRate = user.Current_Rate_Per_Unit;

    let newLogs: MeterLog[] = [];
    if (isEditing && targetLogId) {
      newLogs = recalculateLogs(
        logs.map((l) =>
          l.Log_ID === targetLogId
            ? { ...l, ...formData, Meter_Reading: Number(formData.Meter_Reading) }
            : l
        ),
        currentRate
      );
    } else {
      const tempLog: MeterLog = {
        Log_ID: `log-opt-${Date.now()}`,
        User_ID: currentUserId,
        Record_Date: formData.Record_Date,
        Meter_Reading: Number(formData.Meter_Reading),
        Units_Used: 0,
        Total_Cost: 0,
        Is_New_Meter: formData.Is_New_Meter,
        Created_At: new Date().toISOString(),
      };
      newLogs = recalculateLogs([...logs, tempLog], currentRate);
    }

    setLogs(newLogs);
    saveLocalCache(currentUserId, user, newLogs);

    setIsLogFormOpen(false);
    setEditingLog(null);
    setIsLoading(true);

    try {
      const url = isEditing && targetLogId ? `/api/meter-logs/${targetLogId}` : "/api/meter-logs";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.rateLimit) setRateLimit(data.rateLimit);

      if (data.success && data.logs) {
        setLogs(data.logs);
        if (data.user) setUser(data.user);
        saveLocalCache(currentUserId, data.user || user, data.logs);
        addToast(
          "success",
          isEditing
            ? "แก้ไขรายการบันทึกและจัดเก็บลงฐานข้อมูลเรียบร้อยแล้ว"
            : "บันทึกข้อมูลมิเตอร์ลงฐานข้อมูล Google Sheets เรียบร้อยแล้ว"
        );
      } else {
        addToast("error", data.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูลลงฐานข้อมูล");
      }
    } catch {
      addToast("error", "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์เพื่อบันทึกข้อมูลได้");
    } finally {
      setIsLoading(false);
    }
  };

  // 0ms Optimistic Tariff Update Handler + Local Cache Persistence
  const handleSaveTariffRate = async (newRate: number) => {
    const updatedUser = { ...user, Current_Rate_Per_Unit: newRate, Email: currentEmail || user.Email };
    const updatedLogs = recalculateLogs(logs, newRate);

    setUser(updatedUser);
    setLogs(updatedLogs);
    saveLocalCache(currentUserId, updatedUser, updatedLogs);

    setIsTariffModalOpen(false);
    setIsLoading(true);

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          Current_Rate_Per_Unit: newRate,
          Email: currentEmail || user.Email,
        }),
      });

      const data = await res.json();
      if (data.rateLimit) setRateLimit(data.rateLimit);

      if (data.success) {
        addToast(
          "success",
          `ปรับอัตราค่าไฟเป็น ฿${newRate.toFixed(2)}/หน่วย และคำนวณย้อนหลังใหม่ทั้งหมดเรียบร้อยแล้ว`
        );
      } else {
        addToast("error", data.message || "ไม่สามารถบันทึกอัตราค่าไฟใหม่ได้");
      }
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenDeleteModal = (log: MeterLog) => {
    const check = checkDeleteProtection(logs, log.Log_ID);
    if (!check.canDelete) {
      setDeleteBlockedMessage(check.message || "ไม่สามารถลบข้อมูลนี้ได้");
      setTargetDeleteLog(log);
      setIsDeleteModalOpen(true);
      return;
    }

    setDeleteBlockedMessage(null);
    setTargetDeleteLog(log);
    setIsDeleteModalOpen(true);
  };

  // 0ms Optimistic Delete Handler
  const handleExecuteDelete = async (logId: string) => {
    const filteredLogs = logs.filter((l) => l.Log_ID !== logId);

    setLogs(filteredLogs);
    saveLocalCache(currentUserId, user, filteredLogs);

    setIsDeleteModalOpen(false);
    setTargetDeleteLog(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/meter-logs/${logId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
        saveLocalCache(currentUserId, user, data.logs);
        addToast("success", "ลบรายการบันทึกออกจากฐานข้อมูลเรียบร้อยแล้ว");
      } else {
        addToast("error", data.message || "เกิดข้อผิดพลาดในการลบรายการ");
      }
    } catch {
      addToast("error", "ไม่สามารถเชื่อมต่อเพื่อลบรายการได้");
    } finally {
      setIsLoading(false);
    }
  };

  // Clear current user data
  const handleResetDemo = async () => {
    setIsLoading(true);
    try {
      await fetch("/api/rate-limit/reset", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({ resetData: true }),
      });
      if (typeof window !== "undefined") {
        localStorage.removeItem(`khafai_cache_${currentUserId}`);
      }
      setLogs([]);
      await fetchData(currentUserId, true);
      addToast("success", "ล้างข้อมูลเรียบร้อยแล้ว");
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการล้างข้อมูล");
    } finally {
      setIsLoading(false);
    }
  };

  // Unlock Rate Limit
  const handleResetLock = async () => {
    try {
      await fetch("/api/rate-limit/reset", {
        method: "POST",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
      });
      await fetchData(currentUserId, true);
      addToast("success", "ปลดล็อกระบบเรียบร้อยแล้ว");
    } catch {
      addToast("error", "ไม่สามารถปลดล็อกได้");
    }
  };

  if (!isMounted) {
    return <FullPageSkeleton />;
  }

  if (isAuthLoading || !session) {
    return <FullPageSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#fafbfc] text-slate-800 flex flex-col font-sans antialiased">
      {/* Header Bar - Shown on secondary views (Dashboard & History) */}
      {activeView !== "home" && (
        <Header
          user={user}
          onOpenTariffModal={() => setIsTariffModalOpen(true)}
          onOpenTestApiModal={() => setIsTestApiOpen(true)}
          onResetData={handleResetDemo}
          onOpenGoogleLoginModal={() => setIsGoogleLoginOpen(true)}
          onOpenMenu={() => setIsDrawerOpen(true)}
          isLoading={isLoading}
          activeNavTab={activeView}
          onSelectNavTab={(tab) => {
            if (tab === "settings") {
              setIsTariffModalOpen(true);
            } else {
              setActiveView(tab);
            }
          }}
        />
      )}

      {/* Rate Limit Locked Full-screen Overlay */}
      {rateLimit && rateLimit.isLocked && (
        <RateLimitLockedState
          remainingSeconds={rateLimit.remainingSeconds}
          onTimerComplete={async () => {
            setRateLimit((prev) => (prev ? { ...prev, isLocked: false, remainingSeconds: 0 } : null));
            await fetchData(currentUserId, true);
          }}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 w-full mx-auto">
        {isFetchingInitialData ? (
          activeView === "home" ? (
            <HomeHeroSkeleton />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <DashboardSkeleton />
            </div>
          )
        ) : (
          <AnimatePresence mode="wait">
            {activeView === "home" ? (
              <motion.div
                key="home-glanceable-view"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="w-full h-full flex flex-col justify-center items-center"
              >
                <GlanceableHeroDashboard
                  summary={summary}
                  user={user}
                  logs={logs}
                  onOpenQuickRecord={() => setIsQuickRecordOpen(true)}
                  onOpenMenu={() => setIsDrawerOpen(true)}
                  onNavigate={(view) => setActiveView(view)}
                  onOpenHistory={() => setActiveView("history")}
                  onOpenTariffModal={() => setIsTariffModalOpen(true)}
                  onOpenGoogleLoginModal={() => setIsGoogleLoginOpen(true)}
                />
              </motion.div>
            ) : (
              <motion.div
                key="dashboard-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6 pb-8"
              >
                {/* Active View Content: Dashboard (Dribbble Clean Specification) or History */}
                {activeView === "history" ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-white rounded-2xl p-3 border border-slate-100 shadow-xs mb-4">
                      <span className="text-sm font-bold text-slate-800">
                        ประวัติบันทึกการใช้ไฟฟ้า (History & Logs)
                      </span>
                      <button
                        onClick={() => setActiveView("dashboard")}
                        className="text-xs font-semibold text-[#8B70F8] hover:underline cursor-pointer"
                      >
                        ← กลับไปแดชบอร์ด
                      </button>
                    </div>

                    <DataHistoryTable
                      logs={logs}
                      filteredLogs={filteredLogs}
                      timeFilter={timeFilter}
                      isFilterChanging={isFilterChanging}
                      onTimeFilterChange={handleTimeFilterChange}
                      customStartDate={customStartDate}
                      onCustomStartDateChange={handleCustomStartDateChange}
                      customEndDate={customEndDate}
                      onCustomEndDateChange={handleCustomEndDateChange}
                      onOpenAddModal={() => {
                        setEditingLog(null);
                        setIsLogFormOpen(true);
                      }}
                      onOpenEditModal={(log) => {
                        setEditingLog(log);
                        setIsLogFormOpen(true);
                      }}
                      onConfirmDelete={handleOpenDeleteModal}
                      onExportCSV={async (customLogs) => {
                        const { exportToCSV } = await import("@/lib/pdf-export");
                        exportToCSV(customLogs || filteredLogs, user, timeFilter);
                      }}
                      onExportPDF={async (customLogs) => {
                        const { exportToPDF } = await import("@/lib/pdf-export");
                        exportToPDF(customLogs || filteredLogs, user, timeFilter);
                      }}
                    />
                  </div>
                ) : (
                  <div>
                    {/* VoltPulse Clean Dashboard matching user specification */}
                    <VoltPulseDashboard
                      summary={summary}
                      user={user}
                      monthlyChartData={monthlyChart}
                      logs={logs}
                      onOpenTariffModal={() => setIsTariffModalOpen(true)}
                      onOpenAddModal={() => {
                        setEditingLog(null);
                        setIsLogFormOpen(true);
                      }}
                      onOpenEditModal={(log) => {
                        setEditingLog(log);
                        setIsLogFormOpen(true);
                      }}
                      onOpenHistory={() => setActiveView("history")}
                    />
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </main>

      {/* Test API Modal */}
      <TestApiModal
        isOpen={isTestApiOpen}
        onClose={() => setIsTestApiOpen(false)}
        user={user}
        onRefreshDashboard={() => fetchData(currentUserId, true)}
      />

      {/* Delete Protection Warning Modal */}
      <DeleteProtectionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTargetDeleteLog(null);
          setDeleteBlockedMessage(null);
        }}
        onConfirmDelete={async () => {
          if (targetDeleteLog && !deleteBlockedMessage) {
            await handleExecuteDelete(targetDeleteLog.Log_ID);
          }
        }}
        targetLog={targetDeleteLog}
        blockedMessage={deleteBlockedMessage}
        isLoading={isLoading}
      />

      {/* Tariff Rate Modal */}
      <TariffUpdateModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
        currentRate={user.Current_Rate_Per_Unit}
        onSaveRate={handleSaveTariffRate}
        isLoading={isLoading}
      />

      {/* Add / Edit Meter Log Modal */}
      <LogFormModal
        isOpen={isLogFormOpen}
        onClose={() => {
          setIsLogFormOpen(false);
          setEditingLog(null);
        }}
        onSave={handleSaveLog}
        editingLog={editingLog}
        existingLogs={logs}
        isLoading={isLoading}
      />



      {/* Google Login Account Modal */}
      <GoogleLoginModal
        isOpen={isGoogleLoginOpen}
        onClose={() => setIsGoogleLoginOpen(false)}
      />

      {/* Quick Meter Bottom Sheet (2-second entry) */}
      <QuickMeterBottomSheet
        isOpen={isQuickRecordOpen}
        onClose={() => setIsQuickRecordOpen(false)}
        onSave={handleSaveLog}
        existingLogs={logs}
        user={user}
        isLoading={isLoading}
      />

      {/* Secondary Menu Drawer (Progressive Disclosure) */}
      <SecondaryMenuDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        summary={summary}
        onNavigate={(view) => setActiveView(view)}
        onOpenTariffModal={() => setIsTariffModalOpen(true)}
        onOpenTestApiModal={() => setIsTestApiOpen(true)}
        onResetData={handleResetDemo}
        onOpenGoogleLoginModal={() => setIsGoogleLoginOpen(true)}
      />

      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
