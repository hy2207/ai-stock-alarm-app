"use client";

import { SessionProvider } from "next-auth/react";
import { PostHogProvider } from "@/lib/analytics/PostHogProvider";

interface ProvidersProps {
  children: React.ReactNode;
}

/** Top-level client providers wrapping the app. SessionProvider must be
 *  an ancestor of PostHogProvider (which calls useSession). */
export function Providers({ children }: ProvidersProps) {
  return (
    <SessionProvider>
      <PostHogProvider>{children}</PostHogProvider>
    </SessionProvider>
  );
}
