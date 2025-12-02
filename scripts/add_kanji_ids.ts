/**
 * kanji_master.json に id (uXXXX形式) を追加するスクリプト
 */

import * as fs from "fs";
import * as path from "path";

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
  confusedWith?: string[];
  examples?: string[];
  id?: string;
}

interface EnhancedKanji extends MasterKanji {
  id: string;
  readings: {
    on: string[];
    kun: string[];
  };
  radical: {
    name: string;
    meaning: string;
  };
}

const INPUT_PATH = path.join(process.cwd(), "data", "kanji_master.json");
const OUTPUT_PATH = path.join(process.cwd(), "data", "kanji_master.json");

function kanjiToUnicode(kanji: string): string {
  const codePoint = kanji.codePointAt(0);
  if (!codePoint) return "u0000";
  return `u${codePoint.toString(16).toLowerCase().padStart(4, "0")}`;
}

async function main() {
  console.log("[*] Loading kanji_master.json...");
  const data: MasterKanji[] = JSON.parse(fs.readFileSync(INPUT_PATH, "utf-8"));
  
  console.log(`[*] Adding IDs to ${data.length} kanji entries...`);
  
  const enhanced: EnhancedKanji[] = data.map((entry) => {
    const id = kanjiToUnicode(entry.kanji);
    
    return {
      ...entry,
      id,
      readings: {
        on: entry.on || [],
        kun: entry.kun || [],
      },
      radical: {
        name: entry.radicals?.[0] || "",
        meaning: `${entry.radicals?.[0] || ""} radical`,
      },
    };
  });
  
  // IDで重複チェック
  const idSet = new Set<string>();
  const duplicates: string[] = [];
  enhanced.forEach((e) => {
    if (idSet.has(e.id)) {
      duplicates.push(e.id);
    }
    idSet.add(e.id);
  });
  
  if (duplicates.length > 0) {
    console.warn(`[!] Warning: ${duplicates.length} duplicate IDs found`);
  }
  
  // 保存
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(enhanced, null, 2), "utf-8");
  
  console.log(`✅ kanji_master.json updated with IDs (${enhanced.length} entries)`);
  console.log(`   Sample ID: ${enhanced[0]?.kanji} → ${enhanced[0]?.id}`);
}

main().catch(console.error);



