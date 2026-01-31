// ============================================
// 📊 構造化データ（JSON-LD）生成関数
// ============================================

import { siteMeta } from "@/lib/siteMeta";

// ============================================
// ⚙️ ユーティリティ
// ============================================
/**
 * 漢字をUnicode Hex文字列に変換
 * 例: "水" → "6c34"
 */
function toKanjiHex(kanji: string): string {
  return kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "";
}

// ============================================
// 📋 型定義
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
 * ランキング位置情報の型定義
 */
export interface RankingPosition {
  position: number;
  period?: string;
  views?: number;
}

// ============================================
// 🏠 トップページ構造化データ
// ============================================
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
// 🈶 漢字ページ構造化データ
// ============================================
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

// ============================================
// ✍️ 書き取りテストモード用構造化データ
// ============================================
/**
 * 書き取りテストモード専用のJSON-LD構造化データ
 * schema.org: ExercisePlan を利用し、学習・トレーニング系ページとして認識させる
 */
export function getKanjiPracticeJsonLd(
  kanji: string,
  meaning: string,
  strokes: number
) {
  const hex = toKanjiHex(kanji);
  const meta = siteMeta;
  const practiceUrl = `${meta.url}/kanji/u${hex}/practice`;

  return {
    "@context": "https://schema.org",
    "@type": "ExercisePlan",
    name: `${kanji} の書き取り練習`,
    alternateName: `${kanji} の筆順テスト`,
    description: `${kanji}（${meaning}）の正しい書き順を練習するための書き取りテストモード。${strokes}画の筆順を確認しながら学習できます。`,
    url: practiceUrl,
    inLanguage: "ja",
    audience: {
      "@type": "EducationalAudience",
      educationalRole: ["student", "teacher", "selfLearner"],
    },
    exerciseType: "handwriting",
    activityDuration: "PT5M",
    intensity: "Low",
    mainEntityOfPage: practiceUrl,
    image: `${meta.url}/api/og-kanji?k=${encodeURIComponent(kanji)}`,
    isPartOf: {
      "@type": "CreativeWorkSeries",
      name: "漢字書き順ナビ 書き取り練習シリーズ",
      url: `${meta.url}/practice`,
    },
    publisher: {
      "@type": "Organization",
      name: meta.siteName,
      url: meta.url,
      logo: {
        "@type": "ImageObject",
        url: `${meta.url}${meta.logo}`,
        width: meta.imageWidth,
        height: meta.imageHeight,
      },
    },
    potentialAction: {
      "@type": "ExerciseAction",
      name: "漢字書き取りテストを開始する",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${practiceUrl}?start=true`,
      },
      result: {
        "@type": "Rating",
        bestRating: 100,
        worstRating: 0,
        ratingValue: "ユーザーの書き取りスコア（Supabaseで管理）",
      },
    },
    about: [
      { "@type": "Thing", name: "漢字" },
      { "@type": "Thing", name: "書き順" },
      { "@type": "Thing", name: "練習" },
      { "@type": "Thing", name: "筆順テスト" },
    ],
  };
}

// ============================================
// 📊 ランキングページ用構造化データ
// ============================================
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
// 📰 記事ページ用構造化データ
// ============================================
/**
 * 記事ページ用構造化データ（Article / HowTo）
 */
export function getArticleJsonLd(options: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished?: string;
  dateModified?: string;
  steps?: Array<{
    name: string;
    text: string;
  }>;
}) {
  const { headline, description, url, image, datePublished, dateModified, steps } = options;
  const { url: siteUrl, siteName, logo } = siteMeta;

  const jsonLd: any = {
    "@context": "https://schema.org",
    "@type": ["Article", "HowTo"],
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
    headline,
    description,
    image: image || `${siteUrl}/ogp.png`,
    author: {
      "@type": "Organization",
      name: "漢字書き順ナビ運営事務局",
      url: siteUrl,
    },
    publisher: {
      "@type": "Organization",
      name: siteName,
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}${logo}`,
        width: 512,
        height: 512,
      },
    },
    datePublished: datePublished || "2025-12-03",
    dateModified: dateModified || datePublished || "2025-12-03",
    inLanguage: "ja",
    license: "https://creativecommons.org/licenses/by-sa/3.0/",
    about: [
      { "@type": "Thing", name: "漢字" },
      { "@type": "Thing", name: "書き順" },
      { "@type": "Thing", name: "筆順" },
    ],
  };

  // HowToStepがある場合は追加
  if (steps && steps.length > 0) {
    jsonLd.step = steps.map((step) => ({
      "@type": "HowToStep",
      name: step.name,
      text: step.text,
    }));
  }

  return jsonLd;
}

// ============================================
// 🈶 漢字ページ用構造化データ（DefinedTerm版）
// ============================================
/**
 * 漢字ページ構造化データ（DefinedTerm）
 * ページ内で個別定義されていた関数を共通化
 */
export function getKanjiDefinedTermJsonLd(options: {
  kanji: string;
  ucsHex: string;
  on: string[];
  kun: string[];
  strokes: number;
  grade: number;
  jlpt?: string | null;
  words?: Array<{
    word: string;
    reading: string;
    meaning: string;
  }>;
  canonicalSlug: string;
}) {
  const { kanji, ucsHex, on, kun, strokes, grade, jlpt, words = [], canonicalSlug } = options;
  const { url: siteUrl } = siteMeta;
  const gradeLabel = grade <= 6 ? `小学${grade}年生` : "中学校";
  const kanjiUrl = `${siteUrl}/kanji/${canonicalSlug}`;

  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": kanjiUrl,
    name: kanji,
    description: `${kanji}の書き順・読み方・意味`,
    inDefinedTermSet: kanjiUrl,
    termCode: `ucs:${ucsHex}`,
    alternateName: [...on, ...kun],
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "strokes",
        value: strokes,
      },
      {
        "@type": "PropertyValue",
        name: "grade",
        value: grade,
      },
      ...(jlpt
        ? [
            {
              "@type": "PropertyValue",
              name: "jlpt",
              value: jlpt,
            },
          ]
        : []),
      {
        "@type": "PropertyValue",
        name: "音読み",
        value: on.join("、"),
      },
      {
        "@type": "PropertyValue",
        name: "訓読み",
        value: kun.join("、"),
      },
      {
        "@type": "PropertyValue",
        name: "学年",
        value: gradeLabel,
      },
    ],
    hasPart:
      words.length > 0
        ? words.slice(0, 10).map((w) => ({
            "@type": "DefinedTerm",
            name: w.word,
            alternateName: w.reading,
            description: w.meaning,
          }))
        : undefined,
  };
}










