"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { getKanjiLink } from "@/lib/linkUtils";
import fallbackRanking from "@/data/fallbackRanking.json";

interface RankingItem {
  kanji: string;
  hex?: string;
  rank: number;
  view_count?: number;
}

type PeriodType = "week" | "month" | "half";

// 期間を日数に変換
const PERIOD_DAYS: Record<PeriodType, number> = {
  week: 7,
  month: 30,
  half: 180,
};

// クライアント側で表外漢字をフィルタリング
async function filterExtraKanji(rankingData: RankingItem[]): Promise<RankingItem[]> {
  try {
    // APIから表外漢字リストを取得
    const response = await fetch("/api/kanji-data?type=extra");
    if (response.ok) {
      const extraKanjiList: string[] = await response.json();
      const extraKanjiSet = new Set(extraKanjiList);
      return rankingData.filter((item) => extraKanjiSet.has(item.kanji));
    }
  } catch (err) {
    console.debug("Extra kanji filter API error:", err);
  }
  
  // フォールバック: 全データを返す（フィルタリングなし）
  return rankingData;
}

export default function ExtraRankingWithTabs() {
  const [activeTab, setActiveTab] = useState<PeriodType>("week");
  const [data, setData] = useState<RankingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [limit, setLimit] = useState(20);

  const periodLabels = {
    week: "1週間",
    month: "1ヶ月",
    half: "半年",
  };

  const fetchRanking = async (period: PeriodType) => {
    setLoading(true);
    
    try {
      // Supabaseが設定されていない場合はフォールバックを使用
      if (!isSupabaseConfigured) {
        console.log("📦 Supabase未設定のためフォールバックデータを使用");
        const fallbackData = fallbackRanking.slice(0, 100).map((item, index) => ({
          kanji: item.kanji,
          hex: item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
          rank: index + 1,
          view_count: item.views,
        }));
        // 表外漢字のみフィルタリング
        const filteredData = await filterExtraKanji(fallbackData);
        setData(filteredData);
        setIsFallback(true);
        setLoading(false);
        return;
      }

      // 期間別ランキング取得関数を呼び出し
      const periodDays = PERIOD_DAYS[period];
      const { data: rankingData, error } = await supabase.rpc(
        "get_kanji_ranking_by_period",
        { period_days: periodDays }
      );

      if (error) {
        console.log(`⚠️ 期間別ランキング関数エラー: ${error.message}`);
        console.log("→ kanji_viewsからフォールバック取得を試行");
        
        // フォールバック: kanji_viewsから累積データを取得
        const { data: viewsData, error: viewsError } = await supabase
          .from("kanji_views")
          .select("kanji, views")
          .order("views", { ascending: false })
          .limit(1000); // 多めに取得してからフィルタリング

        if (viewsError || !viewsData || viewsData.length === 0) {
          throw new Error("データ取得に失敗しました");
        }

        const mappedData = viewsData.map((item, index) => ({
          kanji: item.kanji,
          hex: item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
          rank: index + 1,
          view_count: item.views,
        }));

        // 表外漢字のみフィルタリング
        const filteredData = await filterExtraKanji(mappedData);
        
        // フィルタリング後に再度ランクを振り直し
        const rankedData = filteredData
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 100)
          .map((item, index) => ({
            ...item,
            rank: index + 1,
          }));

        setData(rankedData);
        setIsFallback(true); // 累積データなのでフォールバック扱い
      } else if (rankingData && rankingData.length > 0) {
        // 期間別ランキングデータを使用
        const mappedData = rankingData.map((item: { kanji: string; view_count: number; rank: number }) => ({
          kanji: item.kanji,
          hex: item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
          rank: Number(item.rank),
          view_count: Number(item.view_count),
        }));
        
        // 表外漢字のみフィルタリング
        const filteredData = await filterExtraKanji(mappedData);
        
        // フィルタリング後に再度ランクを振り直し
        const rankedData = filteredData
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 100)
          .map((item, index) => ({
            ...item,
            rank: index + 1,
          }));
        
        setData(rankedData);
        setIsFallback(false);
      } else {
        // データが空の場合はフォールバックを使用
        const fallbackData = fallbackRanking.slice(0, 100).map((item, index) => ({
          kanji: item.kanji,
          hex: item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
          rank: index + 1,
          view_count: item.views,
        }));
        const filteredData = await filterExtraKanji(fallbackData);
        setData(filteredData);
        setIsFallback(true);
      }
    } catch (err) {
      console.error("❌ Error loading ranking:", err);
      // エラー時はフォールバックデータを使用
      const fallbackData = fallbackRanking.slice(0, 100).map((item, index) => ({
        kanji: item.kanji,
        hex: item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
        rank: index + 1,
        view_count: item.views,
      }));
      const filteredData = await filterExtraKanji(fallbackData);
      setData(filteredData);
      setIsFallback(true);
    } finally {
      setLoading(false);
    }
  };

  // 初回読み込み
  useEffect(() => {
    fetchRanking(activeTab);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  // タブ切り替え時にデータを再取得
  const handleTabChange = (period: PeriodType) => {
    setActiveTab(period);
    setLimit(20); // タブ切り替え時に表示件数をリセット
    fetchRanking(period);
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
      <div className="text-center py-12 text-muted-foreground">
        <p>まだ表外漢字のランキングデータがありません</p>
        <p className="text-sm mt-2">表外漢字ページを閲覧するとランキングに反映されます</p>
      </div>
    );
  }

  const displayedRanking = data.slice(0, limit);

  return (
    <div className="space-y-4">
      {/* タブメニュー */}
      <div className="flex justify-center gap-4 mb-6">
        {(["week", "month", "half"] as PeriodType[]).map((period) => (
          <button
            key={period}
            onClick={() => handleTabChange(period)}
            className={`px-6 py-2 rounded-full border text-sm font-medium transition ${
              activeTab === period
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-white text-gray-600 border-gray-300 hover:bg-gray-50"
            }`}
          >
            {periodLabels[period]}
          </button>
        ))}
      </div>

      {/* ランキングリスト */}
      <div className="space-y-2">
        {displayedRanking.map((item) => {
          return (
            <Link
              key={`${item.kanji}-${activeTab}`}
              href={getKanjiLink(item.kanji)}
              className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
            >
              {/* 順位 */}
              <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${
                item.rank === 1 ? "bg-yellow-400 text-yellow-900" :
                item.rank === 2 ? "bg-gray-300 text-gray-700" :
                item.rank === 3 ? "bg-amber-600 text-amber-100" :
                "bg-secondary text-muted-foreground"
              }`}>
                {item.rank}
              </div>

              {/* 漢字 */}
              <div className="text-4xl font-bold w-16 text-center">
                {item.kanji}
              </div>

              {/* 閲覧数（表示可能な場合） */}
              {item.view_count !== undefined && (
                <div className="flex-1 text-right">
                  <span className="text-lg font-medium">{item.view_count.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground ml-1">回</span>
                </div>
              )}
            </Link>
          );
        })}
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

      {/* フォールバック表示中の注意 */}
      {isFallback && (
        <p className="text-center text-xs text-amber-600 pt-4">
          ※ 累積データまたはおすすめ漢字を表示しています
        </p>
      )}

      {/* 補足 */}
      <p className="text-xs text-center text-muted-foreground mt-8">
        ※ ランキングは閲覧数に基づいてリアルタイムで更新されます。
      </p>
    </div>
  );
}
