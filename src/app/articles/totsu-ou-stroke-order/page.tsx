import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { getArticle } from "@/lib/articles";
import ArticleLayout from "@/components/articles/ArticleLayout";

const SLUG = "totsu-ou-stroke-order";
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
      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">結論：どちらも5画、左から順に書く</h2>
      <p>
        「凸（とつ）」と「凹（おう）」は、常用漢字の中でも特に書き順を調べられることが多い字です。
        図形のような見た目のせいで「一筆書きで外枠をなぞるのでは？」と思われがちですが、
        <strong>どちらも5画</strong>で、基本は「上から下へ、左から右へ」という
        漢字の筆順の大原則どおりに書きます。
        カクカクと折れる長い画が含まれるのが特徴で、
        「1本の画がどこからどこまで続くのか」さえつかめば難しくありません。
      </p>
      <p>
        以下、本サイトの書き順データ（KanjiVG）にもとづいて1画ずつ確認します。
        実際の動きは<Link href="/kanji/u51F8" className="text-blue-600 hover:text-blue-800 underline">「凸」の書き順アニメーション</Link>と
        <Link href="/kanji/u51F9" className="text-blue-600 hover:text-blue-800 underline">「凹」の書き順アニメーション</Link>で
        見るのがいちばん分かりやすいので、あわせてどうぞ。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">「凸」の書き順（5画）</h2>
      <p>上に出っ張りのある形です。左の肩から書き始めます。</p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>1画目：</strong>左側の中段にある短い横棒。左端から右へ書き、出っ張りの根元で止めます。</li>
          <li><strong>2画目：</strong>出っ張りの左側面の縦棒。出っ張りのてっぺんの高さから、まっすぐ下へ書きます。</li>
          <li><strong>3画目：</strong>ここが山場。出っ張りの上辺を右へ→右側面を下へ折れ→右の肩をさらに右へ、と<strong>2回折れて階段状に続く1画</strong>です。途中でペンを離しません。</li>
          <li><strong>4画目：</strong>左端の縦棒を上から下へ書き、下で右へ折れてそのまま底辺を右端近くまで書きます（L字の1画）。</li>
          <li><strong>5画目：</strong>右端の縦棒を上から下へ書いて、枠を閉じます。</li>
        </ul>
      </div>
      <p>
        間違えやすいのは3画目です。「上辺・右側面・右肩」を別々の画に分けたり、
        逆に1画目の横棒まで含めて一筆でなぞったりしがちですが、
        <strong>折れ2回ぶんで1画</strong>と覚えてください。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">「凹」の書き順（5画）</h2>
      <p>上にへこみのある形です。こちらも左上から書き始めます。</p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>1画目：</strong>左上の横棒から右へ→へこみの左側面を下へ折れ→へこみの底を右へ、と<strong>2回折れる階段状の1画</strong>。「凸」の3画目と対になる動きです。</li>
          <li><strong>2画目：</strong>へこみの右側面の縦棒。上の縁の高さから、へこみの底まで下へ書きます。</li>
          <li><strong>3画目：</strong>右上の短い横棒。左から右へ書きます。</li>
          <li><strong>4画目：</strong>左端の縦棒を上から下へ書き、下で右へ折れて底辺を右端近くまで書きます（L字の1画）。</li>
          <li><strong>5画目：</strong>右端の縦棒を上から下へ書いて、枠を閉じます。</li>
        </ul>
      </div>
      <p>
        「凹」は<strong>いきなり折れの画から始まる</strong>のがポイントです。
        1画目でへこみの左半分を作り、2・3画目で右半分を作る、と考えると流れがつかめます。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">共通するのは「最後にL字＋右の縦で閉じる」</h2>
      <p>
        2つの字を見比べると、<strong>4画目と5画目はまったく同じ</strong>だと分かります。
        どちらも「左端を下りて底を右へ進むL字」＋「右端の縦」で外枠の下半分を閉じるのです。
        この共通部分を先に覚えてしまえば、あとは上半分の
        「出っ張り（凸）」か「へこみ（凹）」の作り方だけ意識すればよくなります。
      </p>
      <p>
        なお、学校の筆順指導のもとになっている「筆順指導の手びき」（文部省、1958年）は、
        標準として示した以外の筆順を誤りと決めつけるものではない、という立場をとっています。
        辞典によって細部の説明が異なる場合もありますが、
        本記事の順序は上の大原則に沿った標準的な書き方として紹介しています。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">よくある間違いは「一筆書き」と「画数の数えすぎ」</h2>
      <p>
        「凸」「凹」でよく見られるつまずきは、大きく2つあります。
        1つ目は<strong>外枠を一筆書きでなぞってしまう</strong>こと。
        図形として見ると輪郭を一気に描きたくなりますが、漢字としては5つの画に分かれています。
      </p>
      <p>
        2つ目は<strong>画数の数え間違い</strong>です。角がたくさんあるので6画や7画に見えがちですが、
        折れは何回曲がっても「1画」として数えます。
        「凸も凹も5画」と覚えておくと、画数を問われたときにも慌てません。
        角ばった字は形が崩れやすいので、練習では折れの角をきちんと直角に、
        ゆっくり書くことを意識してみてください。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">「凸凹」はどこで習う？</h2>
      <p>
        「凸」「凹」は小学校の配当漢字には含まれず、中学校以降で学習する常用漢字です
        （<Link href="/grade/7" className="text-blue-600 hover:text-blue-800 underline">中学校で習う漢字一覧</Link>）。
        「凸凹（でこぼこ）」「凹凸（おうとつ）」「凸レンズ」「凹レンズ」など、
        日常でも理科でも使う機会は意外と多い字です。
        覚えたら<Link href="/quiz" className="text-blue-600 hover:text-blue-800 underline">書き順クイズ</Link>で
        定着をチェックしてみてください。
      </p>
    </ArticleLayout>
  );
}
