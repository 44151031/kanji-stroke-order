import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import KanjiLink from "@/components/common/KanjiLink";
import { KanjiEditorialContent } from "@/lib/kanjiEditorial";
import { getArticlesByKanji } from "@/lib/articles";

interface Props {
  editorial: KanjiEditorialContent;
}

function buildFaqJsonLd(editorial: KanjiEditorialContent) {
  if (!editorial.faq || editorial.faq.length === 0) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: editorial.faq.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
}

/**
 * 漢字ページの編集コンテンツセクション。
 * data/kanji-editorial/ に編集データが存在する漢字でのみ表示される。
 * （存在しない漢字には空のセクションを出さない）
 */
export default function KanjiEditorialSection({ editorial }: Props) {
  const { kanji } = editorial;
  const faqJsonLd = buildFaqJsonLd(editorial);
  const relatedArticles = getArticlesByKanji(kanji);

  return (
    <>
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}

      {(editorial.strokeOrderPoint || editorial.writingCaution || editorial.mnemonic) && (
        <Card className="w-full max-w-lg rounded-2xl shadow-sm border border-emerald-200 bg-emerald-50/40">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-emerald-800">
              ✍️ 「{kanji}」の書き方のポイント
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm leading-relaxed">
            {editorial.strokeOrderPoint && (
              <div>
                <p className="font-semibold text-foreground mb-1">書き順のポイント</p>
                <p className="text-muted-foreground">{editorial.strokeOrderPoint}</p>
              </div>
            )}
            {editorial.writingCaution && (
              <div>
                <p className="font-semibold text-foreground mb-1">書くときの注意</p>
                <p className="text-muted-foreground">{editorial.writingCaution}</p>
              </div>
            )}
            {editorial.mnemonic && (
              <div>
                <p className="font-semibold text-foreground mb-1">覚え方</p>
                <p className="text-muted-foreground">{editorial.mnemonic}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {editorial.examples && editorial.examples.length > 0 && (
        <Card className="w-full max-w-lg rounded-2xl shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">「{kanji}」を使った言葉・例文</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-relaxed">
              {editorial.examples.map((ex) => (
                <li key={ex.word} className="border-b border-border/50 pb-2 last:border-b-0 last:pb-0">
                  <p className="font-medium text-foreground">
                    {ex.word}
                    <span className="text-muted-foreground font-normal ml-2">（{ex.reading}）</span>
                  </p>
                  {ex.sentence && (
                    <p className="text-muted-foreground mt-1">{ex.sentence}</p>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {editorial.similar && editorial.similar.length > 0 && (
        <Card className="w-full max-w-lg rounded-2xl shadow-sm border border-purple-200 bg-purple-50/30">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-purple-800">「{kanji}」と似ている漢字の見分け方</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-sm leading-relaxed">
              {editorial.similar.map((s) => (
                <li key={s.kanji} className="flex items-start gap-3">
                  <KanjiLink
                    kanji={s.kanji}
                    className="w-11 h-11 shrink-0 flex items-center justify-center text-2xl border-2 border-purple-300 rounded-lg hover:bg-purple-100 transition-colors bg-white"
                  />
                  <p className="text-muted-foreground pt-1">{s.note}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {editorial.faq && editorial.faq.length > 0 && (
        <Card className="w-full max-w-lg rounded-2xl shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">「{kanji}」のよくある質問</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4 text-sm leading-relaxed">
              {editorial.faq.map((f) => (
                <div key={f.q}>
                  <dt className="font-semibold text-foreground mb-1">Q. {f.q}</dt>
                  <dd className="text-muted-foreground">A. {f.a}</dd>
                </div>
              ))}
            </dl>
          </CardContent>
        </Card>
      )}

      {relatedArticles.length > 0 && (
        <Card className="w-full max-w-lg rounded-2xl shadow-sm border">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">「{kanji}」に関する記事</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              {relatedArticles.map((a) => (
                <li key={a.slug}>
                  <Link
                    href={`/articles/${a.slug}`}
                    className="text-blue-600 hover:text-blue-800 underline"
                  >
                    {a.title}
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </>
  );
}
