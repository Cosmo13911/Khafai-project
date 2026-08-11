import type { Metadata } from "next";
import { Prompt, Inter } from "next/font/google";
import "./globals.css";

const promptFont = Prompt({
  weight: ["300", "400", "500", "600", "700", "800"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
});

const interFont = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Khafai - ระบบบันทึกและวิเคราะห์การใช้ไฟฟ้า",
  description: "Web Application สำหรับบันทึกและวิเคราะห์การใช้ไฟฟ้าแบบ Multi-user พร้อมระบบคำนวณหน่วยไฟฟ้าและค่าใช้จ่ายอัตโนมัติ",
  keywords: ["Khafai", "บันทึกค่าไฟ", "วิเคราะห์ค่าไฟฟ้า", "คำนวณค่าไฟ", "ระบบบันทึกไฟ"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="th"
      className={`${promptFont.variable} ${interFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans bg-slate-50 text-slate-900">
        {children}
      </body>
    </html>
  );
}
