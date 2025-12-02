"use client";

import Link from "next/link";
import radicalList, {
  buildSlugIndex,
  getUniqueSlug,
  formatRadicalName,
  RADICAL_POSITION_TYPES,
} from "@/lib/radicalList";

// 配置タイプのラベル定義
const POSITION_LABELS: Record<string, { label: string; labelEn: string; icon: string; desc: string }> = {
  "left-radical": { label: "偏（へん）", labelEn: "Left Radical", icon: "⬅️", desc: "漢字の左側に位置する部首" },
  "right-radical": { label: "旁（つくり）", labelEn: "Right Radical", icon: "➡️", desc: "漢字の右側に位置する部首" },
  "top-radical": { label: "冠（かんむり）", labelEn: "Top Radical", icon: "⬆️", desc: "漢字の上部に位置する部首" },
  "bottom-radical": { label: "脚（あし）", labelEn: "Bottom Radical", icon: "⬇️", desc: "漢字の下部に位置する部首" },
  "hanging-radical": { label: "垂（たれ）", labelEn: "Hanging Radical", icon: "↙️", desc: "上から左へ垂れる部首" },
  "enclosing-radical": { label: "構（かまえ）", labelEn: "Enclosing Radical", icon: "⬜", desc: "漢字を囲む部首" },
  "wrapping-radical": { label: "繞（にょう）", labelEn: "Wrapping Radical", icon: "↪️", desc: "左から下へ回り込む部首" },
  "independent-radical": { label: "その他", labelEn: "Independent", icon: "📝", desc: "独立した部首" },
};

export default function RadicalIndexPage() {
  const counts = buildSlugIndex(radicalList);

  // 配置タイプごとにグループ化
  const groupedRadicals = RADICAL_POSITION_TYPES.reduce((acc, type) => {
    acc[type] = radicalList.filter((r) => r.type === type);
    return acc;
  }, {} as Record<string, typeof radicalList>);

  return (
    <main className="max-w-[900px] mx-auto px-4 py-10">
      {/* パンくず */}
      <nav className="text-sm text-gray-500 mb-6">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-gray-900">トップ</Link></li>
          <li>/</li>
          <li className="text-gray-900">Radicals / 部首一覧</li>
        </ol>
      </nav>

      <header className="text-center mb-10">
        <h1 className="text-3xl font-bold mb-2">Kanji by Radical</h1>
        <p className="text-lg text-gray-600 mb-1">部首別漢字一覧</p>
        <p className="text-gray-500">{radicalList.length} Radicals / {radicalList.length}種類の部首</p>
      </header>

      {/* 配置タイプごとのセクション */}
      <div className="space-y-8">
        {RADICAL_POSITION_TYPES.map((type) => {
          const items = groupedRadicals[type];
          if (!items || items.length === 0) return null;
          
          const posInfo = POSITION_LABELS[type];
          
          return (
            <section key={type} id={type} className="scroll-mt-8">
              <div className="border rounded-2xl overflow-hidden">
                <header className="bg-gray-50 px-4 py-3 border-b">
                  <h2 className="text-lg font-bold flex items-center gap-2">
                    <span>{posInfo.icon}</span>
                    <span>{posInfo.labelEn} / {posInfo.label}</span>
                    <span className="text-sm font-normal text-gray-500 ml-2">
                      {items.length}種類
                    </span>
                  </h2>
                  <p className="text-sm text-gray-500">{posInfo.desc}</p>
                </header>
                
                <div className="p-4">
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {items.map((r) => {
                      const uniqueSlug = getUniqueSlug(r, counts);
                      return (
                        <Link
                          key={`${r.en}-${r.type}`}
                          href={`/radical/${uniqueSlug}`}
                          className="flex items-center gap-3 p-3 border rounded-xl hover:bg-gray-50 transition-colors"
                        >
                          {r.root && (
                            <span className="text-2xl w-10 h-10 flex items-center justify-center bg-gray-100 rounded-lg">
                              {r.root}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="font-medium block truncate text-sm">
                              {formatRadicalName(r.jp, r.en)}
                            </span>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {/* 関連リンク */}
      <div className="flex gap-4 text-sm flex-wrap justify-center mt-10 pt-6 border-t">
        <Link href="/grade/1" className="text-gray-500 hover:text-gray-900">
          学年別一覧 →
        </Link>
        <Link href="/strokes/1" className="text-gray-500 hover:text-gray-900">
          画数別一覧 →
        </Link>
        <Link href="/ranking" className="text-gray-500 hover:text-gray-900">
          人気ランキング →
        </Link>
      </div>
    </main>
  );
}
