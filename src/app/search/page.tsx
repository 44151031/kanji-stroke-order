import { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import SearchContent from "@/components/SearchContent";

export const metadata: Metadata = {
  title: "漢字検索｜漢字書き順",
  description: "漢字・読み・意味で検索。常用漢字2136字の書き順をアニメーションで学べます。",
};

function SearchLoading() {
  return (
    <div className="w-full max-w-md">
      <div className="h-12 bg-secondary rounded-md animate-pulse" />
    </div>
  );
}

export default function SearchPage() {
  return (
    <div className="flex flex-col items-center gap-8">
      <header className="text-center w-full">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          ← トップに戻る
        </Link>
        <h1 className="text-4xl font-bold mt-4 mb-2">漢字検索</h1>
        <p className="text-muted-foreground">漢字・読み・意味で検索</p>
      </header>

      <Suspense fallback={<SearchLoading />}>
        <SearchContent />
      </Suspense>
    </div>
  );
}
