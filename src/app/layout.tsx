import type { Metadata } from "next";
import { AppToaster } from "@/app/components/AppToaster";
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
        {children}
        <AppToaster />
      </body>
    </html>
  );
}
