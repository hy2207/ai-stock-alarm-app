"use client";

import { useState, useTransition } from "react";
import { savePushConsent } from "@/lib/actions/savePushConsent";
import { captureClientEvent } from "@/lib/analytics/posthog";
import { subscribePush, unsubscribePush } from "@/lib/push/onesignal";

interface PushConsentToggleProps {
  initialConsent: boolean;
}

export function PushConsentToggle({ initialConsent }: PushConsentToggleProps) {
  const [consent, setConsent] = useState(initialConsent);
  const [status, setStatus] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  async function handleToggle() {
    const next = !consent;
    setStatus(null);

    if (next) {
      await subscribePush();
    } else {
      await unsubscribePush();
    }

    const formData = new FormData();
    formData.set("consent", String(next));

    startTransition(async () => {
      const result = await savePushConsent(formData);
      if (result.success) {
        setConsent(next);
        await captureClientEvent("push_consent_change", { consent: next });
        setStatus(next ? "아침 브리핑 알림이 설정되었습니다." : "알림을 해제했습니다.");
      } else {
        setStatus("저장에 실패했습니다. 다시 시도해 주세요.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-900">아침 브리핑 알림</p>
          <p className="mt-0.5 text-xs text-slate-500">
            매일 아침 오늘의 추천 카드가 생성되면 알림을 받습니다.
          </p>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={consent}
          onClick={handleToggle}
          disabled={isPending}
          className={[
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
            "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            consent ? "bg-blue-600" : "bg-slate-200",
          ].join(" ")}
        >
          <span
            aria-hidden="true"
            className={[
              "pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform",
              consent ? "translate-x-5" : "translate-x-0",
            ].join(" ")}
          />
        </button>
      </div>
      {status && (
        <p className="text-xs text-slate-500">{status}</p>
      )}
    </div>
  );
}
