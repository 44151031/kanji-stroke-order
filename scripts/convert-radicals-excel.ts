/**
 * Excel → JSON 変換スクリプト
 * 「へんとかんじ.xlsx」から部首ごとの常用漢字一覧JSONを生成
 * 
 * 使用方法: npx ts-node scripts/convert-radicals-excel.ts
 */

import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

// 部首名 → 英語スラッグのマッピング
const radicalMap: Record<string, string> = {
  // へん（左側）
  "ごんべん": "speech-radical",
  "にんべん": "person-radical",
  "さんずい": "water-radical",
  "てへん": "hand-radical",
  "きへん": "tree-radical",
  "いとへん": "thread-radical",
  "かねへん": "metal-radical",
  "ひへん": "fire-radical",
  "くちへん": "mouth-radical",
  "りっしんべん": "heart-radical",
  "おんなへん": "woman-radical",
  "しめすへん": "altar-radical",
  "にくづき": "flesh-radical",
  "むしへん": "insect-radical",
  "うまへん": "horse-radical",
  "やまへん": "mountain-radical",
  "ころもへん": "clothing-radical",
  "あしへん": "foot-radical",
  "たまへん": "jewel-radical",
  "いしへん": "stone-radical",
  "かいへん": "shell-radical",
  "のぎへん": "grain-radical",
  "とりへん": "bird-radical",
  "つちへん": "earth-radical",
  "にちへん": "sun-radical",
  "めへん": "eye-radical",
  "うしへん": "cow-radical",
  "けものへん": "animal-radical",
  "かたなへん": "katana-radical",
  "ゆみへん": "bow-radical",
  "くるまへん": "vehicle-radical",
  "さけへん": "alcohol-radical",
  "やへん": "arrow-radical",
  
  // かんむり（上部）
  "くさかんむり": "grass-radical",
  "あめかんむり": "rain-radical",
  "あなかんむり": "cave-radical",
  "たけかんむり": "bamboo-radical",
  "うかんむり": "roof-radical",
  "わかんむり": "crown-radical",
  "はつがしら": "departure-radical",
  
  // つくり（右側）
  "おおがい": "big-shell-radical",
  "ちから": "power-radical",
  "おおざと": "village-radical",
  "ふるとり": "short-tailed-bird-radical",
  "とます": "measure-radical",
  "ほこづくり": "weapon-radical",
  
  // あし（下部）
  "ひとあし": "legs-radical",
  "れっか": "fire-dots-radical",
  "したごころ": "heart-bottom-radical",
  "さら": "dish-radical",
  
  // たれ（垂れ）
  "やまいだれ": "sickness-radical",
  "まだれ": "dotted-cliff-radical",
  "しかばね": "corpse-radical",
  "がんだれ": "cliff-radical",
  
  // にょう（繞）
  "しんにょう": "movement-radical",
  "えんにょう": "long-stride-radical",
  "そうにょう": "run-radical",
  
  // かまえ（構）
  "もんがまえ": "gate-radical",
  "くにがまえ": "country-radical",
  "はこがまえ": "box-radical",
  "つつみがまえ": "wrap-radical",
};

// ローマ字変換用（フォールバック）
function toRomaji(text: string): string {
  const map: Record<string, string> = {
    "あ": "a", "い": "i", "う": "u", "え": "e", "お": "o",
    "か": "ka", "き": "ki", "く": "ku", "け": "ke", "こ": "ko",
    "さ": "sa", "し": "shi", "す": "su", "せ": "se", "そ": "so",
    "た": "ta", "ち": "chi", "つ": "tsu", "て": "te", "と": "to",
    "な": "na", "に": "ni", "ぬ": "nu", "ね": "ne", "の": "no",
    "は": "ha", "ひ": "hi", "ふ": "fu", "へ": "he", "ほ": "ho",
    "ま": "ma", "み": "mi", "む": "mu", "め": "me", "も": "mo",
    "や": "ya", "ゆ": "yu", "よ": "yo",
    "ら": "ra", "り": "ri", "る": "ru", "れ": "re", "ろ": "ro",
    "わ": "wa", "を": "wo", "ん": "n",
    "が": "ga", "ぎ": "gi", "ぐ": "gu", "げ": "ge", "ご": "go",
    "ざ": "za", "じ": "ji", "ず": "zu", "ぜ": "ze", "ぞ": "zo",
    "だ": "da", "ぢ": "di", "づ": "du", "で": "de", "ど": "do",
    "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
    "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
    "ゃ": "ya", "ゅ": "yu", "ょ": "yo", "っ": "", "ー": "",
  };
  let result = "";
  for (const char of text) {
    result += map[char] || char;
  }
  return result.toLowerCase().replace(/\s+/g, "-");
}

// スラッグを取得（マップにない場合はローマ字変換）
function getSlug(jp: string): string {
  const normalized = jp.trim().toLowerCase();
  if (radicalMap[normalized]) {
    return radicalMap[normalized];
  }
  // フォールバック: ローマ字変換 + "-radical"
  return `${toRomaji(normalized)}-radical`;
}

interface ExcelRow {
  部首?: string;
  偏旁通称?: string;
  偏旁種?: string;
  個数?: number;
  漢字?: string;
  [key: string]: unknown;
}

async function main() {
  const inputPath = path.join(process.cwd(), "data", "raw", "へんとかんじ.xlsx");
  const outputDir = path.join(process.cwd(), "data", "radicals");

  // 入力ファイルの確認
  if (!fs.existsSync(inputPath)) {
    console.error(`❌ Excel ファイルが見つかりません: ${inputPath}`);
    process.exit(1);
  }

  // 出力ディレクトリの作成
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    console.log(`📁 ディレクトリを作成: ${outputDir}`);
  }

  // Excel ファイルを読み込み
  console.log(`📖 Excel ファイルを読み込み中: ${inputPath}`);
  const workbook = XLSX.readFile(inputPath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows: ExcelRow[] = XLSX.utils.sheet_to_json(sheet);

  console.log(`📊 ${rows.length} 行を読み込みました`);
  console.log(`📋 列名: ${Object.keys(rows[0] || {}).join(", ")}`);

  // 部首ごとに漢字をグループ化
  const radicalKanjiMap = new Map<string, Set<string>>();

  for (const row of rows) {
    // 偏旁通称 または 部首 列から部首名を取得
    const jp = (row["偏旁通称"] || row["部首"] || "").toString().trim();
    if (!jp) continue;

    // 漢字列を取得
    const kanjiString = (row["漢字"] || "").toString().trim();
    if (!kanjiString) continue;

    const slug = getSlug(jp);
    
    // 漢字を1文字ずつ分割
    const kanjiArray = kanjiString.split("").filter((c) => {
      // CJK統合漢字の範囲をチェック
      const code = c.charCodeAt(0);
      return (code >= 0x4E00 && code <= 0x9FFF) || // CJK統合漢字
             (code >= 0x3400 && code <= 0x4DBF) || // CJK統合漢字拡張A
             (code >= 0x20000 && code <= 0x2A6DF); // CJK統合漢字拡張B
    });

    if (kanjiArray.length === 0) continue;

    // マップに追加（同じ偏旁が複数行ある場合はマージ）
    if (!radicalKanjiMap.has(slug)) {
      radicalKanjiMap.set(slug, new Set());
    }
    const kanjiSet = radicalKanjiMap.get(slug)!;
    kanjiArray.forEach((k) => kanjiSet.add(k));

    console.log(`  ${jp} → ${slug}: ${kanjiArray.length}字追加`);
  }

  // JSON ファイルを出力
  let totalFiles = 0;
  let totalKanji = 0;

  for (const [slug, kanjiSet] of radicalKanjiMap) {
    const kanjiArray = Array.from(kanjiSet);
    const filePath = path.join(outputDir, `${slug}.json`);
    
    fs.writeFileSync(filePath, JSON.stringify(kanjiArray, null, 2), "utf8");
    console.log(`✅ ${slug}.json (${kanjiArray.length}字)`);
    
    totalFiles++;
    totalKanji += kanjiArray.length;
  }

  console.log(`\n🎉 完了: ${totalFiles} ファイル、合計 ${totalKanji} 字`);
}

main().catch(console.error);
















