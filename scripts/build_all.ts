/**
 * すべてのデータ生成スクリプトを順番に実行
 */

import { execSync } from "child_process";
import * as path from "path";

const scripts = [
  "build_joyo_index.ts",      // 常用漢字リスト
  "build_kanji_details.ts",   // 詳細データ + kanji-dictionary.json
  "build_kanji_meta.ts",      // メタデータ（互換性用）
  "build_words_by_kanji.ts",  // 単語リスト
  "fetch_kanjivg.ts",         // SVGダウンロード
];

async function main() {
  console.log("🚀 Starting data generation...\n");

  for (const script of scripts) {
    const scriptPath = path.join(process.cwd(), "scripts", script);
    console.log(`📦 Running ${script}...`);
    
    try {
      execSync(`npx tsx ${scriptPath}`, { stdio: "inherit" });
      console.log(`✅ ${script} completed\n`);
    } catch (error) {
      console.error(`❌ ${script} failed:`, error);
      process.exit(1);
    }
  }

  console.log("🎉 All data generation completed!");
}

main().catch(console.error);
