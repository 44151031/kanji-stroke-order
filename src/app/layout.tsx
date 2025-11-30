import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "漢字書き順 | Kanji Stroke Order",
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
  openGraph: {
    title: "漢字書き順 | Kanji Stroke Order",
    description: "漢字・ひらがな・カタカナの書き順をアニメーションで学べるサイト",
    type: "website",
    locale: "ja_JP",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="min-h-screen antialiased">
        <main className="mx-auto max-w-[1200px] px-6 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}
