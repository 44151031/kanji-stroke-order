import { Metadata } from "next";
import fs from "fs";
import path from "path";
import KanjiFeatureList from "@/components/kanji/KanjiFeatureList";

interface MistakeKanjiItem {
  kanji: string;
  meaning: string;
  source: string;
  category: string;
  examples?: string[];
}

function loadMistakeKanji(): MistakeKanjiItem[] {
  const filePath = path.join(process.cwd(), "data", "kanji_mistake.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export const metadata: Metadata = {
  title: "間違えやすい漢字一覧 | 漢字書き順",
  description: "書き間違え・読み間違えしやすい漢字を一覧で紹介。正しい書き順と使い分けを確認できます。同音異義語や形が似た漢字の区別に。",
  keywords: ["間違えやすい漢字", "同音異義語", "漢字の使い分け", "書き間違い", "読み間違い"],
  openGraph: {
    title: "間違えやすい漢字一覧 | 漢字書き順",
    description: "書き間違え・読み間違えしやすい漢字を一覧で紹介。",
    type: "website",
  },
};

export default function MistakeKanjiPage() {
  const data = loadMistakeKanji();

  return (
    <KanjiFeatureList
      data={data}
      title="間違えやすい漢字一覧"
      description="書き間違え・読み間違えしやすい漢字を一覧で紹介。正しい書き順と使い分けを確認できます。"
      emoji="⚠️"
      colorTheme="amber"
    />
  );
}

