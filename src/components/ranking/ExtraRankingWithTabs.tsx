"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { getKanjiLink } from "@/lib/linkUtils";

/**
 * 表外漢字ランキング コンポーネント
 *
 * /api/ranking からデータ取得し、表外漢字のみにフィルタリングして表示。
 */

interface RankingItem {
  kanji: string;
  rank: number;
  view_count: number;
}

const PERIOD_OPTIONS = [
  { slug: "week", label: "週間" },
  { slug: "month", label: "月間" },
  { slug: "half-year", label: "半年" },
] as const;

type PeriodSlug = (typeof PERIOD_OPTIONS)[number]["slug"];

// 表外漢字フィルタ
async function filterExtraKanji(
  rankingData: RankingItem[]
): Promise<RankingItem[]> {
  try {
    const response = await fetch("/api/kanji-data?type=extra");
    if (response.ok) {
      const extraKanjiList: string[] = await response.json();
      const extraKanjiSet = new Set(extraKanjiList);
      const filtered = rankingData.filter((item) =>
        extraKanjiSet.has(item.kanji)
      );
      // ランクを振り直す
      return filtered.map((item, index) => ({
        ...item,
        rank: index + 1,
      }));
    }
  } catch (err) {
    console.debug("Extra kanji filter API error:", err);
  }
  return rankingData;
}

export default function ExtraRankingWithTabs() {
  const [activeTab, setActiveTab] = useState<PeriodSlug>("week");
  const [data, setData] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>("");
  const [limit, setLimit] = useState(20);

  const fetchRanking = useCallback(async (period: PeriodSlug) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ranking?period=${period}`);
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const json = await res.json();
      const allData: RankingItem[] = json.data ?? [];
      const filtered = await filterExtraKanji(allData);
      setData(filtered.slice(0, 100));
      setSource(json.source ?? "");
    } catch (err) {
      console.error("ランキング取得エラー:", err);
      setData([]);
      setSource("error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRanking(activeTab);
  }, [activeTab, fetchRanking]);

  const handleTabChange = (period: PeriodSlug) => {
    if (period === activeTab) return;
    setActiveTab(period);
    setLimit(20);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="space-y-4">
        <PeriodTabs activeTab={activeTab} onTabChange={handleTabChange} />
        <div className="text-center py-12 text-muted-foreground">
          <p>まだ表外漢字のランキングデータがありません</p>
          <p className="text-sm mt-2">
            表外漢字ページを閲覧するとランキングに反映されます
          </p>
        </div>
      </div>
    );
  }

  const displayedRanking = data.slice(0, limit);

  return (
    <div className="space-y-4">
      <PeriodTabs activeTab={activeTab} onTabChange={handleTabChange} />

      <div className="space-y-2">
        {displayedRanking.map((item) => (
          <Link
            key={`${item.kanji}-${activeTab}`}
            href={getKanjiLink(item.kanji)}
            className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            <div
              className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${
                item.rank === 1
                  ? "bg-yellow-400 text-yellow-900"
                  : item.rank === 2
                    ? "bg-gray-300 text-gray-700"
                    : item.rank === 3
                      ? "bg-amber-600 text-amber-100"
                      : "bg-secondary text-muted-foreground"
              }`}
            >
              {item.rank}
            </div>
            <div className="text-4xl font-bold w-16 text-center">
              {item.kanji}
            </div>
            <div className="flex-1 text-right">
              <span className="text-lg font-medium">
                {item.view_count.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground ml-1">回</span>
            </div>
          </Link>
        ))}
      </div>

      {data.length > limit && (
        <div className="text-center pt-4">
          <button
            onClick={() => setLimit((prev) => Math.min(prev + 20, 100))}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
          >
            次の20件を見る
          </button>
        </div>
      )}

      {limit >= data.length && data.length > 20 && (
        <p className="text-center text-sm text-muted-foreground pt-2">
          全{data.length}件を表示中
        </p>
      )}

      {source === "fallback" && (
        <p className="text-center text-xs text-amber-600 pt-4">
          ※ おすすめ漢字データを表示しています
        </p>
      )}

      <p className="text-xs text-center text-muted-foreground mt-8">
        ※ ランキングは閲覧数に基づいて定期的に更新されます。
      </p>
    </div>
  );
}

function PeriodTabs({
  activeTab,
  onTabChange,
}: {
  activeTab: PeriodSlug;
  onTabChange: (period: PeriodSlug) => void;
}) {
  return (
    <div className="flex justify-center gap-4 mb-6">
      {PERIOD_OPTIONS.map(({ slug, label }) => (
        <button
          key={slug}
          onClick={() => onTabChange(slug)}
          className={`px-6 py-2 rounded-full border text-sm font-medium transition ${
            activeTab === slug
              ? "bg-amber-500 text-white border-amber-500"
              : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
