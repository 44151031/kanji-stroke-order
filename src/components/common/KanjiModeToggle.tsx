"use client";

import { usePathname, useRouter } from "next/navigation";
import { toUnicodeSlug } from "@/lib/slugHelpers";
import { motion, AnimatePresence } from "framer-motion";

/**
 * 🟧 Kanjiモード切り替えバー（横並び・省スペース版）
 * - 高さを出さずにタブ＋モード表示を横並びで表示
 * - 書き順テストモードをオレンジで強調
 * - ヘッダー直下に密着配置
 */
export default function KanjiModeToggle({ kanji }: { kanji: string }) {
  const router = useRouter();
  const pathname = usePathname();

  // モードは常に現在のURLから判定する（開いたURLを最優先）。
  // localStorage の保存値による自動遷移は、直接アクセスや戻る/進む操作を
  // 上書きしてしまうため行わない。
  const mode: "dictionary" | "practice" = pathname?.includes("/practice")
    ? "practice"
    : "dictionary";

  // モード切り替え処理（ボタン操作時のみ遷移）
  const handleSwitch = (newMode: "dictionary" | "practice") => {
    if (newMode === mode) return;
    localStorage.setItem("kanjiMode", newMode);
    const slug = toUnicodeSlug(kanji);
    router.push(
      newMode === "practice" ? `/kanji/${slug}/practice` : `/kanji/${slug}`
    );
  };

  return (
    <div
      className="
        sticky top-[56px] z-30
        w-full border-b border-border/40
        bg-background/80 backdrop-blur-md
        shadow-sm
      "
    >
      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4 py-2 max-w-4xl mx-auto px-4">
        {/* === タブ切り替え部分 === */}
        <div
          className="
            inline-flex rounded-full border border-border bg-white
            overflow-hidden shadow-sm
          "
        >
          <button
            onClick={() => handleSwitch("dictionary")}
            className={`px-5 py-1.5 text-sm font-medium transition-all duration-200 ${
              mode === "dictionary"
                ? "bg-blue-500 text-white shadow-inner"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            📘 辞書モード
          </button>

          <button
            onClick={() => handleSwitch("practice")}
            className={`px-5 py-1.5 text-sm font-medium transition-all duration-200 ${
              mode === "practice"
                ? "bg-amber-500 text-white shadow-inner"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            ✍ 書き順テスト
          </button>
        </div>

        {/* === モードバッジ（PC: 横並び、スマホ: 下に表示） === */}
        <AnimatePresence mode="wait">
          <motion.div
            key={mode}
            initial={{ opacity: 0, y: 2 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -2 }}
            transition={{ duration: 0.25 }}
            className={`text-xs rounded-full px-3 py-0.5
              ${
                mode === "dictionary"
                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                  : "bg-amber-50 text-amber-700 border border-amber-100"
              }`}
          >
            {mode === "dictionary"
              ? "📘 辞書モードで表示中"
              : "✍ 書き順テストモードで表示中"}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}



