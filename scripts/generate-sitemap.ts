/**
 * generate-sitemap.ts
 * SSG生成対象の漢字ページ一覧を基に、サイトマップを自動生成
 */

import * as fs from "fs";
import * as path from "path";

interface KanjiMaster {
  id: string;
  kanji: string;
  grade?: number;
  strokes?: number;
  category?: string[];
}

interface KanjiJoyo {
  kanji: string;
  ucsHex: string;
  grade: number;
  strokes: number;
}

interface KanjiDetail {
  kanji: string;
  radicals?: string[];
}

const BASE_URL = "https://kanji-stroke-order.com";
const OUTPUT_PATH = path.join(process.cwd(), "public", "sitemap.xml");

function loadJson<T>(filename: string): T[] {
  const filePath = path.join(process.cwd(), "data", filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[!] File not found: ${filename}`);
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

async function main() {
  console.log("[*] Generating sitemap.xml...");
  
  const kanjiMaster = loadJson<KanjiMaster>("kanji_master.json");
  const kanjiJoyo = loadJson<KanjiJoyo>("kanji-joyo.json");
  const kanjiDictionary = loadJson<KanjiDetail>("kanji-dictionary.json");
  
  const today = formatDate(new Date());
  const urls: string[] = [];
  
  // トップページ
  urls.push(`
  <url>
    <loc>${BASE_URL}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`);
  
  // 静的ページ
  const staticPages = [
    { path: "/hiragana", priority: 0.8, freq: "monthly" },
    { path: "/katakana", priority: 0.8, freq: "monthly" },
    { path: "/search", priority: 0.7, freq: "weekly" },
    { path: "/ranking", priority: 0.8, freq: "daily" },
    { path: "/bushu", priority: 0.8, freq: "monthly" },
    { path: "/lists/exam", priority: 0.8, freq: "weekly" },
    { path: "/lists/mistake", priority: 0.8, freq: "weekly" },
    { path: "/lists/confused", priority: 0.8, freq: "weekly" },
    { path: "/exam-kanji", priority: 0.9, freq: "weekly" },
    { path: "/mistake-kanji", priority: 0.9, freq: "weekly" },
    { path: "/confused-kanji", priority: 0.9, freq: "weekly" },
  ];
  
  staticPages.forEach(({ path, priority, freq }) => {
    urls.push(`
  <url>
    <loc>${BASE_URL}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${freq}</changefreq>
    <priority>${priority}</priority>
  </url>`);
  });
  
  // 学年別ページ
  const grades = [...new Set(kanjiJoyo.map((k) => k.grade))].sort((a, b) => a - b);
  grades.forEach((grade) => {
    urls.push(`
  <url>
    <loc>${BASE_URL}/grade/${grade}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
  });
  
  // 画数別ページ
  const strokes = [...new Set(kanjiJoyo.map((k) => k.strokes))].sort((a, b) => a - b);
  strokes.forEach((s) => {
    urls.push(`
  <url>
    <loc>${BASE_URL}/strokes/${s}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`);
  });
  
  // 部首別ページ
  const radicals = new Set<string>();
  kanjiDictionary.forEach((k) => k.radicals?.forEach((r) => radicals.add(r)));
  radicals.forEach((r) => {
    urls.push(`
  <url>
    <loc>${BASE_URL}/bushu/${encodeURIComponent(r)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`);
  });
  
  // 漢字ページ（/kanji/[kanji] 形式 - 従来形式）
  kanjiJoyo.forEach((k) => {
    urls.push(`
  <url>
    <loc>${BASE_URL}/kanji/${encodeURIComponent(k.kanji)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>`);
  });
  
  // 漢字ページ（/kanji/uXXXX 形式 - マスターデータ用）
  kanjiMaster.forEach((k) => {
    if (k.id) {
      urls.push(`
  <url>
    <loc>${BASE_URL}/kanji/${k.id}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`);
    }
  });
  
  // XML生成
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join("")}
</urlset>`;
  
  // 保存
  fs.writeFileSync(OUTPUT_PATH, xml, "utf-8");
  
  console.log(`✅ Sitemap generated: ${OUTPUT_PATH}`);
  console.log(`   Total URLs: ${urls.length}`);
  console.log(`   - Static pages: ${staticPages.length + 1}`);
  console.log(`   - Grade pages: ${grades.length}`);
  console.log(`   - Stroke pages: ${strokes.length}`);
  console.log(`   - Radical pages: ${radicals.size}`);
  console.log(`   - Kanji pages (joyo): ${kanjiJoyo.length}`);
  console.log(`   - Kanji pages (master): ${kanjiMaster.filter(k => k.id).length}`);
}

main().catch(console.error);

