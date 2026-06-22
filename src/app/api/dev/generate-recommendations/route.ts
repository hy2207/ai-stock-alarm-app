import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { generateRecommendationsForUser } from "@/lib/recommendations/generateRecommendationsForUser";

export const dynamic = "force-dynamic";

const DEV_GENERATION_TIMEOUT_MS = 30_000;

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

export async function POST(): Promise<NextResponse> {
  if (process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const userId = await getCurrentUserId();
  if (!userId) {
    return NextResponse.json(
      {
        error: "Unauthorized",
        stage: "auth_session",
        hint:
          "Clear localhost:3000 cookies and sign in again if NEXTAUTH_SECRET changed.",
      },
      { status: 401 },
    );
  }

  try {
    const result = await runWithTimeout(generateRecommendationsForUser(userId));
    if (result.generatedCount > 0) {
      revalidatePath("/");
    }
    return NextResponse.json(result);
  } catch (error) {
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
