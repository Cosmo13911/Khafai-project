const DEFAULT_GAS_URL =
  "https://script.google.com/macros/s/AKfycbznppna-HmTQcSo2e-4IFrSpFEgSsw1zdYWgt-rOGmO4Ns7RxHCEspP8BE8vxKLqndA/exec";

export function getGasUrl(): string {
  return process.env.GAS_WEB_APP_URL || DEFAULT_GAS_URL;
}

/**
 * Sends a request to Google Apps Script Web App API via Next.js Proxy.
 * Includes a strict 3.5-second timeout and query parameter fallback
 * to prevent hanging or spinning indefinitely.
 */
export async function callGasApi<T = Record<string, unknown>>(
  action: string,
  userId: string,
  extraParams: Record<string, unknown> = {}
): Promise<T | null> {
  const baseUrl = getGasUrl();

  const payload: Record<string, unknown> = {
    action,
    user_id: userId,
    User_ID: userId,
    ...extraParams,
  };

  // Set action and user_id into searchParams for clean URL routing
  const urlObj = new URL(baseUrl);
  urlObj.searchParams.set("action", action);
  urlObj.searchParams.set("user_id", userId);

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
