import posthog from "posthog-js";

let initialized = false;

function getApiKey(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "";
}

function getApiHost(): string {
  return process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";
}

export function initPostHog() {
  if (initialized || typeof window === "undefined") return;
  if (!getApiKey()) return;
  posthog.init(getApiKey(), {
    api_host: getApiHost(),
    capture_pageview: false,
    capture_pageleave: false,
  });
  initialized = true;
}

export function identifyUser(userId: string, properties?: Record<string, unknown>) {
  if (!initialized) initPostHog();
  posthog.identify(userId, properties);
}

export function captureClientEvent(
  event: string,
  properties?: Record<string, unknown>,
) {
  if (!initialized) initPostHog();
  posthog.capture(event, properties);
}

export function resetUser() {
  posthog.reset();
}
