import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKanjiLink } from "@/lib/linkUtils";
import Breadcrumb from "@/components/common/Breadcrumb";
import { generatePageMetadata } from "@/lib/metadata";
import { getExtraKanji } from "@/lib/kanji/getExtraKanji";
import { filterKanjiByCategory, type KanjiDetail } from "@/lib/getKanjiWithMeta";

export const metadata: Metadata = generatePageMetadata({
  title: "古典・文語漢字一覧",
  description: "古文・漢文で使われる古典・文語漢字の一覧。表外漢字の中でも古典文学で見かける漢字の書き順・読み方・意味を学習できます。",
  path: "/kanji/classical",
});

export default async function ClassicalKanjiPage() {
  // 書き順SVGが存在する表外漢字のみを取得
  const allExtraKanji = getExtraKanji();
  
  // 古典・文語漢字をフィルタ（isClassical === true）
  const classicalKanji = filterKanjiByCategory(allExtraKanji, {
    isClassical: true,
  });

  // 画数順にソート
  classicalKanji.sort((a, b) => a.strokes - b.strokes);

  return (
    <main className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: "トップ", href: "/" },
          { label: "表外漢字一覧", href: "/kanji/extra" },
          { label: "古典・文語漢字一覧" },
        ]}
      />

      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">📜 古典・文語漢字一覧</h1>
        <p className="text-muted-foreground max-w-xl">
          古文・漢文で使われる古典・文語漢字の一覧です。表外漢字の中でも古典文学で見かける漢字の書き順・読み方・意味を学習できます。
        </p>
        <p className="text-sm text-muted-foreground mt-2">{classicalKanji.length}字</p>
      </header>

      {/* 漢字カードグリッド（既存UIを流用） */}
      <Card className="w-full max-w-6xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">漢字一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {classicalKanji.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              古典・文語漢字のデータがまだ登録されていません。
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {classicalKanji.map((k) => (
                <Link
                  key={k.kanji}
                  href={getKanjiLink(k.kanji)}
                  className="flex flex-col items-center p-3 border border-border rounded-xl hover:bg-secondary hover:shadow-md transition-all group"
                >
                  <span className="text-3xl font-bold group-hover:scale-110 transition-transform">
                    {k.kanji}
                  </span>
                  <div className="mt-1 text-xs text-muted-foreground text-center space-y-0.5">
                    <span className="block">{k.strokes}画</span>
                    <span className="block px-1 py-0.5 bg-amber-100 text-amber-700 rounded text-[10px]">
                      古典
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 関連リンク */}
      <Card className="w-full max-w-2xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">関連ページ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 text-sm">
            <Link href="/kanji/extra" className="text-muted-foreground hover:text-foreground transition-colors">
              表外漢字一覧へ →
            </Link>
            <Link href="/kanji/rare" className="text-muted-foreground hover:text-foreground transition-colors">
              難読・稀少漢字一覧 →
            </Link>
            <Link href="/kanji/name" className="text-muted-foreground hover:text-foreground transition-colors">
              人名漢字一覧 →
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              トップページ →
            </Link>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

