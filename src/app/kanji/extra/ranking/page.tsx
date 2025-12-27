import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ExtraRankingWithTabs from "@/components/ranking/ExtraRankingWithTabs";
import { generatePageMetadata } from "@/lib/metadata";
import { getRankingJsonLd, getRankingSeriesJsonLd } from "@/lib/structuredData";
import Breadcrumb from "@/components/common/Breadcrumb";
import RelatedLinks from "@/components/common/RelatedLinks";
import fallbackRanking from "@/data/fallbackRanking.json";
import fs from "fs";
import path from "path";

// キャッシュ設定：1日1回更新
export const revalidate = 86400;

export const metadata: Metadata = generatePageMetadata({
  title: "表外漢字ランキング",
  description:
    "表外漢字の中で、特に閲覧されている漢字をランキング形式で紹介します。人名漢字・難読漢字・古典漢字など、日常では出会いにくい文字の注目度が分かります。",
  path: "/kanji/extra/ranking",
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

// 表外漢字のみをフィルタリング
function filterExtraKanji(ranking: typeof fallbackRanking) {
  try {
    // getExtraKanjiを使用して書き順SVGが存在する表外漢字を取得
    const { getExtraKanji } = require("@/lib/kanji/getExtraKanji");
    const extraKanji = getExtraKanji() as Array<{ kanji: string }>;
    
    const extraKanjiSet = new Set(extraKanji.map((k) => k.kanji));
    return ranking.filter((item) => extraKanjiSet.has(item.kanji));
  } catch {
    return [];
  }
}

export default function ExtraRankingPage() {
  // 構造化データ生成（表外漢字のみをフィルタリング）
  const allRanking = filterExtraKanji(fallbackRanking);
  const ranking = allRanking.slice(0, 50); // トップ50を構造化データに含める
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
      
      <main className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
        {/* パンくず */}
        <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            { label: "表外漢字一覧", href: "/kanji/extra" },
            { label: "表外漢字ランキング" },
          ]}
        />

        <header className="text-center">
          <h1 className="text-4xl font-bold mb-2">🏆 表外漢字ランキング</h1>
          <p className="text-muted-foreground max-w-xl">
            表外漢字の中で、特に閲覧されている漢字をランキング形式で紹介します。人名漢字・難読漢字・古典漢字など、日常では出会いにくい文字の注目度が分かります。
          </p>
        </header>

        {/* ランキングリスト（期間タブ付きクライアントコンポーネント） */}
        <Card className="w-full max-w-2xl rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">ランキング</CardTitle>
          </CardHeader>
          <CardContent>
            <ExtraRankingWithTabs />
          </CardContent>
        </Card>

        {/* 関連リンク */}
        <RelatedLinks
          links={[
            { label: "表外漢字一覧 →", href: "/kanji/extra" },
            { label: "難読・稀少漢字一覧 →", href: "/kanji/rare" },
            { label: "人名漢字一覧 →", href: "/kanji/name" },
            { label: "古典・文語漢字一覧 →", href: "/kanji/classical" },
            { label: "通常ランキング →", href: "/ranking" },
          ]}
        />
      </main>
    </>
  );
}

