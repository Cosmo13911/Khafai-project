import { UserProfile, MeterLog } from "@/types";
import { recalculateLogs } from "./khafai-engine";

export function sanitizeEmail(rawEmail?: string, fallbackId?: string): string {
  let email = (rawEmail || fallbackId || "").trim().toLowerCase();
  if (email.endsWith("@khafai.app")) {
    const stripped = email.replace(/@khafai\.app$/, "");
    if (stripped.includes("@")) {
      email = stripped;
    }
  }
  return email;
}

// In-Memory Database representing Google Sheets Tabs (Users & Meter_Logs)
// Clean database with ZERO mockup records
let dbUsers: Record<string, UserProfile> = {};
let dbLogs: MeterLog[] = [];

export function syncUserProfileFromGas(
  userId: string,
  user: Partial<UserProfile>,
  realEmail?: string,
  realName?: string,
  picture?: string
): UserProfile {
  const cleanUserId = sanitizeEmail(userId);
  const cleanEmail = sanitizeEmail(realEmail || user.Email, cleanUserId);
  const current = dbUsers[cleanUserId] || {
    User_ID: cleanUserId,
    Email: cleanEmail,
    Name: realName || user.Name || "",
    Picture: picture || user.Picture || "",
    Current_Rate_Per_Unit: 8.0,
    Created_At: new Date().toISOString(),
    hasCompletedOnboarding: true,
  };
  dbUsers[cleanUserId] = {
    ...current,
    ...user,
    User_ID: cleanUserId,
    Email: cleanEmail,
    Name: realName || user.Name || current.Name || "",
    Picture: picture || user.Picture || current.Picture || "",
  };
  return dbUsers[cleanUserId];
}

export function syncMeterLogsFromGas(
  userId: string,
  gasLogs: MeterLog[]
): MeterLog[] {
  const cleanUserId = sanitizeEmail(userId);
  const user = getUserProfile(cleanUserId);
  const otherLogs = dbLogs.filter((l) => l.User_ID !== cleanUserId);
  const formattedGasLogs = gasLogs.map((log) => ({
    ...log,
    User_ID: cleanUserId,
    Meter_Reading: Number(log.Meter_Reading),
    Units_Used: Number(log.Units_Used || 0),
    Total_Cost: Number(log.Total_Cost || 0),
    Is_New_Meter: Boolean(log.Is_New_Meter),
  }));
  const recalculated = recalculateLogs(formattedGasLogs, user.Current_Rate_Per_Unit);
  dbLogs = [...otherLogs, ...recalculated];
  return recalculated;
}

export function getUserProfile(
  userId: string,
  realEmail?: string,
  realName?: string,
  picture?: string
): UserProfile {
  const cleanUserId = sanitizeEmail(userId);
  const cleanEmail = sanitizeEmail(realEmail, cleanUserId);

  if (!dbUsers[cleanUserId]) {
    dbUsers[cleanUserId] = {
      User_ID: cleanUserId,
      Email: cleanEmail,
      Name: realName || "",
      Picture: picture || "",
      Current_Rate_Per_Unit: 8.0,
      Created_At: new Date().toISOString(),
      hasCompletedOnboarding: true,
    };
  } else {
    if (cleanEmail) dbUsers[cleanUserId].Email = cleanEmail;
    if (realName) dbUsers[cleanUserId].Name = realName;
    if (picture) dbUsers[cleanUserId].Picture = picture;
  }
  return dbUsers[cleanUserId];
}

export function updateUserProfile(
  userId: string,
  updates: Partial<UserProfile>
): UserProfile {
  const cleanUserId = sanitizeEmail(userId);
  const user = getUserProfile(cleanUserId);
  const updatedUser = {
    ...user,
    ...updates,
    Email: updates.Email ? sanitizeEmail(updates.Email) : user.Email,
  };
  dbUsers[cleanUserId] = updatedUser;

  // If Tariff rate updated, trigger full historical recalculation!
  if (
    updates.Current_Rate_Per_Unit !== undefined &&
    updates.Current_Rate_Per_Unit !== user.Current_Rate_Per_Unit
  ) {
    const userLogs = getMeterLogs(cleanUserId);
    const otherLogs = dbLogs.filter((l) => l.User_ID !== cleanUserId);
    const recalculated = recalculateLogs(
      userLogs,
      updates.Current_Rate_Per_Unit
    );
    dbLogs = [...otherLogs, ...recalculated];
  }

  return updatedUser;
}

export function getMeterLogs(userId: string): MeterLog[] {
  const cleanUserId = sanitizeEmail(userId);
  const user = getUserProfile(cleanUserId);
  const userLogs = dbLogs.filter((l) => l.User_ID === cleanUserId);
  return recalculateLogs(userLogs, user.Current_Rate_Per_Unit);
}

export function createMeterLog(
  userId: string,
  newLogData: Omit<MeterLog, "Log_ID" | "User_ID" | "Units_Used" | "Total_Cost" | "Created_At">
): MeterLog {
  const cleanUserId = sanitizeEmail(userId);
  const user = getUserProfile(cleanUserId);
  
  if (!user.hasCompletedOnboarding) {
    dbUsers[cleanUserId].hasCompletedOnboarding = true;
  }

  const logId = `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
  const createdLog: MeterLog = {
    Log_ID: logId,
    User_ID: cleanUserId,
    Record_Date: newLogData.Record_Date,
    Meter_Reading: Number(newLogData.Meter_Reading),
    Units_Used: 0,
    Total_Cost: 0,
    Is_New_Meter: Boolean(newLogData.Is_New_Meter),
    Created_At: new Date().toISOString(),
  };

  const userLogs = dbLogs.filter((l) => l.User_ID === cleanUserId);
  const otherLogs = dbLogs.filter((l) => l.User_ID !== cleanUserId);

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
  const cleanUserId = sanitizeEmail(userId);
  const user = getUserProfile(cleanUserId);
  const userLogs = dbLogs.filter((l) => l.User_ID === cleanUserId);
  const otherLogs = dbLogs.filter((l) => l.User_ID !== cleanUserId);

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
  const cleanUserId = sanitizeEmail(userId);
  const user = getUserProfile(cleanUserId);
  const userLogs = dbLogs.filter((l) => l.User_ID === cleanUserId);
  const otherLogs = dbLogs.filter((l) => l.User_ID !== cleanUserId);

  const filteredUserLogs = userLogs.filter((l) => l.Log_ID !== logId);
  const recalculated = recalculateLogs(filteredUserLogs, user.Current_Rate_Per_Unit);

  dbLogs = [...otherLogs, ...recalculated];
}

export function resetUserDatabase(userId: string, email?: string, name?: string): void {
  const cleanUserId = sanitizeEmail(userId);
  dbUsers[cleanUserId] = {
    User_ID: cleanUserId,
    Email: sanitizeEmail(email, cleanUserId),
    Name: name || "",
    Current_Rate_Per_Unit: 8.0,
    Created_At: new Date().toISOString(),
    hasCompletedOnboarding: true,
  };

  dbLogs = dbLogs.filter((l) => l.User_ID !== cleanUserId);
}
