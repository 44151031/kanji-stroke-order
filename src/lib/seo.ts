// ============================================
// SEO ユーティリティ（漢字ページ向け）
// ============================================

/** buildKanjiTitle に渡すデータ */
export interface KanjiSeoData {
  kanji: string;
  on: string[];
  kun: string[];
}

/** buildKanjiDescription に渡すデータ */
export interface KanjiDescData {
  kanji: string;
  on: string[];
  kun: string[];
  strokes: number;
  grade: number;
}

/** タイトル生成モード */
export type TitleMode = "reading" | "kun" | "on";

// ============================================
// normalizeReading
// ============================================
/**
 * 読みから送り仮名マーカー(`.`)と語幹マーカー(`-`)を除去
 * - `"お.きる"` → `"おきる"`
 * - `"ひと-"` → `"ひと"`
 * - `"-つ"` → `"つ"`
 */
export function normalizeReading(reading: string): string {
  return reading.replace(/\./g, "").replace(/^-|-$/g, "");
}

// ============================================
// truncateByWidth
// ============================================
/**
 * 全角=2, 半角=1 の簡易幅計算で文字列をカット。
 * grapheme 単位で安全に切り出す。
 */
export function truncateByWidth(str: string, maxWidth = 64): string {
  // Intl.Segmenter が使えれば grapheme 単位でカット
  const segmenter = new Intl.Segmenter("ja", { granularity: "grapheme" });
  let width = 0;
  let result = "";

  for (const { segment } of segmenter.segment(str)) {
    const cp = segment.codePointAt(0) ?? 0;
    // ASCII 範囲は半角(1)、それ以外は全角(2)
    const w = cp <= 0x7e ? 1 : 2;
    if (width + w > maxWidth) break;
    width += w;
    result += segment;
  }

  return result;
}

// ============================================
// buildKanjiTitle
// ============================================
/**
 * 漢字ページの `<title>` を生成。
 *
 * mode:
 * - `"reading"` (デフォルト): `{K}の読み方（音/訓）｜{kun2}・{on2}｜漢字書き順ナビ`
 * - `"kun"`: `{K}の訓読みは「{kunMain}」｜音：{on2}｜漢字書き順ナビ`
 * - `"on"`:  `{K}の音読みは「{onMain}」｜訓：{kunMain}｜漢字書き順ナビ`
 *
 * フォールバック:
 * - kun=[] → on主語タイトル
 * - on=[] → kun主語タイトル
 * - 両方空 → `{K}の読み方｜漢字書き順ナビ`
 */
export function buildKanjiTitle(
  data: KanjiSeoData,
  mode: TitleMode = "reading"
): string {
  const { kanji, on, kun } = data;
  const site = "漢字書き順ナビ";

  const kunNorm = kun.map(normalizeReading);
  const onNorm = on.map(normalizeReading);

  const hasKun = kunNorm.length > 0;
  const hasOn = onNorm.length > 0;

  let title: string;

  if (!hasKun && !hasOn) {
    // 両方空
    title = `${kanji}の読み方｜${site}`;
  } else if (!hasKun) {
    // 訓読みなし → 音読み主語
    const onMain = onNorm[0];
    title = `${kanji}の音読みは「${onMain}」｜${site}`;
  } else if (!hasOn) {
    // 音読みなし → 訓読み主語
    const kunMain = kunNorm[0];
    title = `${kanji}の訓読みは「${kunMain}」｜${site}`;
  } else {
    // 両方あり
    switch (mode) {
      case "kun": {
        const kunMain = kunNorm[0];
        const on2 = onNorm.slice(0, 2).join("・");
        title = `${kanji}の訓読みは「${kunMain}」｜音：${on2}｜${site}`;
        break;
      }
      case "on": {
        const onMain = onNorm[0];
        const kunMain = kunNorm[0];
        title = `${kanji}の音読みは「${onMain}」｜訓：${kunMain}｜${site}`;
        break;
      }
      default: {
        // "reading" モード — タイトルの読みは代表1つずつに絞る
        const kunFirst = kunNorm[0];
        const onFirst = onNorm[0];
        title = `${kanji}の読み方（音/訓）｜${kunFirst}・${onFirst}｜${site}`;
        break;
      }
    }
  }

  return truncateByWidth(title, 64);
}

// ============================================
// buildKanjiDescription
// ============================================
/**
 * 漢字ページの `<meta name="description">` を生成。
 *
 * 1文目: 読み方（訓読み/音読み）
 * 2文目: 画数・学年
 * 3文目: 書き順解説の案内
 */
export function buildKanjiDescription(data: KanjiDescData): string {
  const { kanji, on, kun, strokes, grade } = data;

  const kunNorm = kun.map(normalizeReading);
  const onNorm = on.map(normalizeReading);

  // 1文目: 読み方
  let sentence1: string;
  if (kunNorm.length > 0 && onNorm.length > 0) {
    sentence1 = `「${kanji}」の訓読みは「${kunNorm.join("・")}」、音読みは「${onNorm.join("・")}」。`;
  } else if (onNorm.length > 0) {
    sentence1 = `「${kanji}」の音読みは「${onNorm.join("・")}」。`;
  } else if (kunNorm.length > 0) {
    sentence1 = `「${kanji}」の訓読みは「${kunNorm.join("・")}」。`;
  } else {
    sentence1 = `「${kanji}」の読み方を解説。`;
  }

  // 2文目: 画数・学年
  const gradeLabel =
    grade >= 1 && grade <= 6
      ? `小学${grade}年で習う漢字`
      : grade > 6
        ? "中学で習う漢字"
        : "";
  const sentence2 = gradeLabel
    ? `${strokes}画、${gradeLabel}。`
    : `${strokes}画。`;

  // 3文目: 書き順解説
  const sentence3 = "書き順（筆順）をSVGアニメーションで解説。";

  return sentence1 + sentence2 + sentence3;
}
