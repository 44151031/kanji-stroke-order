"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  getKanjiFromDictionaryPath,
  getLinkClickMode,
  getLoadedPracticeKanjiSet,
  loadPracticeKanjiSet,
  readSavedKanjiMode,
  toModePath,
} from "@/lib/kanjiModePreference";

/**
 * 一覧系ページで漢字リンク（/kanji/uXXXX）を通常クリックしたとき、
 * 保存モードが「練習」なら練習ページへ遷移させる。
 *
 * - HTML の href は変更しない（クローラー・新しいタブ・JavaScript 無効時は href どおり）
 * - 修飾キー付きクリック・中クリック・target 付きリンク・download リンクには関与しない
 * - window の capture フェーズで先に preventDefault するため、next/link は遷移しない
 *   （next/link は e.defaultPrevented のとき遷移を中止する）。遷移はここで1回だけ行う
 * - 何も表示しない
 */
export default function KanjiModeLinkHandler() {
  const router = useRouter();

  useEffect(() => {
    // 練習モードの利用者だけ、練習ページの有無の判定データを先に読み込んでおく
    if (readSavedKanjiMode() === "practice") {
      loadPracticeKanjiSet().catch(() => {});
    }

    const handleClick = (event: MouseEvent) => {
      if (
        event.defaultPrevented ||
        event.button !== 0 ||
        event.metaKey ||
        event.ctrlKey ||
        event.shiftKey ||
        event.altKey
      ) {
        return;
      }
      if (getLinkClickMode(window.location.pathname, readSavedKanjiMode()) !== "practice") return;

      const target = event.target;
      if (!(target instanceof Element)) return;
      const anchor = target.closest("a[href]");
      if (!(anchor instanceof HTMLAnchorElement)) return;
      const anchorTarget = anchor.getAttribute("target");
      if ((anchorTarget && anchorTarget !== "_self") || anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(anchor.href, window.location.href);
      } catch {
        return;
      }
      if (url.origin !== window.location.origin || url.search || url.hash) return;
      const dictionaryPath = url.pathname;
      if (!getKanjiFromDictionaryPath(dictionaryPath)) return;

      const loaded = getLoadedPracticeKanjiSet();
      if (loaded) {
        const destination = toModePath(dictionaryPath, "practice", loaded);
        if (destination === dictionaryPath) return; // 練習ページがない漢字は next/link に任せる
        event.preventDefault();
        router.push(destination);
        return;
      }

      // 判定データが未読み込み: 遷移を止めて、読み込み後に1回だけ遷移する
      event.preventDefault();
      loadPracticeKanjiSet().then(
        (set) => router.push(toModePath(dictionaryPath, "practice", set)),
        () => router.push(dictionaryPath)
      );
    };

    window.addEventListener("click", handleClick, true);
    return () => window.removeEventListener("click", handleClick, true);
  }, [router]);

  return null;
}
