import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { waitUntil } from "@vercel/functions";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { generateRecommendationsForUser } from "@/lib/recommendations/generateRecommendationsForUser";

export const dynamic = "force-dynamic";
// Matches the cron route — generation may legitimately exceed 60s, and a
// killed function loses work that runWithTimeout deliberately lets finish
// in the background after responding to the client.
export const maxDuration = 300;

const DEV_GENERATION_TIMEOUT_MS = 90_000;

class DevGenerationTimeoutError extends Error {
  constructor() {
    super(
      `Recommendation generation timed out after ${DEV_GENERATION_TIMEOUT_MS}ms`,
    );
    this.name = "TimeoutError";
  }
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
}

function getErrorStage(error: unknown) {
  if (error instanceof DevGenerationTimeoutError) {
    return "generation_timeout";
  }
  return "generate_recommendations";
}

async function runWithTimeout<T>(task: Promise<T>): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new DevGenerationTimeoutError());
    }, DEV_GENERATION_TIMEOUT_MS);
  });

  try {
    return await Promise.race([task, timeout]);
  } finally {
    clearTimeout(timeoutId!);
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      { error: "Unauthorized", stage: "auth_session" },
      { status: 401 },
    );
  }

  let force = false;
  try {
    const body = (await request.json().catch(() => ({}))) as { force?: boolean };
    force = body.force === true;
  } catch {
    // no body — use default
  }

  const task = generateRecommendationsForUser(userId, { force });

  try {
    const result = await runWithTimeout(task);
    if (result.generatedCount > 0) {
      revalidatePath("/today");
    }
    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof DevGenerationTimeoutError) {
      // Without waitUntil, Vercel suspends the function once the response
      // is sent and the in-flight generation never persists its cards.
      // Keeping it alive lets the client's refresh polling pick them up.
      waitUntil(task.catch(() => undefined));
    }
    return NextResponse.json(
      {
        error: "Internal server error",
        stage: getErrorStage(error),
        message: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
