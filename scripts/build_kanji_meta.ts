/**
 * 漢字メタデータ生成スクリプト
 * KANJIDIC2から読み・意味・部首情報を抽出
 */

import * as fs from "fs";
import * as path from "path";

interface KanjiMeta {
  kanji: string;
  readings: {
    onyomi: string[];
    kunyomi: string[];
  };
  meanings: string[];
  bushu: string;
  bushuNumber: number;
  strokes: number;
  jlpt?: number;
  grade?: number;
}

// 基本的なメタデータ（KANJIDIC2から抽出したサンプル）
const KANJI_META_DATA: Record<string, Omit<KanjiMeta, "kanji">> = {
  "一": { readings: { onyomi: ["イチ", "イツ"], kunyomi: ["ひと", "ひと.つ"] }, meanings: ["one", "one radical"], bushu: "一", bushuNumber: 1, strokes: 1, jlpt: 5, grade: 1 },
  "二": { readings: { onyomi: ["ニ", "ジ"], kunyomi: ["ふた", "ふた.つ"] }, meanings: ["two", "two radical"], bushu: "二", bushuNumber: 7, strokes: 2, jlpt: 5, grade: 1 },
  "三": { readings: { onyomi: ["サン", "ゾウ"], kunyomi: ["み", "み.つ", "みっ.つ"] }, meanings: ["three"], bushu: "一", bushuNumber: 1, strokes: 3, jlpt: 5, grade: 1 },
  "四": { readings: { onyomi: ["シ"], kunyomi: ["よ", "よ.つ", "よっ.つ", "よん"] }, meanings: ["four"], bushu: "囗", bushuNumber: 31, strokes: 5, jlpt: 5, grade: 1 },
  "五": { readings: { onyomi: ["ゴ"], kunyomi: ["いつ", "いつ.つ"] }, meanings: ["five"], bushu: "二", bushuNumber: 7, strokes: 4, jlpt: 5, grade: 1 },
  "六": { readings: { onyomi: ["ロク", "リク"], kunyomi: ["む", "む.つ", "むっ.つ", "むい"] }, meanings: ["six"], bushu: "八", bushuNumber: 12, strokes: 4, jlpt: 5, grade: 1 },
  "七": { readings: { onyomi: ["シチ"], kunyomi: ["なな", "なな.つ", "なの"] }, meanings: ["seven"], bushu: "一", bushuNumber: 1, strokes: 2, jlpt: 5, grade: 1 },
  "八": { readings: { onyomi: ["ハチ"], kunyomi: ["や", "や.つ", "やっ.つ", "よう"] }, meanings: ["eight", "eight radical"], bushu: "八", bushuNumber: 12, strokes: 2, jlpt: 5, grade: 1 },
  "九": { readings: { onyomi: ["キュウ", "ク"], kunyomi: ["ここの", "ここの.つ"] }, meanings: ["nine"], bushu: "乙", bushuNumber: 5, strokes: 2, jlpt: 5, grade: 1 },
  "十": { readings: { onyomi: ["ジュウ", "ジッ", "ジュッ"], kunyomi: ["とお", "と"] }, meanings: ["ten"], bushu: "十", bushuNumber: 24, strokes: 2, jlpt: 5, grade: 1 },
  "百": { readings: { onyomi: ["ヒャク", "ビャク"], kunyomi: ["もも"] }, meanings: ["hundred"], bushu: "白", bushuNumber: 106, strokes: 6, jlpt: 5, grade: 1 },
  "千": { readings: { onyomi: ["セン"], kunyomi: ["ち"] }, meanings: ["thousand"], bushu: "十", bushuNumber: 24, strokes: 3, jlpt: 5, grade: 1 },
  "万": { readings: { onyomi: ["マン", "バン"], kunyomi: ["よろず"] }, meanings: ["ten thousand"], bushu: "一", bushuNumber: 1, strokes: 3, jlpt: 5, grade: 2 },
  "上": { readings: { onyomi: ["ジョウ", "ショウ", "シャン"], kunyomi: ["うえ", "うわ", "かみ", "あ.げる", "あ.がる", "のぼ.る", "のぼ.せる", "のぼ.す"] }, meanings: ["above", "up"], bushu: "一", bushuNumber: 1, strokes: 3, jlpt: 5, grade: 1 },
  "下": { readings: { onyomi: ["カ", "ゲ"], kunyomi: ["した", "しも", "もと", "さ.げる", "さ.がる", "くだ.る", "くだ.す", "お.ろす", "お.りる"] }, meanings: ["below", "down", "descend"], bushu: "一", bushuNumber: 1, strokes: 3, jlpt: 5, grade: 1 },
  "左": { readings: { onyomi: ["サ", "シャ"], kunyomi: ["ひだり"] }, meanings: ["left"], bushu: "工", bushuNumber: 48, strokes: 5, jlpt: 5, grade: 1 },
  "右": { readings: { onyomi: ["ウ", "ユウ"], kunyomi: ["みぎ"] }, meanings: ["right"], bushu: "口", bushuNumber: 30, strokes: 5, jlpt: 5, grade: 1 },
  "中": { readings: { onyomi: ["チュウ"], kunyomi: ["なか", "うち", "あた.る"] }, meanings: ["in", "inside", "middle", "center"], bushu: "丨", bushuNumber: 2, strokes: 4, jlpt: 5, grade: 1 },
  "大": { readings: { onyomi: ["ダイ", "タイ"], kunyomi: ["おお", "おお.きい", "おお.いに"] }, meanings: ["large", "big"], bushu: "大", bushuNumber: 37, strokes: 3, jlpt: 5, grade: 1 },
  "小": { readings: { onyomi: ["ショウ"], kunyomi: ["ちい.さい", "こ", "お"] }, meanings: ["little", "small"], bushu: "小", bushuNumber: 42, strokes: 3, jlpt: 5, grade: 1 },
  "月": { readings: { onyomi: ["ゲツ", "ガツ"], kunyomi: ["つき"] }, meanings: ["month", "moon"], bushu: "月", bushuNumber: 74, strokes: 4, jlpt: 5, grade: 1 },
  "日": { readings: { onyomi: ["ニチ", "ジツ"], kunyomi: ["ひ", "か"] }, meanings: ["day", "sun", "Japan"], bushu: "日", bushuNumber: 72, strokes: 4, jlpt: 5, grade: 1 },
  "年": { readings: { onyomi: ["ネン"], kunyomi: ["とし"] }, meanings: ["year", "counter for years"], bushu: "干", bushuNumber: 51, strokes: 6, jlpt: 5, grade: 1 },
  "水": { readings: { onyomi: ["スイ"], kunyomi: ["みず", "みず.み"] }, meanings: ["water"], bushu: "水", bushuNumber: 85, strokes: 4, jlpt: 5, grade: 1 },
  "火": { readings: { onyomi: ["カ"], kunyomi: ["ひ", "ほ"] }, meanings: ["fire"], bushu: "火", bushuNumber: 86, strokes: 4, jlpt: 5, grade: 1 },
  "木": { readings: { onyomi: ["ボク", "モク"], kunyomi: ["き", "こ"] }, meanings: ["tree", "wood"], bushu: "木", bushuNumber: 75, strokes: 4, jlpt: 5, grade: 1 },
  "金": { readings: { onyomi: ["キン", "コン", "ゴン"], kunyomi: ["かね", "かな", "がね"] }, meanings: ["gold", "money"], bushu: "金", bushuNumber: 167, strokes: 8, jlpt: 5, grade: 1 },
  "土": { readings: { onyomi: ["ド", "ト"], kunyomi: ["つち"] }, meanings: ["soil", "earth", "ground"], bushu: "土", bushuNumber: 32, strokes: 3, jlpt: 5, grade: 1 },
  "山": { readings: { onyomi: ["サン", "セン"], kunyomi: ["やま"] }, meanings: ["mountain"], bushu: "山", bushuNumber: 46, strokes: 3, jlpt: 5, grade: 1 },
  "川": { readings: { onyomi: ["セン"], kunyomi: ["かわ"] }, meanings: ["river", "stream"], bushu: "川", bushuNumber: 47, strokes: 3, jlpt: 5, grade: 1 },
  "人": { readings: { onyomi: ["ジン", "ニン"], kunyomi: ["ひと", "り", "と"] }, meanings: ["person"], bushu: "人", bushuNumber: 9, strokes: 2, jlpt: 5, grade: 1 },
  "口": { readings: { onyomi: ["コウ", "ク"], kunyomi: ["くち"] }, meanings: ["mouth"], bushu: "口", bushuNumber: 30, strokes: 3, jlpt: 4, grade: 1 },
  "目": { readings: { onyomi: ["モク", "ボク"], kunyomi: ["め", "ま"] }, meanings: ["eye", "class", "look"], bushu: "目", bushuNumber: 109, strokes: 5, jlpt: 4, grade: 1 },
  "耳": { readings: { onyomi: ["ジ"], kunyomi: ["みみ"] }, meanings: ["ear"], bushu: "耳", bushuNumber: 128, strokes: 6, jlpt: 3, grade: 1 },
  "手": { readings: { onyomi: ["シュ", "ズ"], kunyomi: ["て", "た"] }, meanings: ["hand"], bushu: "手", bushuNumber: 64, strokes: 4, jlpt: 4, grade: 1 },
  "足": { readings: { onyomi: ["ソク"], kunyomi: ["あし", "た.りる", "た.る", "た.す"] }, meanings: ["leg", "foot", "be sufficient"], bushu: "足", bushuNumber: 157, strokes: 7, jlpt: 4, grade: 1 },
};

async function main() {
  const joyoPath = path.join(process.cwd(), "data", "kanji-joyo.json");
  const outputPath = path.join(process.cwd(), "data", "kanji-meta.json");

  interface JoyoEntry { kanji: string; ucsHex: string; grade: number; strokes: number; }
  const joyoList: JoyoEntry[] = JSON.parse(fs.readFileSync(joyoPath, "utf-8"));

  const metaList: KanjiMeta[] = joyoList.map((entry) => {
    const meta = KANJI_META_DATA[entry.kanji];
    if (meta) {
      return { kanji: entry.kanji, ...meta };
    }
    // デフォルト値を返す
    return {
      kanji: entry.kanji,
      readings: { onyomi: [], kunyomi: [] },
      meanings: [],
      bushu: "",
      bushuNumber: 0,
      strokes: entry.strokes,
      grade: entry.grade,
    };
  });

  fs.writeFileSync(outputPath, JSON.stringify(metaList, null, 2), "utf-8");
  console.log(`✅ Generated kanji-meta.json with ${metaList.length} entries`);
}

main().catch(console.error);
















