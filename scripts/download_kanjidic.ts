/**
 * KANJIDIC2から常用漢字データをダウンロード・解析するスクリプト
 */

import * as fs from "fs";
import * as path from "path";
import { parseStringPromise } from "xml2js";
import { createGunzip } from "zlib";
import { pipeline } from "stream/promises";
import { Readable } from "stream";

const KANJIDIC2_URL = "http://www.edrdg.org/kanjidic/kanjidic2.xml.gz";

interface KanjiEntry {
  kanji: string;
  grade: number;
  strokes: number;
}

async function downloadAndExtract(): Promise<string> {
  console.log("📥 Downloading KANJIDIC2...");
  
  const response = await fetch(KANJIDIC2_URL);
  if (!response.ok) throw new Error("Failed to download KANJIDIC2");
  
  const arrayBuffer = await response.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  
  // Gunzip解凍
  const gunzip = createGunzip();
  const chunks: Buffer[] = [];
  
  await pipeline(
    Readable.from(buffer),
    gunzip,
    async function* (source) {
      for await (const chunk of source) {
        chunks.push(chunk);
        yield chunk;
      }
    }
  );
  
  return Buffer.concat(chunks).toString("utf-8");
}

async function parseKanjidic(xml: string): Promise<KanjiEntry[]> {
  console.log("📖 Parsing KANJIDIC2...");
  
  const result = await parseStringPromise(xml);
  const characters = result.kanjidic2.character;
  
  const joyoKanji: KanjiEntry[] = [];
  
  for (const char of characters) {
    const literal = char.literal[0];
    const misc = char.misc?.[0];
    
    if (!misc) continue;
    
    // 常用漢字かチェック（gradeが1-8）
    const gradeNode = misc.grade?.[0];
    if (!gradeNode) continue;
    
    const grade = parseInt(gradeNode, 10);
    if (isNaN(grade) || grade < 1 || grade > 8) continue;
    
    // 画数
    const strokeCount = misc.stroke_count?.[0];
    const strokes = strokeCount ? parseInt(strokeCount, 10) : 0;
    
    joyoKanji.push({
      kanji: literal,
      grade: grade,
      strokes: strokes,
    });
  }
  
  return joyoKanji;
}

async function main() {
  try {
    const xml = await downloadAndExtract();
    const kanjiList = await parseKanjidic(xml);
    
    // 学年順・漢字コード順にソート
    kanjiList.sort((a, b) => {
      if (a.grade !== b.grade) return a.grade - b.grade;
      return a.kanji.localeCompare(b.kanji);
    });
    
    console.log(`✅ Found ${kanjiList.length} Joyo kanji`);
    
    // JSONに保存
    const outputPath = path.join(process.cwd(), "data", "kanji-joyo-full.json");
    fs.writeFileSync(outputPath, JSON.stringify(kanjiList, null, 2), "utf-8");
    console.log(`📁 Saved to ${outputPath}`);
    
    // build_joyo_index.ts用のTypeScriptコードを生成
    generateTsCode(kanjiList);
    
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

function generateTsCode(kanjiList: KanjiEntry[]) {
  const tsPath = path.join(process.cwd(), "data", "joyo-data.ts");
  
  let code = `// 常用漢字2136字データ（KANJIDIC2より自動生成）
// 生成日: ${new Date().toISOString().split("T")[0]}

export const JOYO_DATA: Array<{ kanji: string; grade: number; strokes: number }> = [\n`;
  
  for (const k of kanjiList) {
    code += `  { kanji: "${k.kanji}", grade: ${k.grade}, strokes: ${k.strokes} },\n`;
  }
  
  code += "];\n";
  
  fs.writeFileSync(tsPath, code, "utf-8");
  console.log(`📁 TypeScript data saved to ${tsPath}`);
}

main();




