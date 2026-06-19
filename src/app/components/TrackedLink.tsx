"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { captureClientEvent } from "@/lib/analytics/posthog";
import type { ClientEventName } from "@/lib/dto/posthogEvents";

type LinkProps = ComponentProps<typeof Link>;

interface TrackedLinkProps extends LinkProps {
  event: ClientEventName;
  eventProperties?: Record<string, string | number | boolean | null>;
}

export function TrackedLink({
  event,
  eventProperties,
  onClick,
  ...props
}: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(clickEvent) => {
        captureClientEvent(event, eventProperties);
        onClick?.(clickEvent);
      }}
    />
  );
}
