import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { getArticle } from "@/lib/articles";
import ArticleLayout from "@/components/articles/ArticleLayout";

const SLUG = "kanji-practice-methods";
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
        結論：書く回数を増やすより、「近づき方」を変える
      </h2>
      <p>
        「10回ずつ書いたのに、次の日には忘れている」——漢字練習でよくある悩みです。
        こういうとき、つい「じゃあ20回書こう」と回数を増やしたくなりますが、
        手だけが自動的に動いて頭が働いていない状態で何回書いても、記憶には残りにくいものです。
      </p>
      <p>
        覚えにくいときに効果的なのは、回数ではなく漢字への「近づき方」を変えることです。
        この記事では、動きから入る・分けて覚える・意味とセットにする・思い出す練習をする・時間を空けて復習する、
        という5つの工夫を、家庭でそのまま使える形で紹介します。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        工夫1：書き順の「動き」から入る
      </h2>
      <p>
        漢字を静止画として見ると、線の集まりにしか見えず、細部を覚えるのが大変です。
        一方、書き順という「動き」で捉えると、漢字は「まずここから始めて、こう進む」という一連の流れになり、
        手の記憶として残りやすくなります。ダンスの振り付けを、写真ではなく実際の動きで覚えるのと同じ理屈です。
      </p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">動きから覚える手順</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>書き順アニメーションを見て、画の順番と方向を目で追う</li>
          <li>アニメーションに合わせて、指で宙に大きく書く（空書き）</li>
          <li>
            <Link href="/kanji/u53F3/practice" className="text-blue-600 hover:text-blue-800 underline">
              なぞり書き練習モード
            </Link>
            で、お手本の上をなぞって手の動きを確かめる
          </li>
          <li>最後に何も見ずに紙に書いてみる</li>
        </ul>
      </div>
      <p>
        たとえば1年生で習う
        <Link href="/kanji/u53F3" className="text-blue-600 hover:text-blue-800 underline">
          「右」の書き順
        </Link>
        と
        <Link href="/kanji/u5DE6" className="text-blue-600 hover:text-blue-800 underline">
          「左」の書き順
        </Link>
        は1画目が違いますが、これも文字で説明されるより、アニメーションで動きを見比べるほうがずっと頭に入りやすいはずです。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        工夫2：部品に分けて覚える
      </h2>
      <p>
        画数の多い漢字を1本ずつの線として覚えようとすると、覚える量が多すぎてパンクします。
        そこで、漢字を意味のある「部品」のまとまりに分けてみましょう。
        たとえば「休」は「人（にんべん）＋木」、「泳」は「水（さんずい）＋永」。
        線が10本以上あっても、部品としてはたった2つです。
      </p>
      <p>
        部品の代表が部首です。部首は意味のヒントにもなるので、
        「さんずいだから水に関係する字だな」というように、形と意味を同時に整理できます。
        身近な部首は
        <Link href="/radical" className="text-blue-600 hover:text-blue-800 underline">
          部首別一覧
        </Link>
        でまとめて眺められます。分け方の詳しい活用法は、関連記事「部首を使って漢字を覚える方法」で紹介しています。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        工夫3：読み・意味・使う場面をセットにする
      </h2>
      <p>
        形だけを練習した漢字は、テストで「読みは分かるのに書けない」「書けるのに文の中で使えない」
        という中途半端な覚え方になりがちです。形・読み・意味・使う場面はセットで練習しましょう。
      </p>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>書くときに読みを声に出す（「やす-む、休む」と言いながら書く）</li>
        <li>その漢字を使った短い文を1つ作る（「日曜日は家で休む」）</li>
        <li>知っている言葉と結びつける（「休」なら「休み時間」「夏休み」）</li>
      </ul>
      <p>
        自分の生活に引きつけた文を作ると、「自分ごと」になって思い出すきっかけが増えます。
        文を作るのが難しい低学年の子には、保護者が例文を言って子どもがその中の漢字を書く、という分担でも十分です。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        工夫4：「思い出す練習」を入れる
      </h2>
      <p>
        お手本を見ながら書き写すのは、実は頭にあまり負荷がかかっていません。
        記憶を強くするのは、何も見ずに思い出そうとがんばる時間です。
        練習の最後には必ず「お手本を隠して書く」段階を入れましょう。
        書けなければお手本を見直せばよいだけで、間違えること自体が悪いわけではありません。
        むしろ「思い出そうとして、確かめる」の往復が記憶を定着させます。
      </p>
      <p>
        書き順まで含めて確認したいときは、
        <Link href="/quiz" className="text-blue-600 hover:text-blue-800 underline">
          書き順クイズ
        </Link>
        が使えます。ゲーム感覚で「思い出す練習」ができるので、書き取りに飽きたときの気分転換にもなります。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        工夫5：1回にまとめず、時間を空けて復習する
      </h2>
      <p>
        同じ30分を使うなら、1日に30分まとめて練習するより、10分ずつ日を分けたほうが忘れにくくなります。
        少し忘れかけたころに思い出し直すことで、記憶が上書きされて長持ちするからです。
      </p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">復習スケジュールの目安</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li>練習した翌日に、お手本を見ずに書けるかテスト</li>
          <li>数日後にもう一度。書けた字は間隔をさらにあけてよい</li>
          <li>書けなかった字だけを次の練習の最初に回す</li>
        </ul>
      </div>
      <p>
        ポイントは「全部を毎日」ではなく「あやしい字だけを短く何度も」。
        すでに書ける字の練習を減らせるので、トータルの負担はむしろ軽くなります。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">まとめ</h2>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>回数を増やすより、近づき方を変える</li>
        <li>書き順アニメーションと空書き・なぞり書きで「動き」から覚える</li>
        <li>部首・部品に分けて、覚える量を減らす</li>
        <li>読み・意味・使う場面をセットにして練習する</li>
        <li>お手本を隠して「思い出す練習」を必ず入れる</li>
        <li>1回にまとめず、時間を空けて短く復習する</li>
      </ul>
      <p>
        どの工夫も特別な教材はいりません。今日の宿題からひとつ試してみてください。
        学年ごとの漢字は
        <Link href="/grade/1" className="text-blue-600 hover:text-blue-800 underline">
          学年別一覧
        </Link>
        から、1字ずつアニメーション付きで確認できます。
      </p>
    </ArticleLayout>
  );
}
