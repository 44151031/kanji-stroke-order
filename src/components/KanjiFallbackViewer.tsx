"use client";

import { Card, CardContent } from "@/components/ui/card";

type Props = {
  kanji: string;
  strokes: number;
  radicals?: string[];
  structure?: string;
};

/**
 * SVGが存在しない場合のフォールバック表示コンポーネント
 */
export default function KanjiFallbackViewer({
  kanji,
  strokes,
  radicals = [],
  structure,
}: Props) {
  // 構造タイプの判定（簡易版）
  const getStructureType = (): string => {
    if (structure) return structure;
    // 部首から推測（簡易版）
    if (radicals.length > 0) {
      return "複合構造";
    }
    return "単体";
  };

  return (
    <div className="flex flex-col items-center gap-6 w-full">
      {/* 字形表示 */}
      <div className="w-72 h-72 md:w-80 md:h-80 border border-border rounded-xl flex items-center justify-center bg-white">
        <span className="text-9xl font-light text-foreground">{kanji}</span>
      </div>

      {/* 説明文 */}
      <Card className="w-full max-w-lg border-amber-200 bg-amber-50/50">
        <CardContent className="pt-6">
          <p className="text-sm text-amber-800 text-center leading-relaxed">
            この漢字は表外漢字のため、書き順データが未登録です。
          </p>
        </CardContent>
      </Card>

      {/* 基本情報 */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
        <Card className="border">
          <CardContent className="pt-6">
            <p className="font-medium text-muted-foreground text-sm mb-1">画数</p>
            <p className="text-2xl font-bold">{strokes}画</p>
          </CardContent>
        </Card>
        {radicals && radicals.length > 0 && (
          <Card className="border">
            <CardContent className="pt-6">
              <p className="font-medium text-muted-foreground text-sm mb-1">部首</p>
              <p className="text-lg">{radicals[0]}</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* 構造情報 */}
      {getStructureType() && (
        <Card className="w-full max-w-lg border">
          <CardContent className="pt-6">
            <p className="font-medium text-muted-foreground text-sm mb-1">構造</p>
            <p className="text-lg">{getStructureType()}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

