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
  { key: "へん", label: "偏（へん）", desc: "漢字の左側に位置する部首", desc_en: "Left side of kanji" },
  { key: "つくり", label: "旁（つくり）", desc: "漢字の右側に位置する部首", desc_en: "Right side of kanji" },
  { key: "かんむり", label: "冠（かんむり）", desc: "漢字の上部に位置する部首", desc_en: "Top of kanji" },
  { key: "あし", label: "脚（あし）", desc: "漢字の下部に位置する部首", desc_en: "Bottom of kanji" },
  { key: "たれ", label: "垂（たれ）", desc: "上から左へ垂れる部首", desc_en: "Hanging from top-left" },
  { key: "かまえ", label: "構（かまえ）", desc: "漢字を囲む部首", desc_en: "Enclosing radical" },
  { key: "にょう", label: "繞（にょう）", desc: "左から下へ回り込む部首", desc_en: "Wrapping from left to bottom" },
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
    <Card className="w-full max-w-4xl rounded-2xl shadow-sm bg-[#f8f7f2]">
      <CardHeader>
        <CardTitle className="text-lg">配置別部首一覧 / Radicals by Position</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {POSITION_ORDER.map(({ key, label, desc, desc_en }) => {
          const items = groupedRadicals[key];
          if (!items || items.length === 0) return null;
          
          return (
            <div key={key} className="space-y-3">
              {/* セクション見出し */}
              <div className="border-b border-border pb-2">
                <h3 className="text-base font-bold">{label}</h3>
                <p className="text-sm text-muted-foreground">{desc} / {desc_en}</p>
              </div>
              
              {/* 部首リスト */}
              <div className="flex flex-wrap gap-2">
                {items.map((r) => {
                  const count = radicalCounts[r.radical_name_en] || 0;
                  const displayName = r.radical_name_ja !== r.radical_name_en
                    ? `${r.radical_name_ja}（${r.radical_name_en}）`
                    : r.radical_name_en;
                  
                  return (
                    <Link
                      key={r.radical_name_en}
                      href={`/bushu/${encodeURIComponent(r.radical_name_en)}`}
                      className="inline-flex items-center gap-2 px-3 py-2 border border-border rounded-lg hover:bg-secondary transition-colors text-sm"
                      title={r.description_ja}
                    >
                      <span className="text-lg">{r.root}</span>
                      <span>{displayName}</span>
                      <span className="text-muted-foreground">({count})</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

