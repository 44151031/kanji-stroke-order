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

export default function KanjiWordList({ words, kanji }: Props) {
  const [visible, setVisible] = useState(10);
  
  const showMore = () => {
    setVisible((prev) => Math.min(prev + 10, words.length));
  };

  if (words.length === 0) return null;

  const displayedWords = words.slice(0, visible);
  const hasMore = visible < words.length;
  const remaining = words.length - visible;

  return (
    <div className="space-y-4">
      {/* 件数表示 */}
      <p className="text-sm text-muted-foreground text-center">
        全{words.length}件{hasMore && `（${visible}件表示中）`}
      </p>

      {/* 単語リスト */}
      <ul className="space-y-3">
        {displayedWords.map((w, i) => (
          <li 
            key={`${w.word}-${i}`} 
            className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0 animate-in fade-in duration-300"
            style={{ animationDelay: `${Math.max(0, i - (visible - 10)) * 50}ms` }}
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

      {/* もっと見るボタン */}
      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button 
            onClick={showMore} 
            variant="outline"
            className="w-full max-w-xs"
          >
            もっと見る（残り{remaining}件）
          </Button>
        </div>
      )}

      {/* 全件表示完了 */}
      {!hasMore && words.length > 10 && (
        <p className="text-sm text-muted-foreground text-center pt-2">
          全{words.length}件を表示中
        </p>
      )}
    </div>
  );
}














