/**
 * 漢字データ収集・統合メインスクリプト
 * 全スクリプトを順番に実行
 */

import { execSync } from "child_process";
import * as path from "path";

const SCRIPTS_DIR = path.join(process.cwd(), "scripts", "scrape_kanji_sources");

const SCRIPTS = [
  "scrape_exam_kanji.ts",
  "scrape_common_mistakes.ts",
  "scrape_confused_kanji.ts",
  "normalize_kanji_data.ts",
  "merge_kanji_lists.ts",
];

async function main() {
  console.log("╔════════════════════════════════════════════════╗");
  console.log("║     漢字ナレッジ拡張システム - 一括実行        ║");
  console.log("╚════════════════════════════════════════════════╝\n");
  
  for (const script of SCRIPTS) {
    const scriptPath = path.join(SCRIPTS_DIR, script);
    console.log(`\n▶ Running: ${script}`);
    console.log("─".repeat(50));
    
    try {
      execSync(`npx tsx "${scriptPath}"`, {
        stdio: "inherit",
        cwd: process.cwd(),
      });
    } catch (error) {
      console.error(`[!] Failed to run ${script}`);
      process.exit(1);
    }
  }
  
  console.log("\n" + "═".repeat(50));
  console.log("✅ All scripts completed successfully!");
  console.log("═".repeat(50));
}

main().catch(console.error);










