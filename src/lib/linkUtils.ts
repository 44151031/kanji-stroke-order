/**
 * 内部リンクユーティリティ
 * 全リンクを /kanji/uXXXX 形式に統一
 */

import type { KanjiItem } from "@/types/kanji";

/**
 * 漢字文字からUnicode ID (uXXXX形式) を生成
 */
export function kanjiToId(kanji: string): string {
  const codePoint = kanji.codePointAt(0);
  if (!codePoint) return "";
  return `u${codePoint.toString(16).toLowerCase().padStart(4, "0")}`;
}

/**
 * Unicode ID (uXXXX形式) から漢字文字に変換
 */
export function idToKanji(id: string): string {
  if (!id.match(/^u[0-9a-f]{4,5}$/i)) {
    return id; // IDでなければそのまま返す
  }
  const codePoint = parseInt(id.slice(1), 16);
  return String.fromCodePoint(codePoint);
}

/**
 * 漢字から内部リンクURLを生成
 * @param kanji - 漢字文字
 * @returns /kanji/uXXXX 形式のURL
 */
export function getKanjiLink(kanji: string): string {
  const id = kanjiToId(kanji);
  return id ? `/kanji/${id}` : "#";
}

/**
 * 漢字リストから内部リンクを解決
 * @param kanjiList - 漢字データリスト
 * @param kanjiChar - 漢字文字
 * @returns /kanji/uXXXX 形式のURL
 */
export function resolveInternalLink(kanjiList: KanjiItem[], kanjiChar: string): string {
  const found = kanjiList.find((k) => k.kanji === kanjiChar);
  if (found?.id) {
    return `/kanji/${found.id}`;
  }
  // フォールバック: 直接ID生成
  return getKanjiLink(kanjiChar);
}

/**
 * パラメータがID形式かどうかを判定
 */
export function isKanjiId(param: string): boolean {
  return /^u[0-9a-f]{4,5}$/i.test(param);
}

/**
 * パラメータから漢字を解決（ID or 漢字文字両対応）
 */
export function resolveKanji(param: string): string {
  if (isKanjiId(param)) {
    return idToKanji(param);
  }
  return decodeURIComponent(param);
}















