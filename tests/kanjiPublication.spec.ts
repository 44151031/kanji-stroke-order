import { describe, expect, test } from "vitest";
import { getKanjiWithMeta } from "@/lib/getKanjiWithMeta";
import { getExtraKanji } from "@/lib/kanji/getExtraKanji";
import { isKanjiPublishable } from "@/lib/kanji/publication";
import joyo from "../data/kanji-joyo.json";

describe("漢字の公開条件", () => {
  test("常用漢字2136字は公開対象に残す", () => {
    const published = new Set(getKanjiWithMeta().map((k) => k.kanji));
    expect(joyo).toHaveLength(2136);
    expect(joyo.every((k) => published.has(k.kanji))).toBe(true);
  });

  test("仮データだけの表外漢字を詳細と一覧の両方から除く", () => {
    for (const list of [getKanjiWithMeta(), getExtraKanji()]) {
      expect(list.some((k) => k.kanji === "龍")).toBe(false);
      expect(list.filter((k) => k.isExtra).every(isKanjiPublishable)).toBe(true);
    }
  });

  const complete = {
    isExtra: true, strokes: 3, on: ["サン"], kun: ["やま"],
    meaning: ["mountain"], ucsHex: "05C71",
  };

  test("詳細と実在するSVGが揃えば公開できる（大文字hexにも対応）", () => {
    expect(isKanjiPublishable(complete)).toBe(true);
  });

  test("画数・読み・意味・SVGが欠けた表外漢字は公開しない", () => {
    for (const incomplete of [
      { ...complete, strokes: 0 },
      { ...complete, on: [], kun: [] },
      { ...complete, meaning: [] },
      { ...complete, ucsHex: "00000" },
    ]) expect(isKanjiPublishable(incomplete)).toBe(false);
  });
});
