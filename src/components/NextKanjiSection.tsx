"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KanjiCandidate {
  kanji: string;
  on?: string[];
  kun?: string[];
}

type Props = {
  currentKanji: string;
  strokes: number;
  radicals: string[];
  allKanji: KanjiCandidate[];
};

// Fisher-Yates シャッフル
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function NextKanjiSection({ 
  currentKanji, 
  strokes, 
  radicals, 
  allKanji 
}: Props) {
  const [nextKanji, setNextKanji] = useState<KanjiCandidate[]>([]);

  useEffect(() => {
    // 候補を抽出
    const candidates = allKanji.filter((k) => {
      if (k.kanji === currentKanji) return false;
      
      // 同じ部首を持つ漢字
      const kanjiRadicals = (k as { radicals?: string[] }).radicals || [];
      const hasCommonRadical = radicals.some((r) => kanjiRadicals.includes(r));
      
      // 画数が±1の漢字
      const kanjiStrokes = (k as { strokes?: number }).strokes || 0;
      const similarStrokes = Math.abs(kanjiStrokes - strokes) <= 1;
      
      return hasCommonRadical || similarStrokes;
    });

    // ランダムに3〜6件選択
    const shuffled = shuffleArray(candidates);
    const count = Math.min(Math.max(3, Math.floor(Math.random() * 4) + 3), shuffled.length);
    setNextKanji(shuffled.slice(0, count));
  }, [currentKanji, strokes, radicals, allKanji]);

  if (nextKanji.length === 0) return null;

  return (
    <Card className="w-full max-w-lg rounded-2xl shadow-sm border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">次に見る漢字</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-3 justify-center">
          {nextKanji.map((k) => (
            <Link
              key={k.kanji}
              href={`/kanji/${encodeURIComponent(k.kanji)}`}
              className="w-14 h-14 flex items-center justify-center text-2xl border border-border rounded-xl hover:bg-secondary hover:border-primary/30 transition-all"
              title={`${k.kanji} - ${k.on?.[0] || k.kun?.[0] || ""}`}
            >
              {k.kanji}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}


