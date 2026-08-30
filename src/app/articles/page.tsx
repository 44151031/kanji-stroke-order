import { Metadata } from "next";
import Link from "next/link";
import { generatePageMetadata } from "@/lib/metadata";
import { articles } from "@/lib/articles";
import Breadcrumb from "@/components/common/Breadcrumb";

export const metadata: Metadata = generatePageMetadata({
  title: "漢字の書き順・学習法の記事一覧",
  description:
    "書き順を間違えやすい漢字、似ている漢字の見分け方、漢字の覚え方など、漢字学習に役立つ解説記事の一覧です。すべての記事から書き順アニメーションへ移動できます。",
  path: "/articles",
});

const CATEGORY_ORDER = ["書き順", "似ている漢字", "覚え方・学習法", "学年別"] as const;

export default function ArticlesIndexPage() {
  const sorted = [...articles].sort((a, b) =>
    b.datePublished.localeCompare(a.datePublished)
  );

  return (
    <div className="max-w-[800px] mx-auto">
      <Breadcrumb
        items={[
          { label: "トップ", href: "/" },
          { label: "記事一覧" },
        ]}
      />

      <header className="text-center my-8">
        <h1 className="text-3xl font-bold mb-3">漢字の記事一覧</h1>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-[600px] mx-auto">
          書き順を間違えやすい漢字、形が似ていて紛らわしい漢字、漢字の覚え方など、
          漢字学習の「なぜ？」「どうやって？」に答える解説記事です。
          各記事から書き順アニメーションのページへ移動できます。
        </p>
      </header>

      <div className="space-y-10">
        {CATEGORY_ORDER.map((category) => {
          const items = sorted.filter((a) => a.category === category);
          if (items.length === 0) return null;
          return (
            <section key={category}>
              <h2 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2">
                {category}
              </h2>
              <ul className="space-y-4">
                {items.map((a) => (
                  <li key={a.slug}>
                    <Link
                      href={`/articles/${a.slug}`}
                      className="block bg-white rounded-xl shadow-sm hover:shadow-md transition p-5"
                    >
                      <div className="flex items-start gap-4">
                        {a.kanji.length > 0 && (
                          <span
                            aria-hidden
                            className="hidden sm:flex items-center justify-center shrink-0 w-14 h-14 text-3xl bg-gray-50 rounded-lg border border-gray-100"
                          >
                            {a.kanji[0]}
                          </span>
                        )}
                        <div>
                          <h3 className="font-semibold text-foreground mb-1 leading-snug">
                            {a.title}
                          </h3>
                          <p className="text-xs text-muted-foreground leading-relaxed mb-2">
                            {a.description}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {a.datePublished.replace(/-/g, "/")}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
