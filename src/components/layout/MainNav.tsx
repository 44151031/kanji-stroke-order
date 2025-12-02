"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getKanjiLink } from "@/lib/linkUtils";

const navItems = [
  { href: "/", label: "ホーム", emoji: "🏠" },
  { href: "/exam-kanji", label: "入試頻出", emoji: "🎓" },
  { href: "/mistake-kanji", label: "間違えやすい", emoji: "⚠️" },
  { href: "/confused-kanji", label: "似ている漢字", emoji: "🔄" },
  { href: "/grade/1", label: "学年別", emoji: "📚" },
  { href: "/radical", label: "Radicals", emoji: "📘" },
  { href: "/ranking", label: "ランキング", emoji: "📊" },
  { href: "/search", label: "検索", emoji: "🔍" },
];

export default function MainNav() {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    const char = searchQuery.trim()[0];
    router.push(getKanjiLink(char));
    setSearchQuery("");
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-border/50 shadow-sm">
      <div className="max-w-[1200px] mx-auto px-4 h-14 flex items-center justify-between">
        {/* ロゴ */}
        <Link 
          href="/" 
          className="font-bold text-lg flex items-center gap-2 hover:opacity-80 transition-opacity"
        >
          <span className="text-2xl">✍️</span>
          <span>漢字書き順ナビ</span>
        </Link>

        {/* デスクトップナビ */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive(item.href)
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              <span className="mr-1">{item.emoji}</span>
              {item.label}
            </Link>
          ))}
        </nav>

        {/* 検索フォーム */}
        <form onSubmit={handleSearch} className="hidden sm:flex items-center">
          <input
            type="text"
            maxLength={1}
            placeholder="漢字1文字"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-20 text-center border border-border rounded-l-lg px-2 py-1.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
          <button
            type="submit"
            className="px-3 py-1.5 bg-primary text-primary-foreground rounded-r-lg text-sm hover:bg-primary/90 transition-colors"
          >
            検索
          </button>
        </form>

        {/* モバイルハンバーガー */}
        <button
          className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg hover:bg-secondary transition-colors"
          onClick={() => setIsOpen((prev) => !prev)}
          aria-label="メニューを開く"
          aria-expanded={isOpen}
        >
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {isOpen ? (
              <>
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </>
            ) : (
              <>
                <path d="M4 6h16" />
                <path d="M4 12h16" />
                <path d="M4 18h16" />
              </>
            )}
          </svg>
        </button>
      </div>

      {/* モバイルメニュー */}
      {isOpen && (
        <div className="md:hidden border-t border-border/50 bg-white animate-in slide-in-from-top-2 duration-200">
          <nav className="max-w-[1200px] mx-auto px-4 py-3 flex flex-col gap-1">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive(item.href)
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                }`}
                onClick={() => setIsOpen(false)}
              >
                <span className="text-xl">{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

