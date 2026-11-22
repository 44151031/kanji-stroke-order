import { afterEach, describe, expect, it, vi } from "vitest";
import {
  KANJI_MODE_STORAGE_KEY,
  getKanjiFromDictionaryPath,
  getKanjiPageMode,
  getLinkClickMode,
  getSearchMode,
  isModeInheritancePage,
  loadPracticeKanjiSet,
  parseKanjiMode,
  readSavedKanjiMode,
  resolveSearchKanjiPath,
  toModePath,
} from "@/lib/kanjiModePreference";

const storageWith = (value: string | null) => ({ getItem: (key: string) => (key === KANJI_MODE_STORAGE_KEY ? value : null) });

describe("U1: 保存モードの読み取り・検証", () => {
  it("dictionary / practice だけを有効値として扱う", () => {
    expect(parseKanjiMode("dictionary")).toBe("dictionary");
    expect(parseKanjiMode("practice")).toBe("practice");
    expect(parseKanjiMode("foo")).toBeNull();
    expect(parseKanjiMode("")).toBeNull();
    expect(parseKanjiMode(null)).toBeNull();
    expect(parseKanjiMode("Practice")).toBeNull();
  });

  it("localStorage の値・未設定・不正値・例外・storage なしを扱える", () => {
    expect(readSavedKanjiMode(storageWith("practice"))).toBe("practice");
    expect(readSavedKanjiMode(storageWith("dictionary"))).toBe("dictionary");
    expect(readSavedKanjiMode(storageWith(null))).toBeNull();
    expect(readSavedKanjiMode(storageWith("foo"))).toBeNull();
    expect(
      readSavedKanjiMode({
        getItem: () => {
          throw new Error("SecurityError");
        },
      })
    ).toBeNull();
    expect(readSavedKanjiMode(null)).toBeNull();
    // node 環境（window なし）
    expect(readSavedKanjiMode()).toBeNull();
  });
});

describe("U2: ページの分類", () => {
  it("一覧系ページは対象", () => {
    for (const p of [
      "/",
      "/search",
      "/grade/1",
      "/grade/7",
      "/strokes/3",
      "/radical/mountain-radical",
      "/lists/exam",
      "/lists/mistake",
      "/lists/confused",
      "/exam-kanji",
      "/mistake-kanji",
      "/confused-kanji",
      "/ranking",
      "/ranking/week",
      "/grade/1/",
    ]) {
      expect(isModeInheritancePage(p), p).toBe(true);
    }
  });

  it("漢字ページ・記事・クイズ・表外漢字一覧などは対象外", () => {
    for (const p of [
      "/kanji/u5C71",
      "/kanji/u5C71/practice",
      "/articles/common-misorder-kanji",
      "/articles",
      "/quiz",
      "/lists/misorder",
      "/kanji/extra",
      "/kanji/extra/ranking",
      "/kanji/extra/other",
      "/kanji/rare",
      "/kanji/name",
      "/kanji/classical",
      "/radical",
      "/operation",
      "/grade/1/extra",
    ]) {
      expect(isModeInheritancePage(p), p).toBe(false);
    }
  });

  it("漢字ページのモードを URL から判定する", () => {
    expect(getKanjiPageMode("/kanji/u5C71")).toBe("dictionary");
    expect(getKanjiPageMode("/kanji/u5C71/practice")).toBe("practice");
    expect(getKanjiPageMode("/kanji/u5c71/practice")).toBe("practice");
    expect(getKanjiPageMode("/kanji/u20B9F")).toBe("dictionary");
    expect(getKanjiPageMode("/kanji/extra")).toBeNull();
    expect(getKanjiPageMode("/grade/1")).toBeNull();
  });

  it("辞書ページの URL だけを漢字リンクとして認識する", () => {
    expect(getKanjiFromDictionaryPath("/kanji/u5C71")).toBe("山");
    expect(getKanjiFromDictionaryPath("/kanji/u5C71/practice")).toBeNull();
    expect(getKanjiFromDictionaryPath("/kanji/extra")).toBeNull();
    expect(getKanjiFromDictionaryPath("/kanji/u5c71")).toBeNull(); // getKanjiLink は大文字で出力する
    expect(getKanjiFromDictionaryPath("#")).toBeNull();
  });
});

describe("U3: 遷移先の決定", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("一覧ページのクリックは保存モード、対象外ページは null", () => {
    expect(getLinkClickMode("/grade/1", "practice")).toBe("practice");
    expect(getLinkClickMode("/grade/1", "dictionary")).toBe("dictionary");
    expect(getLinkClickMode("/grade/1", null)).toBe("dictionary");
    expect(getLinkClickMode("/kanji/u5C71/practice", "dictionary")).toBeNull();
    expect(getLinkClickMode("/articles/x", "practice")).toBeNull();
  });

  it("検索ボックスは漢字ページ上なら現在のモード、それ以外は保存モード", () => {
    expect(getSearchMode("/kanji/u5C71/practice", "dictionary")).toBe("practice");
    expect(getSearchMode("/kanji/u5C71", "practice")).toBe("dictionary");
    expect(getSearchMode("/", "practice")).toBe("practice");
    expect(getSearchMode("/articles/x", "practice")).toBe("practice");
    expect(getSearchMode("/", null)).toBe("dictionary");
  });

  it("練習ページがあるのは常用漢字2136字だけ", async () => {
    const set = await loadPracticeKanjiSet();
    expect(set.size).toBe(2136);
    expect(set.has("山")).toBe(true);
    expect(set.has("鬱")).toBe(true);
    expect(set.has("嘘")).toBe(false);
    expect(set.has("剝")).toBe(false);
  });

  it("練習ページがない漢字は練習モードでも辞書 URL のまま", async () => {
    const set = await loadPracticeKanjiSet();
    expect(toModePath("/kanji/u5C71", "practice", set)).toBe("/kanji/u5C71/practice");
    expect(toModePath("/kanji/u5C71", "dictionary", set)).toBe("/kanji/u5C71");
    expect(toModePath("/kanji/u5618", "practice", set)).toBe("/kanji/u5618"); // 嘘（表外）
    expect(toModePath("/kanji/u3042", "practice", set)).toBe("/kanji/u3042"); // あ
  });

  it("resolveSearchKanjiPath: モード・漢字の有無で遷移先が決まる", async () => {
    expect(await resolveSearchKanjiPath("/kanji/u5DDD", "/", "practice")).toBe("/kanji/u5DDD/practice");
    expect(await resolveSearchKanjiPath("/kanji/u5DDD", "/", "dictionary")).toBe("/kanji/u5DDD");
    expect(await resolveSearchKanjiPath("/kanji/u5DDD", "/", null)).toBe("/kanji/u5DDD");
    expect(await resolveSearchKanjiPath("/kanji/u5DDD", "/kanji/u5C71/practice", null)).toBe("/kanji/u5DDD/practice");
    expect(await resolveSearchKanjiPath("/kanji/u5DDD", "/kanji/u5C71", "practice")).toBe("/kanji/u5DDD");
    expect(await resolveSearchKanjiPath("/kanji/u5618", "/", "practice")).toBe("/kanji/u5618");
    expect(await resolveSearchKanjiPath("#", "/", "practice")).toBe("#");
  });

  it("resolveSearchKanjiPath: 既定では window.localStorage を読む（不正値は辞書）", async () => {
    vi.stubGlobal("window", { localStorage: storageWith("practice") });
    expect(await resolveSearchKanjiPath("/kanji/u5DDD", "/")).toBe("/kanji/u5DDD/practice");
    vi.stubGlobal("window", { localStorage: storageWith("foo") });
    expect(await resolveSearchKanjiPath("/kanji/u5DDD", "/")).toBe("/kanji/u5DDD");
  });
});
