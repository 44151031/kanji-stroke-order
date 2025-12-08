import { siteMeta } from "@/lib/metadata";

export default function Footer() {
  return (
    <footer className="text-center text-xs text-muted-foreground py-8 px-4 sm:px-6 border-t border-border/50 mt-12">
      <div className="max-w-[1200px] mx-auto">
        <p className="mb-1">書き順データ：KanjiVG (CC BY-SA 3.0) | 意味データ：KANJIDIC2 (© EDRDG) | 語彙辞書：UniDic (MIT License)</p>
        <p>© 2024 {siteMeta.siteName}</p>
        <p className="mt-4 space-x-4">
          <a href="/operation" className="underline text-muted-foreground hover:text-foreground">
            運営管理
          </a>
          <a href="/terms" className="underline text-muted-foreground hover:text-foreground">
            利用規約
          </a>
        </p>
      </div>
    </footer>
  );
}




