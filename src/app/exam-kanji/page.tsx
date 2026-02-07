import { Metadata } from "next";
import fs from "fs";
import path from "path";
import KanjiFeatureList from "@/components/kanji/KanjiFeatureList";
import { generatePageMetadata } from "@/lib/metadata";

// ISR設定：7日間キャッシュ（入試頻出リストは半静的）
export const revalidate = 604800; // 7日

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

export const metadata: Metadata = generatePageMetadata({
  path: "/exam-kanji",
});

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










