"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toUnicodeSlug } from "@/lib/slugHelpers";
import SvgAnimator from "@/components/SvgAnimator";
import Breadcrumb from "@/components/common/Breadcrumb";
import RelatedLinks from "@/components/common/RelatedLinks";

// 書き順を間違えやすい漢字リスト
import misorderList from "@/data/misorder-kanji.json";

// 型定義
interface MisorderKanjiList {
  common_misorder_kanji: string[];
}
const typedMisorderList = misorderList as MisorderKanjiList;

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

export default function MisorderKanjiClient() {
  // 重複を除去した漢字リスト
  const kanjiList = useMemo(() => {
    return [...new Set(typedMisorderList.common_misorder_kanji)];
  }, []);

  // クイズ用のシャッフルされたリスト
  const [shuffledList, setShuffledList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  // クライアントサイドでのみシャッフル（SSR対策）
  useEffect(() => {
    setIsClient(true);
    setShuffledList(shuffleArray(kanjiList));
  }, [kanjiList]);

  // 現在のクイズ漢字
  const currentKanji = shuffledList[currentIndex] || kanjiList[0];

  // 次の漢字へ
  const nextKanji = () => {
    setShowAnswer(false); // 答えを隠す
    const next = (currentIndex + 1) % shuffledList.length;
    // 一周したら再シャッフル
    if (next === 0) {
      setShuffledList(shuffleArray(kanjiList));
    }
    setCurrentIndex(next);
  };

  // 前の漢字へ
  const previousKanji = () => {
    setShowAnswer(false); // 答えを隠す
    const prev = currentIndex === 0 ? shuffledList.length - 1 : currentIndex - 1;
    setCurrentIndex(prev);
  };

  // 正しい書き順を表示
  const toggleAnswer = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <>
      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "トップ", href: "/" },
          { label: "書き順を間違えやすい漢字" },
        ]}
      />

      {/* ヘッダー */}
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-3">書き順を間違えやすい漢字クイズ</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          このページでは、書き順を間違えやすい漢字の一覧と、クイズで練習できる機能を提供しています。
          テストや入試でよく出題される漢字を中心に{kanjiList.length}字を厳選しました。
        </p>
      </header>

      {/* クイズセクション */}
      <Card className="rounded-2xl shadow-sm border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <span>🎯</span>
            <span>クイズに挑戦！</span>
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
                {isClient ? `${currentIndex + 1} / ${shuffledList.length}` : "読み込み中..."}
              </p>
            </div>

            {/* 右側: 書き順アニメーション（答え） */}
            {showAnswer && isClient && (
              <div className="flex flex-col items-center space-y-3 animate-in fade-in slide-in-from-right-4 duration-300">
                <p className="text-sm font-medium text-green-600">✓ 正しい書き順</p>
                <div className="w-64 h-64 md:w-72 md:h-72 border-2 border-green-300 rounded-xl flex items-center justify-center bg-white shadow-inner">
                  <SvgAnimator character={currentKanji} size={220} />
                </div>
                <Link
                  href={`/kanji/${toUnicodeSlug(currentKanji)}`}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  詳細ページを見る →
                </Link>
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
            「次へ」をクリックするとランダムに次の漢字が出題されます
          </p>
        </CardContent>
      </Card>

      {/* 漢字一覧セクション */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>📝</span>
          <span>書き順を間違えやすい漢字（{kanjiList.length}字）</span>
        </h2>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {kanjiList.map((kanji) => (
            <Link
              key={kanji}
              href={`/kanji/${toUnicodeSlug(kanji)}`}
              className="w-12 h-12 flex items-center justify-center text-2xl border border-border rounded-lg hover:bg-secondary transition-colors"
              title={kanji}
            >
              {kanji}
            </Link>
          ))}
        </div>
      </section>

      {/* 関連リンク */}
      <RelatedLinks
        links={[
          { label: "📚 入試頻出漢字 →", href: "/lists/exam" },
          { label: "🔄 混同しやすい漢字 →", href: "/lists/confused" },
          { label: "学年別一覧 →", href: "/grade/1" },
        ]}
        className="flex gap-4 text-sm flex-wrap justify-center pt-6 border-t"
      />
    </>
  );
}










