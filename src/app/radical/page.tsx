import Link from "next/link";
import fs from "fs";
import path from "path";
import radicalList, {
  buildSlugIndex,
  getUniqueSlug,
  formatRadicalName,
  getEnglishDisplayName,
  RADICAL_POSITION_TYPES,
  type Radical,
} from "@/lib/radicalList";
import Breadcrumb from "@/components/common/Breadcrumb";
import RelatedLinks from "@/components/common/RelatedLinks";

// 配置タイプのラベル定義
const POSITION_LABELS: Record<string, { label: string; labelEn: string; icon: string; desc: string }> = {
  "left-radical": { label: "偏（へん）", labelEn: "Left Radical", icon: "⬅️", desc: "漢字の左側に位置する部首" },
  "right-radical": { label: "旁（つくり）", labelEn: "Right Radical", icon: "➡️", desc: "漢字の右側に位置する部首" },
  "top-radical": { label: "冠（かんむり）", labelEn: "Top Radical", icon: "⬆️", desc: "漢字の上部に位置する部首" },
  "bottom-radical": { label: "脚（あし）", labelEn: "Bottom Radical", icon: "⬇️", desc: "漢字の下部に位置する部首" },
  "hanging-radical": { label: "垂（たれ）", labelEn: "Hanging Radical", icon: "↙️", desc: "上から左へ垂れる部首" },
  "enclosing-radical": { label: "構（かまえ）", labelEn: "Enclosing Radical", icon: "⬜", desc: "漢字を囲む部首" },
  "wrapping-radical": { label: "繞（にょう）", labelEn: "Wrapping Radical", icon: "↪️", desc: "左から下へ回り込む部首" },
  "independent-radical": { label: "その他", labelEn: "Other / Independent", icon: "📝", desc: "上記に分類されない部首（複数位置に出現、または独立して使われる）" },
};

// 漢字マスターデータを読み込み
function loadKanjiMaster(): any[] {
  const kanjiPath = path.join(process.cwd(), "data", "kanji_master.json");
  try {
    const content = fs.readFileSync(kanjiPath, "utf8");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

// 部首ごとのJSONファイルから漢字リストを読み込み
// 「・」を「-」に変換したスラッグと、元の「・」を含むファイル名の両方を試す
function loadRadicalKanjiList(slug: string, originalEn?: string, type?: string): string[] {
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

export default function RadicalIndexPage() {
  const counts = buildSlugIndex(radicalList);
  const kanjiList = loadKanjiMaster();

  // 各部首ごとの漢字件数を計算
  const radicalsWithCount: (Radical & { count: number })[] = radicalList.map((r) => {
    const englishName = getEnglishDisplayName(r.en);
    const uniqueSlug = getUniqueSlug(r, counts);
    
    // data/radicals/{slug}.json からカウント（優先）
    // 元の「・」を含むファイル名も試す
    const radicalKanjiList = loadRadicalKanjiList(uniqueSlug, r.en, r.type);
    let count = radicalKanjiList.length;
    
    // data/radicals/{slug}.json にデータがない場合のみ kanji_master.json からカウント
    if (count === 0) {
      count = kanjiList.filter((k: any) => {
        // radical.name が一致するか
        if (k.radical?.name === englishName) return true;
        // radicals 配列に含まれているか
        if (Array.isArray(k.radicals) && k.radicals.includes(englishName)) return true;
        return false;
      }).length;
    }
    
    return { ...r, count };
  });

  // 配置タイプごとにグループ化
  const groupedRadicals = RADICAL_POSITION_TYPES.reduce((acc, type) => {
    acc[type] = radicalsWithCount.filter((r) => r.type === type);
    return acc;
  }, {} as Record<string, typeof radicalsWithCount>);

  return (
    <main className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "トップ", href: "/" },
          { label: "部首一覧" },
        ]}
      />

      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">部首別漢字一覧</h1>
        <p className="text-lg text-gray-600 mb-1">部首から漢字を探す</p>
        <p className="text-gray-500 mb-6">{radicalList.length}種類の部首</p>
        
        {/* 配置タイプ別のページ内リンク */}
        <nav className="flex flex-wrap justify-center gap-3 mt-6">
          {RADICAL_POSITION_TYPES.map((type) => {
            const items = groupedRadicals[type];
            if (!items || items.length === 0) return null;
            const posInfo = POSITION_LABELS[type];
            return (
              <a
                key={type}
                href={`#${type}`}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors text-sm font-medium shadow-sm"
              >
                <span>{posInfo.icon}</span>
                <span>{posInfo.label}</span>
                <span className="text-xs text-gray-500">({items.length})</span>
              </a>
            );
          })}
        </nav>
      </header>

      {/* 配置タイプごとのセクション */}
      <div className="space-y-8">
        {RADICAL_POSITION_TYPES.map((type) => {
          const items = groupedRadicals[type];
          if (!items || items.length === 0) return null;
          
          const posInfo = POSITION_LABELS[type];
          
          return (
            <section key={type} id={type} className="scroll-mt-20">
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
                          className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-colors shadow-sm"
                        >
                          {r.root && (
                            <span className="text-2xl w-10 h-10 flex items-center justify-center bg-white border border-gray-300 rounded-lg shadow-sm">
                              {r.root}
                            </span>
                          )}
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm block truncate">
                              {formatRadicalName(r.jp, r.en)}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                              登録数：{r.count}
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
      <RelatedLinks
        links={[
          { label: "学年別一覧 →", href: "/grade/1" },
          { label: "画数別一覧 →", href: "/strokes/1" },
          { label: "人気ランキング →", href: "/ranking" },
        ]}
        className="flex gap-4 text-sm flex-wrap justify-center mt-10 pt-6 border-t"
        linkClassName="text-gray-500 hover:text-gray-900"
      />
    </main>
  );
}
