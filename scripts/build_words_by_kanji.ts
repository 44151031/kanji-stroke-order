/**
 * 漢字別単語リスト生成スクリプト
 */

import * as fs from "fs";
import * as path from "path";

interface WordEntry {
  word: string;
  reading: string;
  meaning: string;
}

// サンプル単語データ（実際はUniDicから生成）
const SAMPLE_WORDS: Record<string, WordEntry[]> = {
  "水": [
    { word: "水道", reading: "すいどう", meaning: "water supply" },
    { word: "水泳", reading: "すいえい", meaning: "swimming" },
    { word: "香水", reading: "こうすい", meaning: "perfume" },
    { word: "水曜日", reading: "すいようび", meaning: "Wednesday" },
    { word: "飲み水", reading: "のみみず", meaning: "drinking water" },
    { word: "水分", reading: "すいぶん", meaning: "moisture" },
    { word: "水族館", reading: "すいぞくかん", meaning: "aquarium" },
    { word: "水平", reading: "すいへい", meaning: "horizontal" },
    { word: "水田", reading: "すいでん", meaning: "paddy field" },
    { word: "洪水", reading: "こうずい", meaning: "flood" },
  ],
  "火": [
    { word: "火曜日", reading: "かようび", meaning: "Tuesday" },
    { word: "火事", reading: "かじ", meaning: "fire (disaster)" },
    { word: "花火", reading: "はなび", meaning: "fireworks" },
    { word: "火山", reading: "かざん", meaning: "volcano" },
    { word: "火災", reading: "かさい", meaning: "fire disaster" },
    { word: "火力", reading: "かりょく", meaning: "thermal power" },
    { word: "点火", reading: "てんか", meaning: "ignition" },
    { word: "消火", reading: "しょうか", meaning: "fire extinguishing" },
    { word: "火傷", reading: "やけど", meaning: "burn injury" },
    { word: "火花", reading: "ひばな", meaning: "spark" },
  ],
  "山": [
    { word: "富士山", reading: "ふじさん", meaning: "Mt. Fuji" },
    { word: "山道", reading: "やまみち", meaning: "mountain path" },
    { word: "登山", reading: "とざん", meaning: "mountain climbing" },
    { word: "山頂", reading: "さんちょう", meaning: "mountain top" },
    { word: "山脈", reading: "さんみゃく", meaning: "mountain range" },
    { word: "火山", reading: "かざん", meaning: "volcano" },
    { word: "山林", reading: "さんりん", meaning: "mountain forest" },
    { word: "山岳", reading: "さんがく", meaning: "mountains" },
    { word: "下山", reading: "げざん", meaning: "descending a mountain" },
    { word: "山菜", reading: "さんさい", meaning: "wild vegetables" },
  ],
  "川": [
    { word: "川", reading: "かわ", meaning: "river" },
    { word: "河川", reading: "かせん", meaning: "rivers" },
    { word: "川岸", reading: "かわぎし", meaning: "riverbank" },
    { word: "川下", reading: "かわしも", meaning: "downstream" },
    { word: "川上", reading: "かわかみ", meaning: "upstream" },
    { word: "小川", reading: "おがわ", meaning: "stream" },
    { word: "川沿い", reading: "かわぞい", meaning: "along the river" },
    { word: "川魚", reading: "かわうお", meaning: "freshwater fish" },
    { word: "川原", reading: "かわら", meaning: "dry riverbed" },
    { word: "川幅", reading: "かわはば", meaning: "river width" },
  ],
  "日": [
    { word: "日本", reading: "にほん", meaning: "Japan" },
    { word: "今日", reading: "きょう", meaning: "today" },
    { word: "明日", reading: "あした", meaning: "tomorrow" },
    { word: "日曜日", reading: "にちようび", meaning: "Sunday" },
    { word: "毎日", reading: "まいにち", meaning: "every day" },
    { word: "休日", reading: "きゅうじつ", meaning: "holiday" },
    { word: "日記", reading: "にっき", meaning: "diary" },
    { word: "日光", reading: "にっこう", meaning: "sunlight" },
    { word: "誕生日", reading: "たんじょうび", meaning: "birthday" },
    { word: "祝日", reading: "しゅくじつ", meaning: "national holiday" },
  ],
  "月": [
    { word: "月曜日", reading: "げつようび", meaning: "Monday" },
    { word: "今月", reading: "こんげつ", meaning: "this month" },
    { word: "来月", reading: "らいげつ", meaning: "next month" },
    { word: "先月", reading: "せんげつ", meaning: "last month" },
    { word: "毎月", reading: "まいつき", meaning: "every month" },
    { word: "月光", reading: "げっこう", meaning: "moonlight" },
    { word: "満月", reading: "まんげつ", meaning: "full moon" },
    { word: "新月", reading: "しんげつ", meaning: "new moon" },
    { word: "月末", reading: "げつまつ", meaning: "end of month" },
    { word: "月給", reading: "げっきゅう", meaning: "monthly salary" },
  ],
  "人": [
    { word: "日本人", reading: "にほんじん", meaning: "Japanese person" },
    { word: "大人", reading: "おとな", meaning: "adult" },
    { word: "人間", reading: "にんげん", meaning: "human being" },
    { word: "友人", reading: "ゆうじん", meaning: "friend" },
    { word: "人生", reading: "じんせい", meaning: "life" },
    { word: "人口", reading: "じんこう", meaning: "population" },
    { word: "人気", reading: "にんき", meaning: "popularity" },
    { word: "個人", reading: "こじん", meaning: "individual" },
    { word: "外国人", reading: "がいこくじん", meaning: "foreigner" },
    { word: "一人", reading: "ひとり", meaning: "one person" },
  ],
  "一": [
    { word: "一つ", reading: "ひとつ", meaning: "one (thing)" },
    { word: "一人", reading: "ひとり", meaning: "one person" },
    { word: "一番", reading: "いちばん", meaning: "number one" },
    { word: "一日", reading: "いちにち", meaning: "one day" },
    { word: "一年", reading: "いちねん", meaning: "one year" },
    { word: "一生", reading: "いっしょう", meaning: "lifetime" },
    { word: "一度", reading: "いちど", meaning: "once" },
    { word: "一緒", reading: "いっしょ", meaning: "together" },
    { word: "統一", reading: "とういつ", meaning: "unification" },
    { word: "一部", reading: "いちぶ", meaning: "part" },
  ],
  "学": [
    { word: "学校", reading: "がっこう", meaning: "school" },
    { word: "学生", reading: "がくせい", meaning: "student" },
    { word: "大学", reading: "だいがく", meaning: "university" },
    { word: "学習", reading: "がくしゅう", meaning: "learning" },
    { word: "科学", reading: "かがく", meaning: "science" },
    { word: "文学", reading: "ぶんがく", meaning: "literature" },
    { word: "数学", reading: "すうがく", meaning: "mathematics" },
    { word: "入学", reading: "にゅうがく", meaning: "enrollment" },
    { word: "留学", reading: "りゅうがく", meaning: "study abroad" },
    { word: "学問", reading: "がくもん", meaning: "learning" },
  ],
  "書": [
    { word: "読書", reading: "どくしょ", meaning: "reading" },
    { word: "書類", reading: "しょるい", meaning: "documents" },
    { word: "辞書", reading: "じしょ", meaning: "dictionary" },
    { word: "図書館", reading: "としょかん", meaning: "library" },
    { word: "教科書", reading: "きょうかしょ", meaning: "textbook" },
    { word: "書道", reading: "しょどう", meaning: "calligraphy" },
    { word: "手書き", reading: "てがき", meaning: "handwriting" },
    { word: "書店", reading: "しょてん", meaning: "bookstore" },
    { word: "書籍", reading: "しょせき", meaning: "books" },
    { word: "書き方", reading: "かきかた", meaning: "way of writing" },
  ],
};

async function main() {
  const joyoPath = path.join(process.cwd(), "data", "kanji-joyo.json");
  const outputPath = path.join(process.cwd(), "data", "words-by-kanji.json");

  interface JoyoEntry { kanji: string; }
  const joyoList: JoyoEntry[] = JSON.parse(fs.readFileSync(joyoPath, "utf-8"));

  const wordsByKanji: Record<string, WordEntry[]> = {};

  for (const entry of joyoList) {
    if (SAMPLE_WORDS[entry.kanji]) {
      wordsByKanji[entry.kanji] = SAMPLE_WORDS[entry.kanji];
    } else {
      // デフォルト: 空の配列
      wordsByKanji[entry.kanji] = [];
    }
  }

  fs.writeFileSync(outputPath, JSON.stringify(wordsByKanji, null, 2), "utf-8");
  console.log(`✅ Generated words-by-kanji.json`);
}

main().catch(console.error);










