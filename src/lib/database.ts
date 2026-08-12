import { UserProfile, MeterLog } from "@/types";
import { recalculateLogs } from "./khafai-engine";

// In-Memory Database representing Google Sheets Tabs (Users & Meter_Logs)
// Clean database with ZERO mockup records
let dbUsers: Record<string, UserProfile> = {};
let dbLogs: MeterLog[] = [];

export function syncUserProfileFromGas(
  userId: string,
  user: Partial<UserProfile>
): UserProfile {
  const current = dbUsers[userId] || {
    User_ID: userId,
    Email: `${userId}@khafai.app`,
    Current_Rate_Per_Unit: 8.0,
    Created_At: new Date().toISOString(),
    hasCompletedOnboarding: true,
  };
  dbUsers[userId] = {
    ...current,
    ...user,
    User_ID: userId,
  };
  return dbUsers[userId];
}

export function syncMeterLogsFromGas(
  userId: string,
  gasLogs: MeterLog[]
): MeterLog[] {
  const user = getUserProfile(userId);
  const otherLogs = dbLogs.filter((l) => l.User_ID !== userId);
  const formattedGasLogs = gasLogs.map((log) => ({
    ...log,
    User_ID: userId,
    Meter_Reading: Number(log.Meter_Reading),
    Units_Used: Number(log.Units_Used || 0),
    Total_Cost: Number(log.Total_Cost || 0),
    Is_New_Meter: Boolean(log.Is_New_Meter),
  }));
  const recalculated = recalculateLogs(formattedGasLogs, user.Current_Rate_Per_Unit);
  dbLogs = [...otherLogs, ...recalculated];
  return recalculated;
}

export function getUserProfile(userId: string): UserProfile {
  if (!dbUsers[userId]) {
    dbUsers[userId] = {
      User_ID: userId,
      Email: `${userId}@khafai.app`,
      Current_Rate_Per_Unit: 8.0,
      Created_At: new Date().toISOString(),
      hasCompletedOnboarding: true,
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
    const userLogs = getMeterLogs(userId);
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
}
