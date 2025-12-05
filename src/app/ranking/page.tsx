import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RankingWithTabs from "@/components/ranking/RankingWithTabs";
import { generatePageMetadata, getRankingJsonLd, getRankingSeriesJsonLd } from "@/lib/metadata";
import fallbackRanking from "@/data/fallbackRanking.json";

// キャッシュ設定：1日1回更新
export const revalidate = 86400;

export const metadata: Metadata = generatePageMetadata({
  title: "人気の漢字ランキング",
  description:
    "よく検索・閲覧されている人気の漢字をランキング形式で紹介。週・月・半年ごとの人気傾向を確認できます。",
  path: "/ranking",
});

/**
 * 期間ラベルを生成（将来の拡張用）
 */
function labelForPeriod(period: string = ""): string {
  switch (period) {
    case "week":
      return "1週間";
    case "month":
      return "1ヶ月";
    case "half":
      return "半年";
    default:
      return "";
  }
}

export default function RankingPage() {
  // 構造化データ生成（フォールバックデータを使用）
  const ranking = fallbackRanking.slice(0, 50); // トップ50を構造化データに含める
  const jsonLd = getRankingJsonLd(ranking, labelForPeriod());
  const seriesJsonLd = getRankingSeriesJsonLd();

  return (
    <>
      {/* 構造化データ */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(seriesJsonLd) }}
      />
      
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

        {/* ランキングリスト（期間タブ付きクライアントコンポーネント） */}
        <Card className="w-full max-w-2xl rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">ランキング</CardTitle>
          </CardHeader>
          <CardContent>
            <RankingWithTabs />
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
            href="/radical"
            className="text-muted-foreground hover:text-foreground"
          >
            部首別一覧 →
          </Link>
        </div>
      </div>
    </>
  );
}





