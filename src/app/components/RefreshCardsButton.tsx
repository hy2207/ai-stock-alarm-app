"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type State = "idle" | "running";

interface GenerationSummary {
  generatedCount?: number;
  validationErrors?: string[];
  externalApiErrors?: string[];
  message?: string;
}

export function RefreshCardsButton() {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");

  async function handleRefresh() {
    if (state === "running") return;
    setState("running");

    try {
      const res = await fetch("/api/dev/generate-recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ force: true }),
      });

      const data = (await res.json().catch(() => ({}))) as GenerationSummary;

      if (!res.ok) {
        toast.warning(data.message ?? "카드 재생성에 실패했습니다.");
        setState("idle");
        return;
      }

      const count = data.generatedCount ?? 0;
      if (count > 0) {
        toast.success(`오늘 추천 ${count}건을 새로 생성했습니다.`);
        router.refresh();
      } else {
        const reason =
          data.validationErrors?.[0] ??
          data.externalApiErrors?.[0] ??
          "시장 신호가 불분명해 재생성하지 않았습니다.";
        toast.info(reason);
        setState("idle");
      }
    } catch {
      toast.warning("네트워크 오류가 발생했습니다.");
      setState("idle");
    }
  }

  return (
    <button
      type="button"
      disabled={state === "running"}
      onClick={() => void handleRefresh()}
      className="text-xs text-slate-400 hover:text-slate-600 disabled:opacity-50"
      title="오늘 날짜 기준으로 카드를 새로 생성합니다"
    >
      {state === "running" ? "생성 중…" : "새로 생성"}
    </button>
  );
}
