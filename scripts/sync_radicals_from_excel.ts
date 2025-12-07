#!/usr/bin/env tsx

/**
 * エクセルファイルから部首データを完全同期するスクリプト
 * 
 * 処理内容:
 * 1. data/raw/へんとかんじ.xlsx を読み込む
 * 2. radicalList.ts を完全に書き換え（エクセルの内容に合わせる）
 * 3. data/radicals/{slug}.json を完全に書き換え（エクセルの漢字を1文字ずつ分割）
 * 4. エクセルにない部首や漢字は削除
 * 5. エクセルにある部首でまだないものは追加
 * 
 * 注意: 既存の英語スラッグ（en）や表示名は可能な限り維持する
 */

import * as XLSX from "xlsx";
import * as fs from "fs";
import * as path from "path";

const excelPath = path.join(process.cwd(), "data", "raw", "へんとかんじ.xlsx");
const radicalsDir = path.join(process.cwd(), "data", "radicals");
const radicalListPath = path.join(process.cwd(), "src", "lib", "radicalList.ts");

// ディレクトリが存在しない場合は作成
if (!fs.existsSync(radicalsDir)) {
  fs.mkdirSync(radicalsDir, { recursive: true });
}

interface ExcelRow {
  部首: string;
  偏旁通称: string;
  偏旁種: string;
  個数: number;
  漢字: string;
}

interface RadicalData {
  jp: string;        // 偏旁通称
  en: string;        // 英語スラッグ（生成または既存マッピングから）
  root?: string;     // 部首（エクセルの「部首」列）
  type: string;      // 偏旁種から変換
  typeJa: string;    // 偏旁種
  anchor: string;    // 例: "radical#left-radical"
  count: number;     // 個数
  kanji: string[];   // 漢字配列
}

/**
 * 偏旁種を英語のtypeに変換
 */
function convertHenboTypeToEnglish(henboType: string): { type: string; typeJa: string } {
  const mapping: Record<string, { type: string; typeJa: string }> = {
    "偏": { type: "left-radical", typeJa: "偏" },
    "旁": { type: "right-radical", typeJa: "旁" },
    "冠": { type: "top-radical", typeJa: "冠" },
    "脚": { type: "bottom-radical", typeJa: "脚" },
    "垂": { type: "hanging-radical", typeJa: "垂" },
    "構": { type: "enclosing-radical", typeJa: "構" },
    "繞": { type: "wrapping-radical", typeJa: "繞" },
  };
  
  return mapping[henboType] || { type: "independent-radical", typeJa: "他" };
}

/**
 * 既存の radicalList.ts から英語スラッグのマッピングを読み込む
 */
function loadExistingSlugMapping(): Record<string, string> {
  try {
    const radicalListPath = path.join(process.cwd(), "src", "lib", "radicalList.ts");
    const content = fs.readFileSync(radicalListPath, "utf8");
    const mapping: Record<string, string> = {};
    
    // { jp: "ごんべん", en: "speech-radical", ... } のパターンを抽出
    const regex = /jp:\s*"([^"]+)",\s*en:\s*"([^"]+)"/g;
    let match;
    while ((match = regex.exec(content)) !== null) {
      mapping[match[1]] = match[2];
    }
    
    return mapping;
  } catch {
    return {};
  }
}

/**
 * 日本語名から英語スラッグを生成（既存の radicalList のマッピングを参考）
 */
function generateEnglishSlug(jpName: string, henboType: string, existingMapping: Record<string, string>): string {
  // 「・」が含まれている場合は最初の部分を抽出（例：「しんにょう・しんにゅう」→「しんにょう」）
  const normalizedName = jpName.split("・")[0].trim();
  
  // 既存マッピング（ファイルから読み込んだもの）を優先（正規化名でチェック）
  if (existingMapping[normalizedName]) {
    return existingMapping[normalizedName];
  }
  
  // 完全一致でもチェック（元の名前で）
  if (existingMapping[jpName]) {
    return existingMapping[jpName];
  }
  
  // 既存のマッピングテーブル（フォールバック用）
  const defaultMapping: Record<string, string> = {
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
    "くさかんむり": "grass-radical",
    "あめかんむり": "rain-radical",
    "あなかんむり": "cave-radical",
    "たけかんむり": "bamboo-radical",
    "うかんむり": "roof-radical",
    "わかんむり": "crown-radical",
    "はつがしら": "departure-radical",
    "おおがい": "big-shell-radical",
    "ちから": "power-radical",
    "おおざと": "village-radical",
    "ふるとり": "short-tailed-bird-radical",
    "とます": "measure-radical",
    "ほこづくり": "weapon-radical",
    "ひとあし": "legs-radical",
    "れっか": "fire-dots-radical",
    "したごころ": "heart-bottom-radical",
    "さら": "dish-radical",
    "やまいだれ": "sickness-radical",
    "まだれ": "dotted-cliff-radical",
    "しかばね": "corpse-radical",
    "がんだれ": "cliff-radical",
    "しんにょう": "movement-radical",
    "えんにょう": "long-stride-radical",
    "そうにょう": "run-radical",
    "もんがまえ": "gate-radical",
    "くにがまえ": "country-radical",
    "はこがまえ": "box-radical",
    "つつみがまえ": "wrap-radical",
  };
  
  // デフォルトマッピングをチェック（正規化名で）
  if (defaultMapping[normalizedName]) {
    return defaultMapping[normalizedName];
  }
  
  // 完全一致でもチェック（元の名前で）
  if (defaultMapping[jpName]) {
    return defaultMapping[jpName];
  }
  
  // 新規の場合は日本語名から自動生成
  // ローマ字変換の簡易版
  const romajiMap: Record<string, string> = {
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
    "だ": "da", "ぢ": "ji", "づ": "zu", "で": "de", "ど": "do",
    "ば": "ba", "び": "bi", "ぶ": "bu", "べ": "be", "ぼ": "bo",
    "ぱ": "pa", "ぴ": "pi", "ぷ": "pu", "ぺ": "pe", "ぽ": "po",
  };
  
  // 簡易的なローマ字変換（最初の2文字程度）
  let romaji = "";
  for (const char of normalizedName.slice(0, 4)) {
    if (romajiMap[char]) {
      romaji += romajiMap[char];
    } else {
      // マッピングにない文字はそのまま追加（ひらがな以外の可能性）
      romaji += char.toLowerCase();
    }
  }
  
  // 既存の命名規則に従う（例：speech-radical, water-radical）
  // まず、既存のマッピングから命名規則を推測
  // 簡易的な命名規則: 正規化名の最初の部分 + "-radical"
  // ただし、既存の命名規則に合わせるため、できるだけ簡潔に
  
  // よく使われる接尾辞を除去
  let baseName = normalizedName;
  const suffixes = ["へん", "かんむり", "つくり", "あし", "たれ", "にょう", "がまえ"];
  for (const suffix of suffixes) {
    if (baseName.endsWith(suffix)) {
      baseName = baseName.slice(0, -suffix.length);
      break;
    }
  }
  
  // ローマ字変換
  let slug = "";
  for (const char of baseName.slice(0, 6)) {
    if (romajiMap[char]) {
      slug += romajiMap[char];
    }
  }
  
  // slugが空の場合は、正規化名全体を使用
  if (!slug) {
    for (const char of normalizedName.slice(0, 6)) {
      if (romajiMap[char]) {
        slug += romajiMap[char];
      }
    }
  }
  
  const { type } = convertHenboTypeToEnglish(henboType);
  const typePrefix = type.replace("-radical", "");
  
  return `${slug}-${typePrefix}-radical`;
}

/**
 * 漢字文字列を1文字ずつ分割して配列化
 */
function splitKanjiString(kanjiStr: string): string[] {
  if (!kanjiStr || typeof kanjiStr !== "string") {
    return [];
  }
  
  const kanjiArray: string[] = [];
  for (const char of kanjiStr) {
    if (char.trim()) {
      kanjiArray.push(char);
    }
  }
  
  return kanjiArray;
}

/**
 * radicalList.ts を生成
 */
function generateRadicalListFile(radicals: RadicalData[]): string {
  const imports = `export interface Radical {
  jp: string;        // 日本語名（例: ごんべん）
  en: string;        // 英語名スラッグ（例: speech-radical）
  root?: string;     // 部首の字（例: 言）※任意
  type: string;      // 部首型: left-radical | right-radical | top-radical | bottom-radical | enclosing-radical | hanging-radical | wrapping-radical | independent-radical
  typeJa: string;    // 日本語型名（偏/旁/冠/脚/構/垂/繞/他）
  anchor: string;    // 例: "radical#left-radical"
}

export const RADICAL_POSITION_TYPES = [
  "left-radical",
  "right-radical",
  "top-radical",
  "bottom-radical",
  "enclosing-radical",
  "hanging-radical",
  "wrapping-radical",
  "independent-radical",
] as const;

export type RadicalPosition = typeof RADICAL_POSITION_TYPES[number];

export const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

/**
 * "speech-radical" -> "Speech"
 * "water-radical"  -> "Water"
 */
export const getEnglishDisplayName = (slug: string) => {
  const base = slug.replace(/-radical$/, "");
  return capitalize(base);
};

/**
 * 表示名を "日本語（English）" に整形
 * ex) ごんべん（Speech）
 */
export const formatRadicalName = (jp: string, enSlug: string) => {
  return \`\${jp}（\${getEnglishDisplayName(enSlug)}）\`;
};

/**
 * slug 重複を検出して、必要なら "-{type}" を付与
 */
export const buildSlugIndex = (list: Radical[]) => {
  const counts = new Map<string, number>();
  list.forEach((r) => {
    counts.set(r.en, (counts.get(r.en) ?? 0) + 1);
  });
  return counts;
};

export const getUniqueSlug = (r: Radical, counts: Map<string, number>) => {
  const duplicated = (counts.get(r.en) ?? 0) > 1;
  return duplicated ? \`\${r.en}-\${r.type}\` : r.en;
};

/**
 * URL から検索するための正規化:
 *  - 末尾に "-{type}" が付いていても取り外して一致判定できるようにする
 */
export const normalizeSlug = (slug: string) => {
  const pos = RADICAL_POSITION_TYPES.find((t) => slug.endsWith(\`-\${t}\`));
  return pos ? slug.slice(0, -1 * (\`-\${pos}\`).length) : slug;
};

export const findRadicalBySlug = (slug: string, list: Radical[]) => {
  const base = normalizeSlug(slug);
  return list.find((r) => r.en === base) ?? null;
};

/**
 * 一覧/詳細ページ両方で使う生データ
 * このファイルは data/raw/へんとかんじ.xlsx から自動生成されます
 */
export const radicalList: Radical[] = [
`;

  // タイプごとにグループ化して出力
  const typeOrder = [
    "left-radical",
    "right-radical",
    "top-radical",
    "bottom-radical",
    "hanging-radical",
    "wrapping-radical",
    "enclosing-radical",
    "independent-radical",
  ];
  
  let content = imports;
  
  for (const type of typeOrder) {
    const radicalsOfType = radicals.filter((r) => r.type === type);
    if (radicalsOfType.length === 0) continue;
    
    // コメント追加
    const typeJaMap: Record<string, string> = {
      "left-radical": "へん（左側）- Left Radicals",
      "right-radical": "つくり（右側）- Right Radicals",
      "top-radical": "かんむり（上部）- Top Radicals",
      "bottom-radical": "あし（下部）- Bottom Radicals",
      "hanging-radical": "たれ（垂れ）- Hanging Radicals",
      "wrapping-radical": "にょう（繞）- Wrapping Radicals",
      "enclosing-radical": "かまえ（構）- Enclosing Radicals",
      "independent-radical": "その他 - Independent Radicals (複数位置に出現、または独立して使われる部首)",
    };
    
    content += `  // ${typeJaMap[type]}\n`;
    
    for (const radical of radicalsOfType) {
      const rootStr = radical.root ? `, root: "${radical.root}"` : "";
      content += `  { jp: "${radical.jp}", en: "${radical.en}"${rootStr}, type: "${radical.type}", typeJa: "${radical.typeJa}", anchor: "${radical.anchor}" },\n`;
    }
    content += "\n";
  }
  
  content += `];

export default radicalList;
`;

  return content;
}

async function main() {
  console.log("========================================");
  console.log("🔄 エクセルから部首データを完全同期");
  console.log("========================================");
  console.log(`Excelファイル: ${excelPath}`);
  console.log(`出力先: ${radicalListPath}`);
  console.log(`JSON出力先: ${radicalsDir}`);
  console.log();

  // ファイル存在確認
  if (!fs.existsSync(excelPath)) {
    console.error(`❌ エラー: ${excelPath} が見つかりません`);
    process.exit(1);
  }

  // 既存のスラッグマッピングを読み込む
  console.log("📖 既存のスラッグマッピングを読み込み中...");
  const existingSlugMapping = loadExistingSlugMapping();
  console.log(`✅ ${Object.keys(existingSlugMapping).length} 件の既存マッピングを読み込みました`);
  console.log();

  // Excelファイルを読み込む
  console.log("📖 Excelファイルを読み込み中...");
  const workbook = XLSX.readFile(excelPath);
  const sheetName = workbook.SheetNames[0]; // Sheet1を使用
  const worksheet = workbook.Sheets[sheetName];
  
  // JSON形式に変換（ヘッダー行をキーとして使用）
  const rows = XLSX.utils.sheet_to_json<ExcelRow>(worksheet);
  
  console.log(`✅ ${rows.length} 行のデータを読み込みました`);
  console.log();

  // エクセルから部首データを構築
  const radicalMap = new Map<string, RadicalData>();
  
  for (const row of rows) {
    const { 部首, 偏旁通称, 偏旁種, 個数, 漢字 } = row;
    
    // 必須フィールドのチェック
    if (!偏旁通称 || !偏旁種 || !漢字) {
      continue;
    }
    
    const { type, typeJa } = convertHenboTypeToEnglish(偏旁種);
    // 「偏旁通称」を正規化（「・」の前の部分を使用）
    const normalizedHenboName = 偏旁通称.split("・")[0].trim();
    const en = generateEnglishSlug(偏旁通称, 偏旁種, existingSlugMapping);
    const kanjiArray = splitKanjiString(漢字);
    
    // 同じ偏旁通称（正規化後）で複数の偏旁種がある場合は、既存のものとマージ
    const key = `${normalizedHenboName}-${type}`;
    
    if (radicalMap.has(key)) {
      // 既存のエントリに漢字を追加（重複除去）
      const existing = radicalMap.get(key)!;
      const mergedKanji = Array.from(new Set([...existing.kanji, ...kanjiArray])).sort();
      existing.kanji = mergedKanji;
      existing.count = mergedKanji.length;
    } else {
      // 新規エントリ（偏旁通称は正規化前のものを使用）
      radicalMap.set(key, {
        jp: 偏旁通称,  // エクセルの元の値を保持（表示用）
        en,
        root: 部首 || undefined,
        type,
        typeJa,
        anchor: `radical#${type}`,
        count: 個数 || kanjiArray.length,
        kanji: kanjiArray,
      });
    }
  }
  
  const radicals = Array.from(radicalMap.values());
  
  console.log(`📊 抽出された部首数: ${radicals.length}`);
  console.log();

  // radicalList.ts を生成
  console.log("📝 radicalList.ts を生成中...");
  const radicalListContent = generateRadicalListFile(radicals);
  fs.writeFileSync(radicalListPath, radicalListContent, "utf8");
  console.log(`✅ ${radicalListPath} を生成しました`);
  console.log();

  // 既存のJSONファイルを全て削除（エクセルにないものは削除するため）
  console.log("🗑️  既存のJSONファイルを削除中...");
  if (fs.existsSync(radicalsDir)) {
    const existingFiles = fs.readdirSync(radicalsDir);
    for (const file of existingFiles) {
      if (file.endsWith(".json")) {
        fs.unlinkSync(path.join(radicalsDir, file));
      }
    }
  }
  console.log("✅ 既存ファイルを削除しました");
  console.log();

  // 各部首のJSONファイルを生成
  console.log("💾 JSONファイルを生成中...");
  const counts = new Map<string, number>();
  radicals.forEach((r) => {
    counts.set(r.en, (counts.get(r.en) ?? 0) + 1);
  });
  
  let savedCount = 0;
  for (const radical of radicals) {
    const duplicated = (counts.get(radical.en) ?? 0) > 1;
    const slug = duplicated ? `${radical.en}-${radical.type}` : radical.en;
    
    const outputPath = path.join(radicalsDir, `${slug}.json`);
    fs.writeFileSync(
      outputPath,
      JSON.stringify(radical.kanji.sort(), null, 2),
      "utf8"
    );
    
    console.log(`  ✅ ${radical.jp} (${slug}): ${radical.kanji.length}字`);
    savedCount++;
  }
  
  console.log();
  console.log("========================================");
  console.log("📊 処理結果サマリー");
  console.log("========================================");
  console.log(`✅ 部首数: ${radicals.length}`);
  console.log(`✅ JSONファイル数: ${savedCount}`);
  console.log(`✅ radicalList.ts を更新しました`);
  console.log();
  
  // タイプ別の統計
  const typeStats = new Map<string, number>();
  radicals.forEach((r) => {
    typeStats.set(r.type, (typeStats.get(r.type) ?? 0) + 1);
  });
  
  console.log("📈 タイプ別統計:");
  for (const [type, count] of typeStats.entries()) {
    console.log(`  ${type}: ${count} 件`);
  }
  console.log();
  
  console.log("========================================");
  console.log("✅ 完全同期完了！");
  console.log("========================================");
  console.log();
  console.log("💡 次のステップ:");
  console.log("  1. /radical ページで登録数が正しく表示されるか確認");
  console.log("  2. /radical/{slug} ページで漢字一覧が正しく表示されるか確認");
  console.log("  3. ビルドを実行: npm run build");
  console.log("========================================");
}

main().catch((error) => {
  console.error("❌ 予期しないエラーが発生しました:");
  console.error(error);
  process.exit(1);
});

