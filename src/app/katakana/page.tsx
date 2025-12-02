import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getKanjiLink } from "@/lib/linkUtils";

export const metadata: Metadata = {
  title: "カタカナ書き順一覧 | 漢字書き順",
  description: "カタカナの書き順をアニメーションで学びましょう。ア行からワ行まで、すべてのカタカナの筆順を確認できます。",
  openGraph: {
    title: "カタカナ書き順一覧",
    description: "カタカナの書き順をアニメーションで学びましょう。",
  },
};

const KATAKANA = [
  { row: "ア行", chars: ["ア", "イ", "ウ", "エ", "オ"] },
  { row: "カ行", chars: ["カ", "キ", "ク", "ケ", "コ"] },
  { row: "サ行", chars: ["サ", "シ", "ス", "セ", "ソ"] },
  { row: "タ行", chars: ["タ", "チ", "ツ", "テ", "ト"] },
  { row: "ナ行", chars: ["ナ", "ニ", "ヌ", "ネ", "ノ"] },
  { row: "ハ行", chars: ["ハ", "ヒ", "フ", "ヘ", "ホ"] },
  { row: "マ行", chars: ["マ", "ミ", "ム", "メ", "モ"] },
  { row: "ヤ行", chars: ["ヤ", "ユ", "ヨ"] },
  { row: "ラ行", chars: ["ラ", "リ", "ル", "レ", "ロ"] },
  { row: "ワ行", chars: ["ワ", "ヲ", "ン"] },
];

const KATAKANA_DAKUTEN = [
  { row: "ガ行", chars: ["ガ", "ギ", "グ", "ゲ", "ゴ"] },
  { row: "ザ行", chars: ["ザ", "ジ", "ズ", "ゼ", "ゾ"] },
  { row: "ダ行", chars: ["ダ", "ヂ", "ヅ", "デ", "ド"] },
  { row: "バ行", chars: ["バ", "ビ", "ブ", "ベ", "ボ"] },
  { row: "パ行", chars: ["パ", "ピ", "プ", "ペ", "ポ"] },
];

export default function KatakanaPage() {
  return (
    <div className="flex flex-col items-center gap-10">
      {/* ナビゲーション */}
      <header className="text-center w-full pt-8">
        <Link 
          href="/" 
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← トップに戻る
        </Link>
        <h1 className="text-5xl font-bold mt-6 mb-2">カタカナ書き順</h1>
        <p className="text-muted-foreground text-lg">文字をクリックして書き順を確認</p>
      </header>

      {/* 清音 */}
      <Card className="w-full max-w-2xl rounded-2xl shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">清音</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {KATAKANA.map((group) => (
              <div key={group.row} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-12">{group.row}</span>
                <div className="flex gap-2 flex-wrap">
                  {group.chars.map((char) => (
                    <Link
                      key={char}
                      href={getKanjiLink(char)}
                      className="char-button w-12 h-12 flex items-center justify-center text-2xl font-medium border border-border rounded-xl bg-card hover:bg-secondary transition-colors"
                    >
                      {char}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 濁音・半濁音 */}
      <Card className="w-full max-w-2xl rounded-2xl shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">濁音・半濁音</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {KATAKANA_DAKUTEN.map((group) => (
              <div key={group.row} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-12">{group.row}</span>
                <div className="flex gap-2 flex-wrap">
                  {group.chars.map((char) => (
                    <Link
                      key={char}
                      href={getKanjiLink(char)}
                      className="char-button w-12 h-12 flex items-center justify-center text-2xl font-medium border border-border rounded-xl bg-card hover:bg-secondary transition-colors"
                    >
                      {char}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* フッター */}
      <footer className="text-center text-sm text-muted-foreground pt-8 pb-8">
        <p>書き順データは KanjiVG プロジェクトを使用しています</p>
      </footer>
    </div>
  );
}




