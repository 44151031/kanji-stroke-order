import { siteMeta } from "@/lib/metadata";
import Link from "next/link";

const FOOTER_SECTIONS: { heading: string; links: { label: string; href: string }[] }[] = [
  {
    heading: "漢字を探す",
    links: [
      { label: "学年別漢字一覧", href: "/grade/1" },
      { label: "画数別漢字一覧", href: "/strokes/1" },
      { label: "部首別漢字一覧", href: "/radical" },
      { label: "漢字検索", href: "/search" },
    ],
  },
  {
    heading: "漢字を学ぶ",
    links: [
      { label: "書き順クイズ", href: "/quiz" },
      { label: "似ている漢字", href: "/confused-kanji" },
      { label: "間違えやすい漢字", href: "/mistake-kanji" },
      { label: "入試頻出漢字", href: "/exam-kanji" },
      { label: "漢字の記事一覧", href: "/articles" },
    ],
  },
  {
    heading: "サイト情報",
    links: [
      { label: "漢字書き順ナビについて", href: "/operation#about" },
      { label: "運営者情報・編集方針", href: "/operation" },
      { label: "プライバシーポリシー", href: "/privacy" },
      { label: "利用規約・免責事項", href: "/terms" },
      { label: "お問い合わせ", href: "/operation#contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="text-xs text-muted-foreground py-10 px-4 sm:px-6 border-t border-border/50 mt-12">
      <div className="max-w-[1200px] mx-auto">
        <nav
          aria-label="フッターナビゲーション"
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-8 text-left max-w-[800px] mx-auto"
        >
          {FOOTER_SECTIONS.map((section) => (
            <div key={section.heading}>
              <p className="font-semibold text-foreground mb-3">{section.heading}</p>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-foreground hover:underline"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="text-center space-y-1 border-t border-border/50 pt-6">
          <p className="leading-relaxed">
            書き順データ：
            <a
              href="https://kanjivg.tagaini.net/"
              className="underline hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              KanjiVG
            </a>
            （© Ulrich Apel,{" "}
            <a
              href="https://creativecommons.org/licenses/by-sa/3.0/deed.ja"
              className="underline hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY-SA 3.0
            </a>
            ）｜意味データ：
            <a
              href="https://www.edrdg.org/wiki/index.php/KANJIDIC_Project"
              className="underline hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              KANJIDIC2
            </a>
            （© EDRDG,{" "}
            <a
              href="https://www.edrdg.org/edrdg/licence.html"
              className="underline hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              CC BY-SA 4.0
            </a>
            ）
          </p>
          <p className="leading-relaxed">
            かな筆順データ：
            <a
              href="https://github.com/parsimonhi/animCJK"
              className="underline hover:text-foreground"
              target="_blank"
              rel="noopener noreferrer"
            >
              animCJK
            </a>
            （LGPL）｜語彙辞書：UniDic（© 国立国語研究所 / The UniDic Consortium, BSD License）
          </p>
          <p className="pt-2">© 2024 {siteMeta.siteName}</p>
        </div>
      </div>
    </footer>
  );
}
