"use client";

import React, { useEffect } from "react";
import { AlertCircle, CheckCircle2, XCircle, X } from "lucide-react";

export interface ToastMessage {
  id: string;
  type: "warning" | "success" | "error";
  title?: string;
  message: string;
}

interface ToastNotificationProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastNotification: React.FC<ToastNotificationProps> = ({
  toasts,
  onDismiss,
}) => {
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        onDismiss(toasts[0].id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col space-y-2 max-w-sm w-full px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-start justify-between p-4 rounded-2xl shadow-xl border backdrop-blur-xs transition-all animate-in slide-in-from-bottom-5 duration-200 ${
            toast.type === "warning"
              ? "bg-amber-500 text-white border-amber-600 shadow-amber-200"
              : toast.type === "success"
              ? "bg-emerald-600 text-white border-emerald-700 shadow-emerald-200"
              : "bg-rose-600 text-white border-rose-700 shadow-rose-200"
          }`}
        >
          <div className="flex items-start space-x-3">
            {toast.type === "warning" && (
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === "success" && (
              <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}
            {toast.type === "error" && (
              <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            )}

            <div>
              {toast.title && (
                <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">
                  {toast.title}
                </h4>
              )}
              <p className="text-xs font-semibold leading-relaxed">
                {toast.message}
              </p>
            </div>
          </div>

          <button
            onClick={() => onDismiss(toast.id)}
            className="text-white/80 hover:text-white ml-2 p-1 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
