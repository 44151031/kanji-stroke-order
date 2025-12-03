import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { toUnicodeSlug } from "@/lib/slugHelpers";
import { siteMeta } from "@/lib/metadata";

interface KanjiEntry {
  kanji: string;
  grade: number;
  strokes: number;
  ucsHex: string;
}

interface KanjiDetail {
  kanji: string;
  grade: number;
  strokes: number;
  radicals?: string[];
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = siteMeta.url;
  
  // 漢字データを読み込み
  let joyoList: KanjiEntry[] = [];
  let dictionary: KanjiDetail[] = [];
  
  try {
    const joyoPath = path.join(process.cwd(), "data", "kanji-joyo.json");
    joyoList = JSON.parse(fs.readFileSync(joyoPath, "utf-8"));
  } catch {
    console.warn("kanji-joyo.json not found");
  }
  
  try {
    const dictPath = path.join(process.cwd(), "data", "kanji-dictionary.json");
    dictionary = JSON.parse(fs.readFileSync(dictPath, "utf-8"));
  } catch {
    console.warn("kanji-dictionary.json not found");
  }
  
  const sitemap: MetadataRoute.Sitemap = [
    // トップページ
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    // 検索
    {
      url: `${baseUrl}/search`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    // ランキング
    {
      url: `${baseUrl}/ranking`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    // 部首一覧トップ
    {
      url: `${baseUrl}/radical`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 漢字リストページ
    {
      url: `${baseUrl}/lists/exam`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lists/mistake`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lists/confused`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/lists/misorder`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];
  
  // 学年別ページ（/grade/1 〜 /grade/8）
  const grades = [...new Set(joyoList.map((k) => k.grade))].sort((a, b) => a - b);
  grades.forEach((grade) => {
    sitemap.push({
      url: `${baseUrl}/grade/${grade}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    });
  });
  
  // 画数別ページ（/strokes/1 〜 /strokes/N）
  const strokes = [...new Set(joyoList.map((k) => k.strokes))].sort((a, b) => a - b);
  strokes.forEach((s) => {
    sitemap.push({
      url: `${baseUrl}/strokes/${s}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });
  
  // 部首別ページ（/radical/[slug]）
  const radicals = new Set<string>();
  dictionary.forEach((k) => k.radicals?.forEach((r) => radicals.add(r)));
  radicals.forEach((r) => {
    sitemap.push({
      url: `${baseUrl}/radical/${encodeURIComponent(r)}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    });
  });
  
  // 個別漢字ページ（/kanji/uXXXX）- 2136字
  joyoList.forEach((k) => {
    sitemap.push({
      url: `${baseUrl}/kanji/${toUnicodeSlug(k.kanji)}`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    });
  });
  
  return sitemap;
}
