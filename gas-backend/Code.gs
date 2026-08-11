/**
 * ==============================================================================
 * Khafai Project - Google Apps Script (GAS) Backend API
 * Web Application สำหรับบันทึกและวิเคราะห์การใช้ไฟฟ้า (Multi-user)
 * ==============================================================================
 * 
 * แท็บใน Google Sheets ที่ต้องสร้าง:
 * 1. "Users"      -> [ User_ID, Email, Current_Rate_Per_Unit, Created_At ]
 * 2. "Meter_Logs" -> [ Log_ID, User_ID, Record_Date, Meter_Reading, Units_Used, Total_Cost, Is_New_Meter, Created_At ]
 */

const SHEET_USERS = "Users";
const SHEET_METER_LOGS = "Meter_Logs";
const DEFAULT_RATE = 8.00;

/**
 * HTTP GET Endpoint Handler
 */
function doGet(e) {
  return handleRequest(e, "GET");
}

/**
 * HTTP POST Endpoint Handler
 */
function doPost(e) {
  return handleRequest(e, "POST");
}

/**
 * Main Request Routing Engine
 */
function handleRequest(e, httpMethod) {
  // Use LockService to prevent race conditions and concurrent overwrite
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000); // Wait up to 10 seconds for lock
  } catch (err) {
    return createJsonResponse({
      success: false,
      error: "LOCK_TIMEOUT",
      message: "ระบบกำลังประมวลผลคำขออื่นอยู่ กรุณาลองใหม่อีกครั้ง"
    }, 429);
  }

  try {
    let params = {};
    if (httpMethod === "POST" && e.postData && e.postData.contents) {
      params = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      params = e.parameter;
    }

    const action = params.action;
    const userId = params.user_id || params.User_ID;

    if (!userId) {
      return createJsonResponse({ success: false, error: "MISSING_USER_ID", message: "กรุณาระบุ User_ID" });
    }

    // Auto-setup sheets if missing
    ensureSheetsExist();

    let result;

    switch (action) {
      case "getUser":
        result = handleGetUser(userId);
        break;

      case "updateUser":
        result = handleUpdateUser(userId, params);
        break;

      case "getMeterLogs":
        result = handleGetMeterLogs(userId);
        break;

      case "createMeterLog":
        result = handleCreateMeterLog(userId, params);
        break;

      case "updateMeterLog":
        result = handleUpdateMeterLog(userId, params);
        break;

      case "deleteMeterLog":
        result = handleDeleteMeterLog(userId, params);
        break;

      default:
        result = { success: false, error: "UNKNOWN_ACTION", message: "Action ไม่ถูกต้อง" };
    }

    return createJsonResponse(result);

  } catch (error) {
    return createJsonResponse({
      success: false,
      error: "SERVER_ERROR",
      message: error.toString()
    });
  } finally {
    lock.releaseLock();
  }
}

// ==============================================================================
// USER HANDLERS
// ==============================================================================

function handleGetUser(userId) {
  const user = findOrCreateUser(userId);
  return { success: true, user: user };
}

function handleUpdateUser(userId, params) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
  const data = sheet.getDataRange().getValues();
  
  let userRowIndex = -1;
  let currentUserRate = DEFAULT_RATE;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      userRowIndex = i + 1; // 1-indexed sheet row
      currentUserRate = parseFloat(data[i][2]) || DEFAULT_RATE;
      break;
    }
  }

  const newRate = params.Current_Rate_Per_Unit !== undefined ? parseFloat(params.Current_Rate_Per_Unit) : currentUserRate;

  if (userRowIndex !== -1) {
    sheet.getRange(userRowIndex, 3).setValue(newRate);
  } else {
    sheet.appendRow([userId, params.Email || `${userId}@khafai.app`, newRate, new Date().toISOString()]);
  }

  // Tariff Update Strategy: Recalculate all historical logs with the new rate
  recalculateUserLogs(userId, newRate);

  const updatedUser = {
    User_ID: userId,
    Email: params.Email || `${userId}@khafai.app`,
    Current_Rate_Per_Unit: newRate,
    Created_At: new Date().toISOString()
  };

  return { success: true, user: updatedUser };
}

function findOrCreateUser(userId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_USERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === userId) {
      return {
        User_ID: data[i][0],
        Email: data[i][1],
        Current_Rate_Per_Unit: parseFloat(data[i][2]) || DEFAULT_RATE,
        Created_At: data[i][3]
      };
    }
  }

  // If not found, create new user
  const newUser = {
    User_ID: userId,
    Email: `${userId}@khafai.app`,
    Current_Rate_Per_Unit: DEFAULT_RATE,
    Created_At: new Date().toISOString()
  };

  sheet.appendRow([newUser.User_ID, newUser.Email, newUser.Current_Rate_Per_Unit, newUser.Created_At]);
  return newUser;
}

// ==============================================================================
// METER LOG HANDLERS (CREATE, READ, UPDATE, DELETE)
// ==============================================================================

function handleGetMeterLogs(userId) {
  const user = findOrCreateUser(userId);
  const logs = getUserLogsRaw(userId);
  const recalculated = recalculateLogsArray(logs, user.Current_Rate_Per_Unit);

  return {
    success: true,
    user: user,
    logs: recalculated
  };
}

function handleCreateMeterLog(userId, params) {
  const user = findOrCreateUser(userId);
  const recordDate = params.Record_Date;
  const meterReading = parseFloat(params.Meter_Reading);
  const isNewMeter = params.Is_New_Meter === true || params.Is_New_Meter === "true";

  if (!recordDate || isNaN(meterReading)) {
    return { success: false, error: "INVALID_INPUT", message: "กรุณากรอกวันที่และเลขมิเตอร์ให้ถูกต้อง" };
  }

  const existingLogs = getUserLogsRaw(userId);

  // Range Validation Check
  const validation = validateRange(existingLogs, meterReading, recordDate, isNewMeter);
  if (!validation.isValid) {
    return { success: false, error: "RANGE_VALIDATION_FAILED", message: validation.errorMessage };
  }

  const logId = "log-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
  const createdAt = new Date().toISOString();

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_METER_LOGS);
  sheet.appendRow([
    logId,
    userId,
    recordDate,
    meterReading,
    0, // Units_Used (will be recalculated)
    0, // Total_Cost (will be recalculated)
    isNewMeter ? true : false,
    createdAt
  ]);

  // Trigger Auto Recalculation
  const updatedLogs = recalculateUserLogs(userId, user.Current_Rate_Per_Unit);

  return {
    success: true,
    log_id: logId,
    logs: updatedLogs
  };
}

function handleUpdateMeterLog(userId, params) {
  const user = findOrCreateUser(userId);
  const logId = params.log_id || params.Log_ID;
  const recordDate = params.Record_Date;
  const meterReading = parseFloat(params.Meter_Reading);
  const isNewMeter = params.Is_New_Meter === true || params.Is_New_Meter === "true";

  if (!logId) {
    return { success: false, error: "MISSING_LOG_ID", message: "กรุณาระบุ Log_ID ที่ต้องการแก้ไข" };
  }

  const existingLogs = getUserLogsRaw(userId);
  const validation = validateRange(existingLogs, meterReading, recordDate, isNewMeter, logId);
  if (!validation.isValid) {
    return { success: false, error: "RANGE_VALIDATION_FAILED", message: validation.errorMessage };
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_METER_LOGS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === logId && data[i][1] === userId) {
      sheet.getRange(i + 1, 3).setValue(recordDate);
      sheet.getRange(i + 1, 4).setValue(meterReading);
      sheet.getRange(i + 1, 7).setValue(isNewMeter ? true : false);
      break;
    }
  }

  const updatedLogs = recalculateUserLogs(userId, user.Current_Rate_Per_Unit);
  return { success: true, logs: updatedLogs };
}

function handleDeleteMeterLog(userId, params) {
  const user = findOrCreateUser(userId);
  const logId = params.log_id || params.Log_ID;

  if (!logId) {
    return { success: false, error: "MISSING_LOG_ID", message: "กรุณาระบุ Log_ID ที่ต้องการลบ" };
  }

  const logs = getUserLogsRaw(userId);
  
  // Delete Protection Rule Check
  const protection = checkDeleteProtectionRule(logs, logId);
  if (!protection.canDelete) {
    return { success: false, error: "DELETE_PROTECTION_TRIGGERED", message: protection.message };
  }

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_METER_LOGS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === logId && data[i][1] === userId) {
      sheet.deleteRow(i + 1);
      break;
    }
  }

  const updatedLogs = recalculateUserLogs(userId, user.Current_Rate_Per_Unit);
  return { success: true, logs: updatedLogs };
}

// ==============================================================================
// RECALCULATION & VALIDATION LOGIC ENGINE
// ==============================================================================

function getUserLogsRaw(userId) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_METER_LOGS);
  const data = sheet.getDataRange().getValues();
  const logs = [];

  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === userId) {
      logs.push({
        Log_ID: data[i][0],
        User_ID: data[i][1],
        Record_Date: formatDate(data[i][2]),
        Meter_Reading: parseFloat(data[i][3]),
        Units_Used: parseFloat(data[i][4]) || 0,
        Total_Cost: parseFloat(data[i][5]) || 0,
        Is_New_Meter: data[i][6] === true || data[i][6] === "true" || data[i][6] === "TRUE",
        Created_At: data[i][7]
      });
    }
  }

  // Sort by Record_Date ASC, then Created_At ASC
  return sortLogsArray(logs);
}

function sortLogsArray(logs) {
  return logs.sort(function(a, b) {
    if (a.Record_Date < b.Record_Date) return -1;
    if (a.Record_Date > b.Record_Date) return 1;
    if (a.Created_At < b.Created_At) return -1;
    if (a.Created_At > b.Created_At) return 1;
    return 0;
  });
}

function recalculateLogsArray(logs, currentRate) {
  const sorted = sortLogsArray(logs);
  
  return sorted.map(function(log, index) {
    if (index === 0 || log.Is_New_Meter) {
      log.Units_Used = 0;
      log.Total_Cost = 0;
    } else {
      const prevLog = sorted[index - 1];
      const rawUnits = log.Meter_Reading - prevLog.Meter_Reading;
      log.Units_Used = Math.max(0, rawUnits);
      log.Total_Cost = Math.round(log.Units_Used * currentRate * 100) / 100;
    }
    return log;
  });
}

function recalculateUserLogs(userId, currentRate) {
  const logs = getUserLogsRaw(userId);
  const recalculated = recalculateLogsArray(logs, currentRate);

  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_METER_LOGS);
  const data = sheet.getDataRange().getValues();

  // Write back calculated Units_Used and Total_Cost to Sheet
  for (let i = 1; i < data.length; i++) {
    if (data[i][1] === userId) {
      const currentLogId = data[i][0];
      const match = recalculated.find(function(l) { return l.Log_ID === currentLogId; });
      if (match) {
        sheet.getRange(i + 1, 5).setValue(match.Units_Used);
        sheet.getRange(i + 1, 6).setValue(match.Total_Cost);
      }
    }
  }

  return recalculated;
}

function validateRange(logs, proposedReading, proposedDate, isNewMeter, excludeLogId) {
  const filtered = logs.filter(function(l) { return l.Log_ID !== excludeLogId; });
  const sorted = sortLogsArray(filtered);

  let prevLog = null;
  let nextLog = null;

  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].Record_Date <= proposedDate) {
      prevLog = sorted[i];
    } else {
      nextLog = sorted[i];
      break;
    }
  }

  if (!isNewMeter && prevLog && proposedReading < prevLog.Meter_Reading) {
    return {
      isValid: false,
      errorMessage: "ตัวเลขต้องไม่น้อยกว่าค่าก่อนหน้า (" + prevLog.Meter_Reading + ")"
    };
  }

  if (nextLog && proposedReading > nextLog.Meter_Reading) {
    return {
      isValid: false,
      errorMessage: "ตัวเลขต้องไม่เกินค่าถัดไป (" + nextLog.Meter_Reading + ")"
    };
  }

  return { isValid: true };
}

function checkDeleteProtectionRule(logs, logIdToDelete) {
  const sorted = sortLogsArray(logs);
  const targetIndex = sorted.findIndex(function(l) { return l.Log_ID === logIdToDelete; });

  if (targetIndex === -1) return { canDelete: true };

  const targetLog = sorted[targetIndex];

  if (targetLog.Is_New_Meter) {
    const hasChildInCycle = (targetIndex < sorted.length - 1) && !sorted[targetIndex + 1].Is_New_Meter;
    if (hasChildInCycle) {
      return {
        canDelete: false,
        message: "ไม่สามารถลบจุดเริ่มต้นของรอบมิเตอร์ได้ กรุณาลบรายการถัดไปในรอบเดียวกันออกก่อน"
      };
    }
  }

  return { canDelete: true };
}

// ==============================================================================
// HELPER UTILITIES
// ==============================================================================

function ensureSheetsExist() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let userSheet = ss.getSheetByName(SHEET_USERS);
  if (!userSheet) {
    userSheet = ss.insertSheet(SHEET_USERS);
    userSheet.appendRow(["User_ID", "Email", "Current_Rate_Per_Unit", "Created_At"]);
  }

  let logsSheet = ss.getSheetByName(SHEET_METER_LOGS);
  if (!logsSheet) {
    logsSheet = ss.insertSheet(SHEET_METER_LOGS);
    logsSheet.appendRow(["Log_ID", "User_ID", "Record_Date", "Meter_Reading", "Units_Used", "Total_Cost", "Is_New_Meter", "Created_At"]);
  }
}

function formatDate(dateVal) {
  if (!dateVal) return "";
  if (typeof dateVal === "string") return dateVal.substring(0, 10);
  const d = new Date(dateVal);
  const year = d.getFullYear();
  const month = ("0" + (d.getMonth() + 1)).slice(-2);
  const day = ("0" + d.getDate()).slice(-2);
  return year + "-" + month + "-" + day;
}

function createJsonResponse(data, statusCode) {
  const output = ContentService.createTextOutput(JSON.stringify(data));
  output.setMimeType(ContentService.MimeType.JSON);
  return output;
}
