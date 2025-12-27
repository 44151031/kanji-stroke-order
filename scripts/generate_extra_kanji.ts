/**
 * 表外漢字データ生成スクリプト
 * KanjiVGにSVGが存在する表外漢字をリストアップしてJSONを生成
 */

import * as fs from "fs";
import * as path from "path";

const KANJIVG_BASE_URL = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";

interface ExtraKanjiEntry {
  kanji: string;
  unicode: string; // "uXXXX" 形式
  category: "rare" | "name" | "classical" | "other";
}

/**
 * 文字のUnicodeコードポイントを5桁のゼロパディング形式で取得
 */
function getCharacterCode(char: string): string {
  const codePoint = char.codePointAt(0);
  if (!codePoint) return "";
  return codePoint.toString(16).padStart(5, "0");
}

/**
 * Unicode ID (uXXXX) を生成
 */
function getUnicodeId(char: string): string {
  const codePoint = char.codePointAt(0);
  if (!codePoint) return "";
  return `u${codePoint.toString(16).toUpperCase()}`;
}

/**
 * KanjiVGにSVGが存在するか確認
 */
async function hasSvg(character: string): Promise<boolean> {
  try {
    const code = getCharacterCode(character);
    const url = `${KANJIVG_BASE_URL}/${code}.svg`;
    
    const response = await fetch(url);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * 常用漢字セットを取得
 */
function getJoyoKanjiSet(): Set<string> {
  const joyoPath = path.join(process.cwd(), "data", "kanji-joyo.json");
  if (!fs.existsSync(joyoPath)) {
    return new Set();
  }
  
  const joyoList = JSON.parse(fs.readFileSync(joyoPath, "utf-8")) as Array<{
    kanji: string;
  }>;
  
  return new Set(joyoList.map((entry) => entry.kanji));
}

/**
 * 既存のkanjiExtra.tsからメタデータを読み込み
 */
function loadExtraKanjiMeta(): Array<{
  unicode: string;
  isName: boolean;
  isClassical: boolean;
  rarityScore?: number;
}> {
  try {
    // kanjiExtra.tsを動的に読み込む
    const extraPath = path.join(process.cwd(), "data", "kanjiExtra.ts");
    if (!fs.existsSync(extraPath)) {
      return [];
    }
    
    const content = fs.readFileSync(extraPath, "utf-8");
    const metaMatches = content.matchAll(/unicode:\s*"([^"]+)",\s*isExtra:\s*true,\s*isName:\s*(\w+),\s*isClassical:\s*(\w+)(?:,\s*rarityScore:\s*(\d+))?/g);
    
    const meta: Array<{
      unicode: string;
      isName: boolean;
      isClassical: boolean;
      rarityScore?: number;
    }> = [];
    
    for (const match of metaMatches) {
      meta.push({
        unicode: match[1],
        isName: match[2] === "true",
        isClassical: match[3] === "true",
        rarityScore: match[4] ? parseInt(match[4], 10) : undefined,
      });
    }
    
    return meta;
  } catch {
    return [];
  }
}

/**
 * Unicode IDから漢字文字を取得
 */
function unicodeToChar(unicode: string): string {
  const hex = unicode.replace(/^[uU]/, "");
  const codePoint = parseInt(hex, 16);
  if (isNaN(codePoint)) return "";
  return String.fromCodePoint(codePoint);
}

/**
 * カテゴリを決定
 */
function determineCategory(
  isName: boolean,
  isClassical: boolean,
  rarityScore?: number
): "rare" | "name" | "classical" | "other" {
  if (isName) return "name";
  if (isClassical) return "classical";
  if (rarityScore && rarityScore >= 70) return "rare";
  return "other";
}

async function main() {
  console.log("📝 表外漢字データを生成中...\n");
  
  const joyoSet = getJoyoKanjiSet();
  console.log(`✅ 常用漢字セット: ${joyoSet.size}字`);
  
  const extraMeta = loadExtraKanjiMeta();
  console.log(`✅ 表外漢字メタデータ: ${extraMeta.length}件`);
  
  const extraKanji: ExtraKanjiEntry[] = [];
  let checked = 0;
  let hasSvgCount = 0;
  
  // メタデータから表外漢字を生成
  for (const meta of extraMeta) {
    const kanji = unicodeToChar(meta.unicode);
    if (!kanji) continue;
    
    // 常用漢字は除外
    if (joyoSet.has(kanji)) {
      continue;
    }
    
    checked++;
    
    // KanjiVGにSVGが存在するか確認
    const svgExists = await hasSvg(kanji);
    if (!svgExists) {
      console.log(`⏭️  SVGなし: ${kanji} (${meta.unicode})`);
      continue;
    }
    
    hasSvgCount++;
    
    const category = determineCategory(
      meta.isName,
      meta.isClassical,
      meta.rarityScore
    );
    
    extraKanji.push({
      kanji,
      unicode: meta.unicode.toLowerCase(),
      category,
    });
    
    console.log(`✅ ${kanji} (${meta.unicode}) - ${category}`);
    
    // レート制限対策
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  
  // 追加の表外漢字候補（よく使われる表外漢字）
  const additionalKanji = [
    "𠮟", "𠮷", "𠂤", "𠂭", "𠂯", "𠂰", "𠂱", "𠂲", "𠂳", "𠂴",
    "𠂵", "𠂶", "𠂷", "𠂸", "𠂹", "𠂺", "𠂻", "𠂼", "𠂽", "𠂾",
  ];
  
  for (const kanji of additionalKanji) {
    if (joyoSet.has(kanji)) continue;
    
    checked++;
    const svgExists = await hasSvg(kanji);
    if (!svgExists) continue;
    
    hasSvgCount++;
    const unicode = getUnicodeId(kanji);
    
    extraKanji.push({
      kanji,
      unicode,
      category: "other",
    });
    
    console.log(`✅ ${kanji} (${unicode}) - other`);
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  
  // カテゴリ別にソート
  extraKanji.sort((a, b) => {
    const categoryOrder = { rare: 0, name: 1, classical: 2, other: 3 };
    if (categoryOrder[a.category] !== categoryOrder[b.category]) {
      return categoryOrder[a.category] - categoryOrder[b.category];
    }
    return a.kanji.localeCompare(b.kanji);
  });
  
  // 出力ディレクトリを作成
  const outputDir = path.join(process.cwd(), "data", "kanji");
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // JSONファイルに保存
  const outputPath = path.join(outputDir, "extra-kanji.json");
  fs.writeFileSync(outputPath, JSON.stringify(extraKanji, null, 2), "utf-8");
  
  // 統計
  const stats = {
    rare: extraKanji.filter((k) => k.category === "rare").length,
    name: extraKanji.filter((k) => k.category === "name").length,
    classical: extraKanji.filter((k) => k.category === "classical").length,
    other: extraKanji.filter((k) => k.category === "other").length,
  };
  
  console.log(`\n📊 結果:`);
  console.log(`   確認した漢字: ${checked}字`);
  console.log(`   SVGが存在: ${hasSvgCount}字`);
  console.log(`   生成されたエントリ: ${extraKanji.length}字`);
  console.log(`   - rare: ${stats.rare}字`);
  console.log(`   - name: ${stats.name}字`);
  console.log(`   - classical: ${stats.classical}字`);
  console.log(`   - other: ${stats.other}字`);
  console.log(`\n✅ ${outputPath} を生成しました`);
}

main().catch(console.error);

