#!/usr/bin/env tsx

import { execSync } from "child_process";

/**
 * 部首整備パイプライン
 * 複数のチェック・補完スクリプトを順番に実行する統合パイプライン
 */

console.log("========================================");
console.log("🚀 部首整備パイプライン 開始");
console.log("========================================");
console.log();

try {
  console.log("① 部首欠落レポート: radicalMissingReport.ts");
  console.log("----------------------------------------");
  execSync("npx tsx scripts/radicalMissingReport.ts", { stdio: "inherit" });
  console.log();

  console.log("② 自動補完: radicalAutoFix.ts");
  console.log("----------------------------------------");
  execSync("npx tsx scripts/radicalAutoFix.ts", { stdio: "inherit" });
  console.log();

  console.log("③ 常用漢字カバレッジ確認: checkJoyoCoverage.ts");
  console.log("----------------------------------------");
  execSync("npx tsx scripts/checkJoyoCoverage.ts", { stdio: "inherit" });
  console.log();

  console.log("========================================");
  console.log("✅ パイプライン完了！");
  console.log("========================================");
  console.log();
  console.log("📊 実行結果サマリー:");
  console.log("  - 部首欠落レポート: 完了");
  console.log("  - 自動補完処理: 完了");
  console.log("  - 常用漢字カバレッジチェック: 完了");
  console.log();
  console.log("💾 修正済みデータ: /data/kanjiMaster_fixed.json");
  console.log("💡 元データ (kanji_master.json) は変更されていません。");
  console.log("   確認後、必要に応じて kanjiMaster_fixed.json を kanji_master.json に上書きしてください。");
  console.log("========================================");
} catch (error: any) {
  console.error();
  console.error("========================================");
  console.error("❌ 実行中にエラーが発生しました");
  console.error("========================================");
  console.error(error.message);
  if (error.stdout) {
    console.error("標準出力:", error.stdout.toString());
  }
  if (error.stderr) {
    console.error("エラー出力:", error.stderr.toString());
  }
  process.exit(1);
}










