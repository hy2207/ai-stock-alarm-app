"use client";

import { useEffect } from "react";
import { initOneSignal } from "@/lib/push/onesignal";

export function OneSignalInit() {
  useEffect(() => {
    initOneSignal();
  }, []);

  return null;
}
