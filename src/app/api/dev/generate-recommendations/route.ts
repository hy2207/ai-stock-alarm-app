import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth/getServerSession";
import { generateRecommendationsForUser } from "@/lib/recommendations/generateRecommendationsForUser";

export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }
  return "Unknown error";
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
    const result = await generateRecommendationsForUser(userId);
    if (result.generatedCount > 0) {
      revalidatePath("/");
    }
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        stage: "generate_recommendations",
        message: getErrorMessage(error),
      },
      { status: 500 },
    );
  }
}
