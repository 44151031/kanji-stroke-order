import fs from "fs";
import path from "path";

/** 仮データだけの表外漢字を公開しない。常用漢字の公開範囲は変えない。 */
export function isKanjiPublishable(kanji: {
  isExtra?: boolean;
  strokes: number;
  on: string[];
  kun: string[];
  meaning: string[];
  ucsHex: string;
}): boolean {
  if (!kanji.isExtra) return true;
  const hex = kanji.ucsHex.toLowerCase().padStart(5, "0");
  return kanji.strokes > 0
    && [...kanji.on, ...kanji.kun].some((reading) => reading.trim().length > 0)
    && kanji.meaning.some((meaning) => meaning.trim().length > 0)
    && fs.existsSync(path.join(process.cwd(), "public", "kanjivg", `${hex}.svg`));
}
