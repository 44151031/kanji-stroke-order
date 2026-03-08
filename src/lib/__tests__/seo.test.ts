import { describe, it, expect } from "vitest";
import {
  normalizeReading,
  truncateByWidth,
  buildKanjiTitle,
  buildKanjiDescription,
} from "../seo";

// ============================================
// normalizeReading
// ============================================
describe("normalizeReading", () => {
  it("ドットを除去する", () => {
    expect(normalizeReading("お.きる")).toBe("おきる");
  });

  it("複数ドットも除去する", () => {
    expect(normalizeReading("あ.た.らしい")).toBe("あたらしい");
  });

  it("末尾のダッシュを除去する", () => {
    expect(normalizeReading("ひと-")).toBe("ひと");
  });

  it("先頭のダッシュを除去する", () => {
    expect(normalizeReading("-つ")).toBe("つ");
  });

  it("ドットもダッシュもない場合はそのまま返す", () => {
    expect(normalizeReading("カ")).toBe("カ");
    expect(normalizeReading("やま")).toBe("やま");
  });

  it("空文字列はそのまま", () => {
    expect(normalizeReading("")).toBe("");
  });
});

// ============================================
// truncateByWidth
// ============================================
describe("truncateByWidth", () => {
  it("全角文字のみ: maxWidth内に収める", () => {
    // "漢字書き順" = 5文字 × 2 = width 10
    const result = truncateByWidth("漢字書き順", 8);
    expect(result).toBe("漢字書き"); // 4文字 × 2 = 8
  });

  it("半角文字のみ: maxWidth内に収める", () => {
    const result = truncateByWidth("abcdefgh", 5);
    expect(result).toBe("abcde");
  });

  it("全角半角混在: 正しくカットする", () => {
    // "A漢B字" → A(1) + 漢(2) + B(1) + 字(2) = 6
    const result = truncateByWidth("A漢B字", 4);
    expect(result).toBe("A漢B"); // 1+2+1 = 4
  });

  it("空文字列は空文字列を返す", () => {
    expect(truncateByWidth("", 64)).toBe("");
  });

  it("maxWidth以内の文字列はそのまま返す", () => {
    expect(truncateByWidth("テスト", 10)).toBe("テスト");
  });

  it("デフォルトmaxWidthは64", () => {
    // 32文字の全角 = width 64 → ちょうど収まる
    const str = "あ".repeat(32);
    expect(truncateByWidth(str)).toBe(str);

    // 33文字の全角 = width 66 → 32文字にカット
    const str33 = "あ".repeat(33);
    expect(truncateByWidth(str33)).toBe(str);
  });
});

// ============================================
// buildKanjiTitle
// ============================================
describe("buildKanjiTitle", () => {
  it("場: reading モード（デフォルト）", () => {
    const title = buildKanjiTitle({
      kanji: "場",
      on: ["ジョウ", "チョウ"],
      kun: ["ば"],
    });
    expect(title).toBe("場の読み方（音/訓）｜ば・ジョウ｜漢字書き順ナビ");
  });

  it("場: kun モード", () => {
    const title = buildKanjiTitle(
      { kanji: "場", on: ["ジョウ", "チョウ"], kun: ["ば"] },
      "kun"
    );
    expect(title).toContain("場の訓読みは「ば」");
    expect(title).toContain("音：ジョウ・チョウ");
    expect(title).toContain("漢字書き順ナビ");
  });

  it("場: on モード", () => {
    const title = buildKanjiTitle(
      { kanji: "場", on: ["ジョウ", "チョウ"], kun: ["ば"] },
      "on"
    );
    expect(title).toContain("場の音読みは「ジョウ」");
    expect(title).toContain("訓：ば");
    expect(title).toContain("漢字書き順ナビ");
  });

  it("地: 訓読みなし → 音読み主語", () => {
    const title = buildKanjiTitle({
      kanji: "地",
      on: ["チ", "ジ"],
      kun: [],
    });
    expect(title).toBe("地の音読みは「チ」｜漢字書き順ナビ");
  });

  it("服: 訓読みなし・音読み1つ → 音読み主語", () => {
    const title = buildKanjiTitle({
      kanji: "服",
      on: ["フク"],
      kun: [],
    });
    expect(title).toBe("服の音読みは「フク」｜漢字書き順ナビ");
  });

  it("力: reading モード（多数の音読み）", () => {
    const title = buildKanjiTitle({
      kanji: "力",
      on: ["リョク", "リキ", "リイ"],
      kun: ["ちから"],
    });
    expect(title).toContain("力の読み方（音/訓）");
    expect(title).toContain("ちから・リョク");
    expect(title).toContain("漢字書き順ナビ");
  });

  it("起: ドット入り訓読みが正規化される", () => {
    const title = buildKanjiTitle({
      kanji: "起",
      on: ["キ"],
      kun: ["お.きる", "お.こる", "お.こす"],
    });
    // normalizeReading により "お.きる" → "おきる"
    expect(title).toContain("おきる");
    expect(title).not.toContain(".");
  });

  it("両方空 → フォールバック", () => {
    const title = buildKanjiTitle({ kanji: "某", on: [], kun: [] });
    expect(title).toBe("某の読み方｜漢字書き順ナビ");
  });

  it("音読みなし → 訓読み主語", () => {
    const title = buildKanjiTitle({
      kanji: "畑",
      on: [],
      kun: ["はたけ", "はた"],
    });
    expect(title).toBe("畑の訓読みは「はたけ」｜漢字書き順ナビ");
  });

  it("64幅を超えない", () => {
    const title = buildKanjiTitle({
      kanji: "鬱",
      on: ["ウツ"],
      kun: ["ふさ.ぐ", "しげ.る", "うっ.する"],
    });
    // 幅チェック
    let width = 0;
    for (const ch of title) {
      const cp = ch.codePointAt(0) ?? 0;
      width += cp <= 0x7e ? 1 : 2;
    }
    expect(width).toBeLessThanOrEqual(64);
  });
});

// ============================================
// buildKanjiDescription
// ============================================
describe("buildKanjiDescription", () => {
  it("場: 1文目に読み方が含まれる", () => {
    const desc = buildKanjiDescription({
      kanji: "場",
      on: ["ジョウ", "チョウ"],
      kun: ["ば"],
      strokes: 12,
      grade: 2,
    });
    expect(desc).toContain("「場」の訓読みは「ば」、音読みは「ジョウ・チョウ」。");
    expect(desc).toContain("12画、小学2年で習う漢字。");
    expect(desc).toContain("書き順（筆順）をSVGアニメーションで解説。");
  });

  it("地: 音読みのみ", () => {
    const desc = buildKanjiDescription({
      kanji: "地",
      on: ["チ", "ジ"],
      kun: [],
      strokes: 6,
      grade: 2,
    });
    expect(desc).toContain("「地」の音読みは「チ・ジ」。");
    expect(desc).not.toContain("訓読み");
  });

  it("中学漢字の学年表示", () => {
    const desc = buildKanjiDescription({
      kanji: "鬱",
      on: ["ウツ"],
      kun: [],
      strokes: 29,
      grade: 7,
    });
    expect(desc).toContain("中学で習う漢字");
  });

  it("ドット入り訓読みが正規化される", () => {
    const desc = buildKanjiDescription({
      kanji: "起",
      on: ["キ"],
      kun: ["お.きる", "お.こる"],
      strokes: 10,
      grade: 3,
    });
    expect(desc).toContain("おきる・おこる");
    expect(desc).not.toContain(".");
  });

  it("両方空のフォールバック", () => {
    const desc = buildKanjiDescription({
      kanji: "某",
      on: [],
      kun: [],
      strokes: 9,
      grade: 0,
    });
    expect(desc).toContain("「某」の読み方を解説。");
    expect(desc).toContain("9画。");
  });
});
