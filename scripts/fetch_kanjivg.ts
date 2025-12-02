/**
 * KanjiVGからSVGファイルをダウンロード
 */

import * as fs from "fs";
import * as path from "path";

const KANJIVG_BASE_URL = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";

interface KanjiEntry {
  kanji: string;
  ucsHex: string;
  grade: number;
  strokes: number;
}

async function fetchSvg(ucsHex: string): Promise<string | null> {
  try {
    const url = `${KANJIVG_BASE_URL}/${ucsHex}.svg`;
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`⚠️ SVG not found: ${ucsHex}`);
      return null;
    }
    return await response.text();
  } catch (error) {
    console.error(`❌ Failed to fetch ${ucsHex}:`, error);
    return null;
  }
}

async function main() {
  const dataPath = path.join(process.cwd(), "data", "kanji-joyo.json");
  const outputDir = path.join(process.cwd(), "public", "kanjivg");

  // 出力ディレクトリを作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // 漢字リストを読み込み
  const kanjiList: KanjiEntry[] = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  
  console.log(`📥 Fetching ${kanjiList.length} SVG files from KanjiVG...`);

  let downloaded = 0;
  let skipped = 0;
  let failed = 0;

  for (const entry of kanjiList) {
    const outputPath = path.join(outputDir, `${entry.ucsHex}.svg`);
    
    // 既存ファイルはスキップ
    if (fs.existsSync(outputPath)) {
      skipped++;
      continue;
    }

    const svg = await fetchSvg(entry.ucsHex);
    if (svg) {
      fs.writeFileSync(outputPath, svg, "utf-8");
      downloaded++;
      console.log(`✅ ${entry.kanji} (${entry.ucsHex})`);
    } else {
      failed++;
    }

    // レート制限対策
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  console.log(`\n📊 Results:`);
  console.log(`   Downloaded: ${downloaded}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Failed: ${failed}`);
}

main().catch(console.error);





