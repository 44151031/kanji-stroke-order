"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toUnicodeSlug } from "@/lib/slugHelpers";
import SvgAnimator from "@/components/SvgAnimator";

interface KanjiEntry {
  kanji: string;
  grade: number;
}

interface StrokeOrderQuizClientProps {
  kanjiData: KanjiEntry[];
}

// 学年フィルター定義
const GRADE_FILTERS = [
  { value: 0, label: "全学年" },
  { value: 1, label: "小学1年" },
  { value: 2, label: "小学2年" },
  { value: 3, label: "小学3年" },
  { value: 4, label: "小学4年" },
  { value: 5, label: "小学5年" },
  { value: 6, label: "小学6年" },
  { value: 8, label: "中学校" },
] as const;

/**
 * 配列をシャッフル（Fisher-Yates）
 */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function StrokeOrderQuizClient({ kanjiData }: StrokeOrderQuizClientProps) {
  const [selectedGrade, setSelectedGrade] = useState(0);
  const [shuffledList, setShuffledList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // 学年でフィルタリングした漢字リスト
  const filteredKanji = useMemo(() => {
    if (selectedGrade === 0) {
      return kanjiData.map((k) => k.kanji);
    }
    return kanjiData
      .filter((k) => k.grade === selectedGrade)
      .map((k) => k.kanji);
  }, [selectedGrade, kanjiData]);

  // クライアントサイドでのみシャッフル（SSR対策）
  useEffect(() => {
    setIsClient(true);
  }, []);

  // 学年変更またはリスト変更時にシャッフル
  useEffect(() => {
    setShuffledList(shuffleArray(filteredKanji));
    setCurrentIndex(0);
    setShowAnswer(false);
  }, [filteredKanji]);

  // 現在のクイズ漢字
  const currentKanji = shuffledList[currentIndex] || filteredKanji[0];

  // 次の漢字へ
  const nextKanji = () => {
    setShowAnswer(false);
    const next = (currentIndex + 1) % shuffledList.length;
    if (next === 0) {
      setShuffledList(shuffleArray(filteredKanji));
    }
    setCurrentIndex(next);
  };

  // 前の漢字へ
  const previousKanji = () => {
    setShowAnswer(false);
    const prev = currentIndex === 0 ? shuffledList.length - 1 : currentIndex - 1;
    setCurrentIndex(prev);
  };

  // 正しい書き順を表示/非表示
  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <>
      {/* 学年フィルター */}
      <div className="w-full">
        <h2 className="text-lg font-medium mb-3 text-center">出題範囲を選ぶ</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {GRADE_FILTERS.map(({ value, label }) => (
            <Button
              key={value}
              variant={selectedGrade === value ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedGrade(value)}
              className="rounded-full"
            >
              {label}
              {value === 0 && (
                <span className="ml-1 text-xs opacity-70">({kanjiData.length}字)</span>
              )}
            </Button>
          ))}
        </div>
      </div>

      {/* クイズセクション */}
      <Card className="rounded-2xl shadow-sm border w-full">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <span>この漢字の正しい書き順は？</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 py-4">
            {/* 左側: 漢字表示 */}
            <div className="flex flex-col items-center space-y-4">
              <div className="text-8xl md:text-9xl font-bold select-none">
                {isClient ? currentKanji : "？"}
              </div>

              {/* 進捗表示 */}
              <p className="text-sm text-muted-foreground">
                {isClient
                  ? `${currentIndex + 1} / ${shuffledList.length}`
                  : "読み込み中..."}
              </p>
            </div>

            {/* 右側: 書き順アニメーション（答え） */}
            {showAnswer && isClient && (
              <div className="flex flex-col items-center space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-sm font-medium text-green-600">正しい書き順</p>
                <div className="w-64 h-64 md:w-72 md:h-72 border-2 border-green-300 rounded-xl flex items-center justify-center bg-white shadow-inner">
                  <SvgAnimator character={currentKanji} size={220} />
                </div>
                <div className="flex gap-3 text-sm">
                  <Link
                    href={`/kanji/${toUnicodeSlug(currentKanji)}`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    詳細ページ →
                  </Link>
                  <Link
                    href={`/kanji/${toUnicodeSlug(currentKanji)}/practice`}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    書き取りテスト →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* ボタン */}
          <div className="flex gap-4 flex-wrap justify-center mt-6">
            <Button
              onClick={previousKanji}
              variant="outline"
              className="px-6 py-2"
            >
              ← 戻る
            </Button>
            <Button
              onClick={toggleAnswer}
              variant={showAnswer ? "outline" : "default"}
              className="px-6 py-2"
            >
              {showAnswer ? "答えを隠す" : "正しい書き順を見る"}
            </Button>
            <Button
              onClick={nextKanji}
              variant="outline"
              className="px-6 py-2"
            >
              次へ →
            </Button>
          </div>

          {/* ヒント */}
          <p className="text-xs text-muted-foreground text-center mt-4">
            ランダムに出題されます。「次へ」で次の漢字に進みます。
          </p>
        </CardContent>
      </Card>
    </>
  );
}
