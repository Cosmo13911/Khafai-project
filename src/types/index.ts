export interface GoogleUserSession {
  User_ID: string; // Google Sub ID
  Email: string;
  Name: string;
  Picture?: string;
  idToken?: string;
  isDemo?: boolean;
}

export interface UserProfile {
  User_ID: string;
  Email: string;
  Name?: string;
  Picture?: string;
  Current_Rate_Per_Unit: number; // Default 8.00 Baht/unit
  Created_At: string;
  hasCompletedOnboarding?: boolean;
}

export interface MeterLog {
  Log_ID: string;
  User_ID: string;
  Record_Date: string; // YYYY-MM-DD format
  Meter_Reading: number;
  Units_Used: number;
  Total_Cost: number;
  Is_New_Meter: boolean;
  Created_At: string;
}

export interface DatabaseSchema {
  Users: Record<string, UserProfile>;
  Meter_Logs: MeterLog[];
}

export interface RateLimitStatus {
  isLocked: boolean;
  lockedUntil: number | null; // epoch timestamp in ms
  remainingSeconds: number;
  warningToast?: string;
}

export interface SummaryData {
  currentMonthUnits: number;
  currentMonthCost: number;
  prevMonthUnits: number;
  prevMonthCost: number;
  unitsPercentChange: number | null;
  costPercentChange: number | null;
  currentRate: number;
  totalCyclesCount: number;
  currentMonthName: string;
  prevMonthName: string;
}

export interface MonthlyChartData {
  monthKey: string; // YYYY-MM
  monthName: string; // e.g. "ม.ค. 2026"
  totalUnits: number;
  totalCost: number;
  logCount: number;
}
