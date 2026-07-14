import type { Metadata } from "next";
import { AppToaster } from "@/app/components/AppToaster";
import { AppNav } from "@/app/components/AppNav";
import Script from "next/script";
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
      <body>
        <AppNav />
        {children}
        <AppToaster />
        <Script
          src="https://cdn.onesignal.com/sdks/web/v16/OneSignalSDK.page.js"
          strategy="afterInteractive"
        />
        <OneSignalInit />
      </body>
    </html>
  );
}
