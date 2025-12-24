import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKanjiLink } from "@/lib/linkUtils";
import Breadcrumb from "@/components/common/Breadcrumb";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "表外漢字一覧",
  description: "常用漢字外の表外漢字をカテゴリ別に紹介。難読・稀少漢字、人名漢字、古典・文語漢字など、特殊な漢字の書き順・読み方・意味を学習できます。",
  path: "/kanji/extra",
});

const categories = [
  {
    title: "難読・稀少漢字",
    description: "読みにくい、使用頻度が低い漢字",
    href: "/kanji/rare",
    emoji: "🔍",
    color: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  },
  {
    title: "人名漢字",
    description: "人名用漢字（姓・名で使われやすい）",
    href: "/kanji/name",
    emoji: "👤",
    color: "bg-purple-50 border-purple-200 hover:bg-purple-100",
  },
  {
    title: "古典・文語漢字",
    description: "古文・漢文で使われる漢字",
    href: "/kanji/classical",
    emoji: "📜",
    color: "bg-amber-50 border-amber-200 hover:bg-amber-100",
  },
  {
    title: "その他表外漢字",
    description: "その他の常用漢字外の漢字",
    href: "/kanji/extra/other",
    emoji: "📚",
    color: "bg-gray-50 border-gray-200 hover:bg-gray-100",
  },
];

export default function ExtraKanjiPage() {
  return (
    <main className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: "トップ", href: "/" },
          { label: "表外漢字一覧" },
        ]}
      />

      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">表外漢字一覧</h1>
        <p className="text-muted-foreground max-w-xl">
          常用漢字外の表外漢字をカテゴリ別に紹介します。難読・稀少漢字、人名漢字、古典・文語漢字など、特殊な漢字の書き順・読み方・意味を学習できます。
        </p>
      </header>

      {/* 表外漢字の定義説明 */}
      <Card className="w-full max-w-2xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">表外漢字とは</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground leading-relaxed">
            表外漢字とは、常用漢字表に含まれていない漢字のことです。人名用漢字、難読漢字、古典で使われる漢字などがこれに該当します。表外漢字は日常生活ではあまり使われませんが、人名や文学作品、専門用語などで見かけることがあります。
          </p>
        </CardContent>
      </Card>

      {/* カテゴリカード */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-4xl">
        {categories.map((category) => (
          <Link
            key={category.href}
            href={category.href}
            className={`block p-6 border rounded-2xl transition-all ${category.color}`}
          >
            <div className="flex items-start gap-4">
              <span className="text-4xl">{category.emoji}</span>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-2">{category.title}</h2>
                <p className="text-sm text-muted-foreground">{category.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* ランキングリンク */}
      <Card className="w-full max-w-2xl rounded-2xl shadow-sm border-amber-200 bg-amber-50/50">
        <CardHeader>
          <CardTitle className="text-lg">🏆 表外漢字ランキング</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">
            表外漢字の中で、特に閲覧されている漢字をランキング形式で紹介します。
          </p>
          <Link
            href="/kanji/extra/ranking"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            表外漢字ランキングを見る →
          </Link>
        </CardContent>
      </Card>

      {/* 関連リンク */}
      <Card className="w-full max-w-2xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">関連ページ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              トップページ →
            </Link>
            <Link href="/search" className="text-muted-foreground hover:text-foreground transition-colors">
              漢字検索 →
            </Link>
            <Link href="/ranking" className="text-muted-foreground hover:text-foreground transition-colors">
              人気ランキング →
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

