import type { Metadata } from "next";
import "../styles/index.css";
import { Providers } from "./providers";

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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
