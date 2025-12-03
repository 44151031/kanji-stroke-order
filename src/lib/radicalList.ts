export interface Radical {
  jp: string;        // 日本語名（例: ごんべん）
  en: string;        // 英語名スラッグ（例: speech-radical）
  root?: string;     // 部首の字（例: 言）※任意
  type: string;      // 部首型: left-radical | right-radical | top-radical | bottom-radical | enclosing-radical | hanging-radical | wrapping-radical | independent-radical
  typeJa: string;    // 日本語型名（偏/旁/冠/脚/構/垂/繞/他）
  anchor: string;    // 例: "radical#left-radical"
}

export const RADICAL_POSITION_TYPES = [
  "left-radical",
  "right-radical",
  "top-radical",
  "bottom-radical",
  "enclosing-radical",
  "hanging-radical",
  "wrapping-radical",
  "independent-radical",
] as const;

export type RadicalPosition = typeof RADICAL_POSITION_TYPES[number];

export const capitalize = (s: string) =>
  s ? s.charAt(0).toUpperCase() + s.slice(1) : s;

/**
 * "speech-radical" -> "Speech"
 * "water-radical"  -> "Water"
 */
export const getEnglishDisplayName = (slug: string) => {
  const base = slug.replace(/-radical$/, "");
  return capitalize(base);
};

/**
 * 表示名を "日本語（English）" に整形
 * ex) ごんべん（Speech）
 */
export const formatRadicalName = (jp: string, enSlug: string) => {
  return `${jp}（${getEnglishDisplayName(enSlug)}）`;
};

/**
 * slug 重複を検出して、必要なら "-{type}" を付与
 */
export const buildSlugIndex = (list: Radical[]) => {
  const counts = new Map<string, number>();
  list.forEach((r) => {
    counts.set(r.en, (counts.get(r.en) ?? 0) + 1);
  });
  return counts;
};

export const getUniqueSlug = (r: Radical, counts: Map<string, number>) => {
  const duplicated = (counts.get(r.en) ?? 0) > 1;
  return duplicated ? `${r.en}-${r.type}` : r.en;
};

/**
 * URL から検索するための正規化:
 *  - 末尾に "-{type}" が付いていても取り外して一致判定できるようにする
 */
export const normalizeSlug = (slug: string) => {
  const pos = RADICAL_POSITION_TYPES.find((t) => slug.endsWith(`-${t}`));
  return pos ? slug.slice(0, -1 * (`-${pos}`).length) : slug;
};

export const findRadicalBySlug = (slug: string, list: Radical[]) => {
  const base = normalizeSlug(slug);
  return list.find((r) => r.en === base) ?? null;
};

/**
 * 一覧/詳細ページ両方で使う生データ
 * 必要に応じて追加してよい
 */
export const radicalList: Radical[] = [
  // へん（左側）- Left Radicals
  { jp: "ごんべん", en: "speech-radical", root: "言", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "にんべん", en: "person-radical", root: "亻", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "さんずい", en: "water-radical", root: "氵", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "てへん", en: "hand-radical", root: "扌", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "きへん", en: "tree-radical", root: "木", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "いとへん", en: "thread-radical", root: "糸", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "かねへん", en: "metal-radical", root: "金", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ひへん", en: "fire-radical", root: "火", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "くちへん", en: "mouth-radical", root: "口", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "りっしんべん", en: "heart-radical", root: "忄", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "おんなへん", en: "woman-radical", root: "女", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "しめすへん", en: "altar-radical", root: "礻", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "にくづき", en: "flesh-radical", root: "月", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "むしへん", en: "insect-radical", root: "虫", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "うまへん", en: "horse-radical", root: "馬", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "やまへん", en: "mountain-radical", root: "山", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ころもへん", en: "clothing-radical", root: "衤", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "あしへん", en: "foot-radical", root: "足", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "たまへん", en: "jewel-radical", root: "王", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "いしへん", en: "stone-radical", root: "石", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "かいへん", en: "shell-radical", root: "貝", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "のぎへん", en: "grain-radical", root: "禾", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "とりへん", en: "bird-radical", root: "鳥", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "つちへん", en: "earth-radical", root: "土", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "にちへん", en: "sun-radical", root: "日", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "めへん", en: "eye-radical", root: "目", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "うしへん", en: "cow-radical", root: "牛", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "けものへん", en: "animal-radical", root: "犭", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "かたなへん", en: "katana-radical", root: "刂", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ゆみへん", en: "bow-radical", root: "弓", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "くるまへん", en: "vehicle-radical", root: "車", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "さけへん", en: "alcohol-radical", root: "酉", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "やへん", en: "arrow-radical", root: "矢", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },

  // かんむり（上部）- Top Radicals
  { jp: "くさかんむり", en: "grass-radical", root: "艹", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "あめかんむり", en: "rain-radical", root: "雨", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "あなかんむり", en: "cave-radical", root: "穴", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "たけかんむり", en: "bamboo-radical", root: "竹", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "うかんむり", en: "roof-radical", root: "宀", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "わかんむり", en: "crown-radical", root: "冖", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "はつがしら", en: "departure-radical", root: "癶", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },

  // つくり（右側）- Right Radicals
  { jp: "おおがい", en: "big-shell-radical", root: "頁", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ちから", en: "power-radical", root: "力", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "おおざと", en: "village-radical", root: "邑", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ふるとり", en: "short-tailed-bird-radical", root: "隹", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "とます", en: "measure-radical", root: "斗", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ほこづくり", en: "weapon-radical", root: "殳", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },

  // あし（下部）- Bottom Radicals
  { jp: "ひとあし", en: "legs-radical", root: "儿", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "れっか", en: "fire-dots-radical", root: "灬", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "したごころ", en: "heart-bottom-radical", root: "心", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "さら", en: "dish-radical", root: "皿", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },

  // たれ（垂れ）- Hanging Radicals
  { jp: "やまいだれ", en: "sickness-radical", root: "疒", type: "hanging-radical", typeJa: "垂", anchor: "radical#hanging-radical" },
  { jp: "まだれ", en: "dotted-cliff-radical", root: "广", type: "hanging-radical", typeJa: "垂", anchor: "radical#hanging-radical" },
  { jp: "しかばね", en: "corpse-radical", root: "尸", type: "hanging-radical", typeJa: "垂", anchor: "radical#hanging-radical" },
  { jp: "がんだれ", en: "cliff-radical", root: "厂", type: "hanging-radical", typeJa: "垂", anchor: "radical#hanging-radical" },

  // にょう（繞）- Wrapping Radicals
  { jp: "しんにょう", en: "movement-radical", root: "辶", type: "wrapping-radical", typeJa: "繞", anchor: "radical#wrapping-radical" },
  { jp: "えんにょう", en: "long-stride-radical", root: "廴", type: "wrapping-radical", typeJa: "繞", anchor: "radical#wrapping-radical" },
  { jp: "そうにょう", en: "run-radical", root: "走", type: "wrapping-radical", typeJa: "繞", anchor: "radical#wrapping-radical" },

  // かまえ（構）- Enclosing Radicals
  { jp: "もんがまえ", en: "gate-radical", root: "門", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "くにがまえ", en: "country-radical", root: "囗", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "はこがまえ", en: "box-radical", root: "匚", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "つつみがまえ", en: "wrap-radical", root: "勹", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },

  // その他 - Independent Radicals (複数位置に出現、または独立して使われる部首)
  { jp: "ひと", en: "hito-radical", root: "人", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "だい", en: "dai-radical", root: "大", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ちから", en: "chikara-radical", root: "力", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "こころ", en: "kokoro-radical", root: "心", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "た", en: "ta-radical", root: "田", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "おんな", en: "onna-radical", root: "女", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "こ", en: "ko-radical", root: "子", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "やま", en: "yama-radical", root: "山", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "かわ", en: "kawa-radical", root: "川", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "つき", en: "tsuki-radical", root: "月", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ひ", en: "hi-radical", root: "日", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "みず", en: "mizu-radical", root: "水", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ひ", en: "fire-standalone-radical", root: "火", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "いち", en: "ichi-radical", root: "一", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "に", en: "ni-radical", root: "二", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "じゅう", en: "juu-radical", root: "十", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "はね", en: "hane-radical", root: "羽", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "みみ", en: "mimi-radical", root: "耳", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "くち", en: "kuchi-radical", root: "口", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "め", en: "me-radical", root: "目", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
];

export default radicalList;
