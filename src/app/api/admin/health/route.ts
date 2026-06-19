import { NextResponse } from "next/server";
import { buildHealthResponse } from "@/lib/admin/health";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  return NextResponse.json(buildHealthResponse());
}
