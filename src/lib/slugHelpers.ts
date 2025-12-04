/**
 * 漢字 ↔ Unicode スラッグ変換ユーティリティ
 * 
 * URL形式: /kanji/uXXXX (例: /kanji/u5C71 = 山)
 */

/**
 * 漢字をUnicodeスラッグに変換
 * 例: "山" → "u5C71"
 */
export function toUnicodeSlug(kanji: string): string {
  if (!kanji || kanji.length === 0) return "";
  const char = kanji.charAt(0);
  const codePoint = char.codePointAt(0);
  if (codePoint === undefined) return "";
  return `u${codePoint.toString(16).toUpperCase()}`;
}

/**
 * Unicodeスラッグを漢字に変換
 * 例: "u5C71" → "山"
 */
export function fromUnicodeSlug(slug: string): string | null {
  // uXXXX 形式かチェック
  if (!slug || !slug.match(/^u[0-9A-Fa-f]{4,5}$/)) {
    return null;
  }
  const hex = slug.slice(1); // "u" を除去
  const codePoint = parseInt(hex, 16);
  if (isNaN(codePoint)) return null;
  return String.fromCodePoint(codePoint);
}

/**
 * スラッグが Unicode 形式かどうかを判定
 * 例: "u5C71" → true, "山" → false
 */
export function isUnicodeSlug(slug: string): boolean {
  return /^u[0-9A-Fa-f]{4,5}$/.test(slug);
}

/**
 * 漢字かどうかを判定（CJK統合漢字の範囲）
 */
export function isKanji(char: string): boolean {
  if (!char || char.length === 0) return false;
  const code = char.charCodeAt(0);
  return (
    (code >= 0x4E00 && code <= 0x9FFF) ||   // CJK統合漢字
    (code >= 0x3400 && code <= 0x4DBF) ||   // CJK統合漢字拡張A
    (code >= 0x20000 && code <= 0x2A6DF)    // CJK統合漢字拡張B
  );
}

/**
 * 漢字詳細ページのURLを生成
 * 例: "山" → "/kanji/u5C71"
 */
export function getKanjiUrl(kanji: string): string {
  return `/kanji/${toUnicodeSlug(kanji)}`;
}

/**
 * スラッグから漢字を取得（Unicode形式または直接漢字の両方に対応）
 * 例: "u5C71" → "山", "山" → "山"
 */
export function resolveKanjiFromSlug(slug: string): string | null {
  // まずUnicode形式として解析を試みる
  const fromUnicode = fromUnicodeSlug(slug);
  if (fromUnicode) {
    return fromUnicode;
  }
  
  // Unicode形式でなければ、URLデコードして漢字として返す
  try {
    const decoded = decodeURIComponent(slug);
    if (decoded && isKanji(decoded)) {
      return decoded;
    }
  } catch {
    // デコード失敗
  }
  
  return null;
}





