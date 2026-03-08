import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RankingWithTabs from "@/components/ranking/RankingWithTabs";
import { generatePageMetadata } from "@/lib/metadata";
import { getRankingJsonLd, getRankingSeriesJsonLd } from "@/lib/structuredData";
import Breadcrumb from "@/components/common/Breadcrumb";
import RelatedLinks from "@/components/common/RelatedLinks";
import fallbackRanking from "@/data/fallbackRanking.json";

/**
 * 期間別ランキングページ
 *
 * URL: /ranking/week | /ranking/month | /ranking/half-year
 * 各期間ごとに固有のメタデータ・canonical・構造化データを持つ。
 */

// 有効な期間スラッグと表示ラベル
const PERIOD_CONFIG = {
  week: { label: "週間", description: "過去7日間", days: 7 },
  month: { label: "月間", description: "過去30日間", days: 30 },
  "half-year": { label: "半年間", description: "過去180日間", days: 180 },
} as const;

type PeriodSlug = keyof typeof PERIOD_CONFIG;

function isValidPeriod(period: string): period is PeriodSlug {
  return period in PERIOD_CONFIG;
}

// ISR: 5分ごとに再生成
export const revalidate = 300;

// 静的パラメータ生成（SSG用）
export function generateStaticParams() {
  return Object.keys(PERIOD_CONFIG).map((period) => ({ period }));
}

// 動的メタデータ生成
export async function generateMetadata({
  params,
}: {
  params: Promise<{ period: string }>;
}): Promise<Metadata> {
  const { period } = await params;

  if (!isValidPeriod(period)) {
    return {};
  }

  const config = PERIOD_CONFIG[period];

  return generatePageMetadata({
    title: `人気の漢字ランキング（${config.label}）`,
    description: `${config.description}でよく閲覧されている人気の漢字をランキング形式で紹介。${config.label}の漢字トレンドを確認できます。`,
    path: `/ranking/${period}`,
  });
}

export default async function RankingPeriodPage({
  params,
}: {
  params: Promise<{ period: string }>;
}) {
  const { period } = await params;

  if (!isValidPeriod(period)) {
    notFound();
  }

  const config = PERIOD_CONFIG[period];

  // 構造化データ生成
  const ranking = fallbackRanking.slice(0, 50);
  const jsonLd = getRankingJsonLd(ranking, config.label, period);
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

      <main className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
        {/* パンくず */}
        <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            { label: "人気ランキング", href: "/ranking" },
            { label: `${config.label}ランキング` },
          ]}
        />

        <header className="text-center">
          <h1 className="text-4xl font-bold mb-2">人気の漢字ランキング</h1>
          <p className="text-muted-foreground">
            閲覧数の多い漢字トップ100（{config.description}）
          </p>
        </header>

        {/* ランキングリスト（期間タブ付きクライアントコンポーネント） */}
        <Card className="w-full max-w-2xl rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">{config.label}ランキング</CardTitle>
          </CardHeader>
          <CardContent>
            <RankingWithTabs initialPeriod={period} />
          </CardContent>
        </Card>

        {/* 関連リンク */}
        <RelatedLinks
          links={[
            { label: "学年別一覧 →", href: "/grade/1" },
            { label: "画数別一覧 →", href: "/strokes/1" },
            { label: "部首別一覧 →", href: "/radical" },
          ]}
        />
      </main>
    </>
  );
}
