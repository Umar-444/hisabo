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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://hisabo.app"),
  title: "Hisabo — Split easy. Settle smart.",
  description:
    "A reliable shared-expense and balance-tracking platform for friends, roommates, and people living in shared flats or apartments.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-touch-icon.png",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Hisabo",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://hisabo.app",
    siteName: "Hisabo",
    title: "Hisabo — Split easy. Settle smart.",
    description:
      "A reliable shared-expense and balance-tracking platform for friends, roommates, and people living in shared flats or apartments.",
    images: [
      {
        url: "/icon.svg",
        width: 512,
        height: 512,
        alt: "Hisabo Logo",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Hisabo — Split easy. Settle smart.",
    description:
      "A reliable shared-expense and balance-tracking platform for friends, roommates, and people living in shared flats or apartments.",
    images: ["/icon.svg"],
  },
};

export const viewport: Viewport = {
  themeColor: "#185CFF",
  width: "device-width",
  initialScale: 1,
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
        <meta name="mobile-web-app-capable" content="yes" />
        {/* Apple iOS Splash Screens */}
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1290-2796.png"
          media="(device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1179-2556.png"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1284-2778.png"
          media="(device-width: 428px) and (device-height: 926px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1170-2532.png"
          media="(device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1125-2436.png"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-750-1334.png"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-2048-2732.png"
          media="(device-width: 1024px) and (device-height: 1366px) and (-webkit-device-pixel-ratio: 2)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/splash/apple-splash-1668-2388.png"
          media="(device-width: 834px) and (device-height: 1194px) and (-webkit-device-pixel-ratio: 2)"
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#F1F5F9] text-[#0F172A] font-sans">
        {children}
        <PwaInstallPrompt />
      </body>
    </html>
  );
}
