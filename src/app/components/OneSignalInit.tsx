"use client";

import { useEffect } from "react";
import { initOneSignal } from "@/lib/push/onesignal";

export function OneSignalInit() {
  useEffect(() => {
    let cancelled = false;

    async function init() {
      // Root layout has no SessionProvider — read the session directly so
      // the OneSignal identity can be linked to our DB user id
      let userId: string | undefined;
      try {
        const res = await fetch("/api/auth/session");
        const session = (await res.json()) as { user?: { id?: string } } | null;
        userId = session?.user?.id;
      } catch {
        // Not signed in / session unavailable — init without identity
      }
      if (!cancelled) {
        initOneSignal(userId);
      }
    }

    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
