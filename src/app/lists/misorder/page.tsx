"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toUnicodeSlug } from "@/lib/slugHelpers";

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

export default function MisorderKanjiPage() {
  // 重複を除去した漢字リスト
  const kanjiList = useMemo(() => {
    return [...new Set(typedMisorderList.common_misorder_kanji)];
  }, []);

  // クイズ用のシャッフルされたリスト
  const [shuffledList, setShuffledList] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isClient, setIsClient] = useState(false);

  // クライアントサイドでのみシャッフル（SSR対策）
  useEffect(() => {
    setIsClient(true);
    setShuffledList(shuffleArray(kanjiList));
  }, [kanjiList]);

  // 現在のクイズ漢字
  const currentKanji = shuffledList[currentIndex] || kanjiList[0];

  // 次の漢字へ
  const nextKanji = () => {
    const next = (currentIndex + 1) % shuffledList.length;
    // 一周したら再シャッフル
    if (next === 0) {
      setShuffledList(shuffleArray(kanjiList));
    }
    setCurrentIndex(next);
  };

  // 正しい書き順を見る
  const showAnswer = () => {
    window.location.href = `/kanji/${toUnicodeSlug(currentKanji)}`;
  };

  return (
    <main className="max-w-[900px] mx-auto px-4 py-10 space-y-10">
      {/* パンくず */}
      <nav className="text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">トップ</Link></li>
          <li>/</li>
          <li className="text-foreground">書き順を間違えやすい漢字</li>
        </ol>
      </nav>

      {/* ヘッダー */}
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-3">書き順を間違えやすい漢字一覧</h1>
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
          <div className="flex flex-col items-center space-y-6 py-4">
            {/* 漢字表示 */}
            <div className="text-8xl md:text-9xl font-bold select-none">
              {isClient ? currentKanji : "？"}
            </div>
            
            {/* 進捗表示 */}
            <p className="text-sm text-muted-foreground">
              {isClient ? `${currentIndex + 1} / ${shuffledList.length}` : "読み込み中..."}
            </p>
            
            {/* ボタン */}
            <div className="flex gap-4 flex-wrap justify-center">
              <Button 
                onClick={showAnswer} 
                variant="default"
                className="px-6 py-2"
              >
                正しい書き順を見る
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
            <p className="text-xs text-muted-foreground text-center">
              「次へ」をクリックするとランダムに次の漢字が出題されます
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 漢字一覧セクション */}
      <section>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <span>📝</span>
          <span>書き順を間違えやすい漢字一覧（{kanjiList.length}字）</span>
        </h2>
        <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
          {kanjiList.map((kanji) => (
            <Link
              key={kanji}
              href={`/kanji/${toUnicodeSlug(kanji)}`}
              className="aspect-square flex items-center justify-center text-2xl bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
              title={kanji}
            >
              {kanji}
            </Link>
          ))}
        </div>
      </section>

      {/* 関連リンク */}
      <div className="flex gap-4 text-sm flex-wrap justify-center pt-6 border-t">
        <Link href="/lists/exam" className="text-muted-foreground hover:text-foreground">
          📚 入試頻出漢字 →
        </Link>
        <Link href="/lists/confused" className="text-muted-foreground hover:text-foreground">
          🔄 混同しやすい漢字 →
        </Link>
        <Link href="/grade/1" className="text-muted-foreground hover:text-foreground">
          学年別一覧 →
        </Link>
      </div>
    </main>
  );
}

