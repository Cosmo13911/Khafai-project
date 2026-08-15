import type { Metadata, Viewport } from "next";
import { Prompt, Inter } from "next/font/google";
import { Providers } from "@/components/Providers";
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

export const viewport: Viewport = {
  themeColor: "#0284c7",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  title: "Khafai - ระบบบันทึกและวิเคราะห์การใช้ไฟฟ้า",
  description: "Web Application สำหรับบันทึกและวิเคราะห์การใช้ไฟฟ้าแบบ Multi-user พร้อมระบบคำนวณหน่วยไฟฟ้าและค่าใช้จ่ายอัตโนมัติ",
  keywords: ["Khafai", "บันทึกค่าไฟ", "วิเคราะห์ค่าไฟฟ้า", "คำนวณค่าไฟ", "ระบบบันทึกไฟ", "PWA"],
  applicationName: "Khafai",
  appleWebApp: {
    capable: true,
    title: "Khafai",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/icons/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    shortcut: "/icons/icon-192x192.png",
  },
  manifest: "/manifest.webmanifest",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
