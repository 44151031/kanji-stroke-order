import { Metadata } from "next";
import Script from "next/script";
import { generatePageMetadata, siteMeta } from "@/lib/metadata";
import Link from "next/link";
import { toUnicodeSlug } from "@/lib/slugHelpers";

export const metadata: Metadata = generatePageMetadata({
  title: "書き順を間違えやすい漢字TOP20",
  description: "多くの人が誤って覚えている漢字の正しい書き順を、アニメ付きでわかりやすく解説します。",
  path: "/articles/common-misorder-kanji",
  type: "article",
});

const misorderKanjiList = [
  { kanji: "九", description: "「一」を先に書きがちだが、縦→横が正" },
  { kanji: "左", description: "「𠂇」を後に書くのが正" },
  { kanji: "右", description: "「𠂇」を先に書くのが正" },
  { kanji: "成", description: "横棒よりも縦が先" },
  { kanji: "区", description: "「㇆」のタイミングを誤りやすい" },
  { kanji: "武", description: "「一」は最後" },
  { kanji: "飛", description: "左右対称に見えるが、左翼から書く" },
  { kanji: "非", description: "2画目が内側に入る" },
  { kanji: "然", description: "「火」の部分は下から" },
  { kanji: "録", description: "「金」へんの1画目は縦から" },
  { kanji: "券", description: "「刀」の部分の書き順に注意" },
  { kanji: "並", description: "縦線の順序を誤りやすい" },
  { kanji: "斜", description: "「余」の部分の書き順" },
  { kanji: "祭", description: "「示」の部分の書き順" },
  { kanji: "料", description: "「米」と「斗」の順序" },
  { kanji: "点", description: "「占」の部分の書き順" },
  { kanji: "焼", description: "「火」へんの書き順" },
  { kanji: "働", description: "「動」の部分の書き順" },
  { kanji: "続", description: "「糸」へんの書き順" },
  { kanji: "感", description: "「心」の部分の書き順" },
];

export default function CommonMisorderKanjiPage() {
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": ["Article", "HowTo"],
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${siteMeta.url}/articles/common-misorder-kanji`,
    },
    "headline": "書き順を間違えやすい漢字TOP20",
    "description": "多くの人が誤って覚えている漢字の正しい書き順を、アニメ付きでわかりやすく解説します。",
    "image": `${siteMeta.url}/ogp.png`,
    "author": {
      "@type": "Organization",
      "name": "漢字書き順ナビ運営事務局",
      "url": siteMeta.url,
    },
    "publisher": {
      "@type": "Organization",
      "name": siteMeta.siteName,
      "logo": {
        "@type": "ImageObject",
        "url": `${siteMeta.url}${siteMeta.logo}`,
        "width": 512,
        "height": 512,
      },
    },
    "datePublished": "2025-12-03",
    "dateModified": "2025-12-03",
    "inLanguage": "ja",
    "license": "https://creativecommons.org/licenses/by-sa/3.0/",
    "about": [
      { "@type": "Thing", "name": "漢字" },
      { "@type": "Thing", "name": "書き順" },
      { "@type": "Thing", "name": "筆順" },
    ],
    "step": [
      {
        "@type": "HowToStep",
        "name": "間違えやすい漢字を確認する",
        "text": "九・左・右・区・成・武・非・飛 など、多くの人が誤って覚えている書き順を確認しましょう。",
      },
      {
        "@type": "HowToStep",
        "name": "正しい書き順を学ぶ",
        "text": "各漢字のページ（例：/kanji/u53f3）で、正しい筆順アニメーションを確認できます。",
      },
      {
        "@type": "HowToStep",
        "name": "練習・復習",
        "text": "音読み・訓読み・画数を併せて覚えると記憶が定着します。",
      },
    ],
  };

  return (
    <>
      <Script
        id="article-structured-data"
        type="application/ld+json"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="max-w-[800px] mx-auto">
        <article className="prose prose-neutral max-w-none">
        <h1 className="text-2xl font-bold mb-6">📰 書き順を間違えやすい漢字TOP20</h1>

        <div className="text-muted-foreground leading-relaxed mb-8">
          <p>
            多くの人が間違えて覚えている漢字の書き順を、正しい筆順アニメーション付きで紹介します。
            漢字検定・入試・教育現場でも頻出の項目です。
          </p>
        </div>

        <div className="space-y-6 mb-8">
          {misorderKanjiList.map((item, index) => (
            <div key={item.kanji} className="border-b border-gray-200 pb-4 last:border-b-0">
              <h2 className="text-lg font-semibold mb-2">
                {index + 1}. {item.kanji}
              </h2>
              <p className="text-sm text-muted-foreground mb-3">{item.description}</p>
              <Link
                href={`/kanji/${toUnicodeSlug(item.kanji)}`}
                className="inline-block text-sm text-blue-600 hover:text-blue-800 underline"
              >
                → {item.kanji}の書き順を見る
              </Link>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">それぞれの正しい書き順は以下から確認できます：</h2>
          <div className="space-y-2">
            <p>
              <Link
                href="/kanji/u53f3"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                👉 右の書き順を見る
              </Link>
            </p>
            <p>
              <Link
                href="/kanji/u5de6"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                👉 左の書き順を見る
              </Link>
            </p>
            <p>
              <Link
                href="/kanji/u6210"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                👉 成の書き順を見る
              </Link>
            </p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground leading-relaxed mb-8">
          <p>教育目的・筆順理解の参考としてご利用ください。</p>
        </div>

        {/* 関連記事セクション（将来の拡張用） */}
        <div className="border-t border-gray-200 pt-8 mt-8">
          <h2 className="text-lg font-semibold mb-4">関連記事</h2>
          <div className="text-sm text-muted-foreground">
            {/* 将来の記事リンクをここに追加 */}
          </div>
        </div>
      </article>
    </div>
    </>
  );
}


