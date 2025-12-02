import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import MainNav from "@/components/layout/MainNav";

const GA_MEASUREMENT_ID = "G-H99ZWGWW4E";
const SITE_URL = "https://kanji-stroke-order.com";

// 構造化データ（WebSite + Organization）
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: "漢字書き順",
      description: "漢字・ひらがな・カタカナの書き順をアニメーションで学べるサイト",
      inLanguage: "ja",
      potentialAction: {
        "@type": "SearchAction",
        target: `${SITE_URL}/search?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: "漢字書き順運営事務局",
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/favicon-512.png`,
      },
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "漢字書き順 | Kanji Stroke Order",
    template: "%s | 漢字書き順",
  },
  description: "漢字・ひらがな・カタカナの書き順をアニメーションで学べるサイト。正しい筆順を視覚的に確認できます。",
  keywords: ["漢字", "書き順", "筆順", "ひらがな", "カタカナ", "日本語学習", "stroke order", "kanji"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-512.png", type: "image/png", sizes: "512x512" },
    ],
    apple: [
      { url: "/favicon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  verification: {
    google: "NC8DjqOLbBXSoyi9iUj2-pzDWqdmEGvoNxoRzehSVBM",
  },
  openGraph: {
    title: "漢字書き順 | Kanji Stroke Order",
    description: "漢字・ひらがな・カタカナの書き順をアニメーションで学べるサイト",
    type: "website",
    locale: "ja_JP",
    siteName: "漢字書き順",
  },
  twitter: {
    card: "summary_large_image",
    title: "漢字書き順 | Kanji Stroke Order",
    description: "漢字・ひらがな・カタカナの書き順をアニメーションで学べるサイト",
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
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
            gtag('config', '${GA_MEASUREMENT_ID}');
          `}
        </Script>
      </head>
      <body className="min-h-screen antialiased bg-[#f8f7f2]">
        <MainNav />
        <main className="mx-auto max-w-[1200px] px-6 py-8">
          {children}
        </main>
        {/* ライセンス表記 */}
        <footer className="text-center text-xs text-muted-foreground py-8 border-t border-border/50 mt-12">
          <p className="mb-1">書き順データ：KanjiVG (CC BY-SA 3.0) | 意味データ：KANJIDIC2 (© EDRDG) | 語彙辞書：UniDic (MIT License)</p>
          <p>© 2024 漢字書き順運営事務局</p>
        </footer>
      </body>
    </html>
  );
}
