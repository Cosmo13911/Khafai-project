"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { OnboardingModal } from "@/components/OnboardingModal";
import { GoogleLoginModal } from "@/components/GoogleLoginModal";
import { TestApiModal } from "@/components/TestApiModal";
import { RateLimitLockedState } from "@/components/RateLimitLockedState";
import { ToastNotification, ToastMessage } from "@/components/ToastNotification";
import { exportToCSV, exportToPDF } from "@/lib/pdf-export";
import { checkDeleteProtection } from "@/lib/khafai-engine";

function KhafaiDashboardContent() {
  const { session, isAuthenticated } = useGoogleAuth();
  const currentUserId = session?.User_ID || "google-sub-1029384756";

  const [user, setUser] = useState<UserProfile | null>(null);
  const [logs, setLogs] = useState<MeterLog[]>([]);
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [monthlyChart, setMonthlyChart] = useState<MonthlyChartData[]>([]);
  const [rateLimit, setRateLimit] = useState<RateLimitStatus | null>(null);

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // Modals state
  const [isLogFormOpen, setIsLogFormOpen] = useState<boolean>(false);
  const [editingLog, setEditingLog] = useState<MeterLog | null>(null);

  const [isTariffModalOpen, setIsTariffModalOpen] = useState<boolean>(false);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [targetDeleteLog, setTargetDeleteLog] = useState<MeterLog | null>(null);
  const [deleteBlockedMessage, setDeleteBlockedMessage] = useState<string | null>(null);

  const [isOnboardingOpen, setIsOnboardingOpen] = useState<boolean>(false);
  const [isGoogleLoginOpen, setIsGoogleLoginOpen] = useState<boolean>(false);
  const [isTestApiOpen, setIsTestApiOpen] = useState<boolean>(false);

  const addToast = (type: "warning" | "success" | "error", message: string, title?: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev, { id, type, message, title }]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Main data fetch function
  const fetchData = useCallback(async (userId: string) => {
    setIsLoading(true);
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
        if (data.user) setUser(data.user);
        setLogs(data.logs);
        setSummary(data.summary);
        setMonthlyChart(data.monthlyChart);

        // Check if user requires Onboarding Baseline setup
        if (!data.user.hasCompletedOnboarding || data.logs.length === 0) {
          setIsOnboardingOpen(true);
        } else {
          setIsOnboardingOpen(false);
        }
      } else if (data.error === "ACCOUNT_LOCKED") {
        addToast("error", "ระบบถูกระงับชั่วคราว", "เข้าสู่สถานะถูกล็อก");
      }
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการโหลดข้อมูลจากเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(currentUserId);
  }, [currentUserId, fetchData]);

  // Onboarding Complete Handler
  const handleCompleteOnboarding = async (baselineReading: number, startDate: string) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/meter-logs", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-user-id": currentUserId,
        },
        body: JSON.stringify({
          Record_Date: startDate,
          Meter_Reading: baselineReading,
          Is_New_Meter: true,
        }),
      });

      const data = await res.json();
      if (data.rateLimit) setRateLimit(data.rateLimit);

      if (data.success) {
        if (data.user) setUser(data.user);
        setLogs(data.logs);
        setSummary(data.summary);
        setMonthlyChart(data.monthlyChart);
        setIsOnboardingOpen(false);
        addToast("success", "บันทึกเลขมิเตอร์ตั้งต้นเรียบร้อยแล้ว");
      } else {
        addToast("error", data.message || "ไม่สามารถเพิ่มข้อมูลตั้งต้นได้");
      }
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  // Add / Edit Meter Log Handler
  const handleSaveLog = async (formData: {
    Record_Date: string;
    Meter_Reading: number;
    Is_New_Meter: boolean;
  }) => {
    setIsLoading(true);
    try {
      const isEditing = !!editingLog;
      const url = isEditing ? `/api/meter-logs/${editingLog.Log_ID}` : "/api/meter-logs";
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
      if (data.rateLimit) {
        setRateLimit(data.rateLimit);
        if (data.rateLimit.warningToast) {
          addToast("warning", data.rateLimit.warningToast);
        }
      }

      if (data.success) {
        if (data.user) setUser(data.user);
        setLogs(data.logs);
        setSummary(data.summary);
        setMonthlyChart(data.monthlyChart);
        setIsLogFormOpen(false);
        setEditingLog(null);
        addToast("success", isEditing ? "แก้ไขรายการบันทึกเรียบร้อยแล้ว" : "เพิ่มรายการบันทึกใหม่เรียบร้อยแล้ว");
      } else {
        addToast("error", data.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  // Tariff Rate Update Handler
  const handleSaveTariffRate = async (newRate: number) => {
    setIsLoading(true);
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
      if (data.rateLimit) setRateLimit(data.rateLimit);

      if (data.success) {
        if (data.user) setUser(data.user);
        await fetchData(currentUserId);
        addToast("success", `ปรับเปลี่ยนอัตราค่าไฟเป็น ฿${newRate.toFixed(2)} /หน่วย และคำนวณย้อนหลังเรียบร้อยแล้ว`);
      } else {
        addToast("error", data.message || "ไม่สามารถเปลี่ยนอัตราค่าไฟได้");
      }
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  // Delete Item Confirmation Handler
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
    setIsLoading(true);
    try {
      const res = await fetch(`/api/meter-logs/${targetDeleteLog.Log_ID}`, {
        method: "DELETE",
        headers: { "x-user-id": currentUserId },
      });

      const data = await res.json();
      if (data.rateLimit) setRateLimit(data.rateLimit);

      if (data.success) {
        if (data.user) setUser(data.user);
        setLogs(data.logs);
        setSummary(data.summary);
        setMonthlyChart(data.monthlyChart);
        setIsDeleteModalOpen(false);
        setTargetDeleteLog(null);
        addToast("success", "ลบรายการบันทึกเรียบร้อยแล้ว");
      } else {
        addToast("error", data.message || "เกิดข้อผิดพลาดในการลบรายการ");
      }
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset Demo Data
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
      await fetchData(currentUserId);
      addToast("success", "รีเซ็ตข้อมูลทดสอบเรียบร้อยแล้ว");
    } catch {
      addToast("error", "เกิดข้อผิดพลาดในการรีเซ็ต");
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
      await fetchData(currentUserId);
      addToast("success", "ปลดล็อกระบบเรียบร้อยแล้ว");
    } catch {
      addToast("error", "ไม่สามารถปลดล็อกได้");
    }
  };

  if (!user || !summary) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm font-bold text-slate-600">กำลังโหลดระบบ Khafai...</span>
        </div>
      </div>
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
        onRefreshDashboard={() => fetchData(currentUserId)}
      />

      {/* Google Login Modal */}
      <GoogleLoginModal
        isOpen={isGoogleLoginOpen || (!isAuthenticated && !session)}
        onClose={() => setIsGoogleLoginOpen(false)}
      />

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        onCompleteOnboarding={handleCompleteOnboarding}
        isLoading={isLoading}
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
