import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { getArticle } from "@/lib/articles";
import ArticleLayout from "@/components/articles/ArticleLayout";

const SLUG = "tobu-stroke-order";
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
        結論：「飛」は上の「飛ぶ形」から書き始める
      </h2>
      <p>
        「飛」は小学4年生で習う9画の漢字で、「書き順が分からない漢字」の話題で
        真っ先に名前が挙がる字のひとつです。学校で教わる書き順は次のとおりです。
      </p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">飛（9画）</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>1画目：上の横画から折れて、右へ曲がって上にはねる（上の「飞」の外側）</li>
          <li>2画目：そのふところに入れる短い払い</li>
          <li>3画目：その下に打つ点</li>
          <li>4画目：中央の縦画（上から下まで一気に通す柱）</li>
          <li>5画目：縦画の左上にある短い払い</li>
          <li>6画目：その下から左下へ伸びる長い払い</li>
          <li>7画目：左から横画を書き、折れて右へ曲がって上にはねる（下の「飞」の外側）</li>
          <li>8画目：そのふところに入れる短い払い</li>
          <li>9画目：その下に打つ点</li>
        </ul>
      </div>
      <p>
        まとめると「上の飞（3画）→ 中央の柱と左の払い（3画）→ 下の飞（3画）」という
        3つのかたまりを、上から下へ順番に仕上げていく形です。実際の筆の動きは
        <Link href="/kanji/u98DB" className="text-blue-600 hover:text-blue-800 underline">
          「飛」の書き順アニメーション
        </Link>
        で1画ずつ確認できます。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        なぜこの順番？　3つのかたまりで考える
      </h2>
      <p>
        「飛」が難しく感じられるのは、パッと見ただけでは部品の切れ目が分からないからです。
        逆に言えば、かたまりが見えれば急に書きやすくなります。
      </p>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>上のかたまり：曲がってはねる画＋短い払い＋点（鳥が羽を広げたような「飞」の形）</li>
        <li>真ん中のかたまり：縦の柱＋短い払い＋長い払い</li>
        <li>下のかたまり：上とほぼ同じ「飞」の形をもう一度</li>
      </ul>
      <p>
        漢字の筆順には「上から下へ」「外側の枠を作ってから中を埋める」といった大きな原則があり、
        「飛」もこの流れに沿っています。各かたまりの中でも、
        まず外側の大きな曲がりを書いてから、内側の短い払いと点を添える順になっています。
      </p>
      <p>
        なお、学校で教わるこの筆順は「筆順指導の手びき」（文部省、1958年）に沿ったものです。
        手びきは学習の混乱を避けるために一つの筆順を示したもので、
        他の伝統的な筆順を誤りとするものではない、という趣旨もあわせて示されています。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">間違えやすいパターン</h2>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>中央の縦画を1画目に書いてしまう（柱から書き始めたくなりますが、縦画は4画目です）</li>
        <li>逆に、縦画を最後に残してしまう（下の「飞」より先に、真ん中のかたまりを仕上げます）</li>
        <li>上下の「飞」を続けて書いてしまい、真ん中があとまわしになる</li>
        <li>左側の払い2本の順番が入れ替わる（上の短い払いが5画目、長い払いが6画目です）</li>
        <li>1画目の曲がりを2画に分けて数えてしまい、総画数が合わなくなる</li>
      </ul>
      <p>
        いずれも「間違えやすいとされている」ポイントです。特に縦画のタイミングは
        大人でも自己流になっていることが多いので、一度アニメーションと
        見比べてみることをおすすめします。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">覚え方・練習のしかた</h2>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">覚え方のヒント</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>「飞・柱と払い・飞」と3つのかたまりを声に出してから書き始める</li>
          <li>かたまりごとに色を変えてなぞり書きすると、切れ目が目で覚えられる</li>
          <li>「曲がってはねる画は1画で書く」を合言葉に、1画目と7画目を大きく練習する</li>
          <li>「飛行機」「飛び出す」など熟語や文の中で書いて、手になじませる</li>
        </ul>
      </div>
      <p>
        9画を一度に覚えようとせず、まず上の「飞」3画だけを何度か書き、
        次に真ん中、最後に下、と段階を分けて練習すると定着しやすくなります。
        覚えられたと思ったら
        <Link href="/quiz" className="text-blue-600 hover:text-blue-800 underline">
          書き順クイズ
        </Link>
        で確認したり、
        <Link href="/grade/4" className="text-blue-600 hover:text-blue-800 underline">
          小学4年生の漢字一覧
        </Link>
        で他の字とあわせて復習したりしてみてください。
      </p>

      <p>
        形を整えるコツは、4画目の縦画を「字の背骨」と考えることです。
        縦画が上から下までまっすぐ通ると、その左に払い2本、右上と右下に「飞」という配置が
        はっきりして、字全体のバランスが取りやすくなります。
        書き順を覚える段階でも、「4画目で背骨を立てる」と意識すると
        前後の画の位置関係が頭に入りやすくなります。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">まとめ</h2>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>「飛」は9画。「上の飞 → 中央の縦画と左の払い2本 → 下の飞」の順</li>
        <li>中央の縦画は4画目。最初でも最後でもない</li>
        <li>曲がってはねる大きな画（1画目・7画目）は、折れも含めて1画で書く</li>
        <li>3つのかたまりに分けて、上から下へ順に仕上げるのがコツ</li>
      </ul>
    </ArticleLayout>
  );
}
