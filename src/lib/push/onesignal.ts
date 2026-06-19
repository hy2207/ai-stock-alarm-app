declare global {
  interface Window {
    OneSignalDeferred?: unknown[];
    OneSignal?: {
      init: (config: Record<string, unknown>) => Promise<void>;
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

export function initOneSignal(): void {
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
  });

  initialized = true;
}

export async function subscribePush(): Promise<void> {
  if (typeof window === "undefined" || !window.OneSignal) return;
  try {
    await window.OneSignal.User.PushSubscription.optIn();
  } catch {
    // user may have denied permission — silent
  }
}

export async function unsubscribePush(): Promise<void> {
  if (typeof window === "undefined" || !window.OneSignal) return;
  try {
    await window.OneSignal.User.PushSubscription.optOut();
  } catch {
    // silent
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
