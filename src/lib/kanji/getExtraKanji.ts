/**
 * 表外漢字（常用漢字外の漢字）を抽出
 */

import fs from "fs";
import path from "path";
import { getKanjiWithMeta, type KanjiDetail } from "@/lib/getKanjiWithMeta";

/**
 * 常用漢字セットを取得
 */
function getJoyoKanjiSet(): Set<string> {
  const joyoPath = path.join(process.cwd(), "data", "kanji-joyo.json");
  if (!fs.existsSync(joyoPath)) {
    return new Set();
  }
  
  const joyoList = JSON.parse(fs.readFileSync(joyoPath, "utf-8")) as Array<{
    kanji: string;
  }>;
  
  return new Set(joyoList.map((entry) => entry.kanji));
}

/**
 * 表外漢字を取得
 * 
 * 条件:
 * - 常用漢字リストに含まれない
 * - 画数が1以上（0ではない）
 * 
 * @returns 表外漢字の詳細情報リスト
 */
export function getExtraKanji(): KanjiDetail[] {
  const allKanji = getKanjiWithMeta();
  const joyoSet = getJoyoKanjiSet();

  // 表外漢字をフィルタリング
  const extraKanji = allKanji.filter((k) => {
    // 常用漢字は除外
    if (joyoSet.has(k.kanji)) {
      return false;
    }

    // 画数が0以下の場合は除外
    if (!k.strokes || k.strokes <= 0) {
      return false;
    }

    return true;
  });

  return extraKanji;
}

/**
 * 表外漢字の文字列リストのみを取得
 * 
 * @returns 表外漢字の文字列リスト
 */
export function getExtraKanjiChars(): string[] {
  return getExtraKanji().map((k) => k.kanji);
}
