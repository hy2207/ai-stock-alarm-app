import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { captureServerEvent } from "@/lib/analytics/serverCapture";
import {
  morningBriefingResponseSchema,
  type MorningBriefingResponse,
} from "@/lib/dto/morningBriefingResponse";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

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

    // OneSignal credentials — the client SDK uses the NEXT_PUBLIC_ name,
    // so fall back to it rather than requiring a duplicate env var
    const appId =
      process.env.ONESIGNAL_APP_ID ?? process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
    const apiKey = process.env.ONESIGNAL_REST_API_KEY;

    if (!appId || !apiKey) {
      return NextResponse.json(
        { error: "OneSignal not configured" },
        { status: 500 },
      );
    }

    // Batch push targeted by external_id (our DB user id, linked by the
    // client via OneSignal.login). include_aliases is the current API;
    // include_external_user_ids is deprecated on new OneSignal apps.
    const body = {
      app_id: appId,
      include_aliases: { external_id: users.map((u) => u.id) },
      target_channel: "push",
      contents: {
        en: "Your morning briefing is ready – check today's recommendations.",
      },
      headings: { en: "Stock Alarm" },
      url: `${process.env.NEXT_PUBLIC_APP_URL ?? "https://ai-stock-alarm.vercel.app"}/`,
      ios_badgeType: "Increase",
      ios_badgeCount: 1,
    };

    const oneSignalRes = await fetch("https://api.onesignal.com/notifications", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Key ${apiKey}`,
      },
      body: JSON.stringify(body),
    });

    const oneSignalData = await oneSignalRes.json();
    const isSuccess = oneSignalRes.ok && oneSignalData.id != null;
    const sent = isSuccess ? scheduled : 0;
    const failed = isSuccess ? 0 : scheduled;
    const invalidExternalUserIds = Array.isArray(oneSignalData.invalid_external_user_ids)
      ? oneSignalData.invalid_external_user_ids.filter(
          (id: unknown): id is string => typeof id === "string" && id.length > 0,
        )
      : [];

    if (isSuccess && invalidExternalUserIds.length > 0) {
      try {
        await prisma.user.updateMany({
          where: { id: { in: invalidExternalUserIds } },
          data: { consentPush: false },
        });
      } catch {
        // Revocation sync failures should be observable, but must not fail cron.
      }
    }

    // Capture server event
    try {
      await captureServerEvent("push_sent", {
        scheduled,
        sent,
        failed,
        oneSignalNotificationId: oneSignalData.id ?? null,
        invalidExternalUserIds: invalidExternalUserIds.length,
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
