"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type GenerationState = "idle" | "running" | "done" | "failed";

/**
 * Development helper: when the home page has no cards yet, trigger one
 * recommendation generation run and refresh once it finishes.
 */
export function DevRecommendationGenerator() {
  const router = useRouter();
  const [attempt, setAttempt] = useState(0);
  const [state, setState] = useState<GenerationState>("idle");

  useEffect(() => {
    let cancelled = false;
    setState("running");

    void (async () => {
      try {
        const response = await fetch("/api/dev/generate-recommendations", {
          method: "POST",
        });

        if (cancelled) {
          return;
        }

        if (response.status === 404) {
          setState("done");
          return;
        }

        if (!response.ok) {
          setState("failed");
          toast.warning("추천 생성 요청이 실패했습니다. 잠시 후 다시 시도해 주세요.");
          return;
        }

        const summary = await response.json();

        if (summary.generatedCount > 0) {
          toast.success(`오늘 추천 ${summary.generatedCount}건을 생성했습니다.`);
          router.refresh();
          setState("done");
          return;
        }

        if (summary.validationErrors?.length > 0) {
          toast.warning(`추천 생성 실패: ${summary.validationErrors[0]}`);
          setState("failed");
          return;
        }

        if (summary.externalApiErrors?.length > 0) {
          toast.warning(`시장 데이터 오류: ${summary.externalApiErrors[0]}`);
        }

        setState("failed");
      } catch {
        if (!cancelled) {
          setState("failed");
          toast.warning("추천 생성 중 오류가 발생했습니다.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [attempt, router]);

  if (state === "running") {
    return (
      <p className="mt-3 text-sm text-slate-500">
        관심 종목을 바탕으로 오늘 추천을 생성하는 중입니다…
      </p>
    );
  }

  if (state === "failed") {
    return (
      <button
        type="button"
        className="mt-3 text-sm font-medium text-blue-700"
        onClick={() => setAttempt((value) => value + 1)}
      >
        다시 시도
      </button>
    );
  }

  return null;
}
