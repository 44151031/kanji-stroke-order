"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { getKanjiLink } from "@/lib/linkUtils";
import fallbackRanking from "@/data/fallbackRanking.json";

interface RankingEntry {
  kanji: string;
  views: number;
  updated_at?: string;
}

export default function RankingList() {
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFallback, setIsFallback] = useState(false);
  const [limit, setLimit] = useState(20);

  useEffect(() => {
    const fetchRanking = async () => {
      try {
        setLoading(true);
        
        // Supabaseが設定されていない場合はフォールバックを使用
        if (!isSupabaseConfigured) {
          console.log("📦 Supabase未設定のためフォールバックデータを使用");
          setRanking(fallbackRanking);
          setIsFallback(true);
          return;
        }
        
        const { data, error: fetchError } = await supabase
          .from("kanji_views")
          .select("kanji, views, updated_at")
          .order("views", { ascending: false })
          .limit(100);

        if (fetchError) {
          throw fetchError;
        }

        // データが空の場合もフォールバックを使用
        if (!data || data.length === 0) {
          console.log("📦 Supabaseにデータがないためフォールバックデータを使用");
          setRanking(fallbackRanking);
          setIsFallback(true);
        } else {
          setRanking(data);
          setIsFallback(false);
        }
      } catch (err) {
        console.error("❌ Ranking fetch error:", err);
        // エラー時はフォールバックデータを使用
        console.log("📦 Supabase接続エラーのためフォールバックデータを使用");
        setRanking(fallbackRanking);
        setIsFallback(true);
      } finally {
        setLoading(false);
      }
    };

    fetchRanking();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (ranking.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>まだランキングデータがありません</p>
        <p className="text-sm mt-2">漢字ページを閲覧するとランキングに反映されます</p>
      </div>
    );
  }

  const displayedRanking = ranking.slice(0, limit);

  return (
    <div className="space-y-4">
      {/* ランキングリスト */}
      <div className="space-y-2">
        {displayedRanking.map((entry, index) => (
          <Link
            key={entry.kanji}
            href={getKanjiLink(entry.kanji)}
            className="flex items-center gap-4 p-3 rounded-lg border border-border hover:bg-secondary transition-colors"
          >
            {/* 順位 */}
            <div className={`w-10 h-10 flex items-center justify-center rounded-full font-bold text-lg ${
              index === 0 ? "bg-yellow-400 text-yellow-900" :
              index === 1 ? "bg-gray-300 text-gray-700" :
              index === 2 ? "bg-amber-600 text-amber-100" :
              "bg-secondary text-muted-foreground"
            }`}>
              {index + 1}
            </div>

            {/* 漢字 */}
            <div className="text-4xl font-bold w-16 text-center">
              {entry.kanji}
            </div>

            {/* 閲覧数 */}
            <div className="flex-1 text-right">
              <span className="text-lg font-medium">{entry.views.toLocaleString()}</span>
              <span className="text-sm text-muted-foreground ml-1">回</span>
            </div>
          </Link>
        ))}
      </div>

      {/* 次の20件を見るボタン */}
      {ranking.length > limit && (
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
      {limit >= ranking.length && ranking.length > 20 && (
        <p className="text-center text-sm text-muted-foreground pt-2">
          全{ranking.length}件を表示中
        </p>
      )}

      {/* フォールバック表示中の注意 */}
      {isFallback && (
        <p className="text-center text-xs text-amber-600 pt-4">
          ※ おすすめ漢字を表示しています（実際の閲覧数ではありません）
        </p>
      )}
    </div>
  );
}


