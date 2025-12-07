/**
 * 漢字スクレイピング共通型定義
 */

export interface KanjiEntry {
  kanji: string;
  meaning?: string;
  reading?: string;
  source: string;
  category: string;
  difficulty?: number;
  examples?: string[];
}

export interface NormalizedKanji {
  kanji: string;
  meaning: string;
  readings?: string[];
  category: string[];
  sources: string[];
  difficulty?: number;
  examples?: string[];
  confusedWith?: string[];
}

export interface ScrapedData {
  entries: KanjiEntry[];
  source: string;
  scrapedAt: string;
}










