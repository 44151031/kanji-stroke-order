"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SvgAnimator from "@/components/SvgAnimator";
import { getKanjiLink } from "@/lib/linkUtils";

// 人気の漢字
const POPULAR_KANJI = ["山", "川", "日", "月", "火", "水", "木", "金", "土", "人", "大", "小"];

// 学年別リンク
const GRADE_LINKS = [
  { grade: 1, label: "小学1年", count: 80 },
  { grade: 2, label: "小学2年", count: 160 },
  { grade: 3, label: "小学3年", count: 200 },
  { grade: 4, label: "小学4年", count: 200 },
  { grade: 5, label: "小学5年", count: 185 },
  { grade: 6, label: "小学6年", count: 181 },
  { grade: 8, label: "中学校", count: 1130 },
];

// 主な画数
const STROKE_LINKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];

// 人気の部首（日本語名 + 英語名 + 絵文字）
const BUSHU_LINKS = [
  { jp: "水部", en: "Water", emoji: "💧", root: "氵" },
  { jp: "人部", en: "Person", emoji: "👤", root: "亻" },
  { jp: "木部", en: "Tree", emoji: "🌳", root: "木" },
  { jp: "手部", en: "Hand", emoji: "✋", root: "扌" },
  { jp: "心部", en: "Heart", emoji: "❤️", root: "忄" },
  { jp: "日部", en: "Sun", emoji: "☀️", root: "日" },
  { jp: "口部", en: "Mouth", emoji: "👄", root: "口" },
  { jp: "土部", en: "Earth", emoji: "🌏", root: "土" },
  { jp: "火部", en: "Fire", emoji: "🔥", root: "火" },
  { jp: "金部", en: "Gold", emoji: "💰", root: "金" },
  { jp: "言部", en: "Speech", emoji: "💬", root: "言" },
  { jp: "糸部", en: "Thread", emoji: "🧵", root: "糸" },
];

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
      router.push(getKanjiLink(previewChar));
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
          常用漢字2136字の書き順をアニメーションで学ぼう
        </p>
      </header>

      {/* 検索エリア */}
      <Card className="w-full max-w-md rounded-2xl shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">漢字を検索</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3">
            <Input
              type="text"
              placeholder="漢字を入力..."
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

      {/* 人気の漢字（直接リンク） */}
      <section className="w-full max-w-3xl">
        <div className="flex items-center justify-center gap-3 mb-4">
          <h2 className="text-xl font-medium">🏆 人気の漢字</h2>
          <Link
            href="/ranking"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            ランキングを見る →
          </Link>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          {POPULAR_KANJI.map((char) => (
            <Link
              key={char}
              href={getKanjiLink(char)}
              className="char-button w-14 h-14 flex items-center justify-center text-2xl font-medium border border-border rounded-xl bg-card hover:bg-secondary transition-colors"
            >
              {char}
            </Link>
          ))}
        </div>
      </section>

      {/* 学年別リンク */}
      <section className="w-full max-w-3xl">
        <h2 className="text-xl font-medium mb-4 text-center">📚 学年別で探す</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {GRADE_LINKS.map(({ grade, label, count }) => (
            <Link
              key={grade}
              href={`/grade/${grade}`}
              className="flex flex-col items-center p-4 border border-border rounded-xl bg-card hover:bg-secondary transition-colors"
            >
              <span className="font-medium">{label}</span>
              <span className="text-sm text-muted-foreground">{count}字</span>
            </Link>
          ))}
        </div>
      </section>

      {/* 画数別リンク */}
      <section className="w-full max-w-3xl">
        <h2 className="text-xl font-medium mb-4 text-center">✏️ 画数別で探す</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {STROKE_LINKS.map((n) => (
            <Link
              key={n}
              href={`/strokes/${n}`}
              className="w-11 h-11 flex items-center justify-center bg-white border border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all font-medium shadow-sm"
            >
              {n}
            </Link>
          ))}
          <Link
            href="/strokes/16"
            className="px-4 h-11 flex items-center justify-center bg-white border border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all text-sm shadow-sm"
          >
            16画以上 →
          </Link>
        </div>
      </section>

      {/* 部首別リンク */}
      <section className="w-full max-w-3xl">
        <h2 className="text-xl font-medium mb-4 text-center">📘 部首別で探す</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {BUSHU_LINKS.map((bushu) => (
            <Link
              key={bushu.en}
              href={`/bushu/${encodeURIComponent(bushu.en)}`}
              className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all shadow-sm group"
              title={bushu.en}
            >
              <span className="text-xl group-hover:scale-110 transition-transform">{bushu.emoji}</span>
              <div className="flex flex-col">
                <span className="font-medium text-foreground">{bushu.jp}</span>
                <span className="text-xs text-muted-foreground">{bushu.root}</span>
              </div>
            </Link>
          ))}
          <Link
            href="/bushu"
            className="flex items-center justify-center px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl hover:bg-gray-100 hover:border-gray-400 transition-all shadow-sm text-muted-foreground"
          >
            すべての部首 →
          </Link>
        </div>
      </section>

      {/* 特集ページ */}
      <section className="w-full max-w-3xl">
        <h2 className="text-xl font-medium mb-4 text-center">📚 特集で探す</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Link
            href="/exam-kanji"
            className="flex flex-col items-center p-5 bg-blue-50 border border-blue-200 rounded-xl hover:bg-blue-100 hover:border-blue-400 transition-all group"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🎓</span>
            <span className="font-medium text-blue-700">入試頻出漢字</span>
            <span className="text-xs text-blue-600/70 mt-1">受験対策に最適</span>
          </Link>
          <Link
            href="/mistake-kanji"
            className="flex flex-col items-center p-5 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 hover:border-amber-400 transition-all group"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">⚠️</span>
            <span className="font-medium text-amber-700">間違えやすい漢字</span>
            <span className="text-xs text-amber-600/70 mt-1">同音異義語の確認</span>
          </Link>
          <Link
            href="/confused-kanji"
            className="flex flex-col items-center p-5 bg-purple-50 border border-purple-200 rounded-xl hover:bg-purple-100 hover:border-purple-400 transition-all group"
          >
            <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🔄</span>
            <span className="font-medium text-purple-700">似ている漢字</span>
            <span className="text-xs text-purple-600/70 mt-1">形の違いを比較</span>
          </Link>
        </div>
      </section>

      {/* クイックリンク */}
      <nav className="flex gap-6 flex-wrap justify-center text-sm">
        <Link href="/hiragana" className="text-muted-foreground hover:text-foreground transition-colors">
          ひらがな一覧
        </Link>
        <Link href="/katakana" className="text-muted-foreground hover:text-foreground transition-colors">
          カタカナ一覧
        </Link>
        <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
          漢字検索
        </Link>
        <Link href="/grade/1" className="text-muted-foreground hover:text-foreground transition-colors">
          学年別一覧
        </Link>
        <Link href="/bushu" className="text-muted-foreground hover:text-foreground transition-colors">
          部首別一覧
        </Link>
      </nav>

      {/* フッター */}
      <footer className="text-center text-sm text-muted-foreground pt-8 pb-8">
        <p>常用漢字2136字の書き順データ：KanjiVG (CC BY-SA 3.0)</p>
      </footer>
    </div>
  );
}
