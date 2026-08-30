import Link from "next/link";
import { siteMeta } from "@/lib/metadata";
import { getArticle, getRelatedArticles, ArticleEntry } from "@/lib/articles";
import { toUnicodeSlug } from "@/lib/slugHelpers";
import Breadcrumb from "@/components/common/Breadcrumb";

interface Source {
  name: string;
  url?: string;
  note?: string;
}

interface ArticleLayoutProps {
  slug: string;
  /** 記事本文 */
  children: React.ReactNode;
  /** 参考資料（記事末尾に表示） */
  sources?: Source[];
}

function buildArticleJsonLd(article: ArticleEntry) {
  const url = `${siteMeta.url}/articles/${article.slug}`;
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: article.title,
    description: article.description,
    image: `${siteMeta.url}/ogp.png`,
    author: {
      "@type": "Organization",
      name: "漢字書き順ナビ運営事務局",
      url: siteMeta.url,
    },
    publisher: {
      "@type": "Organization",
      name: siteMeta.siteName,
      logo: {
        "@type": "ImageObject",
        url: `${siteMeta.url}${siteMeta.logo}`,
        width: 512,
        height: 512,
      },
    },
    datePublished: article.datePublished,
    dateModified: article.dateModified,
    inLanguage: "ja",
  };
}

/**
 * 記事共通レイアウト
 * パンくず・タイトル・日付・本文・出典・この記事で扱った漢字・関連記事を共通化する。
 */
export default function ArticleLayout({ slug, children, sources }: ArticleLayoutProps) {
  const article = getArticle(slug);
  if (!article) {
    throw new Error(`ArticleLayout: article "${slug}" is not registered in src/lib/articles.ts`);
  }
  const relatedArticles = getRelatedArticles(slug);
  const jsonLd = buildArticleJsonLd(article);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="max-w-[800px] mx-auto">
        <Breadcrumb
          items={[
            { label: "トップ", href: "/" },
            { label: "記事一覧", href: "/articles" },
            { label: article.title },
          ]}
        />

        <article className="bg-white rounded-2xl shadow-md px-6 py-10 md:px-10 mt-4">
          <header className="mb-8">
            <p className="text-xs text-muted-foreground mb-2">{article.category}</p>
            <h1 className="text-2xl font-bold mb-3 leading-snug">{article.title}</h1>
            <p className="text-xs text-muted-foreground">
              公開日：{article.datePublished.replace(/-/g, "/")}
              {article.dateModified !== article.datePublished && (
                <>　最終更新：{article.dateModified.replace(/-/g, "/")}</>
              )}
            </p>
          </header>

          <div className="article-body text-[15px] leading-relaxed text-foreground/90 space-y-4">
            {children}
          </div>

          {sources && sources.length > 0 && (
            <section className="mt-10 border-t border-gray-200 pt-6">
              <h2 className="text-sm font-semibold mb-3">参考資料</h2>
              <ul className="list-disc list-inside text-xs text-muted-foreground space-y-1 ml-2">
                {sources.map((s) => (
                  <li key={s.name}>
                    {s.url ? (
                      <a
                        href={s.url}
                        className="underline hover:text-foreground"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {s.name}
                      </a>
                    ) : (
                      s.name
                    )}
                    {s.note && <>（{s.note}）</>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {article.kanji.length > 0 && (
            <section className="mt-8 bg-gray-50 rounded-lg p-5">
              <h2 className="text-sm font-semibold mb-3">この記事で扱った漢字の書き順を見る</h2>
              <div className="flex flex-wrap gap-2">
                {article.kanji.map((k) => (
                  <Link
                    key={k}
                    href={`/kanji/${toUnicodeSlug(k)}`}
                    className="inline-flex items-center justify-center w-12 h-12 text-2xl bg-white border border-gray-200 rounded-lg hover:border-blue-400 hover:shadow-sm transition"
                  >
                    {k}
                  </Link>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                クリックすると1画ずつのアニメーションで書き順を確認できます。
                <Link href="/quiz" className="underline hover:text-foreground ml-1">
                  書き順クイズ
                </Link>
                で理解度もチェックできます。
              </p>
            </section>
          )}

          {relatedArticles.length > 0 && (
            <section className="mt-8 border-t border-gray-200 pt-6">
              <h2 className="text-sm font-semibold mb-3">関連記事</h2>
              <ul className="space-y-2">
                {relatedArticles.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/articles/${a.slug}`}
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>
      </div>
    </>
  );
}
