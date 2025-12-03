import { FC } from "react";

/**
 * 漢字ページ用JSON-LD構造化データコンポーネント
 * 各漢字ページで呼び出して構造化データを挿入する
 */

interface KanjiStructuredDataProps {
  kanji: string;
  meaning: string;
  strokeCount: number;
  grade?: number;
  onYomi?: string[];
  kunYomi?: string[];
  jlpt?: string | null;
}

export const KanjiStructuredData: FC<KanjiStructuredDataProps> = ({
  kanji,
  meaning,
  strokeCount,
  grade,
  onYomi = [],
  kunYomi = [],
  jlpt,
}) => {
  const hex = kanji.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0");
  const siteUrl = "https://kanji-stroke-order.com";
  const gradeLabel = grade
    ? grade <= 6
      ? `小学${grade}年生`
      : "中学校"
    : undefined;

  const data = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    "@id": `${siteUrl}/kanji/u${hex}`,
    name: kanji,
    alternateName: `${kanji}の書き順`,
    description: `${kanji}（${meaning}）の正しい書き順・画数・部首・読み方を解説します。`,
    inDefinedTermSet: {
      "@type": "DefinedTermSet",
      name: "常用漢字",
      url: siteUrl,
    },
    inLanguage: "ja",
    url: `${siteUrl}/kanji/u${hex}`,
    termCode: `U+${hex}`,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "画数",
        value: strokeCount,
      },
      ...(gradeLabel
        ? [
            {
              "@type": "PropertyValue",
              name: "学年",
              value: gradeLabel,
            },
          ]
        : []),
      ...(onYomi.length > 0
        ? [
            {
              "@type": "PropertyValue",
              name: "音読み",
              value: onYomi.join("、"),
            },
          ]
        : []),
      ...(kunYomi.length > 0
        ? [
            {
              "@type": "PropertyValue",
              name: "訓読み",
              value: kunYomi.join("、"),
            },
          ]
        : []),
      ...(jlpt
        ? [
            {
              "@type": "PropertyValue",
              name: "JLPT",
              value: jlpt,
            },
          ]
        : []),
    ],
    publisher: {
      "@type": "Organization",
      name: "漢字書き順ナビ",
      url: siteUrl,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
};

export default KanjiStructuredData;

