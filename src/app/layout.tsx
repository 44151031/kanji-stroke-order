import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import MainNav from "@/components/layout/MainNav";

const GA_MEASUREMENT_ID = "G-H99ZWGWW4E";
const SITE_URL = "https://kanji-stroke-order.com";
const SITE_NAME = "漢字書き順ナビ";

// 構造化データ（WebSite + Organization）
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: "漢字の正しい書き順をアニメーションで学べる無料サイト。筆順番号付きで美しい文字の練習にも最適です。",
      inLanguage: "ja-JP",
      publisher: {
        "@id": `${SITE_URL}/#organization`,
      },
      potentialAction: {
        "@type": "SearchAction",
        target: {
          "@type": "EntryPoint",
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/ogp.png`,
        width: 1200,
        height: 630,
      },
      sameAs: [],
    },
    {
      "@type": "WebPage",
      "@id": `${SITE_URL}/#webpage`,
      url: SITE_URL,
      name: SITE_NAME,
      isPartOf: {
        "@id": `${SITE_URL}/#website`,
      },
      about: {
        "@type": "Thing",
        name: "漢字学習",
      },
      description: "漢字の正しい書き順をアニメーションで学べる無料サイト。",
      inLanguage: "ja-JP",
    },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SITE_NAME,
    template: `%s | ${SITE_NAME}`,
  },
  description: "漢字の正しい書き順をアニメーションで学べる無料サイト。筆順番号付きで美しい文字の練習にも最適です。",
  keywords: ["漢字", "書き順", "筆順", "日本語学習", "stroke order", "kanji", "漢字練習", "書き方"],
  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
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
    title: SITE_NAME,
    description: "漢字の正しい書き順をアニメーションで学べる無料サイト。筆順番号付きで美しい文字の練習にも最適です。",
    url: SITE_URL,
    siteName: SITE_NAME,
    locale: "ja_JP",
    type: "website",
    images: [
      {
        url: "/ogp.png",
        width: 1200,
        height: 630,
        alt: SITE_NAME,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: "漢字の正しい書き順をアニメーションで学べる無料サイト。",
    images: ["/ogp.png"],
  },
  alternates: {
    canonical: SITE_URL,
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
        {/* フッター */}
        <footer className="text-center text-xs text-muted-foreground py-8 border-t border-border/50 mt-12">
          <p className="mb-1">書き順データ：KanjiVG (CC BY-SA 3.0) | 意味データ：KANJIDIC2 (© EDRDG) | 語彙辞書：UniDic (MIT License)</p>
          <p>© 2024 {SITE_NAME}</p>
        </footer>
      </body>
    </html>
  );
}
