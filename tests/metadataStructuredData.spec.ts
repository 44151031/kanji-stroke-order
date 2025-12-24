/**
 * メタ情報・構造化データの統合テスト
 * 
 * テスト内容：
 * 1. generateMetadata 関数が正しく Metadata オブジェクトを返すか
 * 2. JSON-LD 関数が正しい schema.org 構造を返すか
 * 3. 必要なプロパティがすべて含まれているか
 */

import { describe, test, expect } from "vitest";
import {
  generateKanjiMetadata,
  generateKanjiPracticeMetadata,
  generatePageMetadata,
  generateGradeMetadata,
  generateStrokesMetadata,
  generateRadicalMetadata,
  generateRadicalIndexMetadata,
} from "@/lib/metadata";

import {
  getKanjiJsonLd,
  getKanjiPracticeJsonLd,
  getTopPageJsonLd,
  getRankingJsonLd,
  getRankingSeriesJsonLd,
  getKanjiItemJsonLd,
  getArticleJsonLd,
  getKanjiDefinedTermJsonLd,
  type RankingEntry,
} from "@/lib/structuredData";

// ============================================
// メタデータ生成関数のテスト
// ============================================

describe("Metadata Generation Functions", () => {
  test("generateKanjiMetadata returns valid Metadata object", () => {
    const meta = generateKanjiMetadata("水", "water", {
      strokes: 4,
      grade: 1,
      onYomi: ["スイ"],
      kunYomi: ["みず"],
      jlpt: "N5",
    });

    expect(meta).toBeDefined();
    expect(meta.title).toContain("水");
    expect(meta.title).toContain("書き順");
    expect(meta.description).toContain("水");
    expect(meta.description).toContain("water");
    expect(meta.openGraph).toBeDefined();
    expect(meta.openGraph?.url).toContain("/kanji/");
    expect(meta.openGraph?.type).toBe("article");
    expect(meta.keywords).toContain("水");
  });

  test("generateKanjiPracticeMetadata returns valid Metadata", () => {
    const meta = generateKanjiPracticeMetadata("日", "sun", 4);

    expect(meta).toBeDefined();
    expect(meta.title).toContain("日");
    expect(meta.title).toContain("書き取りテスト");
    expect(meta.description).toContain("日");
    expect(meta.openGraph).toBeDefined();
    expect(meta.openGraph?.type).toBe("article");
    expect(meta.openGraph?.url).toContain("/practice");
    expect(meta.keywords).toContain("書き取り練習");
  });

  test("generatePageMetadata returns valid Metadata", () => {
    const meta = generatePageMetadata({
      title: "テストページ",
      description: "テスト説明",
      path: "/test",
      type: "website",
    });

    expect(meta).toBeDefined();
    expect(meta.title).toContain("テストページ");
    expect(meta.description).toBe("テスト説明");
    expect(meta.openGraph).toBeDefined();
    expect(meta.openGraph?.url).toContain("/test");
    expect(meta.alternates?.canonical).toContain("/test");
  });

  test("generateGradeMetadata returns valid Metadata", () => {
    const meta = generateGradeMetadata(1);

    expect(meta).toBeDefined();
    expect(meta.title).toContain("小学1年生");
    expect(meta.description).toContain("小学1年生");
    expect(meta.openGraph).toBeDefined();
  });

  test("generateStrokesMetadata returns valid Metadata", () => {
    const meta = generateStrokesMetadata(4);

    expect(meta).toBeDefined();
    expect(meta.title).toContain("4画");
    expect(meta.description).toContain("4画");
    expect(meta.openGraph).toBeDefined();
  });

  test("generateRadicalMetadata returns valid Metadata", () => {
    const meta = generateRadicalMetadata("さんずい", "water-radical");

    expect(meta).toBeDefined();
    expect(meta.title).toContain("さんずい");
    expect(meta.description).toContain("さんずい");
    expect(meta.openGraph).toBeDefined();
  });

  test("generateRadicalIndexMetadata returns valid Metadata", () => {
    const meta = generateRadicalIndexMetadata();

    expect(meta).toBeDefined();
    expect(meta.title).toContain("部首別");
    expect(meta.description).toContain("部首");
    expect(meta.openGraph).toBeDefined();
  });
});

// ============================================
// 構造化データ（JSON-LD）関数のテスト
// ============================================

describe("Structured Data (JSON-LD) Functions", () => {
  test("getTopPageJsonLd returns valid schema.org structure", () => {
    const jsonLd = getTopPageJsonLd();

    expect(jsonLd).toBeDefined();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@graph"]).toBeDefined();
    expect(Array.isArray(jsonLd["@graph"])).toBe(true);
    expect(jsonLd["@graph"].length).toBeGreaterThan(0);

    // WebSite タイプが含まれているか
    const website = jsonLd["@graph"].find((item: any) => item["@type"] === "WebSite");
    expect(website).toBeDefined();
    expect(website?.url).toBeDefined();
  });

  test("getKanjiJsonLd returns valid schema.org structure", () => {
    const jsonLd = getKanjiJsonLd("水", "water", 4);

    expect(jsonLd).toBeDefined();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("CreativeWork");
    expect(jsonLd.name).toContain("水");
    expect(jsonLd.url).toContain("/kanji/");
    expect(jsonLd.inLanguage).toBe("ja");
  });

  test("getKanjiItemJsonLd returns valid schema.org structure", () => {
    const jsonLd = getKanjiItemJsonLd("水", "water", 4, null);

    expect(jsonLd).toBeDefined();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@graph"]).toBeDefined();
    expect(Array.isArray(jsonLd["@graph"])).toBe(true);

    const item = jsonLd["@graph"][0];
    expect(item["@type"]).toBe("CreativeWork");
    expect(item.name).toBe("水");
    expect(item.url).toContain("/kanji/");
  });

  test("getKanjiItemJsonLd with ranking data includes ItemList", () => {
    const jsonLd = getKanjiItemJsonLd("水", "water", 4, {
      position: 5,
      period: "week",
      views: 100,
    });

    expect(jsonLd).toBeDefined();
    const item = jsonLd["@graph"][0];
    expect(item.itemListElement).toBeDefined();
    expect(item.itemListElement.position).toBe(5);
  });

  test("getKanjiPracticeJsonLd returns valid ExercisePlan structure", () => {
    const jsonLd = getKanjiPracticeJsonLd("日", "sun", 4);

    expect(jsonLd).toBeDefined();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("ExercisePlan");
    expect(jsonLd.name).toContain("日");
    expect(jsonLd.url).toContain("/practice");
    expect(jsonLd.exerciseType).toBe("handwriting");
    expect(jsonLd.audience).toBeDefined();
    expect(jsonLd.audience["@type"]).toBe("EducationalAudience");
  });

  test("getRankingJsonLd returns valid ItemList structure", () => {
    const ranking: RankingEntry[] = [
      { kanji: "水", views: 100 },
      { kanji: "日", views: 80 },
      { kanji: "月", views: 60 },
    ];

    const jsonLd = getRankingJsonLd(ranking, "1週間");

    expect(jsonLd).toBeDefined();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("ItemList");
    expect(jsonLd.name).toContain("ランキング");
    expect(jsonLd.name).toContain("1週間");
    expect(jsonLd.numberOfItems).toBe(3);
    expect(jsonLd.itemListElement).toBeDefined();
    expect(Array.isArray(jsonLd.itemListElement)).toBe(true);
    expect(jsonLd.itemListElement.length).toBe(3);
    expect(jsonLd.itemListElement[0].name).toBe("水");
    expect(jsonLd.itemListElement[0].position).toBe(1);
  });

  test("getRankingSeriesJsonLd returns valid CreativeWorkSeries structure", () => {
    const jsonLd = getRankingSeriesJsonLd();

    expect(jsonLd).toBeDefined();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("CreativeWorkSeries");
    expect(jsonLd.name).toContain("ランキング");
    expect(jsonLd.url).toContain("/ranking");
    expect(jsonLd.creator).toBeDefined();
  });

  test("getArticleJsonLd returns valid Article/HowTo structure", () => {
    const jsonLd = getArticleJsonLd({
      headline: "テスト記事",
      description: "テスト説明",
      url: "https://kanji-stroke-order.com/articles/test",
      datePublished: "2025-01-01",
      dateModified: "2025-01-02",
      steps: [
        { name: "ステップ1", text: "説明1" },
        { name: "ステップ2", text: "説明2" },
      ],
    });

    expect(jsonLd).toBeDefined();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(Array.isArray(jsonLd["@type"])).toBe(true);
    expect(jsonLd["@type"]).toContain("Article");
    expect(jsonLd["@type"]).toContain("HowTo");
    expect(jsonLd.headline).toBe("テスト記事");
    expect(jsonLd.mainEntityOfPage).toBeDefined();
    expect(jsonLd.step).toBeDefined();
    expect(Array.isArray(jsonLd.step)).toBe(true);
    expect(jsonLd.step.length).toBe(2);
  });

  test("getKanjiDefinedTermJsonLd returns valid DefinedTerm structure", () => {
    const jsonLd = getKanjiDefinedTermJsonLd({
      kanji: "水",
      ucsHex: "6c34",
      on: ["スイ"],
      kun: ["みず"],
      strokes: 4,
      grade: 1,
      jlpt: "N5",
      words: [
        { word: "水", reading: "みず", meaning: "water" },
        { word: "水道", reading: "すいどう", meaning: "water supply" },
      ],
      canonicalSlug: "u6c34",
    });

    expect(jsonLd).toBeDefined();
    expect(jsonLd["@context"]).toBe("https://schema.org");
    expect(jsonLd["@type"]).toBe("DefinedTerm");
    expect(jsonLd.name).toBe("水");
    expect(jsonLd.termCode).toBe("ucs:6c34");
    expect(jsonLd.alternateName).toContain("スイ");
    expect(jsonLd.alternateName).toContain("みず");
    expect(jsonLd.additionalProperty).toBeDefined();
    expect(Array.isArray(jsonLd.additionalProperty)).toBe(true);
    
    const strokesProp = jsonLd.additionalProperty.find((prop: any) => prop.name === "strokes");
    expect(strokesProp).toBeDefined();
    expect(strokesProp?.value).toBe(4);
    
    expect(jsonLd.hasPart).toBeDefined();
    expect(Array.isArray(jsonLd.hasPart)).toBe(true);
    expect(jsonLd.hasPart.length).toBe(2);
  });
});

// ============================================
// 統合テスト（メタデータ + 構造化データ）
// ============================================

describe("Metadata & StructuredData Integration", () => {
  test("Kanji page metadata and JSON-LD are consistent", () => {
    const meta = generateKanjiMetadata("水", "water", {
      strokes: 4,
      grade: 1,
      onYomi: ["スイ"],
      kunYomi: ["みず"],
    });

    const jsonLd = getKanjiJsonLd("水", "water", 4);

    // URLの整合性
    const metaUrl = meta.openGraph?.url || "";
    const jsonLdUrl = jsonLd.url || "";
    
    // 両方のURLが同じ漢字を指しているか
    expect(metaUrl).toContain("/kanji/");
    expect(jsonLdUrl).toContain("/kanji/");
    
    // タイトルと名前の整合性
    expect(meta.title).toContain("水");
    expect(jsonLd.name).toContain("水");
  });

  test("Practice page metadata and JSON-LD are consistent", () => {
    const meta = generateKanjiPracticeMetadata("日", "sun", 4);
    const jsonLd = getKanjiPracticeJsonLd("日", "sun", 4);

    // URLの整合性
    const metaUrl = meta.openGraph?.url || "";
    const jsonLdUrl = jsonLd.url || "";
    
    expect(metaUrl).toContain("/practice");
    expect(jsonLdUrl).toContain("/practice");
    
    // タイトルと名前の整合性
    expect(meta.title).toContain("日");
    expect(jsonLd.name).toContain("日");
  });
});






