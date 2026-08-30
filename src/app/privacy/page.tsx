import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "プライバシーポリシー",
  description:
    "漢字書き順ナビのプライバシーポリシー。個人情報の取り扱い、Cookie、Google Analytics・Google AdSenseなど第三者配信サービスの利用について説明しています。",
  path: "/privacy",
});

export default function PrivacyPage() {
  return (
    <div className="max-w-[800px] mx-auto">
      <div className="bg-white rounded-2xl shadow-md px-6 py-10 md:px-10">
        <h1 className="text-2xl font-bold mb-6">プライバシーポリシー</h1>

        <div className="text-sm leading-relaxed text-muted-foreground space-y-4">
          <p>
            漢字書き順ナビ（以下「当サイト」といいます）は、利用者のプライバシーを尊重し、
            個人情報および利用データを以下の方針にもとづいて取り扱います。
          </p>
        </div>

        <div className="my-8 space-y-8">
          <section>
            <h2 className="font-semibold text-foreground mb-2 text-base">1. 個人情報の取得と利用について</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              当サイトは、会員登録なしで利用できるサービスであり、氏名・住所・電話番号などの
              個人を特定できる情報の入力を求めることはありません。
              お問い合わせをいただいた場合に取得するメールアドレス等の情報は、
              お問い合わせへの回答および必要な連絡のためにのみ利用し、
              ご本人の同意なく第三者に提供することはありません（法令にもとづく場合を除きます）。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2 text-base">2. アクセス解析ツールについて</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              当サイトでは、サイトの利用状況を把握し改善に役立てるため、Googleが提供する
              アクセス解析ツール「Googleアナリティクス（Google Analytics 4）」を利用しています。
              Googleアナリティクスはデータの収集のためにCookie等の識別子を使用します。
              このデータは匿名で収集されており、個人を特定するものではありません。
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              Googleアナリティクスによるデータの収集・処理の仕組みについては、
              「
              <a
                href="https://policies.google.com/technologies/partner-sites?hl=ja"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                Googleのサービスを使用するサイトやアプリから収集した情報のGoogleによる使用
              </a>
              」をご確認ください。
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              また、当サイトでは閲覧ランキングや閲覧履歴機能の提供のため、
              ブラウザごとにランダムに生成した匿名IDを用いて漢字ページの閲覧数を記録することがあります。
              この記録は個人を特定できない形で行われ、ランキング表示等のサービス提供以外の目的には使用しません。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2 text-base">3. 広告の配信について（Google AdSense）</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              当サイトでは、第三者配信の広告サービス「Google AdSense（Googleアドセンス）」を
              利用しています（利用する場合があります）。
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              Googleなどの第三者配信事業者はCookieを使用して、利用者の当サイトや他のウェブサイトへの
              過去のアクセス情報に基づいた広告を配信することがあります。
              GoogleはCookieを使用することにより、利用者のインターネット閲覧履歴に応じた
              パーソナライズ広告を表示できます。
            </p>
            <ul className="list-disc list-inside text-sm leading-relaxed text-muted-foreground space-y-2 ml-2 mb-3">
              <li>
                利用者は
                <a
                  href="https://adssettings.google.com/"
                  className="text-blue-600 hover:text-blue-800 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  広告設定（Googleアカウントの広告設定ページ）
                </a>
                で、パーソナライズ広告を無効にできます。
              </li>
              <li>
                また、
                <a
                  href="https://optout.aboutads.info/"
                  className="text-blue-600 hover:text-blue-800 underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  www.aboutads.info
                </a>
                にアクセスすることで、第三者配信事業者のパーソナライズ広告に使用される
                Cookieを無効にできます。
              </li>
            </ul>
            <p className="text-sm leading-relaxed text-muted-foreground">
              Googleの広告におけるデータの取り扱いの詳細は「
              <a
                href="https://policies.google.com/technologies/ads?hl=ja"
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                ポリシーと規約（Google）
              </a>
              」をご覧ください。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2 text-base">4. Cookie（クッキー）について</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              Cookieとは、ウェブサイトの利用時にブラウザに保存される小さなテキストデータです。
              当サイトでは、前述のアクセス解析および広告配信のためにCookieが使用されるほか、
              学習の進み具合や表示設定の保存のためにブラウザのローカルストレージ等を
              利用することがあります。これらに個人を特定する情報は含まれません。
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              利用者は、ブラウザの設定によりCookieの受け入れを拒否したり、
              保存されたCookieを削除したりすることができます。
              ただし、Cookieを無効にした場合、当サイトを含む一部のウェブサイトの機能が
              正常に動作しなくなる可能性があります。
              設定方法は各ブラウザのヘルプをご確認ください。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2 text-base">5. 免責事項</h2>
            <p className="text-sm leading-relaxed text-muted-foreground mb-3">
              当サイトに掲載する情報の正確性の維持に努めていますが、その完全性・正確性を
              保証するものではありません。当サイトの利用によって生じたいかなる損害についても、
              当サイトは責任を負いかねますのでご了承ください。
            </p>
            <p className="text-sm leading-relaxed text-muted-foreground">
              当サイトからリンクやバナーによって移動した外部サイトで提供される情報・サービスに
              ついて、当サイトは一切の責任を負いません。
              免責事項の詳細は
              <Link href="/terms" className="text-blue-600 hover:text-blue-800 underline">
                利用規約・免責事項
              </Link>
              もあわせてご確認ください。
            </p>
          </section>

          <section>
            <h2 className="font-semibold text-foreground mb-2 text-base">6. お問い合わせ</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              本ポリシーおよび個人情報の取り扱いに関するお問い合わせは、
              下記の窓口までお願いいたします。
              <br />
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

          <section>
            <h2 className="font-semibold text-foreground mb-2 text-base">7. プライバシーポリシーの改定について</h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              当サイトは、法令の改正やサービス内容の変更に応じて、本ポリシーを予告なく
              改定することがあります。改定後のプライバシーポリシーは、本ページに掲載した
              時点から効力を生じるものとします。
            </p>
          </section>
        </div>

        <div className="text-xs text-muted-foreground text-right mt-6 space-y-1">
          <p>制定日：2026年8月30日</p>
        </div>
      </div>
    </div>
  );
}
