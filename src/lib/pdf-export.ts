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
  doc.setFontSize(20);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text("Khafai - Electricity Usage Report", 14, 20);

  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(`User ID: ${user.User_ID}`, 14, 28);
  doc.text(`Email: ${user.Email}`, 14, 34);
  doc.text(`Current Tariff Rate: ${user.Current_Rate_Per_Unit} THB/unit`, 14, 40);
  doc.text(`Report Date: ${new Date().toLocaleDateString("th-TH")}`, 14, 46);

  // Summary Banner
  const totalUnits = logs.reduce((acc, l) => acc + l.Units_Used, 0);
  const totalCost = logs.reduce((acc, l) => acc + l.Total_Cost, 0);

  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, 52, 182, 18, "F");

  doc.setFontSize(11);
  doc.setTextColor(30, 41, 59);
  doc.text(`Total Recorded Entries: ${logs.length}`, 20, 63);
  doc.text(`Total Energy Consumed: ${totalUnits.toFixed(1)} kWh`, 85, 63);
  doc.text(`Total Amount: ฿${totalCost.toFixed(2)}`, 150, 63);

  // Table Data
  const tableHeaders = [
    ["Record Date", "Meter Reading", "Units Used", "Tariff Rate", "Total Cost", "Cycle Note"],
  ];

  const tableData = logs.map((log) => [
    log.Record_Date,
    log.Meter_Reading.toString(),
    `${log.Units_Used} kWh`,
    `฿${user.Current_Rate_Per_Unit}`,
    `฿${log.Total_Cost.toFixed(2)}`,
    log.Is_New_Meter ? "New Cycle (Baseline)" : "-",
  ]);

  autoTable(doc, {
    startY: 76,
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
      fontSize: 9,
      cellPadding: 3,
    },
  });

  doc.save(
    `Khafai_Electricity_Report_${user.User_ID}_${new Date().toISOString().slice(0, 10)}.pdf`
  );
}
