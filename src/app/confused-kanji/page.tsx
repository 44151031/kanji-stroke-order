import { Metadata } from "next";
import fs from "fs";
import path from "path";
import KanjiFeatureList from "@/components/kanji/KanjiFeatureList";

interface ConfusedKanjiItem {
  kanji: string;
  meaning: string;
  source: string;
  category: string;
  examples?: string[];
}

function loadConfusedKanji(): ConfusedKanjiItem[] {
  const filePath = path.join(process.cwd(), "data", "kanji_confused.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export const metadata: Metadata = {
  title: "似ている漢字一覧 | 漢字書き順",
  description: "形が似ていて混同しやすい漢字を一覧で紹介。違いと見分け方を学習できます。「土」と「士」など、間違えやすい漢字の比較に。",
  keywords: ["似ている漢字", "混同しやすい漢字", "漢字の違い", "見分け方", "形が似た漢字"],
  openGraph: {
    title: "似ている漢字一覧 | 漢字書き順",
    description: "形が似ていて混同しやすい漢字を一覧で紹介。",
    type: "website",
  },
};

export default function ConfusedKanjiPage() {
  const data = loadConfusedKanji();

  return (
    <KanjiFeatureList
      data={data}
      title="似ている漢字一覧"
      description="形が似ていて混同しやすい漢字を一覧で紹介。違いと見分け方を学習できます。"
      emoji="🔄"
      colorTheme="purple"
    />
  );
}

