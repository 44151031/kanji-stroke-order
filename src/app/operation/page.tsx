import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/metadata";

export const metadata: Metadata = generatePageMetadata({
  title: "運営管理",
  description: "漢字書き順ナビの運営主体・管理情報ページ。管理者・連絡先・データライセンス情報を掲載しています。",
  path: "/operation",
});

export default function OperationPage() {
  return (
    <div className="max-w-[800px] mx-auto">
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-10">
        <h1 className="text-2xl font-bold mb-6">🧭 漢字書き順ナビ 運営管理</h1>
        
        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-4">
          <p>
            本サイト「漢字書き順ナビ」は、正しい漢字の書き順や部首・読み方を学習者にわかりやすく解説する教育目的のWebサイトです。
          </p>
          <p>
            以下の運営情報を明示いたします。
          </p>
        </div>

        <div className="my-8 border-t border-b border-gray-200 py-6 space-y-4">
          <div>
            <p className="font-semibold text-foreground mb-1">■ サイト名</p>
            <p className="text-muted-foreground">漢字書き順ナビ</p>
          </div>
          
          <div>
            <p className="font-semibold text-foreground mb-1">■ 管理者</p>
            <p className="text-muted-foreground">漢字書き順ナビ運営事務局</p>
          </div>
          
          <div>
            <p className="font-semibold text-foreground mb-1">■ URL</p>
            <p className="text-muted-foreground">
              <a 
                href="https://kanji-stroke-order.com" 
                className="text-blue-600 hover:text-blue-800 underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://kanji-stroke-order.com
              </a>
            </p>
          </div>
          
          <div>
            <p className="font-semibold text-foreground mb-1">■ メールアドレス</p>
            <p className="text-muted-foreground">
              <a 
                href="mailto:info@kanji-stroke-order.com" 
                className="text-blue-600 hover:text-blue-800 underline"
              >
                info@kanji-stroke-order.com
              </a>
            </p>
          </div>
        </div>

        <div className="prose prose-sm max-w-none text-muted-foreground leading-relaxed space-y-4">
          <p>
            掲載内容やデータ利用に関するお問い合わせは、上記メールアドレス宛にお願いいたします。
          </p>
          <p>
            当サイトでは、KanjiVG・KANJIDIC2・UniDic 等のオープンデータを活用し、
            教育・学習目的での利用を推奨しています。
          </p>
        </div>
      </div>
    </div>
  );
}

