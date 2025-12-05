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
  siteNameEn: "Kanji Stroke Order Navi",
  descriptionEn:
    "Learn correct Japanese kanji stroke order, meanings, and radicals with step-by-step animations.",
  alternateNames: ["Kanji Stroke Order", "Kanji Stroke Order Navi"],
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
  const { title, description, descriptionEn, siteNameEn, url, image, siteName, locale, twitterCard, twitterCreator } = siteMeta;

  return {
    title,
    description,
    ...baseMeta,
    openGraph: {
      title: `${title} | ${siteNameEn}`,
      description: `${description} ${descriptionEn}`,
      url,
      siteName,
      locale,
      type: "website",
      images: [{ url: image, width: 1200, height: 630, alt: title }],
    },
    twitter: {
      card: twitterCard,
      title: `${title} | ${siteNameEn}`,
      description: descriptionEn,
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
  const { url, siteName, description, logo, alternateNames } = siteMeta;
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${url}/#website`,
        url,
        name: siteName,
        alternateName: alternateNames,
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
        sameAs: ["https://x.com/kanji_stroke_order"],
      },
      {
        "@type": "Organization",
        "@id": `${url}/#organization`,
        name: siteName,
        alternateName: alternateNames,
        url,
        logo: {
          "@type": "ImageObject",
          url: `${url}${logo}`,
          width: 1200,
          height: 630,
        },
        sameAs: ["https://x.com/kanji_stroke_order"],
      },
      {
        "@type": ["WebPage", "CollectionPage"],
        "@id": `${url}/#webpage`,
        url,
        name: siteName,
        alternateName: alternateNames,
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
/**
 * 部首一覧ページ（/radical）用メタデータ生成
 */
export function generateRadicalIndexMetadata(): Metadata {
  return generatePageMetadata({
    title: "部首別漢字一覧",
    description: "部首から漢字を探す。偏（へん）・旁（つくり）・冠（かんむり）・脚（あし）・垂（たれ）・構（かまえ）・繞（にょう）など、配置タイプ別に部首を分類して表示。各部首の漢字一覧と書き順を解説します。",
    path: "/radical",
  });
}

/**
 * 個別部首ページ（/radical/[slug]）用メタデータ生成
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

// ============================================
// 📊 ランキングページ用構造化データ
// ============================================
/**
 * ランキングエントリの型定義
 */
export interface RankingEntry {
  kanji: string;
  views: number;
  hex?: string;
}

/**
 * ランキングページ用構造化データ（ItemList）
 */
export function getRankingJsonLd(ranking: RankingEntry[], periodLabel: string = "") {
  const { url, siteName } = siteMeta;
  
  // hexがない場合は生成
  const rankingWithHex = ranking.map((item) => ({
    ...item,
    hex: item.hex || toKanjiHex(item.kanji),
  }));

  const name = periodLabel
    ? `人気の漢字ランキング（${periodLabel}）`
    : "人気の漢字ランキング";
  
  const description = periodLabel
    ? `${siteName}内で最も閲覧された人気の漢字ランキング。${periodLabel}のトップ${ranking.length}漢字を掲載。`
    : `${siteName}内で最も閲覧された人気の漢字ランキング。トップ${ranking.length}漢字を掲載。`;

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    description,
    url: `${url}/ranking`,
    numberOfItems: ranking.length,
    itemListElement: rankingWithHex.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.kanji,
      url: `${url}/kanji/u${item.hex}`,
    })),
    isPartOf: {
      "@type": "CreativeWorkSeries",
      name: "人気の漢字ランキング",
      url: `${url}/ranking`,
    },
    inLanguage: "ja",
  };
}

/**
 * ランキングシリーズ用構造化データ（CreativeWorkSeries）
 */
export function getRankingSeriesJsonLd() {
  const { url, siteName } = siteMeta;
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWorkSeries",
    name: "人気の漢字ランキングシリーズ",
    description:
      "閲覧数・検索数を基にした人気漢字ランキングシリーズ（週・月・半年）。",
    url: `${url}/ranking`,
    creator: {
      "@type": "Organization",
      name: siteName,
      url,
    },
    inLanguage: "ja",
  };
}

// ============================================
// 🈶 漢字ページ用構造化データ（ランキング連携版）
// ============================================
/**
 * ランキング位置情報の型定義
 */
export interface RankingPosition {
  position: number;
  period?: string;
  views?: number;
}

/**
 * 漢字ページ構造化データ（Item + ItemList参照）
 * ランキング情報と連携して、各漢字をランキング構造の一部として認識させる
 */
export function getKanjiItemJsonLd(
  kanji: string,
  meaning: string,
  strokes: number,
  rankingData: RankingPosition | null = null
) {
  const { url, siteName } = siteMeta;
  const hex = toKanjiHex(kanji);
  const kanjiUrl = `${url}/kanji/u${hex}`;
  
  // 意味は配列の場合は結合、文字列の場合はそのまま使用
  const meaningText = Array.isArray(meaning)
    ? meaning.filter(Boolean).join(", ")
    : typeof meaning === "string"
    ? meaning
    : "";

  // ランキング情報があれば構造化データに含める
  const itemListElement =
    rankingData?.position != null
      ? {
          "@type": "ListItem",
          position: rankingData.position,
          name: kanji,
          url: kanjiUrl,
        }
      : null;

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CreativeWork",
        "@id": `${kanjiUrl}#item`,
        name: kanji,
        alternateName: meaningText,
        description: `${kanji}（${meaningText}）の正しい書き順・画数・部首・読み方を解説します。`,
        inLanguage: "ja",
        url: kanjiUrl,
        mainEntityOfPage: kanjiUrl,
        publisher: {
          "@type": "Organization",
          name: siteName,
          url,
        },
        educationalLevel: "Beginner",
        genre: "Kanji Stroke Order",
        keywords: ["漢字", "書き順", "筆順", "stroke order", kanji, meaningText],
        isPartOf: {
          "@type": "CreativeWorkSeries",
          name: "人気の漢字ランキングシリーズ",
          url: `${url}/ranking`,
        },
      },
    ],
  };

  // ランキング情報がある場合は、ItemListとしても認識させる
  if (itemListElement) {
    jsonLd["@graph"][0].itemListElement = itemListElement;
    jsonLd["@graph"][0].isPartOf = [
      {
        "@type": "CreativeWorkSeries",
        name: "人気の漢字ランキングシリーズ",
        url: `${url}/ranking`,
      },
      {
        "@type": "ItemList",
        name: "人気の漢字ランキング",
        url: `${url}/ranking`,
      },
    ];
  }

  return jsonLd;
}
