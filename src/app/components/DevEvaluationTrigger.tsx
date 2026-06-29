"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type State = "idle" | "running" | "done" | "failed";

interface EvaluateResult {
  evaluated: number;
  skipped: number;
  errors: string[];
  message?: string;
}

export function DevEvaluationTrigger({ pendingCount }: { pendingCount: number }) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");

  if (pendingCount === 0) return null;

  async function handleEvaluate() {
    if (state === "running") return;
    setState("running");

    try {
      const res = await fetch("/api/dev/evaluate-performance", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as Partial<EvaluateResult>;

      if (!res.ok) {
        toast.warning(data.message ?? "평가 요청이 실패했습니다.");
        setState("failed");
        return;
      }

      const evaluated = data.evaluated ?? 0;
      if (evaluated > 0) {
        toast.success(`${evaluated}건 평가 완료`);
        router.refresh();
        setState("done");
      } else {
        toast.info("아직 보유 기간 중인 카드는 평가할 수 없습니다.");
        setState("idle");
      }
    } catch {
      toast.warning("평가 중 오류가 발생했습니다.");
      setState("failed");
    }
  }

  return (
    <button
      type="button"
      disabled={state === "running"}
      onClick={() => void handleEvaluate()}
      className="text-sm font-medium text-blue-700 disabled:opacity-50"
    >
      {state === "running" ? "평가 중…" : "지금 평가하기"}
    </button>
  );
}
