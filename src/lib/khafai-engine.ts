import { MeterLog, SummaryData, MonthlyChartData } from "@/types";

/**
 * Sorts meter logs strictly by Record_Date ascending.
 * If Record_Date is equal, sorts by Created_At ascending.
 */
export function sortLogs(logs: MeterLog[]): MeterLog[] {
  return [...logs].sort((a, b) => {
    const dateCompare = a.Record_Date.localeCompare(b.Record_Date);
    if (dateCompare !== 0) return dateCompare;
    return a.Created_At.localeCompare(b.Created_At);
  });
}

/**
 * Auto Recalculate Logic Engine:
 * Whenever Create, Update, Delete occurs or Tariff changes:
 * 1. Sorts all records by Record_Date
 * 2. Recalculates Units_Used & Total_Cost using latest Current_Rate_Per_Unit
 * 3. Handles New Meter Cycle (Is_New_Meter = true -> Units_Used = 0)
 */
export function recalculateLogs(
  logs: MeterLog[],
  currentRatePerUnit: number
): MeterLog[] {
  const sorted = sortLogs(logs);

  return sorted.map((log, index) => {
    if (index === 0 || log.Is_New_Meter) {
      return {
        ...log,
        Units_Used: 0,
        Total_Cost: 0,
      };
    }

    const prevLog = sorted[index - 1];
    const rawUnits = log.Meter_Reading - prevLog.Meter_Reading;
    const unitsUsed = Math.max(0, rawUnits);
    const totalCost = Number((unitsUsed * currentRatePerUnit).toFixed(2));

    return {
      ...log,
      Units_Used: unitsUsed,
      Total_Cost: totalCost,
    };
  });
}

/**
 * Range Validation Rule:
 * Ensures meter reading is chronologically consistent with preceding and following entries.
 */
export function validateMeterReadingRange(
  logs: MeterLog[],
  proposedReading: number,
  proposedDate: string,
  isNewMeter: boolean,
  currentLogId?: string
): { isValid: boolean; minAllowed?: number; maxAllowed?: number; errorMessage?: string } {
  // Filter out the log being edited
  const filtered = logs.filter((l) => l.Log_ID !== currentLogId);
  const sorted = sortLogs(filtered);

  // Find preceding log (last log with date <= proposedDate)
  let prevLog: MeterLog | null = null;
  let nextLog: MeterLog | null = null;

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].Record_Date <= proposedDate) {
      prevLog = sorted[i];
    } else {
      nextLog = sorted[i];
      break;
    }
  }

  let minAllowed: number | undefined = undefined;
  let maxAllowed: number | undefined = undefined;

  if (!isNewMeter && prevLog) {
    minAllowed = prevLog.Meter_Reading;
  }

  if (nextLog) {
    maxAllowed = nextLog.Meter_Reading;
  }

  if (minAllowed !== undefined && proposedReading < minAllowed) {
    return {
      isValid: false,
      minAllowed,
      maxAllowed,
      errorMessage: `ตัวเลขต้องไม่น้อยกว่าค่าก่อนหน้า (${minAllowed})`,
    };
  }

  if (maxAllowed !== undefined && proposedReading > maxAllowed) {
    return {
      isValid: false,
      minAllowed,
      maxAllowed,
      errorMessage: `ตัวเลขต้องไม่เกินค่าถัดไป (${maxAllowed})`,
    };
  }

  return { isValid: true, minAllowed, maxAllowed };
}

/**
 * Delete Protection Rule:
 * Prevents direct deletion of cycle baseline records (Is_New_Meter = true)
 * if child records exist in that cycle.
 */
export function checkDeleteProtection(
  logs: MeterLog[],
  logIdToDelete: string
): { canDelete: boolean; message?: string } {
  const sorted = sortLogs(logs);
  const targetIndex = sorted.findIndex((l) => l.Log_ID === logIdToDelete);

  if (targetIndex === -1) {
    return { canDelete: true };
  }

  const targetLog = sorted[targetIndex];

  if (targetLog.Is_New_Meter) {
    // Check if there is a next record that belongs to the same cycle (i.e. before next Is_New_Meter)
    const hasChildInCycle =
      targetIndex < sorted.length - 1 && !sorted[targetIndex + 1].Is_New_Meter;

    if (hasChildInCycle) {
      return {
        canDelete: false,
        message:
          "ไม่สามารถลบจุดเริ่มต้นของรอบมิเตอร์ได้ กรุณาลบรายการถัดไปในรอบเดียวกันออกก่อน",
      };
    }
  }

  return { canDelete: true };
}

/**
 * Computes Executive Summary metrics:
 * Total units & cost for current month, percentage change vs previous month, cycle count.
 */
export function calculateSummaryData(
  logs: MeterLog[],
  currentRate: number
): SummaryData {
  const sorted = sortLogs(logs);
  const now = new Date();
  
  // Format current and previous month key (YYYY-MM)
  const curYear = now.getFullYear();
  const curMonthStr = String(now.getMonth() + 1).padStart(2, "0");
  const currentMonthKey = `${curYear}-${curMonthStr}`;

  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevYear = prevDate.getFullYear();
  const prevMonthStr = String(prevDate.getMonth() + 1).padStart(2, "0");
  const prevMonthKey = `${prevYear}-${prevMonthStr}`;

  let currentMonthUnits = 0;
  let currentMonthCost = 0;
  let prevMonthUnits = 0;
  let prevMonthCost = 0;

  let totalCyclesCount = 0;

  sorted.forEach((log) => {
    if (log.Is_New_Meter) totalCyclesCount++;

    const logMonthKey = log.Record_Date.substring(0, 7);
    if (logMonthKey === currentMonthKey) {
      currentMonthUnits += log.Units_Used;
      currentMonthCost += log.Total_Cost;
    } else if (logMonthKey === prevMonthKey) {
      prevMonthUnits += log.Units_Used;
      prevMonthCost += log.Total_Cost;
    }
  });

  // Calculate percentage changes
  let unitsPercentChange: number | null = null;
  if (prevMonthUnits > 0) {
    unitsPercentChange = Number(
      (((currentMonthUnits - prevMonthUnits) / prevMonthUnits) * 100).toFixed(1)
    );
  } else if (currentMonthUnits > 0) {
    unitsPercentChange = 100;
  }

  let costPercentChange: number | null = null;
  if (prevMonthCost > 0) {
    costPercentChange = Number(
      (((currentMonthCost - prevMonthCost) / prevMonthCost) * 100).toFixed(1)
    );
  } else if (currentMonthCost > 0) {
    costPercentChange = 100;
  }

  const monthNamesThai = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  const currentMonthName = `${monthNamesThai[now.getMonth()]} ${curYear + 543}`;
  const prevMonthName = `${monthNamesThai[prevDate.getMonth()]} ${prevYear + 543}`;

  return {
    currentMonthUnits: Number(currentMonthUnits.toFixed(1)),
    currentMonthCost: Number(currentMonthCost.toFixed(2)),
    prevMonthUnits: Number(prevMonthUnits.toFixed(1)),
    prevMonthCost: Number(prevMonthCost.toFixed(2)),
    unitsPercentChange,
    costPercentChange,
    currentRate,
    totalCyclesCount: Math.max(1, totalCyclesCount),
    currentMonthName,
    prevMonthName,
  };
}

/**
 * Formats logs into monthly chart data for Recharts Bar Chart
 */
export function calculateMonthlyChartData(logs: MeterLog[]): MonthlyChartData[] {
  const sorted = sortLogs(logs);
  const monthlyMap: Record<string, { totalUnits: number; totalCost: number; logCount: number }> = {};

  const monthShortNamesThai: Record<string, string> = {
    "01": "ม.ค.", "02": "ก.พ.", "03": "มี.ค.", "04": "เม.ย.",
    "05": "พ.ค.", "06": "มิ.ย.", "07": "ก.ค.", "08": "ส.ค.",
    "09": "ก.ย.", "10": "ต.ค.", "11": "พ.ย.", "12": "ธ.ค."
  };

  sorted.forEach((log) => {
    const monthKey = log.Record_Date.substring(0, 7); // YYYY-MM
    if (!monthlyMap[monthKey]) {
      monthlyMap[monthKey] = { totalUnits: 0, totalCost: 0, logCount: 0 };
    }
    monthlyMap[monthKey].totalUnits += log.Units_Used;
    monthlyMap[monthKey].totalCost += log.Total_Cost;
    monthlyMap[monthKey].logCount += 1;
  });

  const keys = Object.keys(monthlyMap).sort();

  return keys.map((key) => {
    const [year, month] = key.split("-");
    const thaiYear = (parseInt(year, 10) + 543).toString().substring(2);
    const monthName = `${monthShortNamesThai[month] || month} '${thaiYear}`;

    return {
      monthKey: key,
      monthName,
      totalUnits: Number(monthlyMap[key].totalUnits.toFixed(1)),
      totalCost: Number(monthlyMap[key].totalCost.toFixed(2)),
      logCount: monthlyMap[key].logCount,
    };
  });
}
