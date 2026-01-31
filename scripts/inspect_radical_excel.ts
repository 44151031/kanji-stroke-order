#!/usr/bin/env tsx

/**
 * 調査用スクリプト: data/raw/へんとかんじ.xlsx の構造を確認
 */

import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";
import radicalList, { getEnglishDisplayName } from "../src/lib/radicalList";

const excelPath = path.join(process.cwd(), "data", "raw", "へんとかんじ.xlsx");

if (!fs.existsSync(excelPath)) {
  console.error(`❌ エラー: ${excelPath} が見つかりません`);
  process.exit(1);
}

console.log("========================================");
console.log("📊 Excelファイル構造調査");
console.log("========================================");
console.log(`ファイル: ${excelPath}\n`);

// Excelファイルを読み込む
const workbook = XLSX.readFile(excelPath);

console.log("📋 シート一覧:");
workbook.SheetNames.forEach((name, index) => {
  console.log(`  ${index + 1}. ${name}`);
});
console.log();

// 各シートの内容を確認
for (const sheetName of workbook.SheetNames) {
  console.log("========================================");
  console.log(`📄 シート: "${sheetName}"`);
  console.log("========================================");
  
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
  
  console.log(`行数: ${data.length}`);
  console.log();
  
  // 最初の5行を表示
  console.log("最初の5行:");
  for (let i = 0; i < Math.min(5, data.length); i++) {
    const row = data[i] as any[];
    console.log(`  行${i + 1}:`, row);
  }
  console.log();
  
  // ヘッダー行を特定（最初の行をヘッダーとして扱う）
  if (data.length > 0) {
    const headers = data[0] as any[];
    console.log("ヘッダー行:");
    headers.forEach((header, index) => {
      console.log(`  列${index + 1}: ${header}`);
    });
    console.log();
  }
  
  // データ行のサンプル（ヘッダー以外の最初の3行）
  if (data.length > 1) {
    console.log("データ行サンプル（最初の3行）:");
    for (let i = 1; i < Math.min(4, data.length); i++) {
      const row = data[i] as any[];
      console.log(`  行${i + 1}:`, row);
    }
  }
  console.log();
}

// 部首とのマッピング可能性を確認
console.log("========================================");
console.log("🔍 部首マッピング可能性の確認");
console.log("========================================");

const firstSheetName = workbook.SheetNames[0];
const firstSheet = workbook.Sheets[firstSheetName];
const firstSheetData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 }) as any[][];

if (firstSheetData.length > 0) {
  const headers = firstSheetData[0];
  
  // 部首名らしき列を探す
  const possibleRadicalColumns: number[] = [];
  headers.forEach((header, index) => {
    const headerStr = String(header || "").toLowerCase();
    if (
      headerStr.includes("部首") ||
      headerStr.includes("radical") ||
      headerStr.includes("へん") ||
      headerStr.includes("つくり") ||
      headerStr.includes("かんむり") ||
      headerStr.includes("あし") ||
      headerStr.includes("たれ") ||
      headerStr.includes("かまえ") ||
      headerStr.includes("にょう")
    ) {
      possibleRadicalColumns.push(index);
    }
  });
  
  // 漢字らしき列を探す
  const possibleKanjiColumns: number[] = [];
  headers.forEach((header, index) => {
    const headerStr = String(header || "").toLowerCase();
    if (
      headerStr.includes("漢字") ||
      headerStr.includes("kanji") ||
      headerStr.includes("字") ||
      headerStr === "1" || // 最初の列が漢字の可能性
      index === 0 // デフォルトで最初の列をチェック
    ) {
      possibleKanjiColumns.push(index);
    }
  });
  
  console.log("部首名らしき列:", possibleRadicalColumns.map(i => headers[i]));
  console.log("漢字らしき列:", possibleKanjiColumns.map(i => headers[i]));
  console.log();
  
  // データ行から部首と漢字の関係を抽出（最初の10行）
  console.log("データサンプル（部首と漢字の関係）:");
  for (let i = 1; i < Math.min(11, firstSheetData.length); i++) {
    const row = firstSheetData[i];
    if (row && row.length > 0) {
      const kanji = possibleKanjiColumns.length > 0 ? row[possibleKanjiColumns[0]] : row[0];
      const radical = possibleRadicalColumns.length > 0 ? row[possibleRadicalColumns[0]] : null;
      console.log(`  行${i}: 漢字=${kanji}, 部首=${radical || "なし"}`);
    }
  }
}

console.log("========================================");
console.log("✅ 調査完了");
console.log("========================================");










