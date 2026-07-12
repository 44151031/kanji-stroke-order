import { siteMeta } from "@/lib/metadata";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="text-center text-xs text-muted-foreground py-8 px-4 sm:px-6 border-t border-border/50 mt-12">
      <div className="max-w-[1200px] mx-auto">
        <p className="mb-1">書き順データ：KanjiVG (CC BY-SA 3.0) | 意味データ：KANJIDIC2 (© EDRDG) | 語彙辞書：UniDic (MIT License)</p>
        <p>© 2024 {siteMeta.siteName}</p>
        <nav aria-label="フッターナビゲーション" className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2">
          <Link href="/grade/1" className="underline text-muted-foreground hover:text-foreground">
            学年別漢字
          </Link>
          <Link href="/exam-kanji" className="underline text-muted-foreground hover:text-foreground">
            入試頻出漢字
          </Link>
          <Link href="/confused-kanji" className="underline text-muted-foreground hover:text-foreground">
            似ている漢字
          </Link>
          <Link href="/articles/common-misorder-kanji" className="underline text-muted-foreground hover:text-foreground">
            間違えやすい書き順
          </Link>
          <Link href="/operation" className="underline text-muted-foreground hover:text-foreground">
            運営管理
          </Link>
          <Link href="/terms" className="underline text-muted-foreground hover:text-foreground">
            利用規約
          </Link>
        </nav>
      </div>
    </footer>
  );
}



