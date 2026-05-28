import { PostHog } from "posthog-node";
import {
  type ServerEventName,
  type PosthogEventProperties,
  serverEventNameSchema,
} from "../dto/posthogEvents";

let _client: PostHog | null = null;

function getClient(): PostHog | null {
  const apiKey = process.env.POSTHOG_API_KEY;
  if (!apiKey) return null;
  if (!_client) {
    _client = new PostHog(apiKey, {
      host: process.env.POSTHOG_HOST ?? "https://app.posthog.com",
    });
  }
  return _client;
}

/** Capture a server-side event to PostHog.
 *
 *  Silently tolerates failures — analytics must never surface a 5xx to the
 *  user (REQ-NF-014).  If POSTHOG_API_KEY is unset, the call is a no-op.
 */
export async function captureServerEvent(
  event: ServerEventName,
  properties?: PosthogEventProperties,
  distinctId: string = "system",
): Promise<void> {
  const parseResult = serverEventNameSchema.safeParse(event);
  if (!parseResult.success) {
    console.warn(`[analytics] Invalid server event name: ${event}`);
    return;
  }

  const client = getClient();
  if (!client) return;

  try {
    client.capture({
      distinctId,
      event: parseResult.data,
      properties: {
        ...properties,
        $source: "server",
        environment: process.env.VERCEL_ENV ?? "development",
      },
    });
    // Flush immediately for reliability in serverless context.
    await client.flush();
  } catch (err) {
    console.warn("[analytics] Failed to capture server event:", err);
  }
}

/** Gracefully shut down the PostHog client (call during app shutdown). */
export async function shutdownAnalytics(): Promise<void> {
  if (_client) {
    await _client.shutdown();
    _client = null;
  }
}
