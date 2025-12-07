import { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KanjiWordList from "@/components/KanjiWordList";
import NextKanjiSection from "@/components/NextKanjiSection";
import KanjiViewTracker from "@/components/KanjiViewTracker";
import KanjiBadges from "@/components/KanjiBadges";
import KanjiLink from "@/components/common/KanjiLink";
import { XShareButton } from "@/components/common/XShareButton";
import KanjiModeToggle from "@/components/common/KanjiModeToggle";
import StrokePracticeCanvas from "@/components/kanji/StrokePracticeCanvas";
import { toUnicodeSlug, fromUnicodeSlug } from "@/lib/slugHelpers";
import { getRankingPositionSync } from "@/lib/rankingUtils";
import { generateKanjiPracticeMetadata } from "@/lib/metadata";
import { getKanjiItemJsonLd, getKanjiPracticeJsonLd } from "@/lib/structuredData";
import Breadcrumb from "@/components/common/Breadcrumb";
// 書き順を間違えやすい漢字リスト
import misorderList from "@/data/misorder-kanji.json";

// 型定義
interface MisorderKanjiList {
  common_misorder_kanji: string[];
}
const typedMisorderList = misorderList as MisorderKanjiList;

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
  radicals?: string[];
}

interface WordEntry {
  word: string;
  reading: string;
  meaning: string;
}

interface MasterKanji {
  kanji: string;
  id?: string;
  category: string[];
  confusedWith?: string[];
  readings?: {
    on: string[];
    kun: string[];
  };
  radical?: {
    name: string;
    meaning: string;
  };
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
  const detailPath = path.join(process.cwd(), "data", "kanji-details", `${kanji}.json`);
  if (fs.existsSync(detailPath)) {
    return JSON.parse(fs.readFileSync(detailPath, "utf-8"));
  }
  const dictionary = loadKanjiDictionary();
  return dictionary.find((k) => k.kanji === kanji) || null;
}

function loadWordsByKanji(): Record<string, WordEntry[]> {
  const wordsPath = path.join(process.cwd(), "data", "words-by-kanji.json");
  if (!fs.existsSync(wordsPath)) return {};
  return JSON.parse(fs.readFileSync(wordsPath, "utf-8"));
}

function loadKanjiMaster(): Map<string, MasterKanji> {
  const masterPath = path.join(process.cwd(), "data", "kanji_master.json");
  if (!fs.existsSync(masterPath)) return new Map();
  const data: MasterKanji[] = JSON.parse(fs.readFileSync(masterPath, "utf-8"));
  return new Map(data.map((k) => [k.kanji, k]));
}

// ✅ SSG: 静的パラメータ生成
export async function generateStaticParams() {
  const joyoList = loadKanjiJoyo();
  return joyoList.map((k) => ({
    slug: toUnicodeSlug(k.kanji),
  }));
}

// ✅ メタデータ生成（書き取りテスト専用SEO最適化版）
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const kanji = fromUnicodeSlug(slug);
  if (!kanji) return { title: "書き取りテスト - 漢字書き順ナビ" };

  const detail = loadKanjiDetail(kanji);
  if (!detail) return { title: "書き取りテスト - 漢字書き順ナビ" };

  // ✅ 専用関数を利用（正しい書き取りメタデータ生成）
  return generateKanjiPracticeMetadata(kanji, detail.meaning.join(", "), detail.strokes);
}

// ✅ 関連漢字取得
function getRelatedKanji(detail: KanjiDetail, dictionary: KanjiDetail[]): KanjiDetail[] {
  const sameGrade = dictionary.filter(
    (k) => k.grade === detail.grade && k.kanji !== detail.kanji
  );
  const sameStrokes = dictionary.filter(
    (k) => k.strokes === detail.strokes && k.kanji !== detail.kanji
  );
  const combined = [...sameGrade, ...sameStrokes].filter(
    (k, i, arr) => arr.findIndex((x) => x.kanji === k.kanji) === i
  );
  combined.sort((a, b) => (a.freq || 9999) - (b.freq || 9999));
  return combined.slice(0, 10);
}

// ✅ メインページコンポーネント
export default async function PracticePage({ params }: Props) {
  const { slug } = await params;
  const kanji = fromUnicodeSlug(slug);
  if (!kanji) notFound();

  const detail = loadKanjiDetail(kanji);
  if (!detail) notFound();

  let dictionary: KanjiDetail[] = [];
  let words: WordEntry[] = [];

  try {
    dictionary = loadKanjiDictionary();
  } catch {}
  try {
    const wordsByKanji = loadWordsByKanji();
    words = wordsByKanji[kanji] || [];
  } catch {}

  const relatedKanji = getRelatedKanji(detail, dictionary);
  const rankingPosition = getRankingPositionSync(kanji);
  const meaningText = Array.isArray(detail.meaning)
    ? detail.meaning.filter(Boolean).join(", ")
    : typeof detail.meaning === "string"
    ? detail.meaning
    : "";
  const itemJsonLd = getKanjiItemJsonLd(kanji, meaningText, detail.strokes, rankingPosition);
  const jsonLd = getKanjiPracticeJsonLd(kanji, meaningText, detail.strokes);

  const kanjiMaster = loadKanjiMaster();
  const masterEntry = kanjiMaster.get(kanji);
  const categories = masterEntry?.category || [];
  const confusedWith = masterEntry?.confusedWith || [];

  const gradeLabel = detail.grade <= 6 ? `小学${detail.grade}年生` : "中学校";

  return (
    <>
      {/* アクセス記録（Supabase） */}
      <KanjiViewTracker kanji={kanji} />

      {/* JSON-LD構造化データ：ランキング＋練習モード */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
        {/* パンくず */}
        <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            { label: gradeLabel, href: `/grade/${detail.grade}` },
            { label: `${detail.strokes}画`, href: `/strokes/${detail.strokes}` },
            { label: `${kanji}の詳細`, href: `/kanji/${slug}` },
            { label: "書き取り練習" },
          ]}
          ariaLabel="パンくずリスト"
          flexWrap={true}
          separatorAriaHidden={true}
          currentAriaCurrent={true}
          currentFontMedium={true}
        />

      <main className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
        <KanjiModeToggle kanji={kanji} />



        {/* 見出し */}
        <header className="text-center">
          <h1 className="text-8xl md:text-9xl font-bold mb-4 leading-none">{kanji}</h1>
          <div className="flex items-center justify-center gap-3 text-sm flex-wrap">
            <span className="px-3 py-1 bg-secondary rounded-full">{gradeLabel}</span>
            <span className="px-3 py-1 bg-secondary rounded-full">{detail.strokes}画</span>
            {detail.jlpt && (
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full font-medium">
                {detail.jlpt}
              </span>
            )}
          </div>
          {categories.length > 0 && (
            <div className="mt-3 flex justify-center">
              <KanjiBadges categories={categories} />
            </div>
          )}
        </header>

        {/* 書き取りテスト本体 */}
        <Card className="w-full max-w-4xl rounded-2xl shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">✍ 書き取りテスト</CardTitle>
          </CardHeader>
          <CardContent>
            <StrokePracticeCanvas
              kanjiCode={`u${detail.ucsHex}`}
              kanji={kanji}
              ucsHex={detail.ucsHex}
            />
            {typedMisorderList.common_misorder_kanji.includes(kanji) && (
              <p className="text-red-500 text-sm mt-4 flex items-center gap-1 justify-center">
                <span>⚠</span>
                <span>この漢字は書き順を間違えやすい漢字としてよく出題されます。</span>
              </p>
            )}
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
                <p className="font-medium text-muted-foreground text-sm mb-1">音読み</p>
                <p className="text-base md:text-lg">{detail.on.join("、") || "—"}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">訓読み</p>
                <p className="text-base md:text-lg">{detail.kun.join("、") || "—"}</p>
              </div>
            </div>
            {detail.meaning.length > 0 && (
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">意味</p>
                <p className="text-base md:text-lg">{detail.meaning.join(", ")}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 関連・混同・単語・リンク類 */}
        {words.length > 0 && (
          <Card className="w-full max-w-lg rounded-2xl shadow-sm border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">「{kanji}」を含む言葉</CardTitle>
            </CardHeader>
            <CardContent>
              <KanjiWordList words={words} kanji={kanji} />
            </CardContent>
          </Card>
        )}

        {confusedWith.length > 0 && (
          <Card className="w-full max-w-lg rounded-2xl shadow-sm border border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-purple-700">🔄 混同しやすい漢字</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3 justify-center">
                {confusedWith.map((k) => (
                  <KanjiLink
                    key={k}
                    kanji={k}
                    mode="practice"
                    className="w-14 h-14 flex items-center justify-center text-3xl border-2 border-purple-300 rounded-lg hover:bg-purple-100 transition-colors"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <NextKanjiSection
          currentKanji={kanji}
          strokes={detail.strokes}
          radicals={detail.radicals || []}
          allKanji={dictionary}
        />

        {relatedKanji.length > 0 && (
          <Card className="w-full max-w-lg rounded-2xl shadow-sm border">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">関連する漢字</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2 justify-center">
                {relatedKanji.map((k) => (
                  <KanjiLink
                    key={k.kanji}
                    kanji={k.kanji}
                    mode="practice"
                    className="w-12 h-12 flex items-center justify-center text-2xl border border-border rounded-lg hover:bg-secondary transition-colors"
                    title={`${k.kanji} - ${k.on[0] || k.kun[0] || ""}`}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="mt-8 flex justify-center">
          <XShareButton kanji={detail.kanji} />
        </div>
      </main>
    </>
  );
}
