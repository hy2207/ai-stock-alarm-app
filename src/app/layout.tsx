import type { Metadata } from "next";
import Script from "next/script";
import { AppToaster } from "@/app/components/AppToaster";
import { OneSignalInit } from "@/app/components/OneSignalInit";
import "../styles/index.css";

export const metadata: Metadata = {
  title: "StockAlarm",
  description: "US Stock Risk-Adaptive Decision Interface",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
      </head>
      <body>
        {children}
        <AppToaster />
        <OneSignalInit />
      </body>
    </html>
  );
}
