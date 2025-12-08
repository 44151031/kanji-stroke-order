/**
 * KanjiVGからSVGデータを取得する
 */

const KANJIVG_BASE_URL = "https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji";

/**
 * 文字のUnicodeコードポイントを5桁のゼロパディング形式で取得
 */
export function getCharacterCode(char: string): string {
  const codePoint = char.codePointAt(0);
  if (!codePoint) return "";
  return codePoint.toString(16).padStart(5, "0");
}

/**
 * KanjiVGからSVGを取得
 */
export async function fetchKanjiSvg(character: string): Promise<string | null> {
  try {
    const code = getCharacterCode(character);
    const url = `${KANJIVG_BASE_URL}/${code}.svg`;
    
    const response = await fetch(url);
    if (!response.ok) {
      console.warn(`SVG not found for character: ${character} (${code})`);
      return null;
    }
    
    return await response.text();
  } catch (error) {
    console.error("Failed to fetch KanjiVG SVG:", error);
    return null;
  }
}
















