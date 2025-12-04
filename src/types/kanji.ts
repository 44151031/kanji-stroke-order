/**
 * 漢字データ型定義
 */

export interface KanjiItem {
  id: string;
  kanji: string;
  readings: {
    on: string[];
    kun: string[];
  };
  meaning: string;
  strokes: number;
  radical: {
    name: string;
    meaning: string;
  };
  grade?: number;
  jlpt?: string;
  category?: string[];
  sources?: string[];
  confusedWith?: string[];
  examples?: string[];
  related?: string[];
}

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
}

export interface WordEntry {
  word: string;
  reading: string;
  meaning: string;
}

export interface KanjiJoyo {
  kanji: string;
  ucsHex: string;
  grade: number;
  strokes: number;
}







