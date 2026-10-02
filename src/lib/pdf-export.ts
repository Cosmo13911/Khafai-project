import { MeterLog, UserProfile } from "@/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getMonthlySummaryFromLogs } from "./khafai-engine";

/**
 * Calculates total units and cost for export using the monthly latest-date rule.
 */
export function calculateExportSummary(logs: MeterLog[]): { totalUnits: number; totalCost: number } {
  if (!logs || logs.length === 0) return { totalUnits: 0, totalCost: 0 };
  
  const monthMap: Record<string, MeterLog[]> = {};
  logs.forEach((log) => {
    const mKey = (log.Record_Date || "").substring(0, 7);
    if (!monthMap[mKey]) monthMap[mKey] = [];
    monthMap[mKey].push(log);
  });

  let totalUnits = 0;
  let totalCost = 0;

  Object.values(monthMap).forEach((mLogs) => {
    const mSummary = getMonthlySummaryFromLogs(mLogs);
    totalUnits += mSummary.units;
    totalCost += mSummary.cost;
  });

  return { totalUnits, totalCost };
}

export interface ReportDateRange {
  startDate: string;
  endDate: string;
  formattedRange: string;
}

/**
 * Accurately computes the start and end dates covered by the report.
 * Prioritizes customRange (if supplied) or extracts from sorted logs,
 * falling back to calculated filter boundaries.
 */
export function getReportDateRange(
  logs: MeterLog[],
  filterMode?: string,
  customRange?: { start?: string; end?: string }
): ReportDateRange {
  const now = new Date();
  const nowFormatted = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

  // 1. If explicit customRange start and end are provided
  if (customRange?.start && customRange?.end) {
    return {
      startDate: customRange.start,
      endDate: customRange.end,
      formattedRange: `${customRange.start} to ${customRange.end}`,
    };
  }

  // Extract valid Record_Date values from logs and sort chronologically
  const validDates = (logs || [])
    .map((l) => l.Record_Date)
    .filter((d): d is string => typeof d === "string" && d.trim().length > 0)
    .sort();

  // If customRange has only one boundary specified
  if (customRange?.start) {
    const end = customRange.end || (validDates.length > 0 ? validDates[validDates.length - 1] : nowFormatted);
    return {
      startDate: customRange.start,
      endDate: end,
      formattedRange: `${customRange.start} to ${end}`,
    };
  }
  if (customRange?.end) {
    const start = validDates.length > 0 ? validDates[0] : nowFormatted;
    return {
      startDate: start,
      endDate: customRange.end,
      formattedRange: `${start} to ${customRange.end}`,
    };
  }

  // 2. Compute from sorted logs (firstLog.Record_Date and lastLog.Record_Date)
  if (validDates.length > 0) {
    const startDate = validDates[0];
    const endDate = validDates[validDates.length - 1];
    return {
      startDate,
      endDate,
      formattedRange: `${startDate} to ${endDate}`,
    };
  }

  // 3. Fallbacks based on filterMode if logs are empty and no customRange
  let fallbackStart = nowFormatted;
  let fallbackEnd = nowFormatted;

  if (filterMode === "this_month") {
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, "0");
    fallbackStart = `${y}-${m}-01`;
    const lastDay = new Date(y, now.getMonth() + 1, 0).getDate();
    fallbackEnd = `${y}-${m}-${String(lastDay).padStart(2, "0")}`;
  } else if (filterMode === "last_month") {
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const py = prevDate.getFullYear();
    const pm = String(prevDate.getMonth() + 1).padStart(2, "0");
    fallbackStart = `${py}-${pm}-01`;
    const lastDay = new Date(py, prevDate.getMonth() + 1, 0).getDate();
    fallbackEnd = `${py}-${pm}-${String(lastDay).padStart(2, "0")}`;
  } else if (filterMode === "this_week") {
    const d = new Date(now);
    const day = d.getDay();
    const diffToMonday = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(now.getFullYear(), now.getMonth(), diffToMonday);
    fallbackStart = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;
    fallbackEnd = nowFormatted;
  } else if (filterMode === "this_year") {
    fallbackStart = `${now.getFullYear()}-01-01`;
    fallbackEnd = `${now.getFullYear()}-12-31`;
  }

  return {
    startDate: fallbackStart,
    endDate: fallbackEnd,
    formattedRange: `${fallbackStart} to ${fallbackEnd}`,
  };
}

/**
 * Generates a clean dynamic filename based on active time filter.
 */
function getExportFilename(
  filterMode?: string,
  extension: "pdf" | "csv" = "pdf",
  dateRange?: { startDate: string; endDate: string }
): string {
  const now = new Date();
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthStr = monthNames[now.getMonth()];
  const yearStr = now.getFullYear();

  let suffix = `${monthStr}${yearStr}`;
  if (filterMode === "this_week") {
    const todayFormatted = `${yearStr}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    suffix = `ThisWeek_${todayFormatted}`;
  } else if (filterMode === "this_month") {
    suffix = `ThisMonth_${monthStr}${yearStr}`;
  } else if (filterMode === "last_month") {
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevMonthStr = monthNames[prevDate.getMonth()];
    suffix = `LastMonth_${prevMonthStr}${prevDate.getFullYear()}`;
  } else if (filterMode === "this_year") {
    suffix = `Year${yearStr}`;
  } else if (filterMode === "all") {
    suffix = dateRange?.startDate && dateRange?.endDate ? `AllHistory_${dateRange.startDate}_${dateRange.endDate}` : `AllHistory`;
  } else if (filterMode === "custom") {
    suffix = dateRange?.startDate && dateRange?.endDate ? `Custom_${dateRange.startDate}_${dateRange.endDate}` : `CustomRange_${yearStr}`;
  }

  return `Khafai_Report_${suffix}.${extension}`;
}

/**
 * Cleanly formats the user account name for report presentation without exposing UID.
 * If user.Name exists, strips any trailing parentheses that may contain a UID or ID.
 * If user.Name is not available, falls back to a clean email (if valid and not a raw numeric UID).
 */
export function getSanitizedReportAccountName(user: UserProfile): string {
  let name = (user.Name || "").trim();

  // Strip any trailing parentheses that contain UID, numbers, or IDs
  name = name.replace(/\s*\([^)]*\)\s*$/g, "").trim();

  if (name) {
    return name;
  }

  const email = (user.Email || "").trim();
  // Ensure email is an actual email address and not a raw numeric Google Sub ID or dummy UID
  if (email && email.includes("@") && !email.endsWith("@khafai.app") && !/^\d+@/.test(email)) {
    return email;
  }

  return "Khafai User";
}

/**
 * Generates and downloads a formatted CSV file of historical meter logs.
 */
export function exportToCSV(
  logs: MeterLog[],
  user: UserProfile,
  filterMode?: string,
  customRange?: { start?: string; end?: string }
): void {
  const dateRange = getReportDateRange(logs, filterMode, customRange);
  const now = new Date();
  let filterLabel = "All History";
  if (filterMode === "this_month") filterLabel = "This Month";
  if (filterMode === "last_month") filterLabel = "Last Month";
  if (filterMode === "this_week") filterLabel = "This Week";
  if (filterMode === "this_year") filterLabel = "This Year";
  if (filterMode === "custom") filterLabel = "Custom Range";

  const { totalUnits, totalCost } = calculateExportSummary(logs);

  let daysCount = 30;
  if (filterMode === "last_month") {
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    daysCount = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0).getDate();
  } else if (filterMode === "this_month") {
    daysCount = Math.max(1, now.getDate());
  } else if (filterMode === "this_week") {
    const day = now.getDay();
    daysCount = Math.max(1, day === 0 ? 7 : day);
  } else if (filterMode === "custom" && dateRange.startDate && dateRange.endDate) {
    const s = new Date(dateRange.startDate).getTime();
    const e = new Date(dateRange.endDate).getTime();
    const diffDays = Math.round(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
    daysCount = Math.max(1, diffDays);
  } else if (logs.length > 0) {
    daysCount = Math.max(1, logs.length);
  }
  const dailyAvgCost = totalCost / daysCount;

  const accountName = getSanitizedReportAccountName(user);

  const metadataHeaders = [
    `# Khafai Monitor - Electricity Usage & Analytics Report`,
    `# User Account: ${accountName}`,
    `# Filter Scope: ${filterLabel}`,
    `# Report Period: ${dateRange.startDate} to ${dateRange.endDate}`,
    `# Export Date: ${now.toISOString()}`,
    `# Tariff Rate: ${user.Current_Rate_Per_Unit.toFixed(2)} THB/kWh`,
    `# Total Records: ${logs.length}`,
    `# Total Cost: ${totalCost.toFixed(2)} THB`,
    `# Total Energy: ${totalUnits.toFixed(1)} kWh`,
    `# Daily Average: ${dailyAvgCost.toFixed(2)} THB/day`,
    `# --------------------------------------------------`,
  ];

  const headers = [
    "Log ID",
    "Record Date",
    "Meter Reading",
    "Units Used (kWh)",
    "Rate Per Unit (THB)",
    "Total Cost (THB)",
    "Is New Meter Cycle",
    "Created At",
  ];

  const rows = logs.map((log) => {
    const effectiveRate =
      log.Units_Used > 0 && log.Total_Cost > 0
        ? (log.Total_Cost / log.Units_Used).toFixed(2)
        : user.Current_Rate_Per_Unit.toFixed(2);

    return [
      log.Log_ID,
      log.Record_Date,
      log.Meter_Reading,
      log.Units_Used,
      effectiveRate,
      log.Total_Cost.toFixed(2),
      log.Is_New_Meter ? "Yes" : "No",
      log.Created_At,
    ];
  });

  const summaryRow = [
    "SUMMARY TOTAL",
    `Total Logs: ${logs.length}`,
    "-",
    totalUnits.toFixed(1),
    user.Current_Rate_Per_Unit.toFixed(2),
    totalCost.toFixed(2),
    "-",
    "-",
  ];

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [
      ...metadataHeaders,
      headers.join(","),
      ...rows.map((e) => e.join(",")),
      "",
      summaryRow.join(","),
    ].join("\n");

  const filename = getExportFilename(filterMode, "csv", dateRange);

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads an elegant, minimalist PDF summary report.
 * Guaranteed 100% glyph compatibility with standard PDF Helvetica encoding (no broken Thai tofu or question marks).
 */
export function exportToPDF(
  logs: MeterLog[],
  user: UserProfile,
  filterMode?: string,
  customRange?: { start?: string; end?: string }
): void {
  const dateRange = getReportDateRange(logs, filterMode, customRange);
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });
  const now = new Date();

  // Filter Mode Label Mapping (Clean International English)
  let filterLabel = "This Month";
  if (filterMode === "last_month") {
    filterLabel = "Last Month";
  } else if (filterMode === "this_week") {
    filterLabel = "This Week";
  } else if (filterMode === "this_year") {
    filterLabel = "This Year";
  } else if (filterMode === "all") {
    filterLabel = "All History";
  } else if (filterMode === "custom") {
    filterLabel = "Custom Range";
  }

  // Right: Soft Minimalist Scope Pill (Flush with right margin 196mm)
  let pillText = `${filterLabel.toUpperCase()} REPORT`;
  if (filterMode === "custom" && dateRange.startDate && dateRange.endDate) {
    pillText = `${dateRange.startDate} TO ${dateRange.endDate}`;
  }

  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  const pillTextWidth = doc.getTextWidth(pillText);
  const pillW = Math.max(56, pillTextWidth + 10);
  const pillX = 196 - pillW;

  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.2);
  doc.roundedRect(pillX, 11, pillW, 8, 4, 4, "FD");

  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(pillText, pillX + pillW / 2, 16.2, { align: "center" });

  // 1. MINIMAL HEADER (Dynamic Spacing & Capsule Badge)
  // Left: Brand Title & Dynamic Subtitle
  doc.setTextColor(15, 23, 42); // slate-900
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("Khafai", 14, 18);

  const brandWidth = doc.getTextWidth("Khafai");
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // slate-400

  // Dynamic header subtitle showing date range with collision safeguard
  const maxSubtitleWidth = pillX - (14 + brandWidth + 6);
  let headerSubtitle = `- Electricity Monitor & Analytics (${dateRange.startDate} to ${dateRange.endDate})`;
  if (doc.getTextWidth(headerSubtitle) > maxSubtitleWidth) {
    headerSubtitle = `- Period: ${dateRange.startDate} to ${dateRange.endDate}`;
  }
  doc.text(headerSubtitle, 14 + brandWidth + 3, 18);

  // Thin Hairline Divider
  doc.setDrawColor(241, 245, 249); // slate-100
  doc.setLineWidth(0.2);
  doc.line(14, 23, 196, 23);

  // 2. METADATA SECTION (Airy Key-Value Layout with Collision Safeguard)
  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");

  // Safeguard: Truncate long display names to prevent collision with right column (X=120)
  let displayName = getSanitizedReportAccountName(user);
  if (doc.getTextWidth(displayName) > 86) {
    while (doc.getTextWidth(displayName + "...") > 86 && displayName.length > 0) {
      displayName = displayName.slice(0, -1);
    }
    displayName += "...";
  }

  // Row 1
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("Account:", 14, 30);
  doc.setTextColor(51, 65, 85); // slate-700
  doc.setFont("helvetica", "bold");
  doc.text(displayName, 28, 30);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Issued Date:", 120, 30);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.text(now.toLocaleDateString("en-GB"), 140, 30);

  // Row 2
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Period:", 14, 35.5);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.text(`${dateRange.startDate} to ${dateRange.endDate}`, 28, 35.5);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184);
  doc.text("Tariff Rate:", 120, 35.5);
  doc.setTextColor(51, 65, 85);
  doc.setFont("helvetica", "bold");
  doc.text(`${user.Current_Rate_Per_Unit.toFixed(2)} THB / kWh`, 140, 35.5);

  // Subtle separator below metadata
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.2);
  doc.line(14, 40, 196, 40);

  // 3. 4 MINIMALIST KPI STATS (Clean Air, Borderless Columns)
  const { totalUnits, totalCost } = calculateExportSummary(logs);

  let daysCount = 30;
  if (filterMode === "last_month") {
    const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    daysCount = new Date(prevDate.getFullYear(), prevDate.getMonth() + 1, 0).getDate();
  } else if (filterMode === "this_month") {
    daysCount = Math.max(1, now.getDate());
  } else if (filterMode === "this_week") {
    const day = now.getDay();
    daysCount = Math.max(1, day === 0 ? 7 : day);
  } else if (filterMode === "custom" && dateRange.startDate && dateRange.endDate) {
    const s = new Date(dateRange.startDate).getTime();
    const e = new Date(dateRange.endDate).getTime();
    const diffDays = Math.round(Math.abs(e - s) / (1000 * 60 * 60 * 24)) + 1;
    daysCount = Math.max(1, diffDays);
  } else if (logs.length > 0) {
    daysCount = Math.max(1, logs.length);
  }

  const dailyAvgCost = totalCost / daysCount;
  const dailyAvgUnits = totalUnits / daysCount;

  const kpis = [
    {
      label: "TOTAL COST",
      value: `THB ${totalCost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      sub: "Net bill amount",
    },
    {
      label: "ENERGY CONSUMED",
      value: `${totalUnits.toLocaleString("en-US", { minimumFractionDigits: 1, maximumFractionDigits: 1 })} kWh`,
      sub: "Total units used",
    },
    {
      label: "DAILY AVERAGE",
      value: `THB ${dailyAvgCost.toFixed(2)} /day`,
      sub: `~${dailyAvgUnits.toFixed(1)} kWh/day`,
    },
    {
      label: "RECORDED ENTRIES",
      value: `${logs.length} Records`,
      sub: "Verified readings",
    },
  ];

  const statY = 46;
  const colW = 45.5; // (196 - 14) / 4 = 45.5mm exact

  kpis.forEach((kpi, i) => {
    const x = 14 + colW * i;

    // Small label
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(kpi.label, x, statY);

    // Big bold minimal number
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 41, 59); // slate-800
    doc.text(kpi.value, x, statY + 6.5);

    // Subtitle note
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(kpi.sub, x, statY + 11.5);
  });

  // Hairline separator below KPIs
  doc.setDrawColor(241, 245, 249);
  doc.setLineWidth(0.2);
  doc.line(14, 62, 196, 62);

  // 4. MINIMALIST TABLE (Header specified units, clean cells, exact 182mm span)
  const tableHeaders = [
    [
      { content: "RECORD DATE", styles: { halign: "left" as const } },
      { content: "METER READING", styles: { halign: "right" as const } },
      { content: "UNITS USED (kWh)", styles: { halign: "right" as const } },
      { content: "TARIFF (THB)", styles: { halign: "right" as const } },
      { content: "TOTAL COST (THB)", styles: { halign: "right" as const } },
      { content: "CYCLE STATUS", styles: { halign: "center" as const } },
    ],
  ];

  const tableData = logs.map((log) => {
    const effectiveRate =
      log.Units_Used > 0 && log.Total_Cost > 0
        ? (log.Total_Cost / log.Units_Used).toFixed(2)
        : user.Current_Rate_Per_Unit.toFixed(2);

    return [
      log.Record_Date,
      Number(log.Meter_Reading).toLocaleString("en-US"),
      Number(log.Units_Used).toLocaleString("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
      effectiveRate,
      Number(log.Total_Cost).toLocaleString("en-US", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }),
      {
        content: log.Is_New_Meter ? "Baseline" : "-",
        styles: {
          halign: "center" as const,
          textColor: (log.Is_New_Meter ? [37, 99, 235] : [148, 163, 184]) as [number, number, number],
        },
      },
    ];
  });

  // Handle empty dataset gracefully
  const finalBody =
    tableData.length > 0
      ? tableData
      : [
          [
            {
              content: `No meter records found for period: ${dateRange.startDate} to ${dateRange.endDate}`,
              colSpan: 6,
              styles: {
                halign: "center" as const,
                textColor: [148, 163, 184] as [number, number, number],
                fontStyle: "italic" as const,
                cellPadding: 8,
              },
            },
          ],
        ];

  autoTable(doc, {
    startY: 68,
    margin: { left: 14, right: 14, top: 20, bottom: 20 },
    head: tableHeaders,
    body: finalBody,
    theme: "plain",
    headStyles: {
      fillColor: [248, 250, 252], // slate-50
      textColor: [71, 85, 105], // slate-600
      fontStyle: "bold",
      fontSize: 7.5,
      cellPadding: 3,
      lineColor: [226, 232, 240],
      lineWidth: { bottom: 0.3, top: 0, left: 0, right: 0 },
    },
    alternateRowStyles: {
      fillColor: [255, 255, 255],
    },
    styles: {
      fontSize: 7.5,
      cellPadding: 3,
      textColor: [51, 65, 85], // text-slate-700
      lineColor: [241, 245, 249],
      lineWidth: { bottom: 0.15, top: 0, left: 0, right: 0 },
    },
    columnStyles: {
      0: { cellWidth: 32, halign: "left" }, // Record Date
      1: { cellWidth: 30, halign: "right" }, // Meter Reading
      2: { cellWidth: 30, halign: "right" }, // Units Used
      3: { cellWidth: 28, halign: "right" }, // Tariff Rate
      4: { cellWidth: 34, halign: "right" }, // Total Cost
      5: { cellWidth: 28, halign: "center" }, // Cycle Status
    },
  });

  // 5. MINIMALIST FOOTER (Bottom of Every Page)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.height || 297;

    // Hairline Footer Separator Line
    doc.setDrawColor(241, 245, 249); // slate-100
    doc.setLineWidth(0.2);
    doc.line(14, pageHeight - 12, 196, pageHeight - 12);

    // Left Footer Notice (Clean English, Zero Glyph Corruption)
    doc.setFontSize(7);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Khafai - Electricity Monitoring & Management System", 14, pageHeight - 7);

    // Right Page Number
    doc.text(`Page ${i} of ${totalPages}`, 196, pageHeight - 7, { align: "right" });
  }

  // Save PDF with clean dynamic filename format
  const filename = getExportFilename(filterMode, "pdf", dateRange);
  doc.save(filename);
}
