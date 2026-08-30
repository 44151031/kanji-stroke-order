import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { getArticle } from "@/lib/articles";
import ArticleLayout from "@/components/articles/ArticleLayout";

const SLUG = "mi-matsu-difference";
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
      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">結論：上の横棒が短ければ「未」、長ければ「末」</h2>
      <p>
        「未」と「末」の違いは、<strong>上の横棒の長さ</strong>だけです。
      </p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>未</strong> — 上の横棒が<strong>短い</strong>。「まだ〜ない」の意味（未来・未定）。</li>
          <li><strong>末</strong> — 上の横棒が<strong>長い</strong>。「すえ・先端」の意味（週末・末端）。</li>
        </ul>
      </div>
      <p>
        たったこれだけの違いなので、テストの答案や手書きのメモでは取り違えやすいとされています。
        でも、字の成り立ちから意味をつかめば、二度と迷わなくなります。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">成り立ちから理解する</h2>
      <p>
        「未」も「末」も、「木」に印を1本加えて意味を表した<strong>指事文字とされています</strong>。
      </p>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li>
          <strong>末</strong>は、木のてっぺんに長い線を引いて<strong>「枝の先端」</strong>を指し示した字とされます。
          そこから「すえ」「終わり」の意味になりました。
        </li>
        <li>
          <strong>未</strong>は、上の線が短く、<strong>枝がまだ伸びきっていない</strong>さまを表した字と
          説明されることが多く、そこから「まだ〜していない」という打ち消しの意味を持つようになった
          とされています。
        </li>
      </ul>
      <p>
        つまり「<strong>末は伸びきった先端だから長い、未はまだ途中だから短い</strong>」。
        意味と形がそのままつながっているので、この一文を覚えるだけで見分けられます。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">熟語で使い分けを確認する</h2>
      <p>意味を押さえたら、よく使う熟語で確認しましょう。</p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">未（まだ〜ない）</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>未来</strong> — まだ来ていない時間</li>
          <li><strong>未定</strong> — まだ決まっていない</li>
          <li><strong>未完成</strong> — まだ完成していない</li>
          <li><strong>未読</strong> — まだ読んでいない</li>
        </ul>
        <p className="font-semibold mt-4 mb-2">末（すえ・先端・終わり）</p>
        <ul className="list-disc list-inside space-y-1 ml-2">
          <li><strong>週末</strong> — 週のすえ</li>
          <li><strong>末端</strong> — いちばん先の部分</li>
          <li><strong>年末</strong> — 年のすえ</li>
          <li><strong>結末</strong> — 物語の終わり</li>
        </ul>
      </div>
      <p>
        「未」のつく熟語はどれも「まだ〜ない」と読み替えられ、
        「末」のつく熟語はどれも「〜のすえ・先」と読み替えられます。
        書くときに一瞬迷ったら、この読み替えを頭の中でやってみてください。
      </p>
      <p>
        ちなみに、「味」や「妹」の右側に入っているのは「未」のほうです。
        どちらも「未」が音を表す部品として使われた字とされています。
        部品として見かけたときも「上が短い未だ」と確認する癖をつけると、
        字形の記憶がいっそう確かになります。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">書き順は2字とも同じ</h2>
      <p>
        本サイトの書き順データで確認すると、
        <Link href="/kanji/u672A" className="text-blue-600 hover:text-blue-800 underline">「未」</Link>も
        <Link href="/kanji/u672B" className="text-blue-600 hover:text-blue-800 underline">「末」</Link>も
        5画で、順序はまったく同じです。
      </p>
      <ul className="list-disc list-inside space-y-1 ml-2">
        <li><strong>1画目：</strong>上の横棒（未は短く、末は長く）</li>
        <li><strong>2画目：</strong>下の横棒（未は長く、末は短く）</li>
        <li><strong>3画目：</strong>中央の縦棒を上から下へ</li>
        <li><strong>4画目：</strong>左払い</li>
        <li><strong>5画目：</strong>右払い</li>
      </ul>
      <p>
        横2本→縦→払い2つ、という「木」と同じ流れです。
        違いが出るのは<strong>1画目の長さだけ</strong>なので、
        書き始めの一瞬に「まだ短い未か、伸びきった末か」を思い出すのがコツです。
      </p>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">こんな場面で取り違えやすい</h2>
      <p>
        取り違えが起きやすいのは、意味を考えずに字だけを書いている場面です。
        たとえば「未来」と書くつもりで「末来」としてしまう、
        「期末テスト」を「期未テスト」としてしまう、といった間違いは
        テストの答案でもよく見られるとされています。
        急いで書くと横棒の長さの差が小さくなり、自分でもどちらを書いたのか
        分からなくなってしまうのです。
      </p>
      <p>
        防ぐコツは2つあります。1つ目は、<strong>上の横棒の長短を大げさなくらいはっきり</strong>書くこと。
        「未」は上をぐっと短く、「末」は上をぐっと長く書けば、読み手にも自分にも明確です。
        2つ目は、書く前に意味を一瞬確認すること。「まだ来ていないから未来」「週のすえだから週末」と
        頭の中で唱えてから書けば、手が勝手に正しいほうを選んでくれるようになります。
      </p>
      <div className="bg-gray-50 rounded-lg p-5 my-4">
        <p className="font-semibold mb-2">おまけ：十二支の「未」</p>
        <p>
          「未」は十二支のひとつじ（羊）にも使われ、「未年（ひつじどし）」と書きます。
          年賀状などで見かけたら、「上の横棒が短い未だな」と確認してみるのも
          よい復習になります。
        </p>
      </div>

      <h2 className="text-lg font-semibold text-foreground mt-8 mb-3">練習のヒント</h2>
      <p>
        「未」「末」はどちらも<Link href="/grade/4" className="text-blue-600 hover:text-blue-800 underline">小学4年生で習う漢字</Link>です。
        練習するときは1字ずつバラバラに書くより、「未来」「週末」のように
        <strong>熟語ごと書いて意味とセットで覚える</strong>のがおすすめです。
        ほかにも形の似た漢字は<Link href="/confused-kanji" className="text-blue-600 hover:text-blue-800 underline">間違えやすい漢字の一覧</Link>にまとめています。
        覚えたら<Link href="/quiz" className="text-blue-600 hover:text-blue-800 underline">書き順クイズ</Link>で確認してみてください。
      </p>
    </ArticleLayout>
  );
}
