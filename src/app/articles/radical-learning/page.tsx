import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { getArticle } from "@/lib/articles";
import ArticleLayout from "@/components/articles/ArticleLayout";

const SLUG = "radical-learning";
const article = getArticle(SLUG)!;

export const metadata: Metadata = generatePageMetadata({
  title: article.title,
  description: article.description,
  path: `/articles/${SLUG}`,
  type: "article",
});

export default function Page() {
  return (
    <ArticleLayout slug={SLUG} sources={[]}>
      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        部首は漢字の「意味のヒント」
      </h2>
      <p>
        漢字を1字ずつバラバラに覚えるのは大変です。ところが漢字には、
        意味のつながりごとに共通のパーツ——部首——が付いています。
        「さんずいが付いていたら水に関係する字」「きへんなら木に関係する字」という具合に、
        部首は字の意味を教えてくれるヒントなのです。
      </p>
      <p>
        このヒントを使うと、漢字を「仲間ごとのグループ」で覚えられるようになります。
        1字ずつ丸暗記するより覚える手がかりが増え、初めて見る漢字でも意味の見当がつくようになります。
        この記事では、身近な部首を例に、グループで覚える学習法を紹介します。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        身近な部首と、その仲間の漢字
      </h2>
      <p>
        まずは小学校の漢字によく出てくる部首から見てみましょう。
        どの部首も、もとになった漢字の意味を引き継いでいます。
      </p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">水に関係：さんずい（氵）</p>
        <p className="mb-3">
          「水」が細くなった形。
          <Link href="/kanji/u6D77" className="text-blue-600 hover:text-blue-800 underline">
            「海」
          </Link>
          ・
          <Link href="/kanji/u6C60" className="text-blue-600 hover:text-blue-800 underline">
            「池」
          </Link>
          ・
          <Link href="/kanji/u6CF3" className="text-blue-600 hover:text-blue-800 underline">
            「泳」
          </Link>
          など、水にまつわる字に付きます。→{" "}
          <Link href="/radical/water-radical" className="text-blue-600 hover:text-blue-800 underline">
            さんずいの漢字一覧
          </Link>
        </p>
        <p className="font-semibold mb-2">木に関係：きへん（木）</p>
        <p className="mb-3">
          <Link href="/kanji/u6797" className="text-blue-600 hover:text-blue-800 underline">
            「林」
          </Link>
          ・
          <Link href="/kanji/u6751" className="text-blue-600 hover:text-blue-800 underline">
            「村」
          </Link>
          ・
          <Link href="/kanji/u6821" className="text-blue-600 hover:text-blue-800 underline">
            「校」
          </Link>
          など。木や木材に関係する字の目印です。→{" "}
          <Link href="/radical/tree-radical" className="text-blue-600 hover:text-blue-800 underline">
            きへんの漢字一覧
          </Link>
        </p>
        <p className="font-semibold mb-2">草花に関係：くさかんむり（艹）</p>
        <p className="mb-3">
          <Link href="/kanji/u82B1" className="text-blue-600 hover:text-blue-800 underline">
            「花」
          </Link>
          ・
          <Link href="/kanji/u8349" className="text-blue-600 hover:text-blue-800 underline">
            「草」
          </Link>
          ・
          <Link href="/kanji/u85AC" className="text-blue-600 hover:text-blue-800 underline">
            「薬」
          </Link>
          など。薬も、もとは草からつくられたことを思うと納得です。→{" "}
          <Link href="/radical/grass-radical" className="text-blue-600 hover:text-blue-800 underline">
            くさかんむりの漢字一覧
          </Link>
        </p>
        <p className="font-semibold mb-2">人に関係：にんべん（亻）</p>
        <p className="mb-3">
          <Link href="/kanji/u4F11" className="text-blue-600 hover:text-blue-800 underline">
            「休」
          </Link>
          （人が木のそばでひと休み）・
          <Link href="/kanji/u4F53" className="text-blue-600 hover:text-blue-800 underline">
            「体」
          </Link>
          など、人の動作や状態を表す字に付きます。→{" "}
          <Link href="/radical/person-radical" className="text-blue-600 hover:text-blue-800 underline">
            にんべんの漢字一覧
          </Link>
        </p>
        <p className="font-semibold mb-2">言葉に関係：ごんべん（言）</p>
        <p className="mb-3">
          <Link href="/kanji/u8A71" className="text-blue-600 hover:text-blue-800 underline">
            「話」
          </Link>
          ・
          <Link href="/kanji/u8A9E" className="text-blue-600 hover:text-blue-800 underline">
            「語」
          </Link>
          ・
          <Link href="/kanji/u8A18" className="text-blue-600 hover:text-blue-800 underline">
            「記」
          </Link>
          など、話す・書くに関係する字の目印。→{" "}
          <Link href="/radical/speech-radical" className="text-blue-600 hover:text-blue-800 underline">
            ごんべんの漢字一覧
          </Link>
        </p>
        <p className="font-semibold mb-2">家・屋根に関係：うかんむり（宀）</p>
        <p>
          <Link href="/kanji/u5BB6" className="text-blue-600 hover:text-blue-800 underline">
            「家」
          </Link>
          ・
          <Link href="/kanji/u5B89" className="text-blue-600 hover:text-blue-800 underline">
            「安」
          </Link>
          など。屋根の下の様子を表す字に付きます。→{" "}
          <Link href="/radical/roof-radical" className="text-blue-600 hover:text-blue-800 underline">
            うかんむりの漢字一覧
          </Link>
        </p>
      </div>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        グループで覚える3ステップ
      </h2>
      <p>
        部首を使った学習は、次の3ステップで進めるのがおすすめです。
        新しい漢字を習うたびにやるのではなく、週末などにまとめて「仲間集め」をする形が続けやすいでしょう。
      </p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">ステップ1：仲間を集める</p>
        <p className="mb-3">
          習った漢字の中から、同じ部首の字を集めて並べます。
          「氵の付く字、いくつ知ってる？」とクイズにすると、子どもも乗ってきます。
          <Link href="/radical" className="text-blue-600 hover:text-blue-800 underline">
            部首別一覧
          </Link>
          を見ながら探すと抜けがありません。
        </p>
        <p className="font-semibold mb-2">ステップ2：意味のつながりを話す</p>
        <p className="mb-3">
          「海も池も泳ぐも、ぜんぶ水のことだね」と、部首と意味のつながりを言葉にします。
          「じゃあ、なんで『休』ににんべんが付くんだろう？」のように理由を考えさせると、記憶に残りやすくなります。
        </p>
        <p className="font-semibold mb-2">ステップ3：部首以外の部分に注目して書く</p>
        <p>
          同じ部首の字は、残りの部分だけが違います。「泳」なら氵はもう書けるので、
          覚えるべきは「永」の部分だけ。書き順が不安なときは1字ずつアニメーションで確かめ、
          <Link href="/kanji/u6D77/practice" className="text-blue-600 hover:text-blue-800 underline">
            なぞり書き練習モード
          </Link>
          で手を動かして仕上げます。
        </p>
      </div>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        部首以外の部分は「読み」のヒントになることも
      </h2>
      <p>
        部首が意味のヒントなら、残りの部分は読みのヒントになることがあります。
        たとえば「青（セイ）」を含む「清」「晴」「精」は、いずれも音読みが「セイ」。
        「さんずい＋青なら、水がすんでいて『セイ』と読む字かな」という推測ができるわけです。
        漢字の多くはこのように「意味を表す部分＋音を表す部分」の組み合わせでできているので、
        部首の見方に慣れてくると、習っていない漢字に対しても意味と読みの両方から見当をつけられるようになります。
        高学年や中学の漢字学習で特に効いてくる見方なので、低学年のうちから
        「この字はどんな部品でできている？」と眺める習慣をつけておく価値があります。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        使うときの注意点
      </h2>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>
          すべての漢字で部首の意味がぴったり通るわけではありません。意味がつながる字を中心に使い、
          つながりにくい字は無理にこじつけなくて大丈夫です。
        </li>
        <li>
          部首の名前（さんずい・きへんなど）を先に暗記させる必要はありません。
          まず「同じパーツの仲間がある」という見方が身につけば十分です。
        </li>
        <li>
          似た形の漢字の区別にも部首は役立ちます。関連記事「『未』と『末』の見分け方」のように、
          形が紛らわしい字ほど「どの部分が違うのか」に注目する習慣が効きます。
        </li>
      </ul>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">まとめ</h2>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>部首は漢字の意味を教えてくれるヒント</li>
        <li>同じ部首の字を集めて、グループで覚えると手がかりが増える</li>
        <li>部首の意味とのつながりを言葉にすると記憶に残りやすい</li>
        <li>同じ部首の字は「残りの部分」だけ覚えればよいので負担が減る</li>
      </ul>
      <p>
        まずはお子さんが習ったばかりの漢字の部首をひとつ選んで、仲間集めから始めてみてください。
        散歩や買い物の途中で「さんずいの字、見つけた！」と看板から探すのも、机に向かわずにできるよい練習になります。
        <Link href="/radical" className="text-blue-600 hover:text-blue-800 underline">
          部首別一覧
        </Link>
        には、へん・つくり・かんむりなど位置ごとに部首がまとまっています。
      </p>
    </ArticleLayout>
  );
}
