import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKanjiLink } from "@/lib/linkUtils";
import Breadcrumb from "@/components/common/Breadcrumb";
import RelatedLinks from "@/components/common/RelatedLinks";

interface MistakePair {
  kanjiA: string;
  kanjiB: string;
  reason: string;
  note: string;
}

function loadMistakePairs(): MistakePair[] {
  const filePath = path.join(process.cwd(), "data", "mistake_kanji_pairs.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export const metadata: Metadata = {
  title: "間違えやすい漢字一覧 | 同音異義語の使い分け",
  description: "同音異義語で間違えやすい漢字をペアで紹介。「異常」と「以上」、「会う」と「合う」など、読みが同じで意味が違う漢字の使い分けを一覧で確認できます。",
  keywords: ["間違えやすい漢字", "同音異義語", "漢字の使い分け", "書き間違い", "読み間違い", "漢字ペア"],
  openGraph: {
    title: "間違えやすい漢字一覧 | 同音異義語の使い分け",
    description: "同音異義語で間違えやすい漢字をペアで紹介。使い分けを確認できます。",
    type: "website",
  },
};

export default function MistakeKanjiPage() {
  const pairs = loadMistakePairs();

  // 読み（理由）別にグループ化
  const groupedByReading = pairs.reduce((acc, pair) => {
    // 「同音（い）」から「い」を抽出
    const match = pair.reason.match(/（(.+?)）/);
    const reading = match ? match[1] : pair.reason;
    if (!acc[reading]) acc[reading] = [];
    acc[reading].push(pair);
    return acc;
  }, {} as Record<string, MistakePair[]>);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "トップ", href: "/" },
          { label: "間違えやすい漢字" },
        ]}
      />

      <header className="text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-4xl font-bold mb-2">間違えやすい漢字一覧</h1>
        <p className="text-muted-foreground max-w-xl">
          同音異義語で間違えやすい漢字をペアで紹介。正しい使い分けを確認できます。
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          全{pairs.length}ペア収録
        </p>
      </header>

      {/* テーブル表示 */}
      <Card className="w-full max-w-5xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">同音異義語ペア一覧</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="border border-border p-3 text-center w-20">漢字A</th>
                <th className="border border-border p-3 text-center w-20">漢字B</th>
                <th className="border border-border p-3 text-center w-32">読み</th>
                <th className="border border-border p-3 text-left">使い分けの例</th>
                <th className="border border-border p-3 text-center w-32">詳細</th>
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
                    <span className="inline-block px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs">
                      {pair.reason}
                    </span>
                  </td>
                  <td className="border border-border p-3 text-muted-foreground">
                    {pair.note}
                  </td>
                  <td className="border border-border p-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Link 
                        href={getKanjiLink(pair.kanjiA)}
                        className="text-blue-600 hover:underline"
                      >
                        {pair.kanjiA}
                      </Link>
                      <span className="text-muted-foreground">↔</span>
                      <Link 
                        href={getKanjiLink(pair.kanjiB)}
                        className="text-blue-600 hover:underline"
                      >
                        {pair.kanjiB}
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* 読み別グループ表示 */}
      <section className="w-full max-w-5xl">
        <h2 className="text-xl font-bold mb-4 text-center">読み別グループ</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Object.entries(groupedByReading)
            .sort((a, b) => b[1].length - a[1].length) // 多い順
            .map(([reading, pairList]) => (
            <Card key={reading} className="rounded-xl">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full font-bold">
                    {reading}
                  </span>
                  <span className="text-muted-foreground text-xs">({pairList.length}組)</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {pairList.map((pair, i) => (
                    <div key={i} className="flex items-center gap-1 text-xl">
                      <Link 
                        href={getKanjiLink(pair.kanjiA)}
                        className="hover:text-primary"
                      >
                        {pair.kanjiA}
                      </Link>
                      <span className="text-muted-foreground text-sm">·</span>
                      <Link 
                        href={getKanjiLink(pair.kanjiB)}
                        className="hover:text-primary"
                      >
                        {pair.kanjiB}
                      </Link>
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
          { label: "似ている漢字（形が似ている） →", href: "/confused-kanji" },
          { label: "学年別一覧 →", href: "/grade/1" },
        ]}
        className="flex gap-4 text-sm"
      />
    </div>
  );
}
