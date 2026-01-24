"use client";

import { useState } from "react";
import Link from "next/link";
import { Radical, getUniqueSlug, getEnglishDisplayName } from "@/lib/radicalList";
import { getRadicalGlyphBySlug } from "@/data/radicals/radicalGlyphMap";

type RadicalWithCount = Radical & { count: number };

type Props = {
  items: RadicalWithCount[];
  counts: Map<string, number>;
};

const INITIAL_VISIBLE = 5;

export default function RadicalSectionClient({ items, counts }: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // PC表示では全件表示、スマホでは5件まで（展開時は全件）
  const visibleCount = isExpanded ? items.length : Math.min(INITIAL_VISIBLE, items.length);
  const visibleItems = items.slice(0, visibleCount);
  const hasMore = items.length > INITIAL_VISIBLE;
  const remainingCount = items.length - INITIAL_VISIBLE;

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
        {/* PC表示: 全件表示 */}
        <div className="hidden sm:contents">
          {items.map((r) => {
            const uniqueSlug = getUniqueSlug(r, counts);
            const glyph = getRadicalGlyphBySlug(r.en, r.root);
            const englishName = getEnglishDisplayName(r.en);
            return (
              <Link
                key={`${r.en}-${r.type}`}
                href={`/radical/${uniqueSlug}`}
                className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
              >
                <span className="text-2xl w-10 h-10 flex-shrink-0 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm">
                  {glyph}
                </span>
                <div className="flex-1 min-w-0">
                  <span className="font-medium text-sm block truncate">
                    {r.jp}（{englishName}）
                  </span>
                  <span className="text-xs text-muted-foreground block">
                    登録数：{r.count}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        
        {/* スマホ表示: 5件まで（展開時は全件）- コンパクトレイアウト */}
        <div className="sm:hidden contents">
          {visibleItems.map((r) => {
            const uniqueSlug = getUniqueSlug(r, counts);
            const glyph = getRadicalGlyphBySlug(r.en, r.root);
            const englishName = getEnglishDisplayName(r.en);
            return (
              <Link
                key={`${r.en}-${r.type}`}
                href={`/radical/${uniqueSlug}`}
                className="flex items-center gap-3 px-3 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
              >
                <span className="text-xl w-8 h-8 flex-shrink-0 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm">
                  {glyph}
                </span>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-baseline gap-1.5 flex-wrap">
                    <span className="font-medium text-sm">{r.jp}</span>
                    <span className="text-xs text-gray-500">({englishName})</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    登録数：{r.count}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      
      {/* アコーディオンボタン（スマホのみ表示、5個以上の場合のみ） */}
      {hasMore && (
        <div className="sm:hidden flex justify-center mt-4">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full max-w-xs px-5 py-2.5 rounded-lg text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              isExpanded
                ? "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
                : "bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-300 shadow-sm"
            }`}
          >
            {isExpanded ? (
              <>
                <span>折りたたむ</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              </>
            ) : (
              <>
                <span>もっと見る（残り{remainingCount}件）</span>
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </>
            )}
          </button>
        </div>
      )}
    </>
  );
}
