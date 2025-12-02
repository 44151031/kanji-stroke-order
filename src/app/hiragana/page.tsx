import { Metadata } from "next";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "ひらがな書き順一覧 | 漢字書き順",
  description: "ひらがなの書き順をアニメーションで学びましょう。あ行からわ行まで、すべてのひらがなの筆順を確認できます。",
  openGraph: {
    title: "ひらがな書き順一覧",
    description: "ひらがなの書き順をアニメーションで学びましょう。",
  },
};

const HIRAGANA = [
  { row: "あ行", chars: ["あ", "い", "う", "え", "お"] },
  { row: "か行", chars: ["か", "き", "く", "け", "こ"] },
  { row: "さ行", chars: ["さ", "し", "す", "せ", "そ"] },
  { row: "た行", chars: ["た", "ち", "つ", "て", "と"] },
  { row: "な行", chars: ["な", "に", "ぬ", "ね", "の"] },
  { row: "は行", chars: ["は", "ひ", "ふ", "へ", "ほ"] },
  { row: "ま行", chars: ["ま", "み", "む", "め", "も"] },
  { row: "や行", chars: ["や", "ゆ", "よ"] },
  { row: "ら行", chars: ["ら", "り", "る", "れ", "ろ"] },
  { row: "わ行", chars: ["わ", "を", "ん"] },
];

const HIRAGANA_DAKUTEN = [
  { row: "が行", chars: ["が", "ぎ", "ぐ", "げ", "ご"] },
  { row: "ざ行", chars: ["ざ", "じ", "ず", "ぜ", "ぞ"] },
  { row: "だ行", chars: ["だ", "ぢ", "づ", "で", "ど"] },
  { row: "ば行", chars: ["ば", "び", "ぶ", "べ", "ぼ"] },
  { row: "ぱ行", chars: ["ぱ", "ぴ", "ぷ", "ぺ", "ぽ"] },
];

export default function HiraganaPage() {
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
        <h1 className="text-5xl font-bold mt-6 mb-2">ひらがな書き順</h1>
        <p className="text-muted-foreground text-lg">文字をクリックして書き順を確認</p>
      </header>

      {/* 清音 */}
      <Card className="w-full max-w-2xl rounded-2xl shadow-sm border-border/50">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-medium">清音</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            {HIRAGANA.map((group) => (
              <div key={group.row} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-12">{group.row}</span>
                <div className="flex gap-2 flex-wrap">
                  {group.chars.map((char) => (
                    <Link
                      key={char}
                      href={`/kanji/${encodeURIComponent(char)}`}
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
            {HIRAGANA_DAKUTEN.map((group) => (
              <div key={group.row} className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground w-12">{group.row}</span>
                <div className="flex gap-2 flex-wrap">
                  {group.chars.map((char) => (
                    <Link
                      key={char}
                      href={`/kanji/${encodeURIComponent(char)}`}
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




