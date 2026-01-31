#!/usr/bin/env tsx

/**
 * Excelファイルから部首データを読み込んで data/radicals/ に登録するスクリプト
 * 
 * 処理内容:
 * 1. data/raw/へんとかんじ.xlsx を読み込む
 * 2. 部首名（偏旁通称）で radicalList とマッピング
 * 3. 漢字文字列を1文字ずつ分割して配列化
 * 4. data/radicals/{en}.json に保存
 */

import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import radicalList, { getEnglishDisplayName } from "../src/lib/radicalList";

const excelPath = path.join(process.cwd(), "data", "raw", "へんとかんじ.xlsx");
const radicalsDir = path.join(process.cwd(), "data", "radicals");

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(radicalsDir)) {
  fs.mkdirSync(radicalsDir, { recursive: true });
}

interface ExcelRow {
  部首: string;
  偏旁通称: string;
  偏旁種: string;
  個数: number;
  漢字: string;
}

// 部首名のマッピング（完全一致しない場合の補完マッピング）
const RADICAL_NAME_MAPPING: Record<string, string> = {
  // 必要に応じて追加
  // 例: "特殊な部首名": "radicalListのjp名"
};

/**
 * Excelの「偏旁通称」から radicalList のエントリを検索
 */
function findRadicalByJapaneseName(jpName: string): typeof radicalList[0] | null {
  // まず完全一致で検索
  let found = radicalList.find((r) => r.jp === jpName);
  
  if (found) return found;
  
  // マッピングテーブルで検索
  const mappedName = RADICAL_NAME_MAPPING[jpName];
  if (mappedName) {
    found = radicalList.find((r) => r.jp === mappedName);
    if (found) return found;
  }
  
  // 部分一致で検索（例: "さんずい" と "さんずいへん"）
  found = radicalList.find((r) => r.jp.includes(jpName) || jpName.includes(r.jp));
  
  return found || null;
}

/**
 * 漢字文字列を1文字ずつ分割して配列化
 */
function splitKanjiString(kanjiStr: string): string[] {
  if (!kanjiStr || typeof kanjiStr !== "string") {
    return [];
  }
  
  // 文字列を1文字ずつ分割（絵文字やサロゲートペアにも対応）
  const kanjiArray: string[] = [];
  for (const char of kanjiStr) {
    if (char.trim()) {
      kanjiArray.push(char);
    }
  }
  
  return kanjiArray;
}

/**
 * 既存のJSONファイルを読み込む
 */
function loadExistingRadicalFile(slug: string): string[] {
  const filePath = path.join(radicalsDir, `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * 既存データと新規データをマージ（重複除去）
 */
function mergeKanjiLists(existing: string[], newKanji: string[]): string[] {
  const merged = new Set([...existing, ...newKanji]);
  return Array.from(merged).sort();
}

async function main() {
  console.log("========================================");
  console.log("📥 Excelから部首データをインポート");
  console.log("========================================");
  console.log(`Excelファイル: ${excelPath}`);
  console.log(`出力先: ${radicalsDir}`);
  console.log();

  // ファイル存在確認
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ エラー: ${excelPath} が見つかりません`);
    process.exit(1);
  }

  // Excelファイルを読み込む
  console.log("📖 Excelファイルを読み込み中...");
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0]; // Sheet1を使用
  const worksheet = workbook.Sheets[sheetName];
  
  // JSON形式に変換（ヘッダー行をキーとして使用）
  const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
  
  console.log(`✅ ${rows.length} 行のデータを読み込みました`);
  console.log();

  // 統計情報
  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;
  const errors: Array<{ radical: string; reason: string }> = [];
  const skipped: Array<{ radical: string; reason: string }> = [];

  // 各行を処理
  for (const row of rows) {
    const { 部首, 偏旁通称, 偏旁種, 個数, 漢字 } = row;
    
    // 必須フィールドのチェック
    if (!偏旁通称 || !漢字) {
      skippedCount++;
      skipped.push({
        radical: 部首 || 偏旁通称 || "不明",
        reason: "偏旁通称または漢字が空",
      });
      continue;
    }

    // radicalList から対応する部首を検索
    const radicalEntry = findRadicalByJapaneseName(偏旁通称);
    
    if (!radicalEntry) {
      skippedCount++;
      skipped.push({
        radical: 偏旁通称,
        reason: `radicalList に該当する部首が見つかりません（部首: ${部首}, 偏旁種: ${偏旁種}）`,
      });
      continue;
    }

    // 漢字文字列を分割
    const kanjiArray = splitKanjiString(漢字);
    
    if (kanjiArray.length === 0) {
      skippedCount++;
      skipped.push({
        radical: 偏旁通称,
        reason: "漢字が抽出できませんでした",
      });
      continue;
    }

    // 既存データを読み込み
    const uniqueSlug = radicalEntry.en; // 必要に応じて getUniqueSlug を使用
    const existingKanji = loadExistingRadicalFile(uniqueSlug);
    
    // マージ（重複除去）
    const mergedKanji = mergeKanjiLists(existingKanji, kanjiArray);
    
    // JSONファイルに保存
    const outputPath = path.join(radicalsDir, `${uniqueSlug}.json`);
    fs.writeFileSync(
      outputPath,
      JSON.stringify(mergedKanji, null, 2),
      "utf8"
    );

    const addedCount = mergedKanji.length - existingKanji.length;
    const wasNew = existingKanji.length === 0;
    
    console.log(
      `✅ ${偏旁通称} (${radicalEntry.en}): ${kanjiArray.length}字 → 合計${mergedKanji.length}字` +
      (wasNew ? " [新規]" : ` [既存${existingKanji.length}字 + 追加${addedCount}字]`)
    );
    
    successCount++;
  }

  // 結果サマリー
  console.log();
  console.log("========================================");
  console.log("📊 処理結果サマリー");
  console.log("========================================");
  console.log(`✅ 成功: ${successCount} 件`);
  console.log(`⚠️  スキップ: ${skippedCount} 件`);
  console.log(`❌ エラー: ${errorCount} 件`);
  console.log();

  // スキップされた部首の詳細
  if (skipped.length > 0) {
    console.log("⚠️  スキップされた部首:");
    skipped.forEach((item) => {
      console.log(`  - ${item.radical}: ${item.reason}`);
    });
    console.log();
  }

  // エラーの詳細
  if (errors.length > 0) {
    console.log("❌ エラーが発生した部首:");
    errors.forEach((item) => {
      console.log(`  - ${item.radical}: ${item.reason}`);
    });
    console.log();
  }

  console.log("========================================");
  console.log("✅ インポート完了！");
  console.log("========================================");
  console.log();
  console.log("💡 次のステップ:");
  console.log("  1. /radical ページで登録数が正しく表示されるか確認");
  console.log("  2. /radical/{slug} ページで漢字一覧が正しく表示されるか確認");
  console.log("  3. スキップされた部首がある場合は、RADICAL_NAME_MAPPING に追加");
  console.log("========================================");
}

main().catch((error) => {
  console.error("❌ 予期しないエラーが発生しました:");
  console.error(error);
  process.exit(1);
});










