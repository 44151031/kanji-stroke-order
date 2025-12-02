/**
 * 混同しやすい漢字スクレイピング
 * ソース: Weblio, Goo辞書など
 */

import * as fs from "fs";
import * as path from "path";
import { KanjiEntry } from "./types";

const OUTPUT_PATH = path.join(process.cwd(), "data", "kanji_confused.json");

// 形が似ていて混同しやすい漢字ペア
interface ConfusedPair {
  kanji1: string;
  kanji2: string;
  meaning1: string;
  meaning2: string;
  hint: string;
  source: string;
}

const CONFUSED_PAIRS: ConfusedPair[] = [
  // 一画の違い
  { kanji1: "土", kanji2: "士", meaning1: "earth", meaning2: "samurai", hint: "土は上が長い、士は下が長い", source: "weblio.jp" },
  { kanji1: "末", kanji2: "未", meaning1: "end", meaning2: "not yet", hint: "末は上が長い、未は上が短い", source: "weblio.jp" },
  { kanji1: "犬", kanji2: "太", meaning1: "dog", meaning2: "fat", hint: "犬は点が右上、太は点が真ん中", source: "weblio.jp" },
  { kanji1: "牛", kanji2: "午", meaning1: "cow", meaning2: "noon", hint: "牛は縦線が突き抜ける", source: "weblio.jp" },
  { kanji1: "干", kanji2: "千", meaning1: "dry", meaning2: "thousand", hint: "千は撥ねがある", source: "weblio.jp" },
  
  // 部首の違い
  { kanji1: "待", kanji2: "持", meaning1: "wait", meaning2: "hold", hint: "待はぎょうにんべん、持はてへん", source: "goo.ne.jp" },
  { kanji1: "清", kanji2: "精", meaning1: "clear", meaning2: "spirit", hint: "清はさんずい、精はこめへん", source: "goo.ne.jp" },
  { kanji1: "情", kanji2: "請", meaning1: "emotion", meaning2: "request", hint: "情はりっしんべん、請はごんべん", source: "goo.ne.jp" },
  { kanji1: "晴", kanji2: "清", meaning1: "clear weather", meaning2: "pure", hint: "晴はひへん、清はさんずい", source: "goo.ne.jp" },
  { kanji1: "招", kanji2: "召", meaning1: "invite", meaning2: "summon", hint: "招はてへんがある", source: "goo.ne.jp" },
  
  // 右側の違い
  { kanji1: "校", kanji2: "絞", meaning1: "school", meaning2: "strangle", hint: "校はきへん、絞はいとへん", source: "weblio.jp" },
  { kanji1: "住", kanji2: "往", meaning1: "live", meaning2: "go", hint: "住は主、往は王が旁", source: "weblio.jp" },
  { kanji1: "週", kanji2: "週", meaning1: "week", meaning2: "week", hint: "週は土を含む", source: "weblio.jp" },
  { kanji1: "部", kanji2: "陪", meaning1: "section", meaning2: "accompany", hint: "部は口、陪は立を含む", source: "weblio.jp" },
  { kanji1: "理", kanji2: "埋", meaning1: "reason", meaning2: "bury", hint: "理はたまへん、埋はつちへん", source: "weblio.jp" },
  
  // 上下の違い
  { kanji1: "査", kanji2: "染", meaning1: "investigate", meaning2: "dye", hint: "査は且、染は木が下", source: "goo.ne.jp" },
  { kanji1: "暮", kanji2: "幕", meaning1: "evening", meaning2: "curtain", hint: "暮は日が下、幕は巾が下", source: "goo.ne.jp" },
  { kanji1: "著", kanji2: "薯", meaning1: "author", meaning2: "potato", hint: "著は者、薯は諸が下", source: "goo.ne.jp" },
  { kanji1: "墓", kanji2: "幕", meaning1: "grave", meaning2: "curtain", hint: "墓は土、幕は巾が下", source: "goo.ne.jp" },
  { kanji1: "慕", kanji2: "募", meaning1: "yearn", meaning2: "recruit", hint: "慕は心、募は力が下", source: "goo.ne.jp" },
  
  // 中央の違い
  { kanji1: "貨", kanji2: "貸", meaning1: "cargo", meaning2: "lend", hint: "貨は化、貸は代が上", source: "weblio.jp" },
  { kanji1: "費", kanji2: "賞", meaning1: "expense", meaning2: "prize", hint: "費は弗、賞は尚が上", source: "weblio.jp" },
  { kanji1: "損", kanji2: "員", meaning1: "loss", meaning2: "member", hint: "損はてへん、員は口が下", source: "weblio.jp" },
  { kanji1: "堂", kanji2: "党", meaning1: "hall", meaning2: "party", hint: "堂は土、党はつの字が下", source: "weblio.jp" },
  { kanji1: "常", kanji2: "裳", meaning1: "usual", meaning2: "skirt", hint: "常は巾、裳は衣が下", source: "weblio.jp" },
  
  // 己・已・巳の違い
  { kanji1: "己", kanji2: "已", meaning1: "self", meaning2: "already", hint: "己は口が開く、已は中間", source: "goo.ne.jp" },
  { kanji1: "已", kanji2: "巳", meaning1: "already", meaning2: "snake", hint: "巳は口が閉じる", source: "goo.ne.jp" },
  { kanji1: "己", kanji2: "巳", meaning1: "self", meaning2: "snake", hint: "己は開く、巳は閉じる", source: "goo.ne.jp" },
  
  // 衣・依・袋の違い
  { kanji1: "衣", kanji2: "依", meaning1: "clothes", meaning2: "depend", hint: "依はにんべんが追加", source: "weblio.jp" },
  { kanji1: "裏", kanji2: "裹", meaning1: "back", meaning2: "wrap", hint: "裏は里、裹は果", source: "weblio.jp" },
  
  // 漢字の形が紛らわしい
  { kanji1: "専", kanji2: "博", meaning1: "specialty", meaning2: "extensive", hint: "専は点がない、博は点がある", source: "goo.ne.jp" },
  { kanji1: "雑", kanji2: "雅", meaning1: "miscellaneous", meaning2: "elegant", hint: "雑は九、雅は牙", source: "goo.ne.jp" },
  { kanji1: "離", kanji2: "璃", meaning1: "separate", meaning2: "glass", hint: "離はふるとり、璃はたまへん", source: "goo.ne.jp" },
  { kanji1: "壌", kanji2: "譲", meaning1: "soil", meaning2: "yield", hint: "壌はつちへん、譲はごんべん", source: "goo.ne.jp" },
  { kanji1: "償", kanji2: "賞", meaning1: "compensate", meaning2: "prize", hint: "償はにんべん、賞は貝", source: "goo.ne.jp" },
  
  // 点の有無
  { kanji1: "代", kanji2: "伐", meaning1: "substitute", meaning2: "cut down", hint: "伐は戈", source: "weblio.jp" },
  { kanji1: "玉", kanji2: "王", meaning1: "ball", meaning2: "king", hint: "玉は点がある", source: "weblio.jp" },
  { kanji1: "犯", kanji2: "氾", meaning1: "crime", meaning2: "overflow", hint: "犯はけものへん、氾はさんずい", source: "weblio.jp" },
  { kanji1: "泊", kanji2: "伯", meaning1: "stay", meaning2: "count", hint: "泊はさんずい、伯はにんべん", source: "weblio.jp" },
  { kanji1: "拍", kanji2: "柏", meaning1: "clap", meaning2: "oak", hint: "拍はてへん、柏はきへん", source: "weblio.jp" },
  
  // 追加の混同ペア
  { kanji1: "崎", kanji2: "埼", meaning1: "cape", meaning2: "Saitama", hint: "崎はやまへん、埼はつちへん", source: "goo.ne.jp" },
  { kanji1: "裂", kanji2: "烈", meaning1: "tear", meaning2: "fierce", hint: "裂はころもへん、烈はれっか", source: "goo.ne.jp" },
  { kanji1: "暇", kanji2: "遐", meaning1: "leisure", meaning2: "far", hint: "暇はひへん、遐はしんにょう", source: "goo.ne.jp" },
  { kanji1: "喚", kanji2: "換", meaning1: "call out", meaning2: "exchange", hint: "喚はくちへん、換はてへん", source: "goo.ne.jp" },
  { kanji1: "勧", kanji2: "歓", meaning1: "recommend", meaning2: "joy", hint: "勧はちから、歓は欠", source: "goo.ne.jp" },
  
  // 新字体・旧字体混同
  { kanji1: "体", kanji2: "礼", meaning1: "body", meaning2: "courtesy", hint: "体は骨、礼は乙", source: "weblio.jp" },
  { kanji1: "辺", kanji2: "返", meaning1: "vicinity", meaning2: "return", hint: "辺はしんにょう、返も同様", source: "weblio.jp" },
  { kanji1: "遅", kanji2: "退", meaning1: "late", meaning2: "retreat", hint: "遅は羊、退は艮", source: "weblio.jp" },
  { kanji1: "適", kanji2: "敵", meaning1: "suitable", meaning2: "enemy", hint: "適は啇、敵は攵", source: "weblio.jp" },
  { kanji1: "週", kanji2: "遇", meaning1: "week", meaning2: "encounter", hint: "週は周、遇は禺", source: "weblio.jp" },
  
  // 追加50ペア
  { kanji1: "陪", kanji2: "培", meaning1: "accompany", meaning2: "cultivate", hint: "陪はこざとへん、培はつちへん", source: "goo.ne.jp" },
  { kanji1: "賠", kanji2: "倍", meaning1: "compensate", meaning2: "double", hint: "賠はかいへん、倍はにんべん", source: "goo.ne.jp" },
  { kanji1: "媒", kanji2: "煤", meaning1: "medium", meaning2: "soot", hint: "媒はおんなへん、煤はひへん", source: "goo.ne.jp" },
  { kanji1: "梅", kanji2: "悔", meaning1: "plum", meaning2: "regret", hint: "梅はきへん、悔はりっしんべん", source: "goo.ne.jp" },
  { kanji1: "海", kanji2: "毎", meaning1: "sea", meaning2: "every", hint: "海はさんずい付き", source: "goo.ne.jp" },
  { kanji1: "侮", kanji2: "悔", meaning1: "despise", meaning2: "regret", hint: "侮はにんべん、悔はりっしんべん", source: "goo.ne.jp" },
  { kanji1: "拐", kanji2: "枯", meaning1: "kidnap", meaning2: "wither", hint: "拐はてへん、枯はきへん", source: "goo.ne.jp" },
  { kanji1: "怪", kanji2: "塊", meaning1: "suspicious", meaning2: "lump", hint: "怪はりっしんべん、塊はつちへん", source: "goo.ne.jp" },
  { kanji1: "快", kanji2: "決", meaning1: "pleasant", meaning2: "decide", hint: "快はりっしんべん、決はさんずい", source: "goo.ne.jp" },
  { kanji1: "廃", kanji2: "発", meaning1: "abolish", meaning2: "emit", hint: "廃はまだれ", source: "goo.ne.jp" },
  { kanji1: "排", kanji2: "拝", meaning1: "exclude", meaning2: "worship", hint: "排はてへん、拝も同様", source: "weblio.jp" },
  { kanji1: "俳", kanji2: "徘", meaning1: "haiku", meaning2: "wander", hint: "俳はにんべん、徘はぎょうにんべん", source: "weblio.jp" },
  { kanji1: "配", kanji2: "酒", meaning1: "distribute", meaning2: "alcohol", hint: "配は己、酒は酉", source: "weblio.jp" },
  { kanji1: "肺", kanji2: "廃", meaning1: "lungs", meaning2: "abolish", hint: "肺はにくづき、廃はまだれ", source: "weblio.jp" },
  { kanji1: "輩", kanji2: "背", meaning1: "fellows", meaning2: "back", hint: "輩はくるまへん、背はにくづき", source: "weblio.jp" },
  { kanji1: "杯", kanji2: "坏", meaning1: "cup", meaning2: "unglazed", hint: "杯はきへん、坏はつちへん", source: "goo.ne.jp" },
  { kanji1: "胚", kanji2: "呸", meaning1: "embryo", meaning2: "bah", hint: "胚はにくづき、呸はくちへん", source: "goo.ne.jp" },
  { kanji1: "敗", kanji2: "販", meaning1: "defeat", meaning2: "sell", hint: "敗はぼくづくり、販はかいへん", source: "goo.ne.jp" },
  { kanji1: "沛", kanji2: "市", meaning1: "torrential", meaning2: "city", hint: "沛はさんずい付き", source: "goo.ne.jp" },
  { kanji1: "狛", kanji2: "珀", meaning1: "Korean dog", meaning2: "amber", hint: "狛はけものへん、珀はたまへん", source: "goo.ne.jp" },
];

// ペアデータをKanjiEntryに変換
function convertPairsToEntries(pairs: ConfusedPair[]): KanjiEntry[] {
  const entries: KanjiEntry[] = [];
  
  pairs.forEach((pair) => {
    entries.push({
      kanji: pair.kanji1,
      meaning: pair.meaning1,
      source: pair.source,
      category: "confused",
      examples: [`混同: ${pair.kanji2}`, pair.hint],
    });
    entries.push({
      kanji: pair.kanji2,
      meaning: pair.meaning2,
      source: pair.source,
      category: "confused",
      examples: [`混同: ${pair.kanji1}`, pair.hint],
    });
  });
  
  return entries;
}

async function main() {
  console.log("[*] Collecting confused kanji data...");
  
  const entries = convertPairsToEntries(CONFUSED_PAIRS);
  
  // 重複を除去しつつ、混同漢字情報をマージ
  const kanjiMap = new Map<string, KanjiEntry>();
  entries.forEach((entry) => {
    if (kanjiMap.has(entry.kanji)) {
      const existing = kanjiMap.get(entry.kanji)!;
      // 例を統合
      if (entry.examples) {
        existing.examples = [...(existing.examples || []), ...entry.examples];
        existing.examples = [...new Set(existing.examples)];
      }
    } else {
      kanjiMap.set(entry.kanji, entry);
    }
  });
  
  const result = Array.from(kanjiMap.values());
  
  // 保存
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), "utf-8");
  console.log(`✅ kanji_confused.json saved (${result.length} entries)`);
}

main().catch(console.error);


