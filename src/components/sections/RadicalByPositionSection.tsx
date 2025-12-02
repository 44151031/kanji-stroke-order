import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { capitalize } from "@/lib/radicalList";

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

// 配置の順序と説明（日英対応 + アンカーID）
const POSITION_ORDER = [
  { key: "へん", id: "left-radical", label: "偏（へん）", labelEn: "Left Radical", desc: "漢字の左側に位置する部首", desc_en: "Left side of kanji", icon: "⬅️" },
  { key: "つくり", id: "right-radical", label: "旁（つくり）", labelEn: "Right Radical", desc: "漢字の右側に位置する部首", desc_en: "Right side of kanji", icon: "➡️" },
  { key: "かんむり", id: "top-radical", label: "冠（かんむり）", labelEn: "Top Radical", desc: "漢字の上部に位置する部首", desc_en: "Top of kanji", icon: "⬆️" },
  { key: "あし", id: "bottom-radical", label: "脚（あし）", labelEn: "Bottom Radical", desc: "漢字の下部に位置する部首", desc_en: "Bottom of kanji", icon: "⬇️" },
  { key: "たれ", id: "hanging-radical", label: "垂（たれ）", labelEn: "Hanging Radical", desc: "上から左へ垂れる部首", desc_en: "Hanging from top-left", icon: "↙️" },
  { key: "かまえ", id: "enclosing-radical", label: "構（かまえ）", labelEn: "Enclosing Radical", desc: "漢字を囲む部首", desc_en: "Enclosing radical", icon: "⬜" },
  { key: "にょう", id: "wrapping-radical", label: "繞（にょう）", labelEn: "Wrapping Radical", desc: "左から下へ回り込む部首", desc_en: "Wrapping from left to bottom", icon: "↪️" },
];

/**
 * 英語名から表示用名称を抽出
 * 例: "Speech" (既に大文字の場合) or capitalize処理
 */
function getDisplayEnglish(enName: string): string {
  // 既に大文字始まりならそのまま使用
  if (enName.charAt(0) === enName.charAt(0).toUpperCase()) {
    return enName;
  }
  // 小文字スラッグの場合は先頭を大文字に
  return capitalize(enName);
}

export default function RadicalByPositionSection({ radicals, radicalCounts }: Props) {
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
      {POSITION_ORDER.map(({ key, id, label, labelEn, desc, desc_en, icon }) => {
        const items = groupedRadicals[key];
        if (!items || items.length === 0) return null;
        
        return (
          <Card key={key} id={id} className="rounded-2xl shadow-sm scroll-mt-8">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2">
                <span>{icon}</span>
                <span>{labelEn} / {label}</span>
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  {items.length} types / {items.length}種類
                </span>
              </CardTitle>
              <p className="text-sm text-muted-foreground">{desc_en} / {desc}</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {items.map((r) => {
                  const count = radicalCounts[r.radical_name_en] || 0;
                  const englishDisplay = getDisplayEnglish(r.radical_name_en);
                  // 表示形式: 日本語名（English）
                  const displayName = r.radical_name_ja !== r.radical_name_en
                    ? `${r.radical_name_ja}（${englishDisplay}）`
                    : englishDisplay;
                  
                  return (
                    <Link
                      key={r.radical_name_en}
                      href={`/radical/${encodeURIComponent(r.radical_name_en)}`}
                      className="flex items-center gap-3 p-3 border border-border rounded-xl hover:bg-secondary hover:shadow-md transition-all"
                      title={r.description_en}
                    >
                      <span className="text-2xl w-10 h-10 flex items-center justify-center bg-secondary rounded-lg">
                        {r.root}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium block truncate text-sm">{displayName}</span>
                      </div>
                      <span className="text-sm text-muted-foreground whitespace-nowrap">{count}</span>
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
