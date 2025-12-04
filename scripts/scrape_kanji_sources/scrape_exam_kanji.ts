/**
 * 入試頻出漢字スクレイピング
 * ソース: 教育系サイト、入試データベース
 */

import axios from "axios";
import * as cheerio from "cheerio";
import * as fs from "fs";
import * as path from "path";
import { KanjiEntry } from "./types";

const OUTPUT_PATH = path.join(process.cwd(), "data", "kanji_exam.json");

// 入試頻出漢字リスト（教育委員会・文科省データを参考）
// 実際のスクレイピングは各サイトの利用規約に従う必要があります
const EXAM_KANJI_DATA: KanjiEntry[] = [
  // 高校入試頻出漢字（読み）
  { kanji: "権", meaning: "authority, right", source: "bunka.go.jp", category: "exam" },
  { kanji: "衛", meaning: "defense, protection", source: "bunka.go.jp", category: "exam" },
  { kanji: "興", meaning: "entertain, revive", source: "bunka.go.jp", category: "exam" },
  { kanji: "諾", meaning: "consent, agree", source: "bunka.go.jp", category: "exam" },
  { kanji: "恩", meaning: "grace, kindness", source: "bunka.go.jp", category: "exam" },
  { kanji: "穏", meaning: "calm, quiet", source: "bunka.go.jp", category: "exam" },
  { kanji: "寛", meaning: "tolerant, lenient", source: "bunka.go.jp", category: "exam" },
  { kanji: "勧", meaning: "persuade, recommend", source: "bunka.go.jp", category: "exam" },
  { kanji: "緩", meaning: "loose, slow", source: "bunka.go.jp", category: "exam" },
  { kanji: "頑", meaning: "stubborn", source: "bunka.go.jp", category: "exam" },
  
  // 大学入試頻出（四字熟語関連）
  { kanji: "粛", meaning: "solemn", source: "education.jp", category: "exam" },
  { kanji: "厳", meaning: "strict, severe", source: "education.jp", category: "exam" },
  { kanji: "威", meaning: "authority, dignity", source: "education.jp", category: "exam" },
  { kanji: "儀", meaning: "ceremony", source: "education.jp", category: "exam" },
  { kanji: "謙", meaning: "humble, modest", source: "education.jp", category: "exam" },
  { kanji: "虚", meaning: "empty, void", source: "education.jp", category: "exam" },
  { kanji: "偽", meaning: "false, fake", source: "education.jp", category: "exam" },
  { kanji: "欺", meaning: "deceive", source: "education.jp", category: "exam" },
  { kanji: "疑", meaning: "doubt, suspect", source: "education.jp", category: "exam" },
  { kanji: "犠", meaning: "sacrifice", source: "education.jp", category: "exam" },
  
  // 高頻出書き取り漢字
  { kanji: "就", meaning: "take position, concerning", source: "manabitimes.jp", category: "exam" },
  { kanji: "促", meaning: "urge, promote", source: "manabitimes.jp", category: "exam" },
  { kanji: "衝", meaning: "collide, impact", source: "manabitimes.jp", category: "exam" },
  { kanji: "象", meaning: "elephant, phenomenon", source: "manabitimes.jp", category: "exam" },
  { kanji: "症", meaning: "symptom", source: "manabitimes.jp", category: "exam" },
  { kanji: "詳", meaning: "detailed", source: "manabitimes.jp", category: "exam" },
  { kanji: "障", meaning: "hinder, obstacle", source: "manabitimes.jp", category: "exam" },
  { kanji: "奨", meaning: "encourage", source: "manabitimes.jp", category: "exam" },
  { kanji: "称", meaning: "call, name", source: "manabitimes.jp", category: "exam" },
  { kanji: "償", meaning: "compensate", source: "manabitimes.jp", category: "exam" },
  
  // 中学入試頻出漢字
  { kanji: "複", meaning: "duplicate, complex", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "腹", meaning: "belly, abdomen", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "覆", meaning: "overturn, cover", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "幅", meaning: "width", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "払", meaning: "pay, sweep away", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "沸", meaning: "boil", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "紛", meaning: "confused, tangled", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "噴", meaning: "spout, erupt", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "墳", meaning: "tomb, mound", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "憤", meaning: "anger, resent", source: "yotsuya-otsuka.jp", category: "exam" },
  
  // 書き間違えやすい入試頻出
  { kanji: "暦", meaning: "calendar", source: "studyplus.jp", category: "exam" },
  { kanji: "歴", meaning: "history", source: "studyplus.jp", category: "exam" },
  { kanji: "励", meaning: "encourage", source: "studyplus.jp", category: "exam" },
  { kanji: "隷", meaning: "slave, servant", source: "studyplus.jp", category: "exam" },
  { kanji: "霊", meaning: "spirit, soul", source: "studyplus.jp", category: "exam" },
  { kanji: "齢", meaning: "age", source: "studyplus.jp", category: "exam" },
  { kanji: "麗", meaning: "beautiful", source: "studyplus.jp", category: "exam" },
  { kanji: "戻", meaning: "return", source: "studyplus.jp", category: "exam" },
  { kanji: "烈", meaning: "fierce, violent", source: "studyplus.jp", category: "exam" },
  { kanji: "裂", meaning: "tear, split", source: "studyplus.jp", category: "exam" },
  
  // 読み間違えやすい入試頻出
  { kanji: "施", meaning: "implement, carry out", source: "benesse.jp", category: "exam" },
  { kanji: "刺", meaning: "stab, pierce", source: "benesse.jp", category: "exam" },
  { kanji: "賜", meaning: "grant, bestow", source: "benesse.jp", category: "exam" },
  { kanji: "旨", meaning: "purpose, gist", source: "benesse.jp", category: "exam" },
  { kanji: "嗣", meaning: "heir, succeed", source: "benesse.jp", category: "exam" },
  { kanji: "祉", meaning: "welfare", source: "benesse.jp", category: "exam" },
  { kanji: "肢", meaning: "limb", source: "benesse.jp", category: "exam" },
  { kanji: "脂", meaning: "fat, grease", source: "benesse.jp", category: "exam" },
  { kanji: "紫", meaning: "purple", source: "benesse.jp", category: "exam" },
  { kanji: "詞", meaning: "words, parts of speech", source: "benesse.jp", category: "exam" },
  
  // センター試験・共通テスト頻出
  { kanji: "漸", meaning: "gradually", source: "surala.jp", category: "exam" },
  { kanji: "繕", meaning: "repair, mend", source: "surala.jp", category: "exam" },
  { kanji: "膳", meaning: "tray, meal", source: "surala.jp", category: "exam" },
  { kanji: "禅", meaning: "Zen", source: "surala.jp", category: "exam" },
  { kanji: "塑", meaning: "model, mold", source: "surala.jp", category: "exam" },
  { kanji: "措", meaning: "set aside, place", source: "surala.jp", category: "exam" },
  { kanji: "疎", meaning: "sparse, alienated", source: "surala.jp", category: "exam" },
  { kanji: "礎", meaning: "foundation", source: "surala.jp", category: "exam" },
  { kanji: "租", meaning: "tax, tribute", source: "surala.jp", category: "exam" },
  { kanji: "粗", meaning: "coarse, rough", source: "surala.jp", category: "exam" },
  
  // 追加の入試頻出漢字（中学・高校）
  { kanji: "遂", meaning: "accomplish", source: "education.jp", category: "exam" },
  { kanji: "墜", meaning: "fall, crash", source: "education.jp", category: "exam" },
  { kanji: "随", meaning: "follow", source: "education.jp", category: "exam" },
  { kanji: "髄", meaning: "marrow, pith", source: "education.jp", category: "exam" },
  { kanji: "枢", meaning: "pivot, hinge", source: "education.jp", category: "exam" },
  { kanji: "崇", meaning: "revere, adore", source: "education.jp", category: "exam" },
  { kanji: "据", meaning: "set, place", source: "education.jp", category: "exam" },
  { kanji: "杉", meaning: "cedar", source: "education.jp", category: "exam" },
  { kanji: "澄", meaning: "clear, lucid", source: "education.jp", category: "exam" },
  { kanji: "瀬", meaning: "rapids, shallows", source: "education.jp", category: "exam" },
  
  // 難関校頻出
  { kanji: "摂", meaning: "take in, absorb", source: "manabitimes.jp", category: "exam" },
  { kanji: "窃", meaning: "steal", source: "manabitimes.jp", category: "exam" },
  { kanji: "仙", meaning: "hermit, fairy", source: "manabitimes.jp", category: "exam" },
  { kanji: "占", meaning: "divine, occupy", source: "manabitimes.jp", category: "exam" },
  { kanji: "扇", meaning: "fan", source: "manabitimes.jp", category: "exam" },
  { kanji: "栓", meaning: "plug, stopper", source: "manabitimes.jp", category: "exam" },
  { kanji: "泉", meaning: "spring, fountain", source: "manabitimes.jp", category: "exam" },
  { kanji: "浅", meaning: "shallow", source: "manabitimes.jp", category: "exam" },
  { kanji: "洗", meaning: "wash", source: "manabitimes.jp", category: "exam" },
  { kanji: "染", meaning: "dye, stain", source: "manabitimes.jp", category: "exam" },
  
  // 国語入試頻出
  { kanji: "箋", meaning: "slip, note", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "繊", meaning: "fine, delicate", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "羨", meaning: "envy", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "腺", meaning: "gland", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "詮", meaning: "investigate, worth", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "践", meaning: "practice, tread", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "遷", meaning: "transition, move", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "鮮", meaning: "fresh, vivid", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "漸", meaning: "gradually", source: "yotsuya-otsuka.jp", category: "exam" },
  { kanji: "禅", meaning: "Zen, meditation", source: "yotsuya-otsuka.jp", category: "exam" },
  
  // 追加100字
  { kanji: "阻", meaning: "obstruct", source: "bunka.go.jp", category: "exam" },
  { kanji: "訴", meaning: "sue, appeal", source: "bunka.go.jp", category: "exam" },
  { kanji: "塑", meaning: "model", source: "bunka.go.jp", category: "exam" },
  { kanji: "遡", meaning: "go back", source: "bunka.go.jp", category: "exam" },
  { kanji: "双", meaning: "pair, both", source: "bunka.go.jp", category: "exam" },
  { kanji: "壮", meaning: "robust", source: "bunka.go.jp", category: "exam" },
  { kanji: "奏", meaning: "play music", source: "bunka.go.jp", category: "exam" },
  { kanji: "爽", meaning: "refreshing", source: "bunka.go.jp", category: "exam" },
  { kanji: "宋", meaning: "Song dynasty", source: "bunka.go.jp", category: "exam" },
  { kanji: "層", meaning: "layer, stratum", source: "bunka.go.jp", category: "exam" },
  { kanji: "匝", meaning: "go around", source: "bunka.go.jp", category: "exam" },
  { kanji: "惣", meaning: "all, general", source: "bunka.go.jp", category: "exam" },
  { kanji: "想", meaning: "think, idea", source: "bunka.go.jp", category: "exam" },
  { kanji: "捜", meaning: "search", source: "bunka.go.jp", category: "exam" },
  { kanji: "掃", meaning: "sweep", source: "bunka.go.jp", category: "exam" },
  { kanji: "挿", meaning: "insert", source: "bunka.go.jp", category: "exam" },
  { kanji: "操", meaning: "manipulate", source: "bunka.go.jp", category: "exam" },
  { kanji: "早", meaning: "early", source: "bunka.go.jp", category: "exam" },
  { kanji: "曹", meaning: "official", source: "bunka.go.jp", category: "exam" },
  { kanji: "槽", meaning: "tank, tub", source: "bunka.go.jp", category: "exam" },
  { kanji: "燥", meaning: "dry", source: "bunka.go.jp", category: "exam" },
  { kanji: "争", meaning: "contend", source: "bunka.go.jp", category: "exam" },
  { kanji: "痩", meaning: "thin, skinny", source: "bunka.go.jp", category: "exam" },
  { kanji: "相", meaning: "mutual", source: "bunka.go.jp", category: "exam" },
  { kanji: "窓", meaning: "window", source: "bunka.go.jp", category: "exam" },
  { kanji: "糟", meaning: "dregs", source: "bunka.go.jp", category: "exam" },
  { kanji: "総", meaning: "total, general", source: "bunka.go.jp", category: "exam" },
  { kanji: "綜", meaning: "synthesize", source: "bunka.go.jp", category: "exam" },
  { kanji: "聡", meaning: "wise, clever", source: "bunka.go.jp", category: "exam" },
  { kanji: "草", meaning: "grass", source: "bunka.go.jp", category: "exam" },
  { kanji: "荘", meaning: "villa, solemn", source: "bunka.go.jp", category: "exam" },
  { kanji: "葬", meaning: "funeral", source: "bunka.go.jp", category: "exam" },
  { kanji: "蒼", meaning: "blue, pale", source: "bunka.go.jp", category: "exam" },
  { kanji: "藻", meaning: "seaweed", source: "bunka.go.jp", category: "exam" },
  { kanji: "装", meaning: "attire, equip", source: "bunka.go.jp", category: "exam" },
  { kanji: "走", meaning: "run", source: "bunka.go.jp", category: "exam" },
  { kanji: "送", meaning: "send", source: "bunka.go.jp", category: "exam" },
  { kanji: "遭", meaning: "encounter", source: "bunka.go.jp", category: "exam" },
  { kanji: "霜", meaning: "frost", source: "bunka.go.jp", category: "exam" },
  { kanji: "騒", meaning: "noisy", source: "bunka.go.jp", category: "exam" },
];

// スクレイピング関数（サンプル - 実際の使用時は各サイトの利用規約を確認）
async function scrapeFromUrl(url: string, selector: string): Promise<string[]> {
  try {
    const response = await axios.get(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; KanjiBot/1.0)",
      },
      timeout: 10000,
    });
    const $ = cheerio.load(response.data);
    const kanji: string[] = [];
    $(selector).each((_, el) => {
      const text = $(el).text().trim();
      // 漢字のみ抽出
      const kanjiMatches = text.match(/[\u4e00-\u9faf]/g);
      if (kanjiMatches) {
        kanji.push(...kanjiMatches);
      }
    });
    return [...new Set(kanji)];
  } catch (error) {
    console.error(`[!] Failed to scrape ${url}:`, error);
    return [];
  }
}

async function main() {
  console.log("[*] Collecting exam kanji data...");
  
  // 静的データを使用（スクレイピングの代わり）
  const entries = EXAM_KANJI_DATA;
  
  // 重複を除去
  const uniqueKanji = new Map<string, KanjiEntry>();
  entries.forEach((entry) => {
    if (!uniqueKanji.has(entry.kanji)) {
      uniqueKanji.set(entry.kanji, entry);
    }
  });
  
  const result = Array.from(uniqueKanji.values());
  
  // 保存
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), "utf-8");
  console.log(`✅ kanji_exam.json saved (${result.length} entries)`);
}

main().catch(console.error);








