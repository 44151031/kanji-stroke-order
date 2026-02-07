import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKanjiLink } from "@/lib/linkUtils";
import Breadcrumb from "@/components/common/Breadcrumb";
import RelatedLinks from "@/components/common/RelatedLinks";
import { generatePageMetadata } from "@/lib/metadata";

// ISR設定：7日間キャッシュ（似ている漢字リストは静的）
export const revalidate = 604800; // 7日

interface ConfusedPair {
  kanjiA: string;
  kanjiB: string;
  reason: string;
  note: string;
}

function loadConfusedPairs(): ConfusedPair[] {
  const filePath = path.join(process.cwd(), "data", "confused_kanji_pairs.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export const metadata: Metadata = generatePageMetadata({
  path: "/confused-kanji",
});

export default function ConfusedKanjiPage() {
  const pairs = loadConfusedPairs();

  // 理由別にグループ化
  const groupedByReason = pairs.reduce((acc, pair) => {
    const key = pair.reason;
    if (!acc[key]) acc[key] = [];
    acc[key].push(pair);
    return acc;
  }, {} as Record<string, ConfusedPair[]>);

  return (
    <main className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "トップ", href: "/" },
          { label: "似ている漢字" },
        ]}
      />

      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">🔄 似ている漢字一覧</h1>
        <p className="text-muted-foreground max-w-xl">
          形が似ていて混同しやすい漢字をペアで紹介。違いと見分け方を確認できます。
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          全{pairs.length}ペア収録
        </p>
      </header>

      {/* テーブル表示（PC）・カード表示（スマホ） */}
      <Card className="w-full max-w-5xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">漢字ペア一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {/* PC表示: テーブル */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="border border-border p-3 text-center w-20">漢字A</th>
                  <th className="border border-border p-3 text-center w-20">漢字B</th>
                  <th className="border border-border p-3 text-center w-32">混同の理由</th>
                  <th className="border border-border p-3 text-left">見分け方・備考</th>
                </tr>
              </thead>
              <tbody>
                {pairs.map((pair, i) => (
                  <tr key={i} className="hover:bg-muted/30 transition-colors">
                    <td className="border border-border p-3 text-center">
                      <Link 
                        href={getKanjiLink(pair.kanjiA)}
                        className="text-3xl hover:text-primary transition-colors"
                      >
                        {pair.kanjiA}
                      </Link>
                    </td>
                    <td className="border border-border p-3 text-center">
                      <Link 
                        href={getKanjiLink(pair.kanjiB)}
                        className="text-3xl hover:text-primary transition-colors"
                      >
                        {pair.kanjiB}
                      </Link>
                    </td>
                    <td className="border border-border p-3 text-center">
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                        {pair.reason}
                      </span>
                    </td>
                    <td className="border border-border p-3 text-muted-foreground">
                      {pair.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* スマホ表示: カード */}
          <div className="md:hidden space-y-4">
            {pairs.map((pair, i) => (
              <div
                key={i}
                className="border border-border rounded-lg p-4 bg-white hover:bg-muted/30 transition-colors"
              >
                {/* 漢字ペア */}
                <div className="flex items-center justify-center gap-4 mb-3">
                  <Link 
                    href={getKanjiLink(pair.kanjiA)}
                    className="text-4xl font-bold hover:text-primary transition-colors"
                  >
                    {pair.kanjiA}
                  </Link>
                  <span className="text-2xl text-muted-foreground">↔</span>
                  <Link 
                    href={getKanjiLink(pair.kanjiB)}
                    className="text-4xl font-bold hover:text-primary transition-colors"
                  >
                    {pair.kanjiB}
                  </Link>
                </div>

                {/* 混同の理由 */}
                <div className="text-center mb-3">
                  <span className="inline-block px-3 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {pair.reason}
                  </span>
                </div>

                {/* 見分け方・備考 */}
                <div className="text-sm text-muted-foreground leading-relaxed text-center">
                  {pair.note}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 理由別グループ表示 */}
      <section className="w-full max-w-5xl">
        <h2 className="text-xl font-bold mb-4 text-center">混同理由別</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(groupedByReason).map(([reason, pairList]) => (
            <Card key={reason} className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                    {reason}
                  </span>
                  <span className="text-muted-foreground">({pairList.length}組)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {pairList.map((pair, i) => (
                    <div key={i} className="flex items-center gap-1 text-lg">
                      <Link 
                        href={getKanjiLink(pair.kanjiA)}
                        className="hover:text-primary"
                      >
                        {pair.kanjiA}
                      </Link>
                      <span className="text-muted-foreground text-sm">↔</span>
                      <Link 
                        href={getKanjiLink(pair.kanjiB)}
                        className="hover:text-primary"
                      >
                        {pair.kanjiB}
                      </Link>
                      {i < pairList.length - 1 && <span className="text-muted-foreground mx-1">|</span>}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 関連リンク */}
      <RelatedLinks
        links={[
          { label: "間違えやすい漢字（同音異義語） →", href: "/mistake-kanji" },
          { label: "学年別一覧 →", href: "/grade/1" },
        ]}
        className="flex gap-4 text-sm"
      />
    </main>
  );
}
