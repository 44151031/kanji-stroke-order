import { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MasterKanji {
  kanji: string;
  meaning: string;
  on?: string[];
  kun?: string[];
  grade?: number;
  strokes?: number;
  jlpt?: string;
  category: string[];
  sources: string[];
  confusedWith?: string[];
  examples?: string[];
}

interface Props {
  params: Promise<{ type: string }>;
}

const LIST_CONFIG: Record<string, { title: string; description: string; emoji: string }> = {
  exam: {
    title: "入試頻出漢字一覧",
    description: "高校入試・大学入試で頻出の漢字をまとめました。書き順・読み方・意味を学習できます。",
    emoji: "📚",
  },
  mistake: {
    title: "間違えやすい漢字一覧",
    description: "書き間違え・読み間違えしやすい漢字をまとめました。正しい書き順と使い分けを確認できます。",
    emoji: "⚠️",
  },
  confused: {
    title: "混同しやすい漢字一覧",
    description: "形が似ていて混同しやすい漢字をまとめました。違いと見分け方を学習できます。",
    emoji: "🔄",
  },
};

function loadKanjiMaster(): MasterKanji[] {
  const masterPath = path.join(process.cwd(), "data", "kanji_master.json");
  if (!fs.existsSync(masterPath)) return [];
  return JSON.parse(fs.readFileSync(masterPath, "utf-8"));
}

export async function generateStaticParams() {
  return [
    { type: "exam" },
    { type: "mistake" },
    { type: "confused" },
  ];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type } = await params;
  const config = LIST_CONFIG[type];
  
  if (!config) {
    return { title: "漢字一覧" };
  }

  const siteUrl = "https://kanji-stroke-order.com";

  return {
    title: `${config.title}｜漢字書き順`,
    description: config.description,
    openGraph: {
      title: `${config.title}｜漢字書き順`,
      description: config.description,
      type: "website",
      url: `${siteUrl}/lists/${type}`,
    },
    alternates: {
      canonical: `${siteUrl}/lists/${type}`,
    },
  };
}

export default async function ListPage({ params }: Props) {
  const { type } = await params;
  const config = LIST_CONFIG[type];

  if (!config) {
    notFound();
  }

  const masterData = loadKanjiMaster();
  const filteredKanji = masterData.filter((k) => k.category.includes(type));

  // 学年順、画数順でソート
  filteredKanji.sort((a, b) => {
    if ((a.grade || 99) !== (b.grade || 99)) {
      return (a.grade || 99) - (b.grade || 99);
    }
    return (a.strokes || 0) - (b.strokes || 0);
  });

  const gradeLabel = (grade?: number) => {
    if (!grade) return "";
    if (grade <= 6) return `小${grade}`;
    if (grade === 8) return "中学";
    return "";
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* パンくず */}
      <nav className="w-full text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">トップ</Link></li>
          <li>/</li>
          <li className="text-foreground">{config.title}</li>
        </ol>
      </nav>

      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">
          {config.emoji} {config.title}
        </h1>
        <p className="text-muted-foreground max-w-xl">{config.description}</p>
        <p className="text-sm text-muted-foreground mt-2">{filteredKanji.length}字</p>
      </header>

      {/* 漢字カードグリッド（8列） */}
      <Card className="w-full max-w-6xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">漢字一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
            {filteredKanji.map((k) => (
              <Link
                key={k.kanji}
                href={`/kanji/${encodeURIComponent(k.kanji)}`}
                className="flex flex-col items-center p-3 border border-border rounded-xl hover:bg-secondary hover:shadow-md transition-all group"
              >
                <span className="text-3xl font-bold group-hover:scale-110 transition-transform">
                  {k.kanji}
                </span>
                <div className="mt-1 text-xs text-muted-foreground text-center space-y-0.5">
                  {k.grade && (
                    <span className="block">{gradeLabel(k.grade)}</span>
                  )}
                  {k.strokes && (
                    <span className="block">{k.strokes}画</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 混同漢字の場合は混同ペア情報 */}
      {type === "confused" && (
        <Card className="w-full max-w-6xl rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">混同しやすいペア</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredKanji
                .filter((k) => k.confusedWith && k.confusedWith.length > 0)
                .slice(0, 30)
                .map((k) => (
                  <div
                    key={k.kanji}
                    className="flex items-center gap-3 p-3 border border-border rounded-lg"
                  >
                    <Link
                      href={`/kanji/${encodeURIComponent(k.kanji)}`}
                      className="text-2xl font-bold hover:text-primary"
                    >
                      {k.kanji}
                    </Link>
                    <span className="text-muted-foreground">⇔</span>
                    {k.confusedWith?.map((c) => (
                      <Link
                        key={c}
                        href={`/kanji/${encodeURIComponent(c)}`}
                        className="text-2xl font-bold hover:text-primary"
                      >
                        {c}
                      </Link>
                    ))}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 関連リンク */}
      <div className="flex gap-4 text-sm flex-wrap justify-center">
        {type !== "exam" && (
          <Link href="/lists/exam" className="text-muted-foreground hover:text-foreground">
            📚 入試頻出漢字 →
          </Link>
        )}
        {type !== "mistake" && (
          <Link href="/lists/mistake" className="text-muted-foreground hover:text-foreground">
            ⚠️ 間違えやすい漢字 →
          </Link>
        )}
        {type !== "confused" && (
          <Link href="/lists/confused" className="text-muted-foreground hover:text-foreground">
            🔄 混同しやすい漢字 →
          </Link>
        )}
        <Link href="/grade/1" className="text-muted-foreground hover:text-foreground">
          学年別一覧 →
        </Link>
        <Link href="/bushu" className="text-muted-foreground hover:text-foreground">
          部首別一覧 →
        </Link>
      </div>

      {/* フッター */}
      <footer className="text-center text-xs text-muted-foreground pt-8 space-y-1">
        <p>書き順データ：KanjiVG (CC BY-SA 3.0)</p>
        <p>読み・意味データ：KANJIDIC2 (© EDRDG)</p>
      </footer>
    </div>
  );
}

