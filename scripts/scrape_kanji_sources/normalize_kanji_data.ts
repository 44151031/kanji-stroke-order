/**
 * 漢字データ正規化スクリプト
 * 各ソースからのデータを統一フォーマットに変換
 */

import * as fs from "fs";
import * as path from "path";
import { KanjiEntry, NormalizedKanji } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");

interface SourceFile {
  filename: string;
  category: string;
}

const SOURCE_FILES: SourceFile[] = [
  { filename: "kanji_exam.json", category: "exam" },
  { filename: "kanji_mistake.json", category: "mistake" },
  { filename: "kanji_confused.json", category: "confused" },
];

function loadSourceFile(filename: string): KanjiEntry[] {
  const filePath = path.join(DATA_DIR, filename);
  if (!fs.existsSync(filePath)) {
    console.warn(`[!] File not found: ${filePath}`);
    return [];
  }
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function normalizeEntry(entry: KanjiEntry): NormalizedKanji {
  return {
    kanji: entry.kanji,
    meaning: entry.meaning || "",
    readings: entry.reading ? [entry.reading] : [],
    category: [entry.category],
    sources: [entry.source],
    difficulty: entry.difficulty,
    examples: entry.examples,
  };
}

function mergeNormalizedKanji(existing: NormalizedKanji, newEntry: NormalizedKanji): NormalizedKanji {
  return {
    kanji: existing.kanji,
    meaning: existing.meaning || newEntry.meaning,
    readings: [...new Set([...(existing.readings || []), ...(newEntry.readings || [])])],
    category: [...new Set([...existing.category, ...newEntry.category])],
    sources: [...new Set([...existing.sources, ...newEntry.sources])],
    difficulty: existing.difficulty || newEntry.difficulty,
    examples: [...new Set([...(existing.examples || []), ...(newEntry.examples || [])])],
    confusedWith: existing.confusedWith || newEntry.confusedWith,
  };
}

async function main() {
  console.log("[*] Normalizing kanji data...");
  
  const kanjiMap = new Map<string, NormalizedKanji>();
  let totalRecords = 0;
  
  for (const source of SOURCE_FILES) {
    console.log(`[*] Processing ${source.filename}...`);
    const entries = loadSourceFile(source.filename);
    
    for (const entry of entries) {
      const normalized = normalizeEntry(entry);
      totalRecords++;
      
      if (kanjiMap.has(normalized.kanji)) {
        const existing = kanjiMap.get(normalized.kanji)!;
        kanjiMap.set(normalized.kanji, mergeNormalizedKanji(existing, normalized));
      } else {
        kanjiMap.set(normalized.kanji, normalized);
      }
    }
  }
  
  // confusedWith情報を追加
  const confusedEntries = loadSourceFile("kanji_confused.json");
  confusedEntries.forEach((entry) => {
    if (kanjiMap.has(entry.kanji) && entry.examples) {
      const kanji = kanjiMap.get(entry.kanji)!;
      const confusedMatch = entry.examples.find((e) => e.startsWith("混同:"));
      if (confusedMatch) {
        const confusedKanji = confusedMatch.replace("混同: ", "").trim();
        kanji.confusedWith = kanji.confusedWith || [];
        if (!kanji.confusedWith.includes(confusedKanji)) {
          kanji.confusedWith.push(confusedKanji);
        }
      }
    }
  });
  
  const result = Array.from(kanjiMap.values()).sort((a, b) => 
    a.kanji.localeCompare(b.kanji, "ja")
  );
  
  // 正規化データを保存
  const outputPath = path.join(DATA_DIR, "kanji_normalized.json");
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), "utf-8");
  
  console.log(`✅ normalize_kanji_data.ts merged ${totalRecords} records`);
  console.log(`✅ kanji_normalized.json saved (${result.length} unique kanji)`);
}

main().catch(console.error);










