import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import MainNav from "@/components/layout/MainNav";
import { siteMeta, getTopPageJsonLd } from "@/lib/metadata";

const GA_MEASUREMENT_ID = "G-H99ZWGWW4E";

// 構造化データ（WebSite + Organization）
const jsonLd = getTopPageJsonLd();

export const metadata: Metadata = {
  metadataBase: new URL(siteMeta.url),
  title: {
    default: siteMeta.title,
    template: `%s | ${siteMeta.siteName}`,
  },
  description: siteMeta.description,
  keywords: ["漢字", "書き順", "筆順", "日本語学習", "stroke order", "kanji", "漢字練習", "書き方"],
  authors: [{ name: siteMeta.author, url: siteMeta.url }],
  creator: siteMeta.author,
  publisher: siteMeta.publisher,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/favicon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/manifest.json",
  verification: {
    google: "NC8DjqOLbBXSoyi9iUj2-pzDWqdmEGvoNxoRzehSVBM",
  },
  openGraph: {
    title: siteMeta.title,
    description: siteMeta.description,
    url: siteMeta.url,
    siteName: siteMeta.siteName,
    locale: siteMeta.locale,
    type: "website",
    images: [
      {
        url: siteMeta.image,
        width: siteMeta.imageWidth,
        height: siteMeta.imageHeight,
        alt: siteMeta.title,
      },
    ],
  },
  twitter: {
    card: siteMeta.twitterCard,
    title: siteMeta.title,
    description: siteMeta.description,
    images: [siteMeta.image],
    creator: siteMeta.twitterCreator,
  },
  alternates: {
    canonical: siteMeta.url,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" dir="ltr" prefix="og: https://ogp.me/ns#">
      <head>
        {/* 構造化データ */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* Google Analytics 4 */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
          `}
        </Script>
      </head>
      <body className="min-h-screen antialiased bg-[#f8f7f2]">
        <MainNav />
        <main className="mx-auto max-w-[1200px] px-6 py-8">
          {children}
        </main>
        {/* フッター */}
        <footer className="text-center text-xs text-muted-foreground py-8 border-t border-border/50 mt-12">
          <p className="mb-1">書き順データ：KanjiVG (CC BY-SA 3.0) | 意味データ：KANJIDIC2 (© EDRDG) | 語彙辞書：UniDic (MIT License)</p>
          <p>© 2024 {siteMeta.siteName}</p>
          <p className="mt-4 space-x-4">
            <a href="/operation" className="underline text-muted-foreground hover:text-foreground">
              運営管理
            </a>
            <a href="/terms" className="underline text-muted-foreground hover:text-foreground">
              利用規約
            </a>
          </p>
        </footer>
      </body>
    </html>
  );
}
