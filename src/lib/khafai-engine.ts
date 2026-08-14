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
  // 1. Strict Numeric & Positive Value Check (ป้องกันเลขติดลบ, ตัวอักษร, ค่า NaN)
  if (typeof proposedReading !== "number" || isNaN(proposedReading) || proposedReading < 0) {
    return {
      isValid: false,
      errorMessage: "ตัวเลขมิเตอร์ต้องเป็นตัวเลขจำนวนจริงที่มีค่าตั้งแต่ 0 ขึ้นไป",
    };
  }

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
/**
 * Helper: Computes the monthly total units and cost from a set of logs in a given month.
 * Sums all units used and total costs of the logs recorded in this month,
 * accurately capturing (End of this month reading - End of previous month reading)
 * even when multiple intermediate readings exist in the month.
 */
export function getMonthlySummaryFromLogs(monthLogs: MeterLog[]): { units: number; cost: number } {
  if (!monthLogs || monthLogs.length === 0) return { units: 0, cost: 0 };
  
  let totalUnits = 0;
  let totalCost = 0;

  monthLogs.forEach((log) => {
    totalUnits += Number(log.Units_Used || 0);
    totalCost += Number(log.Total_Cost || 0);
  });

  return {
    units: Number(totalUnits.toFixed(1)),
    cost: Number(totalCost.toFixed(2)),
  };
}

/**
 * Computes Executive Summary metrics for any filtered range:
 * Sums the monthly totals (taken from the latest date of each month) across the period.
 */
export function calculateSummaryData(
  filteredLogs: MeterLog[],
  currentRate: number,
  allLogs: MeterLog[] = filteredLogs,
  filterMode: string = "this_month"
): SummaryData {
  const sortedFiltered = sortLogs(filteredLogs);
  const sortedAll = sortLogs(allLogs);

  // 1. Group filtered logs by YYYY-MM
  const monthMap: Record<string, MeterLog[]> = {};
  let periodCyclesCount = 0;

  sortedFiltered.forEach((log) => {
    if (log.Is_New_Meter) periodCyclesCount++;
    const mKey = log.Record_Date.substring(0, 7);
    if (!monthMap[mKey]) monthMap[mKey] = [];
    monthMap[mKey].push(log);
  });

  let periodUnits = 0;
  let periodCost = 0;

  Object.values(monthMap).forEach((mLogs) => {
    const mSummary = getMonthlySummaryFromLogs(mLogs);
    periodUnits += mSummary.units;
    periodCost += mSummary.cost;
  });

  // 2. Latest log of the filtered period (วันที่มากที่สุดในชุดข้อมูลที่เลือก)
  const latestFilteredLog = sortedFiltered.length > 0 ? sortedFiltered[sortedFiltered.length - 1] : null;
  const latestAllLog = sortedAll.length > 0 ? sortedAll[sortedAll.length - 1] : null;

  const activeLatestLog = latestFilteredLog || latestAllLog;
  const latestMeterReading = activeLatestLog ? activeLatestLog.Meter_Reading : 0;
  const latestRecordDate = activeLatestLog ? activeLatestLog.Record_Date : "-";

  // 3. Period Labels and Comparisons
  const now = new Date();
  const monthNamesThai = [
    "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
  ];

  let currentPeriodLabel = "";
  let prevPeriodLabel = "เทียบกับเดือนที่แล้ว";

  if (filterMode === "this_month") {
    const curYear = now.getFullYear();
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    currentPeriodLabel = `เดือนนี้ (${monthNamesThai[now.getMonth()]} ${curYear + 543})`;
    prevPeriodLabel = `เทียบกับ ${monthNamesThai[prevDate.getMonth()]}`;
  } else if (filterMode === "last_month") {
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prev2Date = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    currentPeriodLabel = `เดือนที่แล้ว (${monthNamesThai[prevDate.getMonth()]} ${prevDate.getFullYear() + 543})`;
    prevPeriodLabel = `เทียบกับ ${monthNamesThai[prev2Date.getMonth()]}`;
  } else if (filterMode === "this_week") {
    currentPeriodLabel = "สัปดาห์นี้";
    prevPeriodLabel = "เทียบกับสัปดาห์ก่อน";
  } else if (filterMode === "last_3_months") {
    currentPeriodLabel = "3 เดือนย้อนหลัง";
    prevPeriodLabel = "เทียบกับช่วงก่อนหน้า";
  } else if (filterMode === "this_year") {
    currentPeriodLabel = `ปีนี้ (${now.getFullYear() + 543})`;
    prevPeriodLabel = `เทียบกับปี ${now.getFullYear() + 543 - 1}`;
  } else if (filterMode === "all") {
    currentPeriodLabel = "ประวัติทั้งหมด";
    prevPeriodLabel = "รวมทุกรายการ";
  } else if (filterMode === "custom") {
    currentPeriodLabel = "ช่วงเวลาที่เลือก";
    prevPeriodLabel = "ตามเงื่อนไขค้นหา";
  } else {
    currentPeriodLabel = "ช่วงเวลาที่เลือก";
    prevPeriodLabel = "เทียบกับช่วงก่อนหน้า";
  }

  // Find previous period comparison from allLogs
  let prevUnits = 0;
  let prevCost = 0;

  if (filterMode === "this_month") {
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthKey = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;
    const prevLogs = sortedAll.filter((log) => log.Record_Date.substring(0, 7) === prevMonthKey);
    const prevSum = getMonthlySummaryFromLogs(prevLogs);
    prevUnits = prevSum.units;
    prevCost = prevSum.cost;
  } else if (filterMode === "last_month") {
    const prev2Date = new Date(now.getFullYear(), now.getMonth() - 2, 1);
    const prev2MonthKey = `${prev2Date.getFullYear()}-${String(prev2Date.getMonth() + 1).padStart(2, "0")}`;
    const prev2Logs = sortedAll.filter((log) => log.Record_Date.substring(0, 7) === prev2MonthKey);
    const prev2Sum = getMonthlySummaryFromLogs(prev2Logs);
    prevUnits = prev2Sum.units;
    prevCost = prev2Sum.cost;
  }

  // Calculate percentage changes
  let unitsPercentChange: number | null = null;
  if (prevUnits > 0) {
    unitsPercentChange = Number((((periodUnits - prevUnits) / prevUnits) * 100).toFixed(1));
  } else if (periodUnits > 0 && prevUnits === 0) {
    unitsPercentChange = 100;
  }

  let costPercentChange: number | null = null;
  if (prevCost > 0) {
    costPercentChange = Number((((periodCost - prevCost) / prevCost) * 100).toFixed(1));
  } else if (periodCost > 0 && prevCost === 0) {
    costPercentChange = 100;
  }

  return {
    currentMonthUnits: Number(periodUnits.toFixed(1)),
    currentMonthCost: Number(periodCost.toFixed(2)),
    prevMonthUnits: Number(prevUnits.toFixed(1)),
    prevMonthCost: Number(prevCost.toFixed(2)),
    unitsPercentChange,
    costPercentChange,
    currentRate,
    totalCyclesCount: Math.max(1, periodCyclesCount || 1),
    currentMonthName: currentPeriodLabel,
    prevMonthName: prevPeriodLabel,
    latestMeterReading,
    latestRecordDate,
  };
}

/**
 * Formats logs into monthly chart data for Recharts Bar Chart
 * Takes the monthly totals derived from the latest date entry of each month.
 */
export function calculateMonthlyChartData(logs: MeterLog[]): MonthlyChartData[] {
  const sorted = sortLogs(logs);
  const monthlyMap: Record<string, { totalUnits: number; totalCost: number; logCount: number }> = {};

  const monthShortNamesThai: Record<string, string> = {
    "01": "ม.ค.", "02": "ก.พ.", "03": "มี.ค.", "04": "เม.ย.",
    "05": "พ.ค.", "06": "มิ.ย.", "07": "ก.ค.", "08": "ส.ค.",
    "09": "ก.ย.", "10": "ต.ค.", "11": "พ.ย.", "12": "ธ.ค."
  };

  const groupMap: Record<string, MeterLog[]> = {};
  sorted.forEach((log) => {
    const monthKey = log.Record_Date.substring(0, 7); // YYYY-MM
    if (!groupMap[monthKey]) groupMap[monthKey] = [];
    groupMap[monthKey].push(log);
  });

  Object.entries(groupMap).forEach(([monthKey, mLogs]) => {
    const mSummary = getMonthlySummaryFromLogs(mLogs);
    monthlyMap[monthKey] = {
      totalUnits: mSummary.units,
      totalCost: mSummary.cost,
      logCount: mLogs.length,
    };
  });

  // Ensure trailing 6 months exist in chart data for a complete trend matrix
  const now = new Date();
  const trailingMonths: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const mKey = `${yyyy}-${mm}`;
    trailingMonths.push(mKey);
  }

  // Combine log month keys with trailing 6 months
  const allKeys = Array.from(new Set([...trailingMonths, ...Object.keys(monthlyMap)])).sort();

  return allKeys.map((key) => {
    const [year, month] = key.split("-");
    const thaiYear = (parseInt(year, 10) + 543).toString().substring(2);
    const monthName = `${monthShortNamesThai[month] || month} '${thaiYear}`;

    const itemData = monthlyMap[key] || { totalUnits: 0, totalCost: 0, logCount: 0 };

    return {
      monthKey: key,
      monthName,
      totalUnits: Number(itemData.totalUnits.toFixed(1)),
      totalCost: Number(itemData.totalCost.toFixed(2)),
      logCount: itemData.logCount,
    };
  });
}
