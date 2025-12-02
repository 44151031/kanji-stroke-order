import { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKanjiLink } from "@/lib/linkUtils";

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

const GRADE_INFO: Record<number, { label: string; description: string }> = {
  1: { label: "小学1年生", description: "小学校1年生で習う漢字（80字）" },
  2: { label: "小学2年生", description: "小学校2年生で習う漢字（160字）" },
  3: { label: "小学3年生", description: "小学校3年生で習う漢字（200字）" },
  4: { label: "小学4年生", description: "小学校4年生で習う漢字（200字）" },
  5: { label: "小学5年生", description: "小学校5年生で習う漢字（185字）" },
  6: { label: "小学6年生", description: "小学校6年生で習う漢字（181字）" },
  8: { label: "中学校", description: "中学校で習う漢字（1130字）" },
};

// 存在する学年のみ生成
export async function generateStaticParams() {
  const dictionary = loadKanjiDictionary();
  const grades = [...new Set(dictionary.map((k) => k.grade))];
  return grades.map((n) => ({ n: n.toString() }));
}

type Props = { params: Promise<{ n: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { n } = await params;
  const grade = parseInt(n, 10);
  const info = GRADE_INFO[grade];
  
  if (!info) {
    return { title: "学年別漢字一覧" };
  }

  const title = `${info.label}で習う漢字一覧｜書き順・筆順`;
  const description = `${info.description}の書き順をアニメーションで学習できます。`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function GradePage({ params }: Props) {
  const { n } = await params;
  const grade = parseInt(n, 10);
  
  const info = GRADE_INFO[grade];
  if (!info) {
    notFound();
  }

  const dictionary = loadKanjiDictionary();
  const gradeKanji = dictionary.filter((k) => k.grade === grade);
  
  if (gradeKanji.length === 0) {
    notFound();
  }

  // ソートオプション用にコピー
  const byStrokes = [...gradeKanji].sort((a, b) => a.strokes - b.strokes);
  const byFreq = [...gradeKanji].sort((a, b) => (a.freq || 9999) - (b.freq || 9999));

  return (
    <div className="flex flex-col items-center gap-8">
      {/* パンくず */}
      <nav className="w-full text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">トップ</Link></li>
          <li>/</li>
          <li className="text-foreground">{info.label}</li>
        </ol>
      </nav>

      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">{info.label}で習う漢字</h1>
        <p className="text-muted-foreground">{gradeKanji.length}字</p>
      </header>

      {/* 漢字一覧（画数順） */}
      <Card className="w-full max-w-4xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">漢字一覧（画数順）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center">
            {byStrokes.map((k) => (
              <Link
                key={k.kanji}
                href={getKanjiLink(k.kanji)}
                className="w-12 h-12 flex items-center justify-center text-2xl border border-border rounded-lg hover:bg-secondary transition-colors"
                title={`${k.kanji} (${k.strokes}画) - ${k.on[0] || k.kun[0] || ""}`}
              >
                {k.kanji}
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 使用頻度順 */}
      <Card className="w-full max-w-4xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">使用頻度順</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center">
            {byFreq.slice(0, 50).map((k) => (
              <Link
                key={k.kanji}
                href={getKanjiLink(k.kanji)}
                className="w-12 h-12 flex items-center justify-center text-2xl border border-border rounded-lg hover:bg-secondary transition-colors"
                title={`${k.kanji} - ${k.on[0] || k.kun[0] || ""}`}
              >
                {k.kanji}
              </Link>
            ))}
          </div>
          {byFreq.length > 50 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              上位50字を表示（全{byFreq.length}字）
            </p>
          )}
        </CardContent>
      </Card>

      {/* 他の学年へのリンク */}
      <Card className="w-full max-w-4xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">他の学年</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 justify-center">
            {Object.entries(GRADE_INFO).map(([g, { label }]) => {
              const gradeNum = parseInt(g);
              const count = dictionary.filter((k) => k.grade === gradeNum).length;
              return (
                <Link
                  key={g}
                  href={`/grade/${g}`}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    gradeNum === grade
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-secondary"
                  }`}
                >
                  {label}（{count}字）
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 関連リンク */}
      <div className="flex gap-4 text-sm">
        <Link href="/strokes/1" className="text-muted-foreground hover:text-foreground">
          画数別一覧 →
        </Link>
        <Link href="/bushu" className="text-muted-foreground hover:text-foreground">
          部首別一覧 →
        </Link>
      </div>
    </div>
  );
}
