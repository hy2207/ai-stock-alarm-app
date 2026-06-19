let posthogClient: typeof import("posthog-js").default | null = null;
let posthogLoadPromise: Promise<typeof import("posthog-js").default | null> | null = null;

function getApiKey(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
}

function getApiHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";
}

async function loadPostHog() {
  if (posthogClient) return posthogClient;
  if (typeof window === "undefined" || !getApiKey()) return null;

  posthogLoadPromise ??= import("posthog-js").then(({ default: posthog }) => {
    posthog.init(getApiKey(), {
      api_host: getApiHost(),
      capture_pageview: false,
      capture_pageleave: false,
    });
    posthogClient = posthog;
    return posthog;
  });

  return posthogLoadPromise;
}

export function initPostHog() {
  return loadPostHog().then(() => undefined);
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  return loadPostHog().then((posthog) => {
    posthog?.identify(userId, properties);
  });
}

export function captureClientEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  return loadPostHog().then((posthog) => {
    posthog?.capture(event, properties);
  });
}

export function resetUser() {
  return loadPostHog().then((posthog) => {
    posthog?.reset();
  });
}
