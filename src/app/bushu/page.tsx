import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface KanjiDetail {
  kanji: string;
  radicals: string[];
}

interface RadicalBilingual {
  id: number;
  root: string;
  radical_name_en: string;
  radical_name_ja: string;
  description_en: string;
  description_ja: string;
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

export const metadata: Metadata = {
  title: "部首別漢字一覧｜書き順・筆順",
  description: "部首別に漢字を探せます。各部首の漢字の書き順をアニメーションで学習できます。",
};

export default function BushuIndexPage() {
  const dictionary = loadKanjiDictionary();
  const radicalsBilingual = loadRadicalsBilingual();
  
  // 部首情報をマップ化
  const radicalInfoMap = new Map<string, RadicalBilingual>();
  radicalsBilingual.forEach((r) => {
    radicalInfoMap.set(r.radical_name_en, r);
  });
  
  // 部首ごとの漢字数をカウント
  const radicalCounts: Record<string, number> = {};
  dictionary.forEach((k) => {
    k.radicals.forEach((r) => {
      radicalCounts[r] = (radicalCounts[r] || 0) + 1;
    });
  });

  // 漢字数順にソート（count降順）
  const sortedRadicals = Object.entries(radicalCounts)
    .sort((a, b) => b[1] - a[1]);

  // 多い部首（20字以上）
  const majorRadicals = sortedRadicals.filter(([, count]) => count >= 20);
  // その他
  const minorRadicals = sortedRadicals.filter(([, count]) => count < 20 && count >= 5);

  // 部首の表示名を取得（日本語名（英語名）形式）
  const getDisplayName = (radicalEn: string): string => {
    const info = radicalInfoMap.get(radicalEn);
    if (info && info.radical_name_ja !== radicalEn) {
      return `${info.radical_name_ja}（${radicalEn}）`;
    }
    return radicalEn;
  };

  // 部首のルーツ文字を取得
  const getRootChar = (radicalEn: string): string | null => {
    const info = radicalInfoMap.get(radicalEn);
    return info?.root || null;
  };

  return (
    <div className="flex flex-col items-center gap-8">
      {/* パンくず */}
      <nav className="w-full text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">トップ</Link></li>
          <li>/</li>
          <li className="text-foreground">部首別一覧</li>
        </ol>
      </nav>

      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">部首別漢字一覧</h1>
        <p className="text-muted-foreground">{sortedRadicals.length}種類の部首 / {sortedRadicals.length} Radicals</p>
      </header>

      {/* 主要な部首（20字以上） */}
      <Card className="w-full max-w-4xl rounded-2xl shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">主要な部首（20字以上）/ Major Radicals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {majorRadicals.map(([radical, count]) => {
              const root = getRootChar(radical);
              return (
                <Link
                  key={radical}
                  href={`/bushu/${encodeURIComponent(radical)}`}
                  className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-secondary hover:shadow-md transition-all"
                >
                  {root && (
                    <span className="text-2xl w-10 h-10 flex items-center justify-center bg-secondary rounded-lg">
                      {root}
                    </span>
                  )}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium block truncate">{getDisplayName(radical)}</span>
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">{count}字</span>
                </Link>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* その他の部首（5〜19字） */}
      {minorRadicals.length > 0 && (
        <Card className="w-full max-w-4xl rounded-2xl shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">その他の部首（5〜19字）/ Other Radicals</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {minorRadicals.map(([radical, count]) => {
                const info = radicalInfoMap.get(radical);
                const jaName = info?.radical_name_ja;
                return (
                  <Link
                    key={radical}
                    href={`/bushu/${encodeURIComponent(radical)}`}
                    className="px-3 py-2 border border-border rounded-full hover:bg-secondary transition-colors text-sm"
                    title={info ? `${info.root} - ${info.description_ja}` : radical}
                  >
                    {info?.root && <span className="mr-1">{info.root}</span>}
                    {jaName && jaName !== radical ? `${jaName}（${radical}）` : radical}
                    <span className="text-muted-foreground ml-1">({count})</span>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 関連リンク */}
      <div className="flex gap-4 text-sm flex-wrap justify-center">
        <Link href="/grade/1" className="text-muted-foreground hover:text-foreground">
          学年別一覧 →
        </Link>
        <Link href="/strokes/1" className="text-muted-foreground hover:text-foreground">
          画数別一覧 →
        </Link>
        <Link href="/ranking" className="text-muted-foreground hover:text-foreground">
          人気ランキング →
        </Link>
      </div>
    </div>
  );
}
