"use client";

import React, { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight, ChevronDown } from "lucide-react";

type ViewMode = "days" | "months" | "years";

interface CustomDatePickerPopoverProps {
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  onChange: (start: string, end: string) => void;
  onClose?: () => void;
}

export const CustomDatePickerPopover: React.FC<CustomDatePickerPopoverProps> = ({
  startDate,
  endDate,
  onChange,
}) => {
  const now = new Date();
  const [currentViewDate, setCurrentViewDate] = useState<Date>(
    startDate ? new Date(startDate) : new Date()
  );
  const [viewMode, setViewMode] = useState<ViewMode>("days");

  const year = currentViewDate.getFullYear();
  const month = currentViewDate.getMonth();
  const [yearRangeStart, setYearRangeStart] = useState<number>(year - 4);

  const monthNames = [
    "มกราคม",
    "กุมภาพันธ์",
    "มีนาคม",
    "เมษายน",
    "พฤษภาคม",
    "มิถุนายน",
    "กรกฎาคม",
    "สิงหาคม",
    "กันยายน",
    "ตุลาคม",
    "พฤศจิกายน",
    "ธันวาคม",
  ];

  const monthNamesShort = [
    "ม.ค.",
    "ก.พ.",
    "มี.ค.",
    "เม.ย.",
    "พ.ค.",
    "มิ.ย.",
    "ก.ค.",
    "ส.ค.",
    "ก.ย.",
    "ต.ค.",
    "พ.ย.",
    "ธ.ค.",
  ];

  const prevMonth = () => {
    setCurrentViewDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentViewDate(new Date(year, month + 1, 1));
  };

  // Generate calendar grid days for current month view
  const calendarDays = useMemo(() => {
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);

    const startDayOfWeek = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();

    const days: Array<{
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
    }> = [];

    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const prevDate = new Date(year, month - 1, prevMonthLastDay - i);
      const isoStr = prevDate.toISOString().slice(0, 10);
      days.push({
        dateStr: isoStr,
        dayNumber: prevMonthLastDay - i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    const todayStr = now.toISOString().slice(0, 10);
    for (let d = 1; d <= totalDays; d++) {
      const dateObj = new Date(year, month, d);
      const yyyy = dateObj.getFullYear();
      const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
      const dd = String(dateObj.getDate()).padStart(2, "0");
      const dateStr = `${yyyy}-${mm}-${dd}`;

      days.push({
        dateStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
      });
    }

    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const nextDate = new Date(year, month + 1, i);
      const isoStr = nextDate.toISOString().slice(0, 10);
      days.push({
        dateStr: isoStr,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: false,
      });
    }

    return days;
  }, [year, month]);

  const handleDateClick = (dateStr: string) => {
    if (!startDate || (startDate && endDate)) {
      onChange(dateStr, "");
    } else if (startDate && !endDate) {
      if (dateStr < startDate) {
        onChange(dateStr, startDate);
      } else {
        onChange(startDate, dateStr);
      }
    }
  };

  const isSelectedStart = (dateStr: string) => dateStr === startDate;
  const isSelectedEnd = (dateStr: string) => dateStr === endDate;
  const isInRange = (dateStr: string) => {
    if (!startDate || !endDate) return false;
    return dateStr > startDate && dateStr < endDate;
  };

  const handleSelectToday = () => {
    const todayStr = new Date().toISOString().slice(0, 10);
    onChange(todayStr, todayStr);
    setCurrentViewDate(new Date());
    setViewMode("days");
  };

  const handleClear = () => {
    onChange("", "");
  };

  const handleMonthSelect = (mIndex: number) => {
    setCurrentViewDate(new Date(year, mIndex, 1));
    setViewMode("days");
  };

  const handleYearSelect = (selectedYear: number) => {
    setCurrentViewDate(new Date(selectedYear, month, 1));
    setViewMode("months");
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xl p-4 w-[312px] z-50 text-slate-800 animate-in fade-in zoom-in-95 duration-150">
      {/* Navigation Header */}
      <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
        {viewMode === "days" && (
          <>
            <button
              onClick={prevMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {/* Clickable Header Switcher */}
            <button
              onClick={() => setViewMode("months")}
              className="flex items-center space-x-1 text-sm font-bold text-slate-900 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
              title="สลับมุมมองเลือกเดือน/ปี"
            >
              <span>{monthNames[month]} {year + 543}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            <button
              onClick={nextMonth}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}

        {viewMode === "months" && (
          <>
            <span className="text-sm font-bold text-slate-900 px-2 py-1">
              เลือกเดือน ({monthNames[month]})
            </span>

            <button
              onClick={() => {
                setYearRangeStart(year - 4);
                setViewMode("years");
              }}
              className="flex items-center space-x-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
            >
              <span>ปี {year + 543}</span>
              <ChevronDown className="w-3.5 h-3.5 text-blue-600" />
            </button>
          </>
        )}

        {viewMode === "years" && (
          <>
            <button
              onClick={() => setYearRangeStart(yearRangeStart - 9)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="ช่วงปีก่อนหน้า"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-bold text-slate-900">
              พ.ศ. {yearRangeStart + 543} - {yearRangeStart + 8 + 543}
            </span>

            <button
              onClick={() => setYearRangeStart(yearRangeStart + 9)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer"
              title="ช่วงปีถัดไป"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {/* VIEW MODE 1: DAYS GRID */}
      {viewMode === "days" && (
        <>
          {/* 7-Column Weekday Headers (อาทิตย์ - เสาร์) */}
          <div className="grid grid-cols-7 text-center text-[11px] font-bold text-slate-400 mb-2 w-full">
            <span>อา</span>
            <span>จ</span>
            <span>อ</span>
            <span>พ</span>
            <span>พฤ</span>
            <span>ศ</span>
            <span>ส</span>
          </div>

          {/* 7-Column Calendar Grid */}
          <div className="grid grid-cols-7 gap-y-1 my-1 w-full">
            {calendarDays.map((item, idx) => {
              const isStart = isSelectedStart(item.dateStr);
              const isEnd = isSelectedEnd(item.dateStr);
              const inRange = isInRange(item.dateStr);

              let cellBgClass = "";
              let textClass = "";

              if (!item.isCurrentMonth) {
                textClass = "text-slate-300 pointer-events-none";
              } else if (isStart || isEnd) {
                cellBgClass = "bg-blue-600 text-white font-bold shadow-xs rounded-full";
              } else if (inRange) {
                cellBgClass = "bg-blue-50 text-blue-700 font-semibold rounded-none";
              } else if (item.isToday) {
                cellBgClass = "border border-blue-600 text-blue-600 font-bold rounded-full";
              } else {
                cellBgClass = "hover:bg-slate-100 text-slate-700 rounded-full cursor-pointer";
              }

              return (
                <div key={idx} className="flex items-center justify-center w-full h-8">
                  <button
                    disabled={!item.isCurrentMonth}
                    onClick={() => handleDateClick(item.dateStr)}
                    className={`w-8 h-8 flex items-center justify-center text-xs transition-colors ${cellBgClass} ${textClass}`}
                  >
                    {item.dayNumber}
                  </button>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* VIEW MODE 2: 12 MONTHS GRID */}
      {viewMode === "months" && (
        <div className="grid grid-cols-3 gap-2 my-2 w-full animate-in fade-in zoom-in-95 duration-150">
          {monthNamesShort.map((mName, mIdx) => {
            const isCurrentM = mIdx === month;
            return (
              <button
                key={mIdx}
                onClick={() => handleMonthSelect(mIdx)}
                className={`py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isCurrentM
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
                }`}
              >
                {mName}
              </button>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 3: 9 YEARS GRID */}
      {viewMode === "years" && (
        <div className="grid grid-cols-3 gap-2 my-2 w-full animate-in fade-in zoom-in-95 duration-150">
          {Array.from({ length: 9 }).map((_, yIdx) => {
            const targetY = yearRangeStart + yIdx;
            const isCurrentY = targetY === year;
            return (
              <button
                key={targetY}
                onClick={() => handleYearSelect(targetY)}
                className={`py-3 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                  isCurrentY
                    ? "bg-blue-600 text-white shadow-xs font-bold"
                    : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/60"
                }`}
              >
                {targetY + 543}
              </button>
            );
          })}
        </div>
      )}

      {/* Range Selection Status Text */}
      <div className="mt-2 text-[11px] text-slate-500 border-t border-slate-100 pt-2 flex items-center justify-between">
        <span>
          {startDate && endDate
            ? `${startDate} ถึง ${endDate}`
            : startDate
            ? `เริ่มต้น: ${startDate}`
            : "เลือกช่วงวันในปฏิทิน"}
        </span>
      </div>

      {/* Footer Actions (Ghost Buttons) */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-2 mt-2">
        <button
          onClick={handleClear}
          className="text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
        >
          ล้าง
        </button>
        <button
          onClick={handleSelectToday}
          className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors cursor-pointer"
        >
          วันนี้
        </button>
      </div>
    </div>
  );
};
