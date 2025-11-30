"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SvgAnimator from "@/components/SvgAnimator";

export default function Home() {
  const [searchText, setSearchText] = useState("");
  const [previewChar, setPreviewChar] = useState<string | null>(null);
  const router = useRouter();

  const handleSearch = () => {
    if (searchText.trim()) {
      const char = searchText.trim()[0];
      setPreviewChar(char);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const navigateToDetail = () => {
    if (previewChar) {
      router.push(`/kanji/${encodeURIComponent(previewChar)}`);
    }
  };

  return (
    <div className="flex flex-col items-center gap-10">
      {/* ヘッダー */}
      <header className="text-center pt-12 pb-4">
        <h1 className="text-5xl font-bold tracking-tight mb-3">
          漢字書き順
        </h1>
        <p className="text-muted-foreground text-lg">
          漢字・ひらがな・カタカナの書き順をアニメーションで学ぼう
        </p>
      </header>

      {/* 検索エリア */}
      <Card className="w-full max-w-md rounded-2xl shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">文字を検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="漢字・ひらがな・カタカナを入力"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 h-12 text-lg"
            />
            <Button onClick={handleSearch} className="h-12 px-6">
              検索
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* プレビューエリア */}
      {previewChar && (
        <Card className="w-full max-w-md rounded-2xl shadow-sm border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-medium flex items-center gap-2">
              <span>プレビュー:</span>
              <span className="text-2xl">{previewChar}</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-6">
            <div className="w-64 h-64 border border-border rounded-xl flex items-center justify-center bg-white shadow-inner">
              <SvgAnimator character={previewChar} size={220} />
            </div>
            <Button 
              onClick={navigateToDetail} 
              variant="outline" 
              className="w-full h-12"
            >
              詳細ページへ →
            </Button>
          </CardContent>
        </Card>
      )}

      {/* クイックリンク */}
      <nav className="flex gap-4 flex-wrap justify-center pt-4">
        <Button 
          variant="ghost" 
          onClick={() => router.push("/hiragana")}
          className="text-base"
        >
          ひらがな一覧
        </Button>
        <Button 
          variant="ghost" 
          onClick={() => router.push("/katakana")}
          className="text-base"
        >
          カタカナ一覧
        </Button>
      </nav>

      {/* 人気の漢字 */}
      <section className="w-full max-w-2xl">
        <h2 className="text-xl font-medium mb-4 text-center">人気の漢字</h2>
        <div className="flex flex-wrap justify-center gap-3">
          {["山", "川", "日", "月", "火", "水", "木", "金", "土", "人", "大", "小"].map((char) => (
            <button
              key={char}
              onClick={() => {
                setSearchText(char);
                setPreviewChar(char);
              }}
              className="char-button w-14 h-14 flex items-center justify-center text-2xl font-medium border border-border rounded-xl bg-card hover:bg-secondary transition-colors"
            >
              {char}
            </button>
          ))}
        </div>
      </section>

      {/* フッター */}
      <footer className="text-center text-sm text-muted-foreground pt-12 pb-8">
        <p>書き順データは KanjiVG プロジェクトを使用しています</p>
      </footer>
    </div>
  );
}
