import { Metadata } from "next";
import fs from "fs";
import path from "path";
import KanjiFeatureList from "@/components/kanji/KanjiFeatureList";

interface ExamKanjiItem {
  kanji: string;
  meaning: string;
  source: string;
  category: string;
}

function loadExamKanji(): ExamKanjiItem[] {
  const filePath = path.join(process.cwd(), "data", "kanji_exam.json");
  if (!fs.existsSync(filePath)) return [];
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

export const metadata: Metadata = {
  title: "入試頻出漢字一覧 | 漢字書き順",
  description: "高校入試・大学入試で頻出する重要漢字を一覧で紹介。書き順・読み方・意味を学習できます。受験対策に最適な漢字リストです。",
  keywords: ["入試漢字", "頻出漢字", "受験漢字", "高校入試", "大学入試", "漢字学習"],
  openGraph: {
    title: "入試頻出漢字一覧 | 漢字書き順",
    description: "高校入試・大学入試で頻出する重要漢字を一覧で紹介。",
    type: "website",
  },
};

export default function ExamKanjiPage() {
  const data = loadExamKanji();

  return (
    <KanjiFeatureList
      data={data}
      title="入試頻出漢字一覧"
      description="高校入試・大学入試で頻出する重要漢字を一覧で紹介。書き順・読み方・意味を学習できます。"
      emoji="🎓"
      colorTheme="blue"
    />
  );
}










