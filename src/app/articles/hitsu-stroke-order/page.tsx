import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { getArticle } from "@/lib/articles";
import ArticleLayout from "@/components/articles/ArticleLayout";

const SLUG = "hitsu-stroke-order";
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
        結論：「必」は上の点から書き始める
      </h2>
      <p>
        「必」は小学4年生で習う5画の漢字です。学校で教わる書き順は次のとおりです。
      </p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">必（5画）</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>1画目：上の点（中央よりやや左寄りに、ちょんと打つ）</li>
          <li>2画目：ノ（右上から左下へ、字全体を貫く長い払い）</li>
          <li>3画目：曲がり（左から下へ入り、右へカーブして上にはねる）</li>
          <li>4画目：左の点</li>
          <li>5画目：右の点</li>
        </ul>
      </div>
      <p>
        「点 → 払い → 曲がり → 点 → 点」の順です。文字で読むより、
        <Link href="/kanji/u5FC5" className="text-blue-600 hover:text-blue-800 underline">
          「必」の書き順アニメーション
        </Link>
        で筆の動きを一度見てもらうのがいちばん早いと思います。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        「心」を書いてから「ノ」ではない
      </h2>
      <p>
        「必」でいちばん多いつまずきは、形が「心」に似ているために
        「心を書いてから払いを足す」と考えてしまうことです。
        たしかに「必」は字の成り立ちのうえでは「心」と関わりの深い字ですが、
        学校で教わる書き順はまったく別物です。
      </p>
      <p>比べてみましょう。「心」（小学2年生・4画）の書き順はこうです。</p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">心（4画）</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>1画目：左の点</li>
          <li>2画目：曲がり（右へカーブして上にはねる）</li>
          <li>3画目：中央の点</li>
          <li>4画目：右の点</li>
        </ul>
      </div>
      <p>
        「心」は左の点から、「必」は上の点から。書き出しの位置からして違います。
        「必＝心＋ノ」と分解して覚えると書き順まで引きずられてしまうので、
        「必は必の書き順、心は心の書き順」と割り切って別々に覚えるのがおすすめです。
        <Link href="/kanji/u5FC3" className="text-blue-600 hover:text-blue-800 underline">
          「心」の書き順アニメーション
        </Link>
        と見比べると、違いがよく分かります。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        実は昔から複数の書き順がある字
      </h2>
      <p>
        「必」は、書の伝統の中で複数の筆順が伝わってきた字として知られています。
        学校の書き順のよりどころである「筆順指導の手びき」（文部省、1958年）は、
        学習の混乱を避けるために一つの筆順を示したものですが、同時に
        「ここに取りあげた筆順以外のものを誤りとするものではない」という趣旨も明記しています。
      </p>
      <p>
        ですから、おうちの方が子どものころに別の順で習った記憶があっても不思議ではありませんし、
        書道の世界で別の順に出会うこともあるかもしれません。
        そのうえで、学校のテストや日々の練習では、上で示した
        「点 → 払い → 曲がり → 点 → 点」の順で書くのが基本、と押さえておけば大丈夫です。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">間違えやすいパターン</h2>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>「心」を先に書き上げてから、最後に払いを乗せてしまう</li>
        <li>払い（ノ）を1画目にしてしまい、点の置き場所が定まらなくなる</li>
        <li>3つの点を先にまとめて打ってしまう</li>
        <li>2画目の払いが短くなり、字の骨組みが痩せてしまう</li>
      </ul>
      <p>
        いずれも「間違えやすいとされている」パターンです。特に大人になってから
        自己流が固まっているケースは珍しくないので、お子さんと一緒に
        アニメーションで確認してみると発見があるかもしれません。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">覚え方・練習のしかた</h2>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">覚え方のヒント</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>「てん・はらい・まがり・てん・てん」と声に出しながら空書きする</li>
          <li>1画目の点と2画目の払いで字の芯を作り、そこに残りを添えるイメージを持つ</li>
          <li>「心とは別の字」と意識して、心の書き順と交互に書き比べてみる</li>
        </ul>
      </div>
      <p>
        「必」は「必ず」「必要」「必死」など使用場面の多い字です。熟語と一緒に書くと、
        書き順と意味の両方が定着しやすくなります。仕上げに
        <Link href="/quiz" className="text-blue-600 hover:text-blue-800 underline">
          書き順クイズ
        </Link>
        で確認したり、
        <Link href="/grade/4" className="text-blue-600 hover:text-blue-800 underline">
          小学4年生の漢字一覧
        </Link>
        で前後に習う字とあわせて復習したりしてみてください。
      </p>

      <p>
        形を整えるうえでは、1画目の点を中央より少し左寄りに打つのがポイントです。
        そうすると、2画目の払いが点のすぐ右側を通って字の中心を貫き、
        4画目・5画目の点を左右に置く場所が自然に生まれます。
        点の位置が決まると「必」は急に安定するので、
        書き順とあわせて「点をどこに打つか」も意識してみてください。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">まとめ</h2>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>「必」は「上の点 → 払い → 曲がり → 左の点 → 右の点」の5画</li>
        <li>「心＋ノ」と分解しない。心（左の点から）とは書き順が別物</li>
        <li>歴史的には複数の筆順がある字。手びきも他の筆順を誤りとはしていない</li>
        <li>学校では手びきに沿った上記の順で指導されるので、練習はこの順で</li>
      </ul>
    </ArticleLayout>
  );
}
