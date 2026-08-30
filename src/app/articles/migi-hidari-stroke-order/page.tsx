import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { getArticle } from "@/lib/articles";
import ArticleLayout from "@/components/articles/ArticleLayout";

const SLUG = "migi-hidari-stroke-order";
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
      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        結論：「右」は払いが先、「左」は横棒が先
      </h2>
      <p>
        「右」と「左」は、どちらも上に「ノ」と「一」を組み合わせた形（𠂇）を持つ、よく似た漢字です。
        それなのに、学校で教わる書き順では1画目が違います。
      </p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">右（5画）</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>1画目：ノ（左払い）</li>
          <li>2画目：一（横画）</li>
          <li>3画目：口の左の縦画</li>
          <li>4画目：口の上から右への折れ</li>
          <li>5画目：口の下の横画</li>
        </ul>
        <p className="font-semibold mt-4 mb-2">左（5画）</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>1画目：一（横画）</li>
          <li>2画目：ノ（左払い）</li>
          <li>3画目：工の上の横画</li>
          <li>4画目：工の縦画</li>
          <li>5画目：工の下の横画</li>
        </ul>
      </div>
      <p>
        つまり、出だしがちょうど反対なのです。実際の筆の動きは、
        <Link href="/kanji/u53F3" className="text-blue-600 hover:text-blue-800 underline">
          「右」の書き順アニメーション
        </Link>
        と
        <Link href="/kanji/u5DE6" className="text-blue-600 hover:text-blue-800 underline">
          「左」の書き順アニメーション
        </Link>
        で1画ずつ確認できます。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        なぜ1画目が違うの？　字の形をよく見ると分かる
      </h2>
      <p>
        鍵になるのは、「ノ」と「一」の長さのバランスです。2つの字を並べてよく見てみてください。
      </p>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>「右」は、横画（一）が長く、払い（ノ）は短めです。</li>
        <li>「左」は、払い（ノ）が長く伸び、横画（一）は短めです。</li>
      </ul>
      <p>
        一般に、こうした形では「短い画を先に書き、長い画をあとにゆったり書くと形が整いやすい」と説明されます。
        右は短い払いを先に、長い横画をあとに。左は短い横画を先に、長い払いをあとに。
        あとに書く画のほうが長い、と考えると2つの書き順はきれいにつながります。
      </p>
      <p>
        また、字源の面からは、篆書（古い書体）の時代の筆の流れの違いが楷書の筆順に受け継がれた、
        という説明もよくなされます。「右」と「左」はもともと右手・左手をかたどった字で、
        手の向きが逆であるため筆の運びも逆になった、と一般に説明されています。
        いずれも「そう説明されることが多い」という性質のものですが、
        形のバランスとあわせて知っておくと納得しやすいはずです。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        学校の書き順のよりどころ：「筆順指導の手びき」
      </h2>
      <p>
        学校で教わる書き順は、1958年（昭和33年）に文部省が示した「筆順指導の手びき」が基準になっています。
        「右は払いから、左は横から」という書き順も、この手びきに沿って指導されるものです。
      </p>
      <p>
        ただし手びき自体は、「ここに取りあげた筆順以外のものを誤りとするものではない」という趣旨を明記しています。
        書写の伝統の中には別の順で書く流儀もあり、それらを「間違い」と断じているわけではありません。
        学校のテストや練習では手びきの順で書くのが基本、と押さえておけば十分です。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">間違えやすいパターン</h2>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>「右」も「左」も横画から書いてしまう（右の1画目は払いです）</li>
        <li>「右」も「左」も払いから書いてしまう（左の1画目は横画です）</li>
        <li>どちらか一方だけ覚えていて、もう一方をそれに引きずられて書いてしまう</li>
      </ul>
      <p>
        似た形なのでどちらかに統一したくなるのが自然ですが、この2字は「反対」とセットで覚えるのがコツです。
        なお似た形を含む他の字では、「有」は右と同じく払いが先、
        「友」「存」「在」は左と同じく横画が先と、それぞれの字ごとに指導される順が決まっています。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">覚え方・練習のしかた</h2>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">覚え方のヒント</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>「あとに書く画のほうが長い」——右は横画が、左は払いが長い</li>
          <li>「みぎのノ、ひだりのイチが先」と口に出してリズムで覚える</li>
          <li>書き出しの1画目だけを何度もなぞって、手に覚えさせる</li>
        </ul>
      </div>
      <p>
        「右」「左」はどちらも
        <Link href="/grade/1" className="text-blue-600 hover:text-blue-800 underline">
          小学1年生で習う漢字
        </Link>
        です。習いたての時期に1画目を正しく身につけておくと、あとで直す苦労がありません。
        アニメーションを見ながら指で空書きし、覚えたつもりになったら
        <Link href="/quiz" className="text-blue-600 hover:text-blue-800 underline">
          書き順クイズ
        </Link>
        で確かめてみてください。
      </p>

      <p>
        練習するときは、1文字ずつばらばらに書くより、「左右」「右手と左手」「右にまがる、左にまがる」のように
        2字をセットにした言葉や短い文で書くのがおすすめです。右と左を続けて書くと、
        書き出しが反対であることを毎回手が思い出してくれるので、記憶がまざりにくくなります。
        ノートのすみに「右左右左…」と交互に書いてみるだけでも、よい練習になります。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">まとめ</h2>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>「右」は1画目がノ（左払い）、2画目が一（横画）</li>
        <li>「左」は1画目が一（横画）、2画目がノ（左払い）</li>
        <li>「あとに書く画のほうが長い」と考えると整理しやすい</li>
        <li>学校の書き順は「筆順指導の手びき」が基準。ただし他の伝統的な筆順を誤りとする趣旨ではない</li>
      </ul>
    </ArticleLayout>
  );
}
