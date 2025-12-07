"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toUnicodeSlug } from "@/lib/slugHelpers";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  kanji: string;
}

/**
 * 漢字モード切り替えトグル
 * 辞書モード ↔ 書き順テストモードを切り替え
 */
export default function KanjiModeToggle({ kanji }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [mode, setMode] = useState<"dictionary" | "practice">("dictionary");

  // 現在のパスからモードを判定
  useEffect(() => {
    const isPracticePage = pathname?.includes("/practice");
    setMode(isPracticePage ? "practice" : "dictionary");
  }, [pathname]);

  // 初回ロード時に localStorage から復元
  useEffect(() => {
    const savedMode = localStorage.getItem("kanjiMode") as
      | "dictionary"
      | "practice"
      | null;
    
    if (savedMode && savedMode !== mode) {
      setMode(savedMode);
      const slug = toUnicodeSlug(kanji);
      
      if (savedMode === "practice" && !pathname?.includes("/practice")) {
        router.push(`/kanji/${slug}/practice`);
      } else if (savedMode === "dictionary" && pathname?.includes("/practice")) {
        router.push(`/kanji/${slug}`);
      }
    }
  }, [kanji, router, pathname, mode]);

  // モード切り替え
  const handleToggle = (checked: boolean) => {
    const newMode = checked ? "practice" : "dictionary";
    setMode(newMode);
    localStorage.setItem("kanjiMode", newMode);

    const slug = toUnicodeSlug(kanji);

    if (newMode === "practice") {
      router.push(`/kanji/${slug}/practice`);
    } else {
      router.push(`/kanji/${slug}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 mb-6">
      {/* トグルスイッチ */}
      <div className="flex justify-center items-center gap-3">
        <span
          className={`text-sm font-medium transition-colors ${
            mode === "dictionary" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          辞書モード
        </span>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={mode === "practice"}
            onChange={(e) => handleToggle(e.target.checked)}
          />
          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>

        <span
          className={`text-sm font-medium transition-colors ${
            mode === "practice" ? "text-primary" : "text-muted-foreground"
          }`}
        >
          書き順テスト
        </span>
      </div>

      {/* 現在モード表示 */}
      <AnimatePresence mode="wait">
        <motion.p
          key={mode}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -3 }}
          transition={{ duration: 0.25 }}
          className="text-xs text-muted-foreground"
        >
          {mode === "dictionary"
            ? "📘 現在：辞書モードで表示中"
            : "✍ 現在：書き順テストモードで表示中"}
        </motion.p>
      </AnimatePresence>
    </div>
  );
}


