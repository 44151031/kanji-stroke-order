#!/usr/bin/env tsx

import fs from "fs";
import path from "path";

/**
 * 常用漢字2136字のカバレッジチェック
 * kanji-joyo.json と kanji_master.json を比較して未登録の漢字を検出
 */

const joyoPath = path.join(process.cwd(), "data", "kanji-joyo.json");
const kanjiPath = path.join(process.cwd(), "data", "kanji_master.json");

// ファイル存在確認
if (!fs.existsSync(joyoPath)) {
  console.error(`❌ エラー: ${joyoPath} が見つかりません`);
  process.exit(1);
}

if (!fs.existsSync(kanjiPath)) {
  console.error(`❌ エラー: ${kanjiPath} が見つかりません`);
  process.exit(1);
}

interface JoyoEntry {
  kanji: string;
  ucsHex?: string;
  grade?: number;
  strokes?: number;
}

interface MasterKanji {
  kanji: string;
  [key: string]: any;
}

const joyoList: JoyoEntry[] = JSON.parse(fs.readFileSync(joyoPath, "utf8"));
const kanjiList: MasterKanji[] = JSON.parse(fs.readFileSync(kanjiPath, "utf8"));

// 常用漢字の漢字一覧を取得（重複除去）
const joyoKanjiSet = new Set(joyoList.map((entry) => entry.kanji));
const masterKanjiSet = new Set(kanjiList.map((item) => item.kanji));

// 未登録の漢字を検出
const missing = Array.from(joyoKanjiSet).filter(
  (k) => !masterKanjiSet.has(k)
);

// 逆に、masterにしかない漢字（常用漢字外）
const extra = Array.from(masterKanjiSet).filter(
  (k) => !joyoKanjiSet.has(k)
);

console.log("========================================");
console.log("📘 常用漢字カバレッジ チェック結果");
console.log("========================================");
console.log(`📖 常用漢字総数: ${joyoKanjiSet.size} 字`);
console.log(`🈶 登録済み: ${masterKanjiSet.size} 字`);
console.log(`⚠️  未登録: ${missing.length} 字`);

if (missing.length > 0) {
  console.log("----------------------------------------");
  console.log("未登録の常用漢字:");
  // 50字ごとに改行
  const chunkSize = 50;
  for (let i = 0; i < missing.length; i += chunkSize) {
    const chunk = missing.slice(i, i + chunkSize);
    console.log(chunk.join(" "));
  }
  console.log("----------------------------------------");
  console.log("💡 対応方法: データ整備または radical マッピング修正を確認してください。");
} else {
  console.log("✅ 全常用漢字が登録済みです！");
}

if (extra.length > 0) {
  console.log("----------------------------------------");
  console.log(`ℹ️  常用漢字外の登録漢字: ${extra.length} 字`);
}

console.log("========================================");










