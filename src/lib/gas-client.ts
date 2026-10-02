const DEFAULT_GAS_URL =
  "https://script.google.com/macros/s/AKfycbz4nZTaOHrqlJQtEu2Ot92dZIe5D_uUXe5LnU6OdyPPTNqK-msnw8XFlR7cT8AuVBWM/exec";

export function getGasUrl(): string {
  return process.env.GAS_WEB_APP_URL || DEFAULT_GAS_URL;
}

export function getGasSecret(): string {
  return process.env.KHAFAI_API_SECRET || "khafai_secure_token_prod_2026";
}

/**
 * Sends a request to Google Apps Script Web App API via Next.js Proxy.
 * Includes a strict 15-second timeout and query parameter fallback
 * to prevent hanging or spinning indefinitely.
 */
export async function callGasApi<T = Record<string, unknown>>(
  action: string,
  userId: string,
  extraParams: Record<string, unknown> = {}
): Promise<T | null> {
  const baseUrl = getGasUrl();
  const apiSecret = getGasSecret();

  const payload: Record<string, unknown> = {
    action,
    user_id: userId,
    User_ID: userId,
    apiKey: apiSecret,
    api_secret: apiSecret,
    ...extraParams,
  };

  // Set action, user_id, email, and apiKey into searchParams for clean URL routing
  const urlObj = new URL(baseUrl);
  urlObj.searchParams.set("action", action);
  urlObj.searchParams.set("user_id", userId);
  urlObj.searchParams.set("apiKey", apiSecret);
  urlObj.searchParams.set("api_secret", apiSecret);
  const emailVal = (extraParams.Email || extraParams.email || extraParams.user_email) as string;
  if (emailVal) {
    urlObj.searchParams.set("email", emailVal);
    urlObj.searchParams.set("Email", emailVal);
    urlObj.searchParams.set("user_email", emailVal);
    urlObj.searchParams.set("User_Email", emailVal);
    payload.email = emailVal;
    payload.Email = emailVal;
    payload.user_email = emailVal;
  }
  const nameVal = (extraParams.Name || extraParams.name || extraParams.user_name) as string;
  if (nameVal) {
    urlObj.searchParams.set("name", nameVal);
    urlObj.searchParams.set("Name", nameVal);
    urlObj.searchParams.set("user_name", nameVal);
    urlObj.searchParams.set("User_Name", nameVal);
    payload.name = nameVal;
    payload.Name = nameVal;
  }
  if (extraParams.Record_Date) urlObj.searchParams.set("Record_Date", String(extraParams.Record_Date));
  if (extraParams.Meter_Reading !== undefined) urlObj.searchParams.set("Meter_Reading", String(extraParams.Meter_Reading));
  if (extraParams.Is_New_Meter !== undefined) urlObj.searchParams.set("Is_New_Meter", String(extraParams.Is_New_Meter));
  if (extraParams.log_id || extraParams.Log_ID) urlObj.searchParams.set("log_id", String(extraParams.log_id || extraParams.Log_ID));
  if (extraParams.Current_Rate_Per_Unit !== undefined) urlObj.searchParams.set("Current_Rate_Per_Unit", String(extraParams.Current_Rate_Per_Unit));

  // Set 15s timeout controller to give GAS sufficient execution time for Google Sheets write & recalculation
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  try {
    const isGetAction = action === "getMeterLogs" || action === "getUser";
    const res = await fetch(urlObj.toString(), {
      method: isGetAction ? "GET" : "POST",
      headers: isGetAction ? undefined : { "Content-Type": "text/plain;charset=utf-8" },
      body: isGetAction ? undefined : JSON.stringify(payload),
      redirect: "follow",
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`GAS API responded with status ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data as T;
  } catch (error: unknown) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === "AbortError") {
      console.warn("GAS API call timed out (15s limit) - Falling back to instant local engine");
    } else {
      console.warn("GAS API fetch notice:", error);
    }
    return null;
  }
}
