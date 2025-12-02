import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RankingList from "@/components/RankingList";

export const metadata: Metadata = {
  title: "人気の漢字ランキング｜漢字書き順",
  description: "閲覧数の多い人気漢字をランキング形式で表示。書き順・読み方・意味を学べます。",
  openGraph: {
    title: "人気の漢字ランキング｜漢字書き順",
    description: "閲覧数の多い人気漢字をランキング形式で表示",
  },
};

export default function RankingPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      {/* パンくず */}
      <nav className="w-full text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li>
            <Link href="/" className="hover:text-foreground">
              トップ
            </Link>
          </li>
          <li>/</li>
          <li className="text-foreground">人気ランキング</li>
        </ol>
      </nav>

      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">🏆 人気の漢字ランキング</h1>
        <p className="text-muted-foreground">閲覧数の多い漢字トップ100</p>
      </header>

      {/* ランキングリスト（クライアントコンポーネント） */}
      <Card className="w-full max-w-2xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">ランキング</CardTitle>
        </CardHeader>
        <CardContent>
          <RankingList />
        </CardContent>
      </Card>

      {/* 関連リンク */}
      <div className="flex gap-4 text-sm flex-wrap justify-center">
        <Link
          href="/grade/1"
          className="text-muted-foreground hover:text-foreground"
        >
          学年別一覧 →
        </Link>
        <Link
          href="/strokes/1"
          className="text-muted-foreground hover:text-foreground"
        >
          画数別一覧 →
        </Link>
        <Link
          href="/bushu"
          className="text-muted-foreground hover:text-foreground"
        >
          部首別一覧 →
        </Link>
      </div>
    </div>
  );
}



