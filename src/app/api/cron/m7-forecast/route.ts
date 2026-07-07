import { NextRequest, NextResponse } from "next/server";
import { captureServerEvent } from "@/lib/analytics/serverCapture";
import { runM7ForecastUpdate } from "@/lib/quant/m7Trust";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await runM7ForecastUpdate();

    try {
      await captureServerEvent("m7_forecast_update_run", {
        backfilled: result.backfilled,
        evaluated: result.evaluated,
        forecasted: result.forecasted,
        cleaned: result.cleaned,
        errors: result.errors.length,
      });
    } catch {
      // analytics must not surface 5xx
    }

    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
