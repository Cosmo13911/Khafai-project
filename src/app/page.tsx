"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleAuthProvider, useGoogleAuth } from "@/context/GoogleAuthContext";
import { UserProfile, MeterLog, SummaryData, MonthlyChartData, RateLimitStatus } from "@/types";
import { Header } from "@/components/Header";
import { SummaryCards } from "@/components/SummaryCards";
import { MonthlyTrendChart } from "@/components/MonthlyTrendChart";
import { DataHistoryTable, TimeFilterMode } from "@/components/DataHistoryTable";
import { LogFormModal } from "@/components/LogFormModal";
import { TariffUpdateModal } from "@/components/TariffUpdateModal";
import { DeleteProtectionModal } from "@/components/DeleteProtectionModal";
import { GoogleLoginModal } from "@/components/GoogleLoginModal";
import { TestApiModal } from "@/components/TestApiModal";
import { RateLimitLockedState } from "@/components/RateLimitLockedState";
import { ElectricityLoading } from "@/components/ElectricityLoading";
import { ToastNotification, ToastMessage } from "@/components/ToastNotification";
import { exportToCSV, exportToPDF } from "@/lib/pdf-export";
import {
  recalculateLogs,
  calculateSummaryData,
  calculateMonthlyChartData,
  checkDeleteProtection,
} from "@/lib/khafai-engine";
import { sanitizeEmail } from "@/lib/database";

interface LocalCachePayload {
  user: UserProfile;
  logs: MeterLog[];
  updatedAt: number;
}

export function getLocalCache(userId: string): LocalCachePayload | null {
  if (typeof window === "undefined") return null;
  const cleanId = sanitizeEmail(userId);
  try {
    const raw = localStorage.getItem(`khafai_cache_${cleanId}`);
    if (raw) {
      const parsed: LocalCachePayload = JSON.parse(raw);
      if (parsed.user) {
        parsed.user.Email = sanitizeEmail(parsed.user.Email, cleanId);
        parsed.user.User_ID = sanitizeEmail(parsed.user.User_ID, cleanId);
      }
      return parsed;
    }
  } catch {
    // Ignore error
  }
  return null;
}

export function saveLocalCache(userId: string, user: UserProfile, logs: MeterLog[]): void {
  if (typeof window === "undefined") return;
  const cleanId = sanitizeEmail(userId);
  try {
    const cleanUser = {
      ...user,
      User_ID: sanitizeEmail(user.User_ID, cleanId),
      Email: sanitizeEmail(user.Email, cleanId),
    };
    const payload: LocalCachePayload = {
      user: cleanUser,
      logs,
      updatedAt: Date.now(),
    };
    localStorage.setItem(`khafai_cache_${cleanId}`, JSON.stringify(payload));
  } catch {
    // Ignore error
  }
}

function KhafaiDashboardContent() {
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

  useEffect(() => {
    if (isMounted && !isAuthLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isMounted, isAuthLoading, isAuthenticated, router]);

  const [user, setUser] = useState<UserProfile>({
    User_ID: currentUserId,
    Email: currentEmail,
    Current_Rate_Per_Unit: 8.0,
    Created_At: new Date().toISOString(),
    hasCompletedOnboarding: true,
  });

  const [isFetchingInitialData, setIsFetchingInitialData] = useState<boolean>(true);
  const [logs, setLogs] = useState<MeterLog[]>([]);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

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
  const [isLogFormOpen, setIsLogFormOpen] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<MeterLog | null>(null);

  const [isTariffModalOpen, setIsTariffModalOpen] = useState<boolean>(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [targetDeleteLog, setTargetDeleteLog] = useState<MeterLog | null>(null);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState<string | null>(null);

  const [isGoogleLoginOpen, setIsGoogleLoginOpen] = useState<boolean>(false);
  const [isTestApiOpen, setIsTestApiOpen] = useState<boolean>(false);

  // Read LocalStorage cache or reset state when switching user
  useEffect(() => {
    if (!currentUserId) return;
    const cached = getLocalCache(currentUserId);
    if (cached) {
      setUser(cached.user);
      setLogs(cached.logs);
    } else {
      setUser({
        User_ID: currentUserId,
        Email: currentEmail,
        Current_Rate_Per_Unit: 8.0,
        Created_At: new Date().toISOString(),
        hasCompletedOnboarding: true,
      });
      setLogs([]);
    }
  }, [currentUserId, currentEmail]);

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

  // Fetch real data strictly for currentUserId from API & Google Sheets database
  const fetchData = useCallback(
    async (userId: string, forceFetch = false, emailOverride?: string, nameOverride?: string, pictureOverride?: string) => {
      if (!userId) return;
      const activeEmail = emailOverride || currentEmail;
      const activeName = nameOverride || currentName;
      const activePicture = pictureOverride || currentPicture;

      setIsLoading(true);
      if (forceFetch) {
        setIsFetchingInitialData(true);
      }
      // Load local cache immediately for instant UI responsiveness
      const cached = getLocalCache(userId);
      if (cached && !forceFetch) {
        setUser(cached.user);
        setLogs(cached.logs);
      }

      try {
        const res = await fetch("/api/meter-logs", {
          headers: {
            "x-user-id": userId,
            "x-user-email": activeEmail,
            "x-user-name": encodeURIComponent(activeName),
            "x-user-picture": encodeURIComponent(activePicture),
          },
          cache: "no-store",
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
          const updatedLogs = data.logs || [];

          setUser(updatedUser);
          setLogs(updatedLogs);
          saveLocalCache(userId, updatedUser, updatedLogs);
        } else if (data.error === "ACCOUNT_LOCKED") {
          addToast("error", "ระบบถูกระงับชั่วคราว", "เข้าสู่สถานะถูกล็อก");
        }
      } catch {
        // Fallback to local cache if network error
      } finally {
        setIsLoading(false);
        setIsFetchingInitialData(false);
      }
    },
    [currentEmail, currentName, currentPicture]
  );

  useEffect(() => {
    if (currentUserId) {
      fetchData(currentUserId, true, currentEmail, currentName, currentPicture);
    }
  }, [currentUserId, currentEmail, currentName, currentPicture, fetchData]);

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
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
          "x-user-email": currentEmail,
        },
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
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
          "x-user-email": currentEmail,
        },
        body: JSON.stringify({ Current_Rate_Per_Unit: newRate, Email: currentEmail }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        saveLocalCache(currentUserId, data.user, updatedLogs);
        addToast("success", `ปรับเปลี่ยนอัตราค่าไฟเป็น ฿${newRate.toFixed(2)} /หน่วย เรียบร้อยแล้ว`);
      } else {
        addToast("error", data.message || "ไม่สามารถอัปเดตอัตราค่าไฟในฐานข้อมูลได้");
      }
    } catch {
      addToast("error", "ไม่สามารถเชื่อมต่อเพื่อบันทึกอัตราค่าไฟได้");
    } finally {
      setIsLoading(false);
    }
  };

  // 0ms Optimistic Delete Handler + Local Cache Persistence
  const handleOpenDeleteModal = (log: MeterLog) => {
    setTargetDeleteLog(log);
    const deleteCheck = checkDeleteProtection(logs, log.Log_ID);
    if (!deleteCheck.canDelete) {
      setDeleteBlockedMessage(deleteCheck.message || "ไม่สามารถลบรายการนี้ได้");
    } else {
      setDeleteBlockedMessage(null);
    }
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!targetDeleteLog) return;
    const logId = targetDeleteLog.Log_ID;
    const currentRate = user.Current_Rate_Per_Unit;

    const filteredLogs = recalculateLogs(
      logs.filter((l) => l.Log_ID !== logId),
      currentRate
    );

    setLogs(filteredLogs);
    saveLocalCache(currentUserId, user, filteredLogs);

    setIsDeleteModalOpen(false);
    setTargetDeleteLog(null);
    setIsLoading(true);

    try {
      const res = await fetch(`/api/meter-logs/${logId}`, {
        method: "DELETE",
        headers: {
          "x-user-id": currentUserId,
          "x-user-email": currentEmail,
        },
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
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
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
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
      });
      await fetchData(currentUserId, true);
      addToast("success", "ปลดล็อกระบบเรียบร้อยแล้ว");
    } catch {
      addToast("error", "ไม่สามารถปลดล็อกได้");
    }
  };

  if (!isMounted) {
    return (
      <ElectricityLoading fullScreen title="กำลังดึงข้อมูล" />
    );
  }

  if (isAuthLoading || !isAuthenticated) {
    return (
      <ElectricityLoading fullScreen dark title="กำลังดึงข้อมูล" />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans antialiased">
      {/* Header Bar */}
      <Header
        user={user}
        onOpenTariffModal={() => setIsTariffModalOpen(true)}
        onOpenTestApiModal={() => setIsTestApiOpen(true)}
        onResetData={handleResetDemo}
        onOpenGoogleLoginModal={() => setIsGoogleLoginOpen(true)}
        isLoading={isLoading}
      />

      {/* Rate Limit Locked Full-screen Overlay */}
      {rateLimit && rateLimit.isLocked && (
        <RateLimitLockedState
          remainingSeconds={rateLimit.remainingSeconds}
          onResetLock={handleResetLock}
        />
      )}

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {isFetchingInitialData ? (
          <ElectricityLoading />
        ) : (
          <>
            {/* Executive Summary Cards */}
            <SummaryCards summary={summary} />

            {/* 2-Column Responsive Layout for Chart and Table */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
              {/* Left Column: Monthly Trend Bar Chart (5 cols on Desktop) */}
              <div className="lg:col-span-5 h-full">
                <MonthlyTrendChart data={monthlyChart} />
              </div>

              {/* Right Column: Data History Table & Card List (7 cols on Desktop) */}
              <div className="lg:col-span-7 h-full">
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
                  onExportCSV={(customLogs) => exportToCSV(customLogs || filteredLogs, user, timeFilter)}
                  onExportPDF={(customLogs) => exportToPDF(customLogs || filteredLogs, user, timeFilter)}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {/* Test API Modal */}
      <TestApiModal
        isOpen={isTestApiOpen}
        onClose={() => setIsTestApiOpen(false)}
        user={user}
        onRefreshDashboard={() => fetchData(currentUserId, true)}
      />

      {/* Google Login Modal */}
      <GoogleLoginModal
        isOpen={isGoogleLoginOpen || (isMounted && !isAuthenticated && !session)}
        onClose={() => setIsGoogleLoginOpen(false)}
      />

      {/* Create / Edit Meter Log Modal */}
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

      {/* Tariff Update Modal with Confirmation Warning */}
      <TariffUpdateModal
        isOpen={isTariffModalOpen}
        onClose={() => setIsTariffModalOpen(false)}
        currentRate={user.Current_Rate_Per_Unit}
        onSaveRate={handleSaveTariffRate}
        isLoading={isLoading}
      />

      {/* Delete Protection Alert Modal */}
      <DeleteProtectionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setTargetDeleteLog(null);
          setDeleteBlockedMessage(null);
        }}
        onConfirmDelete={handleConfirmDelete}
        targetLog={targetDeleteLog}
        blockedMessage={deleteBlockedMessage}
        isLoading={isLoading}
      />

      {/* Toast Notifications */}
      <ToastNotification toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}

export default function KhafaiDashboard() {
  return <KhafaiDashboardContent />;
}
