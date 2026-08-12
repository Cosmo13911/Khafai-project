import { MeterLog, UserProfile } from "@/types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Generates and downloads a formatted CSV file of historical meter logs.
 */
export function exportToCSV(logs: MeterLog[], user: UserProfile): void {
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

  const csvContent =
    "data:text/csv;charset=utf-8,\uFEFF" +
    [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute(
    "download",
    `Khafai_Electricity_Report_${user.User_ID}_${new Date().toISOString().slice(0, 10)}.csv`
  );
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Generates and downloads a PDF summary report using jsPDF and jspdf-autotable.
 */
export function exportToPDF(logs: MeterLog[], user: UserProfile): void {
  const doc = new jsPDF();

  // Document Title Header
  doc.setFontSize(18);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Khafai - Electricity Usage Report", 14, 18);

  doc.setFontSize(9);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`User ID: ${user.User_ID}`, 14, 25);
  doc.text(`Email: ${user.Email}`, 14, 30);
  doc.text(`Current Tariff Rate: ${user.Current_Rate_Per_Unit.toFixed(2)} THB / unit`, 14, 35);
  doc.text(`Report Generated: ${new Date().toLocaleDateString("en-GB")}`, 14, 40);

  // Summary Banner Box (2-row grid to prevent horizontal overflow)
  const totalUnits = logs.reduce((acc, l) => acc + (Number(l.Units_Used) || 0), 0);
  const totalCost = logs.reduce((acc, l) => acc + (Number(l.Total_Cost) || 0), 0);

  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, 45, 182, 22, "F");

  doc.setFontSize(9);
  doc.setTextColor(51, 65, 85); // slate-700

  // Row 1 inside banner
  doc.text(`Total Recorded Entries: ${logs.length}`, 18, 53);
  doc.text(
    `Total Energy Consumed: ${totalUnits.toLocaleString("en-US", {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1,
    })} kWh`,
    105,
    53
  );

  // Row 2 inside banner
  doc.text(`Current Tariff Rate: ${user.Current_Rate_Per_Unit.toFixed(2)} THB`, 18, 61);
  doc.setFontSize(9.5);
  doc.setTextColor(37, 99, 235); // blue-600 for total amount
  doc.text(
    `Total Amount: ${totalCost.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })} THB`,
    105,
    61
  );

  // Table Headers & Data
  const tableHeaders = [
    ["Record Date", "Meter Reading", "Units Used", "Tariff Rate", "Total Cost", "Cycle Note"],
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
    log.Is_New_Meter ? "New Cycle (Baseline)" : "-",
  ]);

  autoTable(doc, {
    startY: 72,
    head: tableHeaders,
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [37, 99, 235], // blue-600
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // slate-50
    },
    styles: {
      fontSize: 8.5,
      cellPadding: 3,
    },
    columnStyles: {
      0: { halign: "left" }, // Record Date
      1: { halign: "right" }, // Meter Reading (Right aligned)
      2: { halign: "right" }, // Units Used (Right aligned)
      3: { halign: "right" }, // Tariff Rate (Right aligned)
      4: { halign: "right" }, // Total Cost (Right aligned)
      5: { halign: "center" }, // Cycle Note
    },
  });

  doc.save(
    `Khafai_Electricity_Report_${user.User_ID}_${new Date().toISOString().slice(0, 10)}.pdf`
  );
}
