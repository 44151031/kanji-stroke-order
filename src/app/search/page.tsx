import { Suspense } from "react";
import { Metadata } from "next";
import SearchContent from "@/components/SearchContent";
import { generatePageMetadata } from "@/lib/metadata";
import Breadcrumb from "@/components/common/Breadcrumb";

export const metadata: Metadata = generatePageMetadata({
  path: "/search",
});

function SearchLoading() {
  return (
    <div className="w-full max-w-md">
      <div className="h-12 bg-secondary rounded-md animate-pulse" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="flex flex-col items-center gap-8 w-full max-w-4xl mx-auto">
      {/* パンくず */}
      <Breadcrumb
        items={[
          { label: "トップ", href: "/" },
          { label: "漢字検索" },
        ]}
      />

      <header className="text-center w-full">
        <h1 className="text-4xl font-bold mt-4 mb-2">漢字検索</h1>
        <p className="text-muted-foreground">漢字・読み・意味で検索</p>
      </header>

      <Suspense fallback={<SearchLoading />}>
        <SearchContent />
      </Suspense>
    </main>
  );
}
