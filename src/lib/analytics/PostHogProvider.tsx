"use client";

import { createContext, useContext, useEffect, useRef } from "react";
import posthog, { type PostHogInterface } from "posthog-js";
import { useSession } from "next-auth/react";
import type { EventName } from "../dto/posthogEvents";

// ── Context ─────────────────────────────────────────────────────────

interface PostHogContextValue {
  /** Capture a client-side event to PostHog with typed event name. */
  capture: (event: EventName, properties?: Record<string, unknown>) => void;
}

const PostHogContext = createContext<PostHogContextValue | null>(null);

/** Hook to access the PostHog capture function. */
export function usePostHog(): PostHogContextValue {
  const ctx = useContext(PostHogContext);
  if (!ctx) {
    // Return a no-op fallback for callers that are rendered outside the
    // provider (e.g. during SSR or tests without wrapping).
    return { capture: () => {} };
  }
  return ctx;
}

// ── Provider ────────────────────────────────────────────────────────

interface PostHogProviderProps {
  children: React.ReactNode;
}

/** Initializes posthog-js on the client side and identifies the current
 *  user from the NextAuth session.  Must be nested inside a SessionProvider.
 *
 *  Silently fails if NEXT_PUBLIC_POSTHOG_KEY is not set (no-op in
 *  development without env, consistent with REQ-NF-014). */
export function PostHogProvider({ children }: PostHogProviderProps) {
  const initialized = useRef(false);
  const { data: session } = useSession();

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const apiHost = process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://app.posthog.com";
    if (!apiKey) return;

    if (!initialized.current) {
      posthog.init(apiKey, {
        api_host: apiHost,
        // Disable automatic pageview capture — we control event emission.
        capture_pageview: false,
        // In development suppress the PostHog banner.
        loaded: (ph: PostHogInterface) => {
          if (process.env.NODE_ENV === "development") ph.opt_out_capturing();
        },
      });
      initialized.current = true;
    }

    // Identify / reset user identity when the session changes.
    if (session?.user?.id) {
      posthog.identify(session.user.id, {
        email: session.user.email ?? undefined,
        name: session.user.name ?? undefined,
      });
    } else {
      posthog.reset();
    }
  }, [session]);

  const capture = (event: EventName, properties?: Record<string, unknown>) => {
    try {
      posthog.capture(event, properties);
    } catch {
      // Analytics must never throw (REQ-NF-014).
    }
  };

  return (
    <PostHogContext.Provider value={{ capture }}>
      {children}
    </PostHogContext.Provider>
  );
}
