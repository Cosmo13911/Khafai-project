const DEFAULT_GAS_URL =
  "https://script.google.com/macros/s/AKfycbznppna-HmTQcSo2e-4IFrSpFEgSsw1zdYWgt-rOGmO4Ns7RxHCEspP8BE8vxKLqndA/exec";

export function getGasUrl(): string {
  return process.env.GAS_WEB_APP_URL || DEFAULT_GAS_URL;
}

/**
 * Sends a request to Google Apps Script Web App API via Next.js Proxy
 */
export async function callGasApi<T = Record<string, unknown>>(
  action: string,
  userId: string,
  extraParams: Record<string, unknown> = {}
): Promise<T | null> {
  const gasUrl = getGasUrl();
  const payload = {
    action,
    user_id: userId,
    User_ID: userId,
    ...extraParams,
  };

  try {
    const res = await fetch(gasUrl, {
      method: "POST",
      headers: {
        "Content-Type": "text/plain;charset=utf-8", // text/plain prevents CORS preflight issues with GAS
      },
      body: JSON.stringify(payload),
      redirect: "follow",
    });

    if (!res.ok) {
      console.warn(`GAS API responded with status ${res.status}`);
      return null;
    }

    const data = await res.json();
    return data as T;
  } catch (error) {
    console.error("Failed to connect to Google Apps Script Web App API:", error);
    return null;
  }
}
