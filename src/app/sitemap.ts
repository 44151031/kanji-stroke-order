import { MetadataRoute } from "next";
import fs from "fs";
import path from "path";
import { toUnicodeSlug } from "@/lib/slugHelpers";
import { siteMeta } from "@/lib/metadata";
import radicalList, { buildSlugIndex, getUniqueSlug } from "@/lib/radicalList";
import { articles } from "@/lib/articles";

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
    // ※ /search はサイト内検索結果ページのため sitemap 非掲載（noindex,follow 運用）
    // ランキング（期間別）
    {
      url: `${baseUrl}/ranking/week`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ranking/month`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/ranking/half-year`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    // 部首一覧トップ
    {
      url: `${baseUrl}/radical`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    // 漢字リストページ
    // ※ /lists/exam・/lists/mistake・/lists/confused は /exam-kanji 等と内容が重複するため
    //    canonical を /*-kanji 側に向け、sitemap には正規URL（/*-kanji）のみ掲載する
    {
      url: `${baseUrl}/lists/misorder`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // 独立したリストページ（正規URL）
    {
      url: `${baseUrl}/exam-kanji`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/mistake-kanji`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/confused-kanji`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // 運営管理
    {
      url: `${baseUrl}/operation`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // 利用規約
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // プライバシーポリシー
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    // クイズ
    {
      url: `${baseUrl}/quiz`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    // 記事一覧ページ
    {
      url: `${baseUrl}/articles`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // 記事ページ（レジストリから自動生成）
  articles.forEach((a) => {
    sitemap.push({
      url: `${baseUrl}/articles/${a.slug}`,
      lastModified: new Date(a.dateModified),
      changeFrequency: "monthly",
      priority: 0.7,
    });
  });
  
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
  // radicalList.ts から正確なslugを生成
  const slugIndex = buildSlugIndex(radicalList);
  radicalList.forEach((r) => {
    const uniqueSlug = getUniqueSlug(r, slugIndex);
    sitemap.push({
      url: `${baseUrl}/radical/${uniqueSlug}`,
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
