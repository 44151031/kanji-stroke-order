// ============================================
// 🧭 共通サイトメタ情報
// ============================================
import { Metadata } from "next";

export const siteMeta = {
  title: "漢字書き順ナビ",
  description:
    "正しい漢字の書き順・画数・部首・読み方をわかりやすく解説。入試・学習・教育現場で役立つ漢字辞典サイト。",
  url: "https://kanji-stroke-order.com",
  siteName: "漢字書き順ナビ",
  author: "漢字書き順ナビ",
  publisher: "漢字書き順ナビ",
  locale: "ja_JP",
  image: "/ogp.png",
  imageWidth: 1200,
  imageHeight: 630,
  twitterCard: "summary_large_image" as const,
  twitterCreator: "@kanji_stroke_order", // Twitterアカウント（未登録の場合は空文字可）
  logo: "/ogp.png",
};

// ============================================
// ⚙️ ユーティリティ
// ============================================
export function toKanjiHex(kanji: string): string {
  return kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "";
}

// ============================================
// 📋 メタデータ共通部
// ============================================
export const baseMeta = {
  authors: [{ name: siteMeta.author, url: siteMeta.url }],
  creator: siteMeta.author,
  publisher: siteMeta.publisher,
  robots: { index: true, follow: true },
};

// ============================================
// 🏠 トップページ用メタデータ＆構造化データ
// ============================================
export function generateTopPageMetadata(): Metadata {
  const { title, description, url, image, siteName, locale, twitterCard, twitterCreator } = siteMeta;

  return {
    title,
    description,
    ...baseMeta,
    openGraph: {
      title,
      description,
      url,
      siteName,
      locale,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: twitterCard,
      title,
      description,
      images: [image],
      creator: twitterCreator,
    },
    alternates: { canonical: url },
  };
}

/**
 * トップページ構造化データ
 * （WebSite / Organization / WebPage）
 */
export function getTopPageJsonLd() {
  const { url, siteName, description, logo } = siteMeta;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: siteName,
        description,
        inLanguage: "ja-JP",
        publisher: { "@id": `${url}/#organization` },
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${url}/search?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: siteName,
        url,
        logo: {
          "@type": "ImageObject",
          url: `${url}${logo}`,
          width: 1200,
          height: 630,
        },
      },
      {
        "@type": ["WebPage", "CollectionPage"],
        "@id": `${url}/#webpage`,
        url,
        name: siteName,
        isPartOf: { "@id": `${url}/#website` },
        description,
        inLanguage: "ja-JP",
      },
    ],
  };
}

// ============================================
// 🈶 漢字ページメタデータ＆構造化データ
// ============================================
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

  const title = `${kanji}の書き順（筆順）｜読み方・意味・部首・画数 | ${siteMeta.siteName}`;
  const descParts = [`${kanji}（${meaning}）の正しい書き順・筆順をアニメで解説`];
  if (onYomi.length > 0) descParts.push(`音読み：${onYomi.slice(0, 3).join("、")}`);
  if (kunYomi.length > 0) descParts.push(`訓読み：${kunYomi.slice(0, 3).join("、")}`);
  if (strokes) descParts.push(`${strokes}画`);
  if (grade) descParts.push(grade <= 6 ? `小学${grade}年` : "中学");
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
    ...baseMeta,
    openGraph: {
      title,
      description,
      type: "article",
      url: canonicalUrl,
      siteName: siteMeta.siteName,
      locale: siteMeta.locale,
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: `${kanji}の書き順` }],
    },
    twitter: {
      card: siteMeta.twitterCard,
      title,
      description,
      images: [ogImageUrl],
      creator: siteMeta.twitterCreator,
    },
    alternates: { canonical: canonicalUrl },
  };
}

/**
 * 漢字ページ構造化データ（JSON-LD）
 */
export function getKanjiJsonLd(kanji: string, meaning: string, strokes: number) {
  const hex = toKanjiHex(kanji);
  const { url, siteName } = siteMeta;

  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: `${kanji} の書き順`,
    alternateName: "漢字書き順ナビ",
    description: `${kanji}（${meaning}）の正しい書き順・画数・部首・読み方を解説します。`,
    inLanguage: "ja",
    url: `${url}/kanji/u${hex}`,
    keywords: "書き順,漢字,筆順,部首,画数",
    additionalType: "https://schema.org/EducationalOccupationalCredential",
    contentRating: "G",
    usageInfo: `${strokes}画`,
    license: "https://creativecommons.org/licenses/by-sa/3.0/",
    copyrightHolder: {
      "@type": "Organization",
      name: siteName,
      url: url,
    },
    about: [
      { "@type": "Thing", name: "漢字" },
      { "@type": "Thing", name: "書き順" },
      { "@type": "Thing", name: "筆順" },
    ],
  };
}

// ============================================
// 📄 汎用ページ用メタデータ生成
// ============================================
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
    ...baseMeta,
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
      creator: siteMeta.twitterCreator,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };
}

// ============================================
// 📚 学年ページ用メタデータ生成
// ============================================
export function generateGradeMetadata(grade: number): Metadata {
  const gradeLabel = grade <= 6 ? `小学${grade}年生` : "中学校";
  return generatePageMetadata({
    title: `${gradeLabel}で習う漢字一覧`,
    description: `${gradeLabel}で習う漢字の書き順・読み方・意味を一覧で学習。教科書に出てくる漢字を完全網羅。`,
    path: `/grade/${grade}`,
  });
}

// ============================================
// ✏️ 画数ページ用メタデータ生成
// ============================================
export function generateStrokesMetadata(strokes: number): Metadata {
  return generatePageMetadata({
    title: `${strokes}画の漢字一覧`,
    description: `画数が${strokes}画の漢字一覧。書き順・読み方・意味を解説。画数から漢字を検索できます。`,
    path: `/strokes/${strokes}`,
  });
}

// ============================================
// 🔤 部首ページ用メタデータ生成
// ============================================
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

// ============================================
// 🔄 JSON-LD一括返却ユーティリティ
// ============================================
/**
 * 漢字ページ用メタデータとJSON-LD構造化データを一括生成
 */
export function generateKanjiMetaWithJsonLd(
  kanji: string,
  meaning: string,
  options?: {
    strokes?: number;
    grade?: number;
    onYomi?: string[];
    kunYomi?: string[];
    jlpt?: string | null;
  }
) {
  return {
    metadata: generateKanjiMetadata(kanji, meaning, options),
    jsonLd: getKanjiJsonLd(kanji, meaning, options?.strokes || 0),
  };
}
