/**
 * ランキング位置取得ユーティリティ
 * フォールバックデータとSupabaseの両方に対応
 */

import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import fallbackRanking from "@/data/fallbackRanking.json";
import { toUnicodeSlug } from "@/lib/slugHelpers";

/**
 * ランキング位置情報の型定義
 */
export interface RankingPosition {
  position: number;
  period?: string;
  views?: number;
}

/**
 * 漢字のランキング位置を取得（週次をデフォルト）
 * @param kanji - 漢字文字
 * @param period - 期間（"week", "month", "half"）
 * @returns ランキング位置情報、または null
 */
export async function getRankingPosition(
  kanji: string,
  period: string = "week"
): Promise<RankingPosition | null> {
  // フォールバックランキングから検索
  const fallbackIndex = fallbackRanking.findIndex((item) => item.kanji === kanji);
  
  if (fallbackIndex !== -1) {
    return {
      position: fallbackIndex + 1, // 1ベースの順位
      period: period,
      views: fallbackRanking[fallbackIndex].views,
    };
  }

  // Supabaseが利用可能な場合はDBから取得
  if (isSupabaseConfigured) {
    try {
      const hex = kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "";
      
      // 週次の場合：過去7日間
      const sinceDate = new Date();
      sinceDate.setDate(sinceDate.getDate() - 7);
      const since = sinceDate.toISOString();

      // kanji_viewsテーブルから最新のランキングを取得
      const { data, error } = await supabase
        .from("kanji_views")
        .select("kanji, views, updated_at")
        .order("views", { ascending: false })
        .limit(100);

      if (!error && data) {
        const rankIndex = data.findIndex((item) => item.kanji === kanji);
        if (rankIndex !== -1) {
          return {
            position: rankIndex + 1,
            period: period,
            views: data[rankIndex].views,
          };
        }
      }
    } catch (err) {
      console.error("ランキング位置取得エラー:", err);
    }
  }

  // ランキング外の場合は null を返す
  return null;
}

/**
 * ランキング位置を同期取得（サーバーサイド用）
 * フォールバックデータのみを使用
 */
export function getRankingPositionSync(kanji: string): RankingPosition | null {
  const fallbackIndex = fallbackRanking.findIndex((item) => item.kanji === kanji);
  
  if (fallbackIndex !== -1) {
    return {
      position: fallbackIndex + 1,
      period: "week",
      views: fallbackRanking[fallbackIndex].views,
    };
  }

  return null;
}

