// ============================================
// 📰 記事レジストリ
// ============================================
// 記事一覧ページ・sitemap・記事間の相互リンクを一元管理する。
// 新しい記事を追加するときは、src/app/articles/<slug>/page.tsx を作成し、
// ここに1エントリ追加する。

export interface ArticleEntry {
  slug: string;
  title: string;
  description: string;
  /** YYYY-MM-DD */
  datePublished: string;
  /** YYYY-MM-DD */
  dateModified: string;
  category: "書き順" | "似ている漢字" | "覚え方・学習法" | "学年別";
  /** 記事内で主に扱う漢字（記事一覧・関連リンクの表示に使用） */
  kanji: string[];
  /** 関連記事slug（相互リンク用） */
  related: string[];
}

export const articles: ArticleEntry[] = [
  {
    slug: "migi-hidari-stroke-order",
    title: "「右」と「左」で書き順が違うのはなぜ？",
    description:
      "「右」は払いが先、「左」は横棒が先。似た形なのに1画目が違う理由を、筆順指導の手びきの考え方と字源から解説します。",
    datePublished: "2026-08-30",
    dateModified: "2026-08-30",
    category: "書き順",
    kanji: ["右", "左"],
    related: ["vertical-horizontal-order", "hitsu-stroke-order", "common-misorder-kanji"],
  },
  {
    slug: "hitsu-stroke-order",
    title: "「必」の書き順と間違えやすいポイント",
    description:
      "「心」に似ているのに書き順がまったく違う「必」。学校で教わる筆順と、間違えやすいパターン、覚えるためのコツを解説します。",
    datePublished: "2026-08-30",
    dateModified: "2026-08-30",
    category: "書き順",
    kanji: ["必"],
    related: ["migi-hidari-stroke-order", "tobu-stroke-order", "common-misorder-kanji"],
  },
  {
    slug: "tobu-stroke-order",
    title: "「飛」の書き順と間違えやすいポイント",
    description:
      "書き順の質問が多い漢字の代表「飛」。9画をどの順番で書くのか、どこでつまずきやすいのかを1画ずつ解説します。",
    datePublished: "2026-08-30",
    dateModified: "2026-08-30",
    category: "書き順",
    kanji: ["飛"],
    related: ["hitsu-stroke-order", "totsu-ou-stroke-order", "common-misorder-kanji"],
  },
  {
    slug: "vertical-horizontal-order",
    title: "縦と横、どちらを先に書く？「書」「馬」「長」で学ぶ筆順の原則",
    description:
      "「十」は横が先、では「書」や「馬」は？縦画と横画が交わるときの筆順の原則と代表的な例外を、実例で解説します。",
    datePublished: "2026-08-30",
    dateModified: "2026-08-30",
    category: "書き順",
    kanji: ["書", "馬", "長", "十", "田", "王"],
    related: ["migi-hidari-stroke-order", "totsu-ou-stroke-order"],
  },
  {
    slug: "mi-matsu-difference",
    title: "「未」と「末」の見分け方と覚え方",
    description:
      "上の横棒が短いのが「未」、長いのが「末」。字源から意味の違いを理解して、二度と迷わなくなる覚え方を紹介します。",
    datePublished: "2026-08-30",
    dateModified: "2026-08-30",
    category: "似ている漢字",
    kanji: ["未", "末"],
    related: ["tsuchi-samurai-difference", "radical-learning"],
  },
  {
    slug: "tsuchi-samurai-difference",
    title: "「土」と「士」の違いと覚え方",
    description:
      "下の横棒が長いのが「土」、短いのが「士」。3画しかないのに間違えやすい2字を、成り立ちと熟語から確実に見分ける方法。",
    datePublished: "2026-08-30",
    dateModified: "2026-08-30",
    category: "似ている漢字",
    kanji: ["土", "士"],
    related: ["mi-matsu-difference", "radical-learning"],
  },
  {
    slug: "kanji-practice-methods",
    title: "漢字が覚えにくいときの練習方法",
    description:
      "ただ繰り返し書くだけでは覚えにくい子のために。書き順・部首・読み・使う場面から漢字に近づく、家庭でできる練習の工夫を紹介します。",
    datePublished: "2026-08-30",
    dateModified: "2026-08-30",
    category: "覚え方・学習法",
    kanji: [],
    related: ["radical-learning", "grade1-difficult-kanji"],
  },
  {
    slug: "radical-learning",
    title: "部首を使って漢字を覚える方法",
    description:
      "部首は漢字の「意味のヒント」。さんずい・きへん・くさかんむりなど身近な部首から、漢字をグループで覚える学習法を解説します。",
    datePublished: "2026-08-30",
    dateModified: "2026-08-30",
    category: "覚え方・学習法",
    kanji: ["海", "林", "花"],
    related: ["kanji-practice-methods", "mi-matsu-difference"],
  },
  {
    slug: "grade1-difficult-kanji",
    title: "小学1年生の漢字80字：つまずきやすい漢字と練習のポイント",
    description:
      "小1で習う80字のうち、書き順や形でつまずきやすい漢字はどれか。「右」「左」「九」「女」などを例に、練習のポイントを解説します。",
    datePublished: "2026-08-30",
    dateModified: "2026-08-30",
    category: "学年別",
    kanji: ["右", "左", "九", "女", "水", "火"],
    related: ["migi-hidari-stroke-order", "kanji-practice-methods"],
  },
  {
    slug: "totsu-ou-stroke-order",
    title: "「凸」と「凹」の書き順",
    description:
      "常用漢字の中でも特に書き順を調べられることが多い「凸」「凹」。どちらも5画で書く手順を、1画ずつ図解の順番で解説します。",
    datePublished: "2026-08-30",
    dateModified: "2026-08-30",
    category: "書き順",
    kanji: ["凸", "凹"],
    related: ["tobu-stroke-order", "vertical-horizontal-order"],
  },
  {
    slug: "common-misorder-kanji",
    title: "書き順を間違えやすい漢字TOP20",
    description:
      "多くの人が誤って覚えている漢字の正しい書き順を、アニメ付きでわかりやすく解説します。",
    datePublished: "2025-12-03",
    dateModified: "2025-12-03",
    category: "書き順",
    kanji: ["九", "左", "右", "成", "区", "武", "飛"],
    related: ["migi-hidari-stroke-order", "hitsu-stroke-order", "tobu-stroke-order"],
  },
];

export function getArticle(slug: string): ArticleEntry | undefined {
  return articles.find((a) => a.slug === slug);
}

export function getRelatedArticles(slug: string): ArticleEntry[] {
  const article = getArticle(slug);
  if (!article) return [];
  return article.related
    .map((s) => getArticle(s))
    .filter((a): a is ArticleEntry => a !== undefined);
}

/** 指定した漢字を扱っている記事の一覧（漢字ページからの逆引き用） */
export function getArticlesByKanji(kanji: string): ArticleEntry[] {
  return articles.filter((a) => a.kanji.includes(kanji));
}
