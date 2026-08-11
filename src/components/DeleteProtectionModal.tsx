"use client";

import React from "react";
import { TriangleAlert, X, AlertTriangle } from "lucide-react";
import { MeterLog } from "@/types";

interface DeleteProtectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
  targetLog: MeterLog | null;
  blockedMessage: string | null;
  isLoading: boolean;
}

export const DeleteProtectionModal: React.FC<DeleteProtectionModalProps> = ({
  isOpen,
  onClose,
  onConfirmDelete,
  targetLog,
  blockedMessage,
  isLoading,
}) => {
  if (!isOpen || !targetLog) return null;

  const isBlocked = !!blockedMessage;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isBlocked ? "bg-rose-100 text-rose-600" : "bg-amber-100 text-amber-600"}`}>
              {isBlocked ? <TriangleAlert className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            </div>
            <h3 className="text-base font-bold text-slate-900">
              {isBlocked ? "ไม่สามารถลบรายการนี้ได้" : "ยืนยันการลบรายการ"}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer min-h-[44px] min-w-[44px]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {/* Target Record Info Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-700 space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">วันที่บันทึก:</span>
              <span className="font-bold text-slate-900">{targetLog.Record_Date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">เลขมิเตอร์:</span>
              <span className="font-mono font-bold text-slate-900">{targetLog.Meter_Reading}</span>
            </div>
            {targetLog.Is_New_Meter && (
              <div className="flex justify-between text-blue-600 font-bold">
                <span>สถานะ:</span>
                <span>จุดเริ่มต้นของรอบมิเตอร์ใหม่</span>
              </div>
            )}
          </div>

          {/* Blocked Message Notice with TriangleAlert icon */}
          {isBlocked ? (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 space-y-2">
              <div className="flex items-start space-x-2.5">
                <TriangleAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-rose-900 font-semibold leading-relaxed">
                  {blockedMessage}
                </p>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-600 leading-relaxed">
              คุณต้องการลบรายการบันทึกนี้หรือไม่? ระบบจะทำการคำนวณหน่วยและยอดเงินใหม่ให้อัตโนมัติ
            </p>
          )}
        </div>

        <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 mt-5">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer min-h-[44px]"
          >
            {isBlocked ? "ตกลง" : "ยกเลิก"}
          </button>
          {!isBlocked && (
            <button
              type="button"
              onClick={onConfirmDelete}
              disabled={isLoading}
              className="px-5 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md shadow-rose-200 transition-colors cursor-pointer min-h-[44px]"
            >
              {isLoading ? "กำลังลบ..." : "ยืนยันลบรายการ"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
