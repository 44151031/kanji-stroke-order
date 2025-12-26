/**
 * KanjiVG の SVG ファイルが存在するかチェック
 * 書き順データが有効なもののみを判定
 */

import fs from "fs";
import path from "path";
import { getCharacterCode } from "@/lib/kanjivg";

/**
 * 漢字のKanjiVG SVGファイルが存在し、有効かチェック
 * 
 * @param kanji - チェックする漢字文字
 * @param ucsHex - オプション: 既に計算済みのUCS Hexコード（5桁形式）
 * @returns SVGファイルが存在し、有効な場合はtrue
 */
export function hasValidKanjiVG(kanji: string, ucsHex?: string): boolean {
  if (!kanji || kanji.length === 0) {
    return false;
  }

  // ucsHexが提供されていない場合は計算
  const hexCode = ucsHex || getCharacterCode(kanji);
  
  if (!hexCode || hexCode.length === 0) {
    return false;
  }

  // public/kanjivg/ ディレクトリからSVGファイルをチェック
  const svgPath = path.join(process.cwd(), "public", "kanjivg", `${hexCode}.svg`);
  
  if (!fs.existsSync(svgPath)) {
    return false;
  }

  try {
    // SVGファイルを読み込んで内容を確認
    const svgContent = fs.readFileSync(svgPath, "utf-8");
    
    // 空ファイルでないかチェック
    if (!svgContent || svgContent.trim().length === 0) {
      return false;
    }

    // パス（書き順データ）が含まれているかチェック
    // KanjiVGのSVGには必ず<path>要素が含まれる
    if (!svgContent.includes("<path") && !svgContent.includes("<g")) {
      return false;
    }

    return true;
  } catch (error) {
    // ファイル読み込みエラー
    return false;
  }
}

/**
 * 複数の漢字に対して一括でSVG存在チェック
 * 
 * @param kanjiList - チェックする漢字のリスト
 * @returns SVGが存在する漢字のみのリスト
 */
export function filterKanjiWithValidVG(kanjiList: string[]): string[] {
  return kanjiList.filter((kanji) => hasValidKanjiVG(kanji));
}
