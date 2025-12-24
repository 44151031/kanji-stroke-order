import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKanjiLink } from "@/lib/linkUtils";
import Breadcrumb from "@/components/common/Breadcrumb";
import { generatePageMetadata } from "@/lib/metadata";
import fs from "fs";
import path from "path";

export const metadata: Metadata = generatePageMetadata({
  title: "難読・稀少漢字一覧",
  description: "読みにくい、使用頻度が低い難読・稀少漢字の一覧。表外漢字の中でも特に特殊な漢字の書き順・読み方・意味を学習できます。",
  path: "/kanji/rare",
});

interface KanjiDetail {
  kanji: string;
  on: string[];
  kun: string[];
  meaning: string[];
  strokes: number;
  ucsHex: string;
  isRare?: boolean;
  hasStrokeData?: boolean;
}

function loadKanjiDictionary(): KanjiDetail[] {
  const dictPath = path.join(process.cwd(), "data", "kanji-dictionary.json");
  if (!fs.existsSync(dictPath)) return [];
  return JSON.parse(fs.readFileSync(dictPath, "utf-8"));
}

function loadExtraKanji(): KanjiDetail[] {
  // 仮のデータ（実際のデータ構造に合わせて調整が必要）
  // ここでは isRare フラグを持つ漢字をフィルタ
  const dictionary = loadKanjiDictionary();
  return dictionary.filter((k) => (k as any).isRare === true);
}

export default async function RareKanjiPage() {
  const rareKanji = loadExtraKanji();

  // 画数順にソート
  rareKanji.sort((a, b) => a.strokes - b.strokes);

  const gradeLabel = (kanji: KanjiDetail) => {
    // 表外漢字は学年がない場合が多い
    return "";
  };

  return (
    <main className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      <Breadcrumb
        items={[
          { label: "トップ", href: "/" },
          { label: "表外漢字一覧", href: "/kanji/extra" },
          { label: "難読・稀少漢字一覧" },
        ]}
      />

      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">🔍 難読・稀少漢字一覧</h1>
        <p className="text-muted-foreground max-w-xl">
          読みにくい、使用頻度が低い難読・稀少漢字の一覧です。表外漢字の中でも特に特殊な漢字の書き順・読み方・意味を学習できます。
        </p>
        <p className="text-sm text-muted-foreground mt-2">{rareKanji.length}字</p>
      </header>

      {/* 漢字カードグリッド（既存UIを流用） */}
      <Card className="w-full max-w-6xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">漢字一覧</CardTitle>
        </CardHeader>
        <CardContent>
          {rareKanji.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              難読・稀少漢字のデータがまだ登録されていません。
            </p>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {rareKanji.map((k) => (
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
                    <span className="block px-1 py-0.5 bg-blue-100 text-blue-700 rounded text-[10px]">
                      難読
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
            <Link href="/kanji/name" className="text-muted-foreground hover:text-foreground transition-colors">
              人名漢字一覧 →
            </Link>
            <Link href="/kanji/classical" className="text-muted-foreground hover:text-foreground transition-colors">
              古典・文語漢字一覧 →
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

