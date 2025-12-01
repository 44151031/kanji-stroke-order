import { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KanjiSvgViewer from "@/components/KanjiSvgViewer";

// データ型定義
interface KanjiJoyo {
  kanji: string;
  ucsHex: string;
  grade: number;
  strokes: number;
}

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
}

interface WordEntry {
  word: string;
  reading: string;
  meaning: string;
}

// データ読み込みヘルパー
function loadKanjiJoyo(): KanjiJoyo[] {
  const joyoPath = path.join(process.cwd(), "data", "kanji-joyo.json");
  if (!fs.existsSync(joyoPath)) return [];
  return JSON.parse(fs.readFileSync(joyoPath, "utf-8"));
}

function loadKanjiDictionary(): KanjiDetail[] {
  const dictPath = path.join(process.cwd(), "data", "kanji-dictionary.json");
  if (!fs.existsSync(dictPath)) return [];
  return JSON.parse(fs.readFileSync(dictPath, "utf-8"));
}

function loadKanjiDetail(kanji: string): KanjiDetail | null {
  // まずkanji-details/[漢字].jsonを試す
  const detailPath = path.join(process.cwd(), "data", "kanji-details", `${kanji}.json`);
  if (fs.existsSync(detailPath)) {
    return JSON.parse(fs.readFileSync(detailPath, "utf-8"));
  }
  // フォールバック: kanji-dictionary.jsonから検索
  const dictionary = loadKanjiDictionary();
  return dictionary.find((k) => k.kanji === kanji) || null;
}

function loadWordsByKanji(): Record<string, WordEntry[]> {
  const wordsPath = path.join(process.cwd(), "data", "words-by-kanji.json");
  if (!fs.existsSync(wordsPath)) return {};
  return JSON.parse(fs.readFileSync(wordsPath, "utf-8"));
}

// SSG: 静的パラメータ生成（kanji-joyo.jsonから読み込み）
export async function generateStaticParams() {
  const joyoList = loadKanjiJoyo();
  return joyoList.map((k) => ({ kanji: k.kanji }));
}

// メタデータ生成（SEO最適化）
type Props = { params: Promise<{ kanji: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { kanji } = await params;
  const decodedKanji = decodeURIComponent(kanji);
  const detail = loadKanjiDetail(decodedKanji);

  const onYomi = detail?.on?.slice(0, 3).join("、") || "";
  const kunYomi = detail?.kun?.slice(0, 3).join("、") || "";
  const meanings = detail?.meaning?.slice(0, 3).join(", ") || "";
  const jlptLabel = detail?.jlpt || "";
  const gradeLabel = detail?.grade 
    ? (detail.grade <= 6 ? `小学${detail.grade}年` : "中学")
    : "";
  const strokesLabel = detail?.strokes ? `${detail.strokes}画` : "";

  // SEO最適化されたタイトル
  const title = `${decodedKanji}の書き順（筆順）｜読み方・意味・部首・画数`;
  
  // 詳細なdescription
  const descParts = [
    `${decodedKanji}の書き順（筆順）をSVGアニメで解説`,
  ];
  if (onYomi) descParts.push(`音読み：${onYomi}`);
  if (kunYomi) descParts.push(`訓読み：${kunYomi}`);
  if (meanings) descParts.push(`意味：${meanings}`);
  if (strokesLabel) descParts.push(strokesLabel);
  if (gradeLabel) descParts.push(gradeLabel);
  if (jlptLabel) descParts.push(`JLPT ${jlptLabel}`);
  
  const description = descParts.join("。") + "。";

  const siteUrl = "https://kanji-stroke-order.com";

  return {
    title,
    description,
    keywords: [
      decodedKanji,
      `${decodedKanji} 書き順`,
      `${decodedKanji} 筆順`,
      `${decodedKanji} 読み方`,
      `${decodedKanji} 意味`,
      `${decodedKanji} 画数`,
      ...(detail?.on || []),
      ...(detail?.kun || []),
    ],
    openGraph: { 
      title, 
      description,
      type: "article",
      url: `${siteUrl}/kanji/${encodeURIComponent(decodedKanji)}`,
      images: [{
        url: `${siteUrl}/api/og-kanji?k=${encodeURIComponent(decodedKanji)}`,
        width: 1200,
        height: 630,
        alt: `${decodedKanji}の書き順`,
      }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${siteUrl}/api/og-kanji?k=${encodeURIComponent(decodedKanji)}`],
    },
    alternates: {
      canonical: `${siteUrl}/kanji/${encodeURIComponent(decodedKanji)}`,
    },
  };
}

// JSON-LD 構造化データ（schema.org/DefinedTerm）
function generateJsonLd(detail: KanjiDetail, words: WordEntry[]) {
  const siteUrl = "https://kanji-stroke-order.com";
  const gradeLabel = detail.grade <= 6 ? `小学${detail.grade}年生` : "中学校";
  
  return {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${siteUrl}/kanji/${encodeURIComponent(detail.kanji)}`,
    name: detail.kanji,
    description: `${detail.kanji}の書き順・読み方・意味`,
    inDefinedTermSet: `${siteUrl}/kanji/${encodeURIComponent(detail.kanji)}`,
    termCode: `ucs:${detail.ucsHex}`,
    alternateName: [...detail.on, ...detail.kun],
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "strokes",
        value: detail.strokes,
      },
      {
        "@type": "PropertyValue",
        name: "grade",
        value: detail.grade,
      },
      ...(detail.jlpt ? [{
        "@type": "PropertyValue",
        name: "jlpt",
        value: detail.jlpt,
      }] : []),
      {
        "@type": "PropertyValue",
        name: "音読み",
        value: detail.on.join("、"),
      },
      {
        "@type": "PropertyValue",
        name: "訓読み",
        value: detail.kun.join("、"),
      },
      {
        "@type": "PropertyValue",
        name: "学年",
        value: gradeLabel,
      },
    ],
    hasPart: words.slice(0, 10).map((w) => ({
      "@type": "DefinedTerm",
      name: w.word,
      alternateName: w.reading,
      description: w.meaning,
    })),
  };
}

// 関連漢字を取得（同一学年・同一画数から決定論的に選択）
function getRelatedKanji(detail: KanjiDetail, dictionary: KanjiDetail[]): KanjiDetail[] {
  // 同一学年の漢字
  const sameGrade = dictionary.filter(
    (k) => k.grade === detail.grade && k.kanji !== detail.kanji
  );
  
  // 同一画数の漢字
  const sameStrokes = dictionary.filter(
    (k) => k.strokes === detail.strokes && k.kanji !== detail.kanji
  );
  
  // 重複を除去してマージ
  const combined = [...sameGrade, ...sameStrokes]
    .filter((k, i, arr) => arr.findIndex((x) => x.kanji === k.kanji) === i);
  
  // 頻度順にソート（決定論的）
  combined.sort((a, b) => (a.freq || 9999) - (b.freq || 9999));
  
  return combined.slice(0, 10);
}

export default async function KanjiPage({ params }: Props) {
  const { kanji } = await params;
  const decodedKanji = decodeURIComponent(kanji);
  
  // 漢字詳細を取得
  const detail = loadKanjiDetail(decodedKanji);
  
  // 詳細が見つからない場合は404
  if (!detail) {
    notFound();
  }

  // 辞書と単語リストを読み込み（エラーハンドリング付き）
  let dictionary: KanjiDetail[] = [];
  let words: WordEntry[] = [];
  
  try {
    dictionary = loadKanjiDictionary();
  } catch {
    // 辞書読み込み失敗時は空配列
  }
  
  try {
    const wordsByKanji = loadWordsByKanji();
    words = wordsByKanji[decodedKanji] || [];
  } catch {
    // 単語リスト読み込み失敗時は空配列
  }

  const relatedKanji = getRelatedKanji(detail, dictionary);
  const jsonLd = generateJsonLd(detail, words);

  const gradeLabel = detail.grade <= 6 
    ? `小学${detail.grade}年生` 
    : "中学校";

  return (
    <>
      {/* 構造化データ（JSON-LD） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <div className="flex flex-col items-center gap-8">
        {/* パンくずリスト */}
        <nav className="w-full text-sm text-muted-foreground" aria-label="パンくずリスト">
          <ol className="flex items-center gap-2 flex-wrap">
            <li><Link href="/" className="hover:text-foreground">トップ</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`/grade/${detail.grade}`} className="hover:text-foreground">{gradeLabel}</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`/strokes/${detail.strokes}`} className="hover:text-foreground">{detail.strokes}画</Link></li>
            <li aria-hidden="true">/</li>
            <li className="text-foreground font-medium" aria-current="page">{decodedKanji}</li>
          </ol>
        </nav>

        {/* ヘッダー（LCP最適化：h1は大きく） */}
        <header className="text-center">
          <h1 className="text-8xl md:text-9xl font-bold mb-4 leading-none">{decodedKanji}</h1>
          <div className="flex items-center justify-center gap-3 text-sm flex-wrap">
            <span className="px-3 py-1 bg-secondary rounded-full">{gradeLabel}</span>
            <span className="px-3 py-1 bg-secondary rounded-full">{detail.strokes}画</span>
            {detail.jlpt && (
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full font-medium">
                {detail.jlpt}
              </span>
            )}
          </div>
        </header>

        {/* 書き順SVG（LCP重視：直読み） */}
        <Card className="w-full max-w-lg rounded-2xl shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">書き順（筆順）</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <div className="w-72 h-72 md:w-80 md:h-80 border border-border rounded-xl flex items-center justify-center bg-white">
              <KanjiSvgViewer ucsHex={detail.ucsHex} kanji={decodedKanji} />
            </div>
          </CardContent>
        </Card>

        {/* 読み方・意味 */}
        <Card className="w-full max-w-lg rounded-2xl shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">読み方・意味</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">音読み（オン）</p>
                <p className="text-base md:text-lg">{detail.on.length > 0 ? detail.on.join("、") : "—"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">訓読み（くん）</p>
                <p className="text-base md:text-lg">{detail.kun.length > 0 ? detail.kun.join("、") : "—"}</p>
              </div>
            </div>
            {detail.meaning.length > 0 && (
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">意味（英語）</p>
                <p className="text-base md:text-lg">{detail.meaning.join(", ")}</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border/50">
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">画数</p>
                <p className="text-base md:text-lg">{detail.strokes}画</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">学年</p>
                <p className="text-base md:text-lg">{gradeLabel}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* この漢字を含む言葉（10件、内部リンク） */}
        {words.length > 0 && (
          <Card className="w-full max-w-lg rounded-2xl shadow-sm border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">「{decodedKanji}」を含む言葉</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {words.slice(0, 10).map((w, i) => (
                  <li key={i} className="flex justify-between items-center border-b border-border/50 pb-2 last:border-0">
                    <Link 
                      href={`/search?q=${encodeURIComponent(w.word)}`} 
                      className="hover:text-primary transition-colors"
                    >
                      <span className="font-medium text-base md:text-lg">{w.word}</span>
                      <span className="text-muted-foreground ml-2 text-sm">({w.reading})</span>
                    </Link>
                    <span className="text-sm text-muted-foreground hidden md:inline">{w.meaning}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* 関連漢字（同一学年・同一画数） */}
        {relatedKanji.length > 0 && (
          <Card className="w-full max-w-lg rounded-2xl shadow-sm border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">関連する漢字</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-center">
                {relatedKanji.map((k) => (
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
              <div className="flex justify-center gap-4 mt-4 text-sm flex-wrap">
                <Link 
                  href={`/grade/${detail.grade}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {gradeLabel}の漢字 →
                </Link>
                <Link 
                  href={`/strokes/${detail.strokes}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {detail.strokes}画の漢字 →
                </Link>
              </div>
            </CardContent>
          </Card>
        )}

        {/* フッター */}
        <footer className="text-center text-xs text-muted-foreground pt-8 space-y-1">
          <p>書き順データ：KanjiVG (CC BY-SA 3.0)</p>
          <p>読み・意味データ：KANJIDIC2 (© EDRDG)</p>
        </footer>
      </div>
    </>
  );
}
