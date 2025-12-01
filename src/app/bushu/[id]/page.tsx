import { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KanjiDetail {
  kanji: string;
  on: string[];
  kun: string[];
  meaning: string[];
  jlpt: string | null;
  strokes: number;
  grade: number;
  ucsHex: string;
  freq?: number;
  radicals: string[];
}

function loadKanjiDictionary(): KanjiDetail[] {
  const dictPath = path.join(process.cwd(), "data", "kanji-dictionary.json");
  if (!fs.existsSync(dictPath)) return [];
  return JSON.parse(fs.readFileSync(dictPath, "utf-8"));
}

// 存在する部首のみ生成
export async function generateStaticParams() {
  const dictionary = loadKanjiDictionary();
  const radicals = new Set<string>();
  dictionary.forEach((k) => k.radicals.forEach((r) => radicals.add(r)));
  return Array.from(radicals).map((id) => ({ id }));
}

type Props = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const radical = decodeURIComponent(id);
  
  const title = `部首「${radical}」の漢字一覧｜書き順・筆順`;
  const description = `部首「${radical}」を含む漢字の書き順をアニメーションで学習できます。`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function BushuPage({ params }: Props) {
  const { id } = await params;
  const radical = decodeURIComponent(id);
  
  const dictionary = loadKanjiDictionary();
  const radicalKanji = dictionary.filter((k) => k.radicals.includes(radical));
  
  if (radicalKanji.length === 0) {
    notFound();
  }

  // 学年順にソート
  const byGrade = [...radicalKanji].sort((a, b) => {
    if (a.grade !== b.grade) return a.grade - b.grade;
    return a.strokes - b.strokes;
  });

  // 画数順
  const byStrokes = [...radicalKanji].sort((a, b) => a.strokes - b.strokes);

  // 関連部首（同じ漢字に含まれる他の部首）
  const relatedRadicals = new Map<string, number>();
  radicalKanji.forEach((k) => {
    k.radicals.forEach((r) => {
      if (r !== radical) {
        relatedRadicals.set(r, (relatedRadicals.get(r) || 0) + 1);
      }
    });
  });
  const topRelated = Array.from(relatedRadicals.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* パンくず */}
      <nav className="w-full text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">トップ</Link></li>
          <li>/</li>
          <li><Link href="/bushu" className="hover:text-foreground">部首別一覧</Link></li>
          <li>/</li>
          <li className="text-foreground">{radical}</li>
        </ol>
      </nav>

      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">部首「{radical}」の漢字</h1>
        <p className="text-muted-foreground">{radicalKanji.length}字</p>
      </header>

      {/* 漢字一覧（学年順） */}
      <Card className="w-full max-w-4xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">漢字一覧（学年順）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center">
            {byGrade.map((k) => (
              <Link
                key={k.kanji}
                href={`/kanji/${encodeURIComponent(k.kanji)}`}
                className="w-12 h-12 flex items-center justify-center text-2xl border border-border rounded-lg hover:bg-secondary transition-colors"
                title={`${k.kanji} (${k.strokes}画) - ${k.on[0] || k.kun[0] || ""}`}
              >
                {k.kanji}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 画数順 */}
      {radicalKanji.length > 20 && (
        <Card className="w-full max-w-4xl rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">画数順</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-center">
              {byStrokes.map((k) => (
                <Link
                  key={k.kanji}
                  href={`/kanji/${encodeURIComponent(k.kanji)}`}
                  className="w-12 h-12 flex items-center justify-center text-2xl border border-border rounded-lg hover:bg-secondary transition-colors"
                  title={`${k.kanji} (${k.strokes}画)`}
                >
                  {k.kanji}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 関連する部首 */}
      {topRelated.length > 0 && (
        <Card className="w-full max-w-4xl rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">関連する部首</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-center">
              {topRelated.map(([r, count]) => (
                <Link
                  key={r}
                  href={`/bushu/${encodeURIComponent(r)}`}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  {r}（{count}）
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 関連リンク */}
      <div className="flex gap-4 text-sm">
        <Link href="/bushu" className="text-muted-foreground hover:text-foreground">
          ← 部首一覧に戻る
        </Link>
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

