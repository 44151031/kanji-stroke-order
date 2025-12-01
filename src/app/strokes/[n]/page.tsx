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

// 存在する画数のみ生成
export async function generateStaticParams() {
  const dictionary = loadKanjiDictionary();
  const strokes = [...new Set(dictionary.map((k) => k.strokes))];
  return strokes.map((n) => ({ n: n.toString() }));
}

type Props = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  
  const title = `${n}画の漢字一覧｜書き順・筆順`;
  const description = `${n}画の漢字の書き順をアニメーションで学習できます。`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function StrokesPage({ params }: Props) {
  const { n } = await params;
  const strokes = parseInt(n, 10);
  
  if (isNaN(strokes) || strokes < 1 || strokes > 30) {
    notFound();
  }

  const dictionary = loadKanjiDictionary();
  const strokeKanji = dictionary.filter((k) => k.strokes === strokes);
  
  if (strokeKanji.length === 0) {
    notFound();
  }

  // 学年順にソート
  const byGrade = [...strokeKanji].sort((a, b) => a.grade - b.grade);
  // 使用頻度順
  const byFreq = [...strokeKanji].sort((a, b) => (a.freq || 9999) - (b.freq || 9999));

  // 全画数のリスト
  const allStrokes = [...new Set(dictionary.map((k) => k.strokes))].sort((a, b) => a - b);

  return (
    <div className="flex flex-col items-center gap-8">
      {/* パンくず */}
      <nav className="w-full text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">トップ</Link></li>
          <li>/</li>
          <li className="text-foreground">{strokes}画</li>
        </ol>
      </nav>

      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">{strokes}画の漢字</h1>
        <p className="text-muted-foreground">{strokeKanji.length}字</p>
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
                title={`${k.kanji} - ${k.on[0] || k.kun[0] || ""} (${k.grade <= 6 ? `小${k.grade}` : "中学"})`}
              >
                {k.kanji}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 使用頻度順（上位） */}
      {byFreq.length > 20 && (
        <Card className="w-full max-w-4xl rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">よく使う漢字（使用頻度順）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-center">
              {byFreq.slice(0, 30).map((k) => (
                <Link
                  key={k.kanji}
                  href={`/kanji/${encodeURIComponent(k.kanji)}`}
                  className="w-12 h-12 flex items-center justify-center text-2xl border border-border rounded-lg hover:bg-secondary transition-colors"
                  title={`${k.kanji} - ${k.on[0] || k.kun[0] || ""}`}
                >
                  {k.kanji}
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 他の画数へのリンク */}
      <Card className="w-full max-w-4xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">画数で探す</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center">
            {allStrokes.map((s) => {
              const count = dictionary.filter((k) => k.strokes === s).length;
              return (
                <Link
                  key={s}
                  href={`/strokes/${s}`}
                  className={`w-12 h-12 flex flex-col items-center justify-center rounded-lg border text-sm transition-colors ${
                    s === strokes
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  }`}
                  title={`${s}画（${count}字）`}
                >
                  <span className="font-medium">{s}</span>
                  <span className="text-xs opacity-70">{count}</span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 関連リンク */}
      <div className="flex gap-4 text-sm">
        <Link href="/grade/1" className="text-muted-foreground hover:text-foreground">
          学年別一覧 →
        </Link>
        <Link href="/bushu" className="text-muted-foreground hover:text-foreground">
          部首別一覧 →
        </Link>
      </div>
    </div>
  );
}
