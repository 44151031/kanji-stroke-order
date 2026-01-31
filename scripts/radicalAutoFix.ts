#!/usr/bin/env tsx

import fs from "fs";
import path from "path";
import { getEnglishDisplayName } from "../src/lib/radicalList";

/**
 * 部首データの自動補完
 * 欠落している代表的部首を自動補完し、kanjiMaster_fixed.json に出力
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

/**
 * 部首補完マップ
 * 漢字 → 部首名（英語表示名）のマッピング
 */
const correctionMap: Record<string, string> = {
  // しんにょう（movement-radical）
  道: "Movement",
  週: "Movement",
  送: "Movement",
  逃: "Movement",
  遊: "Movement",
  進: "Movement",
  退: "Movement",
  迷: "Movement",
  追: "Movement",
  遂: "Movement",
  通: "Movement",
  過: "Movement",
  運: "Movement",
  遠: "Movement",
  達: "Movement",
  連: "Movement",
  選: "Movement",
  適: "Movement",
  速: "Movement",
  違: "Movement",
  
  // ころもへん（clothing-radical）
  表: "Clothes",
  装: "Clothes",
  裁: "Clothes",
  袋: "Clothes",
  被: "Clothes",
  襲: "Clothes",
  複: "Clothes",
  補: "Clothes",
  初: "Clothes",
  製: "Clothes",
  裏: "Clothes",
  裸: "Clothes",
  
  // 心（heart-radical, kokoro-radical）
  思: "Heart",
  恵: "Heart",
  恋: "Heart",
  怒: "Heart",
  恐: "Heart",
  悩: "Heart",
  悲: "Heart",
  情: "Heart",
  慈: "Heart",
  念: "Heart",
  感: "Heart",
  想: "Heart",
  悪: "Heart",
  愛: "Heart",
  憂: "Heart",
  慣: "Heart",
  慢: "Heart",
  忙: "Heart",
  快: "Heart",
  性: "Heart",
};

let updatedCount = 0;
const updateLog: Array<{ kanji: string; from?: string; to: string }> = [];

const fixedList = kanjiList.map((entry) => {
  const entryCopy = { ...entry };
  
  // 既に radical.name が設定されている場合はスキップ
  if (entryCopy.radical?.name) {
    return entryCopy;
  }
  
  // 補完マップに該当する漢字があるかチェック
  const targetRadicalName = correctionMap[entry.kanji];
  
  if (targetRadicalName) {
    const previousRadical = entryCopy.radical?.name || "なし";
    
    // radical オブジェクトを作成または更新
    if (!entryCopy.radical) {
      entryCopy.radical = {
        name: targetRadicalName,
        meaning: `${targetRadicalName} radical`,
      };
    } else {
      entryCopy.radical.name = targetRadicalName;
      if (!entryCopy.radical.meaning) {
        entryCopy.radical.meaning = `${targetRadicalName} radical`;
      }
    }
    
    // radicals 配列にも追加（存在する場合）
    if (!entryCopy.radicals) {
      entryCopy.radicals = [];
    }
    if (!entryCopy.radicals.includes(targetRadicalName)) {
      entryCopy.radicals.push(targetRadicalName);
    }
    
    updatedCount++;
    updateLog.push({
      kanji: entry.kanji,
      from: previousRadical,
      to: targetRadicalName,
    });
  }
  
  return entryCopy;
});

const fixedPath = path.join(process.cwd(), "data", "kanjiMaster_fixed.json");
fs.writeFileSync(fixedPath, JSON.stringify(fixedList, null, 2), "utf8");

console.log("========================================");
console.log("🛠 自動補完結果");
console.log("========================================");

// 部首ごとの補完数を集計
const radicalStats: Record<string, number> = {};
updateLog.forEach((log) => {
  radicalStats[log.to] = (radicalStats[log.to] || 0) + 1;
});

for (const [radical, count] of Object.entries(radicalStats)) {
  const totalInList = fixedList.filter(
    (k) => k.radical?.name === radical || k.radicals?.includes(radical)
  ).length;
  console.log(`${radical}: 今回補完 ${count}件 / 補完後総数 ${totalInList}件`);
}

console.log("----------------------------------------");
console.log(`💾 出力: ${fixedPath}`);
console.log(`合計補完数: ${updatedCount} 件`);

if (updatedCount > 0) {
  console.log("----------------------------------------");
  console.log("補完詳細（最初の10件）:");
  updateLog.slice(0, 10).forEach((log) => {
    console.log(`  ${log.kanji}: ${log.from || "なし"} → ${log.to}`);
  });
  if (updateLog.length > 10) {
    console.log(`  ... 他 ${updateLog.length - 10} 件`);
  }
}

console.log("========================================");
console.log("💡 元データ (kanji_master.json) は変更されていません。");
console.log("   修正済みデータは kanjiMaster_fixed.json に出力されました。");
console.log("========================================");










