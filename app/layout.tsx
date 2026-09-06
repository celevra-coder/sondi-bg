import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteShell from "@/components/SiteShell";
import AnalysisEnhancements from "@/components/AnalysisEnhancements";
import AnalyticsConsent from "@/components/AnalyticsConsent";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "cyrillic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.sondi.bg"),

  title: {
    default: "Sondi.bg — Подземни води, геология и сондажи",
    template: "%s | Sondi.bg",
  },

  description:
    "Информационна и професионална платформа за подземни води, геология, мониторинг и сондажи в България.",

  alternates: {
    canonical: "https://www.sondi.bg",
  },

  openGraph: {
    type: "website",
    locale: "bg_BG",
    url: "https://www.sondi.bg",
    siteName: "Sondi.bg",
    title: "Sondi.bg — Подземни води, геология и сондажи",
    description:
      "Карти, данни, анализи и професионална информация за подземните води, геологията и сондажите в България.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Sondi.bg — Подземни води, геология и сондажи",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Sondi.bg — Подземни води, геология и сондажи",
    description:
      "Карти, данни, анализи и професионална информация за подземните води, геологията и сондажите в България.",
    images: ["/opengraph-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bg"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <SiteShell>{children}</SiteShell>
        <AnalysisEnhancements />
        <AnalyticsConsent />
      </body>
    </html>
  );
}