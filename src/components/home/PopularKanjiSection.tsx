// C:\xampp\htdocs\kanji-stroke-order\src\components\home\PopularKanjiSection.tsx
import Link from "next/link";
import { createClient } from "@supabase/supabase-js";
import { getKanjiLink } from "@/lib/linkUtils";
import fallbackRanking from "@/data/fallbackRanking.json";

interface RankingItem {
  kanji: string;
  hex: string;
  rank: number;
}

/**
 * ISR: 1週間に1回だけSupabaseから再取得（他はキャッシュ）
 */
export const revalidate = 604800; // ← 7日間（1週間）に1回だけ再生成

async function getPopularRanking(): Promise<RankingItem[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.log("📦 Supabase未設定のためフォールバックデータを使用");
    return fallbackRanking.slice(3, 11).map((item, index) => ({
      kanji: item.kanji,
      hex: item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
      rank: index + 4,
    }));
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // kanji_viewsテーブルから閲覧数順で取得（/rankingページと同じデータソース）
    // 4位〜11位を表示するため、11件取得して最初の3件をスキップ
    const { data, error } = await supabase
      .from("kanji_views")
      .select("kanji, views")
      .order("views", { ascending: false })
      .limit(11);

    if (error || !data || data.length === 0) {
      console.warn("⚠️ kanji_views取得失敗 → fallbackデータ使用:", error?.message);
      return fallbackRanking.slice(3, 11).map((item, index) => ({
        kanji: item.kanji,
        hex: item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
        rank: index + 4,
      }));
    }

    // 4位〜11位（index 3〜10）を取得
    const rankedData = data.slice(3, 11);

    return rankedData.map((item, index) => ({
      kanji: item.kanji,
      hex: item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
      rank: index + 4, // 4位から開始
    }));
  } catch (err) {
    console.error("❌ Error loading ranking:", err);
    return fallbackRanking.slice(3, 11).map((item, index) => ({
      kanji: item.kanji,
      hex: item.kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0") || "",
      rank: index + 4,
    }));
  }
}

export default async function PopularKanjiSection() {
  const ranking = await getPopularRanking();

  return (
    <section className="w-full max-w-3xl">
      <h2 className="text-xl font-medium mb-4 text-center">🏆 漢字書き順ナビで人気の漢字</h2>
      <p className="text-sm text-muted-foreground mb-6 text-center">
        多くの人が書き順が気になっている、人気の漢字を紹介しています。
        <br />
        1〜3位の漢字は別ページでランキング形式で紹介しています。
      </p>

      {ranking.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-3">
          {ranking.map((item) => (
            <div key={item.hex || item.kanji} className="flex flex-col items-center gap-1">
              <Link
                href={getKanjiLink(item.kanji)}
                className="w-14 h-14 flex items-center justify-center text-2xl font-medium border border-border rounded-xl bg-card hover:bg-secondary transition-colors"
              >
                {item.kanji}
              </Link>
              <span className="text-xs text-foreground font-medium">
                {item.rank}位
              </span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-muted-foreground">読み込み中...</p>
      )}

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
