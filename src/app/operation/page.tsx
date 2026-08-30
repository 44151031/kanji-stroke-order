import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "運営者情報・編集方針",
  description:
    "漢字書き順ナビの運営者情報・サイトの目的・編集方針のページ。書き順データや読み・意味データの出典、情報の確認方法、更新方針、お問い合わせ先を掲載しています。",
  path: "/operation",
});

export default function OperationPage() {
  return (
    <div className="max-w-[800px] mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-10">
        <h1 className="text-2xl font-bold mb-6">運営者情報・編集方針</h1>

        <div className="space-y-8">
          <section id="about">
            <h2 className="font-semibold text-foreground mb-2 text-base">漢字書き順ナビとは</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              漢字書き順ナビは、常用漢字2,136字の書き順（筆順）を1画ずつのアニメーションで
              確認できる、漢字学習のためのWebサイトです。
              学年別・画数別・部首別の漢字一覧、書き順の練習モード、書き順クイズ、
              間違えやすい漢字・似ている漢字の解説などを無料で提供しています。
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              「この漢字はどの画から書くのか」を、文字の説明だけでなく動きで確認できることを
              大切にしています。漢字を学ぶ小中学生とその保護者・先生、日本語を学ぶ方、
              ふと書き順が気になった大人の方に役立つことを目指しています。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2 text-base">掲載情報について</h2>
            <div className="text-sm leading-relaxed text-muted-foreground space-y-3">
              <div>
                <h3 className="font-semibold text-foreground mb-1">書き順データ</h3>
                <p>
                  書き順アニメーションは、漢字の筆順・字形データを収録したオープンデータ
                  「
                  <a
                    href="https://kanjivg.tagaini.net/"
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    KanjiVG
                  </a>
                  」（© Ulrich Apel、CC BY-SA 3.0）をもとに描画しています。
                  ひらがな・カタカナの筆順データは「
                  <a
                    href="https://github.com/parsimonhi/animCJK"
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    animCJK
                  </a>
                  」プロジェクトのデータを利用しています。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">読み・意味データ</h3>
                <p>
                  漢字の読み・意味・画数・学年などの辞書情報は、電子辞書研究開発グループ
                  （EDRDG）が提供する「
                  <a
                    href="https://www.edrdg.org/wiki/index.php/KANJIDIC_Project"
                    className="text-blue-600 hover:text-blue-800 underline"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    KANJIDIC2
                  </a>
                  」（CC BY-SA 4.0）をもとにしています。
                  熟語・語彙データの整備には、国立国語研究所の形態素解析辞書
                  「UniDic」を利用しています。
                </p>
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1">編集コンテンツ</h3>
                <p>
                  「書き順のポイント」「間違えやすい漢字の解説」などの解説記事・解説文は、
                  上記のデータをもとに当サイトが独自に編集・執筆しているものです。
                  筆順に関する記述は、文部省（当時）が1958年に示した「筆順指導の手びき」の
                  考え方および学校教育で一般的に指導される筆順を基準としています。
                  なお、同手びき自体が示すとおり、筆順には歴史的に複数の書き方が存在するものがあり、
                  ここに示す筆順以外を誤りと断定するものではありません。
                </p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2 text-base">情報の確認方法と更新方針</h2>
            <ul className="list-disc list-inside text-sm leading-relaxed text-muted-foreground space-y-2 ml-2">
              <li>
                書き順アニメーションは、KanjiVGの筆順データをそのまま描画しており、
                当サイトが独自に筆順を変更することはありません。
              </li>
              <li>
                解説記事を作成する際は、出典となるデータや資料を確認したうえで執筆し、
                記事内で参照した資料を明示するよう努めています。
              </li>
              <li>
                元データ（KanjiVG・KANJIDIC2等）の更新や、利用者からの誤りのご指摘があった場合は、
                内容を確認のうえ順次修正・更新します。
              </li>
            </ul>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2 text-base">誤りを発見された場合</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              掲載内容に誤りを発見された場合は、対象のページURLと誤りの内容を添えて、
              下記のお問い合わせ先までご連絡ください。確認のうえ、必要な修正を行います。
            </p>
          </section>

          <section id="contact">
            <h2 className="font-semibold text-foreground mb-2 text-base">運営者情報・お問い合わせ</h2>
            <div className="border-t border-b border-gray-200 py-6 space-y-4 my-4">
              <div>
                <p className="font-semibold text-foreground mb-1">サイト名</p>
                <p className="text-muted-foreground text-sm">漢字書き順ナビ</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">運営者</p>
                <p className="text-muted-foreground text-sm">漢字書き順ナビ運営事務局</p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">URL</p>
                <p className="text-muted-foreground text-sm">
                  <a
                    href="https://kanji-stroke-order.com"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    https://kanji-stroke-order.com
                  </a>
                </p>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">お問い合わせ先</p>
                <p className="text-muted-foreground text-sm">
                  <a
                    href="mailto:info@kanji-stroke-order.com"
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    info@kanji-stroke-order.com
                  </a>
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              掲載内容・データ利用・広告等に関するお問い合わせは、上記メールアドレス宛にお願いいたします。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2 text-base">関連ページ</h2>
            <ul className="list-disc list-inside text-sm leading-relaxed space-y-2 ml-2">
              <li>
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800 underline">
                  プライバシーポリシー
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                  利用規約・免責事項
                </Link>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
