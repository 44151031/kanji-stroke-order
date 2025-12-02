"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKanjiLink } from "@/lib/linkUtils";

interface KanjiItem {
  kanji: string;
  meaning: string;
  examples?: string[];
  grade?: number;
  strokes?: number;
}

interface KanjiFeatureListProps {
  data: KanjiItem[];
  title: string;
  description: string;
  emoji: string;
  colorTheme: "blue" | "amber" | "purple" | "green";
}

const colorClasses = {
  blue: {
    card: "border-blue-200 bg-blue-50/30",
    header: "text-blue-700",
    item: "border-blue-200 hover:bg-blue-100 hover:border-blue-400",
    badge: "bg-blue-100 text-blue-700",
  },
  amber: {
    card: "border-amber-200 bg-amber-50/30",
    header: "text-amber-700",
    item: "border-amber-200 hover:bg-amber-100 hover:border-amber-400",
    badge: "bg-amber-100 text-amber-700",
  },
  purple: {
    card: "border-purple-200 bg-purple-50/30",
    header: "text-purple-700",
    item: "border-purple-200 hover:bg-purple-100 hover:border-purple-400",
    badge: "bg-purple-100 text-purple-700",
  },
  green: {
    card: "border-green-200 bg-green-50/30",
    header: "text-green-700",
    item: "border-green-200 hover:bg-green-100 hover:border-green-400",
    badge: "bg-green-100 text-green-700",
  },
};

export function KanjiFeatureList({ 
  data, 
  title, 
  description, 
  emoji, 
  colorTheme 
}: KanjiFeatureListProps) {
  const colors = colorClasses[colorTheme];

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      {/* ヘッダー */}
      <header className="text-center w-full pt-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← トップに戻る
        </Link>
        <h1 className="text-4xl md:text-5xl font-bold mt-6 mb-3">
          {emoji} {title}
        </h1>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          {description}
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          全{data.length}字
        </p>
      </header>

      {/* 漢字グリッド */}
      <Card className={`w-full max-w-5xl rounded-2xl shadow-sm ${colors.card}`}>
        <CardHeader className="pb-4">
          <CardTitle className={`text-lg ${colors.header}`}>漢字一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {data.map((item, index) => (
              <Link
                key={`${item.kanji}-${index}`}
                href={getKanjiLink(item.kanji)}
                className={`flex flex-col items-center p-3 border rounded-xl transition-all group ${colors.item}`}
                title={item.meaning}
              >
                <span className="text-3xl font-bold group-hover:scale-110 transition-transform">
                  {item.kanji}
                </span>
                <span className="text-xs text-muted-foreground mt-1 truncate w-full text-center">
                  {item.meaning.split(",")[0]}
                </span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 例文・ヒント（あれば） */}
      {data.some((item) => item.examples && item.examples.length > 0) && (
        <Card className="w-full max-w-5xl rounded-2xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg">覚え方・例文</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data
                .filter((item) => item.examples && item.examples.length > 0)
                .slice(0, 30)
                .map((item, index) => (
                  <div
                    key={`example-${item.kanji}-${index}`}
                    className="p-3 border border-border rounded-lg"
                  >
                    <Link
                      href={getKanjiLink(item.kanji)}
                      className="text-2xl font-bold hover:text-primary"
                    >
                      {item.kanji}
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      {item.examples?.join(" / ")}
                    </p>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 関連リンク */}
      <div className="flex gap-4 text-sm flex-wrap justify-center pb-8">
        <Link
          href="/exam-kanji"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          🎓 入試頻出漢字
        </Link>
        <Link
          href="/mistake-kanji"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          ⚠️ 間違えやすい漢字
        </Link>
        <Link
          href="/confused-kanji"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          🔄 似ている漢字
        </Link>
        <Link
          href="/ranking"
          className="text-muted-foreground hover:text-foreground transition-colors"
        >
          📊 人気ランキング
        </Link>
      </div>
    </div>
  );
}

export default KanjiFeatureList;




