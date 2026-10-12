import type { Metadata, Viewport } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        <link rel="manifest" href="/manifest.webmanifest" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className="min-h-full flex flex-col bg-[#F1F5F9] text-[#0F172A]">
        {children}
      </body>
    </html>
  );
}
