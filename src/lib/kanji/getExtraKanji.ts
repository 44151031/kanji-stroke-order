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
 * extra-kanji.jsonから表外漢字データを読み込み
 */
interface ExtraKanjiEntry {
  kanji: string;
  unicode: string;
  category: "rare" | "name" | "classical" | "other";
}

function loadExtraKanjiJson(): ExtraKanjiEntry[] {
  const extraPath = path.join(process.cwd(), "data", "kanji", "extra-kanji.json");
  if (!fs.existsSync(extraPath)) {
    return [];
  }
  
  return JSON.parse(fs.readFileSync(extraPath, "utf-8"));
}

/**
 * Unicode IDからucsHex（5桁形式）に変換
 */
function unicodeToUcsHex(unicode: string): string {
  const hex = unicode.replace(/^[uU]/, "");
  return hex.padStart(5, "0");
}

/**
 * 表外漢字を取得
 * 
 * 条件:
 * - extra-kanji.jsonに定義されている
 * - 常用漢字リストに含まれない
 * - 画数が1以上（0ではない）
 * 
 * @returns 表外漢字の詳細情報リスト
 */
export function getExtraKanji(): KanjiDetail[] {
  const allKanji = getKanjiWithMeta();
  const joyoSet = getJoyoKanjiSet();
  const extraKanjiJson = loadExtraKanjiJson();
  
  // extra-kanji.jsonに定義されている漢字のセット
  const extraKanjiSet = new Set(extraKanjiJson.map((e) => e.kanji));
  
  // カテゴリマップを作成
  const categoryMap = new Map<string, "rare" | "name" | "classical" | "other">();
  extraKanjiJson.forEach((e) => {
    categoryMap.set(e.kanji, e.category);
  });

  // 表外漢字をフィルタリング
  const extraKanji = allKanji.filter((k) => {
    // extra-kanji.jsonに定義されているか、または既存のisExtraフラグがtrue
    if (!extraKanjiSet.has(k.kanji) && !k.isExtra) {
      return false;
    }

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
  
  // extra-kanji.jsonにのみ存在する漢字を追加
  for (const entry of extraKanjiJson) {
    const exists = extraKanji.some((k) => k.kanji === entry.kanji);
    if (!exists) {
      // 基本的な情報でエントリを作成
      // kanji-details/[漢字].json があれば詳細情報を読み込む
      const detailPath = path.join(
        process.cwd(),
        "data",
        "kanji-details",
        `${entry.kanji}.json`
      );
      
      let detailData: Partial<KanjiDetail> = {};
      if (fs.existsSync(detailPath)) {
        detailData = JSON.parse(fs.readFileSync(detailPath, "utf-8"));
      }
      
      // SVGファイルの存在確認
      const ucsHex = unicodeToUcsHex(entry.unicode);
      const svgPath = path.join(process.cwd(), "public", "kanjivg", `${ucsHex}.svg`);
      const hasStrokeData = fs.existsSync(svgPath);
      
      const newEntry: KanjiDetail = {
        kanji: entry.kanji,
        on: detailData.on || [],
        kun: detailData.kun || [],
        meaning: detailData.meaning || [],
        jlpt: detailData.jlpt || null,
        strokes: detailData.strokes || 0,
        grade: 0, // 表外漢字は学年なし
        ucsHex: ucsHex,
        freq: detailData.freq,
        radicals: detailData.radicals || [],
        isExtra: true,
        isName: entry.category === "name",
        isClassical: entry.category === "classical",
        isRare: entry.category === "rare",
        rarityScore: entry.category === "rare" ? 75 : undefined,
        hasStrokeData,
      };
      
      extraKanji.push(newEntry);
    } else {
      // 既存エントリにカテゴリ情報を追加
      const existing = extraKanji.find((k) => k.kanji === entry.kanji);
      if (existing) {
        existing.isExtra = true;
        existing.isName = entry.category === "name";
        existing.isClassical = entry.category === "classical";
        existing.isRare = entry.category === "rare";
        if (entry.category === "rare" && !existing.rarityScore) {
          existing.rarityScore = 75;
        }
      }
    }
  }

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
