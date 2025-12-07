/**
 * animCJKからひらがな・カタカナのSVGを自動ダウンロード
 * 出力先: /public/svg/uXXXX.svg
 */

import * as fs from "fs";
import * as path from "path";

const BASE_URL = "https://raw.githubusercontent.com/parsimonhi/animCJK/master";
const OUTPUT_DIR = path.join(process.cwd(), "public", "svg");

// Unicode範囲
const RANGES = {
  hiragana: { start: 0x3041, end: 0x3096, folder: "svgsJa/hiragana" },
  katakana: { start: 0x30a1, end: 0x30fa, folder: "svgsJa/katakana" },
};

// 追加の文字（小書き、長音など）
const EXTRA_CHARS = [
  { code: 0x3099, folder: "svgsJa/hiragana" }, // 濁点
  { code: 0x309a, folder: "svgsJa/hiragana" }, // 半濁点
  { code: 0x309b, folder: "svgsJa/hiragana" }, // 濁点（結合）
  { code: 0x309c, folder: "svgsJa/hiragana" }, // 半濁点（結合）
  { code: 0x30fc, folder: "svgsJa/katakana" }, // 長音
];

async function fetchSvg(code: number, folder: string): Promise<boolean> {
  const hex = code.toString(16).padStart(5, "0");
  const url = `${BASE_URL}/${folder}/u${hex}.svg`;
  const outPath = path.join(OUTPUT_DIR, `u${hex}.svg`);
  
  // 既に存在する場合はスキップ
  if (fs.existsSync(outPath)) {
    console.log(`⏭️  Skip (exists): u${hex}.svg`);
    return true;
  }
  
  try {
    const res = await fetch(url);
    if (!res.ok) {
      // 4桁形式も試す
      const hex4 = code.toString(16).padStart(4, "0");
      const url4 = `${BASE_URL}/${folder}/u${hex4}.svg`;
      const res4 = await fetch(url4);
      if (!res4.ok) {
        console.log(`❌ Not found: u${hex}.svg`);
        return false;
      }
      const svg = await res4.text();
      fs.writeFileSync(outPath, svg, "utf8");
      console.log(`✅ Downloaded: u${hex}.svg (from u${hex4})`);
      return true;
    }
    
    const svg = await res.text();
    fs.writeFileSync(outPath, svg, "utf8");
    console.log(`✅ Downloaded: u${hex}.svg`);
    return true;
  } catch (err) {
    console.error(`❌ Error fetching u${hex}.svg:`, err);
    return false;
  }
}

async function main() {
  console.log("🚀 Fetching animCJK SVGs...\n");
  
  // 出力ディレクトリ作成
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  
  let downloaded = 0;
  let skipped = 0;
  let failed = 0;
  
  // ひらがな・カタカナをダウンロード
  for (const [name, range] of Object.entries(RANGES)) {
    console.log(`\n📁 Fetching ${name}...`);
    
    for (let i = range.start; i <= range.end; i++) {
      const result = await fetchSvg(i, range.folder);
      if (result) {
        const outPath = path.join(OUTPUT_DIR, `u${i.toString(16).padStart(5, "0")}.svg`);
        if (fs.existsSync(outPath)) {
          const stat = fs.statSync(outPath);
          if (stat.size > 100) {
            downloaded++;
          } else {
            skipped++;
          }
        }
      } else {
        failed++;
      }
      
      // レート制限対策
      await new Promise((r) => setTimeout(r, 100));
    }
  }
  
  // 追加文字をダウンロード
  console.log("\n📁 Fetching extra characters...");
  for (const extra of EXTRA_CHARS) {
    const result = await fetchSvg(extra.code, extra.folder);
    if (result) downloaded++;
    else failed++;
    await new Promise((r) => setTimeout(r, 100));
  }
  
  console.log("\n" + "=".repeat(50));
  console.log(`✅ Completed!`);
  console.log(`   Downloaded/Exists: ${downloaded}`);
  console.log(`   Failed: ${failed}`);
  console.log(`   Output: ${OUTPUT_DIR}`);
}

main().catch(console.error);










