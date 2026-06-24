import { NextRequest, NextResponse } from "next/server";
import { captureServerEvent } from "@/lib/analytics/serverCapture";
import { runPerformanceEvaluation } from "@/lib/perf/evaluatePerformance";
import { evaluatePerformanceResponseSchema } from "@/lib/dto/evaluatePerformanceResponse";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runPerformanceEvaluation();

    try {
      await captureServerEvent("performance_evaluation_run", {
        evaluated: result.evaluated,
        skipped: result.skipped,
        errors: result.errors.length,
      });
    } catch {
      // analytics must not surface 5xx
    }

    return NextResponse.json(evaluatePerformanceResponseSchema.parse(result));
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
