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

  const payload = {
    action,
    user_id: userId,
    User_ID: userId,
    ...extraParams,
  };

  // Append action and user_id to query string so GAS handles redirected GET/POST requests seamlessly
  const urlObj = new URL(baseUrl);
  urlObj.searchParams.set("action", action);
  urlObj.searchParams.set("user_id", userId);

  // Set 3.5s timeout controller to guarantee zero UI hanging
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3500);

  try {
    const res = await fetch(urlObj.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(payload),
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
      console.log("GAS API call timed out (3.5s limit) - Falling back to instant local engine");
    } else {
      console.warn("GAS API fetch notice:", error);
    }
    return null;
  }
}
