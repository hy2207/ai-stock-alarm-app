"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type GenerationState = "idle" | "running" | "done" | "failed";

type GenerationSummary = {
  generatedCount?: number;
  validationErrors?: string[];
  externalApiErrors?: string[];
  error?: string;
  stage?: string;
  message?: string;
  hint?: string;
};

async function readGenerationSummary(response: Response): Promise<GenerationSummary> {
  try {
    return (await response.json()) as GenerationSummary;
  } catch {
    return {};
  }
}

function firstFailureMessage(summary: GenerationSummary, fallback: string) {
  return (
    summary.validationErrors?.[0] ??
    summary.externalApiErrors?.[0] ??
    summary.hint ??
    summary.message ??
    summary.error ??
    fallback
  );
}

/**
 * Development helper: when the home page has no cards yet, trigger one
 * recommendation generation run and refresh once it finishes.
 */
export function DevRecommendationGenerator() {
  const router = useRouter();
  const [state, setState] = useState<GenerationState>("idle");
  const [failureMessage, setFailureMessage] = useState<string | null>(null);

  async function handleGenerate() {
    if (state === "running") {
      return;
    }

    setState("running");
    setFailureMessage(null);

    try {
      const response = await fetch("/api/dev/generate-recommendations", {
        method: "POST",
      });

      if (response.status === 404) {
        setState("done");
        return;
      }

      if (!response.ok) {
        const summary = await readGenerationSummary(response);
        const message = firstFailureMessage(
          summary,
          "추천 생성 요청이 실패했습니다. 잠시 후 다시 시도해 주세요.",
        );
        setState("failed");
        setFailureMessage(message);
        toast.warning(message);
        return;
      }

      const summary = await readGenerationSummary(response);

      const generatedCount = summary.generatedCount ?? 0;
      const validationErrors = summary.validationErrors ?? [];
      const externalApiErrors = summary.externalApiErrors ?? [];

      if (generatedCount > 0) {
        toast.success(`오늘 추천 ${generatedCount}건을 생성했습니다.`);
        router.refresh();
        setState("done");
        return;
      }

      if (validationErrors.length > 0) {
        const message = `추천 생성 실패: ${validationErrors[0]}`;
        setFailureMessage(message);
        toast.warning(message);
        setState("failed");
        return;
      }

      if (externalApiErrors.length > 0) {
        const message = `시장 데이터 오류: ${externalApiErrors[0]}`;
        setFailureMessage(message);
        toast.warning(message);
      }

      setFailureMessage("추천 카드가 생성되지 않았습니다. 설정과 API 응답을 확인해 주세요.");
      setState("failed");
    } catch {
      const message = "추천 생성 중 오류가 발생했습니다.";
      setState("failed");
      setFailureMessage(message);
      toast.warning(message);
    }
  }

  if (state === "idle") {
    return (
      <button
        type="button"
        className="mt-3 text-sm font-medium text-blue-700"
        onClick={() => void handleGenerate()}
      >
        추천 생성하기
      </button>
    );
  }

  if (state === "running") {
    return (
      <p className="mt-3 text-sm text-slate-500">
        관심 종목을 바탕으로 오늘 추천을 생성하는 중입니다…
      </p>
    );
  }

  if (state === "failed") {
    return (
      <div className="mt-3 space-y-2 text-center text-sm">
        {failureMessage && (
          <p className="text-slate-600">
            {failureMessage}
          </p>
        )}
        <button
          type="button"
          className="font-medium text-blue-700"
          onClick={() => void handleGenerate()}
        >
          다시 시도
        </button>
      </div>
    );
  }

  return null;
}
