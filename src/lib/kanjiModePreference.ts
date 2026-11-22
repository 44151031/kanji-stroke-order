/**
 * 辞書／練習モードの「記憶」と「引き継ぎ」の判定ロジック
 *
 * 優先順位:
 * 1. URL を開く操作（直接アクセス・検索流入・更新・戻る/進む・新しいタブ）は常に URL どおり。
 *    ここでは扱わない（KanjiModeToggle は URL からモードを判定する）。
 * 2. 漢字詳細／練習ページ上での移動は、現在のページのモードを使う。
 * 3. 一覧系ページ（許可リスト）で漢字を通常クリックしたとき、または検索ボックスで
 *    漢字を選んだときだけ、localStorage の保存モードを使う。
 *
 * 練習ページは常用漢字（data/kanji-joyo.json）にしか存在しないため、
 * それ以外の漢字は練習モードでも辞書ページへ移動させる。
 */

import { fromUnicodeSlug } from "@/lib/slugHelpers";

export type KanjiMode = "dictionary" | "practice";

/** KanjiModeToggle.tsx が切替ボタン操作時に保存するキーと同じ */
export const KANJI_MODE_STORAGE_KEY = "kanjiMode";

type StorageLike = Pick<Storage, "getItem">;

/** 保存値を検証する。"dictionary" / "practice" 以外は null（未設定扱い） */
export function parseKanjiMode(value: unknown): KanjiMode | null {
  return value === "dictionary" || value === "practice" ? value : null;
}

/**
 * 保存モードを読む。localStorage が使えない（SSR・プライベートモード・例外）場合は null。
 * 値の削除や書き換えはしない。
 */
export function readSavedKanjiMode(storage?: StorageLike | null): KanjiMode | null {
  try {
    const target =
      storage !== undefined
        ? storage
        : typeof window !== "undefined"
          ? window.localStorage
          : null;
    if (!target) return null;
    return parseKanjiMode(target.getItem(KANJI_MODE_STORAGE_KEY));
  } catch {
    return null;
  }
}

function normalizePathname(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) return pathname.slice(0, -1);
  return pathname;
}

const KANJI_PAGE_RE = /^\/kanji\/u[0-9A-Fa-f]{4,5}(\/practice)?$/;
const DICTIONARY_PATH_RE = /^\/kanji\/(u[0-9A-F]{4,5})$/;

/** 漢字詳細ページなら "dictionary"、練習ページなら "practice"、それ以外は null */
export function getKanjiPageMode(pathname: string): KanjiMode | null {
  const match = normalizePathname(pathname).match(KANJI_PAGE_RE);
  if (!match) return null;
  return match[1] ? "practice" : "dictionary";
}

/** "/kanji/uXXXX"（辞書ページの URL）なら漢字を返す。それ以外は null */
export function getKanjiFromDictionaryPath(pathname: string): string | null {
  const match = pathname.match(DICTIONARY_PATH_RE);
  if (!match) return null;
  return fromUnicodeSlug(match[1]);
}

const INHERITANCE_EXACT_PATHS = new Set([
  "/",
  "/search",
  "/exam-kanji",
  "/mistake-kanji",
  "/confused-kanji",
  "/ranking",
]);

const INHERITANCE_PATH_PATTERNS = [
  /^\/grade\/[^/]+$/,
  /^\/strokes\/[^/]+$/,
  /^\/radical\/[^/]+$/,
  /^\/lists\/(exam|mistake|confused)$/,
  /^\/ranking\/[^/]+$/,
];

/**
 * 漢字リンクのクリックで保存モードを反映する一覧系ページか。
 * 記事・クイズ・書き順クイズ一覧・表外漢字一覧・漢字詳細/練習ページは対象外。
 */
export function isModeInheritancePage(pathname: string): boolean {
  const path = normalizePathname(pathname);
  if (INHERITANCE_EXACT_PATHS.has(path)) return true;
  return INHERITANCE_PATH_PATTERNS.some((re) => re.test(path));
}

/** 一覧系ページで漢字リンクを通常クリックしたときのモード。対象外のページは null（何もしない） */
export function getLinkClickMode(
  currentPathname: string,
  savedMode: KanjiMode | null
): KanjiMode | null {
  if (!isModeInheritancePage(currentPathname)) return null;
  return savedMode ?? "dictionary";
}

/** 検索ボックスで漢字を選んだときのモード（漢字ページ上なら現在のモード、それ以外は保存モード） */
export function getSearchMode(currentPathname: string, savedMode: KanjiMode | null): KanjiMode {
  return getKanjiPageMode(currentPathname) ?? savedMode ?? "dictionary";
}

// ---- 練習ページが存在する漢字（常用漢字）の判定 ----------------------------------
// 一覧表示には不要なデータのため、練習モードの利用者が必要とした時点で別チャンクとして読み込む。

let practiceKanjiSet: Set<string> | null = null;
let practiceKanjiSetPromise: Promise<Set<string>> | null = null;

export function getLoadedPracticeKanjiSet(): Set<string> | null {
  return practiceKanjiSet;
}

export function loadPracticeKanjiSet(): Promise<Set<string>> {
  if (!practiceKanjiSetPromise) {
    practiceKanjiSetPromise = import("../../data/kanji-joyo.json")
      .then((mod) => {
        const list = (mod.default ?? mod) as unknown as Array<{ kanji: string }>;
        practiceKanjiSet = new Set(list.map((k) => k.kanji));
        return practiceKanjiSet;
      })
      .catch((error) => {
        practiceKanjiSetPromise = null; // 次回また試せるようにする
        throw error;
      });
  }
  return practiceKanjiSetPromise;
}

/** 辞書ページの URL を、指定モードで実在するページの URL にする（練習ページがなければ辞書のまま） */
export function toModePath(dictionaryPath: string, mode: KanjiMode, practiceKanji: Set<string>): string {
  if (mode !== "practice") return dictionaryPath;
  const kanji = getKanjiFromDictionaryPath(dictionaryPath);
  if (!kanji || !practiceKanji.has(kanji)) return dictionaryPath;
  return `${dictionaryPath}/practice`;
}

/**
 * 検索ボックスからの遷移先を決める。
 * 辞書モード・漢字以外・データ読み込み失敗のときは、受け取った辞書ページの URL をそのまま返す。
 */
export async function resolveSearchKanjiPath(
  dictionaryPath: string,
  currentPathname: string,
  savedMode: KanjiMode | null = readSavedKanjiMode()
): Promise<string> {
  if (!getKanjiFromDictionaryPath(dictionaryPath)) return dictionaryPath;
  const mode = getSearchMode(currentPathname, savedMode);
  if (mode !== "practice") return dictionaryPath;
  try {
    return toModePath(dictionaryPath, mode, await loadPracticeKanjiSet());
  } catch {
    return dictionaryPath;
  }
}
