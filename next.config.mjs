/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      // PUSH_DISABLED: restore https://cdn.onesignal.com https://onesignal.com to script-src when re-enabling push
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://us-assets.i.posthog.com",
      // PUSH_DISABLED: restore blob: https://cdn.onesignal.com to worker-src when re-enabling push
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self'",
      [
        "connect-src 'self'",
        "https://us-assets.i.posthog.com",
        "https://us.i.posthog.com",
        "https://app.posthog.com",
        // PUSH_DISABLED: restore https://onesignal.com https://api.onesignal.com when re-enabling push
        "https://accounts.google.com",
        "https://oauth2.googleapis.com",
      ].join(" "),
      "frame-src https://accounts.google.com",
      "form-action 'self' https://accounts.google.com",
    ].join("; "),
  },
];

const nextConfig = {
  reactStrictMode: true,
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
