import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/analytics/serverCapture";
import {
  morningBriefingResponseSchema,
  type MorningBriefingResponse,
} from "@/lib/dto/morningBriefingResponse";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const authHeader = request.headers.get("authorization") ?? "";
  const secret = process.env.CRON_SECRET;

  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Gather consenting users
    const users = await prisma.user.findMany({
      where: { consentPush: true },
      select: { id: true },
    });

    const scheduled = users.length;
    if (scheduled === 0) {
      const result: MorningBriefingResponse = { scheduled: 0, sent: 0, failed: 0 };
      return NextResponse.json(result);
    }

    // OneSignal credentials
    const appId = process.env.ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
      return NextResponse.json(
        { error: "OneSignal not configured" },
        { status: 500 },
      );
    }

    // Batch push to all consenting users via external_user_ids
    const body = {
      app_id: appId,
      include_external_user_ids: users.map((u) => u.id),
      contents: {
        en: "Your morning briefing is ready – check today's recommendations.",
      },
      headings: { en: "Stock Alarm" },
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://ai-stock-alarm.vercel.app"}/`,
      ios_badgeType: "Increase",
      ios_badgeCount: 1,
    };

    const oneSignalRes = await fetch(
      "https://onesignal.com/api/v1/notifications",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Key ${apiKey}`,
        },
        body: JSON.stringify(body),
      },
    );

    const oneSignalData = await oneSignalRes.json();
    const isSuccess = oneSignalRes.ok && oneSignalData.id != null;
    const sent = isSuccess ? scheduled : 0;
    const failed = isSuccess ? 0 : scheduled;

    // Update consentPush=false for users with invalid subscriptions
    // (per REQ-FUNC-052: must not send to revoked-permission users).
    if (isSuccess && Array.isArray(oneSignalData.invalid_external_user_ids)) {
      const invalidIds: string[] = oneSignalData.invalid_external_user_ids;
      if (invalidIds.length > 0) {
        try {
          await prisma.user.updateMany({
            where: { id: { in: invalidIds } },
            data: { consentPush: false },
          });
        } catch {
          // DB update must not fail the cron response
        }
      }
    }

    // Capture server event
    try {
      await captureServerEvent("push_sent", {
        scheduled,
        sent,
        failed,
        oneSignalNotificationId: oneSignalData.id ?? null,
        invalidExternalUserIds: oneSignalData.invalid_external_user_ids?.length ?? 0,
      });
    } catch {
      // analytics must not surface 5xx
    }

    const result: MorningBriefingResponse = { scheduled, sent, failed };
    return NextResponse.json(morningBriefingResponseSchema.parse(result));
  } catch {
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
