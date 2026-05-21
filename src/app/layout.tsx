import type { Metadata } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
  display: "swap",
});

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "World — the hub coin of 50 countries",
    template: "%s · World",
  },
  description:
    "$WORLD is the mother coin connecting 50 country sub-coins on pump.fun. Watch nations fight for the top of the global leaderboard.",
  openGraph: {
    title: "World — the hub coin of 50 countries",
    description:
      "$WORLD connects 50 country sub-coins on pump.fun. Watch nations fight for #1.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "World — the hub coin of 50 countries",
    description:
      "$WORLD connects 50 country sub-coins on pump.fun. Watch nations fight for #1.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${fraunces.variable} ${geist.variable} ${geistMono.variable}`}>
      <body className="relative min-h-screen">
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
