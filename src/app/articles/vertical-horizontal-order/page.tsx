import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { getArticle } from "@/lib/articles";
import ArticleLayout from "@/components/articles/ArticleLayout";

const SLUG = "vertical-horizontal-order";
const article = getArticle(SLUG)!;

export const metadata: Metadata = generatePageMetadata({
  title: article.title,
  description: article.description,
  path: `/articles/${SLUG}`,
  type: "article",
});

export default function Page() {
  return (
    <ArticleLayout
      slug={SLUG}
      sources={[
        { name: "「筆順指導の手びき」（文部省、1958年）", note: "学校教育における筆順指導の基準" },
        { name: "KanjiVG", url: "https://kanjivg.tagaini.net/", note: "本サイトの書き順データ" },
      ]}
    >
      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">結論：原則は「横が先」、ただし例外がある</h2>
      <p>
        縦の線と横の線が交わるとき、どちらを先に書くか。答えを先に言うと、
        <strong>原則は「横画が先」</strong>です。いちばんシンプルな例が
        <Link href="/kanji/u5341" className="text-blue-600 hover:text-blue-800 underline">「十」</Link>で、
        1画目に横、2画目に縦を書きます。
      </p>
      <p>
        ただし、漢字の筆順はこの原則だけでは説明しきれません。
        <Link href="/kanji/u99AC" className="text-blue-600 hover:text-blue-800 underline">「馬」</Link>や
        <Link href="/kanji/u9577" className="text-blue-600 hover:text-blue-800 underline">「長」</Link>のように
        縦から書き始める字もあります。この記事では、学校で筆順指導のよりどころとされてきた
        「筆順指導の手びき」（文部省、1958年）の考え方に沿って、原則と代表的な例外を整理します。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">大原則：上から下へ、左から右へ</h2>
      <p>
        個別のルールの前に、筆順全体を貫く2つの大原則があります。
      </p>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li><strong>上から下へ</strong>書く（「三」は上の横棒から）</li>
        <li><strong>左から右へ</strong>書く（「川」は左の縦棒から）</li>
      </ul>
      <p>
        「横が先か、縦が先か」という問いは、この大原則の下にあるより細かいルールです。
        迷ったときは、まず「上から下、左から右」に戻って考えると整理しやすくなります。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">原則1：横画と縦画が交わるときは横が先（十・土）</h2>
      <p>
        <Link href="/kanji/u5341" className="text-blue-600 hover:text-blue-800 underline">「十」</Link>は
        1画目が横、2画目が縦。
        <Link href="/kanji/u571F" className="text-blue-600 hover:text-blue-800 underline">「土」</Link>も
        上の横→縦→下の横の順です。多くの漢字はこのパターンに従います。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">原則2：全体をつらぬく縦画は最後（中・車・書）</h2>
      <p>
        縦の線が字の中央を上から下までつらぬく形では、<strong>その縦画を最後に</strong>書きます。
      </p>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>
          <Link href="/kanji/u4E2D" className="text-blue-600 hover:text-blue-800 underline">「中」</Link>（4画）
          — 「口」の部分を3画で書いてから、4画目に中央の縦をつらぬきます。
        </li>
        <li>
          <Link href="/kanji/u8ECA" className="text-blue-600 hover:text-blue-800 underline">「車」</Link>（7画）
          — 上の横→「日」の部分→下の長い横と書き、7画目に縦をつらぬきます。
        </li>
      </ul>
      <p>
        <Link href="/kanji/u66F8" className="text-blue-600 hover:text-blue-800 underline">「書」</Link>（10画）の
        上半分も同じ考え方です。1画目は右上の折れ（横に書いて下へ折れる線）、
        2〜5画目で横画を上から順に書き、<strong>6画目でようやく中央の縦</strong>を通します。
        下の「日」は7画目の左の縦→8画目の折れ→9画目・10画目の横の順です。
        「書」で縦を先に書いてしまう間違いは多いとされていますが、
        「横をぜんぶ書いてから、最後に縦でつらぬく」と覚えれば迷いません。
      </p>

      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">「王」は縦が2画目</p>
        <p>
          <Link href="/kanji/u738B" className="text-blue-600 hover:text-blue-800 underline">「王」</Link>（4画）は
          横→縦→横→横の順で、縦画は2画目です。縦が下の横棒を突き抜けない形なので、
          「つらぬく縦画は最後」のルールには当てはまらない、と一般に説明されます。
          「主」「玉」も同じ仲間です。
        </p>
      </div>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">例外：縦から書き始める「馬」と「長」</h2>
      <p>
        <Link href="/kanji/u99AC" className="text-blue-600 hover:text-blue-800 underline">「馬」</Link>（10画）は
        <strong>1画目が左側の縦画</strong>です。続いて2画目に上の横、3画目に中の縦、
        4・5画目に横を2本、6画目に右側を囲む大きな折れ（最後にはねる）、
        7〜10画目に下の点を左から4つ打ちます。
      </p>
      <p>
        <Link href="/kanji/u9577" className="text-blue-600 hover:text-blue-800 underline">「長」</Link>（8画）も
        <strong>1画目は左上の縦画</strong>。2〜4画目に短い横を上から3本、5画目に左へ突き出る長い横、
        6画目に下の縦（最後に右上へはね上げます）、7画目に左払い、8画目に右払いです。
      </p>
      <p>
        どちらも小学2年生で習う漢字です（<Link href="/grade/2" className="text-blue-600 hover:text-blue-800 underline">2年生の漢字一覧はこちら</Link>）。
        「横が先」の原則を覚えたあとにこの2字に出会うと混乱しやすいので、
        「馬と長は縦から」とセットで覚えてしまうのがおすすめです。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">「田」の中は縦が先</h2>
      <p>
        <Link href="/kanji/u7530" className="text-blue-600 hover:text-blue-800 underline">「田」</Link>（5画）は、
        1画目に外枠の左の縦、2画目に上から右をまわる折れを書いて枠を作り、
        <strong>3画目に中の縦、4画目に中の横</strong>、5画目に下の横で閉じます。
        中の「十」の部分は縦→横の順で、ここも「横が先」の原則の例外にあたります。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">筆順は「唯一の正解」ではない</h2>
      <p>
        学校で教わる筆順のもとになっている「筆順指導の手びき」は、
        学習指導の混乱を避けるために標準を示したものであり、
        <strong>そこに示された以外の筆順を誤りと決めつけるものではない</strong>と明記しています。
        書道の伝統などでは違う順序が使われることもあります。
        とはいえ、標準の筆順は字形を整えやすいように考えられているので、
        学習の基本としてまず身につけておく価値は十分にあります。
      </p>
      <p>
        それぞれの漢字のページでは1画ずつのアニメーションで筆順を確認できます。
        覚えたつもりの字も、<Link href="/quiz" className="text-blue-600 hover:text-blue-800 underline">書き順クイズ</Link>で
        一度チェックしてみてください。
      </p>
    </ArticleLayout>
  );
}
