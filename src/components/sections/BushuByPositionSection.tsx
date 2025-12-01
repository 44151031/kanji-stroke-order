import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface RadicalBilingual {
  id: number;
  root: string;
  radical_name_en: string;
  radical_name_ja: string;
  description_en: string;
  description_ja: string;
  position?: string;
}

interface Props {
  radicals: RadicalBilingual[];
  radicalCounts: Record<string, number>;
}

// 配置の順序と説明
const POSITION_ORDER = [
  { key: "へん", label: "偏（へん）", desc: "漢字の左側に位置する部首", desc_en: "Left side of kanji", icon: "⬅️" },
  { key: "つくり", label: "旁（つくり）", desc: "漢字の右側に位置する部首", desc_en: "Right side of kanji", icon: "➡️" },
  { key: "かんむり", label: "冠（かんむり）", desc: "漢字の上部に位置する部首", desc_en: "Top of kanji", icon: "⬆️" },
  { key: "あし", label: "脚（あし）", desc: "漢字の下部に位置する部首", desc_en: "Bottom of kanji", icon: "⬇️" },
  { key: "たれ", label: "垂（たれ）", desc: "上から左へ垂れる部首", desc_en: "Hanging from top-left", icon: "↙️" },
  { key: "かまえ", label: "構（かまえ）", desc: "漢字を囲む部首", desc_en: "Enclosing radical", icon: "⬜" },
  { key: "にょう", label: "繞（にょう）", desc: "左から下へ回り込む部首", desc_en: "Wrapping from left to bottom", icon: "↪️" },
];

export default function BushuByPositionSection({ radicals, radicalCounts }: Props) {
  // 配置ごとにグループ化
  const groupedRadicals: Record<string, RadicalBilingual[]> = {};
  
  POSITION_ORDER.forEach(({ key }) => {
    groupedRadicals[key] = [];
  });
  
  radicals.forEach((r) => {
    const pos = r.position || "その他";
    if (groupedRadicals[pos]) {
      groupedRadicals[pos].push(r);
    }
  });
  
  // 各グループを漢字数順にソート
  Object.keys(groupedRadicals).forEach((key) => {
    groupedRadicals[key].sort((a, b) => {
      const countA = radicalCounts[a.radical_name_en] || 0;
      const countB = radicalCounts[b.radical_name_en] || 0;
      return countB - countA;
    });
  });

  return (
    <div className="w-full max-w-4xl space-y-6">
      {POSITION_ORDER.map(({ key, label, desc, desc_en, icon }) => {
        const items = groupedRadicals[key];
        if (!items || items.length === 0) return null;
        
        return (
          <Card key={key} className="rounded-2xl shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>{icon}</span>
                <span>{label}</span>
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {items.length}種類
                </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{desc} / {desc_en}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((r) => {
                  const count = radicalCounts[r.radical_name_en] || 0;
                  const displayName = r.radical_name_ja !== r.radical_name_en
                    ? `${r.radical_name_ja}（${r.radical_name_en}）`
                    : r.radical_name_en;
                  
                  return (
                    <Link
                      key={r.radical_name_en}
                      href={`/bushu/${encodeURIComponent(r.radical_name_en)}`}
                      className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-secondary hover:shadow-md transition-all"
                      title={r.description_ja}
                    >
                      <span className="text-2xl w-10 h-10 flex items-center justify-center bg-secondary rounded-lg">
                        {r.root}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate text-sm">{displayName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{count}字</span>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
