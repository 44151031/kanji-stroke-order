import { Metadata } from "next";
import { notFound } from "next/navigation";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KanjiSvgViewer from "@/components/KanjiSvgViewer";
import KanjiFallbackViewer from "@/components/KanjiFallbackViewer";
import KanjiWordList from "@/components/KanjiWordList";
import NextKanjiSection from "@/components/NextKanjiSection";
import KanjiViewTracker from "@/components/KanjiViewTracker";
import KanjiBadges from "@/components/KanjiBadges";
import KanjiLink from "@/components/common/KanjiLink";
import { XShareButton } from "@/components/common/XShareButton";
import KanjiModeToggle from "@/components/common/KanjiModeToggle";
import { toUnicodeSlug, fromUnicodeSlug, getKanjiUrl } from "@/lib/slugHelpers";
import { getRankingPositionSync } from "@/lib/rankingUtils";
import { getKanjiItemJsonLd, getKanjiDefinedTermJsonLd } from "@/lib/structuredData";
import { generateKanjiMetadata } from "@/lib/metadata";
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
  // 表外漢字フラグ
  isExtra?: boolean;
  isRare?: boolean;
  isName?: boolean;
  isClassical?: boolean;
  hasStrokeData?: boolean;
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
  // getKanjiWithMetaを使用してメタデータも含めて取得
  const { getKanjiWithMeta } = require("@/lib/getKanjiWithMeta");
  const allKanji = getKanjiWithMeta();
  const found = allKanji.find((k: KanjiDetail) => k.kanji === kanji);
  
  if (found) {
    return found;
  }
  
  // フォールバック: kanji-details/[漢字].jsonを試す
  const detailPath = path.join(process.cwd(), "data", "kanji-details", `${kanji}.json`);
  if (fs.existsSync(detailPath)) {
    return JSON.parse(fs.readFileSync(detailPath, "utf-8"));
  }
  
  // 最後のフォールバック: kanji-dictionary.jsonから検索
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

// SVGファイルの存在確認
function hasSvgFile(ucsHex: string): boolean {
  const svgPath = path.join(process.cwd(), "public", "kanjivg", `${ucsHex}.svg`);
  return fs.existsSync(svgPath);
}

// SSG: 静的パラメータ生成（uXXXX形式のみ）
export async function generateStaticParams() {
  const joyoList = loadKanjiJoyo();
  
  // 全漢字を uXXXX 形式で生成
  return joyoList.map((k) => ({
    slug: toUnicodeSlug(k.kanji),
  }));
}

// メタデータ生成（SEO最適化）
type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  // uXXXX形式から漢字を取得
  const kanji = fromUnicodeSlug(slug);
  if (!kanji) {
    return { title: "漢字が見つかりません" };
  }
  
  const detail = loadKanjiDetail(kanji);
  if (!detail) {
    return { title: "漢字が見つかりません" };
  }

  // generateKanjiMetadata()を使用してメタデータを生成
  return generateKanjiMetadata(kanji, detail.meaning?.slice(0, 3).join(", ") || "", {
    strokes: detail.strokes,
    grade: detail.grade,
    onYomi: detail.on,
    kunYomi: detail.kun,
    jlpt: detail.jlpt,
  });
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
  const { slug } = await params;
  
  // uXXXX形式から漢字を取得
  const kanji = fromUnicodeSlug(slug);
  
  // 無効なスラッグの場合は404
  if (!kanji) {
    notFound();
  }
  
  // 漢字詳細を取得
  const detail = loadKanjiDetail(kanji);
  
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
    words = wordsByKanji[kanji] || [];
  } catch {
    // 単語リスト読み込み失敗時は空配列
  }

  const relatedKanji = getRelatedKanji(detail, dictionary);
  const jsonLd = getKanjiDefinedTermJsonLd({
    kanji: detail.kanji,
    ucsHex: detail.ucsHex,
    on: detail.on,
    kun: detail.kun,
    strokes: detail.strokes,
    grade: detail.grade,
    jlpt: detail.jlpt,
    words: words.map((w) => ({
      word: w.word,
      reading: w.reading,
      meaning: w.meaning,
    })),
    canonicalSlug: toUnicodeSlug(detail.kanji),
  });
  
  // ランキング位置を取得（同期版を使用）
  const rankingPosition = getRankingPositionSync(kanji);
  
  // ランキング連携構造化データを生成
  const meaningText = Array.isArray(detail.meaning)
    ? detail.meaning.filter(Boolean).join(", ")
    : typeof detail.meaning === "string"
    ? detail.meaning
    : "";
  const itemJsonLd = getKanjiItemJsonLd(kanji, meaningText, detail.strokes, rankingPosition);
  
  // マスターデータからカテゴリ情報を取得
  const kanjiMaster = loadKanjiMaster();
  const masterEntry = kanjiMaster.get(kanji);
  const categories = masterEntry?.category || [];
  const confusedWith = masterEntry?.confusedWith || [];

  const gradeLabel = detail.grade > 0 && detail.grade <= 6 
    ? `小学${detail.grade}年生` 
    : detail.grade > 6 
    ? "中学校"
    : "";

  // 表外漢字フラグの判定
  const isExtra = detail.isExtra === true;
  const isRare = detail.isRare === true;
  const isName = detail.isName === true;
  const isClassical = detail.isClassical === true;

  // SVGの存在確認（hasStrokeDataフラグまたはファイル存在確認）
  const hasStrokeData = detail.hasStrokeData !== false && hasSvgFile(detail.ucsHex);

  return (
    <>
      {/* アクセス記録（Supabase） */}
      <KanjiViewTracker kanji={kanji} />
      
      {/* 構造化データ（JSON-LD） - DefinedTerm */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 構造化データ（JSON-LD） - CreativeWork + ItemList（ランキング連携） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemJsonLd) }}
      />
          {/* パンくずリスト */}
          <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            ...(gradeLabel ? [{ label: gradeLabel, href: `/grade/${detail.grade}` }] : []),
            { label: `${detail.strokes}画`, href: `/strokes/${detail.strokes}` },
            { label: kanji },
          ]}
          ariaLabel="パンくずリスト"
          flexWrap={true}
          separatorAriaHidden={true}
          currentAriaCurrent={true}
          currentFontMedium={true}
        />
  
      <main className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">

        {/* ヘッダー（LCP最適化：h1は大きく） */}
        <header className="text-center">
          <h1 className="text-8xl md:text-9xl font-bold mb-4 leading-none">{kanji}</h1>
          <div className="flex items-center justify-center gap-3 text-sm flex-wrap">
            {detail.grade > 0 && (
              <span className="px-3 py-1 bg-secondary rounded-full">{gradeLabel}</span>
            )}
            <span className="px-3 py-1 bg-secondary rounded-full">{detail.strokes}画</span>
            {detail.jlpt && (
              <span className="px-3 py-1 bg-primary text-primary-foreground rounded-full font-medium">
                {detail.jlpt}
              </span>
            )}
            {/* 表外漢字フラグ */}
            {isExtra && (
              <span className="px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-xs">
                表外漢字
              </span>
            )}
            {isRare && (
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                難読
              </span>
            )}
            {isName && (
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                人名
              </span>
            )}
            {isClassical && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 rounded-full text-xs">
                古典
              </span>
            )}
          </div>
          {/* カテゴリバッジ */}
          {categories.length > 0 && (
            <div className="mt-3 flex justify-center">
              <KanjiBadges categories={categories} />
            </div>
          )}
          {/* 表外漢字の注記 */}
          {isExtra && (
            <p className="mt-3 text-sm text-muted-foreground">
              ※ 表外漢字（常用漢字外）
            </p>
          )}
        </header>
        {/* モード切り替えトグル（SVGがある場合のみ） */}
        {hasStrokeData && <KanjiModeToggle kanji={kanji} />}
        {/* 書き順SVG（LCP重視：直読み） */}
        <Card className="w-full max-w-lg rounded-2xl shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">書き順（筆順）</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            {hasStrokeData ? (
              <>
                <div className="w-72 h-72 md:w-80 md:h-80 border border-border rounded-xl flex items-center justify-center bg-white">
                  <KanjiSvgViewer ucsHex={detail.ucsHex} kanji={kanji} />
                </div>
                {/* 書き順を間違えやすい漢字の警告表示 */}
                {typedMisorderList.common_misorder_kanji.includes(kanji) && (
                  <p className="text-red-500 text-sm mt-3 flex items-center gap-1">
                    <span>⚠</span>
                    <span>この漢字は書き順を間違えやすい漢字としてよく出題されます。</span>
                  </p>
                )}
              </>
            ) : (
              <KanjiFallbackViewer
                kanji={kanji}
                strokes={detail.strokes}
                radicals={detail.radicals}
              />
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
            <div className={`grid ${gradeLabel ? 'grid-cols-2' : 'grid-cols-1'} gap-4 pt-2 border-t border-border/50`}>
              <div>
                <p className="font-medium text-muted-foreground text-sm mb-1">画数</p>
                <p className="text-base md:text-lg">{detail.strokes}画</p>
              </div>
              {gradeLabel && (
                <div>
                  <p className="font-medium text-muted-foreground text-sm mb-1">学年</p>
                  <p className="text-base md:text-lg">{gradeLabel}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* この漢字を含む言葉（ページネーション対応） */}
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

        {/* 混同しやすい漢字 */}
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
                    className="w-14 h-14 flex items-center justify-center text-3xl border-2 border-purple-300 rounded-lg hover:bg-purple-100 transition-colors"
                  />
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3">
                <Link href="/lists/confused" className="hover:text-foreground">
                  混同しやすい漢字一覧を見る →
                </Link>
              </p>
            </CardContent>
          </Card>
        )}

        {/* 次に見る漢字（部首または画数±1からランダム選択） */}
        <NextKanjiSection
          currentKanji={kanji}
          strokes={detail.strokes}
          radicals={detail.radicals || []}
          allKanji={dictionary}
        />

        {/* 関連漢字（同一学年・同一画数） */}
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
                    className="w-12 h-12 flex items-center justify-center text-2xl border border-border rounded-lg hover:bg-secondary transition-colors"
                    title={`${k.kanji} - ${k.on[0] || k.kun[0] || ""}`}
                  />
                ))}
              </div>
              <div className="flex justify-center gap-4 mt-4 text-sm flex-wrap">
                {detail.grade > 0 && (
                  <Link 
                    href={`/grade/${detail.grade}`}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {gradeLabel}の漢字 →
                  </Link>
                )}
                <Link 
                  href={`/strokes/${detail.strokes}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {detail.strokes}画の漢字 →
                </Link>
                <Link 
                  href="/lists/exam"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  📚 入試頻出漢字 →
                </Link>
                {/* 表外漢字関連リンク */}
                {isExtra && (
                  <>
                    <Link 
                      href="/kanji/extra"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      表外漢字一覧へ →
                    </Link>
                    <Link 
                      href="/kanji/extra/ranking"
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      表外漢字ランキングを見る →
                    </Link>
                  </>
                )}
                {isRare && (
                  <Link 
                    href="/kanji/rare"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    難読漢字一覧へ →
                  </Link>
                )}
                {isName && (
                  <Link 
                    href="/kanji/name"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    人名漢字一覧へ →
                  </Link>
                )}
                {isClassical && (
                  <Link 
                    href="/kanji/classical"
                    className="text-muted-foreground hover:text-foreground transition-colors"
                  >
                    古典・文語漢字一覧へ →
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Xでポストボタン */}
        <div className="mt-8 flex justify-center">
          <XShareButton kanji={detail.kanji} />
        </div>
      </main>
    </>
  );
}

