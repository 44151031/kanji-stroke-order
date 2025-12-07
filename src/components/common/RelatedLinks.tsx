/**
 * 関連リンクセクション（Related Links）コンポーネント（高コントラスト・タグ型デザイン）
 *
 * 各ページで使用されている関連リンクセクションの構造を維持しつつ、
 * コントラストを高めた視認性の高いタグ風リッチデザインに改善。
 * 他のUI・構造には影響を与えない。
 */

import Link from "next/link";
import { cn } from "@/lib/utils";

export interface RelatedLink {
  label: string;
  href: string;
  emoji?: string;
  show?: boolean; // 条件付き表示用（デフォルト: true）
}

interface RelatedLinksProps {
  links: RelatedLink[];
  /**
   * コンテナのクラス名
   * デフォルト: "flex gap-3 md:gap-4 flex-wrap justify-center"
   */
  className?: string;
  /**
   * リンクのクラス名（上書き可能）
   * デフォルト: 高コントラスト・タグ型デザイン
   */
  linkClassName?: string;
}

export default function RelatedLinks({
  links,
  className = "flex gap-3 md:gap-4 flex-wrap justify-center",
  linkClassName,
}: RelatedLinksProps) {
  const visibleLinks = links.filter((link) => link.show !== false);
  if (visibleLinks.length === 0) return null;

  return (
    <div className={cn(className)} role="navigation" aria-label="関連リンク">
      {visibleLinks.map((link, index) => (
        <Link
          key={index}
          href={link.href}
          className={cn(
            // 🎨 高コントラストなタグデザイン
            "inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold",
            "rounded-full border border-primary/40",
            "bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground",
            "transition-colors duration-200 shadow-sm hover:shadow-md",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40",
            "active:scale-[0.98]",
            linkClassName
          )}
        >
          {link.emoji && <span className="text-base">{link.emoji}</span>}
          <span>{link.label}</span>
        </Link>
      ))}
    </div>
  );
}
