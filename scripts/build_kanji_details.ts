/**
 * 漢字詳細データ生成スクリプト
 * kanji-source.json から個別JSONファイルとkanji-dictionary.jsonを生成
 */

import * as fs from "fs";
import * as path from "path";

interface SourceKanji {
  strokes: number;
  grade: number;
  freq?: number;
  jlpt_old?: number;
  jlpt_new?: number;
  meanings?: string[];
  readings_on?: string[];
  readings_kun?: string[];
  wk_radicals?: string[];
}

interface KanjiDetail {
  kanji: string;
  on: string[];
  kun: string[];
  meaning: string[];
  jlpt: string | null;
  strokes: number;
  grade: number;
  ucsHex: string;
  freq?: number;
  radicals: string[];  // 部首
}

function getUcsHex(kanji: string): string {
  const codePoint = kanji.codePointAt(0);
  if (!codePoint) return "";
  return codePoint.toString(16).padStart(5, "0");
}

function jlptToString(jlpt: number | undefined): string | null {
  if (!jlpt) return null;
  return `N${jlpt}`;
}

async function main() {
  const sourcePath = path.join(process.cwd(), "data", "kanji-source.json");
  const joyoPath = path.join(process.cwd(), "data", "kanji-joyo.json");
  const detailsDir = path.join(process.cwd(), "data", "kanji-details");
  const dictionaryPath = path.join(process.cwd(), "data", "kanji-dictionary.json");

  // ディレクトリ作成
  if (!fs.existsSync(detailsDir)) {
    fs.mkdirSync(detailsDir, { recursive: true });
  }

  // ソースデータを読み込み
  const sourceData: Record<string, SourceKanji> = JSON.parse(
    fs.readFileSync(sourcePath, "utf-8")
  );

  // 常用漢字リストを読み込み
  interface JoyoEntry { kanji: string; grade: number; strokes: number; ucsHex: string; }
  const joyoList: JoyoEntry[] = JSON.parse(fs.readFileSync(joyoPath, "utf-8"));
  const joyoSet = new Set(joyoList.map((k) => k.kanji));

  const kanjiDetails: KanjiDetail[] = [];
  let processed = 0;

  console.log("📖 Generating kanji details...");

  for (const [kanji, data] of Object.entries(sourceData)) {
    // 常用漢字のみ処理
    if (!joyoSet.has(kanji)) continue;
    if (data.grade < 1 || data.grade > 8) continue;

    const detail: KanjiDetail = {
      kanji,
      on: data.readings_on || [],
      kun: data.readings_kun || [],
      meaning: data.meanings || [],
      jlpt: jlptToString(data.jlpt_new),
      strokes: data.strokes,
      grade: data.grade,
      ucsHex: getUcsHex(kanji),
      freq: data.freq,
      radicals: data.wk_radicals || [],
    };

    kanjiDetails.push(detail);

    // 個別JSONファイルを保存
    const detailPath = path.join(detailsDir, `${kanji}.json`);
    fs.writeFileSync(detailPath, JSON.stringify(detail, null, 2), "utf-8");

    processed++;
    if (processed % 500 === 0) {
      console.log(`   Processed ${processed} kanji...`);
    }
  }

  // 学年順・頻度順にソート
  kanjiDetails.sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    return (a.freq || 9999) - (b.freq || 9999);
  });

  // kanji-dictionary.json として保存
  fs.writeFileSync(dictionaryPath, JSON.stringify(kanjiDetails, null, 2), "utf-8");

  console.log(`\n✅ Generated ${processed} kanji detail files`);
  console.log(`📁 Individual files: ${detailsDir}/`);
  console.log(`📁 Dictionary: ${dictionaryPath}`);

  // 統計
  const stats = {
    total: kanjiDetails.length,
    withJlpt: kanjiDetails.filter((k) => k.jlpt).length,
    withMeaning: kanjiDetails.filter((k) => k.meaning.length > 0).length,
    withOn: kanjiDetails.filter((k) => k.on.length > 0).length,
    withKun: kanjiDetails.filter((k) => k.kun.length > 0).length,
    withRadicals: kanjiDetails.filter((k) => k.radicals.length > 0).length,
  };

  // 部首一覧を生成
  const allRadicals = new Set<string>();
  kanjiDetails.forEach((k) => k.radicals.forEach((r) => allRadicals.add(r)));
  
  console.log("\n📊 Statistics:");
  console.log(`   Total: ${stats.total}`);
  console.log(`   With JLPT: ${stats.withJlpt}`);
  console.log(`   With meanings: ${stats.withMeaning}`);
  console.log(`   With on-yomi: ${stats.withOn}`);
  console.log(`   With kun-yomi: ${stats.withKun}`);
  console.log(`   With radicals: ${stats.withRadicals}`);
  console.log(`   Unique radicals: ${allRadicals.size}`);
}

main().catch(console.error);
