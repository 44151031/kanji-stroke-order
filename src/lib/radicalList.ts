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

/**
 * URL用スラッグに変換: 「・」を「-」に変換
 */
const slugify = (str: string): string => {
  return str.replace(/・/g, "-");
};

export const getUniqueSlug = (r: Radical, counts: Map<string, number>) => {
  const enSlug = slugify(r.en);
  const duplicated = (counts.get(r.en) ?? 0) > 1;
  return duplicated ? `${enSlug}-${r.type}` : enSlug;
};

/**
 * URL から検索するための正規化:
 *  - 末尾に "-{type}" が付いていても取り外して一致判定できるようにする
 *  - 「・」を「-」に変換（URL互換性のため）
 */
export const normalizeSlug = (slug: string) => {
  // まず「・」を「-」に変換
  const normalized = slugify(slug);
  const pos = RADICAL_POSITION_TYPES.find((t) => normalized.endsWith(`-${t}`));
  return pos ? normalized.slice(0, -1 * (`-${pos}`).length) : normalized;
};

export const findRadicalBySlug = (slug: string, list: Radical[]) => {
  const counts = buildSlugIndex(list);
  // スラッグの「・」を「-」に変換（URL互換性のため）
  const normalizedSlug = slugify(slug);
  
  // 1. まず完全一致で検索（新しいURL形式: daigashi-top-radical）
  let found = list.find((r) => {
    const uniqueSlug = getUniqueSlug(r, counts);
    return uniqueSlug === normalizedSlug;
  });
  if (found) return found;
  
  // 2. 元のスラッグ（「・」を含む可能性）で検索（後方互換性のため）
  found = list.find((r) => {
    const uniqueSlug = getUniqueSlug(r, counts);
    return uniqueSlug === slug;
  });
  if (found) return found;
  
  // 3. en フィールドと完全一致するか確認（「・」を含む場合も）
  found = list.find((r) => r.en === slug || slugify(r.en) === normalizedSlug);
  if (found) return found;
  
  // 4. 正規化して検索（既存URL形式: speech-radical → speech）
  const base = normalizeSlug(normalizedSlug);
  found = list.find((r) => {
    const normalizedEn = slugify(r.en);
    return normalizedEn === base;
  });
  if (found) return found;
  
  // 5. en フィールドを正規化して比較（互換性のため）
  // 既存URL: /radical/speech のような場合、en フィールドが speech-radical のものを探す
  found = list.find((r) => {
    const normalizedEn = normalizeSlug(r.en);
    return normalizedEn === base;
  });
  
  return found ?? null;
};

/**
 * 一覧/詳細ページ両方で使う生データ
 * このファイルは data/raw/へんとかんじ.xlsx から自動生成されます
 */
export const radicalList: Radical[] = [
  // へん（左側）- Left Radicals
  { jp: "さんずい", en: "water-radical", root: "水", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "にんべん", en: "person-radical", root: "人", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "てへん", en: "hand-radical", root: "手", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ごんべん", en: "speech-radical", root: "言", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "きへん", en: "tree-radical", root: "木", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "いとへん", en: "thread-radical", root: "糸", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "しんにょう・しんにゅう", en: "shinniょ-left-radical", root: "辵", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "りっしんべん", en: "heart-radical", root: "心", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "にくづき", en: "flesh-radical", root: "肉", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "かねへん", en: "metal-radical", root: "金", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "こざとへん", en: "kozatohe-left-radical", root: "阜", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "くちへん", en: "mouth-radical", root: "口", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "つちへん・どへん", en: "tsuchihen-left-radical", root: "土", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "おんなへん", en: "woman-radical", root: "女", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "いねへん・のぎへん", en: "inehen-left-radical", root: "禾", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ぎょうにんべん", en: "giょuni-left-radical", root: "彳", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ひへん・にちへん", en: "fire-radical", root: "日", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "けものへん", en: "animal-radical", root: "犬", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "いしへん", en: "stone-radical", root: "石", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "かいへん", en: "shell-radical", root: "貝", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "とりへん", en: "bird-radical", root: "酉", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "しめすへん・ねへん", en: "shimesuhe-left-radical", root: "示", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "たまへん・ぎょくへん・おうへん", en: "tamahen-left-radical", root: "玉", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "あしへん", en: "foot-radical", root: "足", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "くるまへん", en: "vehicle-radical", root: "車", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "しょくへん", en: "shiょkuhe-left-radical", root: "食", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "こめへん", en: "komehen-left-radical", root: "米", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ころもへん", en: "clothing-radical", root: "衣", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "めへん", en: "eye-radical", root: "目", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "うまへん", en: "horse-radical", root: "馬", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ゆみへん", en: "bow-radical", root: "弓", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ふねへん", en: "funehen-left-radical", root: "舟", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "にすい", en: "nisui-bottom-radical", root: "冫", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "やまへん", en: "mountain-radical", root: "山", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "かたへん・ほうへん", en: "katahen-left-radical", root: "方", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "かばねへん・がつへん・いちたへん", en: "kabanehe-left-radical", root: "歹", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "うしへん", en: "cow-radical", root: "牛", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "はばへん・きんへん・きんべん", en: "habahen-left-radical", root: "巾", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "むしへん", en: "insect-radical", root: "虫", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "こへん・こどもへん", en: "kohen・-left-radical", root: "子", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "たへん", en: "tahen-left-radical", root: "田", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "や・やへん", en: "ya-independent-radical", root: "矢", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "からい", en: "karai-independent-radical", root: "辛", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "じゅう", en: "juu-radical", root: "十", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "よう", en: "you-left-radical", root: "幺", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "つきへん", en: "tsukihen-left-radical", root: "月", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "すきへん・らいすき", en: "sukihen-left-radical", root: "耒", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "みみへん", en: "mimihen-left-radical", root: "耳", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "つのへん・かくへん", en: "tsunohen-left-radical", root: "角", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ほねへん", en: "honehen-left-radical", root: "骨", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "うおへん・さかなへん", en: "uohen-left-radical", root: "魚", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ちから", en: "chikara-radical", root: "力", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ゆうべ・ゆう・た", en: "yuube・-independent-radical", root: "夕", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "こう・たくみ・たくみへん・え", en: "kou・ta-left-radical", root: "工", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "と・とびらのと", en: "to・tobi-independent-radical", root: "戶", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "た", en: "ta-radical", root: "田", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ひきへん", en: "hikihen-left-radical", root: "疋", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "しろへん", en: "shirohen-left-radical", root: "白", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "いね・のぎ", en: "ine・no-bottom-radical", root: "禾", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "たつへん", en: "tatsuhen-left-radical", root: "立", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "ほとぎへん・かん", en: "hotogihe-left-radical", root: "缶", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "しこうして・しかして", en: "shikoushi-left-radical", root: "而", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "しん", en: "shin-independent-radical", root: "臣", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "いたるへん", en: "itaruhe-left-radical", root: "至", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "した", en: "shita-independent-radical", root: "舌", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "むじなへん", en: "mujinahe-left-radical", root: "豸", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "あかへん", en: "akahen-left-radical", root: "赤", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "のごめへん", en: "nogomehe-left-radical", root: "釆", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "さとへん", en: "satohen-left-radical", root: "里", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "あお", en: "ao-independent-radical", root: "靑", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "かわへん", en: "kawahen-left-radical", root: "革", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "おとへん", en: "otohen-left-radical", root: "音", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "くろへん", en: "kurohen-wrapping-radical", root: "黑", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },
  { jp: "はへん", en: "hahen-left-radical", root: "齒", type: "left-radical", typeJa: "偏", anchor: "radical#left-radical" },

  // つくり（右側）- Right Radicals
  { jp: "りっとう", en: "riっtou-right-radical", root: "刀", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "おおがい・いちのかい", en: "oogai-right-radical", root: "頁", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ぼくづくり・のぶん・しぶん・とまた", en: "bokuzuku-right-radical", root: "攴", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ちから", en: "chikara-radical", root: "力", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "おおざと", en: "village-radical", root: "邑", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "あくび・かける・けんづくり", en: "akubi・-right-radical", root: "欠", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ほこ・ほこづくり・るまた", en: "hoko-independent-radical", root: "殳", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ふるとり", en: "short-tailed-bird-radical", root: "隹", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ふしづくり・まげわりふ・わりふ", en: "fushizuku-bottom-radical", root: "卩", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "さんづくり・かみかざり", en: "sanzuku-right-radical", root: "彡", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "すん", en: "sun-independent-radical", root: "寸", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "みる", en: "miru-independent-radical", root: "見", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "おつ・おつにょう・つりばり", en: "otsu・o-independent-radical", root: "乙", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "おの・おのづくり・きん", en: "ono・o-right-radical", root: "斤", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "つき", en: "tsuki-radical", root: "月", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "いぬ", en: "inu-independent-radical", root: "犬", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "とり", en: "tori-independent-radical", root: "鳥", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "かたな", en: "katana-independent-radical", root: "刀", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ひ・さじ・さじのひ", en: "fire-standalone-radical", root: "匕", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "また", en: "mata-independent-radical", root: "又", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "はば", en: "haba-independent-radical", root: "巾", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ほこづくり・たすき・かのほこ", en: "hokozuku-right-radical", root: "戈", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "と・ます・とます", en: "to・masu-independent-radical", root: "斗", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ひと", en: "hito-radical", root: "人", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "じゅう", en: "juu-radical", root: "十", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "くち", en: "kuchi-radical", root: "口", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "さむらい", en: "samurai-independent-radical", root: "士", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "まげあし・だいのまげあし", en: "mageashi-right-radical", root: "尢", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "かわ・まがりがわ・まげかわ・さんぽがわ", en: "kawa・ma-independent-radical", root: "巛", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ほす・かん・いちじゅう", en: "hosu・ka-independent-radical", root: "干", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "こころ", en: "kokoro-radical", root: "心", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ぶん・ぶんにょう・ふみづくり", en: "bun-independent-radical", root: "文", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "なし・ぶ・すでのつくり", en: "nashi・bu-right-radical", root: "无", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "うり", en: "uri-right-radical", root: "瓜", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "かわら", en: "kawara-independent-radical", root: "瓦", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "た", en: "ta-radical", root: "田", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ひき", en: "hiki-right-radical", root: "疋", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "め", en: "me-radical", root: "目", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "いと", en: "ito-independent-radical", root: "糸", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "ひつじ", en: "hitsuji-independent-radical", root: "羊", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "うす", en: "usu-independent-radical", root: "臼", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "いろ", en: "iro-independent-radical", root: "色", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "とら", en: "tora-right-radical", root: "虍", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "むし", en: "mushi-independent-radical", root: "虫", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "いのこ", en: "inoko-bottom-radical", root: "豕", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "くるま", en: "kuruma-independent-radical", root: "車", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "からい", en: "karai-independent-radical", root: "辛", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "さけのとり・ひよみのとり・こよみのとり・さけつくり", en: "sakenoto-right-radical", root: "酉", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "れいづくり", en: "reizuku-right-radical", root: "隶", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "なめしがわ", en: "nameshiga-right-radical", root: "韋", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "うま", en: "uma-independent-radical", root: "馬", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "おに", en: "oni-independent-radical", root: "鬼", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },
  { jp: "はね", en: "hane-radical", root: "羽", type: "right-radical", typeJa: "旁", anchor: "radical#right-radical" },

  // かんむり（上部）- Top Radicals
  { jp: "くさかんむり", en: "grass-radical", root: "艸", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "うかんむり", en: "roof-radical", root: "宀", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "たけかんむり", en: "bamboo-radical", root: "竹", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "あめかんむり・あまかんむり", en: "amekan-top-radical", root: "雨", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "にち", en: "nichi-independent-radical", root: "日", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "くち", en: "kuchi-radical", root: "口", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "あなかんむり", en: "cave-radical", root: "穴", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "いち", en: "ichi-radical", root: "一", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "あみがしら・よんがしら・あみめ", en: "amigashi-top-radical", root: "网", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "ひとがしら・ひとやね", en: "hitogashi-top-radical", root: "人", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "だいがしら・だいかんむり", en: "daigashi-top-radical", root: "大", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "やまかんむり", en: "yamakan-top-radical", root: "山", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "なべぶた・けさんかんむり・けいさんかんむり", en: "nabebuta-top-radical", root: "亠", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "た", en: "ta-radical", root: "田", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "ひつじ", en: "hitsuji-independent-radical", root: "羊", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "とらがしら・とらかんむり", en: "toragashi-hanging-radical", root: "虍", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "とかんむり・とだれ", en: "tokanmu-top-radical", root: "戶", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "の・はらいぼう", en: "no・hara-top-radical", root: "丿", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "わかんむり・ひらかんむり・べきかんむり", en: "wakanmu-top-radical", root: "冖", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "さむらいかんむり", en: "samurai-top-radical", root: "士", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "つめかんむり・つめがしら・のつかんむり", en: "tsumekan-top-radical", root: "爪", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "たつ", en: "tatsu-independent-radical", root: "立", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "にし・おおいかんむり", en: "nishi-independent-radical", root: "襾", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "はね", en: "hane-radical", root: "羽", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "き", en: "ki-independent-radical", root: "木", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "とめる", en: "tomeru-independent-radical", root: "止", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "ひ", en: "fire-standalone-radical", root: "火", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "はつがしら", en: "departure-radical", root: "癶", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "おいがしら・おいかんむり", en: "oigashi-top-radical", root: "老", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "ふるとり", en: "short-tailed-bird-radical", root: "隹", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "てん", en: "ten-bottom-radical", root: "丶", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "いりがしら・いりやね", en: "irigashi-top-radical", root: "入", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "はちがしら", en: "hachigashi-top-radical", root: "八", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "はち・はちがしら・は", en: "hachi・ha-top-radical", root: "八", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "かんにょう・うけばこ・したばこ", en: "kanniょ-enclosing-radical", root: "凵", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "じゅう", en: "juu-radical", root: "十", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "ぼく・ぼくのと・うらない・と", en: "boku・bo-top-radical", root: "卜", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "む", en: "mu-bottom-radical", root: "厶", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "ゆうべ・ゆう・た", en: "yuube・-independent-radical", root: "夕", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "しょうがしら・なおがしら", en: "shiょuga-top-radical", root: "小", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "かわ・まがりがわ・まげかわ・さんぽがわ", en: "kawa・ma-independent-radical", root: "巛", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "いとがしら・よう", en: "itogashi-independent-radical", root: "幺", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "けいがしら・いのこがしら", en: "keigashi-top-radical", root: "彐", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "ひらび・いわく", en: "hirabi・-bottom-radical", root: "曰", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "げん", en: "gen-independent-radical", root: "玄", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "たま", en: "tama-independent-radical", root: "玉", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "あまい・かん", en: "amai・-independent-radical", root: "甘", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "しろ", en: "shiro-independent-radical", root: "白", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "みみ", en: "mimi-radical", root: "耳", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "ふでづくり", en: "fudezuku-top-radical", root: "聿", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "みずから", en: "mizukara-independent-radical", root: "自", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "ち", en: "chi-independent-radical", root: "血", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "ことば・ゲン", en: "kotoba・-independent-radical", root: "言", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "しんのたつ", en: "shinnota-bottom-radical", root: "辰", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },
  { jp: "かみがしら・かみかんむり", en: "kamigashi-top-radical", root: "髟", type: "top-radical", typeJa: "冠", anchor: "radical#top-radical" },

  // あし（下部）- Bottom Radicals
  { jp: "こころ", en: "kokoro-radical", root: "心", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "くち", en: "kuchi-radical", root: "口", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "かい・こがい", en: "kai・ko-independent-radical", root: "貝", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "き", en: "ki-independent-radical", root: "木", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "つち", en: "tsuchi-independent-radical", root: "土", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "れんが・れっか", en: "renga・-bottom-radical", root: "火", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "ころも", en: "koromo-independent-radical", root: "衣", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "にくづき", en: "flesh-radical", root: "肉", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "ひとあし", en: "legs-radical", root: "儿", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "はば", en: "haba-independent-radical", root: "巾", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "にち", en: "nichi-independent-radical", root: "日", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "ちから", en: "chikara-radical", root: "力", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "だい", en: "dai-radical", root: "大", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "さら", en: "dish-radical", root: "皿", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "め", en: "me-radical", root: "目", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "おんな", en: "onna-radical", root: "女", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "て", en: "te-independent-radical", root: "手", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "ひらび・いわく", en: "hirabi・-bottom-radical", root: "曰", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "じゅう", en: "juu-radical", root: "十", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "た", en: "ta-radical", root: "田", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "いと", en: "ito-independent-radical", root: "糸", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "いち", en: "ichi-radical", root: "一", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "はち・は", en: "hachi・ha-independent-radical", root: "八", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "また", en: "mata-independent-radical", root: "又", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "こ・こども", en: "ko・kodo-independent-radical", root: "子", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "すん", en: "sun-independent-radical", root: "寸", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "に", en: "ni-radical", root: "二", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "したみず・みず", en: "shitamizu-bottom-radical", root: "水", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "むし", en: "mushi-independent-radical", root: "虫", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "てん", en: "ten-bottom-radical", root: "丶", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "やま", en: "yama-radical", root: "山", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "こまぬき・にじゅうあし", en: "komanuki-bottom-radical", root: "廾", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "とめる", en: "tomeru-independent-radical", root: "止", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "ひ", en: "fire-standalone-radical", root: "火", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "しめす", en: "shimesu-independent-radical", root: "示", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "ことば・ゲン", en: "kotoba・-independent-radical", root: "言", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "くるま", en: "kuruma-independent-radical", root: "車", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "はねぼう・かぎ", en: "hanebou-independent-radical", root: "亅", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "かたな", en: "katana-independent-radical", root: "刀", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "ふしづくり・まげわりふ・わりふ", en: "fushizuku-bottom-radical", root: "卩", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "こう・たくみ・え", en: "kou・ta-independent-radical", root: "工", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "ほす・かん・いちじゅう", en: "hosu・ka-independent-radical", root: "干", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "なかれ・ははのかん", en: "nakare・-independent-radical", root: "毋", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "たま", en: "tama-independent-radical", root: "玉", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "しろ", en: "shiro-independent-radical", root: "白", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "いし", en: "ishi-independent-radical", root: "石", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "みみ", en: "mimi-radical", root: "耳", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "みる", en: "miru-independent-radical", root: "見", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "いのこ", en: "inoko-bottom-radical", root: "豕", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "さと", en: "sato-independent-radical", root: "里", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "しか", en: "shika-independent-radical", root: "鹿", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "おつ・おつにょう・つりばり", en: "otsu・o-independent-radical", root: "乙", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "いる", en: "iru-independent-radical", root: "入", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "にすい", en: "nisui-bottom-radical", root: "冫", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "む", en: "mu-bottom-radical", root: "厶", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "なつあし", en: "natsuashi-bottom-radical", root: "夊", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "ゆうべ・ゆう・た", en: "yuube・-independent-radical", root: "夕", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "したごころ", en: "heart-bottom-radical", root: "心", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "つき", en: "tsuki-radical", root: "月", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "うじ", en: "uji-independent-radical", root: "氏", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "いきる・うまれる・せい・しょう", en: "ikiru・-independent-radical", root: "生", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "いね・のぎ", en: "ine・no-bottom-radical", root: "禾", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "にく", en: "niku-independent-radical", root: "肉", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "いたる", en: "itaru-independent-radical", root: "至", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "した", en: "shita-independent-radical", root: "舌", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "ます・まいあし", en: "masu・ma-bottom-radical", root: "舛", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "こんづくり・ごんづくり・ごん・ねづくり", en: "konzuku-bottom-radical", root: "艮", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "まめ", en: "mame-independent-radical", root: "豆", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "しんのたつ", en: "shinnota-bottom-radical", root: "辰", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "かね", en: "kane-independent-radical", root: "金", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "ふるとり", en: "short-tailed-bird-radical", root: "隹", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "おと", en: "oto-independent-radical", root: "音", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "しょく", en: "shiょku-independent-radical", root: "食", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "うま", en: "uma-independent-radical", root: "馬", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "おに", en: "oni-independent-radical", root: "鬼", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "くろ", en: "kuro-independent-radical", root: "黑", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "はね", en: "hane-radical", root: "羽", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },
  { jp: "てつ・めばえ", en: "tetsu・me-bottom-radical", root: "屮", type: "bottom-radical", typeJa: "脚", anchor: "radical#bottom-radical" },

  // たれ（垂れ）- Hanging Radicals
  { jp: "まだれ", en: "dotted-cliff-radical", root: "广", type: "hanging-radical", typeJa: "垂", anchor: "radical#hanging-radical" },
  { jp: "やまいだれ", en: "sickness-radical", root: "疒", type: "hanging-radical", typeJa: "垂", anchor: "radical#hanging-radical" },
  { jp: "しかばね・しかばねかんむり・かばねだれ・かばね", en: "shikabane-hanging-radical", root: "尸", type: "hanging-radical", typeJa: "垂", anchor: "radical#hanging-radical" },
  { jp: "がんだれ", en: "cliff-radical", root: "厂", type: "hanging-radical", typeJa: "垂", anchor: "radical#hanging-radical" },
  { jp: "とらがしら・とらかんむり", en: "toragashi-hanging-radical", root: "虍", type: "hanging-radical", typeJa: "垂", anchor: "radical#hanging-radical" },

  // にょう（繞）- Wrapping Radicals
  { jp: "そうにょう", en: "run-radical", root: "走", type: "wrapping-radical", typeJa: "繞", anchor: "radical#wrapping-radical" },
  { jp: "えんにょう・えんにゅう・いんにょう", en: "enniょ-wrapping-radical", root: "廴", type: "wrapping-radical", typeJa: "繞", anchor: "radical#wrapping-radical" },
  { jp: "おに・きにょう", en: "oni-independent-radical", root: "鬼", type: "wrapping-radical", typeJa: "繞", anchor: "radical#wrapping-radical" },
  { jp: "むぎ・ばくにょう", en: "mugi-independent-radical", root: "麥", type: "wrapping-radical", typeJa: "繞", anchor: "radical#wrapping-radical" },
  { jp: "くろへん", en: "kurohen-wrapping-radical", root: "黑", type: "wrapping-radical", typeJa: "繞", anchor: "radical#wrapping-radical" },

  // かまえ（構）- Enclosing Radicals
  { jp: "くにがまえ", en: "country-radical", root: "囗", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "もんがまえ・かどがまえ", en: "mongama-enclosing-radical", root: "門", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "ほこがまえ・たすき・かのほこ", en: "hokogama-enclosing-radical", root: "戈", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "ぎょうがまえ・ゆきがまえ", en: "giょuga-enclosing-radical", root: "行", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "かくしがまえ", en: "kakushiga-enclosing-radical", root: "匸", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "けいがまえ・まきがまえ・どうがまえ・えんがまえ", en: "keigama-enclosing-radical", root: "冂", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "かんにょう・うけばこ・したばこ", en: "kanniょ-enclosing-radical", root: "凵", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "つつみがまえ", en: "wrap-radical", root: "勹", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "つくえ・かぜかんむり・かぜがまえ", en: "tsukue・-enclosing-radical", root: "几", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "はこがまえ", en: "box-radical", root: "匚", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "こう・たくみ・え", en: "kou・ta-independent-radical", root: "工", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "しきがまえ・よく", en: "shikigama-enclosing-radical", root: "弋", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "きがまえ", en: "kigamae-enclosing-radical", root: "气", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },
  { jp: "うす", en: "usu-independent-radical", root: "臼", type: "enclosing-radical", typeJa: "構", anchor: "radical#enclosing-radical" },

  // その他 - Independent Radicals (複数位置に出現、または独立して使われる部首)
  { jp: "くち", en: "kuchi-radical", root: "口", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ゆみ", en: "yumi-independent-radical", root: "弓", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "た", en: "ta-radical", root: "田", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "つち", en: "tsuchi-independent-radical", root: "土", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "いと", en: "ito-independent-radical", root: "糸", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ぼう・たてぼう", en: "bou・ta-independent-radical", root: "丨", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "おつ・おつにょう・つりばり", en: "otsu・o-independent-radical", root: "乙", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ひと", en: "hito-radical", root: "人", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "いる", en: "iru-independent-radical", root: "入", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "かたな", en: "katana-independent-radical", root: "刀", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ゆうべ・ゆう・た", en: "yuube・-independent-radical", root: "夕", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "だい", en: "dai-radical", root: "大", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "すん", en: "sun-independent-radical", root: "寸", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "しょう", en: "shiょu-independent-radical", root: "小", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "かわ・まがりがわ・まげかわ・さんぽがわ", en: "kawa・ma-independent-radical", root: "巛", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ほす・かん・いちじゅう", en: "hosu・ka-independent-radical", root: "干", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "こころ", en: "kokoro-radical", root: "心", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "て", en: "te-independent-radical", root: "手", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "おの・きん", en: "ono・ki-independent-radical", root: "斤", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "つき", en: "tsuki-radical", root: "月", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "き", en: "ki-independent-radical", root: "木", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "みず", en: "mizu-radical", root: "水", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "たま", en: "tama-independent-radical", root: "玉", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "うす", en: "usu-independent-radical", root: "臼", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ことば・ゲン", en: "kotoba・-independent-radical", root: "言", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "せい", en: "sei-independent-radical", root: "齊", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "いち", en: "ichi-radical", root: "一", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "はねぼう・かぎ", en: "hanebou-independent-radical", root: "亅", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "に", en: "ni-radical", root: "二", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "はち・は", en: "hachi・ha-independent-radical", root: "八", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ちから", en: "chikara-radical", root: "力", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "じゅう", en: "juu-radical", root: "十", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "また", en: "mata-independent-radical", root: "又", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "さむらい", en: "samurai-independent-radical", root: "士", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "おんな", en: "onna-radical", root: "女", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "こ・こども", en: "ko・kodo-independent-radical", root: "子", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "やま", en: "yama-radical", root: "山", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "こう・たくみ・え", en: "kou・ta-independent-radical", root: "工", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "おのれ", en: "onore-independent-radical", root: "己", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "はば", en: "haba-independent-radical", root: "巾", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "いとがしら・よう", en: "itogashi-independent-radical", root: "幺", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "と・とびらのと", en: "to・tobi-independent-radical", root: "戶", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "し・じゅうまた", en: "shi・jiゅ-independent-radical", root: "支", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ぶん", en: "bun-independent-radical", root: "文", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ほう", en: "hou-independent-radical", root: "方", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "にち", en: "nichi-independent-radical", root: "日", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "とめる", en: "tomeru-independent-radical", root: "止", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "なかれ・ははのかん", en: "nakare・-independent-radical", root: "毋", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ならびひ・くらべる", en: "narabihi-independent-radical", root: "比", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "け", en: "ke-independent-radical", root: "毛", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "うじ", en: "uji-independent-radical", root: "氏", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ひ", en: "fire-standalone-radical", root: "火", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "つめ", en: "tsume-independent-radical", root: "爪", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ちち", en: "chichi-independent-radical", root: "父", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "かた", en: "kata-independent-radical", root: "片", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "きば", en: "kiba-independent-radical", root: "牙", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "うし", en: "ushi-independent-radical", root: "牛", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "いぬ", en: "inu-independent-radical", root: "犬", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "げん", en: "gen-independent-radical", root: "玄", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "かわら", en: "kawara-independent-radical", root: "瓦", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "あまい・かん", en: "amai・-independent-radical", root: "甘", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "いきる・うまれる・せい・しょう", en: "ikiru・-independent-radical", root: "生", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "もちいる・よう", en: "mochiiru-independent-radical", root: "用", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "しろ", en: "shiro-independent-radical", root: "白", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "けがわ・ひのかわ", en: "kegawa・-independent-radical", root: "皮", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "さら", en: "dish-radical", root: "皿", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "め", en: "me-radical", root: "目", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ほこ", en: "hoko-independent-radical", root: "矛", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "や", en: "ya-independent-radical", root: "矢", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "いし", en: "ishi-independent-radical", root: "石", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "しめす", en: "shimesu-independent-radical", root: "示", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "あな", en: "ana-independent-radical", root: "穴", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "たつ", en: "tatsu-independent-radical", root: "立", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "たけ", en: "take-independent-radical", root: "竹", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "こめ", en: "kome-independent-radical", root: "米", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ほとぎ・かん", en: "hotogi・-independent-radical", root: "缶", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ひつじ", en: "hitsuji-independent-radical", root: "羊", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "おい", en: "oi-independent-radical", root: "老", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "みみ", en: "mimi-radical", root: "耳", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "にく", en: "niku-independent-radical", root: "肉", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "にくづき", en: "flesh-radical", root: "肉", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "しん", en: "shin-independent-radical", root: "臣", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "みずから", en: "mizukara-independent-radical", root: "自", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "いたる", en: "itaru-independent-radical", root: "至", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "した", en: "shita-independent-radical", root: "舌", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ふね", en: "fune-independent-radical", root: "舟", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "いろ", en: "iro-independent-radical", root: "色", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "むし", en: "mushi-independent-radical", root: "虫", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ち", en: "chi-independent-radical", root: "血", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ぎょう", en: "giょu-independent-radical", root: "行", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ころも", en: "koromo-independent-radical", root: "衣", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "にし", en: "nishi-independent-radical", root: "襾", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "みる", en: "miru-independent-radical", root: "見", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "つの", en: "tsuno-independent-radical", root: "角", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "たに", en: "tani-independent-radical", root: "谷", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "まめ", en: "mame-independent-radical", root: "豆", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "かい・こがい", en: "kai・ko-independent-radical", root: "貝", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "あか", en: "aka-independent-radical", root: "赤", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "はしる", en: "hashiru-independent-radical", root: "走", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "あし", en: "ashi-independent-radical", root: "足", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "み", en: "mi-independent-radical", root: "身", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "くるま", en: "kuruma-independent-radical", root: "車", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "からい", en: "karai-independent-radical", root: "辛", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "のごめ", en: "nogome-independent-radical", root: "釆", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "さと", en: "sato-independent-radical", root: "里", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "かね", en: "kane-independent-radical", root: "金", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ながい", en: "nagai-independent-radical", root: "長", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "こざと・おか", en: "kozato・-independent-radical", root: "阜", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "あめ", en: "ame-independent-radical", root: "雨", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "あお", en: "ao-independent-radical", root: "靑", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "あらず", en: "arazu-independent-radical", root: "非", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "めん", en: "men-independent-radical", root: "面", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "つくりがわ・かくのかわ", en: "tsukuriga-independent-radical", root: "革", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "おと", en: "oto-independent-radical", root: "音", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "かぜ", en: "kaze-independent-radical", root: "風", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "とぶ", en: "tobu-independent-radical", root: "飛", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "しょく", en: "shiょku-independent-radical", root: "食", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "くび", en: "kubi-independent-radical", root: "首", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "かおり", en: "kaori-independent-radical", root: "香", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "うま", en: "uma-independent-radical", root: "馬", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ほね", en: "hone-independent-radical", root: "骨", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "たかい", en: "takai-independent-radical", root: "高", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ちょう・においざけ", en: "chiょu・-independent-radical", root: "鬯", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "おに", en: "oni-independent-radical", root: "鬼", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "うお", en: "uo-independent-radical", root: "魚", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "とり", en: "tori-independent-radical", root: "鳥", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "ろ・しお", en: "ro・shio-independent-radical", root: "鹵", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "しか", en: "shika-independent-radical", root: "鹿", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "むぎ", en: "mugi-independent-radical", root: "麥", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "あさ", en: "asa-independent-radical", root: "麻", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "くろ", en: "kuro-independent-radical", root: "黑", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "つづみ", en: "tsuzumi-independent-radical", root: "鼓", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "はな", en: "hana-independent-radical", root: "鼻", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "は", en: "ha-independent-radical", root: "齒", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "りゅう", en: "riゅu-independent-radical", root: "龍", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "かめ", en: "kame-independent-radical", root: "龜", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },
  { jp: "はね", en: "hane-radical", root: "羽", type: "independent-radical", typeJa: "他", anchor: "radical#independent-radical" },

];

export default radicalList;
