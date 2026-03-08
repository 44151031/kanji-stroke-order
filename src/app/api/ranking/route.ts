import { NextRequest, NextResponse } from "next/server";
import { supabase, isSupabaseConfigured } from "@/lib/supabaseClient";
import fallbackRanking from "@/data/fallbackRanking.json";

/**
 * 期間別ランキング API
 *
 * 期間定義（ローリング期間、JST基準）:
 *   week      … 過去7日間（今日のJST 00:00 を含む直近7日分）
 *   month     … 過去30日間
 *   half-year … 過去180日間
 *
 * JST境界: viewed_at は TIMESTAMPTZ（UTC保存）なので、
 * "今日のJST 0:00" = "今日の UTC-9 = 前日 15:00 UTC" を基準に計算する。
 */

// 有効な期間パラメータ
const VALID_PERIODS = ["week", "month", "half-year"] as const;
type PeriodParam = (typeof VALID_PERIODS)[number];

// 期間→日数マッピング
const PERIOD_TO_DAYS: Record<PeriodParam, number> = {
  week: 7,
  month: 30,
  "half-year": 180,
};

/**
 * JST基準の「from」日時をISO文字列で返す。
 * 今日のJST 00:00:00 から period_days 日前を起点とする。
 *
 * 例: JST 2025-06-15 の week(7日)
 *   → from = JST 2025-06-09 00:00:00 = UTC 2025-06-08T15:00:00Z
 */
function getFromDateISO(periodDays: number): string {
  // 現在時刻をJSTで考える（UTC+9）
  const nowUtc = Date.now();
  const JST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const nowJst = new Date(nowUtc + JST_OFFSET_MS);

  // JSTの今日 00:00:00
  const todayJstMidnight = new Date(
    Date.UTC(nowJst.getUTCFullYear(), nowJst.getUTCMonth(), nowJst.getUTCDate())
  );

  // periodDays日前のJST 00:00:00
  const fromJst = new Date(
    todayJstMidnight.getTime() - periodDays * 24 * 60 * 60 * 1000
  );

  // UTC に戻す（JST 00:00 = UTC 前日 15:00）
  const fromUtc = new Date(fromJst.getTime() - JST_OFFSET_MS);

  return fromUtc.toISOString();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const period = searchParams.get("period") as PeriodParam | null;

  // パラメータバリデーション
  if (!period || !VALID_PERIODS.includes(period)) {
    return NextResponse.json(
      {
        error: `Invalid period. Use one of: ${VALID_PERIODS.join(", ")}`,
      },
      { status: 400 }
    );
  }

  const periodDays = PERIOD_TO_DAYS[period];

  // Supabase未設定時のフォールバック
  if (!isSupabaseConfigured) {
    const data = fallbackRanking.slice(0, 100).map((item, index) => ({
      kanji: item.kanji,
      view_count: item.views,
      rank: index + 1,
    }));
    return NextResponse.json({
      data,
      period,
      periodDays,
      source: "fallback",
    });
  }

  // ---- 1) RPC関数で取得（推奨パス） ----
  const { data: rpcData, error: rpcError } = await supabase.rpc(
    "get_kanji_ranking_by_period",
    { period_days: periodDays }
  );

  if (!rpcError && rpcData && rpcData.length > 0) {
    const data = rpcData.map(
      (item: { kanji: string; view_count: number; rank: number }) => ({
        kanji: item.kanji,
        view_count: Number(item.view_count),
        rank: Number(item.rank),
      })
    );
    return NextResponse.json({
      data,
      period,
      periodDays,
      source: "rpc",
    });
  }

  // ---- 2) RPC失敗時: kanji_view_logs を直接クエリ（期間フィルタ付き） ----
  if (rpcError) {
    console.warn(
      `[ranking API] RPC error for period=${period}: ${rpcError.message}`
    );
  }

  const fromISO = getFromDateISO(periodDays);

  // kanji_view_logs から期間内のログを取得し、kanji ごとにカウント
  // Supabase JS client では GROUP BY + COUNT ができないため、
  // 生データを取得してサーバーサイドで集計する。
  // ただしデータ量が多い場合に備え、まず件数を確認。
  const { data: logsData, error: logsError } = await supabase
    .from("kanji_view_logs")
    .select("kanji")
    .gte("viewed_at", fromISO)
    .order("viewed_at", { ascending: false })
    .limit(50000); // 安全上限

  if (logsError || !logsData) {
    console.warn(
      `[ranking API] kanji_view_logs query error: ${logsError?.message}`
    );
    // 最終フォールバック: 静的データ
    const data = fallbackRanking.slice(0, 100).map((item, index) => ({
      kanji: item.kanji,
      view_count: item.views,
      rank: index + 1,
    }));
    return NextResponse.json({
      data,
      period,
      periodDays,
      source: "fallback",
    });
  }

  // サーバーサイドで集計
  const countMap = new Map<string, number>();
  for (const row of logsData) {
    countMap.set(row.kanji, (countMap.get(row.kanji) || 0) + 1);
  }

  const sorted = [...countMap.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 100);

  const data = sorted.map(([kanji, count], index) => ({
    kanji,
    view_count: count,
    rank: index + 1,
  }));

  return NextResponse.json({
    data,
    period,
    periodDays,
    source: "view_logs_direct",
    fromDate: fromISO,
  });
}
