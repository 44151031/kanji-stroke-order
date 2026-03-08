"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getKanjiLink } from "@/lib/linkUtils";

/**
 * 期間別ランキング コンポーネント
 *
 * - /api/ranking?period=xxx からデータ取得（サーバーサイドで期間フィルタ処理済み）
 * - タブ切り替え時は router.push で URL を変更（SEO対応）
 * - initialPeriod で初期表示の期間を受け取る
 */

interface RankingItem {
  kanji: string;
  rank: number;
  view_count: number;
}

// URL スラッグと表示ラベルのマッピング
const PERIOD_OPTIONS = [
  { slug: "week", label: "週間" },
  { slug: "month", label: "月間" },
  { slug: "half-year", label: "半年" },
] as const;

type PeriodSlug = (typeof PERIOD_OPTIONS)[number]["slug"];

interface Props {
  initialPeriod?: string;
}

export default function RankingWithTabs({ initialPeriod = "week" }: Props) {
  const router = useRouter();
  const [activePeriod, setActivePeriod] = useState<PeriodSlug>(
    isValidPeriod(initialPeriod) ? initialPeriod : "week"
  );
  const [data, setData] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [source, setSource] = useState<string>("");
  const [limit, setLimit] = useState(20);

  const fetchRanking = useCallback(async (period: PeriodSlug) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/ranking?period=${period}`);
      if (!res.ok) {
        throw new Error(`API error: ${res.status}`);
      }
      const json = await res.json();
      setData(json.data ?? []);
      setSource(json.source ?? "");
    } catch (err) {
      console.error("ランキング取得エラー:", err);
      setData([]);
      setSource("error");
    } finally {
      setLoading(false);
    }
  }, []);

  // 初回・期間変更時にデータ取得
  useEffect(() => {
    fetchRanking(activePeriod);
  }, [activePeriod, fetchRanking]);

  // initialPeriod が外から変わった場合（ルート遷移時）に同期
  useEffect(() => {
    if (isValidPeriod(initialPeriod) && initialPeriod !== activePeriod) {
      setActivePeriod(initialPeriod);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPeriod]);

  // タブ切り替え
  const handleTabChange = (period: PeriodSlug) => {
    if (period === activePeriod) return;
    setActivePeriod(period);
    setLimit(20);
    // URL を期間別ページに変更（shallow: ページ全体の再レンダリングを避ける）
    router.push(`/ranking/${period}`, { scroll: false });
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
        <PeriodTabs
          activePeriod={activePeriod}
          onTabChange={handleTabChange}
        />
        <div className="text-center py-12 text-muted-foreground">
          <p>この期間のランキングデータがありません</p>
          <p className="text-sm mt-2">
            漢字ページを閲覧するとランキングに反映されます
          </p>
        </div>
      </div>
    );
  }

  const displayedRanking = data.slice(0, limit);

  return (
    <div className="space-y-4">
      {/* タブメニュー */}
      <PeriodTabs activePeriod={activePeriod} onTabChange={handleTabChange} />

      {/* ランキングリスト */}
      <div className="space-y-2">
        {displayedRanking.map((item) => (
          <Link
            key={`${item.kanji}-${activePeriod}`}
            href={getKanjiLink(item.kanji)}
            className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            {/* 順位バッジ */}
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

            {/* 漢字 */}
            <div className="text-4xl font-bold w-16 text-center">
              {item.kanji}
            </div>

            {/* 閲覧数 */}
            <div className="flex-1 text-right">
              <span className="text-lg font-medium">
                {item.view_count.toLocaleString()}
              </span>
              <span className="text-sm text-muted-foreground ml-1">回</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 次の20件を見るボタン */}
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

      {/* 全件表示済み */}
      {limit >= data.length && data.length > 20 && (
        <p className="text-center text-sm text-muted-foreground pt-2">
          全{data.length}件を表示中
        </p>
      )}

      {/* データソース表示（フォールバック時） */}
      {source === "fallback" && (
        <p className="text-center text-xs text-amber-600 pt-4">
          ※ おすすめ漢字データを表示しています
        </p>
      )}

      {/* 補足 */}
      <p className="text-xs text-center text-muted-foreground mt-8">
        ※ ランキングは閲覧数に基づいて定期的に更新されます。
      </p>
    </div>
  );
}

// ---- サブコンポーネント ----

function PeriodTabs({
  activePeriod,
  onTabChange,
}: {
  activePeriod: PeriodSlug;
  onTabChange: (period: PeriodSlug) => void;
}) {
  return (
    <div className="flex justify-center gap-4 mb-6">
      {PERIOD_OPTIONS.map(({ slug, label }) => (
        <button
          key={slug}
          onClick={() => onTabChange(slug)}
          className={`px-6 py-2 rounded-full border text-sm font-medium transition ${
            activePeriod === slug
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

function isValidPeriod(period: string): period is PeriodSlug {
  return PERIOD_OPTIONS.some((opt) => opt.slug === period);
}
