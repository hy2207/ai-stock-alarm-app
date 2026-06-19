"use client";

import { useEffect } from "react";
import { captureClientEvent } from "@/lib/analytics/posthog";
import type { ClientEventName } from "@/lib/dto/posthogEvents";

interface PostHogEventProps {
  event: ClientEventName;
  properties?: Record<string, string | number | boolean | null>;
}

export function PostHogEvent({ event, properties }: PostHogEventProps) {
  useEffect(() => {
    captureClientEvent(event, properties);
  }, [event, properties]);

  return null;
}
