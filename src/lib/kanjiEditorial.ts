// ============================================
// ✍️ 漢字編集コンテンツ（kanji editorial content）
// ============================================
// data/kanji-editorial/u{HEX}.json に置かれた「人間が執筆・レビューした」
// 解説データを読み込むレイヤー。
//
// 方針:
// - データベースからの機械生成は行わない。1字ずつ独立したJSONファイルとして
//   Git管理し、個別にレビュー・修正できるようにする。
// - ファイルが存在する漢字のみ、漢字ページに解説セクションが表示される。
// - strokeOrderPoint / writingCaution の少なくとも一方は必須。
//   その他のフィールドは、その漢字に本当に意味がある場合のみ書く。

import fs from "fs";
import path from "path";

export interface EditorialExample {
  /** 熟語・言葉（例: 必要） */
  word: string;
  /** 読み（例: ひつよう） */
  reading: string;
  /** 例文（任意・自然な文のみ） */
  sentence?: string;
}

export interface EditorialSimilarKanji {
  kanji: string;
  /** 見分け方・違いの説明 */
  note: string;
}

export interface EditorialFaq {
  q: string;
  a: string;
}

export interface KanjiEditorialContent {
  kanji: string;
  /** 5桁小文字hex（例: 05fc5）— kanji-details / KanjiVG と同形式 */
  ucsHex: string;
  /** 書き順のポイント */
  strokeOrderPoint?: string;
  /** 書くときの注意（とめ・はね・はらい、形のバランスなど） */
  writingCaution?: string;
  /** 覚え方（自然な覚え方がある場合のみ） */
  mnemonic?: string;
  /** 代表的な言葉・例文 */
  examples?: EditorialExample[];
  /** 似ている漢字との見分け方 */
  similar?: EditorialSimilarKanji[];
  /** よくある質問（本当に「よく聞かれる」ことのみ） */
  faq?: EditorialFaq[];
  /** 執筆時に参照した資料メモ */
  sourceNote?: string;
  /** 最終レビュー日 YYYY-MM-DD */
  lastReviewed: string;
}

const EDITORIAL_DIR = path.join(process.cwd(), "data", "kanji-editorial");

/**
 * 漢字の編集コンテンツを読み込む。存在しない場合は null。
 * ucsHex は kanji-details / KanjiVG と同じ5桁小文字hex（例: 05c71）。
 * 大文字やパディングなしの形式も受け付ける。
 */
export function loadKanjiEditorial(ucsHex: string): KanjiEditorialContent | null {
  const normalized = ucsHex.toLowerCase().padStart(5, "0");
  const fileName = `${normalized}.json`;
  const filePath = path.join(EDITORIAL_DIR, fileName);
  try {
    if (!fs.existsSync(filePath)) return null;
    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw) as KanjiEditorialContent;
    // 最低要件: strokeOrderPoint か writingCaution のどちらかが必要
    if (!data.strokeOrderPoint && !data.writingCaution) return null;
    return data;
  } catch {
    return null;
  }
}
