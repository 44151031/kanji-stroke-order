/**
 * サイト共通メタデータ
 * 全ページで統一されたブランド情報を使用するための定数
 */

export const siteMetadata = {
  siteName: "漢字書き順ナビ",
  siteUrl: "https://kanji-stroke-order.com",
  description: "漢字の正しい書き順をアニメーションで学べる無料サイト。筆順番号付きで美しい文字の練習にも最適です。",
  author: "漢字書き順ナビ",
  publisher: "漢字書き順ナビ",
  locale: "ja_JP",
  language: "ja",
  image: "/ogp.png",
  imageWidth: 1200,
  imageHeight: 630,
  twitterCard: "summary_large_image" as const,
  themeColor: "#1a1a1a",
  backgroundColor: "#f8f7f2",
} as const;

/**
 * ページ別メタデータ生成ヘルパー
 */
export function generatePageMetadata(options: {
  title: string;
  description: string;
  path?: string;
  image?: string;
}) {
  const { title, description, path = "", image = siteMetadata.image } = options;
  const url = `${siteMetadata.siteUrl}${path}`;

  return {
    title,
    description,
    authors: [{ name: siteMetadata.author, url: siteMetadata.siteUrl }],
    creator: siteMetadata.author,
    publisher: siteMetadata.publisher,
    openGraph: {
      title,
      description,
      url,
      siteName: siteMetadata.siteName,
      locale: siteMetadata.locale,
      type: "website" as const,
      images: [
        {
          url: image,
          width: siteMetadata.imageWidth,
          height: siteMetadata.imageHeight,
          alt: title,
        },
      ],
    },
    twitter: {
      card: siteMetadata.twitterCard,
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}

/**
 * 漢字詳細ページ用の構造化データ生成
 */
export function generateKanjiStructuredData(options: {
  kanji: string;
  meaning: string[];
  strokes: number;
  grade?: number;
  readings: { on: string[]; kun: string[] };
  url: string;
}) {
  const { kanji, meaning, strokes, grade, readings, url } = options;

  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: kanji,
    description: `${kanji}の書き順・筆順アニメーション。${meaning.join("、")}を意味する漢字。${strokes}画。`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "常用漢字",
    },
    url,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "画数",
        value: strokes,
      },
      ...(grade ? [{
        "@type": "PropertyValue",
        name: "学年",
        value: grade === 8 ? "中学校" : `小学${grade}年`,
      }] : []),
      ...(readings.on.length > 0 ? [{
        "@type": "PropertyValue",
        name: "音読み",
        value: readings.on.join("、"),
      }] : []),
      ...(readings.kun.length > 0 ? [{
        "@type": "PropertyValue",
        name: "訓読み",
        value: readings.kun.join("、"),
      }] : []),
    ],
  };
}



