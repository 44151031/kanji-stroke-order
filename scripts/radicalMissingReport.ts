#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import radicalList, { getEnglishDisplayName } from "../src/lib/radicalList";

/**
 * 部首ごとの登録漢字数レポート
 * radicalList と kanji_master.json を照合して、各部首に紐づく漢字の数を集計
 */

const kanjiPath = path.join(process.cwd(), "data", "kanji_master.json");

// ファイル存在確認
if (!fs.existsSync(kanjiPath)) {
  console.error(`❌ エラー: ${kanjiPath} が見つかりません`);
  process.exit(1);
}

interface MasterKanji {
  kanji: string;
  radical?: {
    name: string;
    meaning?: string;
  };
  radicals?: string[];
  [key: string]: any;
}

const kanjiList: MasterKanji[] = JSON.parse(fs.readFileSync(kanjiPath, "utf8"));

// 各部首ごとの漢字件数を計算
const report = radicalList.map((radical) => {
  const englishName = getEnglishDisplayName(radical.en);
  
  const count = kanjiList.filter((k) => {
    // radical.name が一致するか
    if (k.radical?.name === englishName) return true;
    // radicals 配列に含まれているか
    if (Array.isArray(k.radicals) && k.radicals.includes(englishName)) return true;
    return false;
  }).length;

  return {
    symbol: radical.root || "-",
    name: `${radical.jp} (${englishName})`,
    slug: radical.en,
    type: radical.type,
    count,
  };
});

// 件数でソート（少ない順）
report.sort((a, b) => a.count - b.count);

console.log("===============================================");
console.log("📘 部首ごとの登録漢字数 レポート");
console.log("===============================================");
console.log(`部首総数: ${report.length}`);
console.log(`登録漢字総数: ${kanjiList.length}`);
console.log("-----------------------------------------------");

// ステータス別にグループ化
const zeroCount = report.filter((r) => r.count === 0);
const lowCount = report.filter((r) => r.count > 0 && r.count < 3);
const normalCount = report.filter((r) => r.count >= 3);

console.log(`⚠️  登録0件: ${zeroCount.length} 部首`);
console.log(`⚠️  登録1-2件: ${lowCount.length} 部首`);
console.log(`✅ 登録3件以上: ${normalCount.length} 部首`);
console.log("-----------------------------------------------");

// 詳細レポート
console.log("\n【登録0件の部首】");
if (zeroCount.length > 0) {
  zeroCount.forEach((r) => {
    console.log(`  ${r.symbol} ${r.name} (${r.slug}) - ${r.type}`);
  });
} else {
  console.log("  なし");
}

console.log("\n【登録1-2件の部首】");
if (lowCount.length > 0) {
  lowCount.forEach((r) => {
    console.log(`  ${r.symbol} ${r.name} (${r.slug}) - ${r.count}件 - ${r.type}`);
  });
} else {
  console.log("  なし");
}

console.log("\n【登録3件以上の部首（上位10件）】");
const topRadicals = normalCount
  .sort((a, b) => b.count - a.count)
  .slice(0, 10);
topRadicals.forEach((r) => {
  console.log(`  ${r.symbol} ${r.name} - ${r.count}件`);
});

console.log("===============================================");
console.log("💡 登録0件または少数の部首がある場合は、データ整備を確認してください。");
console.log("===============================================");







