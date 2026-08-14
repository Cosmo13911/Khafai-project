import { MeterLog, UserProfile } from "@/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { getMonthlySummaryFromLogs, calculateMonthlyChartData } from "./khafai-engine";

/**
 * Calculates total units and cost for export using the monthly latest-date rule.
 */
export function calculateExportSummary(logs: MeterLog[]): { totalUnits: number; totalCost: number } {
  if (!logs || logs.length === 0) return { totalUnits: 0, totalCost: 0 };
  
  const monthMap: Record<string, MeterLog[]> = {};
  logs.forEach((log) => {
    const mKey = log.Record_Date.substring(0, 7);
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

/**
 * Generates a clean dynamic filename based on active time filter.
 */
function getExportFilename(filterMode?: string, extension: "pdf" | "csv" = "pdf"): string {
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
    suffix = `AllHistory`;
  } else if (filterMode === "custom") {
    suffix = `CustomRange_${yearStr}`;
  }

  return `Khafai_Report_${suffix}.${extension}`;
}

/**
 * Generates and downloads a formatted CSV file of historical meter logs.
 */
export function exportToCSV(logs: MeterLog[], user: UserProfile, filterMode?: string): void {
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

  const rows = logs.map((log) => [
    log.Log_ID,
    log.Record_Date,
    log.Meter_Reading,
    log.Units_Used,
    user.Current_Rate_Per_Unit,
    log.Total_Cost,
    log.Is_New_Meter ? "Yes" : "No",
    log.Created_At,
  ]);

  const { totalUnits, totalCost } = calculateExportSummary(logs);

  const summaryRow = [
    "SUMMARY",
    "Period Total",
    "",
    totalUnits,
    user.Current_Rate_Per_Unit,
    totalCost,
    "",
    "",
  ];

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [headers.join(","), ...rows.map((e) => e.join(",")), "", summaryRow.join(",")].join("\n");

  const filename = getExportFilename(filterMode, "csv");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a PDF summary report using jsPDF and jspdf-autotable.
 */
export function exportToPDF(logs: MeterLog[], user: UserProfile, filterMode?: string): void {
  const doc = new jsPDF();
  const now = new Date();

  // 1. BRAND HEADER (Top Left Brand + Top Right Document Type Tag)
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Khafai", 14, 17);

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text("Electricity Usage & Analytics System", 14, 22);

  // Top Right Document Type Badge Label
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("ELECTRICITY USAGE REPORT", 196, 18, { align: "right" });

  // Divider Line below Header
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.4);
  doc.line(14, 26, 196, 26);

  // 2. METADATA BLOCK (Card Container with 2-Column Layout)
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setLineWidth(0.3);
  doc.roundedRect(14, 30, 182, 17, 2, 2, "FD");

  doc.setFontSize(8.5);
  // Column 1 (Left): User Info
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85); // slate-700
  doc.text(`Account: ${user.Email}`, 18, 37);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`User ID: ${user.User_ID}`, 18, 42.5);

  // Filter Mode Label Mapping for metadata block
  let filterLabel = "This Month";
  if (filterMode === "last_month") filterLabel = "Last Month";
  if (filterMode === "this_week") filterLabel = "This Week";
  if (filterMode === "this_year") filterLabel = "This Year";
  if (filterMode === "all") filterLabel = "All History";
  if (filterMode === "custom") filterLabel = "Custom Range";

  // Column 2 (Right): Report Metadata
  doc.setFont("helvetica", "bold");
  doc.setTextColor(51, 65, 85);
  doc.text(`Report Date: ${now.toLocaleDateString("en-GB")} (${filterLabel})`, 115, 37);

  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Tariff Rate: ${user.Current_Rate_Per_Unit.toFixed(2)} THB / unit`, 115, 42.5);

  // 3. SUMMARY CARDS (3 Horizontal Cards in Grid Layout)
  const { totalUnits, totalCost } = calculateExportSummary(logs);

  const cardY = 51;
  const cardW = 58;
  const cardH = 24;

  // Card 1: Total Amount
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(14, cardY, cardW, cardH, 2, 2, "FD");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text("TOTAL AMOUNT", 18, cardY + 7);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(
    `${totalCost.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} THB`,
    18,
    cardY + 17
  );

  // Card 2: Total Energy Consumed (White Background)
  doc.setFillColor(255, 255, 255); // bg-white
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(76, cardY, cardW, cardH, 2, 2, "FD");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184);
  doc.text("TOTAL ENERGY CONSUMED", 80, cardY + 7);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(
    `${totalUnits.toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} kWh`,
    80,
    cardY + 17
  );

  // Card 3: Recorded Entries (White Background)
  doc.setFillColor(255, 255, 255); // bg-white
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(138, cardY, cardW, cardH, 2, 2, "FD");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184);
  doc.text("RECORDED ENTRIES", 142, cardY + 7);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(15, 23, 42);
  doc.text(`${logs.length} Records`, 142, cardY + 17);

  // 4. TABLE DESIGN (Soft Light Header Style & Proper Alignments)
  const tableHeaders = [
    [
      { content: "RECORD DATE", styles: { halign: "left" as const } },
      { content: "METER READING", styles: { halign: "right" as const } },
      { content: "UNITS USED", styles: { halign: "right" as const } },
      { content: "TARIFF RATE", styles: { halign: "right" as const } },
      { content: "TOTAL COST", styles: { halign: "right" as const } },
      { content: "CYCLE NOTE", styles: { halign: "center" as const } },
    ],
  ];

  const tableData = logs.map((log) => [
    log.Record_Date,
    Number(log.Meter_Reading).toLocaleString("en-US"),
    `${Number(log.Units_Used).toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} kWh`,
    `${user.Current_Rate_Per_Unit.toFixed(2)} THB`,
    `${Number(log.Total_Cost).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} THB`,
    {
      content: log.Is_New_Meter ? "New Cycle (Baseline)" : "-",
      styles: { halign: "center" as const },
    },
  ]);

  autoTable(doc, {
    startY: 81,
    head: tableHeaders,
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [241, 245, 249], // bg-slate-100
      textColor: [71, 85, 105], // text-slate-600
      fontStyle: "bold",
      fontSize: 8,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // bg-slate-50/50
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3.5,
      textColor: [30, 41, 59], // text-slate-800
      lineColor: [226, 232, 240],
      lineWidth: 0.1,
    },
    columnStyles: {
      0: { halign: "left" }, // Record Date
      1: { halign: "right" }, // Meter Reading
      2: { halign: "right" }, // Units Used
      3: { halign: "right" }, // Tariff Rate
      4: { halign: "right" }, // Total Cost
      5: { halign: "center" }, // Cycle Note
    },
  });

  // 5. FOOTER & PAGE NUMBERING (Bottom of Every Page)
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    const pageHeight = doc.internal.pageSize.height || 297;

    // Thin Footer Separator Line
    doc.setDrawColor(226, 232, 240); // slate-200
    doc.setLineWidth(0.3);
    doc.line(14, pageHeight - 14, 196, pageHeight - 14);

    // Left Footer Notice
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text("Generated automatically by Khafai App", 14, pageHeight - 8);

    // Right Page Number
    doc.text(`Page ${i} of ${totalPages}`, 196, pageHeight - 8, { align: "right" });
  }

  // Save PDF with clean dynamic filename format
  const filename = getExportFilename(filterMode, "pdf");
  doc.save(filename);
}
