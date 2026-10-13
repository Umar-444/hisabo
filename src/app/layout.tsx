import type { Metadata, Viewport } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hisabo — Split easy. Settle smart.",
  description:
    "A reliable shared-expense and balance-tracking platform for friends, roommates, and people living in shared flats or apartments.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#185CFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

import { PwaInstallPrompt } from "@/components/layout/pwa-install-prompt";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} font-sans h-full antialiased`}>
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F1F5F9] text-[#0F172A] font-sans">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
