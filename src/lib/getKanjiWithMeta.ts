/**
 * 既存漢字データにメタデータをマージするユーティリティ
 */

import fs from "fs";
import path from "path";
import { extraKanjiMeta, type KanjiExtraMeta } from "../../data/kanjiExtra";

export interface KanjiDetail {
  kanji: string;
  on: string[];
  kun: string[];
  meaning: string[];
  jlpt: string | null;
  strokes: number;
  grade: number;
  ucsHex: string;
  freq?: number;
  radicals?: string[];
  // 表外漢字メタデータ
  isExtra?: boolean;
  isRare?: boolean;
  isName?: boolean;
  isClassical?: boolean;
  rarityScore?: number;
  hasStrokeData?: boolean;
}

/**
 * 既存のkanji-dictionary.jsonを読み込み
 */
function loadKanjiDictionary(): KanjiDetail[] {
  const dictPath = path.join(process.cwd(), "data", "kanji-dictionary.json");
  if (!fs.existsSync(dictPath)) return [];
  return JSON.parse(fs.readFileSync(dictPath, "utf-8"));
}

/**
 * Unicodeコードポイントから漢字文字を取得
 */
function unicodeToChar(unicode: string): string {
  const hex = unicode.replace(/^[uU]/, "");
  const codePoint = parseInt(hex, 16);
  if (isNaN(codePoint)) return "";
  return String.fromCodePoint(codePoint);
}

/**
 * 漢字文字からUnicode ID (uXXXX) を生成（大文字）
 */
function kanjiToUnicodeId(kanji: string): string {
  const codePoint = kanji.codePointAt(0);
  if (!codePoint) return "";
  return `u${codePoint.toString(16).toUpperCase()}`;
}

/**
 * ucsHexを正規化（5桁 → uXXXX形式に変換）
 */
function normalizeUcsHex(ucsHex: string): string {
  // 5桁の場合は4桁に変換（先頭の0を除去）
  if (ucsHex.length === 5 && ucsHex.startsWith("0")) {
    return `u${ucsHex.slice(1).toUpperCase()}`;
  }
  return `u${ucsHex.toUpperCase()}`;
}

/**
 * 既存の漢字データにメタデータをマージ
 */
export function getKanjiWithMeta(): KanjiDetail[] {
  const dictionary = loadKanjiDictionary();
  
  // メタデータのマップを作成（Unicode IDをキーに）
  const metaMap = new Map<string, KanjiExtraMeta>();
  extraKanjiMeta.forEach((meta) => {
    metaMap.set(meta.unicode.toUpperCase(), meta);
  });

  // 既存データにメタデータをマージ
  const merged: KanjiDetail[] = dictionary.map((kanji) => {
    // ucsHexを正規化してメタデータと照合
    const normalizedUcsHex = normalizeUcsHex(kanji.ucsHex);
    const meta = metaMap.get(normalizedUcsHex);

    if (meta) {
      return {
        ...kanji,
        isExtra: meta.isExtra,
        isName: meta.isName,
        isClassical: meta.isClassical,
        rarityScore: meta.rarityScore || 0,
        isRare: meta.isExtra && (meta.rarityScore || 0) >= 70,
      };
    }

    // メタデータがない場合はデフォルト値
    return {
      ...kanji,
      isExtra: false,
      isName: false,
      isClassical: false,
      rarityScore: 0,
      isRare: false,
    };
  });

  // 表外漢字メタデータにのみ存在する漢字を追加
  extraKanjiMeta.forEach((meta) => {
    const exists = merged.some((k) => {
      const normalized = normalizeUcsHex(k.ucsHex);
      return normalized === meta.unicode.toUpperCase();
    });

    if (!exists) {
      // メタデータのみで存在する漢字を追加
      const kanji = unicodeToChar(meta.unicode);
      if (kanji) {
        // 基本的な情報のみでエントリを作成
        // kanji-details/[漢字].json があれば詳細情報を読み込む
        const detailPath = path.join(
          process.cwd(),
          "data",
          "kanji-details",
          `${kanji}.json`
        );
        
        let detailData: Partial<KanjiDetail> = {};
        if (fs.existsSync(detailPath)) {
          detailData = JSON.parse(fs.readFileSync(detailPath, "utf-8"));
        }

        const newEntry: KanjiDetail = {
          kanji,
          on: detailData.on || [],
          kun: detailData.kun || [],
          meaning: detailData.meaning || [],
          jlpt: detailData.jlpt || null,
          strokes: detailData.strokes || 0,
          grade: 0, // 表外漢字は学年なし
          ucsHex: meta.unicode.slice(1).toUpperCase().padStart(5, "0"), // 5桁形式に
          freq: detailData.freq,
          radicals: detailData.radicals || [],
          isExtra: meta.isExtra ?? true,
          isName: meta.isName ?? false,
          isClassical: meta.isClassical ?? false,
          rarityScore: meta.rarityScore || 0,
          isRare: (meta.isExtra ?? true) && (meta.rarityScore || 0) >= 70,
        };

        merged.push(newEntry);
      }
    }
  });

  return merged;
}

/**
 * 分類別にフィルタリング
 */
export function filterKanjiByCategory(
  kanjiList: KanjiDetail[],
  filter: {
    isExtra?: boolean;
    isRare?: boolean;
    isName?: boolean;
    isClassical?: boolean;
    minRarityScore?: number;
  }
): KanjiDetail[] {
  return kanjiList.filter((k) => {
    if (filter.isExtra !== undefined && k.isExtra !== filter.isExtra) {
      return false;
    }
    if (filter.isRare !== undefined && k.isRare !== filter.isRare) {
      return false;
    }
    if (filter.isName !== undefined && k.isName !== filter.isName) {
      return false;
    }
    if (filter.isClassical !== undefined && k.isClassical !== filter.isClassical) {
      return false;
    }
    if (filter.minRarityScore !== undefined && (k.rarityScore || 0) < filter.minRarityScore) {
      return false;
    }
    return true;
  });
}
