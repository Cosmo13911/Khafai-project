"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { GoogleAuthProvider, useGoogleAuth } from "@/context/GoogleAuthContext";
import { UserProfile, MeterLog, SummaryData, MonthlyChartData, RateLimitStatus } from "@/types";
import { Header } from "@/components/Header";
import { SummaryCards } from "@/components/SummaryCards";
import { MonthlyTrendChart } from "@/components/MonthlyTrendChart";
import { DataHistoryTable } from "@/components/DataHistoryTable";
import { LogFormModal } from "@/components/LogFormModal";
import { TariffUpdateModal } from "@/components/TariffUpdateModal";
import { DeleteProtectionModal } from "@/components/DeleteProtectionModal";
import { GoogleLoginModal } from "@/components/GoogleLoginModal";
import { TestApiModal } from "@/components/TestApiModal";
import { RateLimitLockedState } from "@/components/RateLimitLockedState";
import { ToastNotification, ToastMessage } from "@/components/ToastNotification";
import { exportToCSV, exportToPDF } from "@/lib/pdf-export";
import {
  recalculateLogs,
  calculateSummaryData,
  calculateMonthlyChartData,
  checkDeleteProtection,
} from "@/lib/khafai-engine";

interface LocalCachePayload {
  user: UserProfile;
  logs: MeterLog[];
  updatedAt: number;
}

export function getLocalCache(userId: string): LocalCachePayload | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(`khafai_cache_${userId}`);
    if (raw) return JSON.parse(raw);
  } catch {
    // Ignore error
  }
  return null;
}

export function saveLocalCache(userId: string, user: UserProfile, logs: MeterLog[]): void {
  if (typeof window === "undefined") return;
  try {
    const payload: LocalCachePayload = {
      user,
      logs,
      updatedAt: Date.now(),
    };
    localStorage.setItem(`khafai_cache_${userId}`, JSON.stringify(payload));
  } catch {
    // Ignore error
  }
}

function KhafaiDashboardContent() {
  const { session, isAuthenticated } = useGoogleAuth();
  const currentUserId = session?.User_ID || "google-sub-1029384756";
  const currentEmail = session?.Email || `${currentUserId}@khafai.app`;

  const [isMounted, setIsMounted] = useState<boolean>(false);

  const [user, setUser] = useState<UserProfile>({
    User_ID: currentUserId,
    Email: currentEmail,
    Current_Rate_Per_Unit: 8.0,
    Created_At: new Date().toISOString(),
    hasCompletedOnboarding: true,
  });

  const [logs, setLogs] = useState<MeterLog[]>([]);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isLogFormOpen, setIsLogFormOpen] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<MeterLog | null>(null);

  const [isTariffModalOpen, setIsTariffModalOpen] = useState<boolean>(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [targetDeleteLog, setTargetDeleteLog] = useState<MeterLog | null>(null);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState<string | null>(null);

  const [isGoogleLoginOpen, setIsGoogleLoginOpen] = useState<boolean>(false);
  const [isTestApiOpen, setIsTestApiOpen] = useState<boolean>(false);

  // Read LocalStorage cache safely after initial mount to prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
    const cached = getLocalCache(currentUserId);
    if (cached) {
      setUser(cached.user);
      setLogs(cached.logs);
    }
  }, [currentUserId]);

  // Synchronize User ID & Email when session changes
  useEffect(() => {
    if (isMounted) {
      setUser((prev) => ({
        ...prev,
        User_ID: currentUserId,
        Email: currentEmail,
      }));
    }
  }, [currentUserId, currentEmail, isMounted]);

  // Derived metrics with 0ms memoization
  const summary: SummaryData = useMemo(() => {
    return calculateSummaryData(logs, user.Current_Rate_Per_Unit);
  }, [logs, user]);

  const monthlyChart: MonthlyChartData[] = useMemo(() => {
    return calculateMonthlyChartData(logs);
  }, [logs]);

  const addToast = (type: "warning" | "success" | "error", message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch real data strictly for currentUserId
  const fetchData = useCallback(async (userId: string, forceFetch = false) => {
    const cached = getLocalCache(userId);
    const CACHE_TTL_MS = 5 * 60 * 1000;

    if (cached && !forceFetch && Date.now() - cached.updatedAt < CACHE_TTL_MS) {
      setUser(cached.user);
      setLogs(cached.logs);
      return;
    }

    try {
      const res = await fetch("/api/meter-logs", {
        headers: { "x-user-id": userId },
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
          Email: `${userId}@khafai.app`,
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
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isMounted) {
      fetchData(currentUserId);
    }
  }, [currentUserId, fetchData, isMounted]);

  // 0ms Optimistic UI Save Log Handler + Local Cache Persistence
  const handleSaveLog = async (formData: {
    Record_Date: string;
    Meter_Reading: number;
    Is_New_Meter: boolean;
  }) => {
    const isEditing = !!editingLog;
    const currentRate = user.Current_Rate_Per_Unit;

    let newLogs: MeterLog[] = [];
    if (isEditing && editingLog) {
      newLogs = recalculateLogs(
        logs.map((l) =>
          l.Log_ID === editingLog.Log_ID
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
    addToast("success", isEditing ? "แก้ไขรายการบันทึกเรียบร้อยแล้ว" : "เพิ่มรายการบันทึกใหม่เรียบร้อยแล้ว");

    try {
      const url = isEditing ? `/api/meter-logs/${editingLog?.Log_ID}` : "/api/meter-logs";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.rateLimit) setRateLimit(data.rateLimit);

      if (data.success && data.logs) {
        setLogs(data.logs);
        if (data.user) setUser(data.user);
        saveLocalCache(currentUserId, data.user || user, data.logs);
      }
    } catch {
      // Fallback
    }
  };

  // 0ms Optimistic Tariff Update Handler + Local Cache Persistence
  const handleSaveTariffRate = async (newRate: number) => {
    const updatedUser = { ...user, Current_Rate_Per_Unit: newRate };
    const updatedLogs = recalculateLogs(logs, newRate);

    setUser(updatedUser);
    setLogs(updatedLogs);
    saveLocalCache(currentUserId, updatedUser, updatedLogs);

    setIsTariffModalOpen(false);
    addToast("success", `ปรับเปลี่ยนอัตราค่าไฟเป็น ฿${newRate.toFixed(2)} /หน่วย เรียบร้อยแล้ว`);

    try {
      const res = await fetch("/api/user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify({ Current_Rate_Per_Unit: newRate }),
      });

      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        saveLocalCache(currentUserId, data.user, updatedLogs);
      }
    } catch {
      // Fallback
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
    addToast("success", "ลบรายการบันทึกเรียบร้อยแล้ว");

    try {
      const res = await fetch(`/api/meter-logs/${logId}`, {
        method: "DELETE",
        headers: { "x-user-id": currentUserId },
      });

      const data = await res.json();
      if (data.success && data.logs) {
        setLogs(data.logs);
        saveLocalCache(currentUserId, user, data.logs);
      }
    } catch {
      // Fallback
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
        {/* Executive Summary Cards */}
        <SummaryCards summary={summary} />

        {/* 2-Column Responsive Layout for Chart and Table */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Monthly Trend Bar Chart (5 cols on Desktop) */}
          <div className="lg:col-span-5 h-full">
            <MonthlyTrendChart data={monthlyChart} />
          </div>

          {/* Right Column: Data History Table & Card List (7 cols on Desktop) */}
          <div className="lg:col-span-7 h-full">
            <DataHistoryTable
              logs={logs}
              onOpenAddModal={() => {
                setEditingLog(null);
                setIsLogFormOpen(true);
              }}
              onOpenEditModal={(log) => {
                setEditingLog(log);
                setIsLogFormOpen(true);
              }}
              onConfirmDelete={handleOpenDeleteModal}
              onExportCSV={() => exportToCSV(logs, user)}
              onExportPDF={() => exportToPDF(logs, user)}
            />
          </div>
        </div>
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

function KhafaiDashboardWrapper() {
  const { customClientId } = useGoogleAuth();
  const googleClientId =
    customClientId ||
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    "185343067017-lnui2nbdub6tl503cuu4opntei97332k.apps.googleusercontent.com";

  return (
    <GoogleOAuthProvider clientId={googleClientId}>
      <KhafaiDashboardContent />
    </GoogleOAuthProvider>
  );
}

export default function KhafaiDashboard() {
  return (
    <GoogleAuthProvider>
      <KhafaiDashboardWrapper />
    </GoogleAuthProvider>
  );
}
