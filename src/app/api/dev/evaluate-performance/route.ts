import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { runPerformanceEvaluation } from "@/lib/perf/evaluatePerformance";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(): Promise<NextResponse> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized", stage: "auth_session" },
      { status: 401 },
    );
  }

  try {
    const result = await runPerformanceEvaluation();
    if (result.evaluated > 0) {
      revalidatePath("/archive");
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
