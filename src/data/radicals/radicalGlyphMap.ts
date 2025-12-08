// src/data/radicals/radicalGlyphMap.ts
// ✅ 部首スラッグ → 表示用グリフ（radical glyph）

export const radicalGlyphMap: Record<string, string> = {
  "water-radical": "氵",       // さんずい
  "hand-radical": "扌",        // てへん
  "person-radical": "亻",      // にんべん
  "word-radical": "訁",        // ごんべん (日本語サイト向けは訁を採用)
  "speech-radical": "訁",      // = word-radical と同一運用に寄せる
  "heart-radical": "忄",       // りっしんべん
  "fire-radical": "灬",        // れっか
  "grass-radical": "艹",       // くさかんむり
  "knife-radical": "刂",       // りっとう
  "dog-radical": "犭",         // けものへん
  "movement-radical": "辶",    // しんにょう
  "roof-radical": "宀",        // うかんむり
  "enclosure-radical": "囗",    // くにがまえ
  "cliff-radical": "厂",       // がんだれ
  "hill-radical": "阝",        // こざと/おおざと（左右差は将来拡張）
  "metal-radical": "釒",       // かねへん（表示フォント次第で金でもOK）
  "jade-radical": "玉",        // たまへん 親字
  "earth-radical": "土",       // つちへん 親字
  "sun-radical": "日",
  "moon-radical": "月",
  "rain-radical": "⻗",        // あめかんむりの部首字形
  "tree-radical": "木",        // きへん
  "thread-radical": "糸",      // いとへん
  "eye-radical": "目",         // めへん
  "foot-radical": "足",        // あしへん
  "mountain-radical": "山",    // やまへん
  "mouth-radical": "口",       // くちへん
  "stone-radical": "石",       // いしへん
  "shell-radical": "貝",       // かいへん
  "bird-radical": "鳥",        // とりへん
  "horse-radical": "馬",       // うまへん
  "fish-radical": "魚",        // うおへん
  "cow-radical": "牛",        // うしへん
  "sheep-radical": "羊",       // ひつじへん
  "woman-radical": "女",       // おんなへん
  "child-radical": "子",       // こへん
  "rice-radical": "米",        // こめへん
  "clothes-radical": "衣",     // ころもへん
  "food-radical": "食",        // しょくへん
  "bow-radical": "弓",        // ゆみへん
  "car-radical": "車",        // くるまへん
  "boat-radical": "舟",        // ふねへん
  "bone-radical": "骨",        // ほねへん
  "spirit-radical": "示",      // しめすへん
  "wind-radical": "風",       // かぜへん
  "sound-radical": "音",       // おとへん
  "color-radical": "色",       // いろへん
  // 必要に応じて後から追加可能
};

export function getRadicalGlyphBySlug(slug: string, fallback?: string): string {
  return radicalGlyphMap[slug] ?? fallback ?? "?";
}

