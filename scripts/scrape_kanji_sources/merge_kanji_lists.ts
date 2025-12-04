/**
 * 漢字リスト統合スクリプト
 * 全データをkanji_master.jsonに統合
 */

import * as fs from "fs";
import * as path from "path";
import { NormalizedKanji } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const INPUT_PATH = path.join(DATA_DIR, "kanji_normalized.json");
const OUTPUT_PATH = path.join(DATA_DIR, "kanji_master.json");
const DICTIONARY_PATH = path.join(DATA_DIR, "kanji-dictionary.json");

interface KanjiDictionaryEntry {
  kanji: string;
  on: string[];
  kun: string[];
  meaning: string[];
  grade: number;
  strokes: number;
  jlpt?: string;
  radicals?: string[];
}

interface MasterKanji {
  kanji: string;
  meaning: string;
  on?: string[];
  kun?: string[];
  grade?: number;
  strokes?: number;
  jlpt?: string;
  radicals?: string[];
  category: string[];
  sources: string[];
  difficulty?: number;
  examples?: string[];
  confusedWith?: string[];
}

function loadNormalizedData(): NormalizedKanji[] {
  if (!fs.existsSync(INPUT_PATH)) {
    console.error(`[!] Normalized data not found: ${INPUT_PATH}`);
    return [];
  }
  return JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
}

function loadDictionary(): Map<string, KanjiDictionaryEntry> {
  const map = new Map<string, KanjiDictionaryEntry>();
  if (!fs.existsSync(DICTIONARY_PATH)) {
    console.warn(`[!] Dictionary not found: ${DICTIONARY_PATH}`);
    return map;
  }
  const data: KanjiDictionaryEntry[] = JSON.parse(fs.readFileSync(DICTIONARY_PATH, "utf-8"));
  data.forEach((entry) => map.set(entry.kanji, entry));
  return map;
}

async function main() {
  console.log("[*] Merging kanji lists into master file...");
  
  const normalizedData = loadNormalizedData();
  const dictionary = loadDictionary();
  
  if (normalizedData.length === 0) {
    console.error("[!] No normalized data found. Run normalize_kanji_data.ts first.");
    return;
  }
  
  const masterList: MasterKanji[] = normalizedData.map((entry) => {
    const dictEntry = dictionary.get(entry.kanji);
    
    const masterEntry: MasterKanji = {
      kanji: entry.kanji,
      meaning: entry.meaning || (dictEntry?.meaning?.join(", ") || ""),
      category: entry.category,
      sources: entry.sources,
    };
    
    // 辞書データからの補完
    if (dictEntry) {
      masterEntry.on = dictEntry.on;
      masterEntry.kun = dictEntry.kun;
      masterEntry.grade = dictEntry.grade;
      masterEntry.strokes = dictEntry.strokes;
      masterEntry.jlpt = dictEntry.jlpt;
      masterEntry.radicals = dictEntry.radicals;
    }
    
    // オプショナルフィールド
    if (entry.difficulty) masterEntry.difficulty = entry.difficulty;
    if (entry.examples && entry.examples.length > 0) masterEntry.examples = entry.examples;
    if (entry.confusedWith && entry.confusedWith.length > 0) masterEntry.confusedWith = entry.confusedWith;
    
    return masterEntry;
  });
  
  // カテゴリ別統計
  const stats = {
    exam: 0,
    mistake: 0,
    confused: 0,
  };
  masterList.forEach((entry) => {
    if (entry.category.includes("exam")) stats.exam++;
    if (entry.category.includes("mistake")) stats.mistake++;
    if (entry.category.includes("confused")) stats.confused++;
  });
  
  // ソート（50音順）
  masterList.sort((a, b) => a.kanji.localeCompare(b.kanji, "ja"));
  
  // 保存
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(masterList, null, 2), "utf-8");
  
  console.log(`\n📊 Statistics:`);
  console.log(`   - Exam frequent: ${stats.exam}`);
  console.log(`   - Common mistakes: ${stats.mistake}`);
  console.log(`   - Confused pairs: ${stats.confused}`);
  console.log(`\n✅ kanji_master.json generated (${masterList.length} unique kanji)`);
}

main().catch(console.error);








