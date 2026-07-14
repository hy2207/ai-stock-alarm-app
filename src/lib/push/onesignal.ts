declare global {
  interface Window {
    OneSignalDeferred?: unknown[];
    OneSignal?: {
      init: (config: Record<string, unknown>) => Promise<void>;
      login: (externalId: string) => Promise<void>;
      User: {
        PushSubscription: {
          getIdAsync: () => Promise<string | undefined>;
          optIn: () => Promise<void>;
          optOut: () => Promise<void>;
        };
      };
    };
  }
}

let initialized = false;

function getAppId(): string | undefined {
  return process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
}

function getSafariWebId(): string | undefined {
  return process.env.NEXT_PUBLIC_ONESIGNAL_SAFARI_WEB_ID;
}

export function initOneSignal(externalUserId?: string): void {
  if (initialized || typeof window === "undefined") return;
  const appId = getAppId();
  if (!appId) return;

  window.OneSignalDeferred = window.OneSignalDeferred || [];

  window.OneSignalDeferred.push(async function (OneSignal: Window["OneSignal"]) {
    if (!OneSignal) return;
    const config: Record<string, unknown> = { appId };
    const safariWebId = getSafariWebId();
    if (safariWebId) {
      config.safari_web_id = safariWebId;
    }
    await OneSignal.init(config);
    // The morning-briefing cron targets users by external_id (our DB user
    // id) — without this link every send reaches zero devices
    if (externalUserId) {
      await OneSignal.login(externalUserId);
    }
  });

  initialized = true;
}

/** Returns true if the subscription request was sent, false if OneSignal is not ready. */
export async function subscribePush(): Promise<boolean> {
  if (typeof window === "undefined" || !window.OneSignal) return false;
  try {
    await window.OneSignal.User.PushSubscription.optIn();
    return true;
  } catch {
    return false;
  }
}

/** Returns true if the unsubscribe request was sent, false if OneSignal is not ready. */
export async function unsubscribePush(): Promise<boolean> {
  if (typeof window === "undefined" || !window.OneSignal) return false;
  try {
    await window.OneSignal.User.PushSubscription.optOut();
    return true;
  } catch {
    return false;
  }
}

export async function getPushSubscriptionId(): Promise<string | undefined> {
  if (typeof window === "undefined" || !window.OneSignal) return undefined;
  try {
    return await window.OneSignal.User.PushSubscription.getIdAsync();
  } catch {
    return undefined;
  }
}
