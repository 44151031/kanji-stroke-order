import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import fs from "fs";
import path from "path";
import KanjiLink from "@/components/common/KanjiLink";
import Breadcrumb from "@/components/common/Breadcrumb";
import RelatedLinks from "@/components/common/RelatedLinks";
import { generateRadicalMetadata } from "@/lib/metadata";
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
// 「・」を「-」に変換したスラッグと、元の「・」を含むファイル名の両方を試す
function loadKanjiList(slug: string, originalEn?: string, type?: string): string[] {
  // 1. まず生成されたスラッグで試す
  let filePath = path.join(process.cwd(), "data", "radicals", `${slug}.json`);
  if (fs.existsSync(filePath)) {
    try {
      const content = fs.readFileSync(filePath, "utf8");
      return JSON.parse(content);
    } catch {
      // JSON解析エラーは無視して次へ
    }
  }
  
  // 2. 元の「・」を含むファイル名で試す（後方互換性のため）
  if (originalEn) {
    // 2-1. 元のenそのまま
    if (originalEn.includes("・")) {
      filePath = path.join(process.cwd(), "data", "radicals", `${originalEn}.json`);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, "utf8");
          return JSON.parse(content);
        } catch {
          // JSON解析エラーは無視
        }
      }
    }
    
    // 2-2. 元のen + type（{en}-{type}.json形式）
    if (type && originalEn.includes("・")) {
      filePath = path.join(process.cwd(), "data", "radicals", `${originalEn}-${type}.json`);
      if (fs.existsSync(filePath)) {
        try {
          const content = fs.readFileSync(filePath, "utf8");
          return JSON.parse(content);
        } catch {
          // JSON解析エラーは無視
        }
      }
    }
  }
  
  return [];
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
  
  return generateRadicalMetadata(displayName, englishName);
}

export default async function RadicalDetailPage({ params }: Props) {
  const { slug } = await params;
  const r = findRadicalBySlug(slug, radicalList);
  
  if (!r) return notFound();

  const counts = buildSlugIndex(radicalList);
  const uniqueSlug = getUniqueSlug(r, counts);
  const displayName = formatRadicalName(r.jp, r.en);
  const posInfo = POSITION_LABELS[r.type] || { label: "その他", labelEn: "Other" };
  
  // 漢字リストを読み込み（元の「・」を含むファイル名も試す）
  const kanjiList = loadKanjiList(slug, r.en, r.type);

  // 同じ配置タイプの他の部首
  const relatedRadicals = radicalList
    .filter((rad) => rad.type === r.type && rad.en !== r.en)
    .slice(0, 6);

  return (
    <main className="flex flex-col items-center gap-3 w-full max-w-4xl mx-auto">
      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "トップ", href: "/" },
          { label: "部首一覧", href: "/radical" },
          { label: displayName },
        ]}
      />

      {/* ヘッダー */}
      <header className="text-center mb-10">
        {r.root && (
          <div className="text-6xl mb-4">{r.root}</div>
        )}
        <h1 className="text-3xl font-bold mb-2">{displayName}</h1>
        <p className="text-gray-600">
          配置: {posInfo.label}
        </p>
        <p className="text-lg text-gray-700 mt-2">
          {kanjiList.length > 0 ? `${kanjiList.length}字の常用漢字` : "漢字データなし"}
        </p>
      </header>

      {/* 説明セクション */}
      <section className="bg-gray-50 rounded-2xl p-6 mb-4 bg-white">
        <h2 className="text-lg font-bold mb-3">この部首について</h2>
        <p className="text-gray-700">
          「{r.jp}」は漢字の{posInfo.label}に位置する部首です。
          {r.root && `部首の字形は「${r.root}」です。`}
          {kanjiList.length > 0 && `この部首を持つ常用漢字は${kanjiList.length}字あります。`}
        </p>
      </section>

      {/* 漢字一覧 */}
      {kanjiList.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold mb-4">
            漢字一覧（{kanjiList.length}字）
          </h2>
          <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2">
            {kanjiList.map((kanji) => (
              <KanjiLink
                key={kanji}
                kanji={kanji}
                className="bg-white w-12 h-12 flex items-center justify-center text-2xl border border-border rounded-lg hover:bg-secondary transition-colors"
              />
            ))}
          </div>
        </section>
      )}



      {/* 関連する部首 */}
      {relatedRadicals.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-bold mb-4">
            同じ型の部首
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
      <RelatedLinks
        links={[
          { label: "← 部首一覧に戻る", href: "/radical" },
          { label: "学年別一覧 →", href: "/grade/1" },
          { label: "画数別一覧 →", href: "/strokes/1" },
        ]}
        className="flex gap-4 text-sm"
      />
    </main>
  );
}
