/**
 * radicals_bilingual.json に position フィールドを追加するスクリプト
 * 部首の配置（へん・つくり・かんむり・あし・たれ・かまえ・にょう）を分類
 */

import * as fs from "fs";
import * as path from "path";

interface RadicalBilingual {
  id: number;
  root: string;
  radical_name_en: string;
  radical_name_ja: string;
  description_en: string;
  description_ja: string;
  position?: string;
}

// 部首の配置マッピング
// 日本語名や英語名から配置を推定
const POSITION_MAP: Record<string, string> = {
  // へん（偏）- 左側
  "にんべん": "へん",
  "さんずい": "へん",
  "てへん": "へん",
  "きへん": "へん",
  "ひへん": "へん",
  "にちへん": "へん",
  "つきへん": "へん",
  "くちへん": "へん",
  "つちへん": "へん",
  "おんなへん": "へん",
  "ごんべん": "へん",
  "かねへん": "へん",
  "いとへん": "へん",
  "うまへん": "へん",
  "うおへん": "へん",
  "こめへん": "へん",
  "いしへん": "へん",
  "めへん": "へん",
  "ころもへん": "へん",
  "しょくへん": "へん",
  "のぎへん": "へん",
  "けものへん": "へん",
  "こへん": "へん",
  "ゆみへん": "へん",
  "やへん": "へん",
  "かいへん": "へん",
  "ふねへん": "へん",
  "くるまへん": "へん",
  "しめすへん": "へん",
  "とりへん": "へん",
  "うしへん": "へん",
  "ひつじへん": "へん",
  "むしへん": "へん",
  "かわへん": "へん",
  "ほねへん": "へん",
  "ちからへん": "へん",
  "たへん": "へん",
  "さけへん": "へん",
  "あしへん": "へん",
  "はねへん": "へん",
  "とらへん": "へん",
  "へびへん": "へん",
  
  // つくり（旁）- 右側
  "りっとう": "つくり",
  "おおざと": "つくり",
  "ぼくづくり": "つくり",
  "ほこづくり": "つくり",
  "るまた": "つくり",
  "あくび": "つくり",
  
  // かんむり（冠）- 上部
  "うかんむり": "かんむり",
  "くさかんむり": "かんむり",
  "あめかんむり": "かんむり",
  "たけかんむり": "かんむり",
  "わかんむり": "かんむり",
  "なべぶた": "かんむり",
  "ひとやね": "かんむり",
  "べきかんむり": "かんむり",
  "あなかんむり": "かんむり",
  
  // あし（脚）- 下部
  "こころ": "あし",
  "れんが": "あし",
  "ひとあし": "あし",
  "さら": "あし",
  
  // たれ（垂）- 上から左に垂れる
  "がんだれ": "たれ",
  "まだれ": "たれ",
  "やまいだれ": "たれ",
  "しかばね": "たれ",
  "とだれ": "たれ",
  
  // かまえ（構）- 囲む形
  "もんがまえ": "かまえ",
  "くにがまえ": "かまえ",
  "つつみがまえ": "かまえ",
  "けいがまえ": "かまえ",
  "はこがまえ": "かまえ",
  "ぎょうがまえ": "かまえ",
  
  // にょう（繞）- 左から下へ
  "しんにょう": "にょう",
  "えんにょう": "にょう",
  "そうにょう": "にょう",
  
  // りっしんべん（心の変形）
  "りっしんべん": "へん",
  "にくづき": "へん",
  
  // 英語名からの推定
  "Water": "へん",
  "Person": "へん",
  "Tree": "へん",
  "Hand": "へん",
  "Heart": "あし",
  "Sun": "へん",
  "Moon": "へん",
  "Mouth": "へん",
  "Earth": "へん",
  "Fire": "あし",
  "Gold": "へん",
  "Word": "へん",
  "Speech": "へん",
  "Eye": "へん",
  "Foot": "へん",
  "Walk": "にょう",
  "Road": "にょう",
  "Mountain": "へん",
  "Rain": "かんむり",
  "Grass": "かんむり",
  "Flower": "かんむり",
  "Rice": "へん",
  "Rice Paddy": "へん",
  "Thread": "へん",
  "Silk": "へん",
  "Clothes": "へん",
  "Food": "へん",
  "Eat": "へん",
  "Horse": "へん",
  "Fish": "へん",
  "Bird": "へん",
  "Dog": "へん",
  "Cow": "へん",
  "Sheep": "へん",
  "Shell": "へん",
  "Stone": "へん",
  "Roof": "かんむり",
  "House": "かんむり",
  "Door": "かまえ",
  "Gate": "かまえ",
  "Woman": "へん",
  "Child": "へん",
  "King": "へん",
  "Jewel": "へん",
  "Sword": "つくり",
  "Knife": "つくり",
  "Power": "つくり",
  "Strength": "つくり",
  "Field": "へん",
  "Net": "かんむり",
  "Bamboo": "かんむり",
  "Alcohol": "へん",
  "Bow": "へん",
  "Arrow": "へん",
  "Car": "へん",
  "Cart": "へん",
  "Boat": "へん",
  "Ship": "へん",
  "Bone": "へん",
  "Flesh": "へん",
  "Body": "へん",
  "Spirit": "へん",
  "Altar": "へん",
  "Wind": "かまえ",
  "Sound": "へん",
  "Insect": "へん",
  "Bug": "へん",
  "Illness": "たれ",
  "Cliff": "たれ",
};

async function main() {
  const inputPath = path.join(process.cwd(), "data", "radicals_bilingual.json");
  const outputPath = inputPath; // 上書き
  
  console.log("[*] Loading radicals_bilingual.json...");
  const radicals: RadicalBilingual[] = JSON.parse(fs.readFileSync(inputPath, "utf-8"));
  
  console.log(`[*] Adding position to ${radicals.length} radicals...`);
  
  let positionCounts: Record<string, number> = {
    "へん": 0,
    "つくり": 0,
    "かんむり": 0,
    "あし": 0,
    "たれ": 0,
    "かまえ": 0,
    "にょう": 0,
    "その他": 0,
  };
  
  radicals.forEach((r) => {
    // 日本語名から配置を推定
    let position = POSITION_MAP[r.radical_name_ja] || null;
    
    // 英語名から配置を推定
    if (!position) {
      position = POSITION_MAP[r.radical_name_en] || null;
    }
    
    // 日本語名に「へん」「かんむり」などが含まれているか確認
    if (!position) {
      if (r.radical_name_ja.includes("へん")) {
        position = "へん";
      } else if (r.radical_name_ja.includes("かんむり")) {
        position = "かんむり";
      } else if (r.radical_name_ja.includes("つくり") || r.radical_name_ja.includes("づくり")) {
        position = "つくり";
      } else if (r.radical_name_ja.includes("あし")) {
        position = "あし";
      } else if (r.radical_name_ja.includes("たれ")) {
        position = "たれ";
      } else if (r.radical_name_ja.includes("かまえ") || r.radical_name_ja.includes("がまえ")) {
        position = "かまえ";
      } else if (r.radical_name_ja.includes("にょう")) {
        position = "にょう";
      }
    }
    
    // デフォルトは「その他」
    r.position = position || "その他";
    positionCounts[r.position]++;
  });
  
  // 保存
  console.log("[*] Saving updated radicals_bilingual.json...");
  fs.writeFileSync(outputPath, JSON.stringify(radicals, null, 2), "utf-8");
  
  console.log("\n[*] Position counts:");
  Object.entries(positionCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([pos, count]) => {
      console.log(`    ${pos}: ${count}`);
    });
  
  console.log(`\n✅ Position field added to ${radicals.length} radicals`);
}

main().catch(console.error);











