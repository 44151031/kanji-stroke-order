import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { getArticle } from "@/lib/articles";
import ArticleLayout from "@/components/articles/ArticleLayout";

const SLUG = "grade1-difficult-kanji";
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
        {
          name: "小学校学習指導要領 別表「学年別漢字配当表」（文部科学省）",
          note: "第1学年で学習する漢字80字の根拠",
        },
        {
          name: "「筆順指導の手びき」（文部省、1958年）",
          note: "学校教育における筆順指導の基準",
        },
        {
          name: "KanjiVG",
          url: "https://kanjivg.tagaini.net/",
          note: "本サイトの書き順データ",
        },
      ]}
    >
      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        小1の80字、つまずきやすいのはどんな字？
      </h2>
      <p>
        小学1年生で習う漢字は、学習指導要領の「学年別漢字配当表」で80字と決まっています。
        一・二・三のように迷いようのない字も多い一方、
        習いたての時期だからこそ書き順や形の癖がつきやすい字がいくつかあります。
        代表的なのは、1画目を間違えやすい「右」「左」「九」「女」「子」、
        書く順番のルールが見えにくい「水」「火」、囲む形の「田」「出」、そして画数が増えてくる「年」あたりです。
      </p>
      <p>
        この記事では、この10字を取り上げて、どこでつまずきやすいか・どう練習すればよいかを解説します。
        80字の全体は
        <Link href="/grade/1" className="text-blue-600 hover:text-blue-800 underline">
          小学1年生の漢字一覧
        </Link>
        で、1字ずつ書き順アニメーション付きで確認できます。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        1画目を間違えやすい字：右・左・九・女・子
      </h2>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">右と左：1画目が反対</p>
        <p className="mb-3">
          <Link href="/kanji/u53F3" className="text-blue-600 hover:text-blue-800 underline">
            「右」の書き順
          </Link>
          は1画目がノ（左払い）、2画目が横画。
          <Link href="/kanji/u5DE6" className="text-blue-600 hover:text-blue-800 underline">
            「左」の書き順
          </Link>
          はその逆で、1画目が横画、2画目がノです。
          似た形なのに出だしが反対なので、どちらかに引きずられがちです。
          「あとに書く画のほうが長い」（右は横画が長く、左は払いが長い）と覚えると整理できます。
        </p>
        <p className="font-semibold mb-2">九：ノが先</p>
        <p className="mb-3">
          <Link href="/kanji/u4E5D" className="text-blue-600 hover:text-blue-800 underline">
            「九」
          </Link>
          は2画の字ですが、1画目はノ（左払い）、2画目が横から折れてはねる画です。
          曲がる画から書き始めてしまう間違いがとても多い字です。
        </p>
        <p className="font-semibold mb-2">女：横棒は最後</p>
        <p className="mb-3">
          <Link href="/kanji/u5973" className="text-blue-600 hover:text-blue-800 underline">
            「女」
          </Link>
          は、1画目が「く」の字のように折れる画、2画目がノ、そして3画目の横画が最後です。
          横棒から書き始めると形が崩れやすくなります。
        </p>
        <p className="font-semibold mb-2">子：これも横棒が最後</p>
        <p>
          <Link href="/kanji/u5B50" className="text-blue-600 hover:text-blue-800 underline">
            「子」
          </Link>
          は、1画目が「フ」の形、2画目が縦のはね、3画目の横画が最後。
          「女」と同じく「横棒は最後」の仲間として覚えると、セットで身につきます。
        </p>
      </div>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        書く順番のルールが見えにくい字：水・火
      </h2>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">水：真ん中の縦が先</p>
        <p className="mb-3">
          <Link href="/kanji/u6C34" className="text-blue-600 hover:text-blue-800 underline">
            「水」
          </Link>
          は、1画目が真ん中の縦（はね）、2画目が左側（横から左払いへ折れる画）、
          3画目が右上の短い払い、4画目が右払いです。
          「真ん中を先に立てて、左、右の順」とリズムで覚えましょう。
          左から順に書いてしまう間違いが起きやすい字です。
        </p>
        <p className="font-semibold mb-2">火：点2つが先</p>
        <p>
          <Link href="/kanji/u706B" className="text-blue-600 hover:text-blue-800 underline">
            「火」
          </Link>
          は、1画目が左の点、2画目が右の点、そのあとに「人」の形（3画目の左払い、4画目の右払い）を書きます。
          真ん中の「人」から書き始める子が多いので、「点、点、ひと」と声に出しながら練習するのがおすすめです。
        </p>
      </div>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        囲む形の字：田・出
      </h2>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">田：最後にふたを閉める</p>
        <p className="mb-3">
          <Link href="/kanji/u7530" className="text-blue-600 hover:text-blue-800 underline">
            「田」
          </Link>
          は、1画目が左の縦、2画目が上から右へ折れる画、3画目が中の縦、4画目が中の横、
          そして5画目の下の横画で囲みを閉じます。
          「囲みは先に3方を書き、中身を書いてから、最後に下を閉じる」——この流れは
          「国」「回」など上の学年の囲む漢字にもつながる大事な基本です。
        </p>
        <p className="font-semibold mb-2">出：真ん中の縦が1画目</p>
        <p>
          <Link href="/kanji/u51FA" className="text-blue-600 hover:text-blue-800 underline">
            「出」
          </Link>
          は山が2つ重なった形に見えますが、1画目は中央を貫く縦です。
          そのあと上の段の左の折れ、右の縦、下の段の左の折れ、右の縦と続きます。
          「山」を2回書くのだと思い込んでいると順番を間違えるので、アニメーションで動きを一度見ておくと安心です。
        </p>
      </div>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        画数が増えてくる字：年
      </h2>
      <p>
        <Link href="/kanji/u5E74" className="text-blue-600 hover:text-blue-800 underline">
          「年」
        </Link>
        は6画。1画目はノで、途中は横画と縦画が交ざるため順番があいまいになりがちです。
        確実に押さえたいのは「中央の長い縦は最後（6画目）」ということ。
        あとの順番は文字の説明で覚えるより、
        <Link href="/kanji/u5E74/practice" className="text-blue-600 hover:text-blue-800 underline">
          なぞり書き練習モード
        </Link>
        で手の動きとして覚えるほうが早い字です。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">
        家庭での練習のポイント
      </h2>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>まず書き順アニメーションを見て、1画目だけを確認する（1画目が正しければ大きくは崩れません）</li>
        <li>アニメーションに合わせて指で空書きしてから、鉛筆で書く</li>
        <li>「点、点、ひと」（火）のように、順番を声に出してリズムにする</li>
        <li>「横棒は最後」（女・子）のように、共通ルールの仲間でまとめて練習する</li>
        <li>
          覚えたつもりになったら
          <Link href="/quiz" className="text-blue-600 hover:text-blue-800 underline">
            書き順クイズ
          </Link>
          で確かめる
        </li>
      </ul>
      <p>
        書き順の間違いに気づいたときは、「違うよ」と正すよりも
        「1画目はどこからだったかな？　アニメで見てみよう」と一緒に確かめる形にすると、
        子どもが書き順調べを嫌がらなくなります。全部の字を完璧にしようとせず、
        この記事で挙げたようなつまずきやすい字にしぼって確認するのが、親子とも負担の少ないやり方です。
      </p>
      <p>
        1年生の時期は、間違った書き順でもまだ癖として固まっていません。
        いま挙げた10字だけでも先に正しい動きを身につけておくと、
        2年生以降に習う似た構造の漢字（「友」「有」「毎」「安」など）にもそのまま生きてきます。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">まとめ</h2>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>小1の80字のうち、つまずきやすいのは1画目と順番のルールが見えにくい字</li>
        <li>右はノが先・左は横が先、九もノが先</li>
        <li>女・子は「横棒は最後」の仲間</li>
        <li>水は真ん中から、火は点2つから、出は中央の縦から</li>
        <li>田は「3方を囲む→中身→最後に閉じる」</li>
        <li>迷ったらアニメーションと、なぞり書き練習モードで動きから覚える</li>
      </ul>
    </ArticleLayout>
  );
}
