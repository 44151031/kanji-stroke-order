import { Metadata } from "next";
import fs from "fs";
import path from "path";
import { generatePageMetadata } from "@/lib/metadata";
import { getQuizFaqJsonLd } from "@/lib/structuredData";
import Breadcrumb from "@/components/common/Breadcrumb";
import RelatedLinks from "@/components/common/RelatedLinks";
import StrokeOrderQuizClient from "@/components/quiz/StrokeOrderQuizClient";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = generatePageMetadata({
  path: "/quiz",
});

interface JoyoEntry {
  kanji: string;
  grade: number;
  ucsHex: string;
  strokes: number;
}

function loadKanjiData(): { kanji: string; grade: number }[] {
  try {
    const filePath = path.join(process.cwd(), "data", "kanji-joyo.json");
    const raw: JoyoEntry[] = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    return raw.map((k) => ({ kanji: k.kanji, grade: k.grade }));
  } catch {
    return [];
  }
}

export default function QuizPage() {
  const kanjiData = loadKanjiData();
  const faqJsonLd = getQuizFaqJsonLd();

  return (
    <main className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "トップ", href: "/" },
          { label: "書き順クイズ" },
        ]}
      />

      {/* ヘッダー */}
      <header className="text-center">
        <h1 className="text-3xl font-bold mb-3">書き順クイズ</h1>
        <p className="text-muted-foreground max-w-xl mx-auto">
          常用漢字2136字の中からランダムに出題。正しい書き順をSVGアニメーションで確認しながら、漢字の筆順を楽しく学習できます。
        </p>
      </header>

      {/* クイズUI（クライアントコンポーネント） */}
      <StrokeOrderQuizClient kanjiData={kanjiData} />

      {/* FAQ セクション */}
      <section className="w-full">
        <h2 className="text-xl font-bold mb-4">よくある質問</h2>
        <Accordion type="multiple" className="w-full">
          <AccordionItem value="what">
            <AccordionTrigger>書き順クイズとは？</AccordionTrigger>
            <AccordionContent>
              漢字の正しい書き順（筆順）を当てるクイズです。漢字が表示され、「正しい書き順を見る」ボタンを押すとSVGアニメーションで正解の筆順を確認できます。学年別に出題範囲を絞り込むこともできます。
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="count">
            <AccordionTrigger>何文字の漢字が出題されますか？</AccordionTrigger>
            <AccordionContent>
              常用漢字2136字すべてから出題されます。学年別フィルターで小学1年〜中学校まで絞り込むこともできます。
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="grade">
            <AccordionTrigger>学年別に出題できますか？</AccordionTrigger>
            <AccordionContent>
              はい。「全学年」「小学1年」〜「小学6年」「中学校」のボタンで学年を選んで出題範囲を絞り込めます。お子さまの学年に合わせた漢字学習にご活用ください。
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="misorder">
            <AccordionTrigger>書き順を間違えやすい漢字は？</AccordionTrigger>
            <AccordionContent>
              「右」「左」「飛」「必」「成」「発」「馬」など、多くの人が書き順を間違えやすい漢字があります。
              間違えやすい漢字に特化したクイズは
              <a href="/lists/misorder" className="text-primary hover:underline mx-1">
                書き順を間違えやすい漢字クイズ
              </a>
              ページで挑戦できます。
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </section>

      {/* 関連リンク */}
      <RelatedLinks
        links={[
          { label: "間違えやすい漢字クイズ", emoji: "✍️", href: "/lists/misorder" },
          { label: "入試頻出漢字", emoji: "🎓", href: "/exam-kanji" },
          { label: "学年別一覧", emoji: "📚", href: "/grade/1" },
        ]}
        className="flex gap-4 text-sm flex-wrap justify-center pt-6 border-t w-full"
      />

      {/* FAQPage JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
    </main>
  );
}
