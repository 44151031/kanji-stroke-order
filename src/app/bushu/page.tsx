import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KanjiDetail {
  kanji: string;
  radicals: string[];
}

function loadKanjiDictionary(): KanjiDetail[] {
  const dictPath = path.join(process.cwd(), "data", "kanji-dictionary.json");
  if (!fs.existsSync(dictPath)) return [];
  return JSON.parse(fs.readFileSync(dictPath, "utf-8"));
}

export const metadata: Metadata = {
  title: "部首別漢字一覧｜書き順・筆順",
  description: "部首別に漢字を探せます。各部首の漢字の書き順をアニメーションで学習できます。",
};

export default function BushuIndexPage() {
  const dictionary = loadKanjiDictionary();
  
  // 部首ごとの漢字数をカウント
  const radicalCounts: Record<string, number> = {};
  dictionary.forEach((k) => {
    k.radicals.forEach((r) => {
      radicalCounts[r] = (radicalCounts[r] || 0) + 1;
    });
  });

  // 漢字数順にソート
  const sortedRadicals = Object.entries(radicalCounts)
    .sort((a, b) => b[1] - a[1]);

  // 多い部首（20字以上）
  const majorRadicals = sortedRadicals.filter(([, count]) => count >= 20);
  // その他
  const minorRadicals = sortedRadicals.filter(([, count]) => count < 20 && count >= 5);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* パンくず */}
      <nav className="w-full text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">トップ</Link></li>
          <li>/</li>
          <li className="text-foreground">部首別一覧</li>
        </ol>
      </nav>

      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">部首別漢字一覧</h1>
        <p className="text-muted-foreground">{sortedRadicals.length}種類の部首</p>
      </header>

      {/* 主要な部首 */}
      <Card className="w-full max-w-4xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">主要な部首（20字以上）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {majorRadicals.map(([radical, count]) => (
              <Link
                key={radical}
                href={`/bushu/${encodeURIComponent(radical)}`}
                className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-secondary transition-colors"
              >
                <span className="font-medium">{radical}</span>
                <span className="text-sm text-muted-foreground">{count}字</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* その他の部首 */}
      {minorRadicals.length > 0 && (
        <Card className="w-full max-w-4xl rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">その他の部首（5〜19字）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {minorRadicals.map(([radical, count]) => (
                <Link
                  key={radical}
                  href={`/bushu/${encodeURIComponent(radical)}`}
                  className="px-3 py-1 border border-border rounded-full hover:bg-secondary transition-colors text-sm"
                >
                  {radical}（{count}）
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 関連リンク */}
      <div className="flex gap-4 text-sm">
        <Link href="/grade/1" className="text-muted-foreground hover:text-foreground">
          学年別一覧 →
        </Link>
        <Link href="/strokes/1" className="text-muted-foreground hover:text-foreground">
          画数別一覧 →
        </Link>
      </div>
    </div>
  );
}

