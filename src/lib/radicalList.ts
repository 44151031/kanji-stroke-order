/**
 * 部首の国際対応リスト
 * 日本語名 + 英語スラッグ + 配置タイプ + アンカーリンク
 */

// ============================================
// 型定義
// ============================================

export interface Radical {
  jp: string;           // 日本語名（例: ごんべん）
  en: string;           // 英語名スラッグ（例: speech-radical）
  root: string;         // 部首の文字（例: 言）
  type: string;         // 部首型（例: left-radical）
  typeJa: string;       // 日本語型名（例: へん）
  anchor: string;       // アンカーリンク（例: radical#left-radical）
}

export type RadicalPositionKey = "へん" | "つくり" | "かんむり" | "あし" | "たれ" | "かまえ" | "にょう" | "その他";

// ============================================
// 配置タイプの定義
// ============================================

export const RADICAL_POSITION_TYPES: Record<RadicalPositionKey, { 
  en: string; 
  label: string; 
  icon: string; 
  desc: string; 
  desc_en: string;
}> = {
  "へん": { en: "left-radical", label: "偏（へん）", icon: "⬅️", desc: "漢字の左側に位置する部首", desc_en: "Left side of kanji" },
  "つくり": { en: "right-radical", label: "旁（つくり）", icon: "➡️", desc: "漢字の右側に位置する部首", desc_en: "Right side of kanji" },
  "かんむり": { en: "top-radical", label: "冠（かんむり）", icon: "⬆️", desc: "漢字の上部に位置する部首", desc_en: "Top of kanji" },
  "あし": { en: "bottom-radical", label: "脚（あし）", icon: "⬇️", desc: "漢字の下部に位置する部首", desc_en: "Bottom of kanji" },
  "たれ": { en: "hanging-radical", label: "垂（たれ）", icon: "↙️", desc: "上から左へ垂れる部首", desc_en: "Hanging from top-left" },
  "かまえ": { en: "enclosing-radical", label: "構（かまえ）", icon: "⬜", desc: "漢字を囲む部首", desc_en: "Enclosing radical" },
  "にょう": { en: "wrapping-radical", label: "繞（にょう）", icon: "↪️", desc: "左から下へ回り込む部首", desc_en: "Wrapping from left to bottom" },
  "その他": { en: "independent-radical", label: "その他", icon: "📝", desc: "独立した部首", desc_en: "Independent radical" },
};

// ============================================
// ユーティリティ関数
// ============================================

/**
 * 文字列の先頭を大文字にする
 * 例: "speech" → "Speech"
 */
export function capitalize(str: string): string {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * 英語スラッグから表示用英語名を抽出
 * 例: "speech-radical" → "Speech"
 */
export function getEnglishDisplayName(slug: string): string {
  const base = slug.replace(/-radical$/, "").replace(/-/g, " ");
  return base.split(" ").map(capitalize).join(" ");
}

/**
 * 日本語名と英語名の併記フォーマット
 * 例: "ごんべん（Speech）"
 */
export function formatRadicalName(jp: string, en: string): string {
  const englishDisplay = getEnglishDisplayName(en);
  return `${jp}（${englishDisplay}）`;
}

/**
 * 配置タイプから英語アンカーを取得
 */
export function getPositionAnchor(positionJa: string): string {
  const pos = RADICAL_POSITION_TYPES[positionJa as RadicalPositionKey];
  return pos ? pos.en : "independent-radical";
}

/**
 * 配置タイプから英語型名を取得
 */
export function getPositionType(positionJa: string): string {
  const pos = RADICAL_POSITION_TYPES[positionJa as RadicalPositionKey];
  return pos ? pos.en : "independent-radical";
}

// ============================================
// 部首リスト（主要な部首）
// ============================================

export const radicalList: Radical[] = [
  // へん（左側）- Left Radicals
  { jp: "ごんべん", en: "speech-radical", root: "言", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "にんべん", en: "person-radical", root: "亻", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "さんずい", en: "water-radical", root: "氵", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "てへん", en: "hand-radical", root: "扌", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "きへん", en: "tree-radical", root: "木", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "いとへん", en: "thread-radical", root: "糸", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "かねへん", en: "metal-radical", root: "金", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "ひへん", en: "fire-radical", root: "火", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "くちへん", en: "mouth-radical", root: "口", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "りっしんべん", en: "heart-radical", root: "忄", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "おんなへん", en: "woman-radical", root: "女", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "しめすへん", en: "altar-radical", root: "礻", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "にくづき", en: "flesh-radical", root: "月", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "むしへん", en: "insect-radical", root: "虫", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "うまへん", en: "horse-radical", root: "馬", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "やまへん", en: "mountain-radical", root: "山", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "ころもへん", en: "clothing-radical", root: "衤", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "あしへん", en: "foot-radical", root: "足", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "たまへん", en: "jewel-radical", root: "王", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "いしへん", en: "stone-radical", root: "石", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "かいへん", en: "shell-radical", root: "貝", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "のぎへん", en: "grain-radical", root: "禾", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "とりへん", en: "bird-radical", root: "鳥", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "つちへん", en: "earth-radical", root: "土", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "にちへん", en: "sun-radical", root: "日", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "めへん", en: "eye-radical", root: "目", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "うしへん", en: "cow-radical", root: "牛", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "けものへん", en: "animal-radical", root: "犭", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "かたなへん", en: "katana-radical", root: "刂", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "ゆみへん", en: "bow-radical", root: "弓", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "くるまへん", en: "vehicle-radical", root: "車", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "さけへん", en: "alcohol-radical", root: "酉", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },
  { jp: "やへん", en: "arrow-radical", root: "矢", type: "left-radical", typeJa: "へん", anchor: "radical#left-radical" },

  // かんむり（上部）- Top Radicals
  { jp: "くさかんむり", en: "grass-radical", root: "艹", type: "top-radical", typeJa: "かんむり", anchor: "radical#top-radical" },
  { jp: "あめかんむり", en: "rain-radical", root: "雨", type: "top-radical", typeJa: "かんむり", anchor: "radical#top-radical" },
  { jp: "あなかんむり", en: "cave-radical", root: "穴", type: "top-radical", typeJa: "かんむり", anchor: "radical#top-radical" },
  { jp: "たけかんむり", en: "bamboo-radical", root: "竹", type: "top-radical", typeJa: "かんむり", anchor: "radical#top-radical" },
  { jp: "うかんむり", en: "roof-radical", root: "宀", type: "top-radical", typeJa: "かんむり", anchor: "radical#top-radical" },
  { jp: "わかんむり", en: "crown-radical", root: "冖", type: "top-radical", typeJa: "かんむり", anchor: "radical#top-radical" },
  { jp: "はつがしら", en: "departure-radical", root: "癶", type: "top-radical", typeJa: "かんむり", anchor: "radical#top-radical" },

  // つくり（右側）- Right Radicals
  { jp: "おおがい", en: "big-shell-radical", root: "頁", type: "right-radical", typeJa: "つくり", anchor: "radical#right-radical" },
  { jp: "ちから", en: "power-radical", root: "力", type: "right-radical", typeJa: "つくり", anchor: "radical#right-radical" },
  { jp: "おおざと", en: "village-radical", root: "邑", type: "right-radical", typeJa: "つくり", anchor: "radical#right-radical" },
  { jp: "ふるとり", en: "short-tailed-bird-radical", root: "隹", type: "right-radical", typeJa: "つくり", anchor: "radical#right-radical" },
  { jp: "とます", en: "measure-radical", root: "斗", type: "right-radical", typeJa: "つくり", anchor: "radical#right-radical" },
  { jp: "ほこづくり", en: "weapon-radical", root: "殳", type: "right-radical", typeJa: "つくり", anchor: "radical#right-radical" },

  // あし（下部）- Bottom Radicals
  { jp: "ひとあし", en: "legs-radical", root: "儿", type: "bottom-radical", typeJa: "あし", anchor: "radical#bottom-radical" },
  { jp: "れっか", en: "fire-dots-radical", root: "灬", type: "bottom-radical", typeJa: "あし", anchor: "radical#bottom-radical" },
  { jp: "したごころ", en: "heart-bottom-radical", root: "心", type: "bottom-radical", typeJa: "あし", anchor: "radical#bottom-radical" },
  { jp: "さら", en: "dish-radical", root: "皿", type: "bottom-radical", typeJa: "あし", anchor: "radical#bottom-radical" },

  // たれ（垂れ）- Hanging Radicals
  { jp: "やまいだれ", en: "sickness-radical", root: "疒", type: "hanging-radical", typeJa: "たれ", anchor: "radical#hanging-radical" },
  { jp: "まだれ", en: "dotted-cliff-radical", root: "广", type: "hanging-radical", typeJa: "たれ", anchor: "radical#hanging-radical" },
  { jp: "しかばね", en: "corpse-radical", root: "尸", type: "hanging-radical", typeJa: "たれ", anchor: "radical#hanging-radical" },
  { jp: "がんだれ", en: "cliff-radical", root: "厂", type: "hanging-radical", typeJa: "たれ", anchor: "radical#hanging-radical" },

  // にょう（繞）- Wrapping Radicals
  { jp: "しんにょう", en: "movement-radical", root: "辶", type: "wrapping-radical", typeJa: "にょう", anchor: "radical#wrapping-radical" },
  { jp: "えんにょう", en: "long-stride-radical", root: "廴", type: "wrapping-radical", typeJa: "にょう", anchor: "radical#wrapping-radical" },
  { jp: "そうにょう", en: "run-radical", root: "走", type: "wrapping-radical", typeJa: "にょう", anchor: "radical#wrapping-radical" },

  // かまえ（構）- Enclosing Radicals
  { jp: "もんがまえ", en: "gate-radical", root: "門", type: "enclosing-radical", typeJa: "かまえ", anchor: "radical#enclosing-radical" },
  { jp: "くにがまえ", en: "country-radical", root: "囗", type: "enclosing-radical", typeJa: "かまえ", anchor: "radical#enclosing-radical" },
  { jp: "はこがまえ", en: "box-radical", root: "匚", type: "enclosing-radical", typeJa: "かまえ", anchor: "radical#enclosing-radical" },
  { jp: "つつみがまえ", en: "wrap-radical", root: "勹", type: "enclosing-radical", typeJa: "かまえ", anchor: "radical#enclosing-radical" },
];

// ============================================
// スラッグ重複チェックとユニーク化
// ============================================

// 重複しているスラッグを検出
const slugCounts = new Map<string, number>();
radicalList.forEach((r) => {
  slugCounts.set(r.en, (slugCounts.get(r.en) || 0) + 1);
});

const duplicateSlugs = new Set<string>();
slugCounts.forEach((count, slug) => {
  if (count > 1) duplicateSlugs.add(slug);
});

/**
 * ユニークなスラッグを取得
 * 重複している場合はタイプを末尾に追加
 */
export function getUniqueSlug(radical: Radical): string {
  if (duplicateSlugs.has(radical.en)) {
    return `${radical.en}-${radical.type}`;
  }
  return radical.en;
}

/**
 * スラッグから部首を検索
 */
export function findRadicalBySlug(slug: string): Radical | undefined {
  // まず完全一致を探す
  let found = radicalList.find((r) => r.en === slug);
  if (found) return found;
  
  // ユニークスラッグ形式で探す（type付き）
  found = radicalList.find((r) => getUniqueSlug(r) === slug);
  if (found) return found;
  
  return undefined;
}

/**
 * 部首のリンクURLを生成
 */
export function getRadicalLink(radical: Radical): string {
  return `/radical/${getUniqueSlug(radical)}`;
}

// ============================================
// 既知の英語名マッピング（レガシー互換）
// ============================================

const KNOWN_ENGLISH_NAMES: Record<string, string> = {
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
  "かたなへん": "katana-radical",
  "ゆみへん": "bow-radical",
  "くるまへん": "vehicle-radical",
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

/**
 * 日本語の読みから英語スラッグを生成
 */
export function getEnglishSlug(jaName: string): string {
  const lowerJa = jaName.toLowerCase();
  if (KNOWN_ENGLISH_NAMES[lowerJa]) {
    return KNOWN_ENGLISH_NAMES[lowerJa];
  }
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
    "っ": "",
    "ー": "",
  };
  
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    result += map[char] || char;
  }
  
  return result.toLowerCase().replace(/\s+/g, "-");
}

// ============================================
// トップページ用の配置カテゴリーリスト
// ============================================

export const RADICAL_POSITION_LINKS = [
  { key: "へん", en: "left-radical", label: "偏（へん）", labelEn: "Left", icon: "⬅️", desc: "左側" },
  { key: "つくり", en: "right-radical", label: "旁（つくり）", labelEn: "Right", icon: "➡️", desc: "右側" },
  { key: "かんむり", en: "top-radical", label: "冠（かんむり）", labelEn: "Top", icon: "⬆️", desc: "上部" },
  { key: "あし", en: "bottom-radical", label: "脚（あし）", labelEn: "Bottom", icon: "⬇️", desc: "下部" },
  { key: "たれ", en: "hanging-radical", label: "垂（たれ）", labelEn: "Hanging", icon: "↙️", desc: "上から左" },
  { key: "かまえ", en: "enclosing-radical", label: "構（かまえ）", labelEn: "Enclosing", icon: "⬜", desc: "囲む" },
  { key: "にょう", en: "wrapping-radical", label: "繞（にょう）", labelEn: "Wrapping", icon: "↪️", desc: "左から下" },
];
