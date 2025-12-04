import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";
import Link from "next/link";

export const metadata: Metadata = generatePageMetadata({
  title: "利用規約・免責事項",
  description: "漢字書き順ナビの利用規約および免責事項ページ。著作権・引用・データ利用方針を明示しています。",
  path: "/terms",
});

export default function TermsPage() {
  return (
    <div className="max-w-[800px] mx-auto">
      <div className="bg-white rounded-2xl shadow-md px-6 py-10">
        <h1 className="text-2xl font-bold mb-6">📘 利用規約・免責事項</h1>

        <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
          <p>
            本サイト「漢字書き順ナビ」（
            <a
              href="https://kanji-stroke-order.com"
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              https://kanji-stroke-order.com
            </a>
            ）は、教育・学習目的で漢字の書き順情報を提供しています。
          </p>
          <p>以下の内容をご確認のうえ、ご利用ください。</p>
        </div>

        <div className="my-8 border-t border-b border-gray-200 py-6 space-y-6">
          <section>
            <h2 className="font-semibold text-foreground mb-2">■ 第1条（免責事項）</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本サイトの内容については正確性の維持に努めていますが、情報の完全性・正確性を保証するものではありません。
              当サイトの情報を利用することで生じたいかなる損害についても、当運営事務局は一切の責任を負いません。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">■ 第2条（著作権・引用について）</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              本サイトで使用している漢字データは以下のオープンデータを活用しています。
            </p>
            <ul className="list-disc list-inside text-sm leading-relaxed text-muted-foreground space-y-2 ml-4">
              <li>KanjiVG（CC BY-SA 3.0）</li>
              <li>KANJIDIC2（© EDRDG）</li>
              <li>UniDic（MIT License）</li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground mt-3">
              コンテンツの引用・転載を行う場合は、出典を明記のうえ非営利目的に限りご利用ください。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">■ 第3条（データ・画像利用）</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              SVGアニメーションやOGP画像などの生成物は、教育目的での利用を許可しています。
              商用利用を希望する場合は事前にご連絡ください。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2">■ 第4条（お問い合わせ窓口）</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              漢字書き順ナビ運営事務局
              <br />
              メール：
              <a
                href="mailto:info@kanji-stroke-order.com"
                className="text-blue-600 hover:text-blue-800 underline"
              >
                info@kanji-stroke-order.com
              </a>
            </p>
          </section>
        </div>

        <div className="text-xs text-muted-foreground text-right mt-6">
          最終更新日：2025年12月
        </div>
      </div>
    </div>
  );
}


