import { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKanjiLink } from "@/lib/linkUtils";
import { 
  getEnglishSlug, 
  getPositionAnchor, 
  capitalize,
  getEnglishDisplayName,
  formatRadicalName 
} from "@/lib/radicalList";

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

interface RadicalBilingual {
  id: number;
  root: string;
  radical_name_en: string;
  radical_name_ja: string;
  description_en: string;
  description_ja: string;
  position?: string;
}

function loadKanjiDictionary(): KanjiDetail[] {
  const dictPath = path.join(process.cwd(), "data", "kanji-dictionary.json");
  if (!fs.existsSync(dictPath)) return [];
  return JSON.parse(fs.readFileSync(dictPath, "utf-8"));
}

function loadRadicalsBilingual(): RadicalBilingual[] {
  const radPath = path.join(process.cwd(), "data", "radicals_bilingual.json");
  if (!fs.existsSync(radPath)) return [];
  return JSON.parse(fs.readFileSync(radPath, "utf-8"));
}

function getRadicalInfo(radicalEn: string, radicals: RadicalBilingual[]): RadicalBilingual | null {
  return radicals.find((r) => r.radical_name_en === radicalEn) || null;
}

/**
 * 英語名から表示用名称を抽出（大文字始まり）
 */
function getDisplayEnglish(enName: string): string {
  // 既に大文字始まりならそのまま使用
  if (enName.charAt(0) === enName.charAt(0).toUpperCase()) {
    return enName;
  }
  // 小文字スラッグの場合はgetEnglishDisplayNameを使用
  return getEnglishDisplayName(enName);
}

// 存在する部首のみ生成
export async function generateStaticParams() {
  const dictionary = loadKanjiDictionary();
  const radicals = new Set<string>();
  dictionary.forEach((k) => k.radicals.forEach((r) => radicals.add(r)));
  return Array.from(radicals).map((slug) => ({ slug }));
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const radical = decodeURIComponent(slug);
  const radicals = loadRadicalsBilingual();
  const info = getRadicalInfo(radical, radicals);
  
  const jaName = info?.radical_name_ja || radical;
  const englishDisplay = getDisplayEnglish(radical);
  // タイトル形式: 日本語名（English）
  const title = `${jaName}（${englishDisplay}）の漢字一覧 | Kanji Stroke Order`;
  const description = info 
    ? `${info.description_en}. ${info.description_ja}。部首「${radical}」を含む漢字の書き順をアニメーションで学習できます。`
    : `Browse kanji with the ${radical} radical. 部首「${radical}」を含む漢字の書き順をアニメーションで学習できます。`;

  return {
    title,
    description,
    openGraph: { title, description },
  };
}

export default async function RadicalPage({ params }: Props) {
  const { slug } = await params;
  const radical = decodeURIComponent(slug);
  
  const dictionary = loadKanjiDictionary();
  const radicals = loadRadicalsBilingual();
  const radicalInfo = getRadicalInfo(radical, radicals);
  const radicalKanji = dictionary.filter((k) => k.radicals.includes(radical));
  
  if (radicalKanji.length === 0) {
    notFound();
  }

  // 配置タイプの英語名を取得
  const positionEn = radicalInfo?.position ? getPositionAnchor(radicalInfo.position) : "independent-radical";
  
  // 表示用の英語名（大文字始まり）
  const englishDisplay = getDisplayEnglish(radical);
  
  // 日本語名
  const jaName = radicalInfo?.radical_name_ja || radical;

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
          <li><Link href="/radical" className="hover:text-foreground">Radicals</Link></li>
          <li>/</li>
          <li className="text-foreground">{jaName}（{englishDisplay}）</li>
        </ol>
      </nav>

      {/* ヘッダー（バイリンガル表示） */}
      <header className="text-center">
        <div className="flex items-center justify-center gap-3 mb-4">
          {radicalInfo && (
            <span className="text-6xl">{radicalInfo.root}</span>
          )}
        </div>
        {/* タイトル形式: 日本語名（English） */}
        <h1 className="text-4xl font-bold mb-2">
          {jaName}（{englishDisplay}）
        </h1>
        {radicalInfo && (
          <div className="text-muted-foreground space-y-1">
            <p>Root: {radicalInfo.root} / 部首番号: {radicalInfo.id}</p>
            <p className="text-sm">
              Position: <span className="capitalize">{positionEn.replace("-radical", "")}</span>
              {radicalInfo.position && ` / ${radicalInfo.position}`}
            </p>
          </div>
        )}
        <p className="text-lg mt-2">{radicalKanji.length} kanji / {radicalKanji.length}字</p>
      </header>

      {/* 説明（日英両方） */}
      {radicalInfo && (
        <Card className="w-full max-w-2xl rounded-2xl shadow-sm bg-secondary/30">
          <CardContent className="pt-6">
            <div className="space-y-2 text-center">
              <p className="text-base">{radicalInfo.description_en}</p>
              <p className="text-sm text-muted-foreground">{radicalInfo.description_ja}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 漢字一覧（学年順） */}
      <Card className="w-full max-w-4xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Kanji List (by Grade) / 漢字一覧（学年順）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 justify-center">
            {byGrade.map((k) => (
              <Link
                key={k.kanji}
                href={getKanjiLink(k.kanji)}
                className="w-12 h-12 flex items-center justify-center text-2xl border border-border rounded-lg hover:bg-secondary transition-colors"
                title={`${k.kanji} (${k.strokes} strokes) - ${k.on[0] || k.kun[0] || ""}`}
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
            <CardTitle className="text-lg">By Stroke Count / 画数順</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-center">
              {byStrokes.map((k) => (
                <Link
                  key={k.kanji}
                  href={getKanjiLink(k.kanji)}
                  className="w-12 h-12 flex items-center justify-center text-2xl border border-border rounded-lg hover:bg-secondary transition-colors"
                  title={`${k.kanji} (${k.strokes} strokes)`}
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
            <CardTitle className="text-lg">Related Radicals / 関連する部首</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 justify-center">
              {topRelated.map(([r, count]) => {
                const relInfo = getRadicalInfo(r, radicals);
                const relJaName = relInfo?.radical_name_ja || r;
                const relEnDisplay = getDisplayEnglish(r);
                return (
                  <Link
                    key={r}
                    href={`/radical/${encodeURIComponent(r)}`}
                    className="px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                    title={relInfo?.description_en || r}
                  >
                    {relInfo?.root && <span className="mr-1">{relInfo.root}</span>}
                    {relJaName}（{relEnDisplay}）
                    <span className="text-muted-foreground ml-1">×{count}</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 関連リンク */}
      <div className="flex gap-4 text-sm flex-wrap justify-center">
        <Link href="/radical" className="text-muted-foreground hover:text-foreground">
          ← All Radicals / 部首一覧に戻る
        </Link>
        <Link href="/grade/1" className="text-muted-foreground hover:text-foreground">
          By Grade →
        </Link>
        <Link href="/strokes/1" className="text-muted-foreground hover:text-foreground">
          By Strokes →
        </Link>
      </div>
    </div>
  );
}
