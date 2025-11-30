import { Metadata } from "next";
import KanjiDetailClient from "./KanjiDetailClient";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const character = decodeURIComponent(slug);
  return {
    title: `「${character}」の書き順 | 漢字書き順`,
    description: `「${character}」の正しい書き順をアニメーションで学びましょう。筆順を視覚的に確認できます。`,
    openGraph: {
      title: `「${character}」の書き順`,
      description: `「${character}」の正しい書き順をアニメーションで学びましょう。`,
    },
  };
}

export default async function KanjiDetailPage({ params }: Props) {
  const { slug } = await params;
  const character = decodeURIComponent(slug);

  return <KanjiDetailClient character={character} />;
}


