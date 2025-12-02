/**
 * 部首の国際対応リスト
 * 日本語名 + 英語スラッグ + 配置タイプ + アンカーリンク
 */

// 配置タイプの定義
export const RADICAL_POSITION_TYPES = {
  "へん": { en: "left-radical", label: "偏（へん）", icon: "⬅️", desc: "漢字の左側に位置する部首", desc_en: "Left side of kanji" },
  "つくり": { en: "right-radical", label: "旁（つくり）", icon: "➡️", desc: "漢字の右側に位置する部首", desc_en: "Right side of kanji" },
  "かんむり": { en: "top-radical", label: "冠（かんむり）", icon: "⬆️", desc: "漢字の上部に位置する部首", desc_en: "Top of kanji" },
  "あし": { en: "bottom-radical", label: "脚（あし）", icon: "⬇️", desc: "漢字の下部に位置する部首", desc_en: "Bottom of kanji" },
  "たれ": { en: "hanging-radical", label: "垂（たれ）", icon: "↙️", desc: "上から左へ垂れる部首", desc_en: "Hanging from top-left" },
  "かまえ": { en: "enclosing-radical", label: "構（かまえ）", icon: "⬜", desc: "漢字を囲む部首", desc_en: "Enclosing radical" },
  "にょう": { en: "wrapping-radical", label: "繞（にょう）", icon: "↪️", desc: "左から下へ回り込む部首", desc_en: "Wrapping from left to bottom" },
  "その他": { en: "independent-radical", label: "その他", icon: "📝", desc: "独立した部首", desc_en: "Independent radical" },
} as const;

export type RadicalPositionKey = keyof typeof RADICAL_POSITION_TYPES;

// 既知の英語名マッピング（日本語読み → 英語スラッグ）
const KNOWN_ENGLISH_NAMES: Record<string, string> = {
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
  "こころ": "heart-radical",
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
  "かたへん": "katana-radical",
  "ゆみへん": "bow-radical",
  "くるまへん": "vehicle-radical",
  
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
  "しんにゅう": "movement-radical",
  "えんにょう": "long-stride-radical",
  "そうにょう": "run-radical",
  
  // かまえ（構）
  "もんがまえ": "gate-radical",
  "くにがまえ": "country-radical",
  "はこがまえ": "box-radical",
  "つつみがまえ": "wrapping-radical",
  
  // よく使われる部首（独立形）
  "みず": "water-radical",
  "つき": "moon-radical",
  "やま": "mountain-radical",
  "かわ": "river-radical",
  "はね": "feather-radical",
  "みみ": "ear-radical",
};

/**
 * 日本語の読みから英語スラッグを生成
 */
export function getEnglishSlug(jaName: string): string {
  // 既知の英語名があればそれを使用
  const lowerJa = jaName.toLowerCase();
  if (KNOWN_ENGLISH_NAMES[lowerJa]) {
    return KNOWN_ENGLISH_NAMES[lowerJa];
  }
  
  // ローマ字変換してスラッグ化
  const romanized = toRomaji(jaName);
  return `${romanized}-radical`;
}

/**
 * 簡易ローマ字変換（ひらがな → ローマ字）
 */
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
    "ゃ": "ya", "ゅ": "yu", "ょ": "yo",
    "っ": "", // 次の子音を重ねる処理は簡略化
    "ー": "",
  };
  
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += map[char] || char;
  }
  
  // スラッグ形式に変換（小文字、ハイフン区切り）
  return result.toLowerCase().replace(/\s+/g, "-");
}

/**
 * 配置タイプから英語アンカーを取得
 */
export function getPositionAnchor(positionJa: string): string {
  const pos = RADICAL_POSITION_TYPES[positionJa as RadicalPositionKey];
  return pos ? pos.en : "independent-radical";
}

/**
 * 部首の配置カテゴリーリスト（トップページ用）
 */
export const RADICAL_POSITION_LINKS = [
  { key: "へん", en: "left-radical", label: "偏（へん）", icon: "⬅️", desc: "左側" },
  { key: "つくり", en: "right-radical", label: "旁（つくり）", icon: "➡️", desc: "右側" },
  { key: "かんむり", en: "top-radical", label: "冠（かんむり）", icon: "⬆️", desc: "上部" },
  { key: "あし", en: "bottom-radical", label: "脚（あし）", icon: "⬇️", desc: "下部" },
  { key: "たれ", en: "hanging-radical", label: "垂（たれ）", icon: "↙️", desc: "上から左" },
  { key: "かまえ", en: "enclosing-radical", label: "構（かまえ）", icon: "⬜", desc: "囲む" },
  { key: "にょう", en: "wrapping-radical", label: "繞（にょう）", icon: "↪️", desc: "左から下" },
];

export interface RadicalEntry {
  jp: string;           // 日本語名
  en: string;           // 英語スラッグ
  root: string;         // 部首の文字
  type: string;         // 配置タイプ（英語）
  typeJa: string;       // 配置タイプ（日本語）
  anchor: string;       // アンカーリンク
  description?: string; // 説明
}

