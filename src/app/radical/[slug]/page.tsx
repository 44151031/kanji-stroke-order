import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import KanjiLink from "@/components/common/KanjiLink";
import radicalList, {
  buildSlugIndex,
  getUniqueSlug,
  findRadicalBySlug,
  formatRadicalName,
  getEnglishDisplayName,
} from "@/lib/radicalList";

// 配置タイプのラベル定義
const POSITION_LABELS: Record<string, { label: string; labelEn: string }> = {
  "left-radical": { label: "偏（へん）", labelEn: "Left" },
  "right-radical": { label: "旁（つくり）", labelEn: "Right" },
  "top-radical": { label: "冠（かんむり）", labelEn: "Top" },
  "bottom-radical": { label: "脚（あし）", labelEn: "Bottom" },
  "hanging-radical": { label: "垂（たれ）", labelEn: "Hanging" },
  "enclosing-radical": { label: "構（かまえ）", labelEn: "Enclosing" },
  "wrapping-radical": { label: "繞（にょう）", labelEn: "Wrapping" },
  "independent-radical": { label: "その他", labelEn: "Other / Independent" },
};

// JSONファイルから漢字リストを読み込み
function loadKanjiList(slug: string): string[] {
  const filePath = path.join(process.cwd(), "data", "radicals", `${slug}.json`);
  if (!fs.existsSync(filePath)) {
    return [];
  }
  try {
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

// 静的パラメータ生成
export async function generateStaticParams() {
  const counts = buildSlugIndex(radicalList);
  return radicalList.map((r) => ({
    slug: getUniqueSlug(r, counts),
  }));
}

type Props = { params: Promise<{ slug: string }> };

// メタデータ生成
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const r = findRadicalBySlug(slug, radicalList);
  
  if (!r) {
    return { title: "部首が見つかりません" };
  }
  
  const displayName = formatRadicalName(r.jp, r.en);
  const englishName = getEnglishDisplayName(r.en);
  const kanjiList = loadKanjiList(slug);
  
  return {
    title: `${displayName}の漢字一覧（${kanjiList.length}字）| Kanji Stroke Order`,
    description: `部首「${r.jp}」（${englishName}）を含む常用漢字${kanjiList.length}字の書き順をアニメーションで学習できます。`,
  };
}

export default async function RadicalDetailPage({ params }: Props) {
  const { slug } = await params;
  const r = findRadicalBySlug(slug, radicalList);
  
  if (!r) return notFound();

  const counts = buildSlugIndex(radicalList);
  const uniqueSlug = getUniqueSlug(r, counts);
  const displayName = formatRadicalName(r.jp, r.en);
  const posInfo = POSITION_LABELS[r.type] || { label: "その他", labelEn: "Other" };
  
  // 漢字リストを読み込み
  const kanjiList = loadKanjiList(slug);

  // 同じ配置タイプの他の部首
  const relatedRadicals = radicalList
    .filter((rad) => rad.type === r.type && rad.en !== r.en)
    .slice(0, 6);

  return (
    <main className="max-w-[900px] mx-auto px-4 py-10">
      {/* パンくず */}
      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-gray-900">トップ</Link></li>
          <li>/</li>
          <li><Link href="/radical" className="hover:text-gray-900">Radicals</Link></li>
          <li>/</li>
          <li className="text-gray-900">{displayName}</li>
        </ol>
      </nav>

      {/* ヘッダー */}
      <header className="text-center mb-10">
        {r.root && (
          <div className="text-6xl mb-4">{r.root}</div>
        )}
        <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
        <p className="text-gray-600">
          Position: {posInfo.labelEn} / {posInfo.label}
        </p>
        <p className="text-lg text-gray-700 mt-2">
          {kanjiList.length > 0 ? `${kanjiList.length}字の常用漢字` : "漢字データなし"}
        </p>
      </header>

      {/* 漢字一覧 */}
      {kanjiList.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">
            Kanji List / 漢字一覧（{kanjiList.length}字）
          </h2>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {kanjiList.map((kanji) => (
              <KanjiLink
                key={kanji}
                kanji={kanji}
                className="aspect-square flex items-center justify-center text-2xl bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
              />
            ))}
          </div>
        </section>
      )}

      {/* 説明セクション */}
      <section className="bg-gray-50 rounded-2xl p-6 mb-8">
        <h2 className="text-lg font-bold mb-3">About this Radical</h2>
        <p className="text-gray-700">
          「{r.jp}」は漢字の{posInfo.label}に位置する部首です。
          {r.root && `部首の字形は「${r.root}」です。`}
          {kanjiList.length > 0 && `この部首を持つ常用漢字は${kanjiList.length}字あります。`}
        </p>
      </section>

      {/* 関連する部首 */}
      {relatedRadicals.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">
            Related Radicals / 同じ型の部首
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
            {relatedRadicals.map((rad) => {
              const radSlug = getUniqueSlug(rad, counts);
              return (
                <Link
                  key={rad.en}
                  href={`/radical/${radSlug}`}
                  className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                >
                  {rad.root && (
                    <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm">
                      {rad.root}
                    </span>
                  )}
                  <span className="font-medium text-sm">
                    {formatRadicalName(rad.jp, rad.en)}
                  </span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* 関連リンク */}
      <div className="flex gap-4 text-sm flex-wrap justify-center pt-6 border-t">
        <Link href="/radical" className="text-gray-500 hover:text-gray-900">
          ← All Radicals / 部首一覧に戻る
        </Link>
        <Link href="/grade/1" className="text-gray-500 hover:text-gray-900">
          By Grade →
        </Link>
        <Link href="/strokes/1" className="text-gray-500 hover:text-gray-900">
          By Strokes →
        </Link>
      </div>
    </main>
  );
}
