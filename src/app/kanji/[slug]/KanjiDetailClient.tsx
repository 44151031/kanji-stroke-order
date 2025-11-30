"use client";

import { useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SvgAnimator from "@/components/SvgAnimator";
import { resetSvgAnimation } from "@/lib/svgUtils";

type Props = {
  character: string;
};

export default function KanjiDetailClient({ character }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  const handleReplay = useCallback(() => {
    if (containerRef.current) {
      const svgContainer = containerRef.current.querySelector(".svg-container");
      if (svgContainer) {
        resetSvgAnimation(svgContainer as HTMLElement);
      }
    }
  }, []);

  return (
    <div className="flex flex-col items-center gap-10">
      {/* ナビゲーション */}
      <header className="text-center w-full">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← トップに戻る
        </Link>
        <h1 className="text-7xl font-bold mt-6 mb-2">{character}</h1>
        <p className="text-muted-foreground text-lg">書き順アニメーション</p>
      </header>

      {/* メインコンテンツ */}
      <Card className="w-full max-w-lg rounded-2xl shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">書き順</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6">
          <div 
            ref={containerRef}
            className="w-72 h-72 md:w-80 md:h-80 border border-border rounded-xl flex items-center justify-center bg-white shadow-inner"
          >
            <SvgAnimator character={character} size={260} />
          </div>
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={handleReplay}
              className="flex-1 h-12"
            >
              🔄 もう一度再生
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 関連情報 */}
      <section className="text-center max-w-lg">
        <h2 className="text-xl font-medium mb-4">関連する文字</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {getRelatedCharacters(character).map((char) => (
            <Link
              key={char}
              href={`/kanji/${encodeURIComponent(char)}`}
              className="char-button w-12 h-12 flex items-center justify-center text-xl font-medium border border-border rounded-lg bg-card hover:bg-secondary transition-colors"
            >
              {char}
            </Link>
          ))}
        </div>
      </section>

      {/* フッター */}
      <footer className="text-center text-sm text-muted-foreground pt-8">
        <p>書き順データは KanjiVG プロジェクトを使用しています</p>
      </footer>
    </div>
  );
}

// 関連する文字を取得（仮実装）
function getRelatedCharacters(char: string): string[] {
  // 基本的な関連文字のマッピング
  const relatedMap: Record<string, string[]> = {
    "日": ["月", "明", "時", "昼", "晴"],
    "月": ["日", "明", "朝", "期", "望"],
    "火": ["水", "木", "金", "土", "炎"],
    "水": ["火", "木", "金", "土", "氷"],
    "木": ["火", "水", "金", "土", "林", "森"],
    "金": ["火", "水", "木", "土", "銀", "鉄"],
    "土": ["火", "水", "木", "金", "地"],
    "山": ["川", "谷", "岩", "峰"],
    "川": ["山", "河", "海", "流"],
    "人": ["大", "小", "子", "女", "男"],
  };

  // ひらがなの場合
  const hiraganaRow = getHiraganaRow(char);
  if (hiraganaRow) return hiraganaRow;

  // カタカナの場合
  const katakanaRow = getKatakanaRow(char);
  if (katakanaRow) return katakanaRow;

  return relatedMap[char] || ["一", "二", "三", "四", "五"];
}

function getHiraganaRow(char: string): string[] | null {
  const rows: Record<string, string[]> = {
    "あ": ["い", "う", "え", "お"],
    "い": ["あ", "う", "え", "お"],
    "う": ["あ", "い", "え", "お"],
    "え": ["あ", "い", "う", "お"],
    "お": ["あ", "い", "う", "え"],
    "か": ["き", "く", "け", "こ"],
    "き": ["か", "く", "け", "こ"],
    "く": ["か", "き", "け", "こ"],
    "け": ["か", "き", "く", "こ"],
    "こ": ["か", "き", "く", "け"],
  };
  return rows[char] || null;
}

function getKatakanaRow(char: string): string[] | null {
  const rows: Record<string, string[]> = {
    "ア": ["イ", "ウ", "エ", "オ"],
    "イ": ["ア", "ウ", "エ", "オ"],
    "ウ": ["ア", "イ", "エ", "オ"],
    "エ": ["ア", "イ", "ウ", "オ"],
    "オ": ["ア", "イ", "ウ", "エ"],
    "カ": ["キ", "ク", "ケ", "コ"],
    "キ": ["カ", "ク", "ケ", "コ"],
    "ク": ["カ", "キ", "ケ", "コ"],
    "ケ": ["カ", "キ", "ク", "コ"],
    "コ": ["カ", "キ", "ク", "ケ"],
  };
  return rows[char] || null;
}


