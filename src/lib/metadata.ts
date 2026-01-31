// ============================================
// 🧭 共通サイトメタ情報
// ============================================
import { Metadata } from "next";
import { siteMeta } from "@/lib/siteMeta";
import { getKanjiJsonLd } from "@/lib/structuredData";

// siteMeta を re-export（後方互換性のため）
export { siteMeta };

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
// 🗺️ ページ別メタデータマッピング
// ============================================
/**
 * 各ページのタイトル・説明を一元管理するマッピング
 * pathをキーとして、titleとdescriptionを定義
 */
const PAGE_META_MAP: Record<string, { title: string; description: string }> = {
  "/exam-kanji": {
    title: "入試頻出漢字一覧",
    description: "高校入試・大学入試で頻出する重要漢字を一覧で紹介。書き順・読み方・意味を学習できます。受験対策に最適な漢字リストです。",
  },
  "/mistake-kanji": {
    title: "間違えやすい漢字一覧 | 同音異義語の使い分け",
    description: "同音異義語で間違えやすい漢字をペアで紹介。「異常」と「以上」、「会う」と「合う」など、読みが同じで意味が違う漢字の使い分けを一覧で確認できます。",
  },
  "/confused-kanji": {
    title: "似ている漢字一覧 | 形が似て混同しやすい漢字ペア",
    description: "形が似ていて混同しやすい漢字をペアで紹介。「土」と「士」、「未」と「末」など、間違えやすい漢字の違いと見分け方を一覧で確認できます。",
  },
  "/search": {
    title: "漢字検索",
    description: "漢字・読み・意味で検索。常用漢字2136字の書き順をアニメーションで学べます。",
  },
  "/ranking": {
    title: "人気の漢字ランキング",
    description: "よく検索・閲覧されている人気の漢字をランキング形式で紹介。週・月・半年ごとの人気傾向を確認できます。",
  },
  "/terms": {
    title: "利用規約・免責事項",
    description: "漢字書き順ナビの利用規約および免責事項ページ。著作権・引用・データ利用方針を明示しています。",
  },
  "/operation": {
    title: "運営管理",
    description: "漢字書き順ナビの運営主体・管理情報ページ。管理者・連絡先・データライセンス情報を掲載しています。",
  },
  "/articles/common-misorder-kanji": {
    title: "書き順を間違えやすい漢字TOP20",
    description: "多くの人が誤って覚えている漢字の正しい書き順を、アニメ付きでわかりやすく解説します。",
  },
  "/lists/misorder": {
    title: "書き順を間違えやすい漢字クイズ | 練習・学習",
    description: "書き順を間違えやすい漢字をクイズ形式で学習。テストや入試でよく出題される重要漢字の正しい書き順を、アニメーション付きで確認できます。",
  },
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

// ============================================
// 📊 構造化データ（JSON-LD）の re-export
// ============================================
// 構造化データ関数は @/lib/structuredData に集約されています
// 後方互換性のため、ここから re-export します
export {
  getTopPageJsonLd,
  getKanjiJsonLd,
  getKanjiPracticeJsonLd,
  getRankingJsonLd,
  getRankingSeriesJsonLd,
  getKanjiItemJsonLd,
  getArticleJsonLd,
  getKanjiDefinedTermJsonLd,
  type RankingEntry,
  type RankingPosition,
} from "@/lib/structuredData";

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

  // 現在のX（Twitter）OGP表示と完全に同一のタイトル
  const title = `「${kanji}」の書き順（筆順アニメ付）｜読み方・部首・訓読み・音読み`;
  
  // description: SVGアニメで書き順を解説 + 音読み／訓読み／画数／学年／JLPT情報を自動生成
  const descParts = [
    `${kanji}の書き順（筆順）をSVGアニメで解説`,
  ];
  if (onYomi.length > 0) descParts.push(`音読み：${onYomi.slice(0, 3).join("、")}`);
  if (kunYomi.length > 0) descParts.push(`訓読み：${kunYomi.slice(0, 3).join("、")}`);
  if (meaning) descParts.push(`意味：${meaning}`);
  if (strokes) descParts.push(`${strokes}画`);
  if (grade) descParts.push(grade <= 6 ? `小学${grade}年` : "中学");
  if (jlpt) descParts.push(`JLPT ${jlpt}`);
  const description = descParts.join("。") + "。";

  const canonicalUrl = `${siteMeta.url}/kanji/u${hex}`;
  // OGP画像URL（X（Twitter）で現在表示されている画像と同一）
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
      card: "summary_large_image", // X（Twitter）カードは summary_large_image
      title,
      description,
      images: [ogImageUrl],
      creator: siteMeta.twitterCreator,
    },
    alternates: { canonical: canonicalUrl },
  };
}


// ============================================
// ✍️ 書き取りテストモード メタデータ
// ============================================
/**
 * 漢字書き取りテストモード用のメタデータ
 */
export function generateKanjiPracticeMetadata(
  kanji: string,
  meaning: string,
  strokes: number
): Metadata {
  const hex = toKanjiHex(kanji);
  const practiceUrl = `${siteMeta.url}/kanji/u${hex}/practice`;
  const ogImageUrl = `${siteMeta.url}/api/og-kanji?k=${encodeURIComponent(kanji)}`;

  const title = `${kanji}の書き取りテスト（筆順練習モード）｜${meaning}・${strokes}画 | ${siteMeta.siteName}`;
  const description = `${kanji}（${meaning}）の正しい書き順を練習するための書き取りテストモード。${strokes}画の筆順を確認しながら書き取りスコアを記録できます。`;

  return {
    ...baseMeta,
    title,
    description,
    keywords: [
      kanji,
      `${kanji} 書き取り`,
      `${kanji} 練習`,
      `${kanji} 筆順テスト`,
      `${kanji} 書き方`,
      "書き取り練習",
      "漢字",
      "筆順",
      "書き順",
      "漢字学習",
    ],
    openGraph: {
      title,
      description,
      type: "article",
      url: practiceUrl,
      siteName: siteMeta.siteName,
      locale: siteMeta.locale,
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `${kanji}の書き取りテスト（筆順練習モード）`,
        },
      ],
    },
    twitter: {
      card: siteMeta.twitterCard,
      title,
      description,
      images: [ogImageUrl],
      creator: siteMeta.twitterCreator,
    },
    alternates: { canonical: practiceUrl },
  };
}

// ============================================
// 📄 汎用ページ用メタデータ生成
// ============================================
export function generatePageMetadata(options: {
  title?: string;
  description?: string;
  path?: string;
  image?: string;
  type?: "website" | "article";
}): Metadata {
  const {
    title: titleOption,
    description: descriptionOption,
    path = "",
    image = siteMeta.image,
    type = "website",
  } = options;

  // pathが指定され、かつPAGE_META_MAPに存在する場合はマッピングから取得
  const metaFromMap = path ? PAGE_META_MAP[path] : undefined;
  const title = titleOption || (metaFromMap ? metaFromMap.title : "") || "";
  const description = descriptionOption || (metaFromMap ? metaFromMap.description : "") || "";

  if (!title || !description) {
    throw new Error(
      `generatePageMetadata: title and description are required. Either provide them in options or ensure path "${path}" exists in PAGE_META_MAP.`
    );
  }

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
    title: `${radicalJp}の部首の漢字一覧`,
    description: `部首「${radicalJp}」を持つ漢字の一覧。書き順・読み方・意味を解説。部首から漢字を検索できます。`,
    path: `/radical/${radicalEn}`,
  });
}

// ============================================
// 📚 リストページ用メタデータ生成
// ============================================
/**
 * リストページ（/lists/[type]）用メタデータ生成
 */
export function generateListMetadata(
  type: string,
  title: string,
  description: string
): Metadata {
  return generatePageMetadata({
    title,
    description,
    path: `/lists/${type}`,
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

