import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { getArticle } from "@/lib/articles";
import ArticleLayout from "@/components/articles/ArticleLayout";

const SLUG = "tsuchi-samurai-difference";
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
      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">結論：下の横棒が長いのが「土」、短いのが「士」</h2>
      <p>
        「土（つち）」と「士（し）」の違いは、<strong>2本の横棒の長さのバランス</strong>だけです。
      </p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>土</strong> — 上の横棒が短く、<strong>下の横棒が長い</strong>。どっしり安定した形。</li>
          <li><strong>士</strong> — 上の横棒が長く、<strong>下の横棒が短い</strong>。すらりと立った形。</li>
        </ul>
      </div>
      <p>
        どちらもわずか3画。それなのに、手書きでは横棒の長さが曖昧になって
        取り違えやすいとされています。印刷の小さな文字では大人でも見間違えることがあるほどです。
        見分けの軸を一度はっきりさせておきましょう。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">成り立ちのイメージで覚える</h2>
      <p>
        <strong>「土」</strong>は、大地の上に土が盛り上がったさまをかたどった字と説明されることが多い漢字です。
        下の長い横棒を「地面」だと考えると、
        <strong>地面がいちばん広い（＝下が長い）</strong>というイメージがそのまま字形につながります。
      </p>
      <p>
        <strong>「士」</strong>は、成り立ちには諸説ありますが、
        りっぱな成人男性や役人を表す字として使われてきました。
        覚え方としては、<strong>肩幅の広い人がすっと立っている姿</strong>を思い浮かべて、
        「上（肩）が広く、下（足元）は閉じている」とイメージすると忘れにくくなります。
      </p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">ひとことで覚えるなら</p>
        <p>
          「<strong>土は地面が長い、士は肩が広い</strong>」。
          書く直前にこのフレーズを思い出すだけで、ほぼ迷わなくなります。
        </p>
      </div>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">熟語で使い分けを確認する</h2>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">土（つち・大地）</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>土地</strong> — 大地・地面</li>
          <li><strong>粘土</strong> — ねばりけのある土</li>
          <li><strong>土曜日</strong> — 曜日の「ど」</li>
        </ul>
        <p className="font-semibold mt-4 mb-2">士（りっぱな人・資格を持つ人）</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>武士</strong> — さむらい</li>
          <li><strong>博士</strong> — 学問を修めた人</li>
          <li><strong>弁護士</strong> — 資格を持つ専門家</li>
        </ul>
      </div>
      <p>
        「士」は武士・博士・弁護士・栄養士のように<strong>「人」を表す言葉の後ろ</strong>につくのが特徴です。
        「〜する人」の意味なら「士」、土や地面に関係するなら「土」、と用途で判断できます。
        読みで見分けることもできます。「土」は「ド・ト・つち」（土曜・土地・土いじり）、
        「士」は「シ」（武士・博士）。「シ」と読んでいたら、
        書くのはほぼ間違いなく上の横棒が長い「士」です。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">書き順は2字とも同じ「横→縦→横」</h2>
      <p>
        本サイトの書き順データで確認すると、
        <Link href="/kanji/u571F" className="text-blue-600 hover:text-blue-800 underline">「土」</Link>も
        <Link href="/kanji/u58EB" className="text-blue-600 hover:text-blue-800 underline">「士」</Link>も
        3画で、順序は同じです。
      </p>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li><strong>1画目：</strong>上の横棒（土は短く、士は長く）</li>
        <li><strong>2画目：</strong>中央の縦棒を上から下へ</li>
        <li><strong>3画目：</strong>下の横棒（土は長く、士は短く）</li>
      </ul>
      <p>
        「横画と縦画が交わるときは横が先」という筆順の原則どおりの、素直な書き順です。
        違いはやはり<strong>横棒の長さだけ</strong>。1画目を書く瞬間に
        「これは地面の土？　それとも肩幅の士？」と意識するのがコツです。
        なお、どちらの字も縦棒は下の横棒を突き抜けません。
        縦棒が下まで突き出てしまうと別の字のように見えてしまうので、
        下の横棒の上でしっかり止めるように書きましょう。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">ほかの漢字の中でも役に立つ見分け方</h2>
      <p>
        「土」と「士」の区別は、この2字だけの話では終わりません。
        ほかの漢字の部品として登場したときにも効いてきます。
      </p>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>
          <strong>「土」が部品になる例：</strong>「地」「場」「坂」などの<strong>つちへん</strong>。
          意味も土地・地面に関係します。
        </li>
        <li>
          <strong>「士」が部品になる例：</strong>「吉」「売」「声」の上部は、
          上の横棒が長い「士」の形で書くのが標準的とされています。
        </li>
      </ul>
      <p>
        「この部品は土なのか士なのか」を意識して書く習慣がつくと、
        漢字全体の形が整い、細部まで正確に覚えられるようになります。
        横棒の長さのような小さな違いに目を向けることは、
        漢字学習全体の観察力を育てるトレーニングにもなるのです。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">練習のヒント</h2>
      <p>
        「土」は<Link href="/grade/1" className="text-blue-600 hover:text-blue-800 underline">小学1年生</Link>、
        「士」は<Link href="/grade/4" className="text-blue-600 hover:text-blue-800 underline">小学4年生</Link>で習います。
        先に「土」をしっかり覚えている子ほど、「士」が出てきたときに
        横棒の長さを意識せず書いてしまいがちなので、
        「武士」「博士」など熟語ごと書いて比べる練習がおすすめです。
        ほかの紛らわしいペアは<Link href="/confused-kanji" className="text-blue-600 hover:text-blue-800 underline">間違えやすい漢字の一覧</Link>で、
        理解度は<Link href="/quiz" className="text-blue-600 hover:text-blue-800 underline">書き順クイズ</Link>でチェックできます。
      </p>
    </ArticleLayout>
  );
}
