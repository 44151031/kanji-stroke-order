import { Metadata } from "next";
import fs from "fs";
import path from "path";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import RadicalByPositionSection from "@/components/sections/RadicalByPositionSection";

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

export const metadata: Metadata = {
  title: "部首別漢字一覧 | Kanji by Radical",
  description: "部首別に漢字を探せます。各部首の漢字の書き順をアニメーションで学習できます。偏・旁・冠・脚・垂・構・繞の配置別に分類。Browse kanji by radical position: left, right, top, bottom, enclosing, hanging, and wrapping radicals.",
};

export default function RadicalIndexPage() {
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

  // その他の部首（5字以上で配置が「その他」のもの）
  const otherRadicals = sortedRadicals.filter(([radical, count]) => {
    const info = radicalInfoMap.get(radical);
    return count >= 5 && (!info?.position || info.position === "その他");
  });

  return (
    <div className="flex flex-col items-center gap-8">
      {/* パンくず */}
      <nav className="w-full text-sm text-muted-foreground">
        <ol className="flex items-center gap-2">
          <li><Link href="/" className="hover:text-foreground">トップ</Link></li>
          <li>/</li>
          <li className="text-foreground">Radicals / 部首別一覧</li>
        </ol>
      </nav>

      <header className="text-center">
        <h1 className="text-4xl font-bold mb-2">Kanji by Radical</h1>
        <p className="text-xl text-muted-foreground mb-1">部首別漢字一覧</p>
        <p className="text-muted-foreground">{sortedRadicals.length} Radicals / {sortedRadicals.length}種類の部首</p>
        <p className="text-sm text-muted-foreground mt-2">
          偏・旁・冠・脚・垂・構・繞の配置別に分類
        </p>
      </header>

      {/* 配置別部首一覧（メインセクション） */}
      <RadicalByPositionSection 
        radicals={radicalsBilingual} 
        radicalCounts={radicalCounts} 
      />

      {/* その他の部首 */}
      {otherRadicals.length > 0 && (
        <Card id="independent-radical" className="w-full max-w-4xl rounded-2xl shadow-sm scroll-mt-8">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <span>📝</span>
              <span>Independent Radicals / その他の部首</span>
            </CardTitle>
            <p className="text-sm text-muted-foreground">Radicals without specific position / 配置が分類されていない部首</p>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {otherRadicals.map(([radical, count]) => {
                const info = radicalInfoMap.get(radical);
                const jaName = info?.radical_name_ja;
                return (
                  <Link
                    key={radical}
                    href={`/radical/${encodeURIComponent(radical)}`}
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

