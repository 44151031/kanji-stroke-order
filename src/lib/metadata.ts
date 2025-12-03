/**
 * SEOメタデータ管理ヘルパー
 * 全ページで統一されたメタデータ生成を行う
 */

import { Metadata } from "next";

// サイト共通メタ情報
export const siteMeta = {
  title: "漢字書き順ナビ",
  description:
    "正しい漢字の書き順・画数・部首・読み方をわかりやすく解説。入試・学習・教育現場で役立つ漢字辞典サイト。",
  url: "https://kanji-stroke-order.com",
  siteName: "漢字書き順ナビ",
  author: "漢字書き順ナビ",
  publisher: "漢字書き順ナビ",
  locale: "ja_JP",
  language: "ja",
  image: "/ogp.png",
  imageWidth: 1200,
  imageHeight: 630,
  twitterCard: "summary_large_image" as const,
};

/**
 * 漢字Unicodeスラッグを生成
 */
export function toKanjiHex(kanji: string): string {
  return kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "";
}

/**
 * 漢字ページ用メタデータ生成
 */
export function generateKanjiMetadata(
  kanji: string,
  meaning: string,
  options?: {
    strokes?: number;
    grade?: number;
    onYomi?: string[];
    kunYomi?: string[];
    jlpt?: string | null;
  }
): Metadata {
  const hex = toKanjiHex(kanji);
  const { strokes, grade, onYomi = [], kunYomi = [], jlpt } = options || {};

  // SEO最適化されたタイトル
  const title = `${kanji}の書き順（筆順）｜読み方・意味・部首・画数 | ${siteMeta.siteName}`;

  // 詳細なdescription
  const descParts = [`${kanji}（${meaning}）の正しい書き順・筆順をアニメで解説`];
  if (onYomi.length > 0) descParts.push(`音読み：${onYomi.slice(0, 3).join("、")}`);
  if (kunYomi.length > 0) descParts.push(`訓読み：${kunYomi.slice(0, 3).join("、")}`);
  if (strokes) descParts.push(`${strokes}画`);
  if (grade) {
    descParts.push(grade <= 6 ? `小学${grade}年` : "中学");
  }
  if (jlpt) descParts.push(`JLPT ${jlpt}`);

  const description = descParts.join("。") + "。";
  const canonicalUrl = `${siteMeta.url}/kanji/u${hex}`;
  const ogImageUrl = `${siteMeta.url}/api/og-kanji?k=${encodeURIComponent(kanji)}`;

  return {
    title,
    description,
    keywords: [
      kanji,
      `${kanji} 書き順`,
      `${kanji} 筆順`,
      `${kanji} 読み方`,
      `${kanji} 意味`,
      `${kanji} 画数`,
      ...onYomi,
      ...kunYomi,
    ],
    authors: [{ name: siteMeta.author, url: siteMeta.url }],
    creator: siteMeta.author,
    publisher: siteMeta.publisher,
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      siteName: siteMeta.siteName,
      locale: siteMeta.locale,
      images: [
        {
          url: ogImageUrl,
          width: siteMeta.imageWidth,
          height: siteMeta.imageHeight,
          alt: `${kanji}の書き順`,
        },
      ],
    },
    twitter: {
      card: siteMeta.twitterCard,
      title,
      description,
      images: [ogImageUrl],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * 汎用ページ用メタデータ生成
 */
export function generatePageMetadata(options: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const {
    title,
    description,
    path = "",
    image = siteMeta.image,
    type = "website",
  } = options;
  const canonicalUrl = `${siteMeta.url}${path}`;

  return {
    title: `${title} | ${siteMeta.siteName}`,
    description,
    authors: [{ name: siteMeta.author, url: siteMeta.url }],
    creator: siteMeta.author,
    publisher: siteMeta.publisher,
    openGraph: {
      title: `${title} | ${siteMeta.siteName}`,
      description,
      url: canonicalUrl,
      siteName: siteMeta.siteName,
      locale: siteMeta.locale,
      type,
      images: [
        {
          url: image.startsWith("http") ? image : `${siteMeta.url}${image}`,
          width: siteMeta.imageWidth,
          height: siteMeta.imageHeight,
          alt: title,
        },
      ],
    },
    twitter: {
      card: siteMeta.twitterCard,
      title: `${title} | ${siteMeta.siteName}`,
      description,
      images: [image.startsWith("http") ? image : `${siteMeta.url}${image}`],
    },
    alternates: {
      canonical: canonicalUrl,
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

/**
 * 学年ページ用メタデータ生成
 */
export function generateGradeMetadata(grade: number): Metadata {
  const gradeLabel = grade <= 6 ? `小学${grade}年生` : "中学校";
  return generatePageMetadata({
    title: `${gradeLabel}で習う漢字一覧`,
    description: `${gradeLabel}で習う漢字の書き順・読み方・意味を一覧で学習。教科書に出てくる漢字を完全網羅。`,
    path: `/grade/${grade}`,
  });
}

/**
 * 画数ページ用メタデータ生成
 */
export function generateStrokesMetadata(strokes: number): Metadata {
  return generatePageMetadata({
    title: `${strokes}画の漢字一覧`,
    description: `画数が${strokes}画の漢字一覧。書き順・読み方・意味を解説。画数から漢字を検索できます。`,
    path: `/strokes/${strokes}`,
  });
}

/**
 * 部首ページ用メタデータ生成
 */
export function generateRadicalMetadata(
  radicalJp: string,
  radicalEn: string
): Metadata {
  return generatePageMetadata({
    title: `${radicalJp}（${radicalEn}）の漢字一覧`,
    description: `部首「${radicalJp}」を持つ漢字の一覧。書き順・読み方・意味を解説。部首から漢字を検索できます。`,
    path: `/radical/${radicalEn}`,
  });
}

