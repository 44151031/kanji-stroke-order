import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { getKanjiLink } from "@/lib/linkUtils";
import fallbackRanking from "@/data/fallbackRanking.json";

interface RankingItem {
  kanji: string;
  hex: string;
  rank_day?: number;
}

async function getDailyRanking(): Promise<RankingItem[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Supabaseが設定されていない場合はフォールバックデータを使用
  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("📦 Supabase未設定のためフォールバックデータを使用");
    return fallbackRanking.slice(3, 11).map((item, index) => ({
      kanji: item.kanji,
      hex: item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
      rank_day: index + 4, // 4〜11位
    }));
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // kanji_ranking テーブルまたはビューから取得を試みる
    // まず、rank_dayカラムがあるか確認（なければrankカラムを使用）
    const { data, error } = await supabase
      .from("kanji_ranking")
      .select("kanji, hex, rank_day, rank")
      .gte("rank_day", 4)
      .lte("rank_day", 11)
      .order("rank_day", { ascending: true })
      .limit(8);

    if (error) {
      // rank_dayカラムがない場合は、rankカラムで試す
      console.log("⚠️ rank_dayカラムが見つからないため、rankカラムで試行");
      
      const { data: rankData, error: rankError } = await supabase
        .from("kanji_ranking")
        .select("kanji, hex, rank")
        .gte("rank", 4)
        .lte("rank", 11)
        .order("rank", { ascending: true })
        .limit(8);

      if (rankError) {
        // それでもエラーの場合はkanji_viewsテーブルから直接取得
        console.log("⚠️ kanji_rankingから取得失敗、kanji_viewsから取得を試行");
        
        const { data: viewsData, error: viewsError } = await supabase
          .from("kanji_views")
          .select("kanji, views")
          .order("views", { ascending: false })
          .limit(11);

        if (viewsError || !viewsData || viewsData.length < 4) {
          throw new Error("データ取得に失敗しました");
        }

        // 4〜11位を取得（0-indexedなので3〜10）
        return viewsData.slice(3, 11).map((item, index) => ({
          kanji: item.kanji,
          hex: item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
          rank_day: index + 4, // 4〜11位
        }));
      }

      return rankData?.map((item) => ({
        kanji: item.kanji,
        hex: item.hex || item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
        rank_day: item.rank,
      })) || [];
    }

    return (
      data?.map((item) => ({
        kanji: item.kanji,
        hex: item.hex || item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
        rank_day: item.rank_day || item.rank,
      })) || []
    );
  } catch (err) {
    console.error("❌ Error loading ranking:", err);
    // エラー時はフォールバックデータを使用
    return fallbackRanking.slice(3, 11).map((item, index) => ({
      kanji: item.kanji,
      hex: item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
      rank_day: index + 4,
    }));
  }
}

export default async function PopularKanjiSection() {
  const ranking = await getDailyRanking();

  return (
    <section className="w-full max-w-3xl">
      <h2 className="text-xl font-medium mb-4 text-center">
        🏆 人気の漢字
      </h2>
      <p className="text-sm text-muted-foreground mb-6 text-center">
        多くの人が検索している人気の漢字を紹介しています。
        <br />
        1〜3位の漢字は別ページでランキング形式で紹介しています。
      </p>

      {/* ランキング表示 */}
      {ranking.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-3">
          {ranking.map((item, index) => {
            const rank = item.rank_day || index + 4; // 順位を取得（なければindexから計算）
            return (
              <div key={item.hex || item.kanji} className="flex flex-col items-center gap-1">
                <Link
                  href={getKanjiLink(item.kanji)}
                  className="w-14 h-14 flex items-center justify-center text-2xl font-medium border border-border rounded-xl bg-card hover:bg-secondary transition-colors"
                >
                  {item.kanji}
                </Link>
                <span className="text-xs text-foreground font-medium">{rank}位</span>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">読み込み中...</p>
      )}

      {/* CTAリンク */}
      <div className="text-center mt-6">
        <Link
          href="/ranking"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-amber-500 hover:bg-amber-600 text-white font-medium transition-colors"
        >
          <span>👑</span>
          <span>1〜3位はこちら → 人気の漢字ランキングを見る</span>
        </Link>
      </div>
    </section>
  );
}

