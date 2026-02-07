import { Metadata } from "next";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/lib/supabaseClient";

export const metadata: Metadata = {
  title: "アクセス分析 | 漢字書き順ナビ",
  robots: { index: false, follow: false }, // 検索エンジンに非表示
};

// リアルタイムデータ取得のため、キャッシュなし
export const revalidate = 0;

async function getAnalyticsData() {
  try {
    // 人気漢字TOP10
    const { data: topKanji, error: topError } = await supabase
      .from("kanji_views")
      .select("kanji, views")
      .order("views", { ascending: false })
      .limit(10);

    // 総閲覧数
    const { data: totalData, error: totalError } = await supabase
      .from("kanji_views")
      .select("views");

    const totalViews = totalData?.reduce((sum, item) => sum + item.views, 0) || 0;

    // 練習テスト数
    const { count: practiceCount, error: practiceError } = await supabase
      .from("stroke_tests")
      .select("*", { count: "exact", head: true });

    return {
      topKanji: topKanji || [],
      totalViews,
      practiceCount: practiceCount || 0,
      errors: [topError, totalError, practiceError].filter(Boolean),
    };
  } catch (error) {
    console.error("Analytics fetch error:", error);
    return {
      topKanji: [],
      totalViews: 0,
      practiceCount: 0,
      errors: [error],
    };
  }
}

export default async function AnalyticsPage() {
  const { topKanji, totalViews, practiceCount, errors } = await getAnalyticsData();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-3xl font-bold">アクセス分析</h1>
        <p className="text-muted-foreground mt-2">
          Supabaseデータベースから取得したリアルタイム統計
        </p>
      </header>

      {errors.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-yellow-800">⚠️ データ取得エラー</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-700">
              Supabaseへの接続に失敗しました。環境変数を確認してください。
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 総閲覧数 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">総閲覧数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalViews.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">全漢字ページ合計</p>
          </CardContent>
        </Card>

        {/* ユニーク漢字数 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">閲覧された漢字</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{topKanji.length > 0 ? topKanji.length : "N/A"}</div>
            <p className="text-xs text-muted-foreground mt-1">ユニーク漢字数</p>
          </CardContent>
        </Card>

        {/* 練習テスト実施数 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">書き取りテスト</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{practiceCount.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground mt-1">実施回数</p>
          </CardContent>
        </Card>
      </div>

      {/* 人気漢字TOP10 */}
      <Card>
        <CardHeader>
          <CardTitle>人気漢字 TOP10</CardTitle>
        </CardHeader>
        <CardContent>
          {topKanji.length === 0 ? (
            <p className="text-muted-foreground">データがありません</p>
          ) : (
            <div className="space-y-2">
              {topKanji.map((item, index) => (
                <div
                  key={item.kanji}
                  className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground w-8">
                      {index + 1}
                    </span>
                    <span className="text-4xl font-bold">{item.kanji}</span>
                  </div>
                  <span className="text-lg font-semibold">
                    {item.views.toLocaleString()} views
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 使用方法 */}
      <Card>
        <CardHeader>
          <CardTitle>📊 詳細分析ツール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-semibold mb-2">Google Analytics 4</h3>
            <a
              href="https://analytics.google.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              → analytics.google.com で詳細分析
            </a>
            <p className="text-sm text-muted-foreground mt-1">
              測定ID: G-H99ZWGWW4E
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Vercel Analytics</h3>
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              → vercel.com/dashboard でキャッシュ分析
            </a>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Supabase SQL Editor</h3>
            <a
              href="https://app.supabase.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline text-sm"
            >
              → app.supabase.com でカスタムクエリ実行
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
