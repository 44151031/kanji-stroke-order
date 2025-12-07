"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface WordEntry {
  word: string;
  reading: string;
  meaning: string;
}

type Props = {
  words: WordEntry[];
  kanji: string;
};

export default function WordsListPaginated({ words, kanji }: Props) {
  const [page, setPage] = useState(0);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(words.length / itemsPerPage);
  
  const startIndex = page * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, words.length);
  const currentWords = words.slice(startIndex, endIndex);

  if (words.length === 0) return null;

  return (
    <div className="space-y-4">
      {/* 件数表示 */}
      <p className="text-sm text-muted-foreground text-center">
        全{words.length}件中 {startIndex + 1}〜{endIndex}件を表示
      </p>

      {/* 単語リスト */}
      <ul className="space-y-3">
        {currentWords.map((w, i) => (
          <li 
            key={`${w.word}-${i}`} 
            className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0"
          >
            <Link 
              href={`/search?q=${encodeURIComponent(w.word)}`} 
              className="hover:text-primary transition-colors"
            >
              <span className="font-medium text-base md:text-lg">{w.word}</span>
              <span className="text-muted-foreground ml-2 text-sm">({w.reading})</span>
            </Link>
            <span className="text-sm text-muted-foreground hidden md:inline max-w-[200px] truncate">
              {w.meaning}
            </span>
          </li>
        ))}
      </ul>

      {/* ページネーションボタン */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-4 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            ← 前へ
          </Button>
          <span className="text-sm text-muted-foreground">
            {page + 1} / {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page >= totalPages - 1}
          >
            次へ →
          </Button>
        </div>
      )}
    </div>
  );
}











