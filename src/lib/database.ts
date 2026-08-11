import { UserProfile, MeterLog } from "@/types";
import { recalculateLogs } from "./khafai-engine";

// In-Memory Database representing Google Sheets Tabs (Users & Meter_Logs)
const DEFAULT_USER_ID = "google-sub-1029384756";
const DEFAULT_USER_EMAIL = "user@khafai.app";

const initialUsers: Record<string, UserProfile> = {
  [DEFAULT_USER_ID]: {
    User_ID: DEFAULT_USER_ID,
    Email: DEFAULT_USER_EMAIL,
    Current_Rate_Per_Unit: 8.0,
    Created_At: "2026-01-01T00:00:00.000Z",
    hasCompletedOnboarding: true,
  },
};

// Seed sample meter logs starting 5 months ago to showcase dashboard features
const rawSeedLogs: MeterLog[] = [
  {
    Log_ID: "log-seed-1",
    User_ID: DEFAULT_USER_ID,
    Record_Date: "2026-03-01",
    Meter_Reading: 1200,
    Units_Used: 0,
    Total_Cost: 0,
    Is_New_Meter: true, // Baseline reading
    Created_At: "2026-03-01T08:00:00.000Z",
  },
  {
    Log_ID: "log-seed-2",
    User_ID: DEFAULT_USER_ID,
    Record_Date: "2026-04-01",
    Meter_Reading: 1345,
    Units_Used: 145,
    Total_Cost: 1160.0,
    Is_New_Meter: false,
    Created_At: "2026-04-01T08:00:00.000Z",
  },
  {
    Log_ID: "log-seed-3",
    User_ID: DEFAULT_USER_ID,
    Record_Date: "2026-05-01",
    Meter_Reading: 1520,
    Units_Used: 175,
    Total_Cost: 1400.0,
    Is_New_Meter: false,
    Created_At: "2026-05-01T08:00:00.000Z",
  },
  {
    Log_ID: "log-seed-4",
    User_ID: DEFAULT_USER_ID,
    Record_Date: "2026-06-01",
    Meter_Reading: 1710,
    Units_Used: 190,
    Total_Cost: 1520.0,
    Is_New_Meter: false,
    Created_At: "2026-06-01T08:00:00.000Z",
  },
  {
    Log_ID: "log-seed-5",
    User_ID: DEFAULT_USER_ID,
    Record_Date: "2026-07-01",
    Meter_Reading: 1880,
    Units_Used: 170,
    Total_Cost: 1360.0,
    Is_New_Meter: false,
    Created_At: "2026-07-01T08:00:00.000Z",
  },
  {
    Log_ID: "log-seed-6",
    User_ID: DEFAULT_USER_ID,
    Record_Date: "2026-08-01",
    Meter_Reading: 2045,
    Units_Used: 165,
    Total_Cost: 1320.0,
    Is_New_Meter: false,
    Created_At: "2026-08-01T08:00:00.000Z",
  },
];

let dbUsers = { ...initialUsers };
let dbLogs: MeterLog[] = recalculateLogs(rawSeedLogs, 8.0);

export function getUserProfile(userId: string): UserProfile {
  if (!dbUsers[userId]) {
    dbUsers[userId] = {
      User_ID: userId,
      Email: `${userId}@khafai.app`,
      Current_Rate_Per_Unit: 8.0,
      Created_At: new Date().toISOString(),
      hasCompletedOnboarding: false,
    };
  }
  return dbUsers[userId];
}

export function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): UserProfile {
  const user = getUserProfile(userId);
  const updatedUser = { ...user, ...updates };
  dbUsers[userId] = updatedUser;

  // If Tariff rate updated, trigger full historical recalculation!
  if (
    updates.Current_Rate_Per_Unit !== undefined &&
    updates.Current_Rate_Per_Unit !== user.Current_Rate_Per_Unit
  ) {
    const userLogs = dbLogs.filter((l) => l.User_ID === userId);
    const otherLogs = dbLogs.filter((l) => l.User_ID !== userId);
    const recalculated = recalculateLogs(
      userLogs,
      updates.Current_Rate_Per_Unit
    );
    dbLogs = [...otherLogs, ...recalculated];
  }

  return updatedUser;
}

export function getMeterLogs(userId: string): MeterLog[] {
  const user = getUserProfile(userId);
  const userLogs = dbLogs.filter((l) => l.User_ID === userId);
  return recalculateLogs(userLogs, user.Current_Rate_Per_Unit);
}

export function createMeterLog(
  userId: string,
  newLogData: Omit<MeterLog, "Log_ID" | "User_ID" | "Units_Used" | "Total_Cost" | "Created_At">
): MeterLog {
  const user = getUserProfile(userId);
  
  // If user is adding baseline for onboarding
  if (!user.hasCompletedOnboarding) {
    dbUsers[userId].hasCompletedOnboarding = true;
  }

  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const createdLog: MeterLog = {
    Log_ID: logId,
    User_ID: userId,
    Record_Date: newLogData.Record_Date,
    Meter_Reading: Number(newLogData.Meter_Reading),
    Units_Used: 0,
    Total_Cost: 0,
    Is_New_Meter: Boolean(newLogData.Is_New_Meter),
    Created_At: new Date().toISOString(),
  };

  const userLogs = dbLogs.filter((l) => l.User_ID === userId);
  const otherLogs = dbLogs.filter((l) => l.User_ID !== userId);

  userLogs.push(createdLog);
  const recalculated = recalculateLogs(userLogs, user.Current_Rate_Per_Unit);

  dbLogs = [...otherLogs, ...recalculated];
  return recalculated.find((l) => l.Log_ID === logId)!;
}

export function updateMeterLog(
  userId: string,
  logId: string,
  updates: Partial<Omit<MeterLog, "Log_ID" | "User_ID">>
): MeterLog {
  const user = getUserProfile(userId);
  const userLogs = dbLogs.filter((l) => l.User_ID === userId);
  const otherLogs = dbLogs.filter((l) => l.User_ID !== userId);

  const targetIndex = userLogs.findIndex((l) => l.Log_ID === logId);
  if (targetIndex === -1) {
    throw new Error("Record not found");
  }

  userLogs[targetIndex] = {
    ...userLogs[targetIndex],
    ...updates,
    Meter_Reading: updates.Meter_Reading !== undefined ? Number(updates.Meter_Reading) : userLogs[targetIndex].Meter_Reading,
  };

  const recalculated = recalculateLogs(userLogs, user.Current_Rate_Per_Unit);
  dbLogs = [...otherLogs, ...recalculated];
  return recalculated.find((l) => l.Log_ID === logId)!;
}

export function deleteMeterLog(userId: string, logId: string): void {
  const user = getUserProfile(userId);
  const userLogs = dbLogs.filter((l) => l.User_ID === userId);
  const otherLogs = dbLogs.filter((l) => l.User_ID !== userId);

  const filteredUserLogs = userLogs.filter((l) => l.Log_ID !== logId);
  const recalculated = recalculateLogs(filteredUserLogs, user.Current_Rate_Per_Unit);

  dbLogs = [...otherLogs, ...recalculated];
}

export function resetUserDatabase(userId: string): void {
  dbUsers[userId] = {
    User_ID: userId,
    Email: `${userId}@khafai.app`,
    Current_Rate_Per_Unit: 8.0,
    Created_At: new Date().toISOString(),
    hasCompletedOnboarding: true,
  };

  dbLogs = dbLogs.filter((l) => l.User_ID !== userId);
  const reseeded = rawSeedLogs.map((l) => ({ ...l, User_ID: userId }));
  const recalculated = recalculateLogs(reseeded, 8.0);
  dbLogs.push(...recalculated);
}
