"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type State = "loading" | "failed";

interface GenerationSummary {
  generatedCount?: number;
  validationErrors?: string[];
  externalApiErrors?: string[];
  message?: string;
  error?: string;
}

const TIMEOUT_MS = 55_000;

export function TodayCardAutoLoader() {
  const router = useRouter();
  const [state, setState] = useState<State>("loading");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

    async function run() {
      try {
        const res = await fetch("/api/dev/generate-recommendations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({}),
          signal: controller.signal,
        });

        const data = (await res.json().catch(() => ({}))) as GenerationSummary;

        if (!res.ok) {
          setErrorMessage(
            data.message ??
              data.error ??
              "추천 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.",
          );
          setState("failed");
          return;
        }

        const count = data.generatedCount ?? 0;
        if (count > 0) {
          router.refresh();
          return;
        }

        // generatedCount === 0 — no_call from LLM or skipped
        const reason =
          data.validationErrors?.[0] ??
          data.externalApiErrors?.[0] ??
          "오늘 시장 신호가 명확하지 않아 추천을 생성하지 않았습니다.";
        setErrorMessage(reason);
        setState("failed");
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") {
          setErrorMessage(
            "추천 생성 요청 시간이 초과됐습니다. 다시 시도해 주세요.",
          );
        } else {
          setErrorMessage("네트워크 오류가 발생했습니다.");
        }
        setState("failed");
      } finally {
        clearTimeout(timer);
      }
    }

    void run();
    return () => {
      controller.abort();
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [attempt]);

  if (state === "loading") {
    return (
      <div className="mt-6 flex flex-col items-center gap-3">
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
          오늘 관심 종목을 분석하는 중입니다…
        </div>
        <p className="text-xs text-slate-400">시장 데이터와 AI 분석에 약 20–40초 소요됩니다.</p>
      </div>
    );
  }

  return (
    <div className="mt-6 flex flex-col items-center gap-3 text-center">
      {errorMessage && (
        <p className="max-w-xs text-sm text-slate-600">{errorMessage}</p>
      )}
      <button
        type="button"
        onClick={() => {
          setState("loading");
          setErrorMessage(null);
          setAttempt((n) => n + 1);
        }}
        className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white hover:bg-blue-500"
      >
        다시 시도
      </button>
    </div>
  );
}
