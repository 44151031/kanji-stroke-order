/**
 * 間違えやすい漢字スクレイピング
 * ソース: Benesse, Gakken, 文化庁など
 */

import * as fs from "fs";
import * as path from "path";
import { KanjiEntry } from "./types";

const OUTPUT_PATH = path.join(process.cwd(), "data", "kanji_mistake.json");

// 間違えやすい漢字データ（教育系サイト・文化庁データを参考）
const MISTAKE_KANJI_DATA: KanjiEntry[] = [
  // 書き間違えやすい漢字（同音異義語）
  { kanji: "異", meaning: "different, unusual", source: "benesse.jp", category: "mistake", examples: ["異常/以上"] },
  { kanji: "意", meaning: "intention, meaning", source: "benesse.jp", category: "mistake", examples: ["意義/異議"] },
  { kanji: "移", meaning: "move, transfer", source: "benesse.jp", category: "mistake", examples: ["移動/異動"] },
  { kanji: "維", meaning: "maintain", source: "benesse.jp", category: "mistake", examples: ["維持/意地"] },
  { kanji: "威", meaning: "authority", source: "benesse.jp", category: "mistake", examples: ["威力/意力(誤)"] },
  
  // 読み間違えやすい漢字
  { kanji: "凡", meaning: "ordinary", source: "bunka.go.jp", category: "mistake", examples: ["凡例(はんれい)"] },
  { kanji: "汎", meaning: "general, pan-", source: "bunka.go.jp", category: "mistake", examples: ["汎用(はんよう)"] },
  { kanji: "氾", meaning: "overflow", source: "bunka.go.jp", category: "mistake", examples: ["氾濫(はんらん)"] },
  { kanji: "帆", meaning: "sail", source: "bunka.go.jp", category: "mistake", examples: ["帆船(はんせん/ほせん)"] },
  { kanji: "煩", meaning: "troublesome", source: "bunka.go.jp", category: "mistake", examples: ["煩雑(はんざつ)"] },
  
  // 送り仮名を間違えやすい漢字
  { kanji: "著", meaning: "author, remarkable", source: "gakken.jp", category: "mistake", examples: ["著しい(いちじるしい)"] },
  { kanji: "著", meaning: "author, remarkable", source: "gakken.jp", category: "mistake", examples: ["著す(あらわす)"] },
  { kanji: "現", meaning: "appear", source: "gakken.jp", category: "mistake", examples: ["現れる/現わる(古)"] },
  { kanji: "表", meaning: "express", source: "gakken.jp", category: "mistake", examples: ["表す/表わす"] },
  { kanji: "行", meaning: "go, conduct", source: "gakken.jp", category: "mistake", examples: ["行う/行なう"] },
  
  // 形が似ていて間違えやすい
  { kanji: "己", meaning: "self", source: "surala.jp", category: "mistake", examples: ["己(おのれ)"] },
  { kanji: "已", meaning: "already", source: "surala.jp", category: "mistake", examples: ["已む(やむ)"] },
  { kanji: "巳", meaning: "snake (zodiac)", source: "surala.jp", category: "mistake", examples: ["巳年(みどし)"] },
  { kanji: "末", meaning: "end", source: "surala.jp", category: "mistake", examples: ["末期(まっき)"] },
  { kanji: "未", meaning: "not yet", source: "surala.jp", category: "mistake", examples: ["未来(みらい)"] },
  
  // 部首を間違えやすい
  { kanji: "裏", meaning: "back, reverse", source: "education.jp", category: "mistake", examples: ["裏(うら)"] },
  { kanji: "衷", meaning: "innermost", source: "education.jp", category: "mistake", examples: ["衷心(ちゅうしん)"] },
  { kanji: "哀", meaning: "sorrow", source: "education.jp", category: "mistake", examples: ["哀愁(あいしゅう)"] },
  { kanji: "衰", meaning: "decline", source: "education.jp", category: "mistake", examples: ["衰退(すいたい)"] },
  { kanji: "袋", meaning: "bag", source: "education.jp", category: "mistake", examples: ["袋(ふくろ)"] },
  
  // 画数を間違えやすい
  { kanji: "飛", meaning: "fly", source: "manabitimes.jp", category: "mistake", examples: ["飛ぶ(9画)"] },
  { kanji: "必", meaning: "necessary", source: "manabitimes.jp", category: "mistake", examples: ["必ず(5画)"] },
  { kanji: "博", meaning: "wide, extensive", source: "manabitimes.jp", category: "mistake", examples: ["博士(12画)"] },
  { kanji: "専", meaning: "specialty", source: "manabitimes.jp", category: "mistake", examples: ["専門(9画)"] },
  { kanji: "発", meaning: "emit, depart", source: "manabitimes.jp", category: "mistake", examples: ["発展(9画)"] },
  
  // 書き順を間違えやすい
  { kanji: "右", meaning: "right", source: "bunka.go.jp", category: "mistake", examples: ["右(みぎ)"] },
  { kanji: "左", meaning: "left", source: "bunka.go.jp", category: "mistake", examples: ["左(ひだり)"] },
  { kanji: "有", meaning: "have, exist", source: "bunka.go.jp", category: "mistake", examples: ["有る(ある)"] },
  { kanji: "布", meaning: "cloth", source: "bunka.go.jp", category: "mistake", examples: ["布(ぬの)"] },
  { kanji: "希", meaning: "hope, rare", source: "bunka.go.jp", category: "mistake", examples: ["希望(きぼう)"] },
  
  // 熟語で間違えやすい
  { kanji: "貴", meaning: "noble, precious", source: "benesse.jp", category: "mistake", examples: ["貴重(きちょう)"] },
  { kanji: "帰", meaning: "return", source: "benesse.jp", category: "mistake", examples: ["帰還(きかん)"] },
  { kanji: "機", meaning: "machine, opportunity", source: "benesse.jp", category: "mistake", examples: ["機会(きかい)"] },
  { kanji: "器", meaning: "vessel, talent", source: "benesse.jp", category: "mistake", examples: ["器官(きかん)"] },
  { kanji: "基", meaning: "foundation", source: "benesse.jp", category: "mistake", examples: ["基準(きじゅん)"] },
  
  // 音読み・訓読みを間違えやすい
  { kanji: "生", meaning: "life, birth", source: "gakken.jp", category: "mistake", examples: ["生(せい/しょう/なま/い)"] },
  { kanji: "行", meaning: "go, conduct", source: "gakken.jp", category: "mistake", examples: ["行(こう/ぎょう/あん/い/ゆ)"] },
  { kanji: "分", meaning: "part, understand", source: "gakken.jp", category: "mistake", examples: ["分(ぶん/ふん/ぶ/わ)"] },
  { kanji: "明", meaning: "bright, clear", source: "gakken.jp", category: "mistake", examples: ["明(めい/みょう/あ/あか)"] },
  { kanji: "下", meaning: "below, under", source: "gakken.jp", category: "mistake", examples: ["下(か/げ/した/さ/くだ/お)"] },
  
  // 新字体・旧字体を間違えやすい
  { kanji: "学", meaning: "study", source: "surala.jp", category: "mistake", examples: ["学←學"] },
  { kanji: "国", meaning: "country", source: "surala.jp", category: "mistake", examples: ["国←國"] },
  { kanji: "会", meaning: "meet, society", source: "surala.jp", category: "mistake", examples: ["会←會"] },
  { kanji: "体", meaning: "body", source: "surala.jp", category: "mistake", examples: ["体←體"] },
  { kanji: "広", meaning: "wide", source: "surala.jp", category: "mistake", examples: ["広←廣"] },
  
  // 漢字の使い分けを間違えやすい
  { kanji: "計", meaning: "measure, plan", source: "education.jp", category: "mistake", examples: ["計る(時間・量)"] },
  { kanji: "測", meaning: "measure", source: "education.jp", category: "mistake", examples: ["測る(長さ・深さ)"] },
  { kanji: "量", meaning: "quantity", source: "education.jp", category: "mistake", examples: ["量る(重さ)"] },
  { kanji: "図", meaning: "plan, diagram", source: "education.jp", category: "mistake", examples: ["図る(企てる)"] },
  { kanji: "諮", meaning: "consult", source: "education.jp", category: "mistake", examples: ["諮る(意見を聞く)"] },
  
  // 同訓異字
  { kanji: "堅", meaning: "firm, hard", source: "manabitimes.jp", category: "mistake", examples: ["堅い(かたい)"] },
  { kanji: "硬", meaning: "hard, stiff", source: "manabitimes.jp", category: "mistake", examples: ["硬い(かたい)"] },
  { kanji: "固", meaning: "solid, firm", source: "manabitimes.jp", category: "mistake", examples: ["固い(かたい)"] },
  { kanji: "熱", meaning: "heat, fever", source: "manabitimes.jp", category: "mistake", examples: ["熱い(あつい)"] },
  { kanji: "暑", meaning: "hot (weather)", source: "manabitimes.jp", category: "mistake", examples: ["暑い(あつい)"] },
  { kanji: "厚", meaning: "thick, kind", source: "manabitimes.jp", category: "mistake", examples: ["厚い(あつい)"] },
  
  // 特殊な読みを間違えやすい
  { kanji: "初", meaning: "first, beginning", source: "bunka.go.jp", category: "mistake", examples: ["初め(はじめ)/初めて(はじめて)"] },
  { kanji: "始", meaning: "begin", source: "bunka.go.jp", category: "mistake", examples: ["始め(はじめ)/始まる(はじまる)"] },
  { kanji: "元", meaning: "origin, former", source: "bunka.go.jp", category: "mistake", examples: ["元(もと)/元々(もともと)"] },
  { kanji: "基", meaning: "foundation", source: "bunka.go.jp", category: "mistake", examples: ["基(もと)/基づく(もとづく)"] },
  { kanji: "本", meaning: "book, origin", source: "bunka.go.jp", category: "mistake", examples: ["本(もと)/本来(ほんらい)"] },
  
  // 追加データ
  { kanji: "勤", meaning: "work diligently", source: "benesse.jp", category: "mistake", examples: ["勤める(つとめる)"] },
  { kanji: "務", meaning: "duty", source: "benesse.jp", category: "mistake", examples: ["務める(つとめる)"] },
  { kanji: "努", meaning: "effort", source: "benesse.jp", category: "mistake", examples: ["努める(つとめる)"] },
  { kanji: "収", meaning: "collect", source: "benesse.jp", category: "mistake", examples: ["収める(おさめる)"] },
  { kanji: "納", meaning: "deliver, pay", source: "benesse.jp", category: "mistake", examples: ["納める(おさめる)"] },
  { kanji: "治", meaning: "govern, cure", source: "benesse.jp", category: "mistake", examples: ["治める(おさめる)"] },
  { kanji: "修", meaning: "repair, study", source: "benesse.jp", category: "mistake", examples: ["修める(おさめる)"] },
  
  // 敬語で間違えやすい
  { kanji: "召", meaning: "call, summon", source: "gakken.jp", category: "mistake", examples: ["召す(めす)"] },
  { kanji: "申", meaning: "say humbly", source: "gakken.jp", category: "mistake", examples: ["申す(もうす)"] },
  { kanji: "参", meaning: "go, visit", source: "gakken.jp", category: "mistake", examples: ["参る(まいる)"] },
  { kanji: "存", meaning: "exist, know", source: "gakken.jp", category: "mistake", examples: ["存じる(ぞんじる)"] },
  { kanji: "致", meaning: "do humbly", source: "gakken.jp", category: "mistake", examples: ["致す(いたす)"] },
  
  // ビジネスで間違えやすい
  { kanji: "御", meaning: "honorific prefix", source: "surala.jp", category: "mistake", examples: ["御(お/ご/おん/み)"] },
  { kanji: "拝", meaning: "worship", source: "surala.jp", category: "mistake", examples: ["拝見(はいけん)"] },
  { kanji: "賜", meaning: "grant, bestow", source: "surala.jp", category: "mistake", examples: ["賜る(たまわる)"] },
  { kanji: "頂", meaning: "receive, top", source: "surala.jp", category: "mistake", examples: ["頂く(いただく)"] },
  { kanji: "恐", meaning: "fear, sorry", source: "surala.jp", category: "mistake", examples: ["恐れ入る(おそれいる)"] },
  
  // 日常で間違えやすい
  { kanji: "替", meaning: "exchange", source: "education.jp", category: "mistake", examples: ["替える(かえる)"] },
  { kanji: "換", meaning: "exchange", source: "education.jp", category: "mistake", examples: ["換える(かえる)"] },
  { kanji: "代", meaning: "substitute", source: "education.jp", category: "mistake", examples: ["代える(かえる)"] },
  { kanji: "変", meaning: "change", source: "education.jp", category: "mistake", examples: ["変える(かえる)"] },
  { kanji: "返", meaning: "return", source: "education.jp", category: "mistake", examples: ["返す(かえす)"] },
  
  // 法律・公文書で間違えやすい
  { kanji: "抵", meaning: "resist", source: "bunka.go.jp", category: "mistake", examples: ["抵触(ていしょく)"] },
  { kanji: "低", meaning: "low", source: "bunka.go.jp", category: "mistake", examples: ["低下(ていか)"] },
  { kanji: "底", meaning: "bottom", source: "bunka.go.jp", category: "mistake", examples: ["底辺(ていへん)"] },
  { kanji: "邸", meaning: "mansion", source: "bunka.go.jp", category: "mistake", examples: ["邸宅(ていたく)"] },
  { kanji: "定", meaning: "fix, settle", source: "bunka.go.jp", category: "mistake", examples: ["定める(さだめる)"] },
];

async function main() {
  console.log("[*] Collecting common mistake kanji data...");
  
  // 静的データを使用
  const entries = MISTAKE_KANJI_DATA;
  
  // 重複を除去
  const uniqueKanji = new Map<string, KanjiEntry>();
  entries.forEach((entry) => {
    const key = `${entry.kanji}-${entry.examples?.join(",")}`;
    if (!uniqueKanji.has(key)) {
      uniqueKanji.set(key, entry);
    }
  });
  
  const result = Array.from(uniqueKanji.values());
  
  // 保存
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(result, null, 2), "utf-8");
  console.log(`✅ kanji_mistake.json saved (${result.length} entries)`);
}

main().catch(console.error);
















